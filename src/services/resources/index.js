import * as resourcesService from "./resources.service";

export * from "./resources.service";

export const resourcesApi = {
  getResources: resourcesService.getResources,
  getResourceById: resourcesService.getResourceById,
  getLookups: resourcesService.getResourceLookups,
  getStats: resourcesService.getResourcesStats,
  createResource: resourcesService.createResource,
  updateResource: resourcesService.updateResource,
  deleteResource: resourcesService.deleteResource,
  changeStatus: resourcesService.changeResourceStatus,
};

export default resourcesApi;
