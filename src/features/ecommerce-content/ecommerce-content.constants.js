export const ECOMMERCE_CONTENT_TABS = [
  { id: "home", label: "Home Page" },
  { id: "products", label: "Manage Products" },
  { id: "settings", label: "Settings" },
];

export const DEFAULT_ECOMMERCE_HOME_SECTIONS = [
  {
    id: "banner",
    number: 1,
    title: "1.Advertising Banner",
    status: "Apparent",
    canReorder: false,
    hasSettings: true,
  },
  {
    id: "categories",
    number: 2,
    title: "2.Categories",
    status: "Apparent",
    canReorder: true,
    hasSettings: true,
  },
  {
    id: "product_lists_1",
    number: 3,
    title: "3.Product lists",
    status: "Apparent",
    canReorder: true,
    hasSettings: true,
  },
  {
    id: "product_lists_2",
    number: "3-1",
    title: "3-1.Product lists",
    status: "Apparent",
    canReorder: true,
    hasAddList: true,
  },
];

export const MOCK_STORE_BANNERS = [
  {
    id: "ban-1",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
    title: "Gaming Desktop & Monitor Promo",
    tag: "WORTH UP TO $599AU",
  },
  {
    id: "ban-2",
    imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80",
    title: "Smartwatch & Accessories Sale",
    tag: "WORTH UP TO $599AU",
  },
  {
    id: "ban-3",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    title: "Wireless Headphones Studio",
    tag: "WORTH UP TO $599AU",
  },
];

export const MOCK_STORE_CATEGORIES_TABLE = [
  { id: "cat-1", serialNumber: "1", name: "Laptops & Computers", selected: true },
  { id: "cat-2", serialNumber: "1", name: "Smartphones & Tablets", selected: true },
  { id: "cat-3", serialNumber: "1", name: "Audio & Headphones", selected: true },
  { id: "cat-4", serialNumber: "1", name: "Smart Watches", selected: true },
  { id: "cat-5", serialNumber: "1", name: "Computer Accessories", selected: true },
  { id: "cat-6", serialNumber: "1", name: "Gaming & Consoles", selected: true },
  { id: "cat-7", serialNumber: "1", name: "Cameras & Drones", selected: true },
  { id: "cat-8", serialNumber: "1", name: "Storage & Networking", selected: true },
  { id: "cat-9", serialNumber: "1", name: "Software Licenses", selected: true },
  { id: "cat-10", serialNumber: "1", name: "Printers & Scanners", selected: true },
  { id: "cat-11", serialNumber: "1", name: "Smart Home Devices", selected: true },
];
