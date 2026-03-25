import { db, eq, and, desc, CoverLetters } from "astro:db";
import { ActionError } from "astro:actions";
import { pushDashboardSummary, sendHighSignalNotification } from "./integrations";

export type CoverLetterStatus = "draft" | "ready" | "archived";

export type CoverLetterInput = {
  title: string;
  jobTitle?: string | null;
  companyName?: string | null;
  recipientName?: string | null;
  introText?: string | null;
  bodyText: string;
  closingText?: string | null;
  notes?: string | null;
  status?: CoverLetterStatus;
};

function asOptional(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

async function loadOwnedLetter(userId: string, id: string) {
  const [letter] = await db
    .select()
    .from(CoverLetters)
    .where(and(eq(CoverLetters.userId, userId), eq(CoverLetters.id, id)))
    .limit(1);

  if (!letter) {
    throw new ActionError({ code: "NOT_FOUND", message: "Cover letter not found." });
  }

  return letter;
}

export async function listCoverLettersForUser(userId: string) {
  const letters = await db
    .select()
    .from(CoverLetters)
    .where(eq(CoverLetters.userId, userId))
    .orderBy(desc(CoverLetters.updatedAt));

  return letters;
}

export async function getCoverLetterDetailForUser(userId: string, id: string) {
  return loadOwnedLetter(userId, id);
}

async function publishDashboardForUser(userId: string) {
  const letters = await listCoverLettersForUser(userId);
  const readyLetters = letters.filter((letter) => letter.status === "ready").length;
  const favoriteLetters = letters.filter((letter) => letter.isFavorite).length;

  await pushDashboardSummary({
    appId: "cover-letter-writer",
    userId,
    summary: {
      totalLetters: letters.length,
      readyLetters,
      favoriteLetters,
      mostRecentlyUpdatedTitle: letters[0]?.title ?? null,
    },
  });
}

export async function createCoverLetterForUser(userId: string, input: CoverLetterInput) {
  const status = input.status === "ready" ? "ready" : "draft";

  const [created] = await db
    .insert(CoverLetters)
    .values({
      id: crypto.randomUUID(),
      userId,
      title: input.title.trim(),
      jobTitle: asOptional(input.jobTitle),
      companyName: asOptional(input.companyName),
      recipientName: asOptional(input.recipientName),
      introText: asOptional(input.introText),
      bodyText: input.bodyText.trim(),
      closingText: asOptional(input.closingText),
      notes: asOptional(input.notes),
      status,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      archivedAt: null,
    })
    .returning();

  const allLetters = await listCoverLettersForUser(userId);
  if (allLetters.length === 1) {
    await sendHighSignalNotification({
      appId: "cover-letter-writer",
      userId,
      type: "first-letter",
      title: "First cover letter created",
      message: `You created your first cover letter: ${created.title}`,
    });
  }

  if (created.status === "ready") {
    await sendHighSignalNotification({
      appId: "cover-letter-writer",
      userId,
      type: "first-ready",
      title: "First letter marked ready",
      message: `${created.title} is ready to send.`,
    });
  }

  await publishDashboardForUser(userId);
  return created;
}

export async function updateCoverLetterForUser(userId: string, id: string, input: Partial<CoverLetterInput>) {
  const existing = await loadOwnedLetter(userId, id);

  const nextStatus = input.status ?? (existing.status as CoverLetterStatus);
  const safeStatus: CoverLetterStatus = nextStatus === "archived" ? "archived" : nextStatus === "ready" ? "ready" : "draft";

  const [updated] = await db
    .update(CoverLetters)
    .set({
      title: typeof input.title === "string" ? input.title.trim() : existing.title,
      jobTitle: typeof input.jobTitle !== "undefined" ? asOptional(input.jobTitle) : existing.jobTitle,
      companyName: typeof input.companyName !== "undefined" ? asOptional(input.companyName) : existing.companyName,
      recipientName: typeof input.recipientName !== "undefined" ? asOptional(input.recipientName) : existing.recipientName,
      introText: typeof input.introText !== "undefined" ? asOptional(input.introText) : existing.introText,
      bodyText: typeof input.bodyText === "string" ? input.bodyText.trim() : existing.bodyText,
      closingText: typeof input.closingText !== "undefined" ? asOptional(input.closingText) : existing.closingText,
      notes: typeof input.notes !== "undefined" ? asOptional(input.notes) : existing.notes,
      status: safeStatus,
      updatedAt: new Date(),
      archivedAt: safeStatus === "archived" ? new Date() : null,
    })
    .where(and(eq(CoverLetters.userId, userId), eq(CoverLetters.id, id)))
    .returning();

  if (existing.status !== "ready" && updated.status === "ready") {
    const letters = await listCoverLettersForUser(userId);
    const readyLettersCount = letters.filter((letter) => letter.status === "ready").length;
    if (readyLettersCount === 1) {
      await sendHighSignalNotification({
        appId: "cover-letter-writer",
        userId,
        type: "first-ready",
        title: "First letter marked ready",
        message: `${updated.title} is now ready.`,
      });
    }
  }

  await publishDashboardForUser(userId);
  return updated;
}

export async function archiveCoverLetterForUser(userId: string, id: string) {
  const letter = await loadOwnedLetter(userId, id);

  const [archived] = await db
    .update(CoverLetters)
    .set({
      status: "archived",
      archivedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(and(eq(CoverLetters.userId, userId), eq(CoverLetters.id, id)))
    .returning();

  await publishDashboardForUser(userId);
  return archived ?? letter;
}

export async function restoreCoverLetterForUser(userId: string, id: string) {
  await loadOwnedLetter(userId, id);

  const [restored] = await db
    .update(CoverLetters)
    .set({
      status: "draft",
      archivedAt: null,
      updatedAt: new Date(),
    })
    .where(and(eq(CoverLetters.userId, userId), eq(CoverLetters.id, id)))
    .returning();

  await publishDashboardForUser(userId);
  return restored;
}

export async function toggleCoverLetterFavoriteForUser(userId: string, id: string) {
  const letter = await loadOwnedLetter(userId, id);

  const [updated] = await db
    .update(CoverLetters)
    .set({
      isFavorite: !letter.isFavorite,
      updatedAt: new Date(),
    })
    .where(and(eq(CoverLetters.userId, userId), eq(CoverLetters.id, id)))
    .returning();

  if (updated && !letter.isFavorite && updated.isFavorite) {
    const letters = await listCoverLettersForUser(userId);
    const favoriteCount = letters.filter((item) => item.isFavorite).length;
    if (favoriteCount === 1) {
      await sendHighSignalNotification({
        appId: "cover-letter-writer",
        userId,
        type: "first-favorite",
        title: "First favorite saved",
        message: `${updated.title} was marked as a favorite.`,
      });
    }
  }

  await publishDashboardForUser(userId);
  return updated;
}

export async function markCoverLetterReadyForUser(userId: string, id: string) {
  return updateCoverLetterForUser(userId, id, { status: "ready" });
}
