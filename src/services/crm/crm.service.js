import { apiHandler } from "@/lib/api-handler";

// ==========================================
// CUSTOMERS
// ==========================================

export async function getAllCustomers(params) {
  return apiHandler({
    endPoint: "inventory/Customer/GetAllCustomers/all-customers",
    method: "GET",
    params,
  });
}

export async function getCustomerById(id) {
  return apiHandler({
    endPoint: `inventory/Customer/GetCustomerById/${id}`,
    method: "GET",
  });
}

export async function createCustomer(data) {
  return apiHandler({
    endPoint: "inventory/Customer/CreateCustomer",
    method: "POST",
    body: data,
  });
}

export async function updateCustomer(data) {
  return apiHandler({
    endPoint: "inventory/Customer/UpdateCustomer",
    method: "POST",
    body: data,
  });
}

export async function deleteCustomer(id) {
  return apiHandler({
    endPoint: `inventory/Customer/DeleteCustomer/${id}`,
    method: "POST",
  });
}

// ==========================================
// CUSTOMER CONTACTS
// ==========================================

export async function getCustomerContacts(data) {
  return apiHandler({
    endPoint: "crm/CustomerContact/GetAll",
    method: "POST",
    body: data,
  });
}

export async function createCustomerContact(data) {
  return apiHandler({
    endPoint: "crm/CustomerContact/Create",
    method: "POST",
    body: data,
  });
}

export async function updateCustomerContact(data) {
  return apiHandler({
    endPoint: "crm/CustomerContact/Update",
    method: "POST",
    body: data,
  });
}

export async function deleteCustomerContact(id) {
  return apiHandler({
    endPoint: `crm/CustomerContact/${id}/ToggleStatus`,
    method: "POST",
  });
}

// ==========================================
// CUSTOMER CONTRACTS
// ==========================================

export async function getCustomerContracts(params) {
  return apiHandler({
    endPoint: "inventory/CustomerContracts/GetAllContracts",
    method: "GET",
    params,
  });
}

export async function getCustomerContractById(id) {
  return apiHandler({
    endPoint: `inventory/CustomerContracts/GetContractById/${id}`,
    method: "GET",
  });
}

export async function createCustomerContract(data) {
  const items = Array.isArray(data.items) && data.items.length > 0
    ? data.items.map((it) => ({
        custom_Item_Name: it.custom_Item_Name || it.name,
        quantity: Number(it.quantity) || 1,
        unit_Price: Number(it.unit_Price || it.unitPrice || it.price) || 0,
        description: it.description || null,
        productVariant_Id: it.productVariant_Id || null,
        unitofmeasurment: it.unitofmeasurment || null,
      }))
    : [
        {
          custom_Item_Name: data.title || "Contract Service",
          quantity: Number(data.quantity) || 1,
          unit_Price: Number(data.unit_Price || data.totalAmount) || 0,
          description: data.description || null,
        },
      ];

  const installments = Array.isArray(data.installments) && data.installments.length > 0
    ? data.installments.map((inst) => ({
        installment_Name: inst.installment_Name || inst.name || "Installment",
        amount: Number(inst.amount) || 0,
        due_Date: inst.due_Date ? new Date(inst.due_Date).toISOString() : new Date().toISOString(),
      }))
    : [
        {
          installment_Name: "Initial Installment",
          amount: Number(data.totalAmount) || 0,
          due_Date: data.startDate ? new Date(data.startDate).toISOString() : new Date().toISOString(),
        },
      ];

  const payload = {
    customerId: data.customerId,
    contractNumber: data.contractNumber || `CC-${Date.now().toString().slice(-5)}`,
    title: data.title,
    description: data.description || "",
    terms_And_Conditions: data.terms_And_Conditions || "",
    startDate: data.startDate ? new Date(data.startDate).toISOString() : new Date().toISOString(),
    endDate: data.endDate ? new Date(data.endDate).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
    totalAmount: Number(data.totalAmount) || 0,
    currencyId: data.currencyId || null,
    remindBeforeDays: Number(data.remindBeforeDays) || 7,
    items,
    installments,
    createProject: data.projectName ? { projectName: data.projectName } : null,
  };

  return apiHandler({
    endPoint: "inventory/CustomerContracts/CreateContract/create",
    method: "POST",
    body: payload,
  });
}

