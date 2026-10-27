import * as inventoryService from "./inventory.service";

export * from "./inventory.service";

export const inventoryApi = {
  items: {
    getAll: inventoryService.getAllProducts,
    getById: inventoryService.getProductById,
    create: inventoryService.createProduct,
    update: inventoryService.updateSimpleProductWithoutSpecs,
    delete: inventoryService.toggleProductStatus,
  },
  warehouses: {
    getAll: inventoryService.getWarehouses,
    getById: inventoryService.getWarehouseById,
    create: inventoryService.createWarehouse,
    update: inventoryService.updateWarehouse,
    delete: inventoryService.deleteWarehouse,
  },
  transfers: {
    getAll: inventoryService.getAllTransfers,
    getById: inventoryService.getTransferDetails,
    create: inventoryService.addTransfer,
  },
};

export default inventoryApi;
