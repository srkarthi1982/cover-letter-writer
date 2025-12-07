import type { ActionAPIContext } from "astro:actions";
import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { db, eq, and, CoverLetters, CoverLetterTemplates } from "astro:db";

function requireUser(context: ActionAPIContext) {
  const locals = context.locals as App.Locals | undefined;
  const user = locals?.user;

  if (!user) {
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to perform this action.",
    });
  }

  return user;
}

export const server = {
  createCoverLetter: defineAction({
    input: z.object({
      id: z.string().optional(),
      title: z.string().min(1, "Title is required"),
      jobTitle: z.string().min(1, "Job title is required"),
      companyName: z.string().optional(),
      jobDescription: z.string().optional(),
      tone: z.string().optional(),
      language: z.string().optional(),
      content: z.string().min(1, "Content is required"),
      status: z.string().optional(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);

      const [coverLetter] = await db
        .insert(CoverLetters)
        .values({
          id: input.id ?? crypto.randomUUID(),
          userId: user.id,
          title: input.title,
          jobTitle: input.jobTitle,
          companyName: input.companyName,
          jobDescription: input.jobDescription,
          tone: input.tone,
          language: input.language,
          content: input.content,
          status: input.status,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return { coverLetter };
    },
  }),

  updateCoverLetter: defineAction({
    input: z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      jobTitle: z.string().optional(),
      companyName: z.string().optional(),
      jobDescription: z.string().optional(),
      tone: z.string().optional(),
      language: z.string().optional(),
      content: z.string().optional(),
      status: z.string().optional(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);
      const { id, ...rest } = input;

      const [existing] = await db
        .select()
        .from(CoverLetters)
        .where(and(eq(CoverLetters.id, id), eq(CoverLetters.userId, user.id)))
        .limit(1);

      if (!existing) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Cover letter not found.",
        });
      }

      const updateData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(rest)) {
        if (typeof value !== "undefined") {
          updateData[key] = value;
        }
      }

      if (Object.keys(updateData).length === 0) {
        return { coverLetter: existing };
      }

      const [coverLetter] = await db
        .update(CoverLetters)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(and(eq(CoverLetters.id, id), eq(CoverLetters.userId, user.id)))
        .returning();

      return { coverLetter };
    },
  }),

  listCoverLetters: defineAction({
    input: z.object({}).optional(),
    handler: async (_, context) => {
      const user = requireUser(context);

      const coverLetters = await db
        .select()
        .from(CoverLetters)
        .where(eq(CoverLetters.userId, user.id));

      return { coverLetters };
    },
  }),

  deleteCoverLetter: defineAction({
    input: z.object({
      id: z.string(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);

      const [deleted] = await db
        .delete(CoverLetters)
        .where(and(eq(CoverLetters.id, input.id), eq(CoverLetters.userId, user.id)))
        .returning();

      if (!deleted) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Cover letter not found.",
        });
      }

      return { coverLetter: deleted };
    },
  }),

  createTemplate: defineAction({
    input: z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Name is required"),
      description: z.string().optional(),
      tone: z.string().optional(),
      language: z.string().optional(),
      body: z.string().min(1, "Template body is required"),
      isSystem: z.boolean().optional(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);

      const [template] = await db
        .insert(CoverLetterTemplates)
        .values({
          id: input.id ?? crypto.randomUUID(),
          userId: input.isSystem ? null : user.id,
          name: input.name,
          description: input.description,
          tone: input.tone,
          language: input.language,
          body: input.body,
          isSystem: input.isSystem ?? false,
          createdAt: new Date(),
        })
        .returning();

      return { template };
    },
  }),

  updateTemplate: defineAction({
    input: z.object({
      id: z.string(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      tone: z.string().optional(),
      language: z.string().optional(),
      body: z.string().optional(),
      isSystem: z.boolean().optional(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);
      const { id, ...rest } = input;

      const [existing] = await db
        .select()
        .from(CoverLetterTemplates)
        .where(eq(CoverLetterTemplates.id, id))
        .limit(1);

      if (!existing || (existing.userId && existing.userId !== user.id)) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Template not found or not accessible.",
        });
      }

      const updateData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(rest)) {
        if (typeof value !== "undefined") {
          updateData[key] = value;
        }
      }

      if (Object.keys(updateData).length === 0) {
        return { template: existing };
      }

      const [template] = await db
        .update(CoverLetterTemplates)
        .set(updateData)
        .where(eq(CoverLetterTemplates.id, id))
        .returning();

      return { template };
    },
  }),

  listTemplates: defineAction({
    input: z.object({}).optional(),
    handler: async (_, context) => {
      const user = requireUser(context);

      const templates = await db.select().from(CoverLetterTemplates);

      const filtered = templates.filter((t) => t.userId === null || t.userId === user.id);

      return { templates: filtered };
    },
  }),
};
