// scripts/seed_products_and_reviews.js
// Inserts initial verified catalog products and reviews into live Supabase.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lazleotmwyxglqgqwyrq.supabase.co';
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const products = [
  {
    id: "sony-wh1000xm5",
    sku: "SQ-TECH-001",
    title: "سماعات رأس لاسلكية سوني WH-1000XM5 عازلة للضوضاء النشطة ANC مع ميكروفونات ذكية",
    price: 1399,
    original_price: 1699,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80"
    ],
    vendor: "شركة آفاق التقنية للتجارة",
    vendor_id: "modern-tech",
    vendor_rating: 4.95,
    vendor_verified: true,
    category: "الإلكترونيات والأجهزة الذكية",
    category_slug: "electronics",
    rating: 4.9,
    reviews: 2480,
    sales_count: "١,٥٤٠+ بيعت",
    badge: "الأكثر مبيعاً #1",
    delivery: "express",
    delivery_label: "شحن فوري خلال ٢٤ ساعة",
    description: "أحدث إصدار من سماعات سوني الرائدة بمعالج V1 المزدوج وتقنية إلغاء الضوضاء الرائدة عالمياً بميكروفونات 8-mic الدقيقة وميزة Speak-to-Chat والبطارية التي تدوم 30 ساعة.",
    specs: [
      { label: "عزل الضوضاء", value: "Active Noise Cancelling بمستشعرين" },
      { label: "عمر البطارية", value: "30 ساعة متواصلة مع شحن فائق السرعة" },
      { label: "الاتصال", value: "Bluetooth 5.2 مع Multipoint Pair" },
      { label: "الضمان", value: "سنتين ضمان الوكيل المعتمد في المملكة" }
    ],
    features: [
      "تقنية Auto NC Optimizer لضبط العزل الذاتي وفق المحيط",
      "صوت عالي الدقة Hi-Res Audio وميزة DSEE Extreme",
      "ميكروفونات مصفوفية للمكالمات الواضحة كريستالياً"
    ],
    stock_status: "in_stock",
    stock_qty: 45,
    is_active: true,
    moderation_status: "approved",
    is_featured: true,
    is_flash_deal: false
  },
  {
    id: "apple-watch-ultra-2",
    sku: "SQ-WAT-002",
    title: "ساعة أبل واتش ألترا 2 هيكل تيتانيوم مقاس 49 ملم مع حزام رياضي برتقالي",
    price: 3199,
    original_price: 3499,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
    ],
    vendor: "شركة آفاق التقنية للتجارة",
    vendor_id: "modern-tech",
    vendor_rating: 4.95,
    vendor_verified: true,
    category: "الإلكترونيات والأجهزة الذكية",
    category_slug: "electronics",
    rating: 4.95,
    reviews: 890,
    sales_count: "٨٩٠+ بيعت",
    badge: "مقتنى النخبة",
    delivery: "express",
    delivery_label: "شحن فوري مصفح VIP",
    description: "أقوى ساعات أبل على الإطلاق بهيكل التيتانيوم خفيف الوزن فائق المتانة وشاشة ساطعة تصل إلى 3000 شمعة مع معالج S9 SiP المتطور ومستشعرات دقيقة للمغامرات والرياضات المائية.",
    specs: [
      { label: "المقاس والخامة", value: "49 ملم تيتانيوم فضائي مقاوم للصدمات" },
      { label: "مقاومة الماء", value: "حتى عمق 100 متر (EN13319 للغوص)" },
      { label: "البطارية", value: "حتى 72 ساعة في وضع حفظ الطاقة" }
    ],
    features: [
      "نظام تحديد المواقع العالمي ثنائي التردد GPS دقيق",
      "زر الإجراءات القابل للتخصيص الفوري",
      "صفارة إنذار مدمجة 86 ديسيبل للاستغاثة"
    ],
    stock_status: "in_stock",
    stock_qty: 18,
    is_active: true,
    moderation_status: "approved",
    is_featured: true,
    is_flash_deal: false
  },
  {
    id: "ninja-dualzone-airfryer",
    sku: "SQ-KIT-014",
    title: "قلاية هوائية رقمية ذكية نينجا دوال زون سعة 9.5 لتر بحجرتين طهي مستقلتين",
    price: 799,
    original_price: 1099,
    image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&auto=format&fit=crop&q=80"
    ],
    vendor: "شركة آفاق التقنية للتجارة",
    vendor_id: "modern-tech",
    vendor_rating: 4.95,
    vendor_verified: true,
    category: "المنزل الذكي والمطبخ العصري",
    category_slug: "home-kitchen",
    rating: 4.9,
    reviews: 3120,
    sales_count: "٢,٤١٠+ بيعت",
    badge: "صفقة اليوم الخاطفة",
    delivery: "express",
    delivery_label: "توصيل خلال ٢٤ ساعة",
    description: "القلاية الهوائية الأولى في فئتها بخاصية DualZone لطهي وجبتين مختلفتين في آن واحد ببرنامجي طهي وتوقيتين مستقلين وميزة Smart Finish لإنهاء الطهي معاً في نفس الدقيقة.",
    specs: [
      { label: "السعة الإجمالية", value: "9.5 لتر (4.75 لتر لكل حجرة طهي)" },
      { label: "القدرة الكهربائية", value: "2470 واط متطابقة مع 220V SASO" },
      { label: "برامج الطهي", value: "6 برامج: Air Fry, Max Crisp, Roast, Bake, Reheat, Dehydrate" }
    ],
    features: [
      "ميزة Match Cook لنسخ الإعدادات بين الحجرتين بلمسة واحدة",
      "تقنية القرمشة الفائقة بدون زيوت لتقليل الدهون بنسبة 75%",
      "سلال غير لاصقة مطلية بالسيراميك آمنة في غسالة الأطباق"
    ],
    stock_status: "in_stock",
    stock_qty: 65,
    is_active: true,
    moderation_status: "approved",
    is_featured: true,
    is_flash_deal: true
  },
  {
    id: "stanley-quencher-tumbler-40oz",
    sku: "SQ-SPT-088",
    title: "كوب ستانلي كوينشر H2.0 الحراري العازل 40 أونصة مع ماصة من الفولاذ المقاوم للصدأ",
    price: 219,
    original_price: 289,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80"
    ],
    vendor: "شركة آفاق التقنية للتجارة",
    vendor_id: "modern-tech",
    vendor_rating: 4.95,
    vendor_verified: true,
    category: "اللياقة البدنية والأنشطة الخارجية",
    category_slug: "sports-fitness",
    rating: 4.9,
    reviews: 4210,
    sales_count: "٣,٨٠٠+ بيعت",
    badge: "الأكثر رواجاً في السوشيال",
    delivery: "standard",
    delivery_label: "توصيل سريع مجاني",
    description: "الكوب الحراري الأشهر عالمياً المصنوع من الفولاذ المعاد تدويره 18/8 الخالي من BPA بتقنية العزل المزدوج الفراغي ليحفظ برودة المشروبات والمثلجات لأكثر من 48 ساعة.",
    specs: [
      { label: "السعة", value: "40 أونصة (1.18 لتر)" },
      { label: "العزل الحراري", value: "11 ساعة للمشروبات الباردة، 48 ساعة للمثلجة" },
      { label: "الخامة", value: "فولاذ مقاوم للصدأ 18/8 بدرجة غذائية" }
    ],
    features: [
      "غطاء FlowState ثلاثي الوضعيات مع قفل يمنع الانسكاب",
      "قاعدة نحيفة تتناسب مع حاملات الأكواب في معظم السيارات",
      "مقبض مريح مع حواف ناعمة الملمس لسهولة الحمل"
    ],
    stock_status: "in_stock",
    stock_qty: 120,
    is_active: true,
    moderation_status: "approved",
    is_featured: false,
    is_flash_deal: false
  },
  {
    id: "dyson-airwrap-complete",
    sku: "SQ-BEA-102",
    title: "مصفف ومجفف شعر دايسون إير راب ملتي ستايلر كامل متعدد الرؤوس بتأثير كواندا",
    price: 2499,
    original_price: 2899,
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80"
    ],
    vendor: "شركة آفاق التقنية للتجارة",
    vendor_id: "modern-tech",
    vendor_rating: 4.95,
    vendor_verified: true,
    category: "الصحة والجمال والعناية الشخصية",
    category_slug: "beauty-care",
    rating: 4.9,
    reviews: 1840,
    sales_count: "١,٨٢٠+ بيعت",
    badge: "اختيار صالونات التجميل",
    delivery: "express",
    delivery_label: "شحن سريع مصفح مع تغليف هدايا VIP",
    description: "جهاز التصفيف الشامل لتجفيف وتمليس وتجعيد وتمويج الشعر بالهواء وتأثير كواندا الديناميكي دون تعريض الشعر لدرجات حرارة تالفة ومفرطة، مزود بـ 6 ملحقات متطورة.",
    specs: [
      { label: "المحرك الرقمي", value: "Dyson V9 يدور حتى 110,000 دورة/الدقيقة" },
      { label: "التحكم بالحرارة", value: "فحص ذكي للحرارة 40 مرة في الثانية" },
      { label: "الملحقات", value: "6 رؤوس متعددة مع علبة التخزين الجلدية الفاخرة" }
    ],
    features: [
      "تجعيد الشعر في كلا الاتجاهين بأسطوانة واحدة مدمجة",
      "تأثير كواندا المعزز لإخفاء الشعيرات المتطايرة بلمسة نهائية ملساء",
      "أيونات سالبة تمنع الشحنات الساكنة وتمنح الشعر لمعاناً صحياً"
    ],
    stock_status: "low_stock",
    stock_qty: 12,
    is_active: true,
    moderation_status: "approved",
    is_featured: true,
    is_flash_deal: false
  },
  {
    id: "anker-powerbank-737",
    sku: "SQ-MOB-204",
    title: "بطارية متنقلة أنكر باور بنك 737 سعة 24,000 مللي أمبير بقوة 140 واط مع شاشة ذكية",
    price: 479,
    original_price: 599,
    image: "https://images.unsplash.com/photo-1609081219094-979a04081e47?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1609081219094-979a04081e47?w=800&auto=format&fit=crop&q=80"
    ],
    vendor: "شركة آفاق التقنية للتجارة",
    vendor_id: "modern-tech",
    vendor_rating: 4.95,
    vendor_verified: true,
    category: "الهواتف الذكية وملحقاتها",
    category_slug: "mobiles",
    rating: 4.9,
    reviews: 2190,
    sales_count: "١,٦٨٠+ بيعت",
    badge: "شاحن الطاقة الأول",
    delivery: "standard",
    delivery_label: "شحن مجاني لكافة المدن",
    description: "أقوى بنك طاقة محمول يدعم تقنية Power Delivery 3.1 وشحن الحواسيب المحمولة ماك بوك برو والهواتف الذكية مع شاشة TFT ملونة تعرض الواط ومعدل الصحة اللحظي.",
    specs: [
      { label: "السعة", value: "24,000 مللي أمبير / 86.4 واط-ساعة" },
      { label: "أقصى قدرة إخراج", value: "140W عبر منفذ USB-C1 أو USB-C2" },
      { label: "المنافذ", value: "منفذين USB-C ومنفذ USB-A فائق السرعة" }
    ],
    features: [
      "شاشة رقمية ذكية ملونة تعرض طاقة الإدخال والإخراج المتبقية",
      "نظام الحماية ActiveShield 2.0 لمراقبة الحرارة ٣ ملايين مرة يومياً",
      "شحن سريع مزدوج للباور بنك نفسه خلال 52 دقيقة فقط"
    ],
    stock_status: "in_stock",
    stock_qty: 35,
    is_active: true,
    moderation_status: "approved",
    is_featured: false,
    is_flash_deal: false
  }
];

