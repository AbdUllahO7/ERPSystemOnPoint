import { apiHandler } from "@/lib/api-handler";

// ==========================================
// ACCOUNTING COST CENTERS
// ==========================================

export async function getAllCostCenters(params) {
  return apiHandler({
    endPoint: "accounting/CostCenters/GetAllCostCenters/all",
    method: "GET",
    params,
  });
}

export async function getCostCenterById(id) {
  return apiHandler({
    endPoint: `accounting/CostCenters/GetCostCenterById/${id}`,
    method: "GET",
  });
}

export async function createCostCenter(data) {
  return apiHandler({
    endPoint: "accounting/CostCenters/CreateCostCenter/create",
    method: "POST",
    body: data,
  });
}

export async function updateCostCenter(data) {
  return apiHandler({
    endPoint: "accounting/CostCenters/UpdateCostCenter/update",
    method: "POST",
    body: data,
  });
}

export async function deleteCostCenter(id) {
  return apiHandler({
    endPoint: `accounting/CostCenters/DeleteCostCenter/delete/${id}`,
    method: "POST",
  });
}

export async function getChildCostCenters(params) {
  return apiHandler({
    endPoint: "account/Accounts/GetChildCostCenters/costcenters/children",
    method: "GET",
    params,
  });
}

// ==========================================
// ACCOUNTING ACCOUNTS & CHART OF ACCOUNTS
// ==========================================

export async function getAllAccountsFlat(params) {
  return apiHandler({
    endPoint: "account/Accounts/GetAllAccountsFlat/flat",
    method: "GET",
    params,
  });
}

export async function getAccountById(id) {
  return apiHandler({
    endPoint: `account/Accounts/GetAccountById/${id}`,
    method: "GET",
  });
}

export async function createAccount(data) {
  return apiHandler({
    endPoint: "account/Accounts/CreateAccount/create",
    method: "POST",
    body: data,
  });
}

export async function updateAccount(data) {
  return apiHandler({
    endPoint: "account/Accounts/UpdateAccount/update",
    method: "POST",
    body: data,
  });
}

export async function getChildAccounts(params) {
  return apiHandler({
    endPoint: "account/Accounts/GetChildAccounts/accounts/children",
    method: "GET",
    params,
  });
}

export async function getChartOfAccounts(params) {
  return apiHandler({
    endPoint: "account/Accounts/GetChartOfAccounts/chart",
    method: "GET",
    params,
  });
}

export async function getLeafAccounts(params = {}) {
  const normalizedParams = {
    ...params,
    PageNumber: params.PageNumber || params.pageNumber || 1,
    PageSize: params.PageSize || params.pageSize || 1000,
    pageNumber: params.PageNumber || params.pageNumber || 1,
    pageSize: params.PageSize || params.pageSize || 1000,
  };
  return apiHandler({
    endPoint: "account/Accounts/GetLeafAccounts/leaf-accounts",
    method: "GET",
    params: normalizedParams,
  });
}

// ==========================================
// ACCOUNTING INVOICE PATTERNS
// ==========================================

export async function getAllInvoicePatterns(params = {}) {
  const normalizedParams = {
    ...params,
    pageNumber: params.pageNumber || params.PageNumber || 1,
    pageSize: params.pageSize || params.PageSize || 10,
    PageNumber: params.PageNumber || params.pageNumber || 1,
    PageSize: params.PageSize || params.pageSize || 10,
  };

  try {
    return await apiHandler({
      endPoint: "accounting/InvoicePatterns/GetAll",
      method: "GET",
      params: normalizedParams,
    });
  } catch (error) {
    try {
      return await apiHandler({
        endPoint: "accounting/InvoicePatterns/GetAllPatterns/all",
        method: "GET",
        params: normalizedParams,
      });
    } catch {
      throw error;
    }
  }
}

export async function getInvoicePatternById(id) {
  return apiHandler({
    endPoint: `accounting/InvoicePatterns/GetPatternById/${id}`,
    method: "GET",
  });
}

export async function createInvoicePattern(data) {
  return apiHandler({
    endPoint: "accounting/InvoicePatterns/CreatePattern/create",
    method: "POST",
    body: data,
  });
}

export async function updateInvoicePattern(data) {
  return apiHandler({
    endPoint: "accounting/InvoicePatterns/UpdatePattern/update",
    method: "POST",
    body: data,
  });
}

export async function deleteInvoicePattern(id) {
  return apiHandler({
    endPoint: `accounting/InvoicePatterns/TogglePatternStatus/toggle-status/${id}`,
    method: "POST",
  });
}

// ==========================================
// ACCOUNTING INVOICES
// ==========================================

export async function getAllInvoices(params) {
  return apiHandler({
    endPoint: "accounting/Invoices/GetAllInvoices/all",
    method: "GET",
    params,
  });
}

export async function getInvoiceById(id) {
  return apiHandler({
    endPoint: `accounting/Invoices/GetInvoiceById/${id}`,
    method: "GET",
  });
}

export async function createPurchaseInvoice(data) {
  return apiHandler({
    endPoint: "accounting/Invoices/CreatePurchases/purchases",
    method: "POST",
    body: data,
  });
}

export async function createSalesInvoice(data) {
  return apiHandler({
    endPoint: "accounting/Invoices/CreateSales/sales",
    method: "POST",
    body: data,
  });
}

export async function createPurchaseReturnInvoice(data) {
  return apiHandler({
    endPoint: "accounting/Invoices/CreatePurchasesReturns/purchases-returns",
    method: "POST",
    body: data,
  });
}

export async function createSalesReturnInvoice(data) {
  return apiHandler({
    endPoint: "accounting/Invoices/CreateSalesReturns/sales-returns",
    method: "POST",
    body: data,
  });
}

