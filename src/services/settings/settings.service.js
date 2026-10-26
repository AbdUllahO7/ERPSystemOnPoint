import { apiHandler } from "@/lib/api-handler";

// ==========================================
// ACCOUNTING SETTINGS
// ==========================================

export async function getAccountingSettings() {
  return apiHandler({
    endPoint: "accounting/AccountingSettings/GetSettings",
    method: "GET",
  });
}

export async function updateAccountingSettings(data) {
  return apiHandler({
    endPoint: "accounting/AccountingSettings/UpdateSettings/update",
    method: "POST",
    body: data,
  });
}

// ==========================================
// FISCAL YEAR SETTINGS
// ==========================================

export async function getFiscalYearSettings() {
  return apiHandler({
    endPoint: "FiscalYearSettings/get-settings",
    method: "GET",
  });
}

export async function updateFiscalYearSettings(data) {
  return apiHandler({
    endPoint: "FiscalYearSettings/update-settings",
    method: "POST",
    body: data,
  });
}

// ==========================================
// INVENTORY SETTINGS
// ==========================================

export async function getInventorySettings() {
  return apiHandler({
    endPoint: "inventory/InventorySettings/GetSettings/get",
    method: "GET",
  });
}

export async function updateInventorySettings(data) {
  return apiHandler({
    endPoint: "inventory/InventorySettings/UpdateSettings/update",
    method: "POST",
    body: data,
  });
}

// ==========================================
// LANGUAGE & REGION SETTINGS
// ==========================================

export async function getLanguageAndRegionSettings() {
  return apiHandler({
    endPoint: "account/LanguageAndRegionSettings/GetSettings/get-settings",
    method: "GET",
  });
}

export async function updateLanguageAndRegionSettings(data) {
  return apiHandler({
    endPoint: "account/LanguageAndRegionSettings/UpdateSettings/update-settings",
    method: "POST",
    body: data,
  });
}

// ==========================================
// ALERT SETTINGS
// ==========================================

export async function getAlertSettings() {
  return apiHandler({
    endPoint: "saas/AlertSettings/get-all",
    method: "GET",
  });
}

export async function updateAlertSettings(data) {
  return apiHandler({
    endPoint: "saas/AlertSettings/update",
    method: "POST",
    body: data,
  });
}

// ==========================================
// TENANTS & SAAS SETTINGS
// ==========================================

export async function updateTenantSettings(data) {
  return apiHandler({
    endPoint: "saas/Tenants/UpdateSettings/Update",
    method: "POST",
    body: data,
  });
}

export async function getTenants() {
  return apiHandler({
    endPoint: "saas/Tenants/GetAllTenants",
    method: "GET",
  });
}
