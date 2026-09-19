import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users as UsersIcon, Pencil, Trash2, Eye, Building } from 'lucide-react';
import { DataView } from '@/components/data-view/DataView';
import { useNavigate } from 'react-router-dom';
import { getAllSuppliers, toggleSupplierStatus } from '@/lib/api';
import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog';
import { toast } from "react-hot-toast";

const stats = [
  { title: 'Total Suppliers', value: '32', trend: '+5%', isUp: true, color: 'bg-blue-600', icon: Building },
  { title: 'Active Suppliers', value: '32', trend: '-1%', isUp: false, color: 'bg-emerald-500', icon: UsersIcon },
];

export default function SupplierPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('All');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', page, search, activeTab],
    queryFn: () => getAllSuppliers({ PageNumber: page, PageSize: 10 }),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => toggleSupplierStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier status toggled successfully');
    },
    onError: () => {
      toast.error('Failed to toggle supplier status');
    }
  });

  const handleDelete = () => {
    if (selectedSupplierId) {
      toggleMutation.mutate(selectedSupplierId);
    }
  };

  const tabs = ['All', 'Active', 'Inactive'];

  const items = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;

  let filteredSuppliers = items;
  if (activeTab !== 'All') {
    const isActive = activeTab === 'Active';
    filteredSuppliers = filteredSuppliers.filter(s => s.is_Active === isActive);
  }
  if (search) {
    filteredSuppliers = filteredSuppliers.filter(
      s => s.supplier_Name?.toLowerCase().includes(search.toLowerCase()) || s.id?.includes(search)
    );
  }

  const columns = [
    { key: 'id', label: 'ID', render: (row) => <span className="text-blue-500 font-medium">{row.id.substring(0,8)}</span> },
    { 
      key: 'name', 
      label: 'Name',
      render: (row) => (
        <div>
          <div className="font-medium">{row.supplier_Name}</div>
          <div className="text-xs text-muted-foreground">{row.email}</div>
        </div>
      )
    },
    { key: 'supplier_Type', label: 'Type' },
    { key: 'contact_Person', label: 'Contact Person' },
    { key: 'phone_Number', label: 'Phone' },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => {
        const isActive = row.is_Active;
        const colorClass = isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600';
        return <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>{isActive ? 'Active' : 'Inactive'}</span>;
      }
    },
    { key: 'created_At', label: 'Created At', render: (row) => new Date(row.created_At).toLocaleDateString() },
  ];

  const rowActionsMenu = [
    {
      items: [
        {
          key: 'view',
          label: 'View',
          icon: Eye,
          onClick: (row) => navigate(`/dashboard/crm/suppliers/${row.id}`),
        },
        {
          key: 'edit',
          label: 'Edit',
          icon: Pencil,
          onClick: (row) => navigate(`/dashboard/crm/suppliers/edit/${row.id}`),
        },
      ]
    },
    {
      items: [
        {
          key: 'delete',
          label: row => row.is_Active ? 'Deactivate' : 'Activate',
          icon: Trash2,
          destructive: true,
          onClick: (row) => {
            setSelectedSupplierId(row.id);
            setDeleteModalOpen(true);
          },
        },
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2 text-muted-foreground text-sm">
        <span>Suppliers</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card text-card-foreground p-4 rounded-xl border flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                <span className={`text-xs font-semibold ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.trend} {stat.isUp ? '↑' : '↓'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6 border-b border-border mb-4 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <DataView
        data={filteredSuppliers}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        selectable
        search={{
          placeholder: 'Search by id or supplier name...',
          value: search,
          onChange: setSearch,
        }}
        filter={{
          label: 'Filter',
          onClick: () => console.log('Filter clicked'),
        }}
        export={{
          label: 'Export',
          onClick: () => console.log('Export clicked'),
        }}
        addButton={{
          label: 'Add',
          onClick: () => navigate('/dashboard/crm/suppliers/add'),
        }}
        columns={columns}
        rowActionsMenu={rowActionsMenu}
        pagination={{
          page: page,
          totalPages: totalPages,
          onPageChange: setPage,
          prevLabel: 'Pre',
          nextLabel: 'Next',
        }}
      />

      <DeleteConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Confirm Status Change"
        description="Are you sure you want to change the status of this supplier?"
      />
    </div>
  );
}
