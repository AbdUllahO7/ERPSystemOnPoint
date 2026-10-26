import { apiHandler } from "@/lib/api-handler";

// ==========================================
// WAREHOUSES
// ==========================================

export async function getWarehouses(data) {
  return apiHandler({
    endPoint: "inventory/Warehouses/GetAll/GetAll",
    method: "GET",
    params: data,
  });
}

export async function createWarehouse(data) {
  return apiHandler({
    endPoint: "inventory/Warehouses/Create/Create",
    method: "POST",
    body: data,
  });
}

export async function updateWarehouse(data) {
  return apiHandler({
    endPoint: "inventory/Warehouses/Update/Update",
    method: "POST",
    body: data,
  });
}

export async function getWarehouseById(id) {
  return apiHandler({
    endPoint: `inventory/Warehouses/GetById/GetById/${id}`,
    method: "GET",
  });
}

export async function getWarehouseItems(id, data) {
  return apiHandler({
    endPoint: `inventory/Warehouses/GetWarehouseProducts/${id}/products`,
    method: "GET",
    params: data,
  });
}

export async function toggleWarehouseStatus(id) {
  return apiHandler({
    endPoint: `inventory/Warehouses/ToggleStatus/ToggleStatus/${id}`,
    method: "POST",
  });
}

export async function deleteWarehouse(id) {
  return apiHandler({
    endPoint: `inventory/Warehouses/DeleteWarehouse/Delete/${id}`,
    method: "POST",
  });
}

// ==========================================
// INVENTORY TRANSFERS
// ==========================================

export async function getAllTransfers(data) {
  return apiHandler({
    endPoint: "Inventory/InventoryTransfer/GetAllTransfers",
    method: "GET",
    params: data,
  });
}

export async function getTransferDetails(id) {
  return apiHandler({
    endPoint: `Inventory/InventoryTransfer/GetTransferDetails?id=${id}`,
    method: "GET",
  });
}

export async function getProductsByWarehouse(id) {
  return apiHandler({
    endPoint: `inventory/Warehouses/GetWarehouseProducts/${id}/products`,
    method: "GET",
  });
}

export async function addTransfer(data) {
  return apiHandler({
    endPoint: "Inventory/InventoryTransfer/CreateTransfer",
    method: "POST",
    body: data,
  });
}

// ==========================================
// CATEGORIES
// ==========================================

export async function getAllCategories(params) {
  return apiHandler({
    endPoint: "inventory/Categories/GetAllCategories",
    method: "GET",
    params,
  });
}

export async function getCategoryById(id) {
  return apiHandler({
    endPoint: `inventory/Categories/GetById/${id}`,
    method: "GET",
  });
}

export async function createCategory(data) {
  return apiHandler({
    endPoint: "inventory/Categories/CreateCategory",
    method: "POST",
    body: data,
  });
}

export async function updateCategory(id, data) {
  return apiHandler({
    endPoint: `inventory/Categories/UpdateCategory/${id}`,
    method: "POST",
    body: data,
  });
}

export async function deleteCategory(id) {
  return apiHandler({
    endPoint: `inventory/Categories/DeleteCategory/${id}`,
    method: "POST",
  });
}

// ==========================================
// PRODUCTS & SERVICES & ATTRIBUTES
// ==========================================

export async function getAllProducts(params) {
  return apiHandler({
    endPoint: "Inventory/Product/GetAll/GetAll",
    method: "GET",
    params,
  });
}

export async function createProduct(data) {
  return apiHandler({
    endPoint: "Inventory/Product/CreateProduct/Create",
    method: "POST",
    body: data,
  });
}

export async function getProductById(id) {
  return apiHandler({
    endPoint: `Inventory/Product/GetById/GetById/${id}`,
    method: "GET",
  });
}

export async function toggleProductStatus(id) {
  return apiHandler({
    endPoint: `Inventory/Product/ToggleStatus?id=${id}`,
    method: "POST",
  });
}

export async function createService(data) {
  return apiHandler({
    endPoint: "Inventory/Product/CreateService",
    method: "POST",
    body: data,
  });
}

export async function updateService(data) {
  return apiHandler({
    endPoint: "Inventory/Product/UpdateProductService/service",
    method: "POST",
    body: data,
  });
}

