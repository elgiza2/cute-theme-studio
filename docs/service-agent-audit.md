# MegsyAI Service and Agent Audit

**Audit date:** 2026-08-22
**Repository:** `elgiza2/cute-theme-studio`
**Scope:** service activation chips, pre-service artwork, Slides, Deep Research, Code, Audio/Voice, Learning, Add Skill, MCP, and Integrations.

> This audit deliberately separates source-level implementation from live functional proof. The current Vercel URL points to an older build, so a successful or failed observation there is not treated as proof of the uncommitted source.

## Executive summary

The source now has one service-identity presentation path: non-media services use `ActiveServicePill`, while Images, Video, and Slides use the identity header inside `ComposerServicePanel`. The duplicate Slides template button and the unused mobile service-panel/connector systems were removed. Ten new clean service-chip JPG assets are stored under `public/service-chips/` and are used by the shared `StarterCards` component on desktop and mobile.

The requested agents are not all proven to be 100% operational yet. Several depend on provider credentials, plan entitlement, OAuth connections, or an actual MCP server. The source has been hardened where a deterministic fallback is possible, but the current deployment is stale and therefore cannot be used to certify the latest source.

## Source implementation status

| Service | Source implementation | Failure handling or prerequisite | Current proof level |
|---|---|---|---|
| Slides | Plan → approval → generation workflow; published resume handling; local deck fallback for start failure, provider error, empty completion, and stale jobs. | Plus AI/provider availability may still be required for the external deck job; local rendering is the fallback. | **Implemented; current source needs a fresh deployment test.** |
| Deep Research | Dedicated `deep-research-job` planning/job path and realtime subscription flow. | Requires a working research provider/job worker and enough time for long-running stages. | **Implemented; final report not proven in the latest source build.** |
| Code | `kimi-coder` SSE client and inline coder run UI. | Requires paid entitlement plus configured E2B and Alibaba/Kimi provider credentials. | **Implemented; live run not proven.** |
| Audio / Voice | Music uses the media generation/polling path. Voice responses are spoken with browser `SpeechSynthesis` after the stream and generated audio URLs are persisted on the final message. | Browser support and an actual generated audio URL are required for full voice proof. | **Implemented in source; end-to-end live proof pending.** |
| Learning | Learning mode uses the stream path with tutor-oriented system instructions and study state. | Requires a responsive chat provider. | **Implemented; live response was not proven.** |
| Add Skill | Skill designer first attempts `generate-skill`; when the endpoint returns 404 it falls back to `chat-alibaba`, parses SSE, extracts a JSON draft, and normalizes it into the editor. | The fallback still depends on a valid chat provider response. | **Implemented; fresh-build live proof pending.** |
| MCP | MCP settings CRUD/probe/refresh/test paths remain available through the crawler function. | Chat tool-calling requires a configured, reachable MCP connection and backend support for that connection. | **Management exists; chat runtime tool-calling is not proven.** |
| Integrations | Shared availability policy hides catalog entries without a real connect backend; detail CTA now says Disconnect when it actually disconnects. | Fresh OAuth/Pipedream connection requires provider configuration and user authorization. | **Read-only connected-account route passed on the old deployment; connect flows need fresh-account testing.** |

## Live observations from the currently published build

The following tests were run only after explicit confirmation and were read-only or short functional probes. They used the old published Vercel build, not the current uncommitted source.

| Test | Observation | Interpretation |
|---|---|---|
| Deep Research | The job reached 15% and remained there during repeated checks. It was then canceled manually. | The old deployment did not complete a research report; this is a failure/timeout observation, not a source-level certification. |
| Slides | Outline approval and final generation completed successfully. The old UI still showed duplicate “Choose template” controls. | The old workflow worked, but the duplicate-control result is expected because that build predates the current cleanup. |
| Code | Code mode activated, but no files, preview, or terminal result appeared after waiting. | The old deployment did not provide a complete run proof; entitlement/provider status remains unresolved. |
| Learning | Learning mode activated, but the request remained in Thinking and no lesson appeared. | The old deployment did not provide a complete tutoring proof. |
| Add Skill | The old build navigated from New Skill to the designer, but draft creation ended with an error. | The new fallback is not included in that old deployment, so this does not test the current source fallback. |
| MCP | A safe read-only request against the enabled DeepWiki connection remained in Thinking and then showed the generic delay message after stopping. | No MCP tool-call card or tool result was observed. Runtime tool-calling is unverified. |
| Integrations | A read-only request completed and reported GitHub, Google Forms, and Google Sheets as connected/ready. No write action was executed. | The generic connected-integrations route worked for existing connections, but fresh OAuth/connect/disconnect was not tested. |

## Validation performed on the current source

The following deterministic checks passed after the latest changes:

```text
npx tsc -p tsconfig.app.json --noEmit
 git diff --check
```

The full Vite production build has previously been terminated by the sandbox for memory/resource limits during transformation, without a TypeScript diagnostic. Deployment through the currently linked Vercel project is also blocked by repository access/linking restrictions and the manual upload file limit; the published URL must not be described as the latest build.

## Remaining certification requirements

A true 100% certification requires deploying the current `main` source and running the complete flows against the same build: generate and approve a Slides outline, finish a Deep Research report, execute a Code run with valid entitlement and E2B/provider credentials, generate music and receive a spoken Voice response, complete a Learning turn plus follow-up, create and save an Add Skill draft, invoke a safe read-only MCP tool on a reachable server, and complete at least one real OAuth/Pipedream connection and disconnect. Those prerequisites are external to the UI source and are not all available in the current stale deployment.
