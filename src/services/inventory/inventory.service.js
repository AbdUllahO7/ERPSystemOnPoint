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

export function toGuidOrNull(val) {
  if (!val || val === "none" || val === "null" || val === "undefined") return null;
  const str = String(val).trim();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str) ? str : str || null;
}

export function buildUpdateProductUnitDto(unit = {}) {
  return {
    id: toGuidOrNull(unit.id),
    unit_Of_Measurement_Id: toGuidOrNull(unit.unit_Of_Measurement_Id || unit.unitOfMeasurementId || unit.unitId),
    secondunit_Of_Measurement_Id: toGuidOrNull(unit.secondunit_Of_Measurement_Id || unit.secondUnitId || unit.secondunitId),
    barcode_Option: unit.barcode_Option || unit.barcodeOption || "Manual",
    barcode: unit.barcode || null,
    qr_Code: unit.qr_Code || unit.qrCode || null,
    is_Default_Selling: Boolean(unit.is_Default_Selling ?? unit.isDefaultSelling ?? true),
    is_Default_Purchasing: Boolean(unit.is_Default_Purchasing ?? unit.isDefaultPurchasing ?? true),
    cost_Price: Number(unit.cost_Price ?? unit.costPrice ?? 0) || 0,
    wholesale_Price: Number(unit.wholesale_Price ?? unit.wholesalePrice ?? 0) || 0,
    consumer_Price: Number(unit.consumer_Price ?? unit.consumerPrice ?? 0) || 0,
    last_Purchase_Price: Number(unit.last_Purchase_Price ?? unit.lastPurchasePrice ?? 0) || 0,
    average_Purchase_Price: Number(unit.average_Purchase_Price ?? unit.averagePurchasePrice ?? 0) || 0,
    relative_factor: Number(unit.relative_factor ?? unit.relativeFactor ?? 0) || 0,
  };
}

export function buildUpdateProductComponentDto(c = {}) {
  return {
    id: toGuidOrNull(c.id),
    component_Variant_Id: toGuidOrNull(c.component_Variant_Id || c.componentVariantId),
    quantity: Number(c.quantity ?? 1) || 0,
    unit_Of_Measurement_Id: toGuidOrNull(c.unit_Of_Measurement_Id || c.unitOfMeasurementId),
    notes: (c.notes || "").trim(),
  };
}

export function buildUpdateFlatProductVariantCardDto(v = {}) {
  return {
    variant_id: toGuidOrNull(v.variant_id || v.variantId || v.id),
    unit_id: toGuidOrNull(v.unit_id || v.unitId),
    minimum_Alert_Level: Number(v.minimum_Alert_Level ?? v.minimumAlertLevel ?? 0) || 0,
    maximum_Stock_Level: Number(v.maximum_Stock_Level ?? v.maximumStockLevel ?? 0) || 0,
    barcode_Option: v.barcode_Option || v.barcodeOption || "Manual",
    barcode: v.barcode || null,
    qr_Code: v.qr_Code || v.qrCode || null,
    cost_Price: Number(v.cost_Price ?? v.costPrice ?? 0) || 0,
    consumer_Price: Number(v.consumer_Price ?? v.consumerPrice ?? 0) || 0,
    wholesale_Price: Number(v.wholesale_Price ?? v.wholesalePrice ?? 0) || 0,
    last_Purchase_Price: Number(v.last_Purchase_Price ?? v.lastPurchasePrice ?? 0) || 0,
    average_Purchase_Price: Number(v.average_Purchase_Price ?? v.averagePurchasePrice ?? 0) || 0,
    unit_Of_Measurement_Id: toGuidOrNull(v.unit_Of_Measurement_Id || v.unitOfMeasurementId),
    secondunit_Of_Measurement_Id: toGuidOrNull(v.secondunit_Of_Measurement_Id || v.secondunitId || v.secondUnitOfMeasurementId),
    relative_factor: Number(v.relative_factor ?? v.relativeFactor ?? 0) || 0,
    variant_Values: Array.isArray(v.variant_Values || v.variantValues)
      ? (v.variant_Values || v.variantValues)
          .map((val) => ({
            productAttributeValueId: toGuidOrNull(
              val.productAttributeValueId || val.product_Attribute_Value_Id || val.id || val.attribute_Value_Id
            ),
          }))
          .filter((vv) => Boolean(vv.productAttributeValueId))
      : [],
  };
}

