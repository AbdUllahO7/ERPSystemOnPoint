import { Mail, Phone, Globe } from "lucide-react";
import { useI18n } from "@/context/translate-api";
import { translateErp } from "@/lib/erp-i18n";

export function BasicInfoTab({ customer }) {
  const { t, locale } = useI18n();

  return (
    <div className="space-y-8">
      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <h4 className="text-sm font-bold text-foreground">{t('crmSuppliers.basicInfo.name')}</h4>
          <p className="text-sm text-muted-foreground mt-1">{customer.name}</p>
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground">{t('crmSuppliers.basicInfo.type')}</h4>
          <p className="text-sm text-muted-foreground mt-1">{locale === "ar" ? translateErp(customer.type, locale) : customer.type}</p>
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground">{t('crmSuppliers.basicInfo.sector')}</h4>
          <p className="text-sm text-muted-foreground mt-1">{customer.sector}</p>
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground">{t('crmSuppliers.basicInfo.address')}</h4>
          <p className="text-sm text-muted-foreground mt-1">{customer.address}</p>
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground">{t('crmSuppliers.basicInfo.createdAt')}</h4>
          <p className="text-sm text-muted-foreground mt-1">{customer.createdAt}</p>
        </div>
      </div>

      <hr className="border-border" />

      {/* Contact Cards */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl min-w-[280px] border shadow-sm">
          <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground">{t('crmSuppliers.basicInfo.email')}</div>
            <div className="text-sm font-medium">{customer.email}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 rounded-xl min-w-[280px] border shadow-sm">
          <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-lg flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground">{t('crmSuppliers.basicInfo.phone')}</div>
            <div className="text-sm font-medium">{customer.phone}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 rounded-xl min-w-[280px] border shadow-sm">
          <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground">{t('website', 'Website')}</div>
            <div className="text-sm font-medium">{customer.website}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
