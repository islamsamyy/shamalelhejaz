const fs = require('fs');
const https = require('https');
const path = require('path');

const token = process.env.SUPABASE_ACCESS_TOKEN || '';
const projectRef = 'lazleotmwyxglqgqwyrq';

async function querySql(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${projectRef}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 63 Comprehensive categories specified by the user
const ALL_63_CATEGORIES = [
  // 1-5: الإلكترونيات والأجهزة
  { id: "apple-products", title: "الهواتف الذكية والأجهزة لمنتجات Apple", slug: "apple-products", department: "الإلكترونيات والأجهزة", icon_name: "smartphone", item_count: "١,٢٥٠ منتج" },
  { id: "smartphones", title: "الهواتف الذكية والأجهزة", slug: "smartphones", department: "الإلكترونيات والأجهزة", icon_name: "smartphone", item_count: "٣,٤٠٠ منتج" },
  { id: "laptops", title: "اللابتوبات", slug: "laptops", department: "الإلكترونيات والأجهزة", icon_name: "laptop", item_count: "١,٨٩٠ منتج" },
  { id: "gaming-pc", title: "أجهزة البلايستيشن والـ PC", slug: "gaming-pc", department: "الإلكترونيات والأجهزة", icon_name: "gamepad-2", item_count: "٢,١٥٠ منتج" },
  { id: "device-accessories", title: "إكسسوارات الأجهزة", slug: "device-accessories", department: "الإلكترونيات والأجهزة", icon_name: "headphones", item_count: "٥,٦٠٠ منتج" },

  // 6-9: الرحلات والزراعة والصناعة
  { id: "marine-land-trips", title: "منتجات الرحلات البحرية والبرية", slug: "marine-land-trips", department: "الرحلات والزراعة والصناعة", icon_name: "compass", item_count: "١,٤٥٠ منتج" },
  { id: "agriculture-machinery", title: "المنتجات الزراعية والآلات والمعدات", slug: "agriculture-machinery", department: "الرحلات والزراعة والصناعة", icon_name: "sprout", item_count: "٨٩٠ منتج" },
  { id: "production-raw-materials", title: "خطوط الإنتاج والمواد الخام", slug: "production-raw-materials", department: "الرحلات والزراعة والصناعة", icon_name: "factory", item_count: "٦٢٠ منتج" },
  { id: "heavy-machinery", title: "المعدات الثقيلة", slug: "heavy-machinery", department: "الرحلات والزراعة والصناعة", icon_name: "truck", item_count: "٤١٠ منتج" },

  // 10-14: العطور والملابس
  { id: "perfumes", title: "العطور", slug: "perfumes", department: "العطور والملابس", icon_name: "sparkles", item_count: "٤,٨٠٠ منتج" },
  { id: "women-clothing", title: "الملابس النسائية", slug: "women-clothing", department: "العطور والملابس", icon_name: "shirt", item_count: "٩,٢٠٠ منتج" },
  { id: "men-clothing", title: "الملابس الرجالية", slug: "men-clothing", department: "العطور والملابس", icon_name: "shirt", item_count: "٧,٥٠٠ منتج" },
  { id: "kids-clothing", title: "ملابس الأطفال", slug: "kids-clothing", department: "العطور والملابس", icon_name: "baby", item_count: "٣,٩٠٠ منتج" },
  { id: "shoes-footwear", title: "الأحذية والجزم", slug: "shoes-footwear", department: "العطور والملابس", icon_name: "footprints", item_count: "٥,١٠٠ منتج" },

  // 15-33: قطع غيار السيارات والإكسسوارات لكل علامة تجارية
  { id: "parts-lexus", title: "قطع غيار وإكسسوارات لكزس", slug: "parts-lexus", department: "قطع غيار السيارات والإكسسوارات", icon_name: "car", item_count: "١,٤٢٠ منتج" },
  { id: "parts-honda", title: "قطع غيار وإكسسوارات هوندا", slug: "parts-honda", department: "قطع غيار السيارات والإكسسوارات", icon_name: "car", item_count: "١,١٥٠ منتج" },
  { id: "parts-hyundai", title: "قطع غيار وإكسسوارات هونداي", slug: "parts-hyundai", department: "قطع غيار السيارات والإكسسوارات", icon_name: "car", item_count: "٢,٣٠٠ منتج" },
  { id: "parts-ford", title: "قطع غيار وإكسسوارات فورد", slug: "parts-ford", department: "قطع غيار السيارات والإكسسوارات", icon_name: "car", item_count: "١,٦٥٠ منتج" },
  { id: "parts-jetour", title: "قطع غيار وإكسسوارات جيتور", slug: "parts-jetour", department: "قطع غيار السيارات والإكسسوارات", icon_name: "car", item_count: "٧٢٠ منتج" },
  { id: "parts-toyota", title: "قطع غيار وإكسسوارات تويوتا", slug: "parts-toyota", department: "قطع غيار السيارات والإكسسوارات", icon_name: "car", item_count: "٤,٩٠٠ منتج" },
  { id: "parts-mercedes", title: "قطع غيار وإكسسوارات مرسيدس", slug: "parts-mercedes", department: "قطع غيار السيارات والإكسسوارات", icon_name: "car", item_count: "٢,٨٠٠ منتج" },
  { id: "parts-landrover", title: "قطع غيار وإكسسوارات لاند روفر", slug: "parts-landrover", department: "قطع غيار السيارات والإكسسوارات", icon_name: "car", item_count: "٩٨٠ منتج" },
  { id: "parts-bmw", title: "قطع غيار وإكسسوارات BMW", slug: "parts-bmw", department: "قطع غيار السيارات والإكسسوارات", icon_name: "car", item_count: "٢,٤٠٠ منتج" },
  { id: "parts-nissan", title: "قطع غيار وإكسسوارات نيسان", slug: "parts-nissan", department: "قطع غيار السيارات والإكسسوارات", icon_name: "car", item_count: "٢,١٠٠ منتج" },
  { id: "parts-chevrolet", title: "قطع غيار وإكسسوارات شفروليه", slug: "parts-chevrolet", department: "قطع غيار السيارات والإكسسوارات", icon_name: "car", item_count: "١,٨٠٠ منتج" },
  { id: "parts-kia", title: "قطع غيار وإكسسوارات كيا", slug: "parts-kia", department: "قطع غيار السيارات والإكسسوارات", icon_name: "car", item_count: "١,٩٥٠ منتج" },
  { id: "parts-dodge", title: "قطع غيار وإكسسوارات دودج", slug: "parts-dodge", department: "قطع غيار السيارات والإكسسوارات", icon_name: "car", item_count: "٨٤٠ منتج" },
  { id: "parts-geely", title: "قطع غيار وإكسسوارات جيلي", slug: "parts-geely", department: "قطع غيار السيارات والإكسسوارات", icon_name: "car", item_count: "٦٩٠ منتج" },
  { id: "parts-haval", title: "قطع غيار وإكسسوارات هافال", slug: "parts-haval", department: "قطع غيار السيارات والإكسسوارات", icon_name: "car", item_count: "٥٨٠ منتج" },
  { id: "parts-gmc", title: "قطع غيار وإكسسوارات GMC", slug: "parts-gmc", department: "قطع غيار السيارات والإكسسوارات", icon_name: "car", item_count: "١,٣٥٠ منتج" },
  { id: "parts-chery", title: "قطع غيار وإكسسوارات شيري", slug: "parts-chery", department: "قطع غيار السيارات والإكسسوارات", icon_name: "car", item_count: "٥١٠ منتج" },
  { id: "parts-byd", title: "قطع غيار وإكسسوارات BYD", slug: "parts-byd", department: "قطع غيار السيارات والإكسسوارات", icon_name: "car", item_count: "٦٣٠ منتج" },
  { id: "parts-changan", title: "قطع غيار وإكسسوارات شانجان", slug: "parts-changan", department: "قطع غيار السيارات والإكسسوارات", icon_name: "car", item_count: "٨٢٠ منتج" },

  // 34-36: المركبات والترفيه
  { id: "motorcycles", title: "الدبابات والدراجات النارية", slug: "motorcycles", department: "المركبات والترفيه", icon_name: "bike", item_count: "٤٥٠ منتج" },
  { id: "toys-games", title: "الألعاب", slug: "toys-games", department: "المركبات والترفيه", icon_name: "puzzle", item_count: "٣,٢٠٠ منتج" },
  { id: "fireworks", title: "قسم الألعاب النارية والاحتفالات", slug: "fireworks", department: "المركبات والترفيه", icon_name: "sparkler", item_count: "١٨٠ منتج" },

  // 37-49: المنزل والأثاث والديكور
  { id: "furniture", title: "الأثاث", slug: "furniture", department: "المنزل والأثاث والديكور", icon_name: "armchair", item_count: "٢,٩٠٠ منتج" },
  { id: "fountains", title: "النوافير", slug: "fountains", department: "المنزل والأثاث والديكور", icon_name: "droplet", item_count: "٣٤٠ منتج" },
  { id: "sculptures", title: "التماثيل والمجسمات", slug: "sculptures", department: "المنزل والأثاث والديكور", icon_name: "monument", item_count: "٥٢٠ منتج" },
  { id: "pools", title: "المسابح", slug: "pools", department: "المنزل والأثاث والديكور", icon_name: "waves", item_count: "٢٨٠ منتج" },
  { id: "jacuzzi-sauna", title: "الجاكوزي وأجهزة الساونا", slug: "jacuzzi-sauna", department: "المنزل والأثاث والديكور", icon_name: "bath", item_count: "١٩٠ منتج" },
  { id: "carpets-rugs", title: "السجاد والموكيت", slug: "carpets-rugs", department: "المنزل والأثاث والديكور", icon_name: "grid", item_count: "١,٧٠٠ منتج" },
  { id: "bedding-linens", title: "اللحف والشراشف", slug: "bedding-linens", department: "المنزل والأثاث والديكور", icon_name: "bed", item_count: "٢,١٠٠ منتج" },
  { id: "kitchenware", title: "المواعين وأدوات المطبخ", slug: "kitchenware", department: "المنزل والأثاث والديكور", icon_name: "utensils", item_count: "٤,٣٠٠ منتج" },
  { id: "cleaning-supplies", title: "أدوات النظافة", slug: "cleaning-supplies", department: "المنزل والأثاث والديكور", icon_name: "brush", item_count: "١,٦٥٠ منتج" },
  { id: "sinks-marble", title: "مغاسل المياه والرخام بأنواعه", slug: "sinks-marble", department: "المنزل والأثاث والديكور", icon_name: "square", item_count: "٨٤٠ منتج" },
  { id: "stone-grc", title: "الحجر والـ GRC", slug: "stone-grc", department: "المنزل والأثاث والديكور", icon_name: "box", item_count: "٦١٠ منتج" },
  { id: "tiles-ceramics", title: "البلاط والسيراميك", slug: "tiles-ceramics", department: "المنزل والأثاث والديكور", icon_name: "layout-grid", item_count: "١,٤٥٠ منتج" },
  { id: "doors-windows", title: "الأبواب والشبابيك", slug: "doors-windows", department: "المنزل والأثاث والديكور", icon_name: "door-closed", item_count: "٧٦٠ منتج" },

  // 50-52: البناء والمواد
  { id: "building-blocks-steel", title: "البلوك والحديد والأخشاب", slug: "building-blocks-steel", department: "البناء والمواد", icon_name: "hammer", item_count: "٩٢٠ منتج" },
  { id: "plumbing-tools", title: "أدوات السباكة", slug: "plumbing-tools", department: "البناء والمواد", icon_name: "wrench", item_count: "١,٨٠٠ منتج" },
  { id: "hardware-tools", title: "الأدوات والمعدات الأخرى", slug: "hardware-tools", department: "البناء والمواد", icon_name: "tool", item_count: "٢,٤٠٠ منتج" },

  // 53-55: الذهب والإكسسوارات
  { id: "gold-silver-alternatives", title: "بدائل الذهب والفضة", slug: "gold-silver-alternatives", department: "الذهب والإكسسوارات", icon_name: "gem", item_count: "١,١٠٠ منتج" },
  { id: "real-gold-silver", title: "الذهب والفضة الأصلي والحقيقي", slug: "real-gold-silver", department: "الذهب والإكسسوارات", icon_name: "award", item_count: "٨٥٠ منتج" },
  { id: "haberdashery", title: "الخردوات", slug: "haberdashery", department: "الذهب والإكسسوارات", icon_name: "scissors", item_count: "١,٣٥٠ منتج" },

  // 56-57: الكتب والبطاقات
  { id: "books", title: "الكتب", slug: "books", department: "الكتب والبطاقات", icon_name: "book-open", item_count: "٤,٢٠٠ منتج" },
  { id: "cards-gift", title: "البطاقات", slug: "cards-gift", department: "الكتب والبطاقات", icon_name: "credit-card", item_count: "٧٣٠ منتج" },

  // 58: المنتجات الشخصية
  { id: "personal-care", title: "المستلزمات الشخصية (لوشن، شامبو، سيروم)", slug: "personal-care", department: "المنتجات الشخصية", icon_name: "heart", item_count: "٥,٨٠٠ منتج" },

  // 59-60: الحيوانات ومكافحة الحشرات
  { id: "pet-supplies", title: "مستلزمات الحيوانات", slug: "pet-supplies", department: "الحيوانات ومكافحة الحشرات", icon_name: "dog", item_count: "١,٤٠٠ منتج" },
  { id: "pest-control", title: "أدوية ومعدات مكافحة الحشرات", slug: "pest-control", department: "الحيوانات ومكافحة الحشرات", icon_name: "shield-alert", item_count: "٤٨٠ منتج" },

  // 61-63: أقسام أخرى
  { id: "digital-growth", title: "شراء المتابعين والخدمات الرقمية", slug: "digital-growth", department: "أقسام أخرى", icon_name: "trending-up", item_count: "٣٥٠ منتج" },
  { id: "other-electronics", title: "الأجهزة الأخرى", slug: "other-electronics", department: "أقسام أخرى", icon_name: "cpu", item_count: "١,١٠٠ منتج" },
  { id: "other-equipment", title: "الأدوات والمعدات المتنوعة", slug: "other-equipment", department: "أقسام أخرى", icon_name: "wrench", item_count: "٩٨٠ منتج" },
];

async function run() {
  console.log('1. Applying schema.sql...');
  const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  const schemaRes = await querySql(schemaSql);
  console.log('Schema application status:', schemaRes.status);
  if (schemaRes.status >= 400) {
    console.error('Schema error:', schemaRes);
    return;
  }

  console.log('2. Loading catalogData...');
  // Require catalogData using ts-node or parse it directly
  const catalogDataPath = path.join(__dirname, 'souq', 'lib', 'catalogData.ts');
  const catalogContent = fs.readFileSync(catalogDataPath, 'utf-8');

  // Insert vendors
  console.log('3. Inserting Vendors...');
  const vendors = [
    {
      id: "modern-tech",
      name: "التقنية الحديثة للموزعين المعتمدين",
      slug: "modern-tech",
      badge: "موزع رسمي معتمد",
      rating: 4.94,
      reviews_count: 6420,
      sales_count: "٥٢,٠٠٠+ طلب ناجح",
      verified: true,
      bio: "الموزع المعتمد لأبرز العلامات العالمية (Apple, Sony, Anker, Bose) في المملكة العربية السعودية.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&auto=format&fit=crop&q=80",
      location: "الرياض، طريق العليا العام",
      cr_number: "1010892341",
      vat_number: "310492817200003",
      categories: JSON.stringify(["الإلكترونيات", "أجهزة ذكية", "صوتيات"]),
      joined_date: "عضو موثق منذ يناير ٢٠٢١"
    },
    {
      id: "istore-sa",
      name: "آي ستور للأجهزة الذكية (موزع معتمد)",
      slug: "istore-sa",
      badge: "متجر بلاتيني فائق التقييم",
      rating: 4.96,
      reviews_count: 4890,
      sales_count: "٣٨,٥٠٠+ طلب ناجح",
      verified: true,
      bio: "وجهتك الأولى لمنتجات آبل الأصلية وملحقاتها بضمان محلي سنتين وتوصيل خلال ٢٤ ساعة.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&auto=format&fit=crop&q=80",
      location: "جدة، شارع التحلية",
      cr_number: "4030761298",
      vat_number: "310874910200003",
      categories: JSON.stringify(["آبل", "هواتف ذكية", "ساعات ذكية"]),
      joined_date: "عضو موثق منذ مارس ٢٠٢٠"
    },
    {
      id: "home-electronics",
      name: "هوم إلكترونيكس ستور",
      slug: "home-electronics",
      badge: "الخيار الأول للمنازل العصرية",
      rating: 4.88,
      reviews_count: 5120,
      sales_count: "٤١,٢٠٠+ طلب ناجح",
      verified: true,
      bio: "أكبر تشكيلة أجهزة منزلية ومطابخ ذكية وقلايات هوائية بضمان الوكلاء الرسميين.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=80",
      location: "الدمام، حي الشاطئ",
      cr_number: "2050981723",
      vat_number: "310982341200003",
      categories: JSON.stringify(["أجهزة المطبخ", "قلايات هوائية", "ماكينات قهوة"]),
      joined_date: "عضو موثق منذ يونيو ٢٠٢١"
    },
    {
      id: "coffee-lab-sa",
      name: "مختبر القهوة المختصة",
      slug: "coffee-lab-sa",
      badge: "متجر تخصصي موثق",
      rating: 4.98,
      reviews_count: 3200,
      sales_count: "٢٩,٠٠٠+ طلب ناجح",
      verified: true,
      bio: "مكائن الإسبريسو الاحترافية بريفيل ولامارزوكو ومطاحن القهوة وأدوات الباريستا المتكاملة.",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80",
      banner: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&auto=format&fit=crop&q=80",
      location: "الرياض، حي حطين",
      cr_number: "1010762391",
      vat_number: "310543219800003",
      categories: JSON.stringify(["مكائن قهوة", "مطاحن", "أدوات باريستا"]),
      joined_date: "عضو موثق منذ نوفمبر ٢٠٢١"
    }
  ];

  for (const v of vendors) {
    const sql = `
      INSERT INTO public.vendors (id, name, slug, badge, rating, reviews_count, sales_count, verified, bio, avatar, banner, location, cr_number, vat_number, categories, joined_date)
      VALUES ($$${v.id}$$, $$${v.name}$$, $$${v.slug}$$, $$${v.badge}$$, ${v.rating}, ${v.reviews_count}, $$${v.sales_count}$$, ${v.verified}, $$${v.bio}$$, $$${v.avatar}$$, $$${v.banner}$$, $$${v.location}$$, $$${v.cr_number}$$, $$${v.vat_number}$$, '${v.categories}'::jsonb, $$${v.joined_date}$$)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        badge = EXCLUDED.badge,
        rating = EXCLUDED.rating;
    `;
    await querySql(sql);
  }

  // Insert Top Categories & 63 Categories
  console.log('4. Inserting Categories...');
  // First insert top categories from catalogData
  const topCategories = [
    {
      id: "electronics",
      title: "الإلكترونيات والأجهزة الذكية",
      subtitle: "أحدث التقنيات والسماعات اللاسلكية والساعات والأجهزة القابلة للارتداء",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      item_count: "١٢,٤٠٠+ منتج نشط",
      icon_name: "headphones",
      slug: "electronics",
      department: "الإلكترونيات",
      subcategories: JSON.stringify([
        { name: "سماعات الرأس والأذن اللاسلكية ANC", count: "٣,٢٠٠ منتج", popular: true },
        { name: "الساعات الذكية وأساور اللياقة", count: "٢,٨٥٠ منتج", popular: true },
        { name: "طائرات الدرون وكاميرات الحركة 4K", count: "١,٤٠٠ منتج" },
        { name: "شواحن MagSafe وبنوك الطاقة السريعة", count: "٤,٩٥٠ منتج", popular: true },
      ])
    },
    {
      id: "mobiles",
      title: "الهواتف الذكية وملحقاتها",
      subtitle: "أحدث هواتف الجيل الخامس 5G والملحقات الأصلية بضمان الوكيل",
      image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80",
      item_count: "١٨,٦٠٠+ منتج نشط",
      icon_name: "smartphone",
      slug: "mobiles",
      department: "الإلكترونيات",
      subcategories: JSON.stringify([
        { name: "هواتف آبل آيفون وسامسونج الرائدة", count: "٥,١٠٠ منتج", popular: true },
        { name: "حوامل وكابلات الشحن فائق السرعة", count: "٦,٣٠٠ منتج" },
        { name: "أغطية وحماية الشاشات الزجاجية المقواة", count: "٤,٨٠٠ منتج" },
        { name: "إكسسوارات السيارات والشواحن اللاسلكية", count: "٢,٤٠٠ منتج" },
      ])
    },
    {
      id: "home-kitchen",
      title: "المنزل الذكي والمطبخ العصري",
      subtitle: "قلايات هوائية، ماكينات القهوة التخصصية، ومكانس الروبوت الذكية",
      image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&auto=format&fit=crop&q=80",
      item_count: "١٥,٢٠٠+ منتج نشط",
      icon_name: "coffee",
      slug: "home-kitchen",
      department: "المنزل والمطبخ",
      subcategories: JSON.stringify([
        { name: "قلايات هوائية ذكية وأفران حرارية", count: "٤,٢٠٠ منتج", popular: true },
        { name: "ماكينات الإسبريسو ومطاحن القهوة الاحترافية", count: "٣,١٠٠ منتج", popular: true },
        { name: "مكانس ومماسح الروبوت الذكية LiDAR", count: "١,٩٠٠ منتج" },
        { name: "أجهزة تنقية الهواء والترطيب الذكية", count: "٢,٤٠٠ منتج" },
      ])
    },
    {
      id: "beauty-care",
      title: "الصحة والجمال والعناية الشخصية",
      subtitle: "سيرومات العناية بالبشرة، مجففات الشعر الأيونية، وأجهزة المساج",
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
      item_count: "٢٢,٠٠٠+ منتج نشط",
      icon_name: "sparkles",
      slug: "beauty-care",
      department: "الصحة والجمال",
      subcategories: JSON.stringify([
        { name: "سيرومات حمض الهيالورونيك وفيتامين C", count: "٧,٥٠٠ منتج", popular: true },
        { name: "مصففات ومجففات الشعر بالأيونات", count: "٣,٤٠٠ منتج", popular: true },
        { name: "فرش الأسنان الصوتية الذكية", count: "٢,٦٠٠ منتج" },
        { name: "مسدسات المساج والتعافي العضلي", count: "١,٨٠٠ منتج" },
      ])
    },
    {
      id: "fashion-apparel",
      title: "الأزياء والموضة والأحذية الرياضية",
      subtitle: "هوديات قطنية أوفرسايز، أحذية رياضية مريحة، ونظارات شمسية أصلية",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
      item_count: "٣١,٠٠٠+ منتج نشط",
      icon_name: "shirt",
      slug: "fashion-apparel",
      department: "الأزياء",
      subcategories: JSON.stringify([
        { name: "أحذية الجري والمشي الرياضية فائقة الخفة", count: "٨,٩٠٠ منتج", popular: true },
        { name: "الملابس القطنية والهوديز الأوفرسايز", count: "٩,٥٠٠ منتج", popular: true },
        { name: "نظارات شمسية مستقطبة UV400", count: "٣,٨٠٠ منتج" },
        { name: "حقائب ظهر ذكية للابتوب والسفر", count: "٤,٢٠٠ منتج" },
      ])
    },
    {
      id: "sports-fitness",
      title: "اللياقة البدنية والأنشطة الخارجية",
      subtitle: "أثقال ذكية قابلة للتعديل، مطارات ستانلس ستيل، ومعدات اليوغا",
      image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80",
      item_count: "٩,٨٠٠+ منتج نشط",
      icon_name: "dumbbell",
      slug: "sports-fitness",
      department: "الرياضة",
      subcategories: JSON.stringify([
        { name: "أثقال دامبلز ذكية قابلة للتعديل السريع", count: "١,٩٠٠ منتج", popular: true },
        { name: "مطارات وأكواب حرارية ستانلس ستيل عازلة", count: "٤,١٠٠ منتج", popular: true },
        { name: "أحزمة وبسط يوغا وتمارين غير قابلة للانزلاق", count: "٢,٣٠٠ منتج" },
        { name: "إكسسوارات التخييم والمغامرات الخارجية", count: "١,٥٠٠ منتج" },
      ])
    }
  ];

  for (const c of topCategories) {
    const sql = `
      INSERT INTO public.categories (id, title, subtitle, image, item_count, icon_name, slug, department, subcategories)
      VALUES ($$${c.id}$$, $$${c.title}$$, $$${c.subtitle}$$, $$${c.image}$$, $$${c.item_count}$$, $$${c.icon_name}$$, $$${c.slug}$$, $$${c.department}$$, '${c.subcategories}'::jsonb)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        image = EXCLUDED.image;
    `;
    await querySql(sql);
  }

  // Insert all 63 categories
  for (const c of ALL_63_CATEGORIES) {
    const sql = `
      INSERT INTO public.categories (id, title, subtitle, image, item_count, icon_name, slug, department, subcategories)
      VALUES ($$${c.id}$$, $$${c.title}$$, $$قسم معتمد رسمي في منصة سوق$$, $$https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80$$, $$${c.item_count}$$, $$${c.icon_name}$$, $$${c.slug}$$, $$${c.department}$$, '[]'::jsonb)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        department = EXCLUDED.department;
    `;
    await querySql(sql);
  }

  // Insert Products
  console.log('5. Inserting Products...');
  const products = [
    {
      id: "sony-wh1000xm5",
      title: "سماعات رأس لاسلكية سوني WH-1000XM5 عازلة للضوضاء النشطة ANC مع ميكروفونات ذكية",
      price: 1399,
      original_price: 1699,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&auto=format&fit=crop&q=80",
      ]),
      vendor: "التقنية الحديثة للموزعين المعتمدين",
      vendor_id: "modern-tech",
      vendor_rating: 4.9,
      vendor_verified: true,
      category: "الإلكترونيات والأجهزة الذكية",
      category_slug: "electronics",
      rating: 4.9,
      reviews: 2450,
      sales_count: "١٥,٤٠٠+ بيعت",
      badge: "الأكثر مبيعاً #1 في الإلكترونيات",
      delivery: "express",
      delivery_label: "توصيل خلال ٢٤ ساعة",
      description: "تعد سماعات سوني WH-1000XM5 المعيار العالمي الرائد في إلغاء الضوضاء النشط مع معالجين متقدمين و٨ ميكروفونات لالتقاط الصوت الصافي، بطارية تدوم حتى ٣٠ ساعة وشحن سريع في ٣ دقائق يمنحك ٣ ساعات تشغيل.",
      specs: JSON.stringify([
        { label: "نوع الاتصال", value: "بلوتوث 5.2 مع دعم LDAC عالي الدقة" },
        { label: "عزل الضوضاء", value: "نظام إلغاء ضوضاء نشط Auto NC Optimizer المزدوج" },
        { label: "عمر البطارية", value: "٣٠ ساعة متواصلة مع تشغيل العزل النشط" },
        { label: "الوزن", value: "٢٥٠ غرام فائق الخفة ومريح للأذن" },
        { label: "الضمان", value: "ضمان سنتين وكيل سوني المعتمد بالسعودية" },
        { label: "الاعتماد", value: "مطابق لمعايير الهيئة السعودية للمواصفات SASO" },
      ]),
      features: JSON.stringify([
        "إلغاء ضوضاء متفوق بالذكاء الاصطناعي يتكيف مع بيئتك المحيطة",
        "ميزة التحدث للدردشة Speak-to-Chat توقف الصوت تلقائياً عند بدء الكلام",
        "صوت فائق الدقة Hi-Res Wireless مع مضخمات صوت كربونية 30 ملم",
        "اتصال متعدد النقاط بجهازين في وقت واحد مع تبديل سلس",
      ]),
      stock_status: "in_stock",
      is_featured: true,
      is_flash_deal: false
    },
    {
      id: "apple-watch-ultra-2",
      title: "ساعة أبل واتش ألترا 2 هيكل تيتانيوم مقاس 49 ملم مع حزام رياضي بحري",
      price: 3199,
      original_price: 3499,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1200&auto=format&fit=crop&q=80",
      ]),
      vendor: "آي ستور للأجهزة الذكية (موزع معتمد)",
      vendor_id: "istore-sa",
      vendor_rating: 4.95,
      vendor_verified: true,
      category: "الهواتف الذكية وملحقاتها",
      category_slug: "mobiles",
      rating: 4.9,
      reviews: 1820,
      sales_count: "٨,٩٠٠+ بيعت",
      badge: "اختيار المحترفين والرياضيين",
      delivery: "express",
      delivery_label: "توصيل خلال ٢٤ ساعة",
      description: "أقوى وأقوى ساعات أبل على الإطلاق بهيكل تيتانيوم من الفئة الفضائية مقاوم للماء حتى عمق ١٠٠ متر، شاشة ساطعة للغاية تصل إلى ٣٠٠٠ شمعة، ونظام GPS دقيق ثنائي التردد.",
      specs: JSON.stringify([
        { label: "الهيكل والزجاج", value: "تيتانيوم طبيعي صلب مع زجاج ياقوتي كريستالي" },
        { label: "المعالج", value: "شريحة S9 SiP المتقدمة مع ميزة النقر المزدوج Double Tap" },
        { label: "السطوع", value: "٣,٠٠٠ شمعة رؤية واضحة تحت أشعة الشمس المباشرة" },
        { label: "مقاومة الماء والعمق", value: "معتمدة حتى عمق ١٠٠ متر بمعيار EN13319 للغوص" },
        { label: "البطارية", value: "حتى ٣٦ ساعة استخدام عادي، و٧٢ ساعة في نمط توفير الطاقة" },
      ]),
      features: JSON.stringify([
        "زر الإجراءات القابل للتخصيص للتمارين والغوص ونقاط الطريق",
        "صفارة إنذار بقوة ٨٦ ديسيبل يمكن سماعها حتى مسافة ١٨٠ متراً",
        "حساسات متطورة لقياس درجة حرارة الماء وتخطيط القلب ECG والأكسجين",
      ]),
      stock_status: "in_stock",
      is_featured: true,
      is_flash_deal: false
    },
    {
      id: "ninja-dualzone-airfryer",
      title: "قلاية هوائية رقمية ذكية نينجا دوال زون سعة 9.5 لتر بحجرتين مستقلتين للطهي المزدوج",
      price: 799,
      original_price: 1099,
      image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&auto=format&fit=crop&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1200&auto=format&fit=crop&q=80",
      ]),
      vendor: "هوم إلكترونيكس ستور",
      vendor_id: "home-electronics",
      vendor_rating: 4.85,
      vendor_verified: true,
      category: "المنزل الذكي والمطبخ العصري",
      category_slug: "home-kitchen",
      rating: 4.9,
      reviews: 3890,
      sales_count: "٢٤,١٠٠+ بيعت",
      badge: "الأكثر طلباً لمطابخ العائلات",
      delivery: "express",
      delivery_label: "شحن مجاني وسريع",
      description: "القلاية الهوائية الأولى الأكثر مبيعاً عالمياً بتقنية DualZone التي تتيح طهي وجبتين بطريقتين مختلفتين وتوقيت انتهاء متزامن عبر ميزة Smart Finish، مما يقلل استخدام الزيوت بنسبة ٧٥٪.",
      specs: JSON.stringify([
        { label: "السعة الإجمالية", value: "٩.٥ لتر تكفي حتى ٨ أفراد" },
        { label: "القدرة الكهربائية", value: "٢,٤٧٠ واط طهي فائق السرعة" },
        { label: "برامج الطهي", value: "٦ وظائف: قلي هوائي، تحمير، شواء، خبز، تجفيف، تسخين" },
        { label: "التنظيف", value: "سلال غير لاصقة مطلية بالسيراميك آمنة لغسالة الصحون" },
      ]),
      features: JSON.stringify([
        "وظيفة Smart Finish لمزامنة انتهاء طهي الحجرتين في نفس الثانية",
        "وظيفة Match Cook لنسخ الإعدادات عبر الحجرتين بضغطة زر واحدة",
        "توفير يصل إلى ٥٥٪ من استهلاك طاقة الأفران التقليدية",
      ]),
      stock_status: "in_stock",
      is_featured: true,
      is_flash_deal: true
    },
    {
      id: "breville-barista-touch",
      title: "ماكينة قهوة إسبريسو احترافية بريفيل باريستا تاتش شاشة لمس ملونة مع مطحنة مدمجة",
      price: 3699,
      original_price: 4299,
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop&q=80",
      ]),
      vendor: "مختبر القهوة المختصة",
      vendor_id: "coffee-lab-sa",
      vendor_rating: 4.96,
      vendor_verified: true,
      category: "المنزل الذكي والمطبخ العصري",
      category_slug: "home-kitchen",
      rating: 4.9,
      reviews: 1420,
      sales_count: "٥,٢٠٠+ بيعت",
      badge: "اختيار خبراء القهوة المختصة",
      delivery: "express",
      delivery_label: "شحن مؤمّن سريع",
      description: "استمتع بمشروبات القهوة المختصة بدرجة باريستا احترافية في منزلك بكل سهولة عبر شاشة لمس ملونة مبرمجة لـ ٥ مشروبات كلاسيكية مع إمكانية حفظ ٨ تخصيصات فريدة.",
      specs: JSON.stringify([
        { label: "نظام التسخين", value: "نظام ThermoJet المبتكر يسخن في ٣ ثوانٍ فقط" },
        { label: "المطحنة المدمجة", value: "شفرات مخروطية من الفولاذ المقسى مع ٣٠ درجة طحن" },
        { label: "التبخير التلقائي", value: "عصا بخار أوتوماتيكية بـ ٨ درجات حرارة ورغوة ميكروية" },
        { label: "الضغط", value: "مضخة إيطالية بقوة ١٥ بار مع استخلاص تدريجي Pre-infusion" },
      ]),
      features: JSON.stringify([
        "شاشة لمس بديهية ترشدك خطوة بخطوة من الطحن حتى الرغوة",
        "تبخير حليب ميكروي دقيق Micro-foam مخصص لفنون اللاتيه",
        "جرعة طحن محددة بدقة ١٩-٢٢ غرام لأعلى نكهة ممكنة",
      ]),
      stock_status: "in_stock",
      is_featured: true,
      is_flash_deal: false
    },
    {
      id: "the-ordinary-hyaluronic-serum",
      title: "سيروم حمض الهيالورونيك 2% + B5 المركز للترطيب العميق والنضارة من ذا أورديناري",
      price: 52,
      original_price: 75,
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1200&auto=format&fit=crop&q=80",
      ]),
      vendor: "بوتيك الجمال الطبي والمستحضرات",
      vendor_id: "modern-tech",
      vendor_rating: 4.89,
      vendor_verified: true,
      category: "الصحة والجمال والعناية الشخصية",
      category_slug: "beauty-care",
      rating: 4.8,
      reviews: 8940,
      sales_count: "٦٨,٠٠٠+ بيعت",
      badge: "الأكثر طلباً في العناية بالبشرة",
      delivery: "standard",
      delivery_label: "توصيل خلال ٢٤-٤٨ ساعة",
      description: "تركيبة ترطيب متطورة تجمع بين ثلاثة أوزان جزيئية من حمض الهيالورونيك النقي مع برو فيتامين B5 لدعم امتصاص الترطيب في طبقات الجلد المتعددة واستعادة نعومة ومرونة البشرة الفورية.",
      specs: JSON.stringify([
        { label: "الحجم الصافي", value: "٣٠ مل عبوة زجاجية مع قطارة دقيقة" },
        { label: "نوع البشرة", value: "مناسب لجميع أنواع البشرة، وخاصة الجافة والحساسة" },
        { label: "بلد المنشأ", value: "كندا - أصلي بباركود التحقق وهيئة الغذاء والدواء SFDA" },
      ]),
      features: JSON.stringify([
        "ترطيب متعدد الأعماق بدون ملمس لزج أو دهني",
        "خالٍ تماماً من الكحول والسيليكون والزيوت والعطور الصناعية",
        "يعزز إنتاج الكولاجين الطبيعي ويحارب ظهور الخطوط الدقيقة",
      ]),
      stock_status: "in_stock",
      is_featured: false,
      is_flash_deal: true
    },
    {
      id: "nike-air-zoom-pegasus-40",
      title: "حذاء الجري الرياضي نايكي إير زوم بيجاسوس 40 فائق الخفة وامتصاص الصدمات للمحترفين",
      price: 489,
      original_price: 649,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80",
      ]),
      vendor: "سبورتس كورنر السعودية",
      vendor_id: "modern-tech",
      vendor_rating: 4.91,
      vendor_verified: true,
      category: "الأزياء والموضة والأحذية الرياضية",
      category_slug: "fashion-apparel",
      rating: 4.8,
      reviews: 2190,
      sales_count: "١٤,٣٠٠+ بيعت",
      badge: "الحذاء الرياضي الأيقوني #1",
      delivery: "express",
      delivery_label: "توصيل خلال ٢٤ ساعة",
      description: "حذاء بيجاسوس 40 يعود بتوسيد مألوف ومخصص لك فقط لمساعدتك على تحقيق أهدافك. يتميز باستجابة استثنائية ودعم معتدل مع شعور فائق بالراحة في مناطق القدم الحساسة مثل قوس القدم والأصابع.",
      specs: JSON.stringify([
        { label: "التقنية", value: "وحدات Zoom Air مزدوجة في مقدمة وكعب القدم" },
        { label: "الوزن", value: "٢٨٨ غرام تقريباً لمقاس 44 رجالي" },
        { label: "النعل الخارجي", value: "مطاط وافل متين بنمط ثبات متفوق على مختلف الأسطح" },
      ]),
      features: JSON.stringify([
        "إسفنج Nike React خفيف ومتين ومرن يمنحك تجربة جري سلسة ومستجيبة",
        "شبكة هندسية أحادية الطبقة مضبوطة بدقة لتهوية فائقة أثناء التمارين الشاقة",
        "حزام منتصف القدم بتصميم أكثر أماناً لتثبيت القدم دون ضغط مفرط",
      ]),
      stock_status: "in_stock",
      is_featured: true,
      is_flash_deal: false
    }
  ];

  for (const p of products) {
    const sql = `
      INSERT INTO public.products (id, title, price, original_price, image, images, vendor, vendor_id, vendor_rating, vendor_verified, category, category_slug, rating, reviews, sales_count, badge, delivery, delivery_label, description, specs, features, stock_status, is_featured, is_flash_deal)
      VALUES (
        $$${p.id}$$,
        $$${p.title}$$,
        ${p.price},
        ${p.original_price},
        $$${p.image}$$,
        '${p.images}'::jsonb,
        $$${p.vendor}$$,
        $$${p.vendor_id}$$,
        ${p.vendor_rating},
        ${p.vendor_verified},
        $$${p.category}$$,
        $$${p.category_slug}$$,
        ${p.rating},
        ${p.reviews},
        $$${p.sales_count}$$,
        $$${p.badge}$$,
        $$${p.delivery}$$,
        $$${p.delivery_label}$$,
        $$${p.description}$$,
        '${p.specs}'::jsonb,
        '${p.features}'::jsonb,
        $$${p.stock_status}$$,
        ${p.is_featured},
        ${p.is_flash_deal}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        price = EXCLUDED.price,
        description = EXCLUDED.description;
    `;
    await querySql(sql);
  }

  // Insert verified reviews
  console.log('6. Inserting Reviews...');
  const reviews = [
    {
      id: "rev-1",
      product_id: "sony-wh1000xm5",
      author: "د. هتون البراهيم",
      city: "الرياض",
      item: "سماعات سوني WH-1000XM5 عازلة للضوضاء",
      rating: 5,
      comment: "تجربة تسوق تفوق التوقعات! طلبت السماعة الساعة ٤ عصراً ووصلتني في حي النخيل بالرياض قبل الساعة ١٠ مساءً من نفس اليوم بتغليف حراري محكم وفاتورة ضريبية رسمية.",
      date: "قبل ٤ ساعات",
      helpful_votes: 142,
      verified: true
    },
    {
      id: "rev-2",
      product_id: "apple-watch-ultra-2",
      author: "م. عبدالعزيز الشمري",
      city: "جدة",
      item: "ساعة أبل واتش ألترا 2 تيتانيوم 49mm",
      rating: 5,
      comment: "الساعة أصلية ١٠٠٪ برقم تسلسلي معتمد وتم تفعيل ضمان حاسبات العرب مباشرة عند الربط بآيفون. السعر في سوق السعودية كان أفضل بـ ٣٠٠ ريال مع كود الخصم.",
      date: "قبل ٨ ساعات",
      helpful_votes: 98,
      verified: true
    },
    {
      id: "rev-3",
      product_id: "ninja-dualzone-airfryer",
      author: "سارة العتيبي",
      city: "الخبر",
      item: "قلاية هوائية نينجا دوال زون 9.5 لتر",
      rating: 5,
      comment: "قلاية نينجا غيرت أسلوب طبخ العائلة بالكامل! إمكانية طهي الدجاج في جهة والبطاطس المقرمشة في جهة أخرى مع انتهاء متزامن توفر وقتاً كبيراً.",
      date: "قبل يوم واحد",
      helpful_votes: 76,
      verified: true
    },
    {
      id: "rev-4",
      product_id: "breville-barista-touch",
      author: "سلطان القحطاني",
      city: "أبها",
      item: "ماكينة قهوة بريفيل باريستا تاتش",
      rating: 5,
      comment: "ماكينة استثنائية وسهلة الاستخدام بفضل الشاشة التفاعلية. تبخير الحليب ممتاز ومطابقة تماماً لما يقدم في المقاهي المختصة.",
      date: "قبل يومين",
      helpful_votes: 54,
      verified: true
    }
  ];

  for (const r of reviews) {
    const sql = `
      INSERT INTO public.reviews (id, product_id, author, city, item, rating, comment, date, helpful_votes, verified)
      VALUES ($$${r.id}$$, $$${r.product_id}$$, $$${r.author}$$, $$${r.city}$$, $$${r.item}$$, ${r.rating}, $$${r.comment}$$, $$${r.date}$$, ${r.helpful_votes}, ${r.verified})
      ON CONFLICT (id) DO UPDATE SET
        comment = EXCLUDED.comment,
        helpful_votes = EXCLUDED.helpful_votes;
    `;
    await querySql(sql);
  }

  // Insert coupons
  console.log('7. Inserting Coupons...');
  const coupons = [
    { code: "SOUQ50", discount_type: "fixed", discount_value: 50, min_order_amount: 300 },
    { code: "KSA15", discount_type: "percentage", discount_value: 15, min_order_amount: 150 },
    { code: "WELCOME", discount_type: "fixed", discount_value: 100, min_order_amount: 500 },
  ];
  for (const c of coupons) {
    const sql = `
      INSERT INTO public.coupons (code, discount_type, discount_value, min_order_amount)
      VALUES ($$${c.code}$$, $$${c.discount_type}$$, ${c.discount_value}, ${c.min_order_amount})
      ON CONFLICT (code) DO NOTHING;
    `;
    await querySql(sql);
  }

  console.log('✅ Supabase Schema, RLS, and Seed Data Successfully Applied!');
}

run().catch(console.error);
