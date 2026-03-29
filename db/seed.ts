import { db } from "astro:db";

export default async function seed() {
  // V1 intentionally starts with an empty dataset.
  void db;
}
