/**
 * ثوابت نظام التسجيل - مستخرجة مباشرةً من ملفات Register_Swagger_All_Countries
 * الدول الثلاث × الأنشطة الثمانية = 24 سيناريو تسجيل مدعوم
 */

// ===================================================
// الدول المدعومة - القيم مطابقة 100% لملفات الـ JSON
// Kuwait  → country: "kuwait"  | baseCurrency: KWD
// Qatar   → country: "qatar"   | baseCurrency: QAR
// UAE     → country: "uae"     | baseCurrency: AED
// ===================================================
export const COUNTRIES = [
  {
    code: "kuwait",                         // يُرسَل مباشرةً في حقل "country" بالـ API
    name: "الكويت",
    nameEn: "Kuwait",
    flag: "🇰🇼",
    baseCurrencyCode: "KWD",               // يُستخدم في initializeSettings.baseCurrencyCode
    currencyName: "دينار كويتي (KWD)",
    selectedCurrencyCodes: ["KWD", "USD"], // يُستخدم في initializeSettings.selectedCurrencyCodes
  },
  {
    code: "qatar",                          // ✅ مطابق لـ Register_QAT_*.json → "country": "qatar"
    name: "قطر",
    nameEn: "Qatar",
    flag: "🇶🇦",
    baseCurrencyCode: "QAR",
    currencyName: "ريال قطري (QAR)",
    selectedCurrencyCodes: ["QAR", "USD"],
  },
  {
    code: "uae",                            // مطابق لـ Register_UAE_*.json → "country": "uae"
    name: "الإمارات",
    nameEn: "UAE",
    flag: "🇦🇪",
    baseCurrencyCode: "AED",
    currencyName: "درهم إماراتي (AED)",
    selectedCurrencyCodes: ["AED", "USD"],
  },
];

// ===================================================
// أنواع الأنشطة الثمانية - مطابقة لحقل "businessType"
// في ملفات الـ JSON ولـ Schema الـ API
// ===================================================
export const BUSINESS_TYPES = [
  {
    id: "general",       // ← Register_*_General.json → "businessType": "general"
    title: "تجاري عام / شركات",
    titleEn: "General Business",
    description: "إدارة شاملة للشركات والعمليات التجارية والتوريد",
    iconName: "Building2",
    badge: "الأكثر شمولاً",
  },
  {
    id: "retail",        // ← Register_*_Retail.json → "businessType": "retail"
    title: "تجارة وتجزئة",
    titleEn: "Retail & POS",
    description: "نقاط البيع، المتاجر، وإدارة المخزون والمبيعات",
    iconName: "ShoppingBag",
    badge: "نقاط بيع",
  },
  {
    id: "service",       // ← Register_*_Service.json → "businessType": "service"
    title: "خدمات واستشارات",
    titleEn: "Services & Consulting",
    description: "الشركات المهنية، الاستشارية، وتتبع المشاريع",
    iconName: "Briefcase",
    badge: "خدمات",
  },
  {
    id: "manufacturing", // ← Register_*_Manufacturing.json → "businessType": "manufacturing"
    title: "تصنيع وإنتاج",
    titleEn: "Manufacturing",
    description: "أوامر الإنتاج، خطوط التصنيع، وحساب تكاليف المواد",
    iconName: "Factory",
    badge: "صناعي",
  },
  {
    id: "restaurant",    // ← Register_*_Restaurant.json → "businessType": "restaurant"
    title: "مطاعم وكافيهات",
    titleEn: "Restaurants & Cafes",
    description: "إدارة الطاولات، صالات الطعام، شاشات المطبخ، والوجبات",
    iconName: "Utensils",
    badge: "ضيافة ومطاعم",
  },
  {
    id: "clinics",       // ← Register_*_Clinics.json → "businessType": "clinics"
    title: "عيادات ومراكز طبية",
    titleEn: "Clinics & Medical",
    description: "ملفات المرضى، جدول المواعيد، والأطباء والتأمين",
    iconName: "Stethoscope",
    badge: "طبي",
  },
  {
    id: "hotels",        // ← Register_*_Hotels.json → "businessType": "hotels"
    title: "فنادق ومنتجعات",
    titleEn: "Hotels & Hospitality",
    description: "إدارة الغرف، حركات التسكين والمغادرة، ونزلاء الفندق",
    iconName: "Hotel",
    badge: "فنادق وإقامة",
  },
  {
    id: "spa-salon",     // ← Register_*_SpaSalon.json → "businessType": "spa-salon"
    title: "صالونات وسبا",
    titleEn: "Spa & Salon",
    description: "خدمات التجميل، حجز المواعيد، والمنتجات والمتخصصين",
    iconName: "Sparkles",
    badge: "عناية وسبا",
  },
];
