import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataView } from "@/components/data-view/DataView";
import { getChildAccounts } from "../../../../../lib/api";
import { Banknote, Building, Info } from "lucide-react";

export function LinkedSubAccountsTab({ id, account }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  
  const params = useMemo(() => ({
    ParentAccountId: id,
    pageNumber: page,
    pageSize: 10,
    search: search,
  }), [id, page, search]);

  const { data, isLoading } = useQuery({
    queryKey: ["getChildAccounts", params],
    queryFn: () => getChildAccounts(params),
  });

  const columns = [
    { key: "account_Number", label: "ID", sortable: true },
    { key: "account_Name", label: "Account Name", sortable: true },
    { key: "parent_Account_Id", label: "Parent Account", value: () => account?.accountName || "-" },
    { key: "final_Account", label: "Final Account" },
    { 
      key: "account_Nature", 
      label: "Account Nature",
      value: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          row.account_Nature === "Debit" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        }`}>
          {row.account_Nature}
        </span>
      )
    },
    { key: "financial_Statement", label: "Financial Statement" },
    { key: "currency_Id", label: "Currency", value: () => account?.currencyName || "Currency" },
  ];

  return (
    <div className="bg-card rounded-xl border shadow-sm p-4">
      <DataView
        data={data?.data?.items || []}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        selectable
        search={{
          placeholder: "Search by id or account name...",
          value: search,
          onChange: (val) => {
            setSearch(val);
            setPage(1);
          },
        }}
        columns={columns}
        card={{
          icon: Banknote,
          title: (row) => row.account_Name,
          subtitle: (row) => `Number: ${row.account_Number}`,
          fields: [
            {
              icon: Building,
              label: "Parent:",
              value: () => account?.accountName || "-",
            },
            {
              icon: Info,
              label: "Nature:",
              value: (row) => row.account_Nature,
            },
          ],
        }}
        pagination={{
          page: data?.data?.pageNumber || page,
          totalPages: data?.data?.totalPages || 1,
          onPageChange: setPage,
        }}
        emptyMessage="No sub-accounts found"
      />
    </div>
  );
}
