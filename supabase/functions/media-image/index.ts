import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`supabase_rpc_${name}_${response.status}`);
  return text ? JSON.parse(text) as T : (null as T);
}

async function requestJson(url: string, init: RequestInit, timeoutMs = 45_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    let body: any = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text.slice(0, 500) }; }
    if (!response.ok) {
      const error = new Error(body?.message || body?.error || `Provider HTTP ${response.status}`);
      (error as any).status = response.status;
      (error as any).code = body?.error_code || body?.code || `HTTP_${response.status}`;
      throw error;
    }
    return body;
  } finally {
    clearTimeout(timeout);
  }
}

async function generateDeapi(secret: string, prompt: string, model?: string, width = 1024, height = 1024) {
  const created = await requestJson("https://api.deapi.ai/api/v2/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ prompt, model: model || "Flux1schnell", width, height, steps: 4, seed: Math.floor(Math.random() * 2_000_000_000) }),
  });
  const requestId = created?.request_id || created?.data?.request_id || created?.id;
  if (!requestId) throw Object.assign(new Error("deAPI did not return a request id"), { code: "MISSING_REQUEST_ID" });
  for (let attempt = 0; attempt < 40; attempt++) {
    const result = await requestJson(`https://api.deapi.ai/api/v2/jobs/${encodeURIComponent(requestId)}`, {
      headers: { Authorization: `Bearer ${secret}`, Accept: "application/json" },
    });
    const data = result?.data || result;
    const status = String(data?.status || "").toLowerCase();
    const imageUrl = data?.result_url || data?.result || data?.results_alt_formats?.webp || data?.results_alt_formats?.jpg;
    if (imageUrl && (["completed", "complete", "done", "succeeded"].includes(status) || !status)) return { requestId, imageUrl };
    if (["failed", "error", "cancelled"].includes(status)) {
      throw Object.assign(new Error(data?.error_message || data?.message || "deAPI generation failed"), { code: data?.error_code || "GENERATION_FAILED" });
    }
    await sleep(3000);
  }
  throw Object.assign(new Error("deAPI generation timed out"), { code: "POLL_TIMEOUT" });
}

async function generateRenderful(secret: string, prompt: string, model?: string) {
  const created = await requestJson("https://api.renderful.ai/api/v1/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "text-to-image", model: model || "flux-dev", prompt }),
  });
  const requestId = created?.id || created?.task_id || created?.generation_id || created?.data?.id;
  if (!requestId) throw Object.assign(new Error("Renderful did not return a task id"), { code: "MISSING_TASK_ID" });
  for (let attempt = 0; attempt < 40; attempt++) {
    const result = await requestJson(`https://api.renderful.ai/api/v1/generations/${encodeURIComponent(requestId)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const status = String(result?.status || result?.data?.status || "").toLowerCase();
    const outputs = result?.outputs || result?.data?.outputs || [];
    const first = outputs[0];
    const imageUrl = typeof first === "string" ? first : first?.url || first?.image_url;
    if (imageUrl && status === "completed") return { requestId, imageUrl };
    if (["failed", "error", "cancelled"].includes(status)) {
      throw Object.assign(new Error(result?.error || result?.data?.error || "Renderful generation failed"), { code: "GENERATION_FAILED" });
    }
    await sleep(3000);
  }
  throw Object.assign(new Error("Renderful generation timed out"), { code: "POLL_TIMEOUT" });
}

async function tryProvider(provider: "d" | "r", prompt: string, model?: string, width?: number, height?: number) {
  const attempted = new Set<string>();
  for (let i = 0; i < 10; i++) {
    let data: any;
    try { data = await rpc<any[]>("image_provider_next_key", { p_provider: provider }); }
    catch (error) { console.error(`[image-provider] key lookup failed for ${provider}`, error); continue; }
    const key = Array.isArray(data) ? data[0] : data;
    if (!key?.key_id || !key?.secret_value || attempted.has(key.key_id)) break;
    attempted.add(key.key_id);
    await rpc("image_provider_mark_used", { p_key_id: key.key_id }).catch((error) => console.error("[image-provider] mark-used failed", error));
    try {
      const result = provider === "d"
        ? await generateDeapi(key.secret_value, prompt, model, width, height)
        : await generateRenderful(key.secret_value, prompt, model);
      await rpc("image_provider_record_result", { p_key_id: key.key_id, p_success: true, p_error_code: null }).catch((error) => console.error("[image-provider] success record failed", error));
      return { provider, ...result };
    } catch (error) {
      const code = String((error as any)?.code || (error as any)?.message || "provider_error").slice(0, 160);
      await rpc("image_provider_record_result", { p_key_id: key.key_id, p_success: false, p_error_code: code }).catch((recordError) => console.error("[image-provider] failure record failed", recordError));
    }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const payload = await req.json().catch(() => null) as { prompt?: string; provider?: "d" | "r"; model?: string; width?: number; height?: number } | null;
  const prompt = payload?.prompt?.trim();
  if (!prompt || prompt.length > 4000) return json({ error: "A prompt between 1 and 4000 characters is required" }, 400);
  const order: ("d" | "r")[] = payload?.provider ? [payload.provider, payload.provider === "d" ? "r" : "d"] : ["d", "r"];
  try {
    for (const provider of order) {
      const result = await tryProvider(provider, prompt, payload?.model, payload?.width, payload?.height);
      if (result) return json({ ok: true, provider: result.provider, request_id: result.requestId, image_url: result.imageUrl, image_urls: [result.imageUrl] });
    }
    return json({ ok: false, error: "No healthy image provider key is available" }, 503);
  } catch (error) {
    console.error("[image-provider] request failed", error);
    return json({ ok: false, error: "Image provider request failed" }, 502);
  }
});
