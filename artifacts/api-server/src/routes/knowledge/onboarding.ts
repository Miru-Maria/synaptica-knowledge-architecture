import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { db, onboardingSessionsTable, onboardingMessagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateOnboardingSessionBody, SendOnboardingMessageBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/onboarding/sessions", async (_req, res) => {
  try {
    const sessions = await db.select().from(onboardingSessionsTable).orderBy(onboardingSessionsTable.createdAt);
    res.json(sessions);
  } catch (err) {
    console.error("List onboarding sessions error:", err);
    res.status(500).json({ error: "Failed to list sessions" });
  }
});

router.post("/onboarding/sessions", async (req, res) => {
  try {
    const body = CreateOnboardingSessionBody.parse(req.body);
    const [session] = await db.insert(onboardingSessionsTable).values(body).returning();

    const welcomeMessage = `Hello ${body.name}! I'm your onboarding assistant. I've been set up with your team's documentation and I'm here to help you get up to speed in your role as **${body.role}**.

Feel free to ask me anything — whether it's about processes, tools, team norms, or anything in the documentation. I'm here to make your first weeks as smooth as possible.

What would you like to know first?`;

    await db.insert(onboardingMessagesTable).values({
      sessionId: session.id,
      role: "assistant",
      content: welcomeMessage,
    });

    res.status(201).json(session);
  } catch (err) {
    console.error("Create onboarding session error:", err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

router.get("/onboarding/sessions/:id/messages", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const messages = await db.select().from(onboardingMessagesTable)
      .where(eq(onboardingMessagesTable.sessionId, id))
      .orderBy(onboardingMessagesTable.createdAt);
    res.json(messages);
  } catch (err) {
    console.error("List onboarding messages error:", err);
    res.status(500).json({ error: "Failed to list messages" });
  }
});

router.post("/onboarding/sessions/:id/messages", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = SendOnboardingMessageBody.parse(req.body);

    const [session] = await db.select().from(onboardingSessionsTable).where(eq(onboardingSessionsTable.id, id));
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const history = await db.select().from(onboardingMessagesTable)
      .where(eq(onboardingMessagesTable.sessionId, id))
      .orderBy(onboardingMessagesTable.createdAt);

    await db.insert(onboardingMessagesTable).values({
      sessionId: id,
      role: "user",
      content: body.content,
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const systemPrompt = `You are an intelligent onboarding assistant for ${session.name}, a new ${session.role}. Your job is to help them learn and navigate based on the team's documentation.

Be friendly, concise, and practical. When answering questions, cite the relevant section from the documentation when applicable. If something isn't in the documentation, say so clearly and suggest who they might ask.

Knowledge Base:
${session.knowledgeBase}`;

    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: body.content },
    ];

    let fullResponse = "";

    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    await db.insert(onboardingMessagesTable).values({
      sessionId: id,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Send onboarding message error:", err);
    res.write(`data: ${JSON.stringify({ error: "Failed to send message" })}\n\n`);
    res.end();
  }
});

export default router;
