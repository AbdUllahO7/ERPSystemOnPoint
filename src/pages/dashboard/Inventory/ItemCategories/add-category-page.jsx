import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createCategory, updateCategory, getCategoryById, getAllCategories } from "@/lib/api";
import toast from "react-hot-toast";

export default function AddCategoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const stateParentId = location.state?.parentId;
  
  const [categoryType, setCategoryType] = useState(stateParentId ? "sub" : "main");

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      serialNumber: "",
      categoryName: "",
      parentCategoryId: stateParentId || "",
    },
  });

  const { data: categoryRes } = useQuery({
    queryKey: ["category", id],
    queryFn: () => getCategoryById(id),
    enabled: isEdit,
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ["all-categories"],
    queryFn: () => getAllCategories({ PageNumber: 1, PageSize: 100 }),
  });
  
  const categoriesList = categoriesRes?.data?.items || [];
  // Only show main categories as parents (or all depending on business logic, assuming all for now)

  useEffect(() => {
    if (isEdit && categoryRes?.data) {
      const data = categoryRes.data;
      reset({
        serialNumber: data.code || "",
        categoryName: data.categoryName || "",
        parentCategoryId: data.parentCategoryId ? String(data.parentCategoryId) : "",
      });
      if (data.parentCategoryId) {
        setCategoryType("sub");
      } else {
        setCategoryType("main");
      }
    } else if (!isEdit && stateParentId) {
      setCategoryType("sub");
      setValue("parentCategoryId", stateParentId);
    }
  }, [isEdit, categoryRes, reset, stateParentId, setValue]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? updateCategory(id, data) : createCategory(data),
    onSuccess: () => {
      toast.success(`Category ${isEdit ? "updated" : "created"} successfully!`);
      navigate("/dashboard/inventory/items-management/categories");
    },
    onError: (error) => {
      console.log(`Failed to ${isEdit ? "update" : "create"} category`, error);
      toast.error(error?.message && error.message !== "An unexpected error occurred" ? error.message : `Failed to ${isEdit ? "update" : "create"} category!`);
    }
  });

  const onSubmit = (data) => {
    const payload = {
      name_Category: data.categoryName,
      parent_category: categoryType === "sub" && data.parentCategoryId ? data.parentCategoryId : null
    };
    if (!isEdit) {
      payload.serial_number = data.serialNumber;
    }
    if (isEdit) {
      payload.id = id;
    }
    mutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">{isEdit ? "Edit Category" : "Add Category"}</h2>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span className="cursor-pointer hover:text-primary" onClick={() => navigate("/dashboard/inventory/items-management/categories")}>Item Categories</span>
            <span>/</span>
            <span className="font-medium text-foreground">{isEdit ? "Edit Category" : "Add Category"}</span>
          </div>
        </div>

        <Button onClick={handleSubmit(onSubmit)} className="px-8" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "+ Add"}
        </Button>
      </div>

      <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm">
        <div className="mb-6 space-y-3">
          <label className="text-base font-semibold text-foreground">
            Is it a Main or a Sub category?
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="categoryType"
                value="main"
                checked={categoryType === "main"}
                onChange={() => setCategoryType("main")}
                disabled={Boolean(stateParentId)}
                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 disabled:opacity-50"
              />
              <span className="text-sm font-medium text-muted-foreground">
                Main Category
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="categoryType"
                value="sub"
                checked={categoryType === "sub"}
                onChange={() => setCategoryType("sub")}
                disabled={Boolean(stateParentId)}
                className="w-4 h-4 text-primary focus:ring-primary border-gray-300 disabled:opacity-50"
              />
              <span className="text-sm font-medium text-muted-foreground">
                Subcategory
              </span>
            </label>
          </div>
        </div>

        <form className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="serialNumber"
              className="text-sm font-semibold text-foreground leading-none"
            >
              Serial Number
            </label>
            <Input
              id="serialNumber"
              placeholder="Serial Number"
              className="h-9 bg-transparent"
              {...register("serialNumber", { required: true })}
            />
            {errors.serialNumber && (
              <span className="text-red-500 text-xs">Required</span>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="categoryName"
              className="text-sm font-semibold text-foreground leading-none"
            >
              Category Name
            </label>
            <Input
              id="categoryName"
              placeholder="Category Name"
              className="h-9 bg-transparent"
              {...register("categoryName", { required: true })}
            />
            {errors.categoryName && (
              <span className="text-red-500 text-xs">Required</span>
            )}
          </div>

          {categoryType === "sub" && (
            <div className="space-y-2">
              <label
                htmlFor="parentCategoryId"
                className="text-sm font-semibold text-foreground leading-none"
              >
                The category it belongs to
              </label>
              <Controller
                name="parentCategoryId"
                control={control}
                rules={{ required: categoryType === "sub" }}
                render={({ field }) => (
                  <Select
                    key={field.value}
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={Boolean(stateParentId)}
                  >
                    <SelectTrigger className="w-full h-9 bg-transparent">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>

                    <SelectContent position="popper">
                      {categoriesList.map(cat => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.parentCategoryId && (
                <span className="text-red-500 text-xs">Required</span>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
