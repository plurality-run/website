# Interactive widgets

Keep future demos self-contained here; the introductory homepage does not need client JavaScript.

For a native JavaScript, Canvas, WebGL, SVG, or custom-element demo, start with an Astro component and a bundled `<script>` for browser-only code. Import it only on the page that uses it. Browser APIs belong in that script, not in build-time frontmatter.

If a demo genuinely benefits from React, Svelte, or another supported framework, add the relevant Astro integration and hydrate that component with an appropriate `client:*` directive (often `client:visible`). There is no need to convert the whole website to that framework. Add MDX only if posts need embedded components; plain Markdown is sufficient for text updates.

Give interactive content keyboard controls, an accessible description or text alternative, reduced-motion behavior, and honest labels for simulated or disconnected data. Cross-origin embeds need their own accessibility and security review; current homepage checks explicitly assume no iframes.

Live services remain separate from the static site. Use appropriately scoped public APIs; never ship private credentials or privileged Journal access to the browser.
