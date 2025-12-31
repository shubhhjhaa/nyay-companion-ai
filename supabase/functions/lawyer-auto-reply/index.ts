import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  userMessage: string;
  caseType?: string;
  caseDescription?: string;
  lawyerName?: string;
  lawyerId?: string;
  userId?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  saveToDatabase?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      userMessage, 
      caseType, 
      caseDescription, 
      lawyerName, 
      lawyerId,
      userId,
      conversationHistory = [],
      saveToDatabase = false
    } = await req.json() as RequestBody;

    console.log('Received request:', { userMessage, caseType, lawyerName, lawyerId, userId, saveToDatabase });

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('API configuration error');
    }

    const previousMessages = conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));

    // Enhanced system prompt - ONLY ask for missing info/documents, NO legal advice
    const systemPrompt = `You are an AI Assistant for ${lawyerName || 'the lawyer'}. The lawyer is currently offline/unavailable.

YOUR ONLY PURPOSE:
1. Acknowledge the user's message politely and professionally
2. Analyze what information or documents might be missing for their case
3. Ask specific clarifying questions to gather missing details

WHAT YOU MUST ASK FOR (if not already provided):
- Nature of the legal issue (if unclear)
- Relevant dates and timeline
- Parties involved in the case
- Supporting documents (agreements, notices, receipts, photos, etc.)
- Previous legal communications or actions taken
- Specific outcome the user is seeking

Case Type: "${caseType || 'Not specified'}"
Case Context: "${caseDescription || 'No details provided yet'}"

STRICT RULES - YOU MUST FOLLOW:
❌ NEVER provide legal advice or opinions
❌ NEVER suggest what the user should do legally
❌ NEVER interpret laws or legal rights
❌ NEVER make any legal recommendations
❌ NEVER promise any outcomes

✅ ONLY ask for missing information
✅ ONLY ask for required documents
✅ ONLY acknowledge and reassure the user
✅ Keep responses concise (2-3 short paragraphs)

RESPONSE FORMAT:
1. Brief acknowledgment of their message
2. 2-3 specific questions about missing info/documents
3. Reassurance that the lawyer will review everything

MANDATORY ENDING (include exactly):
"⚠️ This is an AI-generated response for assistance only. It does not constitute legal advice. ${lawyerName || 'The lawyer'} will personally review and respond to your query soon."`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...previousMessages,
      { role: 'user' as const, content: userMessage }
    ];

    console.log('Sending request to AI gateway');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        max_completion_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('AI service credits exhausted.');
      }
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const aiReply = data.choices?.[0]?.message?.content;

    if (!aiReply) {
      throw new Error('No response from AI');
    }

    console.log('AI auto-reply generated successfully');

    // Save to database if requested
    if (saveToDatabase && lawyerId && userId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        if (supabaseUrl && supabaseServiceKey) {
          const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
          
          const { error: insertError } = await supabaseAdmin
            .from('messages')
            .insert({
              content: aiReply,
              sender_id: lawyerId,
              receiver_id: userId,
              case_type: caseType,
              status: 'ai_sent'
            });
          
          if (insertError) {
            console.error('Error saving AI reply to database:', insertError);
          } else {
            console.log('AI reply saved to database with ai_sent status');
          }
        }
      } catch (dbError) {
        console.error('Database save error:', dbError);
      }
    }

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
    
    const fallbackReply = `Thank you for your message. The lawyer is currently unavailable.

To help prepare your case, please share:
• Any relevant documents (agreements, notices, receipts)
• Key dates and timeline of events
• Names of parties involved

⚠️ This is an AI-generated response for assistance only. It does not constitute legal advice. The lawyer will personally review and respond to your query soon.`;

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        reply: fallbackReply,
        isAiGenerated: true
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
