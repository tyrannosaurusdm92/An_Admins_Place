# Limitations and Honest Expectations

A standalone website cannot reproduce all capabilities of ChatGPT merely by containing a large amount of JavaScript. Frontier-model behavior comes from trained model weights and hosted infrastructure. Those model weights and proprietary platform services are not present in the uploaded archive and are not included here.

This package can provide a strong agent interface around a configured API model. Its actual reasoning quality, knowledge freshness, multimodal quality, tool reliability, context size, latency, and cost are determined by the backend model and services.

The supplied Apps Script endpoint could not be live-tested from the isolated build container because that environment had no DNS access to `script.google.com`. The package therefore includes source-level protocol validation and local static tests, but final end-to-end cloud validation must be run from a browser with network access and valid repository credentials.

The Apps Script library URL may require authentication and access to the owning Google account. It is retained for reference but is not downloaded into the ZIP.

Image and 3D generation require configured provider keys and settings. The backend can create procedural 3D plans without a third-party provider, while high-detail provider jobs depend on the configured external API.
