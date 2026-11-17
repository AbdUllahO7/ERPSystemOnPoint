import { Phone, Check, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/context/translate-api";

export function FollowUpsTab() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">
          {t('crmSuppliers.followUps.title')}
        </h3>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          {t('common.add')}
        </Button>
      </div>

      <div className="space-y-4">
        {/* Scheduled Follow-Up */}
        <div className="bg-white border rounded-xl p-4 shadow-sm flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-foreground">
                {t('crmSuppliers.followUps.callTitle1', 'A phone call to agree on the project')}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                23/7/2025 • 23:07
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 border border-emerald-200 text-emerald-500 rounded-lg flex items-center justify-center hover:bg-emerald-50 transition-colors">
              <Check className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 border border-red-200 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <span className="px-3 py-1 bg-blue-50 text-blue-500 text-sm font-semibold rounded-lg ml-2">
              {t('crmSuppliers.followUps.scheduled')}
            </span>
          </div>
        </div>

        {/* Completed Follow-Up */}
        <div className="bg-white border rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  {t('crmSuppliers.followUps.callTitle2', 'A phone call to agree on delivery schedule')}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  23/7/2025 • 23:07
                </div>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-500 text-sm font-semibold rounded-lg">
              {t('crmSuppliers.followUps.completed')}
            </span>
          </div>
          <div className="pl-16">
            <h4 className="text-sm font-bold text-foreground">{t('crmSuppliers.notes.title')}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {t('crmSuppliers.followUps.noteContent', 'Payment terms and delivery schedule agreed upon.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
