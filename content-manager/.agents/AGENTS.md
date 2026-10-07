## 0. Dual-Agent Scenarios
Depending on the user's request, you will act as either a **Content Agent** or an **IDE Agent**.

### Scenario A: Acting as a Content Agent
When the user asks you to generate a new social media post or carousel for a specific account:
- You must read `src/content-agent-guidelines.md` and strictly follow its workflow.
- First, ideate and create a `concept.md` inside a new `src/routes/a/[account_name]/content/[post-id]/` directory (note: content generation is an optional feature per account).
- Once ready to design, generate a new `data.json` file inside `src/routes/a/[account_name]/content/[post-id]/data.json` by extracting values from the concept. The components will read from this local file.

### Scenario B: Acting as an IDE Agent
When the user asks you to build or modify application code, layouts, or templates:
- Enforce the constraints below strictly.
- Build flexible components that can accept JSON data via props.
- **Dashboard Registration**: Whenever a new post is created or updated, you MUST update its status in `src/lib/data/accounts/[account_name]/posts.json`.
- **Codebase-Driven Data**: Do NOT build web-based forms to add data. All data input (new accounts, analytics) must happen purely in the codebase via JSON/TS files.

---

## 1. Global Constraints (Non-Negotiable)
- **Document Constraints**: Instagram portrait dimensions strictly 1080x1350 px.
- **Content Separation**: NEVER hardcode text/copywriting inside `.svelte` components. All post text/content MUST be loaded from a local `data.json` file residing in the same directory.
- **Tech Stack**: SvelteKit with Svelte 5 (runes mode).
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite`.
  - There is NO `tailwind.config.js/ts` file. All configuration must happen inside CSS `@theme` in `src/routes/layout.css`.
- **Svelte 5 Runes Mode**: Use `$props()`, `$state()`, `$derived()`, `$effect()`, `{@render}`, and `{#snippet}`. Do NOT use legacy Svelte 4 syntax.
- **No Image Generation**: Do NOT generate images using tools. If you need images, ask the user or leave a placeholder.

## 2. Strict File Granularity (Small Files)
- **Max Length**: No single `.svelte` or `.ts` file should exceed **150 lines**. Refactor into smaller components if it does.

## 3. Directory Structure (Mandatory Paths)
src/
├── content-agent-guidelines.md
├── lib/
│   ├── types/
│   │   ├── content.ts               (Type definitions for Content Statuses)
│   │   └── slide.ts                 (Type definitions for Slide Layouts)
│   ├── utils/
│   │   └── export.ts                (File System Access API HTML-to-Image logic)
│   ├── data/
│   │   ├── accounts_registry.json   (Registry of all accounts)
│   │   └── accounts/
│   │       └── [account_name]/      (Isolated data for each account)
│   │           ├── analytics_raw.json
│   │           ├── posts.json
│   │           └── ...
│   └── components/
│       ├── InstaPost.svelte         (Wrapper for 1080x1350px dimensions)
│       ├── FigmaExportWrapper.svelte(Wrapper with export button)
│       ├── SlideRenderer.svelte     (Dispatcher for layout components)
│       └── slides/                  (Named slide layout components)
├── routes/
│   ├── +page.svelte                 (Root Directory Menu)
│   ├── layout.css                   (Tailwind theme)
│   └── a/
│       └── [account_name]/
│           ├── +page.svelte         (Dynamic Analytics Dashboard)
│           └── content/             (OPTIONAL: Content generation pipeline)
│               └── [post-id]/
│                   ├── concept.md   (The idea for the post)
│                   ├── +page.svelte (Generated post viewing page)
│                   └── data.json    (Post specific data)

## 4. Mandatory Skills Usage
- Run `npx @sveltejs/mcp svelte-autofixer` (via `svelte-code-writer` skill) on `.svelte` files before finalizing.
- Consult `design-taste-frontend` Pre-Flight Check before delivering.

## 5. Build Verification
- Always run `npm run build` before marking a task complete.

## 6. No Comments
- Do not use HTML or JS comments in `.svelte` or `.ts` files. Use self-documenting naming conventions.

## 7. Post Page Layout
- **Horizontal Scrolling Only**: Carousel viewer pages (`src/routes/content/[post-id]/+page.svelte`) MUST be configured to scroll horizontally only. Vertical scrolling should be disabled.
- **Map Vertical Wheel to Horizontal**: Handle the wheel event to map vertical scroll wheel events (`e.deltaY`) to horizontal scrolling (`scrollLeft`).
- **Figma Export**: Ensure the Figma Export wrapper/button is present so the user can easily view the post at 1:1 scale.

## 8. No Animations for Static Exports
- **No Micro-Animations**: Do NOT add CSS hover states, transitions, or micro-animations to any elements inside an Instagram post design (e.g., inside the `InstaPost` wrapper). These designs are exported as static images or carousels, meaning interactive hover effects will never be seen by the end user.
