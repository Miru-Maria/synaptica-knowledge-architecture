import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { db, promptTemplatesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreatePromptBody, TestPromptBody } from "@workspace/api-zod";

const router: IRouter = Router();

const BUILT_IN_PROMPTS = [
  {
    name: "Technical Procedure Writer",
    category: "Drafting",
    description: "Drafts step-by-step technical procedures from raw notes",
    template: "Write a clear, step-by-step technical procedure for the following task. Use numbered steps, include prerequisites, warnings, and expected outcomes.\n\nTask: {{task}}\n\nAdditional context: {{context}}",
    variables: ["task", "context"],
    isBuiltIn: true,
  },
  {
    name: "Audience-Specific Summarizer",
    category: "Summarization",
    description: "Summarizes technical content for a specific audience",
    template: "Summarize the following technical content for a {{audience}} audience. Adjust the technical depth, terminology, and focus accordingly. Highlight what matters most to this audience.\n\nContent:\n{{content}}",
    variables: ["audience", "content"],
    isBuiltIn: true,
  },
  {
    name: "Documentation Gap Prompter",
    category: "Analysis",
    description: "Identifies what information is missing from a document",
    template: "Review the following documentation and identify what critical information is missing. Consider the perspective of a {{role}} trying to {{goal}}.\n\nDocumentation:\n{{documentation}}\n\nList the gaps in order of importance.",
    variables: ["role", "goal", "documentation"],
    isBuiltIn: true,
  },
  {
    name: "Style Guide Checker",
    category: "Quality",
    description: "Checks content against a style guide and flags issues",
    template: "Review the following content against this style guide and flag any inconsistencies. Provide specific corrections for each issue found.\n\nStyle Guide Rules:\n{{styleGuide}}\n\nContent to Review:\n{{content}}",
    variables: ["styleGuide", "content"],
    isBuiltIn: true,
  },
  {
    name: "Onboarding Script Generator",
    category: "Onboarding",
    description: "Creates onboarding scripts for new team members",
    template: "Create an interactive onboarding guide for a new {{role}} joining the {{team}} team. The guide should cover: key processes, important tools, who to contact for what, and first-week priorities.\n\nTeam context: {{teamContext}}",
    variables: ["role", "team", "teamContext"],
    isBuiltIn: true,
  },
  {
    name: "FAQ Question Generator",
    category: "FAQ",
    description: "Generates FAQ questions from documentation",
    template: "Read the following documentation and generate the top {{count}} questions that {{audience}} would most likely ask. For each question, provide a concise answer.\n\nDocumentation:\n{{documentation}}",
    variables: ["count", "audience", "documentation"],
    isBuiltIn: true,
  },
  {
    name: "Release Notes Writer",
    category: "Drafting",
    description: "Converts technical changes into user-friendly release notes",
    template: "Convert the following technical changes into clear, user-friendly release notes. Group by feature area, use plain language, and focus on user impact.\n\nChanges:\n{{changes}}\n\nProduct version: {{version}}",
    variables: ["changes", "version"],
    isBuiltIn: true,
  },
  {
    name: "Knowledge Base Structurer",
    category: "Architecture",
    description: "Structures unorganized knowledge into a coherent taxonomy",
    template: "Analyze the following knowledge content and create a structured taxonomy with categories, subcategories, and suggested article titles. Optimize for discoverability by {{audience}}.\n\nContent:\n{{content}}",
    variables: ["audience", "content"],
    isBuiltIn: true,
  },
];

async function seedBuiltInPrompts() {
  const existing = await db.select().from(promptTemplatesTable).where(eq(promptTemplatesTable.isBuiltIn, true));
  if (existing.length === 0) {
    await db.insert(promptTemplatesTable).values(BUILT_IN_PROMPTS);
  }
}

seedBuiltInPrompts().catch(console.error);

router.get("/prompts", async (req, res) => {
  try {
    const category = req.query.category as string | undefined;
    let prompts;
    if (category) {
      prompts = await db.select().from(promptTemplatesTable).where(eq(promptTemplatesTable.category, category));
    } else {
      prompts = await db.select().from(promptTemplatesTable);
    }
    res.json(prompts);
  } catch (err) {
    console.error("List prompts error:", err);
    res.status(500).json({ error: "Failed to list prompts" });
  }
});

router.post("/prompts", async (req, res) => {
  try {
    const body = CreatePromptBody.parse(req.body);
    const [prompt] = await db.insert(promptTemplatesTable).values({
      ...body,
      isBuiltIn: false,
    }).returning();
    res.status(201).json(prompt);
  } catch (err) {
    console.error("Create prompt error:", err);
    res.status(500).json({ error: "Failed to create prompt" });
  }
});

router.delete("/prompts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [prompt] = await db.select().from(promptTemplatesTable).where(eq(promptTemplatesTable.id, id));
    if (!prompt) {
      res.status(404).json({ error: "Prompt not found" });
      return;
    }
    if (prompt.isBuiltIn) {
      res.status(403).json({ error: "Cannot delete built-in prompts" });
      return;
    }
    await db.delete(promptTemplatesTable).where(eq(promptTemplatesTable.id, id));
    res.status(204).send();
  } catch (err) {
    console.error("Delete prompt error:", err);
    res.status(500).json({ error: "Failed to delete prompt" });
  }
});

router.post("/prompts/test", async (req, res) => {
  try {
    const body = TestPromptBody.parse(req.body);
    let renderedPrompt = body.template;
    for (const [key, value] of Object.entries(body.variables)) {
      renderedPrompt = renderedPrompt.replaceAll(`{{${key}}}`, value);
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: [{ role: "user", content: renderedPrompt }],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Test prompt error:", err);
    res.write(`data: ${JSON.stringify({ error: "Failed to test prompt" })}\n\n`);
    res.end();
  }
});

export default router;
