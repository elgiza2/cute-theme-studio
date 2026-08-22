# Latest backlog findings

- صفحة Earn على سطح المكتب كانت تتجاهل `Outlet` وتعرض `PortfolioReferralsHero` القديم؛ تم تغيير shell ليعرض `children` حتى يظهر Dashboard النقاط الجديد على desktop وmobile.
- تمت إزالة imports/routes/exports وحالات التشغيل الخاصة بـ Tasks وScheduled Tasks، مع تحويل المسارات القديمة إلى `/settings/earn` مؤقتًا بدل ترك صفحات يتيمة، وحذف ملفات الواجهات القديمة.
- تمت إزالة زر الهيدر العلوي الخاص بالمهام من mobile Earn، وإزالة رابط Tasks من Hero القديم والروابط المباشرة من Dashboard.
- تم توليد ثلاثة أصول Aura جديدة في `public/referrals`: `aura-hero.png` و`aura-monthly.png` و`aura-annual.png`، وستستخدمها واجهة Earn الجديدة دون تركيب ثلاث صور ضخمة فوق بعضها.
- تم تنظيف قائمة زر + من Scheduled tasks وShopping وConnect computer، وتغيير Agent إلى Megsy Agent مع إبقاء المعرّف الداخلي `computer` للتنفيذ.
- تم حذف Shopping من `agentRegistry`، وتغيير اسم `computer` الظاهر إلى Megsy Agent.
- تم جعل `ActiveServicePill` المؤشر الوحيد المرئي للخدمة، وحذف رسم `activeAgentDef` الثاني من AnimatedInput. كما تم تعديل تغيير الوضع لمسح selectedAgent، وتعديل شريط الهاتف لمسح النموذج/الوضع السابق عند الانتقال.
- ما زال يلزم فحص TypeScript ثم معالجة مسارات التنفيذ الفعلية لـ Deep Research/Learning/Slides/Code وتدقيق نموذج الصور والأسعار.

## Backend verification

المشروع البعيد يحتوي فعليًا على `deep-research-job` و`chat-slides-stream` و`code-agent` بحالة ACTIVE، لذلك لا ينبغي إخفاء Deep Research أو Learning أو Slides بسبب غياب الوظائف. النسخة المحلية لا تحتوي source لهذه الوظائف لأنها مستضافة على Supabase، بينما clients المحليون يستدعونها عبر `supabase.functions.invoke`. يلزم الآن التحقق من سجلات التشغيل وpayloads، ثم تحسين fallback والواجهة بدل إزالة entry points.

## Log evidence

استعلام سجلات Supabase خلال آخر 24 ساعة أظهر أن `deep-research-job` يستقبل طلبات المستخدم المصادق عليها بحالة HTTP 200. في المقابل، `chat-slides-stream` يعيد HTTP 401 بشكل متكرر، والطلبات الظاهرة تحمل دور `anon` أو لا يظهر فيها مستخدم مصادق؛ لذلك العطل المؤكد في Slides هو مصادقة/حماية الوظيفة أو تمرير جلسة غير صحيحة، وليس غياب الوظيفة. لا توجد أسرار أو رموز جلسات محفوظة في هذا الملف.

## Official image API verification

مصدر deAPI الرسمي: https://docs.deapi.ai/models وhttps://docs.deapi.ai/api/v2/utilities/models. توصي الوثائق بطلب `GET https://api.deapi.ai/api/v2/models?limit=50` مع Bearer key، واستخدام الحقل `slug` كما هو، مع تصفية `filter[inference_types]=txt2img`. كما أن قائمة deAPI account-scoped؛ نماذج الشركاء قد لا تظهر إلا للحسابات Premium، لذلك لا يصح اختلاق slugs أو افتراض توفرها.

مصدر Renderful الرسمي: https://renderful.ai/docs. إنشاء الصور يتم عبر `POST https://api.renderful.ai/api/v1/generations` بجسم يتضمن `type: "text-to-image"`, `model`, و`prompt`، ثم polling على `GET /api/v1/generations/:id` حتى `completed` أو `failed`. اكتشاف النماذج يتم عبر `GET /api/v1/models?type=text-to-image`. التوثيق يعرض `flux-dev` كـ example، لكنه لا يثبت وحده توفر GPT Image 2 أو Nano Banana 2 أو Seedream 2.5 أو Grok؛ يجب اعتماد القوائم الحية لكل مفتاح.

مصدر OpenAI الرسمي: https://developers.openai.com/api/docs/guides/image-generation يثبت أن `gpt-image-2` هو المعرّف الحالي في OpenAI Image API.

فحص Renderful الرسمي بتاريخ 2026-08-22 من https://renderful.ai/models أثبت وجود نماذج Text to Image التالية: GPT Image 2 من OpenAI بسعر منشور $0.030/run، Nano Banana 2 من Google بسعر $0.050/run، وGrok Imagine Image من xAI بسعر $0.035/run. الصفحة تعرض روابط الاستخدام `/models/openai/gpt-image-2/text-to-image`, `/models/google/nano-banana-2/text-to-image`, و`/models/xai/grok-imagine-image/text-to-image`. صفحة النماذج تعرض أيضًا Seedream 4.5 وSeedream 5.0، ولا تعرض Seedream 2.5؛ لذلك لن نضيف Seedream 2.5 باسم مخترع. المصدر الرسمي للتكامل العام هو https://renderful.ai/docs.

فحص صفحات Renderful الرسمية بتاريخ 2026-08-22 أكد أن قيمة API لنموذج GPT Image 2 هي `gpt-image-2` (https://renderful.ai/models/kie/gpt-image-2/text-to-image)، وقيمة Nano Banana 2 هي `nano-banana-2` (https://renderful.ai/models/google/nano-banana-2/text-to-image). كلاهما موثق كـ text-to-image؛ GPT Image 2 يدعم 1K/2K/4K، وNano Banana 2 يدعم 1K/2K/4K وعدة aspect ratios. مسار العرض يتضمن provider مختلفًا عن قيمة API، لذلك mapping الخادم يجب أن يرسل model slug فقط (`gpt-image-2` أو `nano-banana-2`) إلى Renderful.

فحص صفحة Renderful الرسمية https://renderful.ai/models/xai/grok-imagine-image/text-to-image أكد أن model slug هو `grok-imagine-image`. النموذج يدعم text-to-image، aspect ratios 1:1 و16:9 و9:16، دقة 1K/2K، جودة High/Medium/Low، وحتى 10 مخرجات، والسعر المنشور $0.035/run.

فحص صفحة deAPI الرسمية https://deapi.ai/models/flux2-klein-4b-bf16 أكد أن model slug الصحيح في POST `/api/v2/images/generations` هو `Flux_2_Klein_4B_BF16`، مع seed موثق بقيمة `-1`. هذا يختلف عن slug العرض المحلي `deapi-flux-2-klein`، لذلك يجب أن يرسل adapter قيمة API الأصلية فقط.
