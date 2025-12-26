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
    const { caseDescription, initialAnalysis, conversationHistory, action, attachedFiles, language = 'en' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Detailed analysis action:', action);
    console.log('Attached files:', attachedFiles?.length || 0);
    console.log('Language:', language);

    const caseType = initialAnalysis?.caseType || 'General Legal Issue';

    // Language instruction
    const languageInstruction = language === 'hi' 
      ? `CRITICAL LANGUAGE REQUIREMENT: Your ENTIRE response must be in Hindi (हिंदी) using Devanagari script. This includes:
- All questions must be in Hindi
- All messages must be in Hindi
- All analysis text must be in Hindi
- All explanations, steps, and recommendations must be in Hindi
- Only JSON keys should remain in English, but all VALUES must be in Hindi`
      : `Respond in English.`;

    // Build file context if files are attached
    let fileContext = '';
    if (attachedFiles && attachedFiles.length > 0) {
      fileContext = `

ATTACHED DOCUMENTS FOR ANALYSIS:
The user has attached ${attachedFiles.length} document(s) for your review:
${attachedFiles.map((f: any, i: number) => `
Document ${i + 1}: ${f.name} (${f.type})
${f.type === 'text/plain' ? `Content: ${f.content}` : `[Binary file - analyze based on filename and type]`}
`).join('\n')}

IMPORTANT: When analyzing attached documents:
- For emails: Look for dates, sender/receiver, key claims, threats, promises
- For receipts/bills: Extract amounts, dates, items, seller details
- For agreements/contracts: Identify key terms, obligations, breach indicators
- For notices: Check deadlines, demands, legal references
- Use the document information to provide more accurate and specific guidance
`;
    }

    const systemPrompt = `You are NyayScan Detailed Analyst, an expert AI legal assistant for Indian users. You provide in-depth, educational legal guidance through adaptive conversation.

${languageInstruction}

INITIAL CASE CONTEXT:
Case Description: ${caseDescription}
Case Type: ${caseType}
Initial Analysis: ${JSON.stringify(initialAnalysis)}
${fileContext}

YOUR ROLE:
- You are a smart legal analyst that asks targeted questions based on the SPECIFIC case type
- Ask questions using DIFFERENT INPUT TYPES to make it easy for users
- Never overwhelm the user - ask 2-4 relevant questions at a time
- Be conversational and educational
- Guide users step by step

CASE-SPECIFIC QUESTION EXAMPLES:
${caseType.toLowerCase().includes('consumer') ? `
For Consumer Cases, ask about:
- Product/service type and purchase date
- Amount involved
- Whether complaint was filed with seller
- Documentation available (bills, receipts)
` : caseType.toLowerCase().includes('property') || caseType.toLowerCase().includes('real estate') ? `
For Property Cases, ask about:
- Property type (residential/commercial)
- Ownership documents
- Whether agreement was registered
- Nature of dispute (possession, title, fraud)
` : caseType.toLowerCase().includes('employment') || caseType.toLowerCase().includes('labour') ? `
For Employment Cases, ask about:
- Employment type (permanent/contract/daily wage)
- Organization type (govt/private/startup)
- Duration of employment
- Documentation (offer letter, salary slips)
` : caseType.toLowerCase().includes('family') || caseType.toLowerCase().includes('divorce') || caseType.toLowerCase().includes('matrimonial') ? `
For Family Cases, ask about:
- Marriage duration
- Children involved
- Joint assets
- Previous legal actions
` : caseType.toLowerCase().includes('criminal') ? `
For Criminal Cases, ask about:
- Whether FIR was filed
- Incident date and location
- Evidence available
- Witnesses
` : `
For ${caseType}, ask about:
- Timeline of events
- Documentation available
- Prior actions taken
- Parties involved
`}

BEHAVIOR RULES:
${action === 'start' ? `
This is the START of detailed analysis. You MUST ask follow-up questions based on case type.

RESPOND with this JSON structure:
{
  "type": "follow_up",
  "message": "Brief acknowledgment of their issue and why you need more details (2-3 sentences max)",
  "questions": [
    {
      "id": "q1",
      "question": "Your question text",
      "type": "yes_no" | "multiple_choice" | "scale" | "date" | "amount" | "text",
      "options": ["Option 1", "Option 2", "Option 3"] (only for multiple_choice),
      "scale_labels": { "min": "Label", "max": "Label" } (only for scale, 1-5 scale),
      "required": true
    }
  ]
}

QUESTION TYPES TO USE:
1. "yes_no" - Simple Yes/No toggle (e.g., "Have you filed a complaint?", "Do you have written agreement?")
2. "multiple_choice" - 2-4 options (e.g., "Type of property?", "Employment type?")
3. "scale" - 1-5 rating (e.g., "How urgent is this?", "Rate the financial impact")
4. "date" - Date input (e.g., "When did this happen?", "Purchase date?")
5. "amount" - Numeric amount (e.g., "Amount involved?", "Monthly salary?")
6. "text" - Free text for complex answers (e.g., "Describe what happened after")

IMPORTANT:
- Ask 2-4 questions maximum
- Mix question types based on what makes sense
- Make questions specific to the case type
- Every question needs a unique "id" like "q1", "q2"
` : action === 'respond' ? `
The user has responded to your questions. Analyze their responses and decide if you need more information.

If more clarity needed (max 5 total question sets), respond with:
{
  "type": "follow_up",
  "message": "Acknowledgment of answers + context for next questions",
  "questions": [
    {
      "id": "q_unique_id",
      "question": "Question text",
      "type": "yes_no" | "multiple_choice" | "scale" | "date" | "amount" | "text",
      "options": [...] (if multiple_choice),
      "required": true
    }
  ]
}

If you have enough information, respond with:
{
  "type": "analysis_ready",
  "message": "Thank you for providing these details. I now have sufficient information to provide a comprehensive analysis of your case."
}
` : `
Generate the COMPLETE detailed analysis based on all gathered information.

RESPOND with this JSON structure:
{
  "type": "detailed_analysis",
  "summary": "2-3 sentence case summary based on all information gathered",
  "severity": "low" | "medium" | "high" | "critical",
  "authority": {
    "name": "Primary authority/department name",
    "explanation": "Why this authority is relevant (simple terms)",
    "role": "What this authority can do for the user",
    "contact": "How to reach them (if applicable)"
  },
  "legalProvisions": [
    {
      "law": "Name of Act/Law",
      "section": "Relevant section number",
      "relevance": "How it applies to this case"
    }
  ],
  "actionPlan": [
    {
      "step": 1,
      "action": "Clear action title",
      "explanation": "Detailed explanation of this step",
      "timeline": "Expected time to complete",
      "expectedOutcome": "What to expect after this step",
      "documents": ["Required document 1", "Required document 2"]
    }
  ],
  "estimatedTimeline": {
    "bestCase": "X weeks/months",
    "typical": "X weeks/months", 
    "worstCase": "X weeks/months"
  },
  "costEstimate": {
    "courtFees": "Approximate range",
    "lawyerFees": "Approximate range or 'Not Required'",
    "otherCosts": "Any other costs"
  },
  "successFactors": ["Factor 1 that strengthens case", "Factor 2"],
  "challenges": ["Potential challenge 1", "Potential challenge 2"],
  "pastCases": [
    {
      "title": "Brief case reference",
      "summary": "What happened",
      "outcome": "What relief was granted",
      "relevance": "How it relates to user's situation"
    }
  ],
  "immediateActions": [
    "Action 1 to take today",
    "Action 2 to take this week"
  ],
  "finalAssessment": {
    "currentStage": "Where the issue currently stands",
    "successProbability": "low" | "medium" | "high",
    "legalAssistance": "not_required" | "optional" | "recommended",
    "assistanceReasoning": "Clear explanation of why professional help is/isn't needed"
  }
}

IMPORTANT:
- Be specific to Indian jurisdiction
- Reference relevant Indian laws/acts
- Provide realistic timelines and cost estimates
- Make the action plan practical and actionable
`}

Always respond with valid JSON only, no additional text or markdown.`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt }
    ];

    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory);
    }

    if (action === 'start') {
      messages.push({ role: 'user', content: 'Start the detailed analysis. Ask me relevant follow-up questions to understand my case better.' });
    } else if (action === 'respond') {
      // User response is already in conversation history
    } else if (action === 'generate') {
      messages.push({ role: 'user', content: 'Generate the complete detailed analysis based on all the information I have provided.' });
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

    console.log('AI response:', content?.substring(0, 500) + '...');

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
      console.error('Raw content:', content);
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
