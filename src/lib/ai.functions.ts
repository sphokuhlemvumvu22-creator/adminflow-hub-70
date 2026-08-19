import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const EmailInput = z.object({
  purpose: z.string().min(1),
  recipient: z.string().default(""),
  tone: z.string().default("Professional"),
  keyPoints: z.string().default(""),
  sender: z.string().default(""),
});

const MinutesInput = z.object({
  title: z.string().default("Meeting"),
  attendees: z.string().default(""),
  notes: z.string().min(1),
});

const PlanInput = z.object({
  goal: z.string().min(1),
  team: z.string().default(""),
  deadline: z.string().default(""),
  today: z.string().default(""),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const { streamText } = await import("ai");
    const { gatewayModel } = await import("./ai-gateway.server");
    const result = streamText({
      model: gatewayModel(),
      system:
        "You are an experienced South African office administrator. Write clear, courteous, professional workplace emails in British/South African English. Return only the email: a 'Subject: ...' line, then the body. No commentary, no markdown fences.",
      prompt: `Purpose: ${data.purpose}\nRecipient: ${data.recipient || "colleague"}\nTone: ${data.tone}\nKey points to include: ${data.keyPoints || "none supplied"}\nSign off as: ${data.sender || "the administrator"}`,
    });
    return { text: await result.text };
  });

export const summarizeMinutes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => MinutesInput.parse(input))
  .handler(async ({ data }) => {
    const { streamText } = await import("ai");
    const { gatewayModel } = await import("./ai-gateway.server");
    const result = streamText({
      model: gatewayModel(),
      system:
        "You summarise workplace meeting notes into formal minutes. Output plain text with these sections exactly: SUMMARY, KEY DECISIONS, ACTION ITEMS (each as 'owner — task — due'), FOLLOW-UPS. Be concise and factual; never invent facts that are not in the notes.",
      prompt: `Meeting: ${data.title}\nAttendees: ${data.attendees || "not listed"}\nRaw notes:\n${data.notes}`,
    });
    return { text: await result.text };
  });

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlanInput.parse(input))
  .handler(async ({ data }) => {
    const { streamText, Output, NoObjectGeneratedError } = await import("ai");
    const { gatewayModel } = await import("./ai-gateway.server");
    const schema = z.object({
      tasks: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          assignee: z.string(),
          department: z.string(),
          dueDate: z.string(),
          priority: z.string(),
        }),
      ),
    });
    try {
      const result = streamText({
        model: gatewayModel(),
        output: Output.object({ schema }),
        system:
          "You are a workplace planning assistant. Break a goal into 3-8 concrete admin tasks, spread sensibly between today and the deadline. dueDate must be yyyy-mm-dd. priority must be one of Low, Medium, High, Urgent. Assign each task to one of the named team members when supplied.",
        prompt: `Today: ${data.today}\nGoal: ${data.goal}\nTeam available: ${data.team || "the administrator"}\nDeadline: ${data.deadline || "two weeks from today"}`,
      });
      return await result.output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error) && error.text) {
        const match = error.text.match(/\{[\s\S]*\}/);
        if (match) return schema.parse(JSON.parse(match[0]));
      }
      throw error;
    }
  });
