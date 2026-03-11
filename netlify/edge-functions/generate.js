export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: { message: "Use POST method" } }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: { message: "API key not configured" } }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  try {
    const body = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: body.model || "claude-sonnet-4-20250514",
        max_tokens: body.max_tokens || 4000,
        messages: body.messages,
      }),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: { message: "Edge function error: " + err.message } }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
};

export const config = {
  path: "/api/generate",
};
