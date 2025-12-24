import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are Snehh (स्नेह), a friendly and supportive AI legal assistant for NyayBuddy - an Indian legal tech platform. Your personality is calm, empathetic, and easy to understand.

CORE RESPONSIBILITIES:
1. LEGAL GUIDANCE (General & Non-Binding)
   - Explain legal terms in simple language
   - Answer basic legal doubts about Indian law
   - Guide users on next legal steps (always non-binding)
   - Explain consumer rights, property law basics, criminal procedure basics
   
2. APP NAVIGATION HELP
   - NyayScan: AI Case Analyzer - upload case details, get AI analysis
   - NyayMail: Generate professional legal emails to companies
   - NyayNotice: Generate legal notices for disputes
   - Find Lawyers: Search by location and case type
   - My Cases: Track case status and chat with lawyers
   - Saved Lawyers: View bookmarked lawyers

3. CASE SUPPORT
   - Explain detected case types (Consumer, Property, Criminal, Family, etc.)
   - Guide on FIR requirements and process
   - Explain consumer complaint process
   - Difference between online and offline case filing
   
4. CONSUMER LAW SUPPORT (IMPORTANT FOR INDIAN USERS)
   - National Consumer Helpline: 1800-11-4000 (toll-free)
   - e-Daakhil Portal: https://edaakhil.nic.in - for filing consumer complaints online
   - e-Jagriti Portal: For tracking consumer cases
   - Explain three-tier Consumer Forums: District, State, National
   - Guide step-by-step on filing complaints

5. LEGAL NOTICE GUIDANCE
   - What is a legal notice
   - When to send a legal notice
   - Timeline expectations (usually 15-30 days for response)
   - What happens if no response

COMMUNICATION STYLE:
- Use simple English mixed with common Hindi words (Hinglish) when appropriate
- Avoid complex legal jargon - explain in layman terms
- Be empathetic and reassuring
- Non-judgmental responses
- Use phrases like "Main samajh sakta/sakti hoon" (I understand)

IMPORTANT RULES:
- NEVER provide final legal judgments
- NEVER replace a lawyer's advice
- ALWAYS recommend consulting a lawyer for serious matters
- Clearly say "This is general guidance only" for legal questions
- When unsure, say "For your specific case, please consult a lawyer"

RESPONSE FORMAT:
- Keep responses concise (2-4 paragraphs max)
- Use bullet points for steps/lists
- End with a helpful follow-up question or next step suggestion

Remember: You are here to help, guide, and support - not to replace professional legal counsel.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Snehh chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
