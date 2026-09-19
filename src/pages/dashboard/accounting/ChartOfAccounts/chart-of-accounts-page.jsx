import React, { useMemo, useState } from "react";
import { Info, Target, Building, UsersIcon, Banknote, FileText, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getChartOfAccounts } from "../../../../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CustomChevron = ({ isOpen }) => (
  <svg 
    width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
    className={`transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`}
  >
    <path d="M7 13L7 7L12 11L17 7L17 13L12 17L7 13Z" stroke="#0173CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CustomFolder = ({ isRoot }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 4H9L12 7H19C19.5304 7 20.0391 7.21071 20.4142 7.58579C20.7893 7.96086 21 8.46957 21 9V17C21 17.5304 20.7893 18.0391 20.4142 18.4142C20.0391 18.7893 19.5304 19 19 19H5C4.46957 19 3.96086 18.7893 3.58579 18.4142C3.21071 18.0391 3 17.5304 3 17V6C3 5.46957 3.21071 4.96086 3.58579 4.58579C3.96086 4.21071 4.46957 4 5 4Z" stroke={isRoot ? "#F5A623" : "#0173CC"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CustomCircle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.364 19.3639C19.6227 18.1052 20.4798 16.5016 20.8271 14.7558C21.1743 13.0099 20.9961 11.2004 20.3149 9.55582C19.6337 7.9113 18.4802 6.50569 17.0001 5.51677C15.5201 4.52784 13.78 4 12 4C10.22 4 8.47992 4.52784 6.99988 5.51677C5.51984 6.50569 4.36629 7.9113 3.6851 9.55582C3.00391 11.2004 2.82567 13.0099 3.17293 14.7558C3.52019 16.5016 4.37734 18.1052 5.636 19.3639" stroke="#0173CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15.536 16.536C16.2351 15.8367 16.7112 14.9458 16.904 13.9759C17.0968 13.0061 16.9978 12.0008 16.6193 11.0873C16.2408 10.1737 15.5999 9.39289 14.7777 8.84354C13.9555 8.29419 12.9889 8.00098 12 8.00098C11.0112 8.00098 10.0445 8.29419 9.22229 8.84354C8.40007 9.39289 7.75921 10.1737 7.38073 11.0873C7.00225 12.0008 6.90316 13.0061 7.09598 13.9759C7.2888 14.9458 7.76487 15.8367 8.464 16.536" stroke="#515B73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11 13C11 13.2652 11.1054 13.5196 11.2929 13.7071C11.4804 13.8946 11.7348 14 12 14C12.2652 14 12.5196 13.8946 12.7071 13.7071C12.8946 13.5196 13 13.2652 13 13C13 12.7348 12.8946 12.4804 12.7071 12.2929C12.5196 12.1054 12.2652 12 12 12C11.7348 12 11.4804 12.1054 11.2929 12.2929C11.1054 12.4804 11 12.7348 11 13Z" stroke="#515B73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Recursive component for Tree View
function TreeNode({ node, isCostCenter = false, isRoot = false }) {
  const [isOpen, setIsOpen] = useState(false);

  const hasChildren =
    (node.subAccount && node.subAccount.length > 0) ||
    (node.costCenters && node.costCenters.length > 0);

  return (
    <div className={`${isRoot ? "mb-2" : "ml-8 mt-2"}`}>
      <div 
        className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          {hasChildren && <CustomChevron isOpen={isOpen} />}
        </div>
        
        {isCostCenter ? (
          <CustomCircle />
        ) : (
          <CustomFolder isRoot={isRoot} />
        )}

        <span className="font-bold text-[15px] text-[#2C334A]">
          {isCostCenter 
            ? `${node.cost_Center_Number} - ${node.cost_Center_Name}`
            : `${node.account_Number} - ${node.account_Name}`
          }
        </span>
      </div>

      {isOpen && hasChildren && (
        <div className="border-l border-border ml-2 pl-2">
          {node.subAccount?.map((subAcc) => (
            <TreeNode key={subAcc.id} node={subAcc} />
          ))}
          {node.costCenters?.map((cc) => (
            <TreeNode key={cc.id} node={cc} isCostCenter />
          ))}
        </div>
      )}
    </div>
  );
}

const stats = [
  {
    title: "Total Accounts",
    value: "150",
    trend: "+5%",
    isUp: true,
    color: "bg-blue-600",
    icon: Banknote,
  },
  {
    title: "Active Accounts",
    value: "140",
    trend: "-1%",
    isUp: false,
    color: "bg-emerald-500",
    icon: FileText,
  },
  {
    title: "Cost Centers",
    value: "32",
    trend: "+5%",
    isUp: true,
    color: "bg-blue-900",
    icon: Building,
  },
  {
    title: "Currencies",
    value: "3",
    trend: "-1%",
    isUp: false,
    color: "bg-orange-500",
    icon: UsersIcon,
  },
];

export default function ChartOfAccountsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const params = useMemo(() => ({
    pageNumber: page,
    pageSize: 20,
    search: search,
  }), [page, search]);

  const { data, isLoading } = useQuery({
    queryKey: ["getChartOfAccounts", params],
    queryFn: () => getChartOfAccounts(params),
  });

  const chartData = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const currentPage = data?.data?.pageNumber || page;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold text-foreground">
          Chart Of Accounts
        </h2>
        <Info className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-card text-card-foreground p-4 rounded-xl border flex items-center gap-4 shadow-sm"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color}`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-foreground">
                  {stat.value}
                </span>
                <span
                  className={`text-xs font-semibold ${stat.isUp ? "text-green-500" : "text-red-500"}`}
                >
                  {stat.trend} {stat.isUp ? "↑" : "↓"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border shadow-sm p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex w-full sm:max-w-md items-center gap-2">
            <div className="relative min-w-[200px] flex-1 max-w-xl">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search by id or name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-lg border-border bg-card ps-9 pe-3"
              />
            </div>
            <Button variant="outline" className="shrink-0 h-10">
              Filter
            </Button>
          </div>
          
          {/* <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" className="shrink-0">Export</Button>
            <Button className="shrink-0" onClick={() => {}}>
              + Add
            </Button>
          </div> */}
        </div>

        {/* Tree Container */}
        <div className="border rounded-md p-4 min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading chart of accounts...
            </div>
          ) : chartData.length > 0 ? (
            <div className="-ml-2">
              {chartData.map((node) => (
                <TreeNode key={node.id} node={node} isRoot={true} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No accounts found in chart.
            </div>
          )}
        </div>

        {/* Basic Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </Button>
            <span className="text-sm font-medium">
              {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
