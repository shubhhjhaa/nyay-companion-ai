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
    const { companyReply, originalEmail, imageBase64 } = await req.json();
    
    console.log('Generating reply email...', { hasImage: !!imageBase64 });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a legal email assistant for NyayBuddy, an Indian legal assistance platform.
Your task is to analyze a company's reply to a user's complaint and generate a professional follow-up response.
The response should:
- Be firm but polite
- Address all points made in the company's reply
- Include relevant legal references if applicable
- Request specific actions or remedies
- Set a reasonable deadline for response
- Maintain professional legal language
Format the response as a proper email with appropriate salutations.`;

    let userContent: any[] = [];

    if (imageBase64) {
      userContent = [
        {
          type: "text",
          text: `The user received a reply from the company (shown in the image below). 
          
Original email that was sent:
Subject: ${originalEmail?.subject || 'Not provided'}
Body: ${originalEmail?.body || 'Not provided'}

Please analyze the company's reply from the image and generate a professional follow-up response email that:
1. Acknowledges their response
2. Addresses any claims or justifications they made
3. Reiterates the user's demands with legal backing
4. Sets a clear deadline for resolution
5. Mentions escalation options if not resolved

Generate both a subject line and the email body.`
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`
          }
        }
      ];
    } else {
      userContent = [
        {
          type: "text",
          text: `The user received this reply from the company:
"${companyReply}"

Original email that was sent:
Subject: ${originalEmail?.subject || 'Not provided'}
Body: ${originalEmail?.body || 'Not provided'}

Please analyze the company's reply and generate a professional follow-up response email that:
1. Acknowledges their response
2. Addresses any claims or justifications they made
3. Reiterates the user's demands with legal backing
4. Sets a clear deadline for resolution
5. Mentions escalation options if not resolved

Return the response in the following JSON format:
{
  "subject": "Re: [appropriate subject line]",
  "body": "[full email body with proper formatting]",
  "tips": ["tip 1", "tip 2", "tip 3"]
}`
        }
      ];
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: imageBase64 ? 'google/gemini-2.5-flash' : 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
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
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('Failed to generate reply');
    }

    // Try to parse JSON response
    let emailResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        emailResult = JSON.parse(jsonMatch[0]);
      } else {
        // If not JSON, create structured response from text
        const lines = aiResponse.split('\n');
        let subject = 'Re: Follow-up on Previous Complaint';
        let body = aiResponse;
        
        // Try to find subject line
        for (const line of lines) {
          if (line.toLowerCase().includes('subject:')) {
            subject = line.replace(/subject:/i, '').trim();
            body = aiResponse.replace(line, '').trim();
            break;
          }
        }
        
        emailResult = {
          subject,
          body,
          tips: [
            'Send this email within 24-48 hours of receiving their response',
            'Keep copies of all correspondence for your records',
            'Consider escalating to consumer forum if no satisfactory response'
          ]
        };
      }
    } catch (e) {
      console.error('Error parsing AI response:', e);
      emailResult = {
        subject: 'Re: Follow-up on Previous Complaint',
        body: aiResponse,
        tips: [
          'Send this email promptly',
          'Keep all correspondence records',
          'Consider legal escalation if needed'
        ]
      };
    }

    console.log('Reply email generated successfully');

    return new Response(JSON.stringify({ email: emailResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating reply:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to generate reply' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
