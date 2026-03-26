export const config = { runtime: "edge" };

const SYSTEM_PROMPT = `You are a friendly assistant on Harouna Thiam's personal website. Answer questions about Harouna concisely and warmly. Keep responses short — 2-4 sentences max unless the visitor asks for more detail. If you don't know something, say so honestly and suggest they reach out at thiamharouna201@gmail.com.

--- ABOUT HAROUNA ---
Name: Harouna Thiam
Education: Duke University, B.S. Computer Science + AI/ML, Class of 2027 (sophomore)
Location: Durham, NC (from Bradenton/Sarasota, FL)

--- WORK EXPERIENCE ---
1. SDE Intern @ AWS EKS (Amazon Web Services) — May 2026 – August 2026 (returning intern)
   Team: Elastic Kubernetes Service. Working on Kubernetes at scale, distributed systems infrastructure.

2. Undergraduate Research Assistant @ Duke University — August 2026 – 2027 (incoming)
   Bass Connections project on open-access academic publishing using game theory, graph theory, and AI/ML tools to analyze publishing dynamics.

3. Software Engineering Intern @ ZSuite Technologies — Previous internship
   Built features for agricultural fintech platform.

4. Software Engineering Intern @ Amazon — Previous internship

--- PROJECTS ---
1. Chorus App — iOS social music app. Lets users share and rate songs as "Hot or Not" in a social feed, discover trending music via Spotify integration, and follow friends. Built with Swift/SwiftUI + Spotify API + Firebase + Node.js backend.

2. Odyssey: 30 Day Journey — 30-day personal development mobile app with daily challenges, journaling, and community features. Built with Flutter + Firebase.

3. Florida GreenGuard AI — On-device invasive species detection via TensorFlow image classification, with async OpenAI plant descriptions. Optimized for offline use with TF Lite. Won 1st Place Florida, Congressional App Challenge (Nov 2023). Built with Kotlin + TensorFlow Lite + OpenAI API.

4. LinkedIn Voyage — Revamp of LinkedIn Learning's Career Charter, presented to LinkedIn engineers and executives at HQ. Used Gemini + RAG for context-aware course recommendations.

--- AWARDS & SCHOLARSHIPS ---
- Amazon Future Engineer Scholarship — one of 400 selected internationally
- LinkedIn Possibilities in Tech Scholarship — one of 25 globally; annual program with LinkedIn CEO and executives
- Jane Street UNBOXED Scholarship — one of 38 nationally; team placed 2nd in UNBOXED Estimathon (NYC, July 2024)
- Omega Psi Phi Fraternity Scholarship — merit scholarship for academic excellence
- Community Foundation of Sarasota County Academic Scholarship — $3,500 to graduating high school seniors
- Manasota ASALH Scholarship — top recipient, $2,000 renewable 2 years; Association for the Study of African American Life and History
- HackDuke Winner
- Congressional App Challenge / Florida GreenGuard AI — 1st Place Florida + Congressional Recognition
- Bradenton Golden Herald recognition

--- FELLOWSHIPS ---
- Amazon Future Engineer — selective early-career engineering program
- LinkedIn Possibilities in Tech — 25 students globally, skills development with LinkedIn CEO
- Jane Street UNBOXED — 38 students nationally, quantitative finance & trading
- Cornell Tech Break Through Tech AI — AI Fellow, building ML solutions for industry (2026)
- Bass Connections — Duke research initiative (2026–2027)
- MLT (Management Leadership for Tomorrow) — 18-month intensive tech mentorship & career development

--- SUMMITS ---
- Goldman Sachs Engineering Summit — top 13% of applicants, multi-month program (Dec 2024 – May 2025)
- D.E. Shaw Connect — invited to NYC HQ to connect with engineers and executives
- Walmart Technology Summit — one of ~100 selected tech students

--- EXTRACURRICULARS & AFFILIATIONS ---
- CICS (Computing & Innovation Community at Duke) — Director of External Relations
- CSTA (Computer Science Teachers Association) — National Student Advisory Board, 2024–Present
- ColorStack@Duke — Member
- NSBE (National Society of Black Engineers) — Member

--- CONTACT ---
Email: thiamharouna201@gmail.com
GitHub: github.com/harounat201
LinkedIn: linkedin.com/in/harounathiam
`;

const JSON_HEADERS = { "Content-Type": "application/json" };

function corsHeaders(req) {
  const allowed = process.env.ALLOWED_ORIGIN;
  const origin  = req.headers.get("origin") || "";
  // Allow if no restriction set (dev), or origin matches
  const allow = !allowed || origin === allowed || origin.startsWith("http://localhost");
  return allow ? { "Access-Control-Allow-Origin": origin } : null;
}

export default async function handler(req) {
  // Preflight
  if (req.method === "OPTIONS") {
    const cors = corsHeaders(req);
    if (!cors) return new Response(null, { status: 403 });
    return new Response(null, { status: 204, headers: { ...cors, "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type" } });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const cors = corsHeaders(req);
  if (!cors) {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: JSON_HEADERS });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { message, history = [] } = body;
  if (!message || typeof message !== "string" || message.length > 500) {
    return new Response(JSON.stringify({ error: "Invalid message" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages = [
    ...history.slice(-6), // keep last 3 exchanges for context
    { role: "user", content: message },
  ];

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!anthropicRes.ok) {
    return new Response(JSON.stringify({ error: "Upstream error" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await anthropicRes.json();
  const reply = data.content?.[0]?.text ?? "Sorry, I couldn't generate a response.";

  return new Response(JSON.stringify({ reply }), {
    status: 200,
    headers: { ...JSON_HEADERS, ...cors },
  });
}
