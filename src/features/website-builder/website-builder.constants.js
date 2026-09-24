export const WEBSITE_TYPES = {
  COMPANY: "company",
  ECOMMERCE: "ecommerce",
};

export const COMPANY_STEPS = [
  { number: "01", id: 1, title: "Website Type" },
  { number: "02", id: 2, title: "Info & identity" },
  { number: "03", id: 3, title: "Sections & Settings" },
  { number: "04", id: 4, title: "Publishing" },
];

export const ECOMMERCE_STEPS = [
  { number: "01", id: 1, title: "Website Type" },
  { number: "02", id: 2, title: "Info & identity" },
  { number: "03", id: 3, title: "Home & Settings" },
  { number: "04", id: 4, title: "Products" },
  { number: "05", id: 5, title: "Publishing" },
];

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
  { id: "ad-banner", number: 2, title: "2.Advertising Banner", status: "Apparent", canReorder: false },
  { id: "categories", number: 3, title: "3.Categories", status: "Apparent", canReorder: true },
  { id: "product-lists", number: 4, title: "3.Product lists", status: "Apparent", canReorder: true, hasAddList: true },
];

export const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD - US Dollar ($)" },
  { value: "KWD", label: "KWD - Kuwaiti Dinar (د.ك)" },
  { value: "SAR", label: "SAR - Saudi Riyal (ر.س)" },
  { value: "AED", label: "AED - UAE Dirham (د.إ)" },
  { value: "EUR", label: "EUR - Euro (€)" },
];

export const PAYMENT_METHODS = [
  { id: "knet", label: "K-Net / Debit Card" },
  { id: "credit_card", label: "Credit Card (Visa / Mastercard)" },
  { id: "cod", label: "Cash On Delivery (COD)" },
  { id: "apple_pay", label: "Apple Pay" },
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

export const MOCK_INVENTORY_CATEGORIES = [
  { id: "cat-1", name: "Laptops & Computers", totalProducts: 45, isAllSelected: true },
  { id: "cat-2", name: "Smartphones & Tablets", totalProducts: 38, isAllSelected: true },
  { id: "cat-3", name: "Audio & Headphones", totalProducts: 24, isAllSelected: false },
  { id: "cat-4", name: "Smart Watches & Wearables", totalProducts: 19, isAllSelected: false },
  { id: "cat-5", name: "Computer Accessories", totalProducts: 56, isAllSelected: false },
  { id: "cat-6", name: "Gaming & Consoles", totalProducts: 32, isAllSelected: false },
  { id: "cat-7", name: "Software Licenses", totalProducts: 14, isAllSelected: false },
];

export const MOCK_INVENTORY_ITEMS = [
  { id: 1, code: "1", name: "Laptop Pro 14", category: "Electronics", unit: "Piece", price: 50, status: "Active", selected: true },
  { id: 2, code: "1", name: "Laptop Pro 14", category: "Electronics", unit: "Piece", price: 50, status: "Active", selected: true },
  { id: 3, code: "1", name: "Laptop Pro 14", category: "Electronics", unit: "Piece", price: 50, status: "Active", selected: true },
  { id: 4, code: "1", name: "Laptop Pro 14", category: "Electronics", unit: "Piece", price: 50, status: "Active", selected: true },
  { id: 5, code: "1", name: "Laptop Pro 14", category: "Electronics", unit: "Piece", price: 50, status: "Active", selected: true },
  { id: 6, code: "1", name: "Laptop Pro 14", category: "Electronics", unit: "Piece", price: 50, status: "Active", selected: true },
  { id: 7, code: "1", name: "Laptop Pro 14", category: "Electronics", unit: "Piece", price: 50, status: "Active", selected: true },
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
    virtualCurrency: "USD",
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
  paymentMethods: ["knet", "credit_card", "cod"],
  selectedCategories: ["cat-1", "cat-2"],
  subdomain: "onpoint",
};
