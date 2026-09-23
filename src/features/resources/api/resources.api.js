import * as legacyResourcesService from "@/services/resources/resources.service";

/**
 * واجهة API قطاع الموارد (Resources Feature API)
 */
export const resourcesApi = {
  getResources: async (params = {}) => {
    return legacyResourcesService.fetchResources(params);
  },
  getResourceById: async (id) => {
    return legacyResourcesService.fetchResourceDetails(id);
  },
  createResource: async (data) => {
    return legacyResourcesService.createResource(data);
  },
  updateResource: async (id, data) => {
    return legacyResourcesService.updateResource(id, data);
  },
  deleteResource: async (id) => {
    return legacyResourcesService.deleteResource(id);
  },
};

export default resourcesApi;
