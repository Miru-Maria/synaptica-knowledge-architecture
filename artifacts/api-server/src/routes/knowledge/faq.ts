import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { BuildFaqBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/build-faq", async (req, res) => {
  try {
    const body = BuildFaqBody.parse(req.body);
    const maxItems = body.maxItems ?? 10;

    const systemPrompt = `You are a knowledge architect specializing in transforming flat documentation into intelligent, intent-based FAQ structures.

You must respond with ONLY valid JSON in this exact structure (no markdown, no extra text):
{
  "faqs": [
    {
      "question": "string - a natural language question users would ask",
      "answer": "string - a clear, concise answer based on the documentation",
      "category": "string - the topic category this belongs to",
      "tags": ["string", ...]
    }
  ],
  "categories": ["string", ...],
  "summary": "string - brief description of the FAQ structure created"
}

Create at most ${maxItems} FAQ items. Organize them by user intent, not by document structure. Write questions the way real users would ask them. Ensure answers are self-contained.`;

    const userPrompt = `Source Documentation:
${body.documentation}

${body.audience ? `Target Audience: ${body.audience}` : ""}

Convert this into a structured, intent-based FAQ.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);
    res.json(parsed);
  } catch (err) {
    console.error("FAQ build error:", err);
    res.status(500).json({ error: "Failed to build FAQ" });
  }
});

export default router;