export async function createBundleWithoutSpecs(data) {
  return apiHandler({
    endPoint: "Inventory/Product/CreateBundleWithoutSpecs",
    method: "POST",
    body: data,
  });
}

export async function updateBundleWithoutSpecs(data) {
  return apiHandler({
    endPoint: "Inventory/Product/UpdateProductBundle/bundle",
    method: "POST",
    body: data,
  });
}

export async function createAssemblyWithoutSpecs(data) {
  return apiHandler({
    endPoint: "Inventory/Product/CreateAssemblyWithoutSpecs",
    method: "POST",
    body: data,
  });
}

export async function updateAssemblyWithoutSpecs(data) {
  return apiHandler({
    endPoint:
      "Inventory/Product/UpdateProductAssemblyWithoutSpecifications/assembly-without-specifications",
    method: "POST",
    body: data,
  });
}

export async function createSimpleProductWithSpecs(data) {
  return apiHandler({
    endPoint: "Inventory/Product/CreateSimpleProductWithSpecs",
    method: "POST",
    body: data,
  });
}

export async function updateSimpleProductWithSpecs(data) {
  return apiHandler({
    endPoint:
      "Inventory/Product/UpdateProductInventoryWithSpecifications/inventory-with-specifications",
    method: "POST",
    body: data,
  });
}

export async function createSimpleProductWithoutSpecs(data) {
  return apiHandler({
    endPoint: "Inventory/Product/CreateSimpleProductWithoutSpecs",
    method: "POST",
    body: data,
  });
}

export async function updateSimpleProductWithoutSpecs(data) {
  return apiHandler({
    endPoint:
      "Inventory/Product/UpdateProductInventoryWithoutSpecifications/inventory-without-specifications",
    method: "POST",
    body: data,
  });
}

export async function searchMaterialsForInvoice(params) {
  return apiHandler({
    endPoint: "Inventory/Product/SearchMaterialsForInvoice/search-for-invoice",
    method: "GET",
    params,
  });
}

export async function getAllUnitOfMeasurements(params) {
  return apiHandler({
    endPoint: "Inventory/UnitOfMeasurements/GetAllUnitOfMeasurements",
    method: "GET",
    params,
  });
}

export async function getAllProductAttributes(params) {
  return apiHandler({
    endPoint: "Inventory/ProductAttributes/GetAllProductAttributes",
    method: "GET",
    params,
  });
}

// ==========================================
// INVENTORY DASHBOARD
// ==========================================

export async function getInventoryKpiCards() {
  return apiHandler({
    endPoint: "Inventory/DashboardInvantory/GetKpiCards/KpiCards",
    method: "GET",
  });
}

export async function getInventoryCategoryDistribution() {
  return apiHandler({
    endPoint:
      "Inventory/DashboardInvantory/GetCategoryDistribution/CategoryDistribution",
    method: "GET",
  });
}

export async function getInventoryStockMovement() {
  return apiHandler({
    endPoint:
      "Inventory/DashboardInvantory/GetStockMovementByCategory/stock-movement-by-category",
    method: "GET",
  });
}

export async function getInventoryTopTrendingProducts(params) {
  return apiHandler({
    endPoint: "Inventory/DashboardInvantory/GetTopTrendingProducts/TopTrending",
    method: "GET",
    params,
  });
}

export async function getInventoryStockAlerts(params) {
  return apiHandler({
    endPoint: "Inventory/DashboardInvantory/GetStockAlerts/StockAlerts",
    method: "GET",
    params,
  });
}

// ==========================================
// INVENTORY RECORDS (MATERIAL REPORTS)
// ==========================================

export async function getInventoryRecords(params) {
  return apiHandler({
    endPoint: "Inventory/InventoryRecord/GetAllRecords",
    method: "GET",
    params,
  });
}

export async function getInventoryRecordDetails(id) {
  return apiHandler({
    endPoint: `Inventory/InventoryRecord/GetRecordDetails/${id}`,
    method: "GET",
  });
}

export async function createInventoryRecord(data) {
  return apiHandler({
    endPoint: "Inventory/InventoryRecord/CreateInventoryRecord",
    method: "POST",
    body: data,
  });
}

export async function importPhysicalCountFromExcel(formData) {
  return apiHandler({
    endPoint: "Inventory/InventoryRecord/ImportPhysicalCountFromExcel",
    method: "POST",
    body: formData,
    isMultipart: true,
  });
}
