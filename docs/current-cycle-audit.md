# Current MegsyAI Agent Test Cycle

**Date:** 2026-08-22

This is a live UI test log for the current audit cycle. The browser session is used only if already authenticated. Credentials and provider secrets are intentionally excluded.

## Test order

1. Chat
2. Images
3. Video
4. Slides
5. Deep Research
6. Code
7. Audio / Voice
8. Learning
9. Add Skill and skill use
10. MCP
11. Integrations and a safe read operation

## Acceptance rule

A service is not marked Passed without a visible, usable result from the interface. If the deployment is stale, a provider is unavailable, or a connection is missing, the service is marked Failed or Blocked with the evidence.

## Results

| Service | UI action | Result | Quality | Notes |
|---|---|---|---|---|
| Chat | Current-source landing/composer smoke | Blocked | Unverified | No authenticated local session; no current-source response artifact. |
| Images | Current-source activation smoke | Blocked | Unverified | Provider output requires authenticated service call; stale deployment failure is not current-source evidence. |
| Video | Current-source activation smoke | Blocked | Unverified | Provider output requires authenticated service call; stale deployment failure is not current-source evidence. |
| Slides | Current-source activation smoke | Blocked | Unverified | No authenticated deck/preview from current source. |
| Deep Research | Current-source activation smoke | Blocked | Unverified | No authenticated final report or source list from current source. |
| Code | Current-source activation smoke | Blocked | Unverified | No authenticated files, logs, or preview from current source. |
| Audio / Voice | Current-source activation smoke | Blocked | Unverified | No authenticated audio artifact or voice response from current source. |
| Learning | Current-source activation smoke | Blocked | Unverified | No authenticated lesson/follow-up from current source. |
| Add Skill + use | Current-source routing smoke | Blocked | Unverified | Local origin routes to auth; no authenticated create/save/use proof. |
| MCP | Current-source routing smoke | Blocked | Unverified | Local origin routes to auth; no safe read call from current source. |
| Integrations | Current-source routing smoke | Blocked | Unverified | Panel route opens locally, but no authenticated read operation was run. |

### Live observation — Chat

The deployed UI accepted a short chat prompt and returned a visible assistant response. Functional result: **Passed**. Output-quality result: **Below A+** because the response confirmed it could answer but did not explicitly identify the model as requested. The test was performed against the currently published build, which may not be the latest GitHub source.

### UI observation — Images activation

The published UI opened a new image prompt after selecting **Generate images**. The current deployed landing still shows the older service-card assets and is not evidence of the newer `public/service-chips` source assets.

### Live observation — Images

The image service accepted the prompt and entered a visible generation state. Final image output is still pending; the deployed interface is the older build, so model/chip presentation is also being tracked separately from source behavior.

### Live result — Images

The deployed UI did **not** produce an image. The request ended with a visible error from the Kimi tool loop: model `moonshot-v1-8k` was not found or unavailable. Result: **Failed**; quality: **No output**. This is a live blocker that must be fixed in the source/deployment routing before image generation can be rated.

### UI observation — Video activation

The published UI opened a dedicated video prompt after selecting **Generate video**, showing that the service activation route exists. The old landing artwork remains visible in this deployment.

### Live observation — Video

The video prompt was accepted by the published UI and the conversation entered a visible generation state with a loading indicator. Final video output is pending.

### Live result — Video

The published UI did not produce a video. After two status checks, the request ended with the same visible Kimi tool-loop error: model `moonshot-v1-8k` was not found or unavailable. Result: **Failed**; quality: **No output**. This confirms the deployed build routes media prompts through an invalid legacy model path.

### Deployment check — current source

The Vercel Git context shows the team has linked projects under a different GitHub organization, while the current source is `elgiza2/cute-theme-studio` at commit `3c1fee2`. A read-only context check succeeded, but creating a Git-linked preview for the current repository was rejected with Vercel `repo_no_access`: the Vercel account needs admin or write access to that repository. Therefore the live URL used above is not evidence for the current source. No partial/manual deployment was used.

