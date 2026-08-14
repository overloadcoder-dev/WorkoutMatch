---
name: web-quality
description: Use when a web change affects accessibility, responsive behavior, performance, Lighthouse results, metadata, crawlability, indexing, sitemap, or robots.txt
---

# Web Quality

Apply only the checks affected by the change. Inspect the project’s framework, deployment model, routes, and existing conventions before recommending configuration.

## Accessibility and Responsive UX

- Use semantic elements, one logical heading structure, explicit form labels, useful alternative text, and meaningful link or button names.
- Preserve keyboard access, visible focus, sensible focus order and restoration, sufficient contrast, zoom support, reduced-motion preferences, and accessible validation or status announcements.
- Check mobile, tablet, and desktop layouts; content order; reflow; overflow; touch targets; hover assumptions; and long or translated content.
- Prefer native controls. When custom widgets are necessary, implement the expected keyboard and assistive-technology behavior.

## Performance and Lighthouse

- Measure before diagnosing. Record the URL, build mode, viewport, throttling, and tool version when reporting Lighthouse results.
- For a full Lighthouse request, run and report the applicable Performance, Accessibility, Best Practices, and SEO categories. Investigate relevant failures rather than reporting scores alone.
- Investigate LCP, INP, and CLS contributors: server response, render-blocking assets, fonts, images, hydration, long tasks, third-party scripts, and layout instability.
- Size images for their rendered use, provide dimensions, select appropriate formats, and lazy-load only below-the-fold media.
- Keep critical content available without unnecessary client JavaScript. Split code by real route or interaction boundaries and avoid dependencies for trivial behavior.
- Treat Lighthouse as evidence, not a guarantee. Confirm important findings in the built application and, when relevant, in field data.

## On-Page and Technical SEO

- Give indexable pages unique titles, descriptions, canonical URLs, a clear primary heading, crawlable internal links, useful status codes, and meaningful page content.
- Add Open Graph, social metadata, hreflang, or structured data only when the project and content require them. Validate structured data and never invent organization, author, product, rating, address, or production-origin facts.
- Keep canonical, redirect, trailing-slash, and preferred-host rules consistent. Do not canonicalize unrelated or materially different pages together.
- Generate sitemaps from canonical indexable routes. Exclude redirects, errors, duplicates, private pages, and pages marked `noindex`; use a sitemap index when scale requires it.
- Use `robots.txt` to guide crawling, not to protect secrets or guarantee de-indexing. Reference the production sitemap and avoid blocking assets required to render indexable pages.
- Use `noindex` or access control for non-indexable content as appropriate. Confirm environment-specific rules so preview or staging directives do not leak into production.
- Do not block a URL in `robots.txt` when crawlers must read its `noindex` directive.

## Framework Notes

Prefer existing official framework facilities. For Nuxt, inspect route rules, head/meta utilities, server routes, and installed sitemap or robots modules before adding dependencies. Apply the same outcomes to Vue, static, and vanilla sites.

## Release Checks

- Test production output, not only development mode. Inspect returned HTML to confirm essential content, title, canonical, robots directives, and structured data do not depend on late client execution.
- Confirm indexable routes return `200`, missing pages return a real `404`, and redirects use the intended permanent or temporary status without chains or loops.
- Parse generated XML. Sitemap locations must be absolute canonical URLs, escaped correctly, reachable, and internally consistent. Add `lastmod` only when it represents a meaningful content change.
- Fetch the deployed `robots.txt` and sitemap from their public URLs. Verify environment rules explicitly; staging commonly needs protection while production needs intentional crawl access.
- Use project performance budgets. A Lighthouse score of 100 does not replace field metrics or regression comparison.
- Recheck representative route types rather than only the home page: content, listing, dynamic, error, redirected, and intentionally excluded pages.

## Evidence

Report what was inspected or executed, the observed result, and what remains unverified. Production crawlability, canonical origins, and deployed Lighthouse scores require checks against the actual deployed environment.