export function buildUpdateProductInventoryWithoutSpecsDto(data = {}) {
  let rawUnits = Array.isArray(data.product_Units || data.productUnits)
    ? (data.product_Units || data.productUnits)
    : [];

  if (rawUnits.length === 0 && Array.isArray(data.variants)) {
    for (const v of data.variants) {
      const vUnits = v.productUnitDtos || v.productUnits;
      if (Array.isArray(vUnits) && vUnits.length > 0) {
        rawUnits = vUnits;
        break;
      }
    }
  }

  if (rawUnits.length === 0 && Array.isArray(data.productVariantDtos)) {
    for (const v of data.productVariantDtos) {
      const vUnits = v.productUnitDtos || v.productUnits;
      if (Array.isArray(vUnits) && vUnits.length > 0) {
        rawUnits = vUnits;
        break;
      }
    }
  }

  if (rawUnits.length === 0 && data.raw) {
    const raw = data.raw;
    if (Array.isArray(raw.product_Units || raw.productUnits)) {
      rawUnits = raw.product_Units || raw.productUnits;
    } else if (Array.isArray(raw.variants)) {
      for (const v of raw.variants) {
        const vUnits = v.productUnitDtos || v.productUnits;
        if (Array.isArray(vUnits) && vUnits.length > 0) {
          rawUnits = vUnits;
          break;
        }
      }
    }
  }

  const costPrice = Number(data.cost_Price ?? data.costPrice ?? 0) || 0;
  const consumerPrice = Number(data.consumer_Price ?? data.consumerPrice ?? 0) || 0;

  let mappedUnits = rawUnits
    .map(buildUpdateProductUnitDto)
    .filter((u) => Boolean(u.unit_Of_Measurement_Id));

  if (mappedUnits.length === 0) {
    const fallbackUnitId = toGuidOrNull(
      data.unit_Of_Measurement_Id ||
      data.unitOfMeasurementId ||
      data.unit_id ||
      data.unitId ||
      data.raw?.unit_Of_Measurement_Id ||
      data.raw?.unitOfMeasurementId ||
      "33333333-3333-3333-3333-333333333333"
    );
    if (fallbackUnitId) {
      mappedUnits = [
        buildUpdateProductUnitDto({
          id: toGuidOrNull(data.unit_id || data.unitId || data.variants?.[0]?.productUnitDtos?.[0]?.id),
          unit_Of_Measurement_Id: fallbackUnitId,
          barcode_Option: data.barcode_Option || "Manual",
          barcode: data.barcode || null,
          qr_Code: data.qr_Code || null,
          is_Default_Selling: true,
          is_Default_Purchasing: true,
          cost_Price: costPrice,
          wholesale_Price: Number(data.wholesale_Price ?? data.wholesalePrice ?? 0) || 0,
          consumer_Price: consumerPrice,
          last_Purchase_Price: Number(data.last_Purchase_Price ?? data.lastPurchasePrice ?? 0) || 0,
          average_Purchase_Price: Number(data.average_Purchase_Price ?? data.averagePurchasePrice ?? 0) || 0,
          relative_factor: 1,
        }),
      ];
    }
  } else {
    // Synchronize price adjustments from root form
    if (costPrice > 0 && mappedUnits[0].cost_Price === 0) {
      mappedUnits[0].cost_Price = costPrice;
    }
    if (consumerPrice > 0 && mappedUnits[0].consumer_Price === 0) {
      mappedUnits[0].consumer_Price = consumerPrice;
    }
  }

  return {
    id: toGuidOrNull(data.id),
    name_Product: (data.name_Product || data.name || "").trim(),
    product_Number: (data.product_Number || data.productNumber || "").trim(),
    has_Expiry_Date: Boolean(data.has_Expiry_Date ?? data.hasExpiryDate ?? false),
    is_Tracking_Inventory: Boolean(data.is_Tracking_Inventory ?? data.isTrackingInventory ?? true),
    category_Id: toGuidOrNull(data.category_Id || data.categoryId || data.category),
    requires_Shipping: Boolean(data.requires_Shipping ?? data.requiresShipping ?? false),
    there_Are_Units: Boolean(data.there_Are_Units ?? data.thereAreUnits ?? (mappedUnits.length > 0)),
    revenue_Account_Id: toGuidOrNull(data.revenue_Account_Id || data.revenueAccountId || data.revenueAccount),
    expense_Account_Id: toGuidOrNull(data.expense_Account_Id || data.expenseAccountId || data.expenseAccount),
    inventory_Account_Id: toGuidOrNull(data.inventory_Account_Id || data.inventoryAccountId || data.inventoryAccount),
    minimum_Alert_Level: Number(data.minimum_Alert_Level ?? data.minimumAlertLevel ?? 0) || 0,
    maximum_Stock_Level: Number(data.maximum_Stock_Level ?? data.maximumStockLevel ?? 0) || 0,
    barcode_Option: data.barcode_Option || data.barcodeOption || "Manual",
    barcode: data.barcode || null,
    qr_Code: data.qr_Code || data.qrCode || null,
    cost_Price: costPrice,
    consumer_Price: consumerPrice,
    wholesale_Price: Number(data.wholesale_Price ?? data.wholesalePrice ?? 0) || 0,
    last_Purchase_Price: Number(data.last_Purchase_Price ?? data.lastPurchasePrice ?? 0) || 0,
    average_Purchase_Price: Number(data.average_Purchase_Price ?? data.averagePurchasePrice ?? 0) || 0,
    product_Units: mappedUnits,
  };
}

