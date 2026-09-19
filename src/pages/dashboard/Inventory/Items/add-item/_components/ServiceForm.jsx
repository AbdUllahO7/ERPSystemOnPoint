import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAllCategories, getLeafAccounts, createService, updateService, getProductById } from "@/lib/api";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

export default function ServiceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      name_Product: "",
      product_Number: "",
      category_Id: "",
      billing_Method: "",
      cost_Price: 0,
      consumer_Price: 0,
      revenue_Account_Id: "",
      expense_Account_Id: "",
      requires_Contract: false,
      requires_Scheduling: false,
      requires_Shipping: false,
    },
  });

  const { data: categoriesRes, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getAllCategories({ PageNumber: 1, PageSize: 100 }),
  });

  const { data: accountsRes, isLoading: accountsLoading } = useQuery({
    queryKey: ["leaf-accounts"],
    queryFn: () => getLeafAccounts({ PageNumber: 1, PageSize: 100 }),
  });

  const { data: serviceRes, isLoading: serviceLoading } = useQuery({
    queryKey: ["service", id],
    queryFn: () => getProductById(id),
    enabled: isEdit,
  });

  const categories = categoriesRes?.data?.items || [];
  const accounts = accountsRes?.data?.items || [];

  useEffect(() => {
    if (isEdit && serviceRes?.data) {
      const sData = serviceRes.data;
      const unitData = sData.variants?.[0]?.productUnitDtos?.[0] || {};
      reset({
        name_Product: sData.name_Product || "",
        product_Number: sData.product_Number || "",
        category_Id: sData.category_Id || "",
        billing_Method: sData.billing_Method || "",
        cost_Price: unitData.cost_Price || 0,
        consumer_Price: unitData.consumer_Price || 0,
        revenue_Account_Id: sData.revenue_Account_Id || "",
        expense_Account_Id: sData.expense_Account_Id || "",
        requires_Contract: sData.requires_Contract ?? false,
        requires_Scheduling: sData.requires_Scheduling ?? false,
        requires_Shipping: sData.requires_Shipping ?? false,
      });
    }
  }, [isEdit, serviceRes, reset]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? updateService({ id, ...data }) : createService(data),
    onSuccess: () => {
      toast.success(isEdit ? "Service updated successfully" : "Service created successfully");
      navigate("/dashboard/inventory/items-management/items");
    },
    onError: (error) => {
      toast.error(error.message || (isEdit ? "Failed to update service" : "Failed to create service"));
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isEdit && serviceLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading service details...</div>;
  }

  return (
    <form
      id="service-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Upload Section */}
      <div className="bg-card p-6 rounded-xl border shadow-sm flex items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
            <ImageIcon className="w-8 h-8 opacity-50" />
          </div>
          <div>
            <button
              type="button"
              className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted mb-2"
            >
              Upload
            </button>
            <p className="text-xs text-muted-foreground">
              Upload image size 4MB, Format JPG, PNG, SVG
            </p>
          </div>
        </div>

        <div className="flex gap-4 ml-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-20 h-20 rounded-xl bg-muted/50 border relative group flex items-center justify-center"
            >
              <button
                type="button"
                className="absolute top-1 right-1 w-6 h-6 bg-white rounded flex items-center justify-center text-red-500 border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Toggles Section */}
      <div className="bg-card p-6 rounded-xl border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <span className="text-sm font-medium text-muted-foreground">
              Needs Contract
            </span>
            <Switch checked={watch("requires_Contract")} onCheckedChange={(val) => setValue("requires_Contract", val)} />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <span className="text-sm font-medium text-muted-foreground">
              Needs Appointment
            </span>
            <Switch checked={watch("requires_Scheduling")} onCheckedChange={(val) => setValue("requires_Scheduling", val)} />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <span className="text-sm font-medium text-muted-foreground">
              Requires Shipping
            </span>
            <Switch checked={watch("requires_Shipping")} onCheckedChange={(val) => setValue("requires_Shipping", val)} />
          </div>
        </div>
      </div>

      {/* Dynamic Fields Section */}
      <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="name_Product"
              className="text-sm font-semibold text-foreground leading-none"
            >
              Item Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name_Product"
              placeholder="Item Name"
              className="h-11 bg-transparent"
              {...register("name_Product", { required: true })}
            />
            {errors.name_Product && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="product_Number"
              className="text-sm font-semibold text-foreground leading-none"
            >
              Item Code
            </label>
            <Input
              id="product_Number"
              placeholder="Item Code"
              className="h-11 bg-transparent"
              {...register("product_Number")}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="category_Id"
              className="text-sm font-semibold text-foreground leading-none"
            >
              Item Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category_Id"
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("category_Id", { required: true })}
              disabled={categoriesLoading}
            >
              <option value="">{categoriesLoading ? "Loading..." : "Item Category"}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.category_Id && <span className="text-red-500 text-xs">Required</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="billing_Method"
              className="text-sm font-semibold text-foreground leading-none"
            >
              Billing Method <span className="text-red-500">*</span>
            </label>
            <select
              id="billing_Method"
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("billing_Method", { required: true })}
            >
              <option value="">Billing Method</option>
              <option value="FixedPrice">Fixed Price</option>
              <option value="Hourly">Hourly</option>
              <option value="Daily">Daily</option>
              <option value="Monthly">Monthly</option>
              <option value="QuantityBased">Quantity Based</option>
            </select>
            {errors.billing_Method && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="cost_Price"
              className="text-sm font-semibold text-foreground leading-none"
            >
              Cost
            </label>
            <Input
              id="cost_Price"
              type="number"
              placeholder="0"
              className="h-11 bg-transparent"
              {...register("cost_Price")}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="consumer_Price"
              className="text-sm font-semibold text-foreground leading-none"
            >
              Consumer Price
            </label>
            <Input
              id="consumer_Price"
              type="number"
              placeholder="0"
              className="h-11 bg-transparent"
              {...register("consumer_Price")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="revenue_Account_Id"
              className="text-sm font-semibold text-foreground leading-none"
            >
              Revenue Account <span className="text-red-500">*</span>
            </label>
            <select
              id="revenue_Account_Id"
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("revenue_Account_Id", { required: true })}
              disabled={accountsLoading}
            >
              <option value="">{accountsLoading ? "Loading..." : "Revenue Account"}</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.account_Name}</option>
              ))}
            </select>
            {errors.revenue_Account_Id && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="expense_Account_Id"
              className="text-sm font-semibold text-foreground leading-none"
            >
              Expense Account <span className="text-red-500">*</span>
            </label>
            <select
              id="expense_Account_Id"
              className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("expense_Account_Id", { required: true })}
              disabled={accountsLoading}
            >
              <option value="">{accountsLoading ? "Loading..." : "Expense Account"}</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.account_Name}</option>
              ))}
            </select>
            {errors.expense_Account_Id && <span className="text-red-500 text-xs">Required</span>}
          </div>
        </div>
      </div>
    </form>
  );
}