### UI observation — Slides activation

The published UI opened a dedicated presentation prompt after selecting **Presentation**. The current deployment is still the older build, so this is an activation observation only until a deck is generated. The live composer visibly shows two duplicate `Manila` template controls, confirming the old deployment still contains the UI duplication that was removed in commit `3c1fee2`. The generated outline contained **8 slides** despite the prompt requesting 6; the UI then reported `Generated 8 slides from your approved plan` and showed `Open`, `Open in preview`, and `PPTX` actions. This is a functional baseline only; final visual quality and current-source behavior remain unverified.

### Live result — Slides baseline

The old deployment opened a real preview at `/slides/preview/...` with all **8/8 slides** and selectable thumbnails, so the deck artifact is usable. Quality is **Below A+**: the prompt requested 6 slides but the plan and deck contained 8, the title slide repeats the raw request rather than providing a polished opening, and the deck is largely text-only with limited visual storytelling. The duplicate Manila controls remain visible in the originating composer. This result belongs to the stale deployment, not commit `3c1fee2`.

### UI observation — Deep Research activation

The published UI opened a dedicated research prompt after selecting **Deep research**. Final report quality is pending; a loading state alone will not be counted as success. After sending once, the old UI switched into a dedicated Deep Research mode and displayed a research chip while retaining the prompt, requiring the visible Send action to be triggered again. The second send started a real job; after a status check it reached `15%`, marked `Planning research` complete and `Searching sources` as running. This remains pending until a final report appears. Two additional checks left it at **15%** with `Searching sources`/`Running deep research` still active and no report, citations, or completion artifact. Result for the old deployment: **Failed / hung**, quality: **No output**. Do not use this to judge commit `3c1fee2`.

### UI observation — Code activation

The published UI opened a dedicated **Write and run code** prompt. The actual files, execution logs, and preview must appear before this service can be rated as working. The test request switched the composer into a visible `Coder` mode, but no generated file, execution log, or preview has appeared yet. Two further UI checks left the composer unchanged, with no files, execution logs, preview, or explicit error. Result for the old deployment: **Failed / hung**; quality: **No output**.

### UI observation — Audio / Voice entry point

The published composer tools menu exposes `Voice input` as a microphone control and lists files, web search, skills, integrations, and MCP servers. It does not expose a separate text-to-speech or music-generation action in this old build; a voice-output test must use the voice agent/mode if the UI provides one.

### UI observation — Learning activation

The old landing does not expose the newer Learning mode tile, so a direct prompt-based activation is being tested. The prompt is present in the composer; the browser view visibly dropped a few characters while rendering the input, which is tracked as a test-harness/deployment observation rather than a product pass. After sending, the UI showed a `Learning` chip but produced no assistant lesson, example, quiz question, or loading/error state across a follow-up check. Result for the old deployment: **Failed / no output**; quality: **No output**.

### UI observation — Add Skill entry point

The old composer tools menu exposes a `Skills` action. The next step is to open its management page and attempt creating one reusable skill, then invoke it in chat. The old Skills view loaded successfully and displayed 15 built-in skill entries with enable toggles plus a `Manage` action. The management page then loaded with a visible `Create` button in the DOM, so custom-skill creation is reachable in this deployment. The modal offers four routes: create with Megsy, create from files, official library, and GitHub import. The current test uses the first route and will require a saved skill plus a chat invocation to pass. The designer accepted the seed prompt but, after two UI checks, displayed `Sorry — I hit an error. Try again?`; no editable draft, skill fields, save action, or persisted skill appeared. Result for the old deployment: **Failed**; quality: **No output**.

### Live result — Audio / Voice baseline

Clicking the old deployment's `Voice input` control produced no recording indicator, permission flow, transcript, assistant response, or audio artifact. The control is present, but there is no end-to-end evidence of voice operation. Result: **Failed / unverified**; quality: **No output**.

### UI observation — MCP entry point

