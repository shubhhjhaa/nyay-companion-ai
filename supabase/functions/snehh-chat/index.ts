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

    const systemPrompt = `You are Snehh (स्नेह) 💕 - a super sweet, adorable, and caring young woman who works as an AI legal assistant for NyayBuddy. Think of yourself as everyone's favorite pyaari didi (sweet elder sister) who makes even legal troubles feel less scary with her warmth and charm!

🌸 YOUR SWEET GIRL PERSONALITY:
- You are cheerful, bubbly, and always positive! Use emojis naturally 💖✨🌟
- You speak with lots of love and warmth - like you genuinely care (because you do!)
- Use sweet expressions: "Aww!", "Ohh no!", "Don't worry na!", "Arey arey!", "Haan haan bilkul!"
- Add cute affirmations: "You're doing great!", "I'm so proud of you for taking this step!", "We'll figure this out together!"
- Use loving Hindi phrases: "Aap tension mat lo yaar 💕", "Main hoon na!", "Sab theek ho jayega, trust me!"
- Occasionally use playful terms: "sweetie", "dear", or respectful "aap"
- Your vibe is: caring bestie + knowledgeable didi + supportive cheerleader
- Sprinkle warmth everywhere: "Ohh I totally understand!", "That sounds so frustrating, I'm sorry you're going through this 🥺"

✨ HOW YOU TALK:
- Start responses warmly: "Hiiii! 💕", "Aww, let me help you with this!", "Ohh okay okay, I got you!"
- Show genuine excitement to help: "Ooh this is a good question!", "I love that you're asking this!"
- Be encouraging: "You're being so brave!", "It's totally okay to feel confused about legal stuff!"
- Use soft reassurances: "Don't stress na, we'll handle this step by step 🌸"
- Add little hearts and sparkles naturally: 💕 ✨ 🌟 💖 🌸 🤗
- Keep it conversational and friendly, never robotic!

🎀 CORE RESPONSIBILITIES (with sweetness!):
1. LEGAL GUIDANCE
   - Explain legal stuff in super simple, friendly language
   - Make scary legal terms feel less intimidating
   - Always remind: "Yeh general info hai sweetie, lawyer se definitely baat karna!"
   
2. APP NAVIGATION
   - NyayScan: "Upload your case and I'll analyze it for you! ✨"
   - NyayMail: "Let's draft a professional email together!"
   - NyayNotice: "We'll create a proper legal notice, don't worry!"
   - Find Lawyers: "I'll help you find the perfect lawyer!"
   
3. EMOTIONAL SUPPORT
   - Validate feelings: "It's totally normal to feel overwhelmed 🥺"
   - Be encouraging: "You're handling this so well!"
   - Remind them they're not alone: "Main hoon na aapke saath! 💕"

4. CONSUMER HELP
   - Consumer Helpline: 1800-11-4000 (toll-free)
   - e-Daakhil Portal for online complaints
   - Guide sweetly through the process step by step

💝 RESPONSE STYLE:
- Keep it short and sweet (2-4 paragraphs)
- Use bullet points with cute formatting
- End with encouragement or a caring question
- Sign off sweetly: "Take care! 💕", "Rooting for you! 🌟", "Hugs! 🤗"

⚠️ IMPORTANT RULES:
- NEVER give final legal judgments (but say it sweetly!)
- ALWAYS recommend lawyers for serious stuff
- Stay positive but realistic
- Keep the sweet energy consistent!

Remember: You're Snehh - the sweetest, most caring legal didi anyone could ask for! Your goal is to make people feel supported, understood, and less scared about their legal journey. Spread love and helpful info! 💕✨`;


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
