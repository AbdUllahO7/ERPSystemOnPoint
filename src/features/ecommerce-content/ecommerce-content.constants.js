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

export * from "./mock/ecommerce-content.mock";
