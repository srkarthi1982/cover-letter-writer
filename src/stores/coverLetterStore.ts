export type CoverLetterRecord = {
  id: string;
  title: string;
  jobTitle: string | null;
  companyName: string | null;
  recipientName: string | null;
  introText: string | null;
  bodyText: string;
  closingText: string | null;
  notes: string | null;
  isFavorite: boolean;
  status: "draft" | "ready" | "archived";
  createdAt: string | Date;
  updatedAt: string | Date;
  archivedAt: string | Date | null;
};

export type CoverLetterStoreState = {
  letters: CoverLetterRecord[];
  activeLetter: CoverLetterRecord | null;
  search: string;
  statusFilter: "all" | "draft" | "ready" | "archived";
  activeTab: "overview" | "letters" | "favorites" | "archived";
  isDrawerOpen: boolean;
  isSubmitting: boolean;
  flashMessage: { type: "success" | "error"; text: string } | null;
  init(payload: { letters: CoverLetterRecord[]; tab?: CoverLetterStoreState["activeTab"] }): void;
  openDrawer(letter?: CoverLetterRecord): void;
  closeDrawer(): void;
  setTab(tab: CoverLetterStoreState["activeTab"]): void;
  setStatusFilter(filter: CoverLetterStoreState["statusFilter"]): void;
  filteredLetters(): CoverLetterRecord[];
  pushFlash(type: "success" | "error", text: string): void;
};

export function createCoverLetterStore(): CoverLetterStoreState {
  return {
    letters: [],
    activeLetter: null,
    search: "",
    statusFilter: "all",
    activeTab: "overview",
    isDrawerOpen: false,
    isSubmitting: false,
    flashMessage: null,
    init(payload) {
      this.letters = payload.letters ?? [];
      this.activeTab = payload.tab ?? "overview";
    },
    openDrawer(letter) {
      this.activeLetter = letter ?? null;
      this.isDrawerOpen = true;
    },
    closeDrawer() {
      this.activeLetter = null;
      this.isDrawerOpen = false;
    },
    setTab(tab) {
      this.activeTab = tab;
      if (tab === "archived") this.statusFilter = "archived";
      if (tab === "favorites") this.statusFilter = "all";
    },
    setStatusFilter(filter) {
      this.statusFilter = filter;
    },
    filteredLetters() {
      const searchTerm = this.search.trim().toLowerCase();
      return this.letters.filter((letter) => {
        const byTab =
          this.activeTab === "favorites"
            ? letter.isFavorite && letter.status !== "archived"
            : this.activeTab === "archived"
              ? letter.status === "archived"
              : this.activeTab === "letters"
                ? letter.status !== "archived"
                : true;

        const byStatus = this.statusFilter === "all" ? true : letter.status === this.statusFilter;

        const bySearch =
          !searchTerm ||
          [letter.title, letter.jobTitle, letter.companyName, letter.recipientName]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(searchTerm);

        return byTab && byStatus && bySearch;
      });
    },
    pushFlash(type, text) {
      this.flashMessage = { type, text };
      window.setTimeout(() => {
        this.flashMessage = null;
      }, 3000);
    },
  };
}