export async function checkoutCustomerContractInstallment(payload) {
  return apiHandler({
    endPoint: "inventory/CustomerContracts/CheckoutContractInstallment/checkout-installment",
    method: "POST",
    body: payload,
  });
}

// ==========================================
// CUSTOMER PROJECTS
// ==========================================

export async function getCustomerProjects(data) {
  return apiHandler({
    endPoint: "inventory/CustomerProjects/GetAllProjects/GetAll",
    method: "GET",
    params: data,
  });
}

export async function getCustomerProjectById(id) {
  return apiHandler({
    endPoint: `inventory/CustomerProjects/GetProjectById/GetById/${id}`,
    method: "GET",
  });
}

export async function createCustomerProject(data) {
  return apiHandler({
    endPoint: "inventory/CustomerProjects/CreateProject/create",
    method: "POST",
    body: data,
  });
}

export async function updateCustomerProject(idOrData, maybeData) {
  let id;
  let body;

  if (maybeData !== undefined) {
    id = idOrData;
    body = { ...maybeData, id };
  } else if (typeof idOrData === "object" && idOrData !== null) {
    id = idOrData.id;
    body = { ...idOrData };
  } else {
    id = idOrData;
    body = { id };
  }

  const cleanId = typeof id === "object" ? (id?.id || id?.original?.id) : id;
  const normalizedId = String(cleanId || "").replace(/^\/+/, "");

  return apiHandler({
    endPoint: `inventory/CustomerProjects/UpdateProject/Update/${normalizedId}`,
    method: "POST",
    body: {
      ...body,
      id: normalizedId,
      projectValue: Number(body.value || body.projectValue || 0),
      value: Number(body.value || body.projectValue || 0),
    },
  });
}

export async function deleteCustomerProject(data) {
  const id = typeof data === "object" && data !== null ? data.id : data;
  return apiHandler({
    endPoint: `inventory/CustomerProjects/DeleteProject/Delete/${id}`,
    method: "POST",
    body: typeof data === "object" ? data : { id },
  });
}

export async function updateProjectPercentage(data) {
  return apiHandler({
    endPoint: "inventory/CustomerProjects/UpdateProjectPercentage/update-percentage",
    method: "POST",
    body: data,
  });
}

// ==========================================
// CUSTOMER NOTES & DOCUMENTS & FOLLOW-UPS
// ==========================================

export async function getCustomerNotes(data) {
  return apiHandler({
    endPoint: "inventory/CustomerNote/GetAll",
    method: "GET",
    params: data,
  });
}

export async function createCustomerNote(data) {
  return apiHandler({
    endPoint: "inventory/CustomerNote/Create",
    method: "POST",
    body: data,
  });
}

export async function updateCustomerNote(data) {
  return apiHandler({
    endPoint: "inventory/CustomerNote/Update",
    method: "POST",
    body: data,
  });
}

export async function deleteCustomerNote(id) {
  return apiHandler({
    endPoint: `inventory/CustomerNote/delete/${id}`,
    method: "POST",
  });
}

export async function getCustomerDocuments(data) {
  return apiHandler({
    endPoint: "inventory/CustomerDocument/GetAll",
    method: "GET",
    params: data,
  });
}

export async function uploadCustomerDocument(formData) {
  return apiHandler({
    endPoint: "inventory/CustomerDocument/Upload",
    method: "POST",
    body: formData,
    isMultipart: true,
  });
}

export async function deleteCustomerDocument(id) {
  return apiHandler({
    endPoint: `inventory/CustomerDocument/${id}`,
    method: "POST",
  });
}

