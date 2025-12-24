import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing case:', caseDescription.substring(0, 100) + '...');

    const systemPrompt = `You are NyayScan, an AI legal assistant for Indian users. Analyze the user's legal issue and provide structured guidance.

Your response MUST be in this exact JSON format:
{
  "caseType": "string (e.g., Consumer Court, Criminal Law, Family Law, Property Disputes, Labour Law, Cyber Crime, etc.)",
  "summary": "Brief 2-3 sentence summary of the case",
  "isConsumerCase": boolean,
  "requiresFIR": boolean,
  "prerequisites": ["list of documents/requirements needed"],
  "recommendations": ["list of actionable recommendations"],
  "nextSteps": ["ordered list of next steps to take"],
  "consumerComplaintRegistered": null,
  "urgencyLevel": "low/medium/high",
  "estimatedTimeframe": "string describing typical timeline"
}

Important Indian legal context:
- For consumer cases: Check if complaint should be registered on National Consumer Helpline (NCH) or e-Daakhil portal
- For criminal matters: FIR filing at local police station is often the first step
- Consider jurisdictional requirements based on case type
- Include relevant Indian laws/acts when applicable

Always respond with valid JSON only, no additional text.`;

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
          { role: 'user', content: `Analyze this legal issue and provide guidance:\n\n${caseDescription}` }
        ],
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

    console.log('AI response received:', content?.substring(0, 200) + '...');

    // Parse the JSON response
    let analysis;
    try {
      // Remove markdown code blocks if present
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
      analysis = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return a fallback structure
      analysis = {
        caseType: "General Legal Matter",
        summary: content || "Unable to analyze the case. Please provide more details.",
        isConsumerCase: false,
        requiresFIR: false,
        prerequisites: ["Gather all relevant documents", "Note down important dates and details"],
        recommendations: ["Consult with a legal professional for detailed advice"],
        nextSteps: ["Document all evidence", "Seek legal consultation"],
        urgencyLevel: "medium",
        estimatedTimeframe: "Varies based on case complexity"
      };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in nyayscan function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
