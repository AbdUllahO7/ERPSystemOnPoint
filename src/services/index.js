/**
 * ============================================================================
 * ERP & Business Domain Services Hub
 * ============================================================================
 * Cleanly organizes all domain services and unified API objects without
 * ambiguous export naming collisions.
 * ============================================================================
 */

// 1. Domain namespaces
export * as accountingService from "./accounting";
export * as appointmentsService from "./appointments";
export * as crmService from "./crm";
export * as ecommerceService from "./ecommerce";
export * as ecommerceContentService from "./ecommerce-content";
export * as ecommerceOrdersService from "./ecommerce-orders";
export * as eventsService from "./events";
export * as hrService from "./hr";
export * as inventoryService from "./inventory";
export * as rentalsService from "./rentals";
export * as reservationsService from "./reservations";
export * as resourcesService from "./resources";
export * as settingsService from "./settings";
export * as websiteBuilderService from "./website-builder";
export * as websiteContentService from "./website-content";

// 2. Direct API Clients
export { accountingApi } from "./accounting";
export { appointmentsApi } from "./appointments";
export { crmApi } from "./crm";
export { ecommerceApi } from "./ecommerce";
export { ecommerceContentApi } from "./ecommerce-content";
export { ecommerceOrdersApi } from "./ecommerce-orders";
export { eventsApi } from "./events";
export { hrApi } from "./hr";
export { inventoryApi } from "./inventory";
export { rentalsApi } from "./rentals";
export { reservationsApi } from "./reservations";
export { resourcesApi } from "./resources";
export { websiteBuilderApi } from "./website-builder";
export { websiteContentApi } from "./website-content";
