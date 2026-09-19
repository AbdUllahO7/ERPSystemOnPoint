import { useMemo, useState } from "react";
import {
  User,
  Phone,
  Package,
  Users as UsersIcon,
  Eye,
  GitBranch,
  Archive,
  Pencil,
  Trash2,
  Store,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DataView } from "@/components/data-view/DataView";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "review", label: "Under review" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
  { key: "blocked", label: "Blocked" },
];

function StatusCell({ status }) {
  if (status === "Blocked" || status === "Under review") {
    return (
      <span className="inline-flex h-7 items-center rounded-full border px-3 text-xs">
        {status}
      </span>
    );
  }
  if (status === "toggle") return <Switch />;
  if (status === "toggle-on") return <Switch defaultChecked />;
  return <span className="text-neutral-600">{status}</span>;
}

const STATS_CARDS = [
  {
    id: "sellers",
    title: "Sellers in system",
    value: 32,
    trend: "+5%",
    trendUp: true,
    icon: Store,
    color: "blue",
  },
  {
    id: "products",
    title: "Total products",
    value: 156,
    trend: "-1%",
    trendUp: false,
    icon: ShoppingBag,
    color: "green",
  },
  {
    id: "active",
    title: "Active sellers",
    value: 24,
    trend: "+3%",
    trendUp: true,
    icon: UsersIcon,
    color: "indigo",
  },
  {
    id: "review",
    title: "Under review",
    value: 8,
    trend: "+2%",
    trendUp: true,
    icon: User,
    color: "orange",
  },
];

export default function Users() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const rows = useMemo(
    () => [
      {
        id: 1,
        name: "Abdulrahman Bin",
        phone: "0595121088",
        email: "email@gmail.com",
        products: 350,
        joinedAt: "16/2/2026",
        status: "Blocked",
        statusKey: "blocked",
      },
      {
        id: 2,
        name: "Ahmed Al-Saeed",
        phone: "0599001122",
        email: "ahmed@mail.com",
        products: 120,
        joinedAt: "10/1/2026",
        status: "Under review",
        statusKey: "review",
      },
      {
        id: 3,
        name: "Mohammed Al-Ali",
        phone: "0566332211",
        email: "mali@mail.com",
        products: 85,
        joinedAt: "5/3/2026",
        status: "toggle",
        statusKey: "active",
      },
      {
        id: 4,
        name: "Sara Khalid",
        phone: "0588776655",
        email: "sara@mail.com",
        products: 210,
        joinedAt: "20/2/2026",
        status: "toggle-on",
        statusKey: "active",
      },
      {
        id: 5,
        name: "Yousef Nasser",
        phone: "0591112233",
        email: "yousef@mail.com",
        products: 64,
        joinedAt: "1/4/2026",
        status: "Under review",
        statusKey: "review",
      },
      {
        id: 6,
        name: "Layla Mahmoud",
        phone: "0594445566",
        email: "layla@mail.com",
        products: 98,
        joinedAt: "12/3/2026",
        status: "Under review",
        statusKey: "review",
      },
    ],
    [],
  );

  const displayRows = useMemo(() => {
    if (statusFilter === "all") return rows;
    return rows.filter((r) => r.statusKey === statusFilter);
  }, [rows, statusFilter]);

  function handleSearch(value) {
    console.log("search:", value);
    console.log("data:", rows);
    setSearch(value);
  }

  const rowActionsMenu = useMemo(
    () => [
      {
        label: "View",
        items: [
          {
            key: "details",
            label: "Details",
            icon: Eye,
            onClick: (row) => console.log("details", row.id),
          },
          {
            key: "branches",
            label: "Branches",
            icon: GitBranch,
            onClick: (row) => console.log("branches", row.id),
          },
          {
            key: "employee",
            label: "Employee",
            icon: User,
            onClick: (row) => console.log("employee", row.id),
          },
          {
            key: "archive",
            label: "Archive",
            icon: Archive,
            onClick: (row) => console.log("archive", row.id),
          },
        ],
      },
      {
        items: [
          {
            key: "edit",
            label: "Edit",
            icon: Pencil,
            onClick: (row) => console.log("edit", row.id),
          },
        ],
      },
      {
        items: [
          {
            key: "delete",
            label: "Delete",
            icon: Trash2,
            destructive: true,
            onClick: (row) => console.log("delete", row.id),
          },
        ],
      },
    ],
    [],
  );

  const columns = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      link: true,
      render: (row) => `#${row.id}`,
    },
    {
      key: "name",
      label: "Seller name",
      sortable: true,
      link: true,
    },
    {
      key: "phone",
      label: "Phone",
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      link: true,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusCell status={row.status} />,
    },
    {
      key: "products",
      label: "Products",
      sortable: true,
      emphasize: true,
    },
    {
      key: "joinedAt",
      label: "Joined date",
      sortable: true,
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-neutral-900">Sellers list</h2>

      <DataView
        stats={STATS_CARDS}
        data={displayRows}
        getRowId={(row) => row.id}
        selectable
        search={{
          placeholder: "Search by name, phone, or email...",
          value: search,
          onChange: handleSearch,
        }}
        filter={{
          label: "Filter",
          onClick: () => console.log("filter"),
        }}
        onRefresh={() => console.log("refresh")}
        onPrint={() => window.print()}
        export={{
          label: "Export",
          onClick: () => console.log("export"),
        }}
        addButton={{
          label: "Add",
          onClick: () => console.log("add"),
        }}
        onColumnSettings={() => console.log("columns")}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        card={{
          icon: User,
          title: (row) => row.name,
          subtitle: (row) => `Seller ID: #${row.id}`,
          fields: [
            {
              icon: Phone,
              label: "Phone:",
              value: (row) => row.phone,
            },
            {
              icon: Package,
              label: "Products:",
              value: (row) => `${row.products} products`,
            },
          ],
          renderFooter: (row) => (
            <div className="border-t border-neutral-100 pt-2">
              <StatusCell status={row.status} />
            </div>
          ),
        }}
        pagination={{
          page,
          totalPages: 4,
          onPageChange: setPage,
          prevLabel: "Pre",
          nextLabel: "Next",
        }}
        emptyMessage="No sellers found"
        // toolbarExtra={
        //   <div className="flex flex-wrap items-center gap-2">
        //     {STATUS_FILTERS.map((f) => (
        //       <Button
        //         key={f.key}
        //         type="button"
        //         variant={statusFilter === f.key ? "default" : "outline"}
        //         className="h-9 rounded-full! px-3"
        //         onClick={() => setStatusFilter(f.key)}
        //       >
        //         {f.label}
        //       </Button>
        //     ))}
        //   </div>
        // }
      />
    </div>
  );
}
