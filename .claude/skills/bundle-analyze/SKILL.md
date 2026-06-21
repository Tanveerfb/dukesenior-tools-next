---
name: bundle-analyze
description: Build with bundle analysis enabled and interpret the results. Use when investigating bundle size, identifying large dependencies, or optimizing code splitting.
disable-model-invocation: false
---

Run: `ANALYZE=true npm run build`

After the build completes:
- The bundle analyzer opens a visual report in the browser automatically
- Summarize the largest chunks and their top contributors
- Flag any unexpectedly large dependencies (>100KB gzipped)
- Suggest specific optimizations: dynamic imports, tree-shaking opportunities, or dependency replacements

Focus on client-side bundle size — server bundle size matters less for this Vercel-deployed app.
