import { defineTable, column, NOW } from "astro:db";

export const CoverLetters = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(),
    title: column.text(),
    jobTitle: column.text({ optional: true }),
    companyName: column.text({ optional: true }),
    recipientName: column.text({ optional: true }),
    introText: column.text({ optional: true }),
    bodyText: column.text(),
    closingText: column.text({ optional: true }),
    notes: column.text({ optional: true }),
    isFavorite: column.boolean({ default: false }),
    status: column.text({ default: "draft" }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
    archivedAt: column.date({ optional: true }),
  },
  indexes: [
    { on: ["userId"] },
    { on: ["userId", "status"] },
    { on: ["userId", "isFavorite"] },
    { on: ["userId", "companyName"] },
    { on: ["userId", "jobTitle"] },
    { on: ["userId", "updatedAt"] },
  ],
});

export const tables = {
  CoverLetters,
} as const;
