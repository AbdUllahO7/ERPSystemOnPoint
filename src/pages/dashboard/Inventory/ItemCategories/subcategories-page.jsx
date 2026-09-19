import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building,
  Users as UsersIcon,
  Info
} from "lucide-react";
import { DataView } from "@/components/data-view/DataView";
import { useQuery } from "@tanstack/react-query";
import { getAllCategories, getCategoryById } from "@/lib/api";

const stats = [
  {
    title: "Number of system Departments",
    value: "32",
    trend: "+5%",
    isUp: true,
    color: "bg-blue-600",
    icon: Building,
  },
  {
    title: "Total number of employees",
    value: "32",
    trend: "-1%",
    isUp: false,
    color: "bg-emerald-500",
    icon: UsersIcon,
  },
  {
    title: "Number of system Departments",
    value: "32",
    trend: "+5%",
    isUp: true,
    color: "bg-blue-900",
    icon: Building,
  },
  {
    title: "Total number of employees",
    value: "32",
    trend: "-1%",
    isUp: false,
    color: "bg-orange-500",
    icon: UsersIcon,
  },
];

export default function SubcategoriesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch Parent Category Details to show its name
  const { data: categoryRes } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategoryById(id),
  });
  const categoryName = categoryRes?.data?.categoryName || "Loading...";

  // Fetch Subcategories
  const { data: subcategoriesRes, isLoading, refetch } = useQuery({
    queryKey: ["subcategories", id, page, search],
    queryFn: () => getAllCategories({
      PageNumber: page,
      PageSize: 10,
      SearchTerm: search || undefined,
      category_parents: id
    }),
  });

  const subcategoriesData = subcategoriesRes?.data?.items?.map(cat => ({
    id: cat.id,
    serialNumber: cat.code_Numbers,
    categoryName: cat.name,
    type: cat.mainOrSub
  })) || [];

  const totalPages = subcategoriesRes?.data?.totalPages || 1;

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  const columns = [
    {
      key: "serialNumber",
      label: "Serial Number",
      render: (row) => <span className="text-blue-500 font-medium">{row.serialNumber}</span>,
    },
    {
      key: "categoryName",
      label: "Category Name",
      sortable: true,
    },
    {
      key: "type",
      label: "Main Category / Subcategory",
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            row.type === "Main Category" || row.type === "MainCategory"
              ? "bg-blue-100 text-blue-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {row.type === "MainCategory" ? "Main Category" : row.type}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">
            Subcategories of the category <span className="text-primary">({categoryName})</span>
          </h2>
          <Info className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <span className="cursor-pointer hover:text-primary" onClick={() => navigate("/dashboard/inventory/items-management/categories")}>Item Categories</span>
          <span>/</span>
          <span className="font-medium text-foreground">Subcategories of the category ({categoryName})</span>
        </div>
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

      {/* Data Table */}
      <DataView
        data={subcategoriesData}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        search={{
          placeholder: "Search by id or category name...",
          value: search,
          onChange: handleSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => setIsFilterOpen(!isFilterOpen),
        }}
        onRefresh={() => refetch()}
        onPrint={() => window.print()}
        export={{
          label: "Export",
          onClick: () => console.log("export"),
        }}
        addButton={{
          label: "Add",
          onClick: () => navigate("/dashboard/inventory/items-management/categories/add", { state: { parentId: id } }),
        }}
        columns={columns}
        card={{
          icon: UsersIcon,
          title: (row) => row.categoryName,
          subtitle: (row) => row.type,
        }}
        pagination={{
          page: page,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: "Prev",
          nextLabel: "Next",
        }}
        emptyMessage="No subcategories found"
      />
    </div>
  );
}