const reviews = [
  {
    product_id: "sony-wh1000xm5",
    author: "م. عبدالمجيد السبيعي",
    city: "الرياض",
    item: "سماعات رأس لاسلكية سوني WH-1000XM5",
    rating: 5,
    comment: "المنتج أصلي ١٠٠٪ بتغليف المصنع وسيريال الوكيل المعتمد مسجل. التوصيل في الرياض استغرق أقل من ١٨ ساعة وسعر البائع كان أفضل من المتاجر الكبرى.",
    verified: true,
    helpful_votes: 12
  },
  {
    product_id: "apple-watch-ultra-2",
    author: "د. هتون البراهيم",
    city: "جدة",
    item: "ساعة أبل واتش ألترا 2 هيكل تيتانيوم",
    rating: 5,
    comment: "جودة استثنائية وتعامل راقي من التاجر المعتمد. نظام الضمان Escrow منحني طمأنينة كاملة أثناء الدفع. الفاتورة الضريبية مشفرة برمز QR ومطابقة لزاتكا.",
    verified: true,
    helpful_votes: 18
  },
  {
    product_id: "ninja-dualzone-airfryer",
    author: "سلطان العتيبي",
    city: "الدمام",
    item: "قلاية هوائية رقمية ذكية نينجا دوال زون",
    rating: 5,
    comment: "ممتازة جداً ومريحة للغاية، الحجرتين سهلت إعداد الدجاج والبطاطس في نفس الوقت ووصلت خلال يومين عبر سمسا.",
    verified: true,
    helpful_votes: 9
  }
];

async function seed() {
  console.log("Upserting products...");
  const pRes = await fetch(url + '/rest/v1/products', {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(products)
  });
  console.log("Products status:", pRes.status, await pRes.text());

  console.log("Upserting reviews...");
  const rRes = await fetch(url + '/rest/v1/reviews', {
    method: 'POST',
    headers: {
      'apikey': key,
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reviews)
  });
  console.log("Reviews status:", rRes.status, await rRes.text());
}

seed();
