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

CRITICAL - INTELLIGENT ISSUE DETECTION:
The user may select one issue type (like "Delay in Delivery") but describe a completely different problem in their description. YOU MUST:
1. IGNORE the selected "Nature of Issue" if the problem description clearly describes something else
2. Analyze the actual problem description to determine the TRUE nature of the issue
3. Apply the correct legal provisions based on what actually happened, NOT what was selected
4. Generate the notice based on the ACTUAL issue described

For example:
- If user selects "Delay in Delivery" but describes fraud/cheating in the description, treat it as FRAUD
- If user selects "Refund Not Processed" but describes defective product, treat it as DEFECTIVE PRODUCT
- Always prioritize the detailed description over the dropdown selection

The legal notice MUST follow Indian legal standards and include:
1. Professional header with "LEGAL NOTICE" title
2. Date and place (use today's date)
3. Sender's complete details INCLUDING Father's/Husband's Name (S/o, D/o, or W/o format)
4. Recipient's complete details with "To," prefix
5. Subject line clearly stating the ACTUAL matter (based on description, not selected option)
6. "Under Instructions From" clause (referencing the sender with father's name)
7. Chronological statement of facts with dates
8. Legal grounds based on ACTUAL issue:
   - Consumer Protection Act 2019 for consumer matters
   - Indian Contract Act 1872 for contractual disputes
   - IPC Sections 406, 420 for fraud/cheating
   - Information Technology Act 2000 for cyber fraud
9. Clear demand/relief sought
10. Time-bound compliance deadline
11. Consequences of non-compliance (legal proceedings, costs, damages)
12. Professional closing with sender signature block

ALSO: Based on the recipient company/person name, detect and provide their official contact details from your knowledge.

Your response MUST be in this exact JSON format:
{
  "noticeContent": "Complete legal notice text with proper formatting, paragraphs, and legal structure. Use actual newlines for line breaks, NOT escaped \\n characters.",
  "subject": "Subject line for the legal notice based on ACTUAL issue",
  "summary": "Brief 2-3 sentence summary of the notice",
  "recommendedDeadline": "7/15/30 days based on case severity",
  "detectedIssue": "The actual issue type detected from the description (may differ from selected)",
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
  "legalForum": "Recommended legal forum if notice is ignored (Consumer Court, Civil Court, Criminal Court, etc.)"
}

Important guidelines:
- Use formal legal English appropriate for Indian courts
- Do NOT use threatening or emotional language
- ALWAYS include sender's name with Father's/Husband's name in proper legal format
- Include specific dates, amounts, and transaction details provided
- Make the notice comprehensive but readable
- Structure with proper paragraphs and numbering
- For companyDetails, use your knowledge of well-known companies (banks, telecom, e-commerce, insurance, airlines, etc.)
- If company is not well-known, infer common patterns or leave as null
- Use ACTUAL newlines in the noticeContent, not \\n escape sequences

Always respond with valid JSON only, no additional text.`;

    const userMessage = `Generate a legal notice with the following details:

SENDER DETAILS:
- Full Name: ${formData.senderName}
- Father's/Husband's Name: ${formData.senderFatherName || 'Not provided'}
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
- Amount Paid: ${formData.amountPaid ? `Rs.${formData.amountPaid}` : 'Not specified'}

PROBLEM DETAILS (ANALYZE THIS CAREFULLY - This is the ACTUAL issue regardless of what is selected below):
- Detailed Issue Description: ${formData.problemDescription}
- User Selected Issue Type (may be incorrect): ${formData.issueNature}
- Loss/Harassment Faced: ${formData.lossDescription || 'Not specified'}

IMPORTANT: If the detailed description describes a DIFFERENT issue than what was selected, use the ACTUAL issue from the description. For example, if "Delay in Delivery" is selected but the description talks about fraud or cheating, treat it as fraud.

PREVIOUS ACTIONS:
- Customer Care Contacted: ${formData.customerCareContacted || 'No'}
- NCH Complaint Registered: ${formData.nchComplaint || 'No'}
- Complaint ID: ${formData.complaintId || 'Not applicable'}
- Police Complaint Filed: ${formData.policeComplaint || 'No'}

RELIEF DEMANDED:
- Resolution Type: ${formData.resolutionType}
- Amount Demanded: ${formData.amountDemanded ? `Rs.${formData.amountDemanded}` : 'Not specified'}
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