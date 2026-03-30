# App Spec: cover-letter-writer

## 1) App Overview
- **App Name:** Cover Letter Writer
- **Category:** Career / Writing
- **Version:** V1
- **App Type:** DB-backed
- **Purpose:** Provide an authenticated manual drafting workspace for personal cover letters with favorite and archive controls.
- **Primary User:** A signed-in user managing their own cover letter drafts.

## 2) User Stories
- As a user, I want to create a cover letter draft, so that I can store application-specific drafts.
- As a user, I want to favorite and archive drafts, so that I can separate active and important letters from older ones.
- As a user, I want to open a detail view and edit a draft, so that I can refine it over time.

## 3) Core Workflow
1. User signs in and opens `/app`.
2. User creates a cover letter draft from the workspace.
3. App saves the draft in the user-scoped database and lists it in the workspace.
4. User opens `/app/letters/:id` to edit, favorite, archive, or restore the letter.
5. User returns to the workspace to search and review active or archived letters.

## 4) Functional Behavior
- Cover letter records are stored per authenticated user in the app database.
- The app supports create, update, favorite, archive, restore, detail viewing, and search; delete is not part of V1.
- `/app` is protected and redirects to the parent login flow when unauthenticated.
- Invalid, missing, or non-owned detail routes redirect safely back to `/app` instead of returning `500`.

## 5) Data & Storage
- **Storage type:** Astro DB on the app’s isolated Turso database
- **Main entities:** Cover letters
- **Persistence expectations:** User-owned drafts persist across refresh and new sessions.
- **User model:** Multi-user shared infrastructure with per-user isolation

## 6) Special Logic (Optional)
- This is a manual drafting workspace, not an AI generation flow in the current implementation.
- Favorite state is first-class and separate from active vs archived status.

## 7) Edge Cases & Error Handling
- Invalid IDs/routes: Invalid detail routes redirect back to `/app`.
- Empty input: Invalid create or update payloads should be rejected without creating broken records.
- Unauthorized access: `/app` redirects to the parent login flow.
- Missing records: Missing or non-owned letters redirect safely back to the workspace.
- Invalid payload/state: Action errors return safe feedback instead of crashing the page.

## 8) Tester Verification Guide
### Core flow tests
- [ ] Create a cover letter, open the detail page, update it, and confirm the changes persist.
- [ ] Favorite the letter, archive it, restore it, and confirm the state changes are reflected in the workspace.

### Safety tests
- [ ] Search for the created letter after refresh and confirm the result persists.
- [ ] Visit an invalid detail route and confirm the app falls back safely to `/app`.
- [ ] Attempt direct detail access as another user and confirm the app does not expose the record.

### Negative tests
- [ ] Confirm there is no AI generation or automatic rewrite flow in V1.
- [ ] Confirm the app does not return `500` on missing or invalid detail routes.

## 9) Out of Scope (V1)
- AI-generated cover letter creation
- Hard delete of stored drafts
- Public sharing or collaborative editing

## 10) Freeze Notes
- V1 release freeze: this document reflects the verified authenticated manual drafting workflow.
- Freeze Level 1 verification confirmed create, detail open, update, favorite, archive/restore, search after refresh, invalid-route safety, and cross-user protection.
- During freeze, only verification fixes and cleanup are allowed; no undocumented feature expansion.
