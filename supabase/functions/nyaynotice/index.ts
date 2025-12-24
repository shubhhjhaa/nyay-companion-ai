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

    console.log('Generating legal notice for:', formData.recipientName);

    const systemPrompt = `You are NyayNotice, an AI legal notice generator specialized in Indian law. Generate a professional, legally compliant legal notice based on the provided information.

The legal notice MUST follow Indian legal standards and include:
1. Professional header with "LEGAL NOTICE" title
2. Date and place
3. Sender's complete details
4. Recipient's complete details with "To," prefix
5. Subject line clearly stating the matter
6. "Under Instructions From" clause (referencing the sender)
7. Chronological statement of facts with dates
8. Legal grounds (mention relevant consumer protection laws, contract laws as applicable)
9. Clear demand/relief sought
10. Time-bound compliance deadline
11. Consequences of non-compliance (legal proceedings, costs, damages)
12. Professional closing with sender signature block

ALSO: Based on the recipient company/person name, detect and provide their official contact details from your knowledge.

Your response MUST be in this exact JSON format:
{
  "noticeContent": "Complete legal notice text with proper formatting, paragraphs, and legal structure. Use \\n for line breaks.",
  "subject": "Subject line for the legal notice",
  "summary": "Brief 2-3 sentence summary of the notice",
  "recommendedDeadline": "7/15/30 days based on case severity",
  "nextSteps": [
    "Step-by-step guidance on what to do after generating notice"
  ],
  "sendingInstructions": [
    "Instructions on how to send the legal notice (Speed Post, Email, etc.)"
  ],
  "companyDetails": {
    "email": "Official customer grievance/legal email if known, or null",
    "phone": "Customer support helpline number if known, or null",
    "website": "Official company website if known, or null",
    "address": "Registered office address if known, or null",
    "confidence": "high/medium/low"
  },
  "legalForum": "Recommended legal forum if notice is ignored (Consumer Court, Civil Court, etc.)"
}

Important guidelines:
- Use formal legal English appropriate for Indian courts
- Do NOT use threatening or emotional language
- Reference Consumer Protection Act 2019 for consumer matters
- Reference Indian Contract Act 1872 for contractual disputes
- Include specific dates, amounts, and transaction details provided
- Make the notice comprehensive but readable
- Structure with proper paragraphs and numbering
- For companyDetails, use your knowledge of well-known companies (banks, telecom, e-commerce, insurance, airlines, etc.)
- If company is not well-known, infer common patterns or leave as null

Always respond with valid JSON only, no additional text.`;

    const userMessage = `Generate a legal notice with the following details:

SENDER DETAILS:
- Full Name: ${formData.senderName}
- Address: ${formData.senderAddress}
- City: ${formData.senderCity}, ${formData.senderState} - ${formData.senderPincode}
- Mobile: ${formData.senderMobile}
- Email: ${formData.senderEmail}

RECIPIENT DETAILS:
- Name/Company: ${formData.recipientName}
- Registered Office: ${formData.recipientAddress || 'Not provided'}
- Branch Address: ${formData.branchAddress || 'Not applicable'}

RELATIONSHIP/TRANSACTION:
- Relationship Type: ${formData.relationshipType}
- Date of Purchase/Agreement: ${formData.transactionDate || 'Not specified'}
- Invoice/Order ID: ${formData.orderId || 'Not provided'}
- Amount Paid: ${formData.amountPaid ? `₹${formData.amountPaid}` : 'Not specified'}

PROBLEM DETAILS:
- Issue Description: ${formData.problemDescription}
- Nature of Issue: ${formData.issueNature}
- Loss/Harassment Faced: ${formData.lossDescription || 'Not specified'}

PREVIOUS ACTIONS:
- Customer Care Contacted: ${formData.customerCareContacted || 'No'}
- NCH Complaint Registered: ${formData.nchComplaint || 'No'}
- Complaint ID: ${formData.complaintId || 'Not applicable'}
- Police Complaint Filed: ${formData.policeComplaint || 'No'}

RELIEF DEMANDED:
- Resolution Type: ${formData.resolutionType}
- Amount Demanded: ${formData.amountDemanded ? `₹${formData.amountDemanded}` : 'Not specified'}
- Other Relief: ${formData.otherRelief || 'Not specified'}

RESPONSE TIME: ${formData.responseTime || '15'} days`;

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

    console.log('Legal notice generated successfully');

    // Parse the JSON response
    let noticeData;
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
      noticeData = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      noticeData = {
        noticeContent: content || "Unable to generate legal notice. Please try again.",
        subject: `Legal Notice - ${formData.issueNature}`,
        summary: "Legal notice generated for your review.",
        recommendedDeadline: "15",
        nextSteps: ["Review the notice carefully", "Send via Speed Post"],
        sendingInstructions: ["Send via Registered Post/Speed Post", "Keep postal receipt as proof"],
        companyDetails: null,
        legalForum: "Consumer Court / Civil Court"
      };
    }

    return new Response(JSON.stringify({ notice: noticeData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in nyaynotice function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});