The old composer tools menu exposes an `MCP Servers` action. The next test will inspect management state and perform only a safe read-only probe/call; no write operation or destructive tool will be attempted. The old management page loaded one `ready` DeepWiki server at `https://mcp.deepwiki.com/mcp` and displayed `ask_question`, `read_wiki_contents`, and `read_wiki_structure`, but no visible probe/test controls appeared in the card. A read-only request was entered in the chat composer and is ready to send. After sending and two further checks, the request remained at `Thinking deeply…` with no visible MCP tool call, DeepWiki content, citation, completion, or explicit error. Result for the old deployment: **Failed / hung**; quality: **No output**.

### UI observation — Integrations entry point

On returning to the old chat, clicking the composer `Integrations` control produced no visible sheet or navigation. The integration service card remains the next read-only entry point to test. DOM inspection confirms it is a button labeled `Integrations` with the expected service description; the first indexed click did not navigate, so the element will be activated directly for a controlled retry. Direct activation succeeded only by pre-filling the composer with `Use my connected integrations to:`; no account sheet opened. A read-only integration request then remained at `Thinking deeply…` after a status check, with no service list, connector tool call, read result, citation, or permission report. Result for the old deployment: **Failed / hung**; quality: **No output**.

### Current cycle — browser availability

A fresh navigation to the published URL returned the public landing HTML, but the authenticated UI could not be inspected: the browser subsystem entered its crash-loop disabled state on the subsequent view. A second fresh navigation produced the same landing HTML and the next view remained disabled. No new UI result is being treated as a pass. Current-source UI retesting is **Blocked** until a stable browser session or a deployable preview is available.

### Current-source UI smoke — local QA

Using the current source through the local Vite UI and the existing Chrome session, the app rendered the service landing cards for Chat, Deep Research, Slides, Code, Images, Video, Learning, Audio, Add Skill, MCP, and Integrations. This is a **UI boot pass only**, not a service-quality pass. The console still reported repeated `Maximum update depth exceeded. The result of getSnapshot should be cached` warnings and one `ERR_BLOCKED_BY_CLIENT` resource, so the runtime is not yet A+ and the warning must be isolated before functional service tests.

### Current-source UI smoke — runtime isolation result

After removing the unused assistant-ui runtime boundary from `AuiProvider` and the unused assistant-ui composer/selection wrappers, the current-source landing renders without the previous `Maximum update depth exceeded` / uncached snapshot errors. The only remaining console item in this controlled smoke was an external `ERR_BLOCKED_BY_CLIENT` resource. TypeScript and `git diff --check` also passed in the same validation command. This confirms a source-level UI stability fix, not an authenticated service-output pass; the local origin still shows `Sign in`, so protected generation and connector operations remain blocked pending a stable authenticated preview/session.

### Current-source UI smoke — service activation inventory

The current source visibly exposes the requested activation cards in the landing/composer flow: Deep research, Slides, Code, Images, Video, Learning, Audio, Add Skill, MCP, and Integrations. Their presence confirms routing/activation affordances only. No service is marked Passed without a real usable artifact from an authenticated interface.

### Current-source UI smoke — service activation

A controlled local UI smoke clicked each requested service card without sending a prompt or invoking a provider. Deep research, Slides, Code, Images, Video, Learning, and Audio stayed on the chat surface and changed the visible service/composer state; no page errors were recorded. Add Skill correctly routed to `/auth` because the local origin has no authenticated user. MCP likewise routed to `/auth`, while Integrations opened `/chat?integrations=1` and exposed the integration panel entry without a runtime error. These are activation results only. They do not prove provider output, persistence, MCP execution, or integration reads, and no service is marked Passed from this smoke alone.

### Live result — Chat retest on stale deployment

With the user’s confirmation, the old published deployment accepted the controlled three-line Chat prompt and visibly selected `Megsy 3.9 Max`; the request entered `Thinking…`. The final response is still pending and will be judged for exact instruction following. This is evidence for the old deployment only, not proof of the current GitHub source.

