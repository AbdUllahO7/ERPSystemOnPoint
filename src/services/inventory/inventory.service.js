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

export async function getProductsByWarehouse(id, params = { PageNumber: 1, PageSize: 1000 }) {
  return apiHandler({
    endPoint: `inventory/Warehouses/GetWarehouseProducts/${id}/products`,
    method: "GET",
    params,
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
  const cleanDto = buildCreateProductServiceDto(data);
  return apiHandler({
    endPoint: "Inventory/Product/CreateService",
    method: "POST",
    body: cleanDto,
  });
}

export const DEFAULT_PIECE_UNIT_ID = "55555555-5555-5555-5555-555555555555";

export function isPieceUnit(unit = {}) {
  const uomId = toGuidOrNull(
    unit.unit_Of_Measurement_Id ||
    unit.unitOfMeasurementId ||
    unit.unit_Name_Id ||
    unit.unitId ||
    unit.id
  );
  if (
    uomId === "55555555-5555-5555-5555-555555555555" ||
    uomId === "e7355714-9762-4403-8c61-d1dcf04d06ba" ||
    uomId === "a819d257-6235-4c0b-b8f7-9a5cc4fdaf72"
  ) {
    return true;
  }
  const name = String(unit.unitName || unit.unit_name || unit.name || "").trim().toLowerCase();
  if (
    name === "قطعة" ||
    name === "قطعه" ||
    name === "piece" ||
    name.includes("حبة / قطعة") ||
    name.includes("قطعة / حبة")
  ) {
    return true;
  }
  const sysCode = String(unit.system_code || unit.systemCode || "").trim().toUpperCase();
  if (sysCode === "PIECE") {
    return true;
  }
  return false;
}

export function toGuidOrNull(val) {
  if (!val || val === "none" || val === "null" || val === "undefined") return null;
  const str = String(val).trim();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str) ? str : str || null;
}

export function buildCreateProductUnitDto(unit = {}, fallbackData = {}) {
  const cost = Number(unit.cost_Price ?? unit.costPrice ?? fallbackData.cost_Price ?? fallbackData.costPrice ?? 0) || 0;
  const consumer = Number(unit.consumer_Price ?? unit.consumerPrice ?? fallbackData.consumer_Price ?? fallbackData.consumerPrice ?? 0) || 0;
  const wholesale = Number(unit.wholesale_Price ?? unit.wholesalePrice ?? fallbackData.wholesale_Price ?? fallbackData.wholesalePrice ?? 0) || 0;
  const lastPurchase = Number(unit.last_Purchase_Price ?? unit.lastPurchasePrice ?? fallbackData.last_Purchase_Price ?? fallbackData.lastPurchasePrice ?? 0) || 0;
  const avgPurchase = Number(unit.average_Purchase_Price ?? unit.averagePurchasePrice ?? fallbackData.average_Purchase_Price ?? fallbackData.averagePurchasePrice ?? 0) || 0;

  let barcodeOption = unit.barcode_Option || unit.barcodeOption || fallbackData.barcode_Option || "Manual";
  const barcode = (unit.barcode || fallbackData.barcode || "").trim() || null;
  if (!barcode && barcodeOption === "Manual") {
    barcodeOption = "AutoGenerate";
  }

  const rawUomId = toGuidOrNull(
    unit.unit_Of_Measurement_Id ||
    unit.unitOfMeasurementId ||
    unit.unit_Name_Id ||
    unit.unitId
  );

  return {
    unit_Of_Measurement_Id: rawUomId,
    secondunit_Of_Measurement_Id: toGuidOrNull(unit.secondunit_Of_Measurement_Id || unit.secondUnitId || unit.secondunitId) || DEFAULT_PIECE_UNIT_ID,
    barcode_Option: barcodeOption,
    barcode: barcode,
    qr_Code: unit.qr_Code || unit.qrCode || fallbackData.qr_Code || null,
    is_Default_Selling: Boolean(unit.is_Default_Selling ?? unit.isDefaultSelling ?? false),
    is_Default_Purchasing: Boolean(unit.is_Default_Purchasing ?? unit.isDefaultPurchasing ?? false),
    cost_Price: cost,
    wholesale_Price: wholesale,
    consumer_Price: consumer,
    last_Purchase_Price: lastPurchase,
    average_Purchase_Price: avgPurchase,
    relative_factor: Number(unit.relative_factor ?? unit.relativeFactor ?? 1) || 1,
  };
}

export function buildUpdateProductUnitDto(unit = {}, fallbackData = {}) {
  const cost = Number(unit.cost_Price ?? unit.costPrice ?? fallbackData.cost_Price ?? fallbackData.costPrice ?? 0) || 0;
  const consumer = Number(unit.consumer_Price ?? unit.consumerPrice ?? fallbackData.consumer_Price ?? fallbackData.consumerPrice ?? 0) || 0;
  const wholesale = Number(unit.wholesale_Price ?? unit.wholesalePrice ?? fallbackData.wholesale_Price ?? fallbackData.wholesalePrice ?? 0) || 0;
  const lastPurchase = Number(unit.last_Purchase_Price ?? unit.lastPurchasePrice ?? fallbackData.last_Purchase_Price ?? fallbackData.lastPurchasePrice ?? 0) || 0;
  const avgPurchase = Number(unit.average_Purchase_Price ?? unit.averagePurchasePrice ?? fallbackData.average_Purchase_Price ?? fallbackData.averagePurchasePrice ?? 0) || 0;

  let barcodeOption = unit.barcode_Option || unit.barcodeOption || fallbackData.barcode_Option || "Manual";
  const barcode = (unit.barcode || fallbackData.barcode || "").trim() || null;
  if (!barcode && barcodeOption === "Manual") {
    barcodeOption = "AutoGenerate";
  }

  const rawUomId = toGuidOrNull(
    unit.unit_Of_Measurement_Id ||
    unit.unitOfMeasurementId ||
    unit.unit_Name_Id ||
    unit.unitId
  );

  return {
    id: toGuidOrNull(unit.id) || "00000000-0000-0000-0000-000000000000",
    unit_Of_Measurement_Id: rawUomId,
    secondunit_Of_Measurement_Id: toGuidOrNull(unit.secondunit_Of_Measurement_Id || unit.secondUnitId || unit.secondunitId) || DEFAULT_PIECE_UNIT_ID,
    barcode_Option: barcodeOption,
    barcode: barcode,
    qr_Code: unit.qr_Code || unit.qrCode || fallbackData.qr_Code || null,
    is_Default_Selling: Boolean(unit.is_Default_Selling ?? unit.isDefaultSelling ?? false),
    is_Default_Purchasing: Boolean(unit.is_Default_Purchasing ?? unit.isDefaultPurchasing ?? false),
    cost_Price: cost,
    wholesale_Price: wholesale,
    consumer_Price: consumer,
    last_Purchase_Price: lastPurchase,
    average_Purchase_Price: avgPurchase,
    relative_factor: Number(unit.relative_factor ?? unit.relativeFactor ?? 1) || 1,
  };
}

export function buildCreateProductComponentDto(c = {}) {
  return {
    component_Variant_Id: toGuidOrNull(c.component_Variant_Id || c.componentVariantId),
    quantity: Number(c.quantity ?? 1) || 0,
    unit_Of_Measurement_Id: toGuidOrNull(c.unit_Of_Measurement_Id || c.unitOfMeasurementId || c.unit_Name_Id || c.unitId),
    notes: (c.notes || "").trim() || null,
  };
}

export function buildUpdateProductComponentDto(c = {}) {
  return {
    id: toGuidOrNull(c.id) || "00000000-0000-0000-0000-000000000000",
    component_Variant_Id: toGuidOrNull(c.component_Variant_Id || c.componentVariantId),
    quantity: Number(c.quantity ?? 1) || 0,
    unit_Of_Measurement_Id: toGuidOrNull(c.unit_Of_Measurement_Id || c.unitOfMeasurementId || c.unit_Name_Id || c.unitId),
    notes: (c.notes || "").trim() || null,
  };
}

export function buildUpdateFlatProductVariantCardDto(v = {}, fallbackData = {}) {
  const uDto = Array.isArray(v.productUnitDtos) && v.productUnitDtos.length > 0 ? v.productUnitDtos[0] : {};
  const defaultGuid = "00000000-0000-0000-0000-000000000000";

  const variantId =
    toGuidOrNull(
      v.variant_id ||
      v.variantId ||
      v.id ||
      fallbackData.variant_id ||
      fallbackData.variantId ||
      fallbackData.variants?.[0]?.id ||
      fallbackData.raw?.variants?.[0]?.id ||
      fallbackData.id
    ) || defaultGuid;

  const unitId =
    toGuidOrNull(
      v.unit_id ||
      v.unitId ||
      (v.id !== variantId ? v.id : null) ||
      uDto.id ||
      fallbackData.unit_id ||
      fallbackData.unitId ||
      fallbackData.variants?.[0]?.productUnitDtos?.[0]?.id ||
      fallbackData.raw?.variants?.[0]?.productUnitDtos?.[0]?.id
    ) || defaultGuid;

  return {
    variant_id: variantId,
    unit_id: unitId,
    minimum_Alert_Level: Number(v.minimum_Alert_Level ?? v.minimumAlertLevel ?? uDto.minimum_Alert_Level ?? fallbackData.minimum_Alert_Level ?? 0) || 0,
    maximum_Stock_Level: Number(v.maximum_Stock_Level ?? v.maximumStockLevel ?? uDto.maximum_Stock_Level ?? fallbackData.maximum_Stock_Level ?? 0) || 0,
    barcode_Option: v.barcode_Option || v.barcodeOption || uDto.barcode_Option || fallbackData.barcode_Option || "Manual",
    barcode: v.barcode || uDto.barcode || fallbackData.barcode || null,
    qr_Code: v.qr_Code || v.qrCode || uDto.qr_Code || uDto.qr_code || fallbackData.qr_Code || null,
    cost_Price: Number(v.cost_Price ?? v.costPrice ?? uDto.cost_Price ?? fallbackData.cost_Price ?? 0) || 0,
    consumer_Price: Number(v.consumer_Price ?? v.consumerPrice ?? uDto.consumer_Price ?? fallbackData.consumer_Price ?? 0) || 0,
    wholesale_Price: Number(v.wholesale_Price ?? v.wholesalePrice ?? uDto.wholesale_Price ?? fallbackData.wholesale_Price ?? 0) || 0,
    last_Purchase_Price: Number(v.last_Purchase_Price ?? v.lastPurchasePrice ?? uDto.last_Purchase_Price ?? fallbackData.last_Purchase_Price ?? 0) || 0,
    average_Purchase_Price: Number(v.average_Purchase_Price ?? v.averagePurchasePrice ?? uDto.average_Purchase_Price ?? fallbackData.average_Purchase_Price ?? 0) || 0,
    unit_Of_Measurement_Id: toGuidOrNull(
      v.unit_Of_Measurement_Id ||
      v.unitOfMeasurementId ||
      uDto.unit_Of_Measurement_Id ||
      uDto.unitOfMeasurementId ||
      fallbackData.unit_Of_Measurement_Id ||
      fallbackData.variants?.[0]?.productUnitDtos?.[0]?.unit_Of_Measurement_Id ||
      "33333333-3333-3333-3333-333333333333"
    ) || "33333333-3333-3333-3333-333333333333",
    secondunit_Of_Measurement_Id: toGuidOrNull(
      v.secondunit_Of_Measurement_Id ||
      v.secondunitId ||
      v.secondUnitOfMeasurementId ||
      uDto.secondunit_Of_Measurement_Id
    ),
    relative_factor: Number(v.relative_factor ?? v.relativeFactor ?? uDto.relative_factor ?? uDto.conversion_Factor ?? 0) || 0,
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
  const wholesalePrice = Number(data.wholesale_Price ?? data.wholesalePrice ?? 0) || 0;
  const lastPurchasePrice = Number(data.last_Purchase_Price ?? data.lastPurchasePrice ?? 0) || 0;
  const averagePurchasePrice = Number(data.average_Purchase_Price ?? data.averagePurchasePrice ?? 0) || 0;

  let barcodeOption = data.barcode_Option || data.barcodeOption || "Manual";
  const barcode = (data.barcode || "").trim() || null;
  if (!barcode && barcodeOption === "Manual") {
    barcodeOption = "AutoGenerate";
  }

  const requestedThereAreUnits = Boolean(data.there_Are_Units ?? data.thereAreUnits ?? false);

  const additionalRawUnits = rawUnits.filter((u) => !isPieceUnit(u));

  let mappedUnits = [];
  if (requestedThereAreUnits && additionalRawUnits.length > 0) {
    mappedUnits = additionalRawUnits
      .map(buildUpdateProductUnitDto)
      .filter((u) => Boolean(u.unit_Of_Measurement_Id) && !isPieceUnit(u));
  }

  const finalThereAreUnits = mappedUnits.length > 0;

  return {
    id: toGuidOrNull(data.id),
    name_Product: (data.name_Product || data.name || "").trim(),
    product_Number: (data.product_Number || data.productNumber || "").trim(),
    has_Expiry_Date: Boolean(data.has_Expiry_Date ?? data.hasExpiryDate ?? false),
    is_Tracking_Inventory: Boolean(data.is_Tracking_Inventory ?? data.isTrackingInventory ?? true),
    category_Id: toGuidOrNull(data.category_Id || data.categoryId || data.category),
    requires_Shipping: Boolean(data.requires_Shipping ?? data.requiresShipping ?? false),
    there_Are_Units: finalThereAreUnits,
    revenue_Account_Id: toGuidOrNull(data.revenue_Account_Id || data.revenueAccountId || data.revenueAccount),
    expense_Account_Id: toGuidOrNull(data.expense_Account_Id || data.expenseAccountId || data.expenseAccount),
    inventory_Account_Id: toGuidOrNull(data.inventory_Account_Id || data.inventoryAccountId || data.inventoryAccount),
    minimum_Alert_Level: Number(data.minimum_Alert_Level ?? data.minimumAlertLevel ?? 0) || 0,
    maximum_Stock_Level: Number(data.maximum_Stock_Level ?? data.maximumStockLevel ?? 0) || 0,
    barcode_Option: barcodeOption,
    barcode: barcode,
    qr_Code: data.qr_Code || data.qrCode || null,
    cost_Price: costPrice,
    consumer_Price: consumerPrice,
    wholesale_Price: wholesalePrice,
    last_Purchase_Price: lastPurchasePrice,
    average_Purchase_Price: averagePurchasePrice,
    product_Units: mappedUnits,
  };
}

export function buildUpdateProductAssemblyWithoutSpecsDto(data = {}) {
  const costPrice = Number(data.cost_Price ?? data.costPrice ?? 0) || 0;
  const consumerPrice = Number(data.consumer_Price ?? data.consumerPrice ?? 0) || 0;
  const wholesalePrice = Number(data.wholesale_Price ?? data.wholesalePrice ?? 0) || 0;
  const lastPurchasePrice = Number(data.last_Purchase_Price ?? data.lastPurchasePrice ?? 0) || 0;
  const averagePurchasePrice = Number(data.average_Purchase_Price ?? data.averagePurchasePrice ?? 0) || 0;

  let barcodeOption = data.barcode_Option || data.barcodeOption || "Manual";
  const barcode = (data.barcode || "").trim() || null;
  if (!barcode && barcodeOption === "Manual") {
    barcodeOption = "AutoGenerate";
  }

  const requestedThereAreUnits = Boolean(data.there_Are_Units ?? data.thereAreUnits ?? false);

  let rawUnits = Array.isArray(data.product_Units || data.productUnits)
    ? (data.product_Units || data.productUnits)
    : [];

  const additionalRawUnits = rawUnits.filter((u) => !isPieceUnit(u));

  let mappedUnits = [];
  if (requestedThereAreUnits && additionalRawUnits.length > 0) {
    mappedUnits = additionalRawUnits
      .map(buildUpdateProductUnitDto)
      .filter((u) => Boolean(u.unit_Of_Measurement_Id) && !isPieceUnit(u));
  }

  const finalThereAreUnits = mappedUnits.length > 0;

  const components = Array.isArray(data.product_Components || data.productComponents)
    ? (data.product_Components || data.productComponents)
        .map(buildUpdateProductComponentDto)
        .filter((c) => Boolean(c.component_Variant_Id && c.unit_Of_Measurement_Id))
    : [];

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
    there_Are_Units: finalThereAreUnits,
    minimum_Alert_Level: Number(data.minimum_Alert_Level ?? data.minimumAlertLevel ?? 0) || 0,
    maximum_Stock_Level: Number(data.maximum_Stock_Level ?? data.maximumStockLevel ?? 0) || 0,
    barcode_Option: barcodeOption,
    barcode: barcode,
    qr_Code: data.qr_Code || data.qrCode || null,
    cost_Price: costPrice,
    consumer_Price: consumerPrice,
    wholesale_Price: wholesalePrice,
    last_Purchase_Price: lastPurchasePrice,
    average_Purchase_Price: averagePurchasePrice,
    product_Units: mappedUnits,
    product_Components: components,
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
  let rawVariants = data.updateProductvariants || data.createProductvariants;

  const defaultVariantId =
    toGuidOrNull(
      data.variant_id ||
      data.variantId ||
      data.variants?.[0]?.id ||
      data.raw?.variants?.[0]?.id ||
      data.id
    ) || "00000000-0000-0000-0000-000000000000";

  const defaultUnitId =
    toGuidOrNull(
      data.unit_id ||
      data.unitId ||
      data.variants?.[0]?.productUnitDtos?.[0]?.id ||
      data.raw?.variants?.[0]?.productUnitDtos?.[0]?.id
    ) || "00000000-0000-0000-0000-000000000000";

  // If updateProductvariants / createProductvariants not provided, but product_Units is provided
  if (!rawVariants && Array.isArray(data.product_Units) && data.product_Units.length > 0) {
    rawVariants = data.product_Units.map((u, idx) => {
      const uId =
        toGuidOrNull(
          u.unit_id ||
          u.unitId ||
          u.id ||
          data.variants?.[0]?.productUnitDtos?.[idx]?.id ||
          data.raw?.variants?.[0]?.productUnitDtos?.[idx]?.id
        ) || defaultUnitId;

      const vId =
        toGuidOrNull(
          u.variant_id ||
          u.variantId ||
          data.variants?.[0]?.id ||
          data.raw?.variants?.[0]?.id
        ) || defaultVariantId;

      return {
        variant_id: vId,
        unit_id: uId,
        minimum_Alert_Level: Number(u.minimum_Alert_Level ?? data.minimum_Alert_Level ?? data.variants?.[0]?.minimum_Alert_Level ?? 0) || 0,
        maximum_Stock_Level: Number(u.maximum_Stock_Level ?? data.maximum_Stock_Level ?? data.variants?.[0]?.maximum_Stock_Level ?? 0) || 0,
        barcode_Option: u.barcode_Option || data.barcode_Option || "Manual",
        barcode: u.barcode || (idx === 0 ? data.barcode : null) || null,
        qr_Code: u.qr_Code || u.qrCode || (idx === 0 ? data.qr_Code : null) || null,
        cost_Price: Number(u.cost_Price ?? (idx === 0 ? data.cost_Price : 0) ?? 0) || 0,
        consumer_Price: Number(u.consumer_Price ?? (idx === 0 ? data.consumer_Price : 0) ?? 0) || 0,
        wholesale_Price: Number(u.wholesale_Price ?? (idx === 0 ? data.wholesale_Price : 0) ?? 0) || 0,
        last_Purchase_Price: Number(u.last_Purchase_Price ?? (idx === 0 ? data.last_Purchase_Price : 0) ?? 0) || 0,
        average_Purchase_Price: Number(u.average_Purchase_Price ?? (idx === 0 ? data.average_Purchase_Price : 0) ?? 0) || 0,
        unit_Of_Measurement_Id: toGuidOrNull(
          u.unit_Of_Measurement_Id ||
          u.unitOfMeasurementId ||
          (idx === 0 ? data.unit_Of_Measurement_Id : null) ||
          data.variants?.[0]?.productUnitDtos?.[idx]?.unit_Of_Measurement_Id ||
          "33333333-3333-3333-3333-333333333333"
        ) || "33333333-3333-3333-3333-333333333333",
        secondunit_Of_Measurement_Id: toGuidOrNull(u.secondunit_Of_Measurement_Id || u.secondunitId),
        relative_factor: Number(u.relative_factor ?? u.conversion_Factor ?? 0) || 0,
        variant_Values: [],
      };
    });
  }

  // If still not provided, check backend data.variants
  if (!rawVariants && Array.isArray(data.variants) && data.variants.length > 0) {
    const flattened = [];
    data.variants.forEach((v) => {
      const vUnits = Array.isArray(v.productUnitDtos) && v.productUnitDtos.length > 0 ? v.productUnitDtos : [{}];
      vUnits.forEach((uDto) => {
        flattened.push({
          variant_id: toGuidOrNull(v.id) || defaultVariantId,
          unit_id: toGuidOrNull(uDto.id) || defaultUnitId,
          minimum_Alert_Level: Number(v.minimum_Alert_Level ?? data.minimum_Alert_Level ?? 0) || 0,
          maximum_Stock_Level: Number(v.maximum_Stock_Level ?? data.maximum_Stock_Level ?? 0) || 0,
          barcode_Option: uDto.barcode_Option || data.barcode_Option || "Manual",
          barcode: uDto.barcode || data.barcode || null,
          qr_Code: uDto.qr_code || uDto.qrCode || data.qr_Code || null,
          cost_Price: Number(uDto.cost_Price ?? data.cost_Price ?? 0) || 0,
          consumer_Price: Number(uDto.consumer_Price ?? data.consumer_Price ?? 0) || 0,
          wholesale_Price: Number(uDto.wholesale_Price ?? data.wholesale_Price ?? 0) || 0,
          last_Purchase_Price: Number(uDto.last_Purchase_Price ?? data.last_Purchase_Price ?? 0) || 0,
          average_Purchase_Price: Number(uDto.average_Purchase_Price ?? data.average_Purchase_Price ?? 0) || 0,
          unit_Of_Measurement_Id: toGuidOrNull(
            uDto.unit_Of_Measurement_Id ||
            data.unit_Of_Measurement_Id ||
            "33333333-3333-3333-3333-333333333333"
          ) || "33333333-3333-3333-3333-333333333333",
          secondunit_Of_Measurement_Id: toGuidOrNull(uDto.secondunit_Of_Measurement_Id),
          relative_factor: Number(uDto.conversion_Factor ?? uDto.relative_factor ?? 0) || 0,
          variant_Values: Array.isArray(v.variantValues)
            ? v.variantValues
                .map((val) => ({
                  productAttributeValueId: toGuidOrNull(val.product_Attribute_Value_Id || val.productAttributeValueId),
                }))
                .filter((vv) => Boolean(vv.productAttributeValueId))
            : [],
        });
      });
    });
    rawVariants = flattened;
  }

  // If still empty (e.g. single item with no units array), build single variant entry
  if (!rawVariants || rawVariants.length === 0) {
    rawVariants = [
      {
        variant_id: defaultVariantId,
        unit_id: defaultUnitId,
        minimum_Alert_Level: Number(data.minimum_Alert_Level ?? 0) || 0,
        maximum_Stock_Level: Number(data.maximum_Stock_Level ?? 0) || 0,
        barcode_Option: data.barcode_Option || "Manual",
        barcode: data.barcode || null,
        qr_Code: data.qr_Code || null,
        cost_Price: Number(data.cost_Price ?? 0) || 0,
        consumer_Price: Number(data.consumer_Price ?? 0) || 0,
        wholesale_Price: Number(data.wholesale_Price ?? 0) || 0,
        last_Purchase_Price: Number(data.last_Purchase_Price ?? 0) || 0,
        average_Purchase_Price: Number(data.average_Purchase_Price ?? 0) || 0,
        unit_Of_Measurement_Id: toGuidOrNull(
          data.unit_Of_Measurement_Id ||
          data.variants?.[0]?.productUnitDtos?.[0]?.unit_Of_Measurement_Id ||
          "33333333-3333-3333-3333-333333333333"
        ) || "33333333-3333-3333-3333-333333333333",
        secondunit_Of_Measurement_Id: toGuidOrNull(data.secondunit_Of_Measurement_Id),
        relative_factor: 0,
        variant_Values: [],
      },
    ];
  }

  const mappedVariants = Array.isArray(rawVariants)
    ? rawVariants
        .map((v) => buildUpdateFlatProductVariantCardDto(v, data))
        .filter((v) => Boolean(v.unit_Of_Measurement_Id))
    : [];

  return {
    id: toGuidOrNull(data.id),
    name_Product: (data.name_Product || data.name || "").trim(),
    product_Number: (data.product_Number || data.productNumber || "").trim(),
    has_Expiry_Date: Boolean(data.has_Expiry_Date ?? data.hasExpiryDate ?? false),
    is_Tracking_Inventory: Boolean(data.is_Tracking_Inventory ?? data.isTrackingInventory ?? true),
    category_Id: toGuidOrNull(data.category_Id || data.categoryId || data.category),
    requires_Shipping: Boolean(data.requires_Shipping ?? data.requiresShipping ?? false),
    there_Are_Units: Boolean(data.there_Are_Units ?? data.thereAreUnits ?? (mappedVariants.length > 1)),
    revenue_Account_Id: toGuidOrNull(data.revenue_Account_Id || data.revenueAccountId || data.revenueAccount),
    expense_Account_Id: toGuidOrNull(data.expense_Account_Id || data.expenseAccountId || data.expenseAccount),
    inventory_Account_Id: toGuidOrNull(data.inventory_Account_Id || data.inventoryAccountId || data.inventoryAccount),
    updateProductvariants: mappedVariants,
  };
}

export function buildCreateProductServiceDto(data = {}) {
  const cost = Number(data.cost_Price ?? data.costPrice ?? 0) || 0;
  const consumer = Number(data.consumer_Price ?? data.consumerPrice ?? 0) || 0;

  return {
    name_Product: (data.name_Product || data.name || "").trim(),
    product_Number: (data.product_Number || data.productNumber || String(Math.floor(100000 + Math.random() * 900000))).trim(),
    has_Expiry_Date: Boolean(data.has_Expiry_Date ?? data.hasExpiryDate ?? false),
    category_Id: toGuidOrNull(data.category_Id || data.categoryId || data.category),
    can_Be_Sold: Boolean(data.can_Be_Sold ?? data.canBeSold ?? true),
    requires_Contract: Boolean(data.requires_Contract ?? data.requiresContract ?? false),
    requires_Scheduling: Boolean(data.requires_Scheduling ?? data.requiresScheduling ?? false),
    has_Variants: Boolean(data.has_Variants ?? data.hasVariants ?? false),
    revenue_Account_Id: toGuidOrNull(data.revenue_Account_Id || data.revenueAccountId || data.revenueAccount),
    expense_Account_Id: toGuidOrNull(data.expense_Account_Id || data.expenseAccountId || data.expenseAccount),
    billing_Method: data.billing_Method || data.billingMethod || "FixedPrice",
    cost_Price: cost,
    consumer_Price: consumer,
  };
}

export function normalizeBillingMethod(val) {
  if (!val) return "FixedPrice";
  const str = String(val).trim();
  const lower = str.toLowerCase();

  if (
    lower === "fixedprice" ||
    lower === "fixed" ||
    lower === "per-visit" ||
    lower === "package" ||
    lower === "project" ||
    lower.includes("مقطوع") ||
    lower.includes("ثابت")
  ) {
    return "FixedPrice";
  }
  if (lower === "hourly" || lower === "hour" || lower.includes("ساعة")) {
    return "Hourly";
  }
  if (lower === "daily" || lower === "day" || lower.includes("يوم")) {
    return "Daily";
  }
  if (lower === "monthly" || lower === "month" || lower.includes("شهر")) {
    return "Monthly";
  }
  if (lower === "quantitybased" || lower === "quantity" || lower.includes("كمية")) {
    return "QuantityBased";
  }
  return "FixedPrice";
}

export function buildUpdateProductAppointmentDto(data = {}) {
  const cost = Number(data.cost_Price ?? data.costPrice ?? 0) || 0;
  const consumer = Number(data.consumer_Price ?? data.consumerPrice ?? 0) || 0;
  const deposit = Number(data.default_Deposit_Amount ?? data.defaultInsuranceQty ?? data.deposit ?? 0) || 0;
  const duration = Math.round(Number(data.default_Duration_Minutes ?? data.defaultDuration ?? 0)) || 0;

  return {
    id: toGuidOrNull(data.id),
    name_Product: (data.name_Product || data.name || "").trim(),
    product_Number: (data.product_Number || data.productNumber || "").trim(),
    has_Expiry_Date: Boolean(data.has_Expiry_Date ?? data.hasExpiryDate ?? false),
    category_Id: toGuidOrNull(data.category_Id || data.categoryId || data.category),
    billing_Method: normalizeBillingMethod(data.billing_Method || data.billingMethod),
    can_Be_Sold: Boolean(data.can_Be_Sold ?? data.canBeSold ?? true),
    requires_Contract: Boolean(data.requires_Contract ?? data.requiresContract ?? false),
    revenue_Account_Id: toGuidOrNull(data.revenue_Account_Id || data.revenueAccountId || data.revenueAccount),
    expense_Account_Id: toGuidOrNull(data.expense_Account_Id || data.expenseAccountId || data.expenseAccount),
    cost_Price: cost,
    consumer_Price: consumer,
    default_Deposit_Amount: deposit,
    default_Duration_Minutes: duration,
  };
}

export async function updateAppointmentProduct(data) {
  const cleanDto = buildUpdateProductAppointmentDto(data);
  return apiHandler({
    endPoint: "Inventory/Product/UpdateAppointment/UpdateAppointment",
    method: "POST",
    body: cleanDto,
  });
}

export function buildUpdateProductReservationDto(data = {}) {
  const cost = Number(data.cost_Price ?? data.costPrice ?? 0) || 0;
  const consumer = Number(data.consumer_Price ?? data.consumerPrice ?? 0) || 0;
  const deposit = Number(data.default_Deposit_Amount ?? data.defaultInsuranceQty ?? data.deposit ?? 0) || 0;
  const duration = Math.round(Number(data.default_Duration_Minutes ?? data.defaultDuration ?? 0)) || 0;

  return {
    id: toGuidOrNull(data.id),
    name_Product: (data.name_Product || data.name || "").trim(),
    product_Number: (data.product_Number || data.productNumber || "").trim(),
    has_Expiry_Date: Boolean(data.has_Expiry_Date ?? data.hasExpiryDate ?? false),
    category_Id: toGuidOrNull(data.category_Id || data.categoryId || data.category),
    billing_Method: normalizeBillingMethod(data.billing_Method || data.billingMethod),
    can_Be_Sold: Boolean(data.can_Be_Sold ?? data.canBeSold ?? true),
    requires_Contract: Boolean(data.requires_Contract ?? data.requiresContract ?? false),
    revenue_Account_Id: toGuidOrNull(data.revenue_Account_Id || data.revenueAccountId || data.revenueAccount),
    expense_Account_Id: toGuidOrNull(data.expense_Account_Id || data.expenseAccountId || data.expenseAccount),
    cost_Price: cost,
    consumer_Price: consumer,
    default_Deposit_Amount: deposit,
    default_Duration_Minutes: duration,
  };
}

export async function updateReservationProduct(data) {
  const cleanDto = buildUpdateProductReservationDto(data);
  return apiHandler({
    endPoint: "Inventory/Product/UpdateReservation/UpdateReservation",
    method: "POST",
    body: cleanDto,
  });
}

export function buildUpdateProductServiceDto(data = {}) {
  const cost = Number(data.cost_Price ?? data.costPrice ?? 0) || 0;
  const consumer = Number(data.consumer_Price ?? data.consumerPrice ?? 0) || 0;

  return {
    id: toGuidOrNull(data.id),
    name_Product: (data.name_Product || data.name || "").trim(),
    product_Number: (data.product_Number || data.productNumber || "").trim(),
    has_Expiry_Date: Boolean(data.has_Expiry_Date ?? data.hasExpiryDate ?? false),
    billing_Method: normalizeBillingMethod(data.billing_Method || data.billingMethod),
    can_Be_Sold: Boolean(data.can_Be_Sold ?? data.canBeSold ?? true),
    requires_Contract: Boolean(data.requires_Contract ?? data.requiresContract ?? false),
    requires_Scheduling: Boolean(data.requires_Scheduling ?? data.requiresScheduling ?? false),
    category_Id: toGuidOrNull(data.category_Id || data.categoryId || data.category),
    revenue_Account_Id: toGuidOrNull(data.revenue_Account_Id || data.revenueAccountId || data.revenueAccount),
    expense_Account_Id: toGuidOrNull(data.expense_Account_Id || data.expenseAccountId || data.expenseAccount),
    cost_Price: cost,
    consumer_Price: consumer,
  };
}

export async function updateService(data) {
  const pType = data.product_Type || data.productType;
  if (pType === "Reservation") {
    return updateReservationProduct(data);
  }
  if (pType === "Appointment") {
    return updateAppointmentProduct(data);
  }
  if (pType === "Assembly") {
    return updateAssemblyWithoutSpecs(data);
  }
  if (pType === "Bundle") {
    return updateBundleWithoutSpecs(data);
  }
  if (pType === "Rental") {
    return updateRentalProduct(data.id, data);
  }

  try {
    return await updateAppointmentProduct(data);
  } catch {
    const cleanDto = buildUpdateProductServiceDto(data);
    return apiHandler({
      endPoint: "Inventory/Product/UpdateProductService/service",
      method: "POST",
      body: cleanDto,
    });
  }
}

export function buildCreateBundleDto(data = {}) {
  const cost = Number(data.cost_Price ?? data.costPrice ?? 0) || 0;
  const consumer = Number(data.consumer_Price ?? data.consumerPrice ?? 0) || 0;

  const components = Array.isArray(data.product_Components || data.productComponents)
    ? (data.product_Components || data.productComponents)
        .map(buildCreateProductComponentDto)
        .filter((c) => Boolean(c.component_Variant_Id && c.unit_Of_Measurement_Id))
    : [];

  return {
    name_Product: (data.name_Product || data.name || "").trim(),
    product_Number: (data.product_Number || data.productNumber || String(Math.floor(100000 + Math.random() * 900000))).trim(),
    has_Expiry_Date: Boolean(data.has_Expiry_Date ?? data.hasExpiryDate ?? false),
    category_Id: toGuidOrNull(data.category_Id || data.categoryId || data.category),
    requires_Shipping: Boolean(data.requires_Shipping ?? data.requiresShipping ?? false),
    requires_Contract: Boolean(data.requires_Contract ?? data.requiresContract ?? false),
    revenue_Account_Id: toGuidOrNull(data.revenue_Account_Id || data.revenueAccountId || data.revenueAccount),
    expense_Account_Id: toGuidOrNull(data.expense_Account_Id || data.expenseAccountId || data.expenseAccount),
    cost_Price: cost,
    consumer_Price: consumer,
    product_Components: components,
  };
}

export async function createBundleWithoutSpecs(data) {
  const cleanDto = buildCreateBundleDto(data);
  return apiHandler({
    endPoint: "Inventory/Product/CreateBundleWithoutSpecs",
    method: "POST",
    body: cleanDto,
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

export function buildCreateProductAssemblyWithoutSpecsDto(data = {}) {
  const costPrice = Number(data.cost_Price ?? data.costPrice ?? 0) || 0;
  const consumerPrice = Number(data.consumer_Price ?? data.consumerPrice ?? 0) || 0;
  const wholesalePrice = Number(data.wholesale_Price ?? data.wholesalePrice ?? 0) || 0;
  const lastPurchasePrice = Number(data.last_Purchase_Price ?? data.lastPurchasePrice ?? 0) || 0;
  const averagePurchasePrice = Number(data.average_Purchase_Price ?? data.averagePurchasePrice ?? 0) || 0;

  let barcodeOption = data.barcode_Option || data.barcodeOption || "Manual";
  const barcode = (data.barcode || "").trim() || null;
  if (!barcode && barcodeOption === "Manual") {
    barcodeOption = "AutoGenerate";
  }

  const requestedThereAreUnits = Boolean(data.there_Are_Units ?? data.thereAreUnits ?? false);

  let rawUnits = Array.isArray(data.product_Units || data.productUnits)
    ? (data.product_Units || data.productUnits)
    : [];

  const additionalRawUnits = rawUnits.filter((u) => !isPieceUnit(u));

  let mappedUnits = [];
  if (requestedThereAreUnits && additionalRawUnits.length > 0) {
    mappedUnits = additionalRawUnits
      .map((u) => {
        const dto = buildCreateProductUnitDto(u, data);
        if (!dto.secondunit_Of_Measurement_Id) {
          dto.secondunit_Of_Measurement_Id = DEFAULT_PIECE_UNIT_ID;
        }
        return dto;
      })
      .filter((u) => Boolean(u.unit_Of_Measurement_Id) && !isPieceUnit(u));
  }

  const finalThereAreUnits = mappedUnits.length > 0;

  const components = Array.isArray(data.product_Components || data.productComponents)
    ? (data.product_Components || data.productComponents)
        .map(buildCreateProductComponentDto)
        .filter((c) => Boolean(c.component_Variant_Id && c.unit_Of_Measurement_Id))
    : [];

  return {
    name_Product: (data.name_Product || data.name || "").trim(),
    product_Number: (data.product_Number || data.productNumber || String(Math.floor(100000 + Math.random() * 900000))).trim(),
    has_Expiry_Date: Boolean(data.has_Expiry_Date ?? data.hasExpiryDate ?? false),
    is_Tracking_Inventory: Boolean(data.is_Tracking_Inventory ?? data.isTrackingInventory ?? true),
    category_Id: toGuidOrNull(data.category_Id || data.categoryId || data.category),
    requires_Shipping: Boolean(data.requires_Shipping ?? data.requiresShipping ?? false),
    revenue_Account_Id: toGuidOrNull(data.revenue_Account_Id || data.revenueAccountId || data.revenueAccount),
    expense_Account_Id: toGuidOrNull(data.expense_Account_Id || data.expenseAccountId || data.expenseAccount),
    there_Are_Units: finalThereAreUnits,
    minimum_Alert_Level: Number(data.minimum_Alert_Level ?? data.minimumAlertLevel ?? 0) || 0,
    maximum_Stock_Level: Number(data.maximum_Stock_Level ?? data.maximumStockLevel ?? 0) || 0,
    barcode_Option: barcodeOption,
    barcode: barcode,
    qr_Code: data.qr_Code || data.qrCode || null,
    cost_Price: costPrice,
    consumer_Price: consumerPrice,
    wholesale_Price: wholesalePrice,
    last_Purchase_Price: lastPurchasePrice,
    average_Purchase_Price: averagePurchasePrice,
    product_Units: mappedUnits,
    product_Components: components,
  };
}

export async function createAssemblyWithoutSpecs(data) {
  const cleanDto = buildCreateProductAssemblyWithoutSpecsDto(data);
  return apiHandler({
    endPoint: "Inventory/Product/CreateAssemblyWithoutSpecs",
    method: "POST",
    body: cleanDto,
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

export function buildCreateProductWithSpecsDto(data = {}) {
  const rawVariants = data.createProductvariants || data.variants || [];
  const mappedVariants = rawVariants.map((v) => {
    let bOption = v.barcode_Option || data.barcode_Option || "Manual";
    const bCode = (v.barcode || "").trim() || null;
    if (!bCode && bOption === "Manual") {
      bOption = "AutoGenerate";
    }

    return {
      minimum_Alert_Level: Number(v.minimum_Alert_Level ?? data.minimum_Alert_Level ?? 0) || 0,
      maximum_Stock_Level: Number(v.maximum_Stock_Level ?? data.maximumStockLevel ?? 0) || 0,
      barcode_Option: bOption,
      barcode: bCode,
      qr_Code: v.qr_Code || null,
      cost_Price: Number(v.cost_Price ?? data.cost_Price ?? 0) || 0,
      consumer_Price: Number(v.consumer_Price ?? data.consumer_Price ?? 0) || 0,
      wholesale_Price: Number(v.wholesale_Price ?? data.wholesale_Price ?? 0) || 0,
      last_Purchase_Price: Number(v.last_Purchase_Price ?? data.last_Purchase_Price ?? 0) || 0,
      average_Purchase_Price: Number(v.average_Purchase_Price ?? data.average_Purchase_Price ?? 0) || 0,
      unit_Of_Measurement_Id: toGuidOrNull(
        v.unit_Of_Measurement_Id ||
        v.unitOfMeasurementId ||
        v.unit_Name_Id ||
        data.unit_Of_Measurement_Id
      ) || DEFAULT_PIECE_UNIT_ID,
      secondunit_Of_Measurement_Id: toGuidOrNull(v.secondunit_Of_Measurement_Id),
      relative_factor: Number(v.relative_factor ?? 1) || 1,
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
  }).filter((v) => Boolean(v.unit_Of_Measurement_Id));

  return {
    name_Product: (data.name_Product || data.name || "").trim(),
    product_Number: (data.product_Number || data.productNumber || String(Math.floor(100000 + Math.random() * 900000))).trim(),
    has_Expiry_Date: Boolean(data.has_Expiry_Date ?? data.hasExpiryDate ?? false),
    is_Tracking_Inventory: Boolean(data.is_Tracking_Inventory ?? data.isTrackingInventory ?? true),
    category_Id: toGuidOrNull(data.category_Id || data.categoryId || data.category),
    requires_Shipping: Boolean(data.requires_Shipping ?? data.requiresShipping ?? false),
    there_Are_Units: Boolean(data.there_Are_Units ?? data.thereAreUnits ?? (mappedVariants.length > 1)),
    revenue_Account_Id: toGuidOrNull(data.revenue_Account_Id || data.revenueAccountId || data.revenueAccount),
    expense_Account_Id: toGuidOrNull(data.expense_Account_Id || data.expenseAccountId || data.expenseAccount),
    inventory_Account_Id: toGuidOrNull(data.inventory_Account_Id || data.inventoryAccountId || data.inventoryAccount),
    createProductvariants: mappedVariants,
  };
}

export async function createSimpleProductWithSpecs(data) {
  const cleanDto = buildCreateProductWithSpecsDto(data);
  return apiHandler({
    endPoint: "Inventory/Product/CreateSimpleProductWithSpecs",
    method: "POST",
    body: cleanDto,
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

export function buildCreateProductWithoutSpecsDto(data = {}) {
  const costPrice = Number(data.cost_Price ?? data.costPrice ?? 0) || 0;
  const consumerPrice = Number(data.consumer_Price ?? data.consumerPrice ?? 0) || 0;
  const wholesalePrice = Number(data.wholesale_Price ?? data.wholesalePrice ?? 0) || 0;
  const lastPurchasePrice = Number(data.last_Purchase_Price ?? data.lastPurchasePrice ?? 0) || 0;
  const averagePurchasePrice = Number(data.average_Purchase_Price ?? data.averagePurchasePrice ?? 0) || 0;

  let barcodeOption = data.barcode_Option || data.barcodeOption || "Manual";
  const barcode = (data.barcode || "").trim() || null;
  if (!barcode && barcodeOption === "Manual") {
    barcodeOption = "AutoGenerate";
  }

  const requestedThereAreUnits = Boolean(data.there_Are_Units ?? data.thereAreUnits ?? false);

  let rawUnits = Array.isArray(data.product_Units || data.productUnits)
    ? (data.product_Units || data.productUnits)
    : [];

  const additionalRawUnits = rawUnits.filter((u) => !isPieceUnit(u));

  let mappedUnits = [];
  if (requestedThereAreUnits && additionalRawUnits.length > 0) {
    mappedUnits = additionalRawUnits
      .map((u) => {
        const dto = buildCreateProductUnitDto(u, data);
        if (!dto.secondunit_Of_Measurement_Id) {
          dto.secondunit_Of_Measurement_Id = DEFAULT_PIECE_UNIT_ID;
        }
        return dto;
      })
      .filter((u) => Boolean(u.unit_Of_Measurement_Id) && !isPieceUnit(u));
  }

  const finalThereAreUnits = mappedUnits.length > 0;

  return {
    name_Product: (data.name_Product || data.name || "").trim(),
    product_Number: (data.product_Number || data.productNumber || String(Math.floor(100000 + Math.random() * 900000))).trim(),
    has_Expiry_Date: Boolean(data.has_Expiry_Date ?? data.hasExpiryDate ?? false),
    is_Tracking_Inventory: Boolean(data.is_Tracking_Inventory ?? data.isTrackingInventory ?? true),
    category_Id: toGuidOrNull(data.category_Id || data.categoryId || data.category),
    requires_Shipping: Boolean(data.requires_Shipping ?? data.requiresShipping ?? false),
    there_Are_Units: finalThereAreUnits,
    revenue_Account_Id: toGuidOrNull(data.revenue_Account_Id || data.revenueAccountId || data.revenueAccount),
    expense_Account_Id: toGuidOrNull(data.expense_Account_Id || data.expenseAccountId || data.expenseAccount),
    inventory_Account_Id: toGuidOrNull(data.inventory_Account_Id || data.inventoryAccountId || data.inventoryAccount),
    minimum_Alert_Level: Number(data.minimum_Alert_Level ?? data.minimumAlertLevel ?? 0) || 0,
    maximum_Stock_Level: Number(data.maximum_Stock_Level ?? data.maximumStockLevel ?? 0) || 0,
    barcode_Option: barcodeOption,
    barcode: barcode,
    qr_Code: data.qr_Code || data.qrCode || null,
    cost_Price: costPrice,
    consumer_Price: consumerPrice,
    wholesale_Price: wholesalePrice,
    last_Purchase_Price: lastPurchasePrice,
    average_Purchase_Price: averagePurchasePrice,
    product_Units: mappedUnits,
  };
}

export async function createSimpleProductWithoutSpecs(data) {
  const cleanDto = buildCreateProductWithoutSpecsDto(data);
  return apiHandler({
    endPoint: "Inventory/Product/CreateSimpleProductWithoutSpecs",
    method: "POST",
    body: cleanDto,
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

export const RENTAL_BILLING_METHOD_UNITS = {
  Hourly: "11111111-1111-1111-1111-111111111111", // HOUR
  Daily: "22222222-2222-2222-2222-222222222222",  // DAY
  Monthly: "44444444-4444-4444-4444-444444444444", // MONTH
};

export const SUPPORTED_RENTAL_UNIT_IDS = new Set([
  "11111111-1111-1111-1111-111111111111", // HOUR
  "22222222-2222-2222-2222-222222222222", // DAY
  "44444444-4444-4444-4444-444444444444", // MONTH
  "66666666-6666-6666-6666-666666666666", // WEEK
  "77777777-7777-7777-7777-777777777777", // YEAR
]);

export function getDefaultRentalUnitId(billingMethod) {
  const method = String(billingMethod || "").trim();
  if (/^hour/i.test(method)) return RENTAL_BILLING_METHOD_UNITS.Hourly;
  if (/^month/i.test(method)) return RENTAL_BILLING_METHOD_UNITS.Monthly;
  return RENTAL_BILLING_METHOD_UNITS.Daily;
}

export function buildRentalProductDto(data = {}, isUpdate = false) {
  const costPrice = Number(data.cost_Price ?? data.costPrice ?? 0) || 0;
  const consumerPrice = Number(data.consumer_Price ?? data.consumerPrice ?? 0) || 0;

  // Rental billing method must be Hourly, Daily, or Monthly
  let billingMethod = data.billing_Method || data.billingMethod || "Daily";
  if (billingMethod === "FixedPrice" || billingMethod === "QuantityBased" || billingMethod === "Weekly") {
    billingMethod = "Daily";
  }

  const defaultUnitId = getDefaultRentalUnitId(billingMethod);

  let units = [];
  const rawUnits =
    data.productUnitrental ||
    data.product_Unit_Rental ||
    data.productUnits ||
    data.units;

  if (Array.isArray(rawUnits) && rawUnits.length > 0) {
    units = rawUnits
      .map((u) => {
        const uomId = toGuidOrNull(
          u.unitOfMeasurmentId ||
          u.unitOfMeasurementId ||
          u.unit_Of_Measurement_Id ||
          u.unit_Name_Id ||
          u.unit_id ||
          u.unitId ||
          u.id
        );
        if (!uomId) return null;
        // Never include the default unit in productUnitrental (backend automatically provisions it)
        if (uomId.toLowerCase() === defaultUnitId.toLowerCase()) return null;
        return {
          unitOfMeasurmentId: uomId,
          cost_Price: Number(u.cost_Price ?? u.costPrice ?? costPrice) || 0,
          consumer_Price: Number(u.consumer_Price ?? u.consumerPrice ?? consumerPrice) || 0,
        };
      })
      .filter(Boolean);
  }

  const dto = {
    name_Product: (data.name_Product || data.name || "").trim(),
    product_Number: (data.product_Number || data.productNumber || "").trim(),
    has_Expiry_Date: Boolean(data.has_Expiry_Date ?? data.hasExpiryDate ?? false),
    category_Id: toGuidOrNull(data.category_Id || data.categoryId || data.category),
    can_Be_Sold: Boolean(data.can_Be_Sold ?? data.canBeSold ?? true),
    requires_Contract: Boolean(data.requires_Contract ?? data.requiresContract ?? true),
    default_Deposit_Amount:
      Number(
        data.default_Deposit_Amount ??
        data.defaultDepositAmount ??
        data.defaultInsuranceQty ??
        0
      ) || 0,
    revenue_Account_Id: toGuidOrNull(
      data.revenue_Account_Id || data.revenueAccountId || data.revenueAccount
    ),
    expense_Account_Id: toGuidOrNull(
      data.expense_Account_Id || data.expenseAccountId || data.expenseAccount
    ),
    billing_Method: billingMethod,
    cost_Price: costPrice,
    consumer_Price: consumerPrice,
    productUnitrental: units,
  };

  const idVal = toGuidOrNull(data.id);
  if (isUpdate || idVal) {
    dto.id = idVal;
  }

  return dto;
}

/**
 * Create Rental Product
 * Endpoint: POST /api/Inventory/Product/CreateRenatal
 */
export async function createRentalProduct(data) {
  const cleanDto = buildRentalProductDto(data, false);
  return apiHandler({
    endPoint: "Inventory/Product/CreateRenatal",
    method: "POST",
    body: cleanDto,
  });
}

/**
 * Update Rental Product
 * Endpoint: POST /api/Inventory/Product/UpdateRental/{id}
 * Fallback: POST /api/Inventory/Product/UpdateProduct/Update + ProductUnit price sync
 */
export async function updateRentalProduct(id, data) {
  const cleanId = toGuidOrNull(id || data?.id);
  const cleanDto = buildRentalProductDto({ ...data, id: cleanId }, true);

  try {
    return await apiHandler({
      endPoint: `Inventory/Product/UpdateRental/${cleanId}`,
      method: "POST",
      body: cleanDto,
    });
  } catch (error) {
    console.warn("UpdateRental endpoint failed, using UpdateProduct fallback:", error?.message);

    const updateProductDto = {
      id: cleanId,
      name_Product: cleanDto.name_Product,
      product_Number: cleanDto.product_Number,
      has_Specifications: false,
      is_Tracking_Inventory: false,
      category_Id: cleanDto.category_Id,
      has_Expiry_Date: cleanDto.has_Expiry_Date,
      origin_Id: null,
      can_Be_Sold: cleanDto.can_Be_Sold,
      can_Be_Purchased: true,
      requires_Shipping: false,
      requires_Contract: cleanDto.requires_Contract,
      requires_Scheduling: true,
      has_Variants: false,
      is_Fixed_Price: false,
      revenue_Account_Id: cleanDto.revenue_Account_Id,
      expense_Account_Id: cleanDto.expense_Account_Id,
      inventory_Account_Id: null,
      product_Type: "Rental",
      billing_Method: cleanDto.billing_Method,
    };

    const updateRes = await apiHandler({
      endPoint: "Inventory/Product/UpdateProduct/Update",
      method: "POST",
      body: updateProductDto,
    });

    try {
      const getRes = await getProductById(cleanId);
      const productData = getRes?.data?.data || getRes?.data;
      const variant = productData?.variants?.[0];
      const existingUnits = variant?.productUnitDtos || [];

      // Sync default unit price
      const defaultUnit = existingUnits.find((u) => u.is_Default_Selling) || existingUnits[0];
      if (defaultUnit?.id && cleanDto.consumer_Price > 0) {
        await apiHandler({
          endPoint: "Inventory/ProductUnit/UpdatePrices/UpdatePrices",
          method: "POST",
          body: {
            id: defaultUnit.id,
            wholesale_Price: 0,
            consumer_Price: cleanDto.consumer_Price,
          },
        }).catch(() => {});
      }

      // Sync or add additional units
      if (Array.isArray(cleanDto.productUnitrental) && cleanDto.productUnitrental.length > 0) {
        for (const unit of cleanDto.productUnitrental) {
          const match = existingUnits.find(
            (u) =>
              (u.unit_Of_Measurement_Id || u.unitOfMeasurementId)?.toLowerCase() ===
              unit.unitOfMeasurmentId?.toLowerCase()
          );
          if (match?.id) {
            await apiHandler({
              endPoint: "Inventory/ProductUnit/UpdatePrices/UpdatePrices",
              method: "POST",
              body: {
                id: match.id,
                wholesale_Price: 0,
                consumer_Price: unit.consumer_Price,
              },
            }).catch(() => {});
          } else if (variant?.id) {
            await apiHandler({
              endPoint: "Inventory/ProductUnit/AddUnitToVariant/AddUnitToVariant",
              method: "POST",
              body: {
                productvariant_Id: variant.id,
                unit_Of_Measurement_Id: unit.unitOfMeasurmentId,
                relative_factor: 1,
                barcode: null,
                is_Default_Selling: false,
                is_Default_Purchasing: false,
                parent_unit_Of_Measurement_Id: defaultUnit?.unit_Of_Measurement_Id || null,
                barcode_Option: "AutoGenerate",
                qr_code: null,
                cost_Price: unit.cost_Price || 0,
                wholesale_Price: 0,
                consumer_Price: unit.consumer_Price || 0,
              },
            }).catch(() => {});
          }
        }
      }
    } catch (unitErr) {
      console.warn("Could not sync rental unit prices:", unitErr?.message);
    }

    return updateRes;
  }
}

export async function searchMaterialsForInvoice(params) {
  return apiHandler({
    endPoint: "Inventory/Product/SearchMaterialsForInvoice/search-for-invoice",
    method: "GET",
    params,
  });
}

export async function getInventoryPricingLookup(params) {
  return apiHandler({
    endPoint: "HR/Lookups/GetInventoryPricing/GetInventoryPricing",
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

export async function getAllProductUnits(params = { PageNumber: 1, PageSize: 1000 }) {
  return apiHandler({
    endPoint: "Inventory/ProductUnit/GetAllUnits",
    method: "GET",
    params,
  });
}

export async function getProductUnitsLookup(params = { PageNumber: 1, PageSize: 1000 }) {
  return apiHandler({
    endPoint: "HR/Lookups/ProductUnits",
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
