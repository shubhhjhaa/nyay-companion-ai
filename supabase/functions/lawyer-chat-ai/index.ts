import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  action: 'analyze_document' | 'smart_reply' | 'extract_info';
  documentName?: string;
  documentUrl?: string;
  messageContent?: string;
  caseType?: string;
  caseDescription?: string;
  conversationContext?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, documentName, documentUrl, messageContent, caseType, caseDescription, conversationContext } = await req.json() as RequestBody;
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'analyze_document':
        systemPrompt = `You are an AI legal assistant helping lawyers manage case documents. Your role is to:
1. Identify the type of document based on its name and context
2. Determine what legal category it falls under
3. Suggest what information might be extracted from it
4. Recommend if any additional documents are needed

Document categories you should recognize:
- Identity Documents: Aadhaar, PAN Card, Voter ID, Passport, Driving License
- Property Documents: Sale Deed, Title Deed, Encumbrance Certificate, Property Tax Receipt, NOC
- Financial Documents: Bank Statements, ITR, Salary Slips, Loan Documents
- Legal Documents: FIR Copy, Complaint Letter, Court Orders, Legal Notices, Affidavits
- Contracts: Rental Agreement, Employment Contract, Business Agreement, MOU
- Medical Documents: Medical Reports, Prescriptions, Hospital Bills
- Educational Documents: Certificates, Marksheets, Degree Certificates

Be concise and professional in your response. Format as JSON with fields:
- documentType: string
- category: string
- relevance: "high" | "medium" | "low"
- extractedInfo: string[] (potential key information)
- missingDocuments: string[] (recommended additional documents)
- aiNotes: string (brief analysis note)`;

        userPrompt = `Analyze this document for a ${caseType || 'legal'} case:
Document Name: ${documentName}
${documentUrl ? `Document URL: ${documentUrl}` : ''}
${caseDescription ? `Case Context: ${caseDescription}` : ''}

Provide analysis in JSON format.`;
        break;

      case 'smart_reply':
        systemPrompt = `You are an AI assistant helping a lawyer communicate with their client. Generate professional, empathetic, and legally appropriate responses.

Guidelines:
- Be professional and courteous
- Acknowledge the client's concerns
- Provide clear next steps when appropriate
- Never give specific legal advice - always recommend consultation
- Keep responses concise but thorough
- Use simple language that clients can understand

Context about the case:
Case Type: ${caseType || 'General Legal Matter'}
${caseDescription ? `Description: ${caseDescription}` : ''}

Generate 3 suggested reply options for the lawyer to choose from.`;

        userPrompt = `Client's message: "${messageContent}"

${conversationContext?.length ? `Recent conversation:\n${conversationContext.join('\n')}` : ''}

Provide 3 professional reply suggestions as a JSON array of strings.`;
        break;

      case 'extract_info':
        systemPrompt = `You are an AI assistant that extracts key information from client messages for case management.

Extract and identify:
- Key dates mentioned
- Names of parties involved
- Locations/addresses
- Monetary amounts
- Document references
- Action items or requests
- Urgency level

Format response as JSON with these fields.`;

        userPrompt = `Extract key information from this client message:
"${messageContent}"

Case Type: ${caseType || 'Unknown'}`;
        break;

      default:
        throw new Error('Invalid action specified');
    }

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    console.log(`Processing ${action} request`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || '';

    // Try to parse as JSON, fallback to raw content
    let result;
    try {
      // Clean up markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      result = JSON.parse(cleanContent);
    } catch {
      result = { rawResponse: content };
    }

    console.log(`${action} completed successfully`);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in lawyer-chat-ai:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