export async function getCustomerFollowUpsTimeline(data) {
  return apiHandler({
    endPoint: "crm/FollowUpCustomer/GetTimeline",
    method: "GET",
    params: data,
  });
}

export async function createCustomerFollowUp(data) {
  return apiHandler({
    endPoint: "crm/FollowUpCustomer/Create",
    method: "POST",
    body: data,
  });
}

export async function updateCustomerFollowUp(data) {
  return apiHandler({
    endPoint: "crm/FollowUpCustomer/Update",
    method: "POST",
    body: data,
  });
}

export async function completeOrCancelCustomerFollowUp(data) {
  return apiHandler({
    endPoint: "crm/FollowUpCustomer/CompleteOrCancel",
    method: "POST",
    body: data,
  });
}

export async function deleteCustomerFollowUp(id) {
  const cleanId = typeof id === "object" ? (id?.id || id?.original?.id) : id;
  const normalizedId = String(cleanId || "").replace(/^\/+/, "");
  return apiHandler({
    endPoint: `crm/FollowUpCustomer/delete${normalizedId}`,
    method: "POST",
  });
}

// ==========================================
// LEADS & LEAD FOLLOW-UPS
// ==========================================

export async function getLeads(params) {
  return apiHandler({
    endPoint: "crm/Lead/GetAll",
    method: "GET",
    params,
  });
}

export async function getLeadById(id) {
  return apiHandler({
    endPoint: `crm/Lead/${id}`,
    method: "GET",
  });
}

export async function createLead(data) {
  return apiHandler({
    endPoint: "crm/Lead/Create",
    method: "POST",
    body: data,
  });
}

export async function updateLead(data) {
  return apiHandler({
    endPoint: "crm/Lead/Update",
    method: "POST",
    body: data,
  });
}

export async function changeLeadStatus(data) {
  return apiHandler({
    endPoint: "crm/Lead/ChangeStatus",
    method: "POST",
    body: data,
  });
}

export async function deleteLead(id) {
  const cleanId = typeof id === "object" ? (id?.id || id?.original?.id) : id;
  const normalizedId = String(cleanId || "").replace(/^\/+/, "");
  return apiHandler({
    endPoint: `crm/Lead/delete${normalizedId}`,
    method: "POST",
  });
}

export async function getLeadDocuments(params) {
  return apiHandler({
    endPoint: "crm/LeadDocument/GetAll",
    method: "GET",
    params,
  });
}

export async function uploadLeadDocument(formData) {
  return apiHandler({
    endPoint: "crm/LeadDocument/Upload",
    method: "POST",
    body: formData,
  });
}

export async function deleteLeadDocument(id) {
  return apiHandler({
    endPoint: `crm/LeadDocument/Delete/${id}`,
    method: "POST",
  });
}

export async function getLeadFollowUpsTimeline(data) {
  return apiHandler({
    endPoint: "crm/FollowUpLead/GetTimeline",
    method: "GET",
    params: data,
  });
}

export async function createFollowUpLead(data) {
  return apiHandler({
    endPoint: "crm/FollowUpLead/Create",
    method: "POST",
    body: data,
  });
}

export async function updateFollowUpStatus(data) {
  return apiHandler({
    endPoint: "crm/FollowUpLead/CompleteOrCancel",
    method: "POST",
    body: data,
  });
}

export async function updateFollowUpLead(data) {
  return apiHandler({
    endPoint: "crm/FollowUpLead/Update",
    method: "POST",
    body: data,
  });
}

export async function deleteFollowUpLead(id) {
  const cleanId = typeof id === "object" ? (id?.id || id?.original?.id) : id;
  const normalizedId = String(cleanId || "").replace(/^\/+/, "");
  return apiHandler({
    endPoint: `crm/FollowUpLead/delete${normalizedId}`,
    method: "POST",
  });
}

// ==========================================
// SUPPLIERS
// ==========================================

export async function getAllSuppliers(params) {
  return apiHandler({
    endPoint: "Inventory/Suppliers/GetAllSuppliers/GetAll",
    method: "GET",
    params,
  });
}