### Live result — Chat retest final

The stale deployment produced a visible assistant response with the requested answer line and a limitation line, and it stayed within three visible lines. It did **not** state the selected model name explicitly; the model selector showed `Megsy 3.9 Max`, while the response began with `Megsy`. Functional Chat result: **Passed on stale deployment**. Instruction-following quality: **Below A+** because the model-name requirement was not satisfied explicitly. This result must not be attributed to the current GitHub source.

### Live observation — Images retest on stale deployment

The old published UI accepted the controlled still-life prompt, selected `Megsy 3.9 Max`, created a conversation, and displayed `Thinking…` with a stop control. The prompt text was visibly altered by the browser input path (for example, a few characters were dropped), so any visual-quality assessment must consider the actual submitted text shown in the transcript. Final artifact status is pending.

### Live result — Images retest final

The stale deployment produced no image, image URL, or preview. It returned a visible fallback response saying it encountered a technical issue generating the image and offered a photographer setup guide instead. Images result: **Failed**; artifact quality: **No output / Below A+**. This is a stale-deployment failure only; the current source uses a direct `media-image` path and still lacks a deployable authenticated preview.

### Live observation — Video retest on stale deployment

The stale deployment accepted the short moving-scene prompt and entered `Thinking…` with a visible stop control. The rendered transcript shows a few dropped characters from browser text entry (`through`/`soft morning`/`text` were visibly altered), so the submitted prompt is not an exact copy of the intended prompt. Final video artifact status is pending.

### Live observation — Video retest pending/stalled

After the first wait, the stale deployment remained in `Thinking deeply…` with the stop control and no video element, URL, thumbnail, or completion message. This is a stall signal, not a pass; one controlled follow-up check is required before classifying it as failed.

### Live result — Video retest final

The stale deployment eventually returned a storyboard and Framer Motion/code-oriented response with `Project preview — 2 files` and `Files — 2 files`; it did **not** produce a video element, downloadable video URL, playable clip, or video thumbnail. The flow appears to have fallen into a code/project response rather than the requested media artifact. Video result: **Failed**; artifact quality: **No video / Below A+**. This confirms a live issue in the stale deployment only and is not proof of current-source behavior.

### Live observation — Slides retest on stale deployment

The old published UI accepted the six-slide presentation request and entered the `Create slides` flow. It visibly displayed two identical `Manila` template controls (`Choose template` twice), confirming the duplicate-template issue remains in the stale deployment. The final plan/deck/preview is pending.

### Live observation — Slides plan result on stale deployment

The stale deployment generated an editable outline and explicitly reported `7 slides` / `Generated 7 slides from your approved plan` despite the request for 6. The outline included a title, three principles, two separate visual case-study slides, and a closing checklist. The UI exposed `Open`, `Open in preview`, and `PPTX` actions, so the artifact path is reachable, but the count mismatch is a functional/instruction-following defect. The duplicate Manila controls remained visible.

### Live observation — Slides preview opened

The `Open in preview` control was located in the generated deck card and activated successfully. The next view will verify whether the preview contains all 7 slides and whether the visual artifact is usable; no source or session data was read.

### Live result — Slides preview on stale deployment

The old deployment opened a real preview at `/slides/preview/d_mt4iotvx_mxnyz7` with selectable thumbnails for all `7 / 7` slides, confirming a usable deck artifact. The visual review is **Below A+**: the request asked for 6 slides but the deck has 7; the title slide repeats the raw prompt twice; the deck is largely text-only with no meaningful visual case-study imagery; and the originating composer still shows duplicate Manila controls. Slides result: **Functionally Passed on stale deployment, quality Below A+**. It is not evidence that the current GitHub source is fixed.

### Live observation — Deep Research retest start on stale deployment

The old published deployment opened the Deep Research entry point and prefilled the composer with `Do deep, structured research with sources about:`. No research job was started yet. The next step is a bounded question followed by a wait for a final report with citations.

