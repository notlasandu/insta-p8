## Content Design System

This file documents the official Berl View design tokens and aesthetic rules for generating Instagram content.

### The Brand Voice & Aesthetic

- **Minimalist but Technical:** We are showcasing high-end properties and complex 3D scans. The design should not feel like a loud marketing flyer, but a premium tech/architectural showcase.
- **Let the Spaces Breathe:** High-quality imagery is the hero. Use generous margins and padding. Do not clutter the layout with redundant text.

### Dimensions & Setup

- **Format**: Instagram Portrait
- **Dimensions**: Strictly 1080px by 1350px.
- **Margins**: 80px side margins, 120px top padding (standard content area starts here).

### Color Palette

| Role                    | Token / Hex                          | Usage                                                                         |
| ----------------------- | ------------------------------------ | ----------------------------------------------------------------------------- |
| **Background (Main)**   | `bg-white` (`#FFFFFF`)               | Primary slide background.                                                     |
| **Background (Shapes)** | `bg-[#F5F6F8]`                       | Used for large abstract circular background shapes.                           |
| **Primary Text**        | `text-[#2D2D35]`                     | Used for headlines and main body text.                                        |
| **Secondary Text**      | `text-[#4A4B5A]`                     | Used for subheadlines and supportive text.                                    |
| **Muted/Meta Text**     | `text-[#818090]`                     | Used for UI elements (like "Swipe ->"), meta-labels, and very secondary text. |
| **Dividers/Borders**    | `border-[#D0D0D5]` or `gray-100/200` | Soft dividers between layout elements.                                        |

### Typography

- **Font Family**: *Plus Jakarta Sans* (via Google Fonts or Tailwind `font-sans`).
- **Headlines**: Massive display sizes. e.g., `text-[76px]`, `text-[84px]`, or `text-[88px]`.
  - Leading: tight (`leading-[1.05]`).
  - Tracking: negative (`tracking-[-0.04em]`).
  - Weight: `font-bold` or `font-black`.
- **Subheadlines**: e.g., `text-[44px]` or `text-[48px]`.
  - Leading: `leading-[1.25]` or `leading-[1.3]`.
  - Tracking: `tracking-[-0.02em]`.
  - Weight: `font-medium`.

### Shape Language (Signature moves)

- **Large Corner Radii**: The brand uses unusually large, sweeping border radii for images and panels to contrast with the technical nature of 3D scanning.
  - Standard Hero Image: `rounded-[56px]`.
  - Half/Split Panels: `rounded-[48px]`.
  - Small overlays/floating badges: `rounded-[20px]`.
- **Asymmetric Circles**: Often placed in corners (e.g., `-top-[200px] -left-[200px] w-[800px] h-[800px] rounded-full`) behind the content layer to break the squareness of the post.

### UI & UX Elements

- **Flexible Footer**: Intermediate slides often have a subtle "Swipe ->" at the bottom left. The final slide usually has the Berl View logo. These should be driven by the slide data schema, not hardcoded.
- **Figma Export**: Every post component should be wrapped with a mechanism to view at 1:1 scale for easy Figma extraction.
- **Micro-animations**: **BANNED.** These designs are for static export to images/PDFs. Do not add CSS hover states or transitions.
