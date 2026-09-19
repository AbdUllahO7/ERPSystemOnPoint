import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Info, Edit, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAccountById } from "../../../../lib/api";

import { BasicInformationTab } from "./_components/basic-information-tab";
import { LinkedSubAccountsTab } from "./_components/linked-sub-accounts-tab";
import { LinkedCostCentersTab } from "./_components/linked-cost-centers-tab";
import { AccountMovementTab } from "./_components/account-movement-tab";
import { AccountStatisticsTab } from "./_components/account-statistics-tab";

export default function AccountDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Basic Account Data
  const { data: accountData, isLoading: isLoadingAccount } = useQuery({
    queryKey: ["getAccountById", id],
    queryFn: () => getAccountById(id),
  });

  const account = accountData?.data || {};

  // Tabs state
  const [activeTab, setActiveTab] = useState("basic");

  if (isLoadingAccount) {
    return <div className="p-6 text-muted-foreground">Loading account details...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-foreground">Account Details</h2>
              <Info className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <span>Chart Of Accounts</span>
              <span>/</span>
              <span className="font-medium text-foreground">Account Details</span>
            </div>
          </div>
        </div>

        <Button onClick={() => navigate(`/dashboard/accounting/accounts/edit/${id}`)} className="gap-2">
          <Edit className="w-4 h-4" />
          Edit Account
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent border-b rounded-none w-full justify-start h-auto p-0 space-x-6">
          <TabsTrigger 
            value="basic" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 text-muted-foreground data-[state=active]:text-primary"
          >
            Basic information
          </TabsTrigger>
          <TabsTrigger 
            value="sub-accounts" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 text-muted-foreground data-[state=active]:text-primary"
          >
            Linked sub-accounts
          </TabsTrigger>
          <TabsTrigger 
            value="cost-centers" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 text-muted-foreground data-[state=active]:text-primary"
          >
            Linked cost centers
          </TabsTrigger>
          <TabsTrigger 
            value="movement" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 text-muted-foreground data-[state=active]:text-primary"
          >
            Account movement
          </TabsTrigger>
          <TabsTrigger 
            value="statistics" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 text-muted-foreground data-[state=active]:text-primary"
          >
            Statistics
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="basic" className="m-0">
            <BasicInformationTab account={account} />
          </TabsContent>

          <TabsContent value="sub-accounts" className="m-0">
            {/* Render component only when tab is active to prevent fetching when not needed (optional, but TabContent hides it) */}
            {activeTab === "sub-accounts" && <LinkedSubAccountsTab id={id} account={account} />}
          </TabsContent>

          <TabsContent value="cost-centers" className="m-0">
            {activeTab === "cost-centers" && <LinkedCostCentersTab id={id} />}
          </TabsContent>

          <TabsContent value="movement" className="m-0">
            <AccountMovementTab />
          </TabsContent>

          <TabsContent value="statistics" className="m-0">
            <AccountStatisticsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
