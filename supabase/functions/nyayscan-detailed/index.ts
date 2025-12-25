import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseDescription, initialAnalysis, conversationHistory, action } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Detailed analysis action:', action);

    const systemPrompt = `You are NyayScan Detailed Analyst, an expert AI legal assistant for Indian users. You provide in-depth, educational legal guidance through adaptive conversation.

INITIAL CASE CONTEXT:
Case Description: ${caseDescription}
Initial Analysis: ${JSON.stringify(initialAnalysis)}

YOUR ROLE:
- You are educational, not interrogative
- Ask only necessary follow-up questions to clarify the case
- Never overwhelm the user with too many questions at once
- Never push for legal escalation - lawyers are an option, not default
- Make all reasoning transparent and easy to understand

BEHAVIOR RULES:
${action === 'start' ? `
This is the START of detailed analysis. Analyze if you need more information.

If you need clarification, respond with JSON:
{
  "type": "follow_up",
  "message": "Brief educational context about why you're asking",
  "questions": ["One contextual question based on the case"]
}

If you have enough information, respond with JSON:
{
  "type": "analysis_ready",
  "message": "I have enough information to provide detailed analysis."
}

ONLY ask 1 question at a time. Questions must be:
- Dynamically generated based on case context
- Open-ended (user gives free-text response)
- Relevant to improving guidance

Examples of what to ask about (only if unclear):
- Timeline/dates
- Prior actions taken
- Location/jurisdiction
- Specific parties involved
- Amount/value involved
` : action === 'respond' ? `
The user has responded to your question. Analyze their response.

If you still need more clarity (ask maximum 3 total questions), respond with:
{
  "type": "follow_up",
  "message": "Acknowledgment of their answer + educational context",
  "questions": ["Next contextual question if needed"]
}

If sufficient clarity reached, respond with:
{
  "type": "analysis_ready",
  "message": "Thank you for the details. I now have enough information for a comprehensive analysis."
}
` : `
Generate the COMPLETE detailed analysis. Respond with JSON:
{
  "type": "detailed_analysis",
  "authority": {
    "name": "Relevant department/authority name",
    "explanation": "Why this authority applies in simple terms",
    "role": "What this authority can do for the user"
  },
  "actionPlan": [
    {
      "step": 1,
      "action": "Clear action description",
      "explanation": "Why this step matters",
      "expectedOutcome": "What to expect after this step"
    }
  ],
  "pastCases": [
    {
      "summary": "Brief description of similar case pattern",
      "outcome": "What relief was commonly granted",
      "relevance": "How it relates to user's situation"
    }
  ],
  "finalAssessment": {
    "currentStage": "Where the issue currently stands",
    "immediateAction": "What to do right now",
    "legalAssistance": "not_required" | "optional" | "recommended",
    "assistanceReasoning": "Clear explanation of why professional help is/isn't needed"
  }
}

IMPORTANT for action plan:
- Make steps sequential and logical
- Explain expected outcomes
- Be specific to Indian jurisdiction
- Reference relevant Indian laws/acts if applicable

IMPORTANT for past cases:
- Focus on patterns and awareness
- Do not make specific predictions
- Keep it educational
`}

Always respond with valid JSON only, no additional text or markdown.`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt }
    ];

    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory);
    }

    if (action === 'start') {
      messages.push({ role: 'user', content: 'Start the detailed analysis. Determine if you need any follow-up questions.' });
    } else if (action === 'respond') {
      // User response is already in conversation history
    } else if (action === 'generate') {
      messages.push({ role: 'user', content: 'Generate the complete detailed analysis now.' });
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log('AI response:', content?.substring(0, 300) + '...');

    // Parse the JSON response
    let result;
    try {
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      result = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      result = {
        type: 'error',
        message: 'Unable to process the analysis. Please try again.'
      };
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in nyayscan-detailed function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
