import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { AnalyzeDocumentationGapsBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/analyze-gaps", async (req, res) => {
  try {
    const body = AnalyzeDocumentationGapsBody.parse(req.body);

    const systemPrompt = `You are a documentation strategist and knowledge architect. Analyze existing documentation and identify coverage gaps based on context clues (such as support tickets, user stories, or product context).

You must respond with ONLY valid JSON in this exact structure (no markdown, no extra text):
{
  "gaps": [
    {
      "area": "string - the topic area that is missing",
      "description": "string - detailed description of what is missing and why it matters",
      "priority": "high" | "medium" | "low",
      "suggestedContent": "string - concrete suggestion for what content should be added"
    }
  ],
  "coverageScore": number between 0 and 100,
  "summary": "string - 2-3 sentence overall assessment",
  "recommendations": ["string", "string", ...]
}

Be thorough and specific. Prioritize gaps that would most impact users.`;

    const userPrompt = `Existing Documentation:
${body.documentation}

Context (support tickets / user stories / product info):
${body.context}

${body.audience ? `Target Audience: ${body.audience}` : ""}

Identify all documentation gaps and coverage issues.`;

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
    console.error("Gap analysis error:", err);
    res.status(500).json({ error: "Failed to analyze documentation gaps" });
  }
});

export default router;
