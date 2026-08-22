-- Renderful-backed image models supported by the server-side media-image adapter.
-- The provider-native model slug is stored in model_id_api; API keys remain in Vault.

insert into public.image_models (
  slug, display_name, provider, description, endpoint_text_to_image,
  unit, unit_cost_usd, credits, supported_aspects, supported_resolutions,
  default_aspect, default_resolution, is_premium, is_new, is_featured,
  sort_order, is_active, api_version, billing_mode, free_trial_count,
  provider_pool, model_id_api, supports_text_rendering
) values
(
  'renderful-gpt-image-2', 'GPT Image 2', 'renderful',
  'OpenAI GPT Image 2 through Renderful.', 'text-to-image',
  'image', 0.030, 6, '["1:1","9:16","16:9","4:3","3:4"]'::jsonb, '["1K","2K","4K"]'::jsonb,
  '1:1', '1K', true, true, true, 20, true, 'v2', 'credit_based', 0,
  'r', 'gpt-image-2', true
),
(
  'renderful-nano-banana-2', 'Nano Banana 2', 'renderful',
  'Google Nano Banana 2 through Renderful.', 'text-to-image',
  'image', 0.050, 7, '["1:1","16:9","9:16","4:3","3:4","3:2","2:3","4:5","5:4","21:9"]'::jsonb, '["1K","2K","4K"]'::jsonb,
  '1:1', '1K', true, true, true, 21, true, 'v2', 'credit_based', 0,
  'r', 'nano-banana-2', true
),
(
  'renderful-seedream-4-5', 'Seedream 4.5', 'renderful',
  'ByteDance Seedream 4.5 through Renderful. Seedream 2.5 was not listed in the verified Renderful catalogue.', 'text-to-image',
  'image', 0.040, 4, '["1:1","16:9","9:16","4:3","3:4"]'::jsonb, '["1K","2K"]'::jsonb,
  '1:1', '1K', true, true, false, 22, true, 'v2', 'credit_based', 0,
  'r', 'seedream-4.5', false
),
(
  'renderful-grok-imagine-image', 'Grok Imagine Image', 'renderful',
  'xAI Grok Imagine Image through Renderful.', 'text-to-image',
  'image', 0.035, 6, '["1:1","16:9","9:16"]'::jsonb, '["1K","2K"]'::jsonb,
  '1:1', '1K', true, true, false, 23, true, 'v2', 'credit_based', 0,
  'r', 'grok-imagine-image', false
)
on conflict (slug) do update set
  display_name = excluded.display_name,
  provider = excluded.provider,
  description = excluded.description,
  endpoint_text_to_image = excluded.endpoint_text_to_image,
  unit = excluded.unit,
  unit_cost_usd = excluded.unit_cost_usd,
  credits = excluded.credits,
  supported_aspects = excluded.supported_aspects,
  supported_resolutions = excluded.supported_resolutions,
  default_aspect = excluded.default_aspect,
  default_resolution = excluded.default_resolution,
  is_premium = excluded.is_premium,
  is_new = excluded.is_new,
  is_featured = excluded.is_featured,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  api_version = excluded.api_version,
  billing_mode = excluded.billing_mode,
  free_trial_count = excluded.free_trial_count,
  provider_pool = excluded.provider_pool,
  model_id_api = excluded.model_id_api,
  supports_text_rendering = excluded.supports_text_rendering,
  updated_at = now();
