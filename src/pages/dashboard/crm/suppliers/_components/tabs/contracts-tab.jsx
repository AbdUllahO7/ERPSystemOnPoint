import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataView } from "@/components/data-view/DataView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { Pencil, FileText, Plus, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  getSupplierContracts, 
  createSupplierContract, 
  updateSupplierContract,
  changeSupplierContractStatus 
} from "@/lib/api";

export function ContractsTab({ supplierId }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  
  const [editContract, setEditContract] = useState(null);
  const [statusContract, setStatusContract] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const [formData, setFormData] = useState({
    contractName: "",
    totalValue: "",
    startDate: "",
    endDate: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["supplierContracts", supplierId, page],
    queryFn: () => getSupplierContracts({ SupplierId: supplierId, PageNumber: page, PageSize: 10 }),
    enabled: !!supplierId,
  });

  useEffect(() => {
    if (editContract) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        contractName: editContract.contractName || "",
        totalValue: editContract.totalValue?.toString() || "",
        startDate: editContract.startDate ? editContract.startDate.split('T')[0] : "",
        endDate: editContract.endDate ? editContract.endDate.split('T')[0] : "",
      });
      setIsAddModalOpen(true);
    }
  }, [editContract]);

  const addMutation = useMutation({
    mutationFn: (newContract) => createSupplierContract(newContract),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplierContracts", supplierId] });
      toast.success("Contract added successfully");
      closeModal();
    },
    onError: () => toast.error("Failed to add contract")
  });

  const updateMutation = useMutation({
    mutationFn: (updatedContract) => updateSupplierContract(updatedContract),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplierContracts", supplierId] });
      toast.success("Contract updated successfully");
      closeModal();
    },
    onError: () => toast.error("Failed to update contract")
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => changeSupplierContractStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplierContracts", supplierId] });
      toast.success("Status changed successfully");
      setIsStatusModalOpen(false);
      setStatusContract(null);
      setNewStatus("");
    },
    onError: () => toast.error("Failed to change status")
  });

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditContract(null);
    setFormData({ contractName: "", totalValue: "", startDate: "", endDate: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplierId) {
      toast.error("Supplier ID is missing");
      return;
    }
    
    const payload = {
      supplierId: supplierId,
      contractName: formData.contractName,
      totalValue: Number(formData.totalValue),
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
    };

    if (editContract) {
      updateMutation.mutate({ ...payload, id: editContract.id, status: editContract.status || "Active" });
    } else {
      addMutation.mutate(payload);
    }
  };

  const handleStatusSubmit = (e) => {
    e.preventDefault();
    if (!statusContract || !newStatus) return;
    statusMutation.mutate({ id: statusContract.id, status: newStatus });
  };

  const items = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;

  let filteredContracts = items;
  if (search) {
    filteredContracts = filteredContracts.filter(c => c.contractName?.toLowerCase().includes(search.toLowerCase()));
  }

  const columns = [
    { key: "contractName", label: "Contract Name", render: (row) => <span className="font-medium">{row.contractName}</span> },
    { key: "totalValue", label: "Total Value", render: (row) => <span className="text-blue-500 font-semibold">{row.totalValue}</span> },
    { key: "startDate", label: "Start Date", render: (row) => row.startDate ? new Date(row.startDate).toLocaleDateString() : "-" },
    { key: "endDate", label: "End Date", render: (row) => row.endDate ? new Date(row.endDate).toLocaleDateString() : "-" },
    { 
      key: "status", 
      label: "Status",
      render: (row) => {
        const colorClasses = {
          "Active": "bg-green-100 text-green-600",
          "Expired": "bg-orange-100 text-orange-600",
          "Canceled": "bg-red-100 text-red-600"
        };
        const colorClass = colorClasses[row.status] || "bg-gray-100 text-gray-600";
        return <span className={`px-3 py-1 ${colorClass} rounded-full text-xs font-medium`}>{row.status || 'Unknown'}</span>;
      }
    },
  ];

  const rowActionsMenu = [
    {
      items: [
        {
          key: 'edit',
          label: 'Edit',
          icon: Pencil,
          onClick: (row) => setEditContract(row),
        },
        {
          key: 'changeStatus',
          label: 'Change Status',
          icon: RefreshCw,
          onClick: (row) => {
            setStatusContract(row);
            setNewStatus(row.status || "Active");
            setIsStatusModalOpen(true);
          },
        },
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
          if (!open) closeModal();
          else setIsAddModalOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setEditContract(null)}>
              <Plus className="w-4 h-4" />
              Add new Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] p-0 border-0 rounded-2xl overflow-hidden">
            <div className="p-6">
              <DialogHeader className="flex flex-row items-center gap-4 space-y-0 border-b pb-6">
                <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-500" />
                </div>
                <DialogTitle className="text-xl font-semibold">
                  {editContract ? "Edit Contract" : "Add new Contract"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label className="text-sm font-semibold text-foreground">Contract Name</Label>
                    <Input
                      placeholder="Contract Name"
                      value={formData.contractName}
                      onChange={(e) => setFormData({ ...formData, contractName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-sm font-semibold text-foreground">Total Value</Label>
                    <Input
                      type="number"
                      placeholder="Total Value"
                      value={formData.totalValue}
                      onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">Start Date</Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground">End Date</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#006fee] hover:bg-[#005bc4] text-white h-11 text-base font-medium" 
                  disabled={addMutation.isPending || updateMutation.isPending}
                >
                  {addMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataView
        data={filteredContracts}
        isLoading={isLoading}
        getRowId={(row) => row.id}
        search={{
          placeholder: 'Search by contract name...',
          value: search,
          onChange: setSearch,
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

      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleStatusSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                  <SelectItem value="Canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsStatusModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={statusMutation.isPending}>
                {statusMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
