/**
 * مصنع مفاتيح الاستعلام المركزي (Centralized Query Key Factory)
 * يضمن تناسق مفاتيح React Query ويمنع أخطاء الـ Invalidation
 */

export const queryKeys = {
  // 📅 المواعيد
  appointments: {
    all: ['appointments'],
    lists: () => [...queryKeys.appointments.all, 'list'],
    list: (filters = {}) => [...queryKeys.appointments.lists(), filters],
    details: () => [...queryKeys.appointments.all, 'detail'],
    detail: (id) => [...queryKeys.appointments.details(), id],
    services: () => [...queryKeys.appointments.all, 'services'],
    serviceDetail: (id) => [...queryKeys.appointments.services(), id],
  },

  // 🏢 الإيجارات
  rentals: {
    all: ['rentals'],
    lists: () => [...queryKeys.rentals.all, 'list'],
    list: (filters = {}) => [...queryKeys.rentals.lists(), filters],
    details: () => [...queryKeys.rentals.all, 'detail'],
    detail: (id) => [...queryKeys.rentals.details(), id],
    invoices: (rentalId = null) => 
      rentalId ? [...queryKeys.rentals.all, 'invoices', rentalId] : [...queryKeys.rentals.all, 'invoices'],
    invoiceDetail: (id) => [...queryKeys.rentals.all, 'invoice', id],
  },

  // 🛎️ الحجوزات
  reservations: {
    all: ['reservations'],
    lists: () => [...queryKeys.reservations.all, 'list'],
    list: (filters = {}) => [...queryKeys.reservations.lists(), filters],
    details: () => [...queryKeys.reservations.all, 'detail'],
    detail: (id) => [...queryKeys.reservations.details(), id],
    lookups: () => [...queryKeys.reservations.all, 'lookups'],
  },

  // 🎪 الفعاليات
  events: {
    all: ['events'],
    lists: () => [...queryKeys.events.all, 'list'],
    list: (filters = {}) => [...queryKeys.events.lists(), filters],
    details: () => [...queryKeys.events.all, 'detail'],
    detail: (id) => [...queryKeys.events.details(), id],
  },

  // 📦 الموارد
  resources: {
    all: ['resources'],
    lists: () => [...queryKeys.resources.all, 'list'],
    list: (filters = {}) => [...queryKeys.resources.lists(), filters],
    details: () => [...queryKeys.resources.all, 'detail'],
    detail: (id) => [...queryKeys.resources.details(), id],
  },

  // 👥 العملاء والشركات
  crm: {
    companies: (filters = {}) => ['crm', 'companies', filters],
    deals: (filters = {}) => ['crm', 'deals', filters],
    contacts: (filters = {}) => ['crm', 'contacts', filters],
  },

  // 💰 المحاسبة
  accounting: {
    invoices: (filters = {}) => ['accounting', 'invoices', filters],
    expenses: (filters = {}) => ['accounting', 'expenses', filters],
    reports: (filters = {}) => ['accounting', 'reports', filters],
  },
};

export default queryKeys;
