import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { KnowledgeSearchBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/search", async (req, res) => {
  try {
    const body = KnowledgeSearchBody.parse(req.body);
    const topK = body.topK ?? 5;

    const systemPrompt = `You are a knowledge retrieval assistant. Your task is to search through provided documentation and return the most relevant results for a user query.

You must respond with ONLY valid JSON in this exact structure (no markdown, no extra text):
{
  "results": [
    {
      "title": "string - a descriptive title for this result",
      "excerpt": "string - the most relevant passage from the documents",
      "relevanceScore": number between 0.0 and 1.0,
      "explanation": "string - why this is relevant to the query"
    }
  ],
  "summary": "string - a 2-3 sentence summary answering the query based on the documents"
}

Return at most ${topK} results, ordered by relevance. Only include results that are genuinely relevant (score > 0.3).`;

    const userPrompt = `Query: ${body.query}

Knowledge Base:
${body.documents}`;

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
    console.error("Knowledge search error:", err);
    res.status(500).json({ error: "Failed to perform knowledge search" });
  }
});

export default router;
