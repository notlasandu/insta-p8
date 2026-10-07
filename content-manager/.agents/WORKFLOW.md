## The Content Generation Workflow

This document outlines the workflow for creating new Instagram content for Berl View.

### Phase 1: Ideation (Content Agent)
1. Read `src/content-agent-guidelines.md` and follow the instructions.
2. The user provides a brief or idea and specifies the account.
3. The Content Agent creates a new folder `src/routes/a/[account_name]/content/[post-id]/` (Only for accounts that have opted into content generation).
4. The Content Agent creates `concept.md` detailing the core idea, caption, and visual ideas.
5. The Content Agent creates a structured `data.json` based on `src/lib/types/slide.ts` schemas, mapping the content to known slide layout patterns.
6. The Content Agent updates `src/lib/data/accounts/[account_name]/posts.json` to register the new post.

### Phase 2: Design and Assembly (IDE Agent)
1. The IDE Agent creates `src/routes/a/[account_name]/content/[post-id]/+page.svelte`.
2. The page imports the `data.json` and uses the `<SlideRenderer>` component to render the appropriate named slide layout components based on the `layout` property of each slide.
3. The page is wrapped in `<FigmaExportWrapper>` (if not handled globally) to allow 1:1 scale preview and export.
4. The IDE Agent never hardcodes text; it all flows from `data.json`.
5. The agent verifies the horizontal scroll logic works.

### Phase 3: Review and Export
1. Run `npm run dev`.
2. Review the generated post in the browser.
3. Click "Figma Export Mode" to view at 1:1 scale and copy/paste into Figma, or use a screenshot tool to capture the slides.
4. Post to Instagram.
5. Update status in `posts.json` to "POSTED".