### Live observation — Deep Research retest started on stale deployment

The old deployment accepted the bounded research question and created a conversation. The UI showed a running indicator/ellipsis with no report or citations yet. The browser input path again dropped a few characters in the visible transcript, so the exact submitted spelling differs from the intended prompt. Final report status is pending.

### Live observation — Deep Research stalled on stale deployment

After the first wait, the stale deployment still showed `Thinking deeply…` with no report, citations, source list, progress card, or completion artifact. This is not a pass; one final controlled wait will distinguish a slow job from a persistent stall.

### Live result — Deep Research final on stale deployment

The stale deployment eventually returned a visible structured report with three principles, separate `Strong Evidence` and `Practical Guidance` sections, and named academic references. Functional research result: **Passed on stale deployment** because a complete report appeared. Quality: **Below A+** because sources were given as names/citations without clickable URLs or verification links, the response introduced an unexplained CLM interpretation, and the browser text-entry path altered several words in the submitted question. This does not validate the current GitHub source.

### Live observation — Code retest start on stale deployment

The old published UI opened the `Write code for a project:` entry point and left the landing composer ready for a bounded coding task. No files or execution result are present yet.

### Live observation — Code retest started on stale deployment

The stale deployment entered a visible `Coder` state after the coding task was sent and retained the submitted task in the composer. No generated files, execution logs, or live preview were visible at this checkpoint; final status is pending.

### Live observation — Code retest stalled on stale deployment

After the first wait, the old deployment still showed the `Coder` mode and the task text but no generated files, execution logs, preview, or explicit error. This is a stall signal rather than a pass; one final controlled check will be made before classifying it as failed.

### Live result — Code retest final on stale deployment

The stale deployment remained in `Coder` with the task text and no generated files, execution logs, preview, or explicit completion/error after two waits. Code result: **Failed / hung**; quality: **No usable output / Below A+**. This failure belongs to the stale deployment and is not current-source proof.

### Live result — Audio / Voice input on stale deployment

The old deployment exposed a `Voice input` control. Clicking it returned to the normal composer without a recording indicator, permission prompt, waveform, transcript, response, or audio artifact. Voice input result: **Failed / unverified**; quality: **No output**. The old landing also did not expose a separate `Create audio`/music-generation card, so no music artifact could be tested in that deployment.

### Live observation — Learning retest started on stale deployment

The old deployment switched into a visible `Learning` mode after the bounded Pomodoro request was sent and retained the task in the composer. No lesson, example, or quiz question was visible at this checkpoint; final output is pending.

### Live observation — Learning retest stalled on stale deployment

After the first wait, the old deployment still showed the `Learning` mode and the original task but no lesson content, example, quiz question, loading detail, or explicit error. This is not a pass; one final controlled check will be made.

### Live result — Learning retest final on stale deployment

The old deployment remained in `Learning` with the task in the composer and produced no lesson, example, quiz question, follow-up prompt, or explicit error after two waits. Learning result: **Failed / hung**; quality: **No usable output / Below A+**. This is a stale-deployment result only.

### Live observation — Skills management on stale deployment

The old deployment opened the Skills management view from the composer tools menu. It displayed 15 built-in skills with enable toggles and a visible `Manage` control. No existing skill was toggled or modified. The next step is to use `Manage` and attempt one new custom skill.

### Live observation — Custom skill management route on stale deployment

The old deployment opened `/settings/skills` successfully after clicking `Manage`. The page showed the built-in skill library and a visible `Create` action; no existing skill was edited, toggled, or deleted. The custom-skill creation flow is reachable and will be tested next.

### Live observation — Custom skill designer on stale deployment

The old deployment opened the custom skill designer at `/settings/skills/new`. The description field accepted a bounded expert brief for a project-scoping skill. No file upload, GitHub import, or existing skill modification was used. The designer’s generated draft/save result is pending.

### Live result — Add Skill designer on stale deployment

