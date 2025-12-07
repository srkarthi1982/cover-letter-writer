import { defineTable, column, NOW } from "astro:db";

export const CoverLetters = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(),
    title: column.text(),
    jobTitle: column.text(),
    companyName: column.text({ optional: true }),
    jobDescription: column.text({ optional: true }),
    tone: column.text({ optional: true }),
    language: column.text({ optional: true }),
    content: column.text(),
    status: column.text({ optional: true }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

export const CoverLetterTemplates = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ optional: true }), // null → system template
    name: column.text(),
    description: column.text({ optional: true }),
    tone: column.text({ optional: true }),
    language: column.text({ optional: true }),
    body: column.text(),
    isSystem: column.boolean({ default: false }),
    createdAt: column.date({ default: NOW }),
  },
});

export const tables = {
  CoverLetters,
  CoverLetterTemplates,
} as const;
