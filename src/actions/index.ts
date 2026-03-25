import type { ActionAPIContext } from "astro:actions";
import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import {
  archiveCoverLetterForUser,
  createCoverLetterForUser,
  getCoverLetterDetailForUser,
  listCoverLettersForUser,
  markCoverLetterReadyForUser,
  restoreCoverLetterForUser,
  toggleCoverLetterFavoriteForUser,
  updateCoverLetterForUser,
} from "../lib/coverLetters";

function requireUser(context: ActionAPIContext) {
  const user = (context.locals as App.Locals | undefined)?.user;
  if (!user) {
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to perform this action.",
    });
  }

  return user;
}

const inputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  jobTitle: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  recipientName: z.string().optional().nullable(),
  introText: z.string().optional().nullable(),
  bodyText: z.string().min(1, "Main letter body is required"),
  closingText: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["draft", "ready", "archived"]).optional(),
});

export const server = {
  createCoverLetter: defineAction({
    input: inputSchema,
    handler: async (input, context) => {
      const user = requireUser(context);
      return { coverLetter: await createCoverLetterForUser(user.id, input) };
    },
  }),

  updateCoverLetter: defineAction({
    input: inputSchema.partial().extend({ id: z.string() }),
    handler: async ({ id, ...input }, context) => {
      const user = requireUser(context);
      return { coverLetter: await updateCoverLetterForUser(user.id, id, input) };
    },
  }),

  archiveCoverLetter: defineAction({
    input: z.object({ id: z.string() }),
    handler: async ({ id }, context) => {
      const user = requireUser(context);
      return { coverLetter: await archiveCoverLetterForUser(user.id, id) };
    },
  }),

  restoreCoverLetter: defineAction({
    input: z.object({ id: z.string() }),
    handler: async ({ id }, context) => {
      const user = requireUser(context);
      return { coverLetter: await restoreCoverLetterForUser(user.id, id) };
    },
  }),

  toggleCoverLetterFavorite: defineAction({
    input: z.object({ id: z.string() }),
    handler: async ({ id }, context) => {
      const user = requireUser(context);
      return { coverLetter: await toggleCoverLetterFavoriteForUser(user.id, id) };
    },
  }),

  markCoverLetterReady: defineAction({
    input: z.object({ id: z.string() }),
    handler: async ({ id }, context) => {
      const user = requireUser(context);
      return { coverLetter: await markCoverLetterReadyForUser(user.id, id) };
    },
  }),

  listCoverLetters: defineAction({
    handler: async (_, context) => {
      const user = requireUser(context);
      return { coverLetters: await listCoverLettersForUser(user.id) };
    },
  }),

  getCoverLetterDetail: defineAction({
    input: z.object({ id: z.string() }),
    handler: async ({ id }, context) => {
      const user = requireUser(context);
      return { coverLetter: await getCoverLetterDetailForUser(user.id, id) };
    },
  }),
};
