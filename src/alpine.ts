import type { Alpine } from "alpinejs";
import { createCoverLetterStore } from "./stores/coverLetterStore";

export default function initAlpine(Alpine: Alpine) {
  Alpine.store("coverLetters", createCoverLetterStore());
}
