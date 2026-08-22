# Image provider API reference

## deAPI
Official introduction: https://docs.deapi.ai/introduction

The documentation states that deAPI exposes a unified REST API for image, video, audio, and text workloads. It also exposes an OpenAI-compatible endpoint at `https://oai.deapi.ai/v1`. Authentication uses an API key, and the API supports image generation and editing. The docs navigation lists the current API v2 reference, models, execution modes, HTTP queue, webhooks, and WebSockets. The exact image-generation request schema should be taken from the current API v2 reference before implementation.

## Renderful
User-provided tools page: https://renderful.ai/tools

The page is an authenticated dashboard-style tools catalog. It exposes navigation for API Keys, Webhooks, Models, and an Image Generator. The Image Generator supports text-to-image and image edit workflows. The page itself does not expose the API request schema in the extracted public content; the linked Documentation area and API Keys area should be checked before implementing a Renderful adapter. Do not infer an endpoint from the tools page alone.

## Exact generation APIs

### deAPI v2
Base URL: `https://api.deapi.ai`.
Authentication: `Authorization: Bearer <API_KEY>`.
Image generation: `POST /api/v2/images/generations` with JSON fields including `prompt`, `model`, `width`, `height`, optional `guidance`, `steps`, `seed`, `negative_prompt`, and `quality`. The API returns a `request_id`; poll `GET /api/v2/jobs/{request_id}` for status and result. Model catalog: `GET /api/v2/models?limit=50&inference_type=txt2img`.

### Renderful
Base URL: `https://api.renderful.ai/api/v1`.
Authentication: `Authorization: Bearer <RENDERFUL_API_KEY>`.
Create generation: `POST /api/v1/generations` with `{ "type": "text-to-image", "model": "flux-dev", "prompt": "..." }`; response returns a task ID. Poll `GET /api/v1/generations/:id` until `completed` or `failed`; completed responses expose an `outputs` array. Models can be listed via `GET /api/v1/models?type=text-to-image`.
Official quickstart: https://renderful.ai/docs
