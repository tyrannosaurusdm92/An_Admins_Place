Jasper Fanfiction Project — retained historical filename

This is now part of the full expanded/corrected project, not a patch-only build.

Generation endpoint ownership:
- The Apps Script deployment URL exists only in js/jasper-fanfiction-backend-provider.js.
- index.html does not contain or expose the endpoint.
- No Google Apps Script .gs backend source is bundled in this frontend project.

Current architecture:
- 5 original fanfiction series x 40 authored chapters = 200 authored chapters.
- Chapters 1–39 route ordinary choices to the next authored chapter.
- Each authored chapter has one optional private-interlude handoff; the UI fades to black, explicit-bridge.js owns that bounded generation, then the UI fades back and the story resumes.
- Chapter 40 ordinary choices continue into generated chapter 41+.
- Chapter 40 private handoff returns to normal generated continuation.
- New fanfiction can be created; existing stories can be continued and branched; branches can be saved/restored.
- Jasper remains the named first-person protagonist; William writer-reference/style guidance remains active.
