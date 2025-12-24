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
    const { formData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating email for:', formData.caseType);

    const systemPrompt = `You are NyayMail, an AI email generator for Indian legal matters. Generate a professional, legally-structured email based on the provided information.

Generate a formal email with:
1. Professional subject line
2. Proper salutation
3. Clear statement of facts with dates
4. Legal grounds (mention relevant Indian laws if applicable)
5. Specific relief/action requested
6. Deadline for response (typically 15-30 days)
7. Professional closing

Your response MUST be in this exact JSON format:
{
  "subject": "Email subject line",
  "body": "Full email body with proper formatting and line breaks",
  "tips": ["List of tips for the user about what to do after sending"]
}

Important guidelines:
- Use formal English
- Include complaint/reference numbers if provided
- Mention Consumer Protection Act 2019 for consumer cases
- Reference National Consumer Helpline if relevant
- Be assertive but professional
- Include specific dates and amounts where applicable

Always respond with valid JSON only, no additional text.`;

    const userMessage = `Generate a legal email with the following details:
- Sender Name: ${formData.name}
- Phone: ${formData.phone}
- Case Type: ${formData.caseType}
- Problem Description: ${formData.problem}
- Opposite Party/Company: ${formData.oppositeParty}
- Date of Incident: ${formData.incidentDate}
- Consumer Complaint Registered: ${formData.consumerComplaintRegistered ? 'Yes' : 'No'}
- Complaint ID: ${formData.complaintId || 'Not applicable'}
- Amount Involved: ${formData.amount || 'Not specified'}
- Additional Details: ${formData.additionalDetails || 'None'}`;

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
          { role: 'user', content: userMessage }
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

    console.log('Email generated successfully');

    // Parse the JSON response
    let emailData;
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
      emailData = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      emailData = {
        subject: `Legal Complaint - ${formData.caseType}`,
        body: content || "Unable to generate email. Please try again.",
        tips: ["Review the email before sending", "Keep a copy for your records"]
      };
    }

    return new Response(JSON.stringify({ email: emailData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in nyaymail function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
