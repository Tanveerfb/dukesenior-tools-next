---
name: deploy-check
description: Run the full CI pipeline locally (lint + build) and report any failures. Use before opening a PR or when you want to confirm changes are production-ready.
disable-model-invocation: false
---

Run the following commands in sequence and report results:

1. `npm run lint` — report any ESLint errors or warnings
2. `npm run build` — report any TypeScript errors or build failures

If either step fails:
- Quote the exact error messages
- Identify the file(s) involved
- Propose a fix if the cause is clear

If both pass: confirm the build is clean and ready to push.
