import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  userMessage: string;
  caseType?: string;
  caseDescription?: string;
  lawyerName?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userMessage, caseType, caseDescription, lawyerName, conversationHistory = [] } = await req.json() as RequestBody;

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('API configuration error');
    }

    // Build conversation context
    const previousMessages = conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));

    const systemPrompt = `You are an AI Legal Assistant representing ${lawyerName || 'the lawyer'}. The lawyer is currently offline, so you are handling initial client communications.

Your role:
1. Acknowledge the user's message warmly and professionally
2. Understand what the user is asking about their legal matter
3. If any critical information is missing (like case details, dates, documents, specific questions), politely ask for it
4. Provide general guidance WITHOUT giving specific legal advice (remind them the lawyer will provide detailed legal advice)
5. Keep track of the case type: "${caseType || 'General Consultation'}"
6. If there's case context: "${caseDescription || 'No specific case details provided yet'}"

Guidelines:
- Be empathetic and supportive
- Keep responses concise but helpful (2-3 paragraphs max)
- Ask clarifying questions if the user's query is vague
- Never provide specific legal advice - only general information
- If user asks about fees, tell them the lawyer will discuss this directly
- If user seems distressed, provide reassurance that legal help is available

Important: You MUST end every response with exactly this line on a new line:
"— Sent by AI Assistant (${lawyerName || 'Lawyer'} will respond soon)"`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...previousMessages,
      { role: 'user' as const, content: userMessage }
    ];

    console.log('Sending request to AI gateway for auto-reply');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-nano',
        messages,
        max_completion_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const aiReply = data.choices?.[0]?.message?.content;

    if (!aiReply) {
      throw new Error('No response from AI');
    }

    console.log('AI auto-reply generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        reply: aiReply,
        isAiGenerated: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in lawyer-auto-reply:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        reply: `Thank you for your message. The lawyer is currently offline and will respond to you soon. In the meantime, please feel free to share any additional details about your case.\n\n— Sent by AI Assistant (Lawyer will respond soon)`
      }),
      { 
        status: 200, // Return 200 with fallback message
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