export async function getSupplierById(id) {
  return apiHandler({
    endPoint: `Inventory/Suppliers/GetSupplierById/GetById/${id}`,
    method: "GET",
  });
}

export async function createSupplier(data) {
  return apiHandler({
    endPoint: "Inventory/Suppliers/CreateSupplier/Create",
    method: "POST",
    body: data,
  });
}

export async function updateSupplier(data) {
  return apiHandler({
    endPoint: "Inventory/Suppliers/UpdateSupplier/Update",
    method: "POST",
    body: data,
  });
}

export async function toggleSupplierStatus(id) {
  return apiHandler({
    endPoint: `Inventory/Suppliers/ToggleSupplierStatus/ToggleStatus/${id}`,
    method: "POST",
  });
}

// ==========================================
// SUPPLIER CONTACTS
// ==========================================

export async function getSupplierContactsBySupplierId(supplierId) {
  return apiHandler({
    endPoint: `inventory/SupplierContact/BySupplier/${supplierId}`,
    method: "GET",
  });
}

export async function getSupplierContactById(contactId) {
  return apiHandler({
    endPoint: `inventory/SupplierContact/${contactId}`,
    method: "GET",
  });
}

export async function createSupplierContact(data) {
  return apiHandler({
    endPoint: "inventory/SupplierContact/Create",
    method: "POST",
    body: data,
  });
}

export async function updateSupplierContact(data) {
  return apiHandler({
    endPoint: "inventory/SupplierContact/Update",
    method: "POST",
    body: data,
  });
}

export async function toggleSupplierContactStatus(contactId) {
  return apiHandler({
    endPoint: `inventory/SupplierContact/${contactId}/ToggleStatus`,
    method: "POST",
  });
}

// ==========================================
// SUPPLIER CONTRACTS
// ==========================================

export async function getSupplierContracts(params) {
  return apiHandler({
    endPoint: "inventory/SupplierContract/GetAll",
    method: "GET",
    params,
  });
}

export async function createSupplierContract(data) {
  return apiHandler({
    endPoint: "inventory/SupplierContract/Create",
    method: "POST",
    body: data,
  });
}

export async function updateSupplierContract(data) {
  return apiHandler({
    endPoint: "inventory/SupplierContract/Update",
    method: "POST",
    body: data,
  });
}

export async function changeSupplierContractStatus(id, newStatus) {
  return apiHandler({
    endPoint: `inventory/SupplierContract/${id}/ChangeStatus`,
    method: "POST",
    params: { newStatus },
  });
}

// ==========================================
// SUPPLIER NOTES & DOCUMENTS
// ==========================================

export async function getSupplierNotes(params) {
  return apiHandler({
    endPoint: "inventory/SupplierNote/GetAll",
    method: "GET",
    params,
  });
}

export async function getSupplierNoteById(id) {
  return apiHandler({
    endPoint: `inventory/SupplierNote/${id}`,
    method: "GET",
  });
}

export async function createSupplierNote(data) {
  return apiHandler({
    endPoint: "inventory/SupplierNote/Create",
    method: "POST",
    body: data,
  });
}

export async function updateSupplierNote(data) {
  return apiHandler({
    endPoint: "inventory/SupplierNote/Update",
    method: "POST",
    body: data,
  });
}

export async function deleteSupplierNote(id) {
  return apiHandler({
    endPoint: `inventory/SupplierNote/${id}`,
    method: "POST",
  });
}

export async function getSupplierDocuments(params) {
  return apiHandler({
    endPoint: "inventory/SupplierDocument/GetAll",
    method: "GET",
    params,
  });
}

export async function uploadSupplierDocument(formData) {
  return apiHandler({
    endPoint: "inventory/SupplierDocument/Upload",
    method: "POST",
    body: formData,
    isMultipart: true,
  });
}

export async function deleteSupplierDocument(id) {
  return apiHandler({
    endPoint: `inventory/SupplierDocument/${id}`,
    method: "POST",
  });
}