The old deployment moved from `/settings/skills/new` into the Designer after submitting the custom brief, but the designer displayed `Sorry — I hit an error. Try again?` and kept the skill area empty. No editable draft, generated fields, save action, or persisted custom skill appeared. Add Skill creation result: **Failed**; quality: **No output**. The skill could not be used afterward because no skill was created.

### Live observation — MCP management on stale deployment

The old deployment opened `/settings/mcp` from the tools menu. It showed one enabled `ready` DeepWiki server with the read-oriented tools `ask_question`, `read_wiki_contents`, and `read_wiki_structure`. No MCP connection was added, edited, deleted, or otherwise mutated. The next step is one safe read-only request through chat.

### Live observation — MCP read-only request started on stale deployment

The old deployment accepted the read-only DeepWiki request and entered a visible `Thinking…` state. The submitted transcript shows a few dropped characters from browser entry, but it still explicitly requested public Python wiki structure and prohibited create/edit/delete actions. No tool result or source content was visible yet.

### Live result — MCP read-only on stale deployment

The stale deployment returned a concrete read-only DeepWiki result listing the top-level sections of the public `python/cpython` wiki and explicitly stated that the information was retrieved using DeepWiki MCP in read-only mode. MCP result: **Passed on stale deployment for safe read**; quality: **Good functional output, not A+** because the response was a plain list without direct source links or tool metadata. No create/edit/delete operation was attempted. This does not prove the current GitHub source’s `mcp_connections` contract or runtime wiring; that remains unverified until a current authenticated preview exists.

### Live observation — Integrations read-only request setup on stale deployment

The old deployment opened the Integrations entry point from the landing card and prefilled `Use my connected integrations to:`. No connector was added, authorized, modified, or called yet. The next step is a read-only inventory request only.

### Live observation — Integrations read-only request started on stale deployment

The old deployment accepted the read-only inventory request and entered a visible `Thinking…` state. No integration names or statuses were visible yet, and no write operation was requested or performed. Final result is pending.

### Live observation — Integrations read-only stalled on stale deployment

After the first wait, the old deployment still showed `Thinking deeply…` and no connector inventory, status list, or explicit error. Because the request was read-only and no side effect occurred, one final controlled check will be made before classifying it as failed/hung.

### Live result — Integrations read-only final on stale deployment

The old deployment returned a concrete read-only inventory: GitHub was reported `Connected`; Google Forms was `Not Found` for a dummy form ID; and Google Sheets returned `Authentication Error` due to an owner/auth mismatch. No message, record, setting, or connector mutation was performed. Integrations result: **Passed for safe inventory on stale deployment, with two connector failures**; quality: **Below A+** because the response exposed an unhelpful dummy-form diagnostic and did not provide actionable connector IDs/links. This is not proof of the current GitHub source.

### Provider contract verification — official docs