export function buildUpdateProductAssemblyWithoutSpecsDto(data = {}) {
  return {
    id: toGuidOrNull(data.id),
    name_Product: (data.name_Product || data.name || "").trim(),
    product_Number: (data.product_Number || data.productNumber || "").trim(),
    has_Expiry_Date: Boolean(data.has_Expiry_Date ?? data.hasExpiryDate ?? false),
    is_Tracking_Inventory: Boolean(data.is_Tracking_Inventory ?? data.isTrackingInventory ?? true),
    category_Id: toGuidOrNull(data.category_Id || data.categoryId || data.category),
    requires_Shipping: Boolean(data.requires_Shipping ?? data.requiresShipping ?? false),
    revenue_Account_Id: toGuidOrNull(data.revenue_Account_Id || data.revenueAccountId || data.revenueAccount),
    expense_Account_Id: toGuidOrNull(data.expense_Account_Id || data.expenseAccountId || data.expenseAccount),
    there_Are_Units: Boolean(data.there_Are_Units ?? data.thereAreUnits ?? false),
    minimum_Alert_Level: Number(data.minimum_Alert_Level ?? data.minimumAlertLevel ?? 0) || 0,
    maximum_Stock_Level: Number(data.maximum_Stock_Level ?? data.maximumStockLevel ?? 0) || 0,
    barcode_Option: data.barcode_Option || data.barcodeOption || "Manual",
    barcode: data.barcode || null,
    qr_Code: data.qr_Code || data.qrCode || null,
    cost_Price: Number(data.cost_Price ?? data.costPrice ?? 0) || 0,
    consumer_Price: Number(data.consumer_Price ?? data.consumerPrice ?? 0) || 0,
    wholesale_Price: Number(data.wholesale_Price ?? data.wholesalePrice ?? 0) || 0,
    last_Purchase_Price: Number(data.last_Purchase_Price ?? data.lastPurchasePrice ?? 0) || 0,
    average_Purchase_Price: Number(data.average_Purchase_Price ?? data.averagePurchasePrice ?? 0) || 0,
    product_Units: Array.isArray(data.product_Units || data.productUnits)
      ? (data.product_Units || data.productUnits)
          .map(buildUpdateProductUnitDto)
          .filter((u) => Boolean(u.unit_Of_Measurement_Id))
      : [],
    product_Components: Array.isArray(data.product_Components || data.productComponents)
      ? (data.product_Components || data.productComponents)
          .map(buildUpdateProductComponentDto)
          .filter((c) => Boolean(c.component_Variant_Id))
      : [],
  };
}

