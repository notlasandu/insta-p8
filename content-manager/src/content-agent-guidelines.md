# Guidelines for the Content Agent

When generating new Instagram content based on a user's request, you **must** adhere to the following workflow. The goal is to build structural data that matches the Copium Builder design language.

## 1. Extract Requirements & Ideation
- Read the user's prompt carefully to extract the concept.
- **Consult the Knowledge Base**: Review `.agents/skills/copiumbuilder-content-design/references/BERL_VIEW_AI_AGENT_KNOWLEDGE_BASE.md` to align with the brand voice and core value propositions.
- Create a new folder using a date-slug naming convention: `src/routes/content/[month]-[day]-[slug]/` (e.g., `aug-14-commercial-visualization`).
- Create or update `src/routes/content/[post-id]/concept.md`.
- Write down the core idea, caption draft, image content ideas, and any notes in Markdown.

## 2. Design the Layouts (The Pattern Library)
- **Consult the Pattern Library**: Review `.agents/skills/copiumbuilder-content-design/SKILL.md` to see the available named slide layouts (e.g., `hero-image-text`, `text-over-grid`).
- **Consult Past Designs**: Look at `.agents/skills/copiumbuilder-content-design/references/past-designs/` for visual rhythm context.
- Select the appropriate layout for each slide in the carousel.

## 3. Generate JSON Data
Generate a structured `data.json` file inside `src/routes/content/[post-id]/data.json` that matches the exact schema for the selected layout components. Do not invent new fields.

```json
{
  "title": "Post Title",
  "caption": "Full Instagram caption...",
  "slides": [
    {
      "id": 1,
      "layout": "hero-image-text",
      "image": "image_url",
      "headline": "Main headline",
      "showSwipe": true
    }
  ]
}
```

## 4. Dashboard Registration
Update `src/lib/data/posts.json` to reflect the new post. Ensure the `id` matches the folder name you created.

## 5. IDE Agent Handoff
Once the JSON is wired and the post is registered, the IDE Agent can handle the `+page.svelte` assembly, which simply passes the data into `<SlideRenderer>`.

