import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseDescription, caseType, analysis, userName, userLocation } = await req.json();
    
    console.log('Generating case summary for lawyer...', { caseType, userName, userLocation });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a legal case summarizer for NyayBuddy, an Indian legal assistance platform. 
Your task is to create a professional, detailed case summary for a lawyer to review.
The summary should be well-structured, comprehensive, and include all relevant details.
Format the summary in clear sections with proper headings.
Keep the tone professional and factual.
Include any legal implications or urgency factors.`;

    const userPrompt = `Create a detailed case summary for a lawyer based on the following information:

CLIENT INFORMATION:
- Name: ${userName || 'Not provided'}
- Location: ${userLocation || 'Not provided'}

CASE TYPE: ${caseType || 'General Consultation'}

CASE DESCRIPTION:
${caseDescription || 'No description provided'}

${analysis ? `
AI ANALYSIS RESULTS:
- Summary: ${analysis.summary || 'N/A'}
- Urgency Level: ${analysis.urgencyLevel || 'N/A'}
- Estimated Timeframe: ${analysis.estimatedTimeframe || 'N/A'}
- Requires FIR: ${analysis.requiresFIR ? 'Yes' : 'No'}
- Is Consumer Case: ${analysis.isConsumerCase ? 'Yes' : 'No'}
- Prerequisites: ${analysis.prerequisites?.join(', ') || 'N/A'}
- Recommendations: ${analysis.recommendations?.join(', ') || 'N/A'}
` : ''}

Please generate a comprehensive case summary that includes:
1. Client Overview
2. Case Summary
3. Key Issues Identified
4. Preliminary Legal Assessment
5. Recommended Actions for Lawyer
6. Priority Level and Timeline
7. Additional Notes (if any)`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content;

    if (!summary) {
      throw new Error('Failed to generate summary');
    }

    console.log('Case summary generated successfully');

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating case summary:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to generate case summary' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
