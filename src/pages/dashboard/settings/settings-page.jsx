import { useState } from "react";
import PreferencesTab from "./_components/PreferencesTab";
import AccountTab from "./_components/AccountTab";
import CompanyInformationTab from "./_components/CompanyInformationTab";
import UsersTab from "./_components/users";
import FiscalYearTab from "./_components/FiscalYearTab";
import AccountingSettingsTab from "./_components/AccountingSettingsTab";
import InventoryWarehousesTab from "./_components/InventoryWarehousesTab";
import AlertsNotificationsTab from "./_components/AlertsNotificationsTab";
import AuditLogTab from "./_components/AuditLogTab";
import BackupTab from "./_components/BackupTab";
import LanguageRegionTab from "./_components/LanguageRegionTab";
import {
  Bell,
  Box,
  Building2,
  Calendar,
  Database,
  FileText,
  Globe,
  Settings,
  Shield,
  UserCog,
  Users
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Fiscal Year");

  const tabs = [
    { id: "CompanyInformation", label: "Company Information", icon: Building2 },
    { id: "Users", label: "Users", icon: Users },
    { id: "PowersRoles", label: "Powers & Roles", icon: UserCog },
    { id: "Fiscal Year", label: "Fiscal Year", icon: Calendar },
    { id: "AccountingSettings", label: "Accounting Settings", icon: FileText },
    { id: "InventoryWarehouses", label: "Inventory & Warehouses", icon: Box },
    { id: "AlertsNotifications", label: "Alerts & Notifications", icon: Bell },
    { id: "Audit Log", label: "Audit Log", icon: FileText },
    { id: "Backup", label: "Backup", icon: Database },
    { id: "LanguageRegion", label: "Language & Region", icon: Globe },
  ];
  const renderContent = () => {
    switch (activeTab) {
      case "Preferences":
        return <PreferencesTab />;
      case "Account":
        return <AccountTab />;
      case "CompanyInformation":
      case "Company Information":
        return <CompanyInformationTab />;
      case "Users":
        return <UsersTab />;
      case "Fiscal Year":
        return <FiscalYearTab />;
      case "AccountingSettings":
        return <AccountingSettingsTab />;
      case "InventoryWarehouses":
        return <InventoryWarehousesTab />;
      case "AlertsNotifications":
        return <AlertsNotificationsTab />;
      case "Audit Log":
        return <AuditLogTab />;
      case "Backup":
        return <BackupTab />;
      case "LanguageRegion":
        return <LanguageRegionTab />;
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in">
            <h3 className="text-xl font-medium mb-2">{activeTab}</h3>
            <p>This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4  gap-8 items-start">
      {/* Sidebar */}
      <aside className="sticky bg-card text-card-foreground rounded-xl border shadow-sm top-6 self-start p-4">
        <h3 className="font-semibold text-foreground mb-4 px-2">Settings sections</h3>
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg ${
                  isActive ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <main className="md:col-span-3">{renderContent()}</main>
    </div>
  );
}
