export const WEBSITE_TYPES = {
  COMPANY: "company",
  ECOMMERCE: "ecommerce",
};

export const DEFAULT_COMPANY_SECTIONS = [
  { id: "topbar", number: 1, title: "1.Top bar and menu", status: "Apparent", canReorder: false },
  { id: "hero", number: 2, title: "2.Hero Section", status: "Apparent", canReorder: false },
  { id: "stats", number: 3, title: "3.Statistics", status: "Apparent", canReorder: true },
  { id: "about", number: 4, title: "4.About Us", status: "Apparent", canReorder: true },
  { id: "services", number: 5, title: "5.Our Services", status: "Apparent", canReorder: true },
  { id: "cta", number: 6, title: "6.Call To Action", status: "Apparent", canReorder: true },
  { id: "faq", number: 7, title: "7.FAQ", status: "Apparent", canReorder: true },
  { id: "contact", number: 8, title: "8.Contact Us", status: "Apparent", canReorder: true },
  { id: "footer", number: 9, title: "9.Footer", status: "Apparent", canReorder: false },
];

export const DEFAULT_ECOMMERCE_SECTIONS = [
  { id: "topbar", number: 1, title: "1.Top bar and menu", status: "Apparent", canReorder: false },
  { id: "hero", number: 2, title: "2.Hero Banner", status: "Apparent", canReorder: false },
  { id: "categories", number: 3, title: "3.Categories Slider", status: "Apparent", canReorder: true },
  { id: "featured", number: 4, title: "4.Featured Products", status: "Apparent", canReorder: true },
  { id: "promo", number: 5, title: "5.Promo Banner", status: "Apparent", canReorder: true },
  { id: "popular", number: 6, title: "6.Most Popular Items", status: "Apparent", canReorder: true },
  { id: "services", number: 7, title: "7.Store Perks / Guarantees", status: "Apparent", canReorder: true },
  { id: "footer", number: 8, title: "8.Footer", status: "Apparent", canReorder: false },
];

export const FONT_OPTIONS = [
  { value: "inter", label: "Inter (Modern Sans)" },
  { value: "cairo", label: "Cairo (Arabic & English)" },
  { value: "roboto", label: "Roboto (Clean Standard)" },
  { value: "outfit", label: "Outfit (Geometric Display)" },
  { value: "plus-jakarta", label: "Plus Jakarta Sans" },
];

export const BUTTON_EDGES_OPTIONS = [
  { value: "rounded-xl", label: "Rounded (12px)" },
  { value: "rounded-full", label: "Pill / Full Rounded" },
  { value: "rounded-lg", label: "Soft Rounded (8px)" },
  { value: "rounded-none", label: "Sharp / Square (0px)" },
];

export const INITIAL_BUILDER_STATE = {
  type: WEBSITE_TYPES.COMPANY,
  info: {
    websiteName: "ONPOINT",
    businessName: "OnPoint General Trading & Contracting Co.",
    phoneNumber: "+965 452 5689",
    email: "support@onpoint.com",
    facebookLink: "https://facebook.com/onpoint",
    instagramLink: "https://instagram.com/onpoint",
    whatsappLink: "+9654525689",
    shortDescription: "We help ambitious businesses grow through smart strategy, creative design, and reliable digital solutions.",
  },
  identity: {
    logoUrl: "",
    primaryColor: "#0066d1",
    secondaryColor: "#131c2e",
    fontType: "inter",
    buttonEdges: "rounded-xl",
  },
  sections: DEFAULT_COMPANY_SECTIONS,
  subdomain: "onpoint",
};