The official deAPI queue documentation confirms that image jobs are submitted to `POST /api/v2/{resource}/{operation}`, return a `request_id`, and are polled via `/api/v2/jobs/{id}`. Terminal status is documented as `done` or `error`, with `result_url` or `result` used for the completed output: [deAPI execution modes](https://docs.deapi.ai/execution-modes-and-integrations/execution-modes-and-http-queue) and [deAPI HTTP queue example](https://docs.deapi.ai/execution-modes-and-integrations/n8n-integration).

The official Renderful API documentation confirms `POST https://api.renderful.ai/api/v1/generations` with `type: "text-to-image"`, `model`, and `prompt`, followed by `GET /api/v1/generations/:id`. The documented terminal states are `completed` and `failed`, and successful `outputs` contains result URLs: [Renderful API documentation](https://renderful.ai/docs).

### Backend drift confirmed

The deployed `media-image` function is version 1018 and its source matches the local implementation before the current patch. Its documented response handling accepted only a narrow set of deAPI/Renderful output shapes; the local patch now recursively normalizes URL-bearing fields and accepts documented terminal aliases (`completed`, `complete`, `done`, `succeeded`). The deployed function reports `verify_jwt: false`; it still uses the service-role key internally and provider key RPCs, so no provider secret was copied into source.

The deployed `media-video` and `media-video-poll` sources were absent from this checkout and have been restored locally, together with their relative shared helpers, to make the video/music backend reproducible and reviewable. No deployment has been claimed yet.

### Post-deploy Images retest

After deploying `media-image` version 1019, the authenticated UI was retested with a fresh editorial still-life prompt. The request reached the chat and remained in `Thinking deeply…`; no image, URL, or explicit provider error appeared during the observation window. This is **not a pass**. The output-normalization patch is deployed, but end-to-end image generation remains **Failed/Blocked pending provider/RPC evidence**; no artifact was created in this retest.

Network inspection during the post-deploy Images retest showed requests to both `chat-alibaba` and `media-image` on the Supabase project, but no response status or body was exposed. The old frontend therefore cannot isolate the current source media flow; the retest remains non-passing and is not used as proof of the local UI implementation.

- 2026-08-22 post-poll deploy video test: old authenticated Vercel UI started a 5-second single-shot request after media-video-poll v415 deployment. At ~6 seconds the UI still showed `Thinking deeply…` and no video element or playable URL; this is pending, not a pass. The old deployment is legacy evidence only.

- 2026-08-22 after chat-alibaba v466 deploy: the legacy authenticated UI sent two plain Chat prompts. Both returned `Connection error. Please check your internet and try again.` and no assistant artifact. Supabase logs showed chat-alibaba function id `1868cb76-b7d7-4218-9a04-322dfa13d9fa` booting on version 466; the first post-deploy attempt also showed an EarlyDrop event. Chat remains failed/unverified; no model or provider success is claimed.
- 2026-08-22 source restoration: chat-alibaba plus missing `skillsResolver` and `intentClassifier` were restored from the deployed function source into the repository after a redacted secret-like scan found no hard-coded credentials. Kimi/Moonshot aliases were replaced with current DashScope Qwen Function Calling models based on official Alibaba documentation; chat-alibaba v466 is the resulting deployment.

- 2026-08-22 after chat-alibaba v467 DB-key fallback deploy: the authenticated legacy UI retried Chat and again returned `Connection error. Please check your internet and try again.` with no assistant artifact. This remains Failed/No output; the old UI may be stale, but the shared backend path also needs a direct runtime diagnosis before claiming repair.

- External source evidence: Alibaba Cloud Model Studio documentation at https://www.alibabacloud.com/help/en/model-studio/kimi-api states that Moonshot-Kimi-K2-Instruct and kimi-k2-thinking were retired on July 9, 2026 and recommends current Qwen models; its OpenAI compatibility documentation at https://www.alibabacloud.com/help/en/model-studio/compatibility-of-openai-with-dashscope documents OpenAI-compatible Function Calling with supported Qwen/Kimi families. The deployed chat routing was updated accordingly instead of retaining the retired moonshot-v1 aliases.


### Slides-only repair — Plus AI direct path

The Slides source was narrowed to Plus AI only. The initial request now bypasses chat-alibaba outline generation and calls `chat-slides-stream` directly with `provider: plusai` and the inferred `numberOfSlides`; approved-plan and stale/error paths no longer turn a local deck or partial text into a success artifact. `chat-slides-stream` was deployed as v1408, then v1409 with server-side support for both configured secret aliases `PLUS_AI_API_KEY` and `PLUSAI_API_KEY`, retrying an alternate alias only on 401/403 without exposing values.

Two authenticated endpoint tests requested exactly six slides. Both jobs were accepted with HTTP 200 and a job ID, then terminated at `phase=outline` with `status=error`, no `standardSlides`, no URL, and zero slides. A sanitized database classification for both was `plusai_auth_rejected`; no raw provider error or secret was read. Slides therefore remains **Blocked**, not Passed/A+, until the Supabase Plus AI secret is replaced with a valid active Plus organization API key. The official contract documents POST `pollingUrl` and completed GET `slides` plus downloadable `url`: https://guide.plusai.com/apis-for-presentations/presentations-api


### Current repair — Deep Research Parallel and duplicate pending UI

The current source contained two research waiting renderers for the same `researchJobId`: `DeepResearchProgress` and `ResearchJobBubble`. `ChatMessageItem` now renders only `ResearchJobBubble`, which already owns loading, plan approval, running stages, retry, final report, and persistence, so the UI has one research card per job.

The deployed `deep-research-job` source was restored into the repository with its Parallel helpers. The Parallel path now requests a long-form report, normalizes content/citations across documented output shapes, refuses to mark a job succeeded when the report is empty or only a brief status response, and starts a server-side polling fallback in addition to the webhook. Polling updates progress while running and finalizes the same `research_jobs` record when a substantive report is returned. The updated function was bundled successfully and deployed as `deep-research-job` v1225 with the existing `verify_jwt=false` policy preserved.

An authenticated smoke job for a long English research query reached `status=searching`, `stage=Parallel research running`, and progressed from 20% to 32% over the observed polling window without an error. It had not produced its final report at the last check, so no Deep Research pass/A+ claim is made yet.


### Parallel contract reference

Parallel's official documentation lists Task Run as an asynchronous API with a status lifecycle, a dedicated result endpoint that returns the full output and research basis, and webhook events for completion. The implementation uses the documented `x-api-key` server header and keeps `PARALLEL_API_KEY` server-side. Reference: https://docs.parallel.ai/llms.txt; Task Run lifecycle: https://docs.parallel.ai/task-api/guides/execute-task-run.md; result/basis: https://docs.parallel.ai/task-api/guides/access-research-basis.md

### Vercel blank-page investigation — Aug 22, 2026

The elgiza2/megsyai-vercel-preview repository is at commit 519d0e179a7a9c300ad30b47da92002521bb2d37 (Harden parallel deep research output). The Vercel project currently serving megsyai-vercel-preview.vercel.app is a separate project metadata record whose latest deployment points to the elgizametaa GitHub namespace and an initial commit SHA 6118044f60f8b3c9f40fb09eb46cfff571b41381, so it is not proof that the elgiza2 mirror is deployed.

The domain returns HTTP 200 and the Vercel build log reports a successful Vite build and deployment. Browser inspection showed the main and vendor JavaScript chunks load, but #root remains empty and the viewport is blank. The published bundle contains the source guard Missing VITE_SUPABASE_PUBLISHABLE_KEY; src/integrations/supabase/client.ts previously threw this error during module evaluation when the Vercel project did not define the public Supabase key, before React could mount. This is the confirmed cause of the white page; it is not a build or SPA rewrite failure.

The source now exports supabaseConfigurationMissing, uses a non-secret sentinel to keep module evaluation safe, and renders an actionable configuration state in App.tsx instead of leaving a blank page. The real fix for a functional authenticated app remains to add the public VITE_SUPABASE_PUBLISHABLE_KEY to the Vercel project environment and redeploy; provider secrets must stay server-side.

### Current-source Slides / Deep Research / mobile review — Aug 22, 2026

The current source has exactly one `ComposerServicePanel` instance in `ChatComposerSection`, with one Slides `SelectRow` whose accessible label is `Choose template`. `ChatGlobalModals` renders `TemplatePickerSheet` only when the same `slidesPickerOpen` state is true, so the sheet is a consequence of the single trigger, not a second selector. The prior duplicate Manila controls belong to the stale/wrong Vercel deployment.

The current Deep Research approval path uses `PARALLEL_API_KEY` by default, creates a Parallel Task Run with a language-aware long-form prompt, records `research_job_id` metadata, registers the run in `parallel_tasks`, and schedules bounded server-side polling. A completed result is accepted only when its normalized report is at least 600 characters; citations/sources are normalized from multiple output shapes. This source review found no additional duplicate waiting component in the current implementation.