// ==========================================
// ACCOUNTING CURRENCIES
// ==========================================

export async function getAllCurrencies(params) {
  return apiHandler({
    endPoint: "accounting/Currencies/GetAllCurrencies/all",
    method: "GET",
    params,
  });
}

// ==========================================
// OPERATION EXPENSES
// ==========================================

export async function getAllOperationExpenses(params) {
  return apiHandler({
    endPoint: "account/OperationExpense/GetAllExpenses/list",
    method: "GET",
    params,
  });
}

export async function getOperationExpenseById(id) {
  return apiHandler({
    endPoint: `account/OperationExpense/GetExpenseById/${id}`,
    method: "GET",
  });
}

export async function createOperationExpense(data) {
  return apiHandler({
    endPoint: "account/OperationExpense/CreateExpense/create",
    method: "POST",
    body: data,
  });
}

export async function getOperationExpenseLookUp(params) {
  return apiHandler({
    endPoint: "HR/Lookups/GetOperationExpenseLookUp/operation-expenses",
    method: "GET",
    params,
  });
}

// ==========================================
// FIXED & GENERAL EXPENSES
// ==========================================

export async function getAllFixedExpenses(params) {
  return apiHandler({
    endPoint: "account/FixedExpenses/List",
    method: "GET",
    params,
  });
}

export async function getFixedExpenseById(id) {
  return apiHandler({
    endPoint: `account/FixedExpenses/GetById/${id}`,
    method: "GET",
  });
}

export async function createFixedExpense(data) {
  return apiHandler({
    endPoint: "account/FixedExpenses/Create",
    method: "POST",
    body: data,
  });
}

export async function getAllExpenses(params) {
  return apiHandler({
    endPoint: "account/Expenses/GetAllExpenses/list",
    method: "GET",
    params,
  });
}

export async function getExpenseById(id) {
  return apiHandler({
    endPoint: `account/Expenses/GetExpenseById/${id}`,
    method: "GET",
  });
}

export async function createExpense(data) {
  return apiHandler({
    endPoint: "account/Expenses/CreateExpense/create",
    method: "POST",
    body: data,
  });
}

// ==========================================
// VOUCHERS
// ==========================================

export async function getAllVouchers(params) {
  return apiHandler({
    endPoint: "accounting/Vouchers/GetAllVouchers/all",
    method: "GET",
    params,
  });
}

export async function getVoucherById(id) {
  return apiHandler({
    endPoint: `accounting/Vouchers/GetVoucherById/${id}`,
    method: "GET",
  });
}

export async function createJournalVoucher(data) {
  return apiHandler({
    endPoint: "accounting/Vouchers/CreateJournalVoucher/create-journal",
    method: "POST",
    body: data,
  });
}

// ==========================================
// CASH BOXES & LOOKUPS
// ==========================================

export async function getAllCashBoxes(params) {
  return apiHandler({
    endPoint: "account/CashBoxes/GetAllCashBoxes/list",
    method: "GET",
    params,
  });
}

export async function getCashBoxById(id) {
  return apiHandler({
    endPoint: `account/CashBoxes/GetCashBoxById/${id}`,
    method: "GET",
  });
}

export async function createCashBox(data) {
  return apiHandler({
    endPoint: "account/CashBoxes/CreateCashBox/create",
    method: "POST",
    body: data,
  });
}

export async function createCashBoxTransaction(data) {
  return apiHandler({
    endPoint: "account/CashBoxes/CreateAddTransaction/add-transaction",
    method: "POST",
    body: data,
  });
}

export async function getAllCashBoxTransactions(params) {
  return apiHandler({
    endPoint: "account/CashBoxes/GetAllTransactions/transactions",
    method: "GET",
    params,
  });
}

export async function getCashLookUp(params) {
  return apiHandler({
    endPoint: "HR/Lookups/GetCashLookUp/cash",
    method: "GET",
    params,
  });
}

export async function getCardLookUp(params) {
  return apiHandler({
    endPoint: "HR/Lookups/GetCardLookUp/card",
    method: "GET",
    params,
  });
}

// ==========================================
// BANKS
// ==========================================

export async function getAllBanks(params) {
  return apiHandler({
    endPoint: "account/Banks/GetAllBanks/list",
    method: "GET",
    params,
  });
}

export async function getBankById(id) {
  return apiHandler({
    endPoint: `account/Banks/GetBankById/${id}`,
    method: "GET",
  });
}

export async function createBank(data) {
  return apiHandler({
    endPoint: "account/Banks/CreateBank/create",
    method: "POST",
    body: data,
  });
}

export async function createBankTransaction(data) {
  return apiHandler({
    endPoint: "account/Banks/CreateBankTransaction/add-transaction",
    method: "POST",
    body: data,
  });
}

export async function getAllBankTransactions(params) {
  return apiHandler({
    endPoint: "account/Banks/GetAllBankTransactions/transactions",
    method: "GET",
    params,
  });
}

// ==========================================
// REVENUES
// ==========================================

export async function getAllRevenues(params) {
  return apiHandler({
    endPoint: "account/Revenues/GetAllRevenues/list",
    method: "GET",
    params,
  });
}

export async function getRevenueById(id) {
  return apiHandler({
    endPoint: `account/Revenues/GetRevenueById/${id}`,
    method: "GET",
  });
}

export async function createDirectRevenue(data) {
  return apiHandler({
    endPoint: "account/Revenues/CreateDirectRevenue/create-direct",
    method: "POST",
    body: data,
  });
}

// ==========================================
// POS SALES INVOICES
// ==========================================

export async function getAllPosSalesInvoices(params) {
  return apiHandler({
    endPoint: "Pos/SalesInvoices/GetAllInvoices/all",
    method: "GET",
    params,
  });
}
