import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { 
  createWarehouse, 
  updateWarehouse, 
  getWarehouseById,
  getAllManagers,
  getBranches
} from "../../../../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import toast from "react-hot-toast";

export default function AddEditWarehouse() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      warehouse_Code: "",
      name_Warehouse: "",
      location: "",
      manager_Id: "",
      branch_Id: "",
    }
  });

  const { data: managersData } = useQuery({
    queryKey: ["getAllManagers"],
    queryFn: () => getAllManagers({ pageNumber: 1, pageSize: 100 }),
  });
  const managers = managersData?.data?.items || [];

  const { data: branchData } = useQuery({
    queryKey: ["getBranches"],
    queryFn: () => getBranches({ pageNumber: 1, pageSize: 100 }),
  });
  const branches = branchData?.data?.items || [];

  const { data: warehouseData, isLoading: isLoadingWarehouse } = useQuery({
    queryKey: ["getWarehouseById", id],
    queryFn: () => getWarehouseById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && warehouseData?.data) {
      const wData = warehouseData.data;
      reset({
        warehouse_Code: wData.warehouse_Code || "",
        name_Warehouse: wData.name_Warehouse || "",
        location: wData.location || "",
        manager_Id: wData.manager_Id || "",
        branch_Id: wData.branch_Id || "",
      });
    }
  }, [isEdit, warehouseData, reset]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? updateWarehouse({ id, ...data }) : createWarehouse(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["getWarehouses"]);
      toast.success(isEdit ? "Warehouse updated successfully!" : "Warehouse added successfully!");
      navigate("/dashboard/inventory/warehouses");
    },
    onError: (error) => {
      console.error("Failed to save warehouse", error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : "Failed to save warehouse!");
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const pageTitle = isEdit ? "Edit Warehouse" : "Add Warehouse";

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">{pageTitle}</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>Warehouses</span>
            <span>/</span>
            <span className="font-medium text-foreground">{pageTitle}</span>
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit(onSubmit)} 
          disabled={mutation.isPending || isLoadingWarehouse}
          className="px-8"
        >
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        {isLoadingWarehouse && isEdit ? (
          <div className="text-sm text-muted-foreground">Loading details...</div>
        ) : (
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="warehouse_Code" className="text-sm font-semibold text-foreground leading-none">
                Warehouse Code
              </label>
              <Input 
                id="warehouse_Code" 
                placeholder="Warehouse Code" 
                className="h-11 bg-transparent"
                {...register("warehouse_Code", { required: true })}
              />
              {errors.warehouse_Code && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="name_Warehouse" className="text-sm font-semibold text-foreground leading-none">
                Warehouse Name
              </label>
              <Input 
                id="name_Warehouse" 
                placeholder="Warehouse Name" 
                className="h-11 bg-transparent"
                {...register("name_Warehouse", { required: true })}
              />
              {errors.name_Warehouse && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-semibold text-foreground leading-none">
                Location
              </label>
              <Input 
                id="location" 
                placeholder="Location" 
                className="h-11 bg-transparent"
                {...register("location")}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="manager_Id" className="text-sm font-semibold text-foreground leading-none">
                Manager Name
              </label>
              <select
                id="manager_Id"
                className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("manager_Id", { required: true })}
              >
                <option value="">Select Manager Name</option>
                {managers.map((manager) => (
                  <option key={manager.managerId} value={manager.managerId}>
                    {manager.managerName}
                  </option>
                ))}
              </select>
              {errors.manager_Id && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="branch_Id" className="text-sm font-semibold text-foreground leading-none">
                Branch Name
              </label>
              <select
                id="branch_Id"
                className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("branch_Id", { required: true })}
              >
                <option value="">Select Branch Name</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branchName}
                  </option>
                ))}
              </select>
              {errors.branch_Id && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