export function buildUpdateBundleDto(data = {}) {
  return {
    id: toGuidOrNull(data.id),
    name_Product: (data.name_Product || data.name || "").trim(),
    product_Number: (data.product_Number || data.productNumber || "").trim(),
    has_Expiry_Date: Boolean(data.has_Expiry_Date ?? data.hasExpiryDate ?? false),
    category_Id: toGuidOrNull(data.category_Id || data.categoryId || data.category),
    requires_Shipping: Boolean(data.requires_Shipping ?? data.requiresShipping ?? false),
    requires_Contract: Boolean(data.requires_Contract ?? data.requiresContract ?? false),
    revenue_Account_Id: toGuidOrNull(data.revenue_Account_Id || data.revenueAccountId || data.revenueAccount),
    expense_Account_Id: toGuidOrNull(data.expense_Account_Id || data.expenseAccountId || data.expenseAccount),
    cost_Price: Number(data.cost_Price ?? data.costPrice ?? 0) || 0,
    consumer_Price: Number(data.consumer_Price ?? data.consumerPrice ?? 0) || 0,
    product_Components: Array.isArray(data.product_Components || data.productComponents)
      ? (data.product_Components || data.productComponents)
          .map(buildUpdateProductComponentDto)
          .filter((c) => Boolean(c.component_Variant_Id))
      : [],
  };
}

export function buildUpdateProductInventoryWithSpecsDto(data = {}) {
  const variants = data.updateProductvariants || data.createProductvariants || data.variants || [];
  return {
    id: toGuidOrNull(data.id),
    name_Product: (data.name_Product || data.name || "").trim(),
    product_Number: (data.product_Number || data.productNumber || "").trim(),
    has_Expiry_Date: Boolean(data.has_Expiry_Date ?? data.hasExpiryDate ?? false),
    is_Tracking_Inventory: Boolean(data.is_Tracking_Inventory ?? data.isTrackingInventory ?? true),
    category_Id: toGuidOrNull(data.category_Id || data.categoryId || data.category),
    requires_Shipping: Boolean(data.requires_Shipping ?? data.requiresShipping ?? false),
    there_Are_Units: Boolean(data.there_Are_Units ?? data.thereAreUnits ?? false),
    revenue_Account_Id: toGuidOrNull(data.revenue_Account_Id || data.revenueAccountId || data.revenueAccount),
    expense_Account_Id: toGuidOrNull(data.expense_Account_Id || data.expenseAccountId || data.expenseAccount),
    inventory_Account_Id: toGuidOrNull(data.inventory_Account_Id || data.inventoryAccountId || data.inventoryAccount),
    updateProductvariants: Array.isArray(variants)
      ? variants
          .map(buildUpdateFlatProductVariantCardDto)
          .filter((v) => Boolean(v.unit_Of_Measurement_Id))
      : [],
  };
}

export async function updateService(data) {
  return updateSimpleProductWithoutSpecs(data);
}

export async function createBundleWithoutSpecs(data) {
  return apiHandler({
    endPoint: "Inventory/Product/CreateBundleWithoutSpecs",
    method: "POST",
    body: data,
  });
}

export async function updateBundleWithoutSpecs(data) {
  const cleanDto = buildUpdateBundleDto(data);
  return apiHandler({
    endPoint: "Inventory/Product/UpdateProductBundle/bundle",
    method: "POST",
    body: cleanDto,
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
  const cleanDto = buildUpdateProductAssemblyWithoutSpecsDto(data);
  return apiHandler({
    endPoint:
      "Inventory/Product/UpdateProductAssemblyWithoutSpecifications/assembly-without-specifications",
    method: "POST",
    body: cleanDto,
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
  const cleanDto = buildUpdateProductInventoryWithSpecsDto(data);
  return apiHandler({
    endPoint:
      "Inventory/Product/UpdateProductInventoryWithSpecifications/inventory-with-specifications",
    method: "POST",
    body: cleanDto,
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
  const cleanDto = buildUpdateProductInventoryWithoutSpecsDto(data);
  return apiHandler({
    endPoint:
      "Inventory/Product/UpdateProductInventoryWithoutSpecifications/inventory-without-specifications",
    method: "POST",
    body: cleanDto,
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
