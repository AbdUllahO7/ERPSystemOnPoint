import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Upload,
  Trash2,
  Image as ImageIcon,
  Plus,
  X,
  Search,
  Filter,
  SlidersHorizontal,
  QrCode,
  ScanBarcode,
  Edit2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getAllCategories,
  getLeafAccounts,
  getAllUnitOfMeasurements,
  getAllProductAttributes,
  createSimpleProductWithSpecs,
  updateSimpleProductWithSpecs,
  getProductById,
} from "@/lib/api";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

export default function SimpleProductWithVariantsForm({
  currentStep,
  onNext,
  thereAreUnits,
  setThereAreUnits,
  customSpecs = [],
}) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { register, control, handleSubmit, watch, setValue, getValues, reset, formState: { errors } } =
    useForm({
      defaultValues: {
        name_Product: "",
        product_Number: "",
        has_Expiry_Date: false,
        is_Tracking_Inventory: true,
        category_Id: "",
        item_Origin: "",
        requires_Shipping: false,
        there_Are_Units: thereAreUnits,
        revenue_Account_Id: "",
        expense_Account_Id: "",
        inventory_Account_Id: "",
        selectedAttributes: [],
        product_Units: [
          {
            unitName: "قطعة",
            relative_factor: 1,
            is_Default_Selling: true,
            is_Default_Purchasing: true,
          },
        ],
        createProductvariants: [],
      },
    });

  const watchThereAreUnits = watch("there_Are_Units");

  useEffect(() => {
    if (watchThereAreUnits !== thereAreUnits) {
      setThereAreUnits(watchThereAreUnits);
    }
  }, [watchThereAreUnits, thereAreUnits, setThereAreUnits]);

  const {
    fields: unitFields,
    append: appendUnit,
    remove: removeUnit,
  } = useFieldArray({
    control,
    name: "product_Units",
  });

  const { fields: variantFields, replace: replaceVariants } = useFieldArray({
    control,
    name: "createProductvariants",
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getAllCategories({ PageNumber: 1, PageSize: 100 }),
  });

  const { data: accountsRes } = useQuery({
    queryKey: ["leaf-accounts"],
    queryFn: () => getLeafAccounts({ PageNumber: 1, PageSize: 100 }),
  });

  const { data: unitsRes, isLoading: unitsLoading } = useQuery({
    queryKey: ["unit-measurements"],
    queryFn: () => getAllUnitOfMeasurements({ PageNumber: 1, PageSize: 1000 }),
  });

  const { data: attributesRes, isLoading: attrsLoading } = useQuery({
    queryKey: ["product-attributes"],
    queryFn: () => getAllProductAttributes({ PageNumber: 1, PageSize: 1000 }),
  });

  const { data: productRes, isLoading: productLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: isEdit,
  });
  console.log(productRes)
  

  const categories = categoriesRes?.data?.items || [];
  const accounts = accountsRes?.data?.items || [];
  const measurements = unitsRes?.data?.items || [];
  const attributes = attributesRes?.data?.items || [];
  const productUnitsWatch = watch("product_Units");
  const selectedAttributesWatch = watch("selectedAttributes");
  const createProductvariantsWatch = watch("createProductvariants");

  useEffect(() => {
    if (measurements.length > 0 && !isEdit) {
      const pieceUnit = measurements.find(
        (m) => m.system_code === "PIECE" || m.unit_name.includes("قطعة"),
      );
      const currentFirstUnitId = watch(
        "product_Units.0.unit_Of_Measurement_Id",
      );
      if (pieceUnit && !currentFirstUnitId) {
        setValue(
          "product_Units.0.unit_Of_Measurement_Id",
          pieceUnit.unit_Name_Id,
        );
        setValue("product_Units.0.unitName", pieceUnit.unit_name);
      }
    }
  }, [measurements, setValue, watch, isEdit]);

  useEffect(() => {
    if (isEdit && productRes?.data) {
      const bData = productRes.data;

      const attrMap = {};
      bData.variants?.forEach((v) => {
        v.variantValues?.forEach((val) => {
          if (!attrMap[val.product_Attribute_Id]) {
            attrMap[val.product_Attribute_Id] = {
              attribute_id: val.product_Attribute_Id,
              attribute_name: val.attribute_Name,
              values: [],
            };
          }
          if (
            !attrMap[val.product_Attribute_Id].values.find(
              (x) => x.value_id === val.product_Attribute_Value_Id,
            )
          ) {
            attrMap[val.product_Attribute_Id].values.push({
              value_id: val.product_Attribute_Value_Id,
              value_name: val.value_Name,
            });
          }
        });
      });
      const selectedAttributes = Object.values(attrMap);

      const mappedVariants =
        bData.variants?.map((v) => {
          const uDto = v.productUnitDtos?.[0] || {};
          const attrs = v.variantValues || [];
          return {
            id: v.id,
            minimum_Alert_Level: v.minimum_Alert_Level || 0,
            maximum_Stock_Level: v.maximum_Stock_Level || 0,
            barcode_Option: "Manual",
            barcode: uDto.barcode || "",
            qr_Code: uDto.qr_code || "",
            cost_Price: uDto.cost_Price || 0,
            consumer_Price: uDto.consumer_Price || 0,
            wholesale_Price: uDto.wholesale_Price || 0,
            last_Purchase_Price: uDto.last_Purchase_Price || 0,
            average_Purchase_Price: uDto.average_Purchase_Price || 0,
            unit_Of_Measurement_Id: uDto.unit_Of_Measurement_Id || "",
            secondunit_Of_Measurement_Id: null,
            relative_factor: uDto.conversion_Factor || 1,
            variant_Values: attrs.map((a) => ({
              productAttributeValueId: a.product_Attribute_Value_Id,
            })),
            _display_name:
              attrs.map((a) => a.value_Name).join(" - ") || "Base Product",
            _attr_details: attrs.map((a) => ({
              attribute_name: a.attribute_Name,
              value_name: a.value_Name,
            })),
          };
        }) || [];

      reset({
        name_Product: bData.name_Product || "",
        product_Number: bData.product_Number || "",
        has_Expiry_Date: bData.has_Expiry_Date ?? false,
        is_Tracking_Inventory: bData.is_Tracking_Inventory ?? true,
        category_Id: bData.category_Id || "",
        item_Origin: bData.item_Origin || "",
        requires_Shipping: bData.requires_Shipping ?? false,
        there_Are_Units: bData.has_Multiple_Units ?? false,
        revenue_Account_Id: bData.revenue_Account_Id || "",
        expense_Account_Id: bData.expense_Account_Id || "",
        inventory_Account_Id: bData.inventory_Account_Id || "",
        selectedAttributes: selectedAttributes,
        product_Units: [
          {
            unitName: "قطعة",
            unit_Of_Measurement_Id: bData.variants?.[0]?.productUnitDtos?.[0]?.unit_Of_Measurement_Id || null,
            relative_factor: 1,
            is_Default_Selling: true,
            is_Default_Purchasing: true,
          },
        ],
        createProductvariants: mappedVariants,
      });
    }
  }, [isEdit, productRes, reset]);

  const generateCombinations = () => {
    const attrs = selectedAttributesWatch.filter(
      (a) => a.attribute_id && a.values && a.values.length > 0,
    );

    const cartesianProduct = (arrays) => {
      return arrays.reduce(
        (acc, curr) => {
          return acc.flatMap((a) => curr.map((c) => [...a, c]));
        },
        [[]],
      );
    };

    const valueArrays = attrs.map((a) => {
      const selectedAttrObj = attributes.find(
        (att) => att.attribute_id === a.attribute_id,
      );
      return a.values
        .filter((v) => v.value_id)
        .map((v) => {
          const valObj = selectedAttrObj?.values?.find(
            (val) => val.value_id === v.value_id,
          );
          return {
            productAttributeValueId: v.value_id,
            value_name: valObj ? valObj.value_name : "Unknown",
            attribute_name: selectedAttrObj
              ? selectedAttrObj.attribute_name
              : "Unknown",
          };
        });
    });

    let attrCombinations = [[]];
    if (valueArrays.length > 0) {
      attrCombinations = cartesianProduct(valueArrays);
    }

    let units = [
      {
        unit_Of_Measurement_Id: productUnitsWatch[0]?.unit_Of_Measurement_Id || null,
        secondunit_Of_Measurement_Id: null,
        relative_factor: 1,
        unitName: productUnitsWatch[0]?.unitName || "",
      },
    ];
    if (thereAreUnits) {
      units = productUnitsWatch.filter((u) => u.unit_Of_Measurement_Id);
    }

    const existingVariants = getValues("createProductvariants") || [];

    const combinations = [];
    attrCombinations.forEach((attrComb) => {
      units.forEach((unit) => {
        const displayNameParts = attrComb.map((ac) => ac.value_name);
        if (unit.unitName) displayNameParts.push(unit.unitName);

        const newVariantValues = attrComb.map((ac) => ({
          productAttributeValueId: ac.productAttributeValueId,
        }));

        // Preserve existing details if combination already exists
        const existingMatch = existingVariants.find((ev) => {
          // If not multiple units, unit might be null in form but present in API
          const sameUnit = !thereAreUnits || ev.unit_Of_Measurement_Id === unit.unit_Of_Measurement_Id || (!ev.unit_Of_Measurement_Id && !unit.unit_Of_Measurement_Id);
          const sameAttrs = ev.variant_Values?.length === newVariantValues.length && ev.variant_Values?.every((evVal) =>
            newVariantValues.some((nvVal) => nvVal.productAttributeValueId === evVal.productAttributeValueId)
          );
          return sameUnit && sameAttrs;
        });

        combinations.push({
          id: existingMatch?.id || undefined,
          minimum_Alert_Level: existingMatch?.minimum_Alert_Level || 0,
          maximum_Stock_Level: existingMatch?.maximum_Stock_Level || 0,
          barcode_Option: existingMatch?.barcode_Option || "Manual",
          barcode: existingMatch?.barcode || "",
          qr_Code: existingMatch?.qr_Code || existingMatch?.qr_code || "",
          cost_Price: existingMatch?.cost_Price || 0,
          consumer_Price: existingMatch?.consumer_Price || 0,
          wholesale_Price: existingMatch?.wholesale_Price || 0,
          last_Purchase_Price: existingMatch?.last_Purchase_Price || 0,
          average_Purchase_Price: existingMatch?.average_Purchase_Price || 0,
          unit_Of_Measurement_Id: existingMatch?.unit_Of_Measurement_Id || unit.unit_Of_Measurement_Id,
          secondunit_Of_Measurement_Id: existingMatch?.secondunit_Of_Measurement_Id || unit.secondunit_Of_Measurement_Id || null,
          relative_factor: unit.relative_factor || 1,
          variant_Values: newVariantValues,
          _display_name: displayNameParts.join(" - ") || "Base Product",
          _attr_details: attrComb, // for UI mapping
        });
      });
    });

    replaceVariants(combinations);
  };

  const handleNextStep = () => {
    if (currentStep === 3) {
      generateCombinations();
    }
    onNext();
  };

  const createMutation = useMutation({
    mutationFn: createSimpleProductWithSpecs,
    onSuccess: () => {
      toast.success("Product created successfully");
      navigate("/dashboard/inventory/items-management/items");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create product");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateSimpleProductWithSpecs,
    onSuccess: () => {
      toast.success("Product updated successfully");
      navigate("/dashboard/inventory/items-management/items");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update product");
    },
  });

  const onSubmit = (data) => {
    const isFinalStep = currentStep === 4;
    if (!isFinalStep) {
      handleNextStep();
    } else {
      const payload = { ...data };
      delete payload.selectedAttributes;
      if (!payload.there_Are_Units) {
        payload.product_Units = [];
      }

      payload.createProductvariants = payload.createProductvariants.map((v) => {
        const { _display_name, _attr_details, ...rest } = v;
        return rest;
      });

      if (isEdit) {
        updateMutation.mutate({ ...payload, id });
      } else {
        createMutation.mutate(payload);
      }
    }
  };

  const renderDetails = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card p-6 rounded-xl border shadow-sm flex items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs">Image</span>
          </div>
          <div>
            <Button variant="outline" className="mb-2">
              Upload
            </Button>
            <p className="text-xs text-muted-foreground">
              Upload image size 4MB, Format JPG, PNG, SVG
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <span className="text-sm font-medium">Requires Shipping</span>
            <Switch
              checked={watch("requires_Shipping")}
              onCheckedChange={(val) => setValue("requires_Shipping", val)}
            />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <span className="text-sm font-medium">There Are Units</span>
            <Switch
              checked={watch("there_Are_Units")}
              onCheckedChange={(val) => setValue("there_Are_Units", val)}
            />
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
            <span className="text-sm font-medium">Has Expiry Date</span>
            <Switch
              checked={watch("has_Expiry_Date")}
              onCheckedChange={(val) => setValue("has_Expiry_Date", val)}
            />
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Item Name <span className="text-red-500">*</span></label>
            <Input
              placeholder="Item Name"
              className="h-11"
              {...register("name_Product", { required: true })}
            />
            {errors.name_Product && <span className="text-red-500 text-xs">Required</span>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Item Code</label>
            <Input
              placeholder="Item Code"
              className="h-11"
              {...register("product_Number")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Item Category <span className="text-red-500">*</span></label>
            <select
              className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              {...register("category_Id", { required: true })}
            >
              <option value="">Item Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_Id && <span className="text-red-500 text-xs">Required</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Item Origin</label>
            <select
              className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              {...register("item_Origin")}
            >
              <option value="">Item Origin</option>
              <option value="LOCAL">Local</option>
              <option value="IMPORTED">Imported</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Revenue Account</label>
            <select
              className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              {...register("revenue_Account_Id")}
            >
              <option value="">Revenue Account</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_Name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Expense Account</label>
            <select
              className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              {...register("expense_Account_Id")}
            >
              <option value="">Expense Account</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_Name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Inventory Account</label>
            <select
              className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              {...register("inventory_Account_Id")}
            >
              <option value="">Inventory Account</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_Name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    // Keep selectedAttributes in sync with customSpecs (from Step 1 checkboxes)
    const currentSelected = getValues("selectedAttributes") || [];
    const newSelectedAttributes = customSpecs.map(spec => {
      const existing = currentSelected.find(sa => sa.attribute_id === spec.attribute_id);
      return existing || { attribute_id: spec.attribute_id, attribute_name: spec.attribute_name, values: [] };
    });
    // Check if they are actually different to prevent infinite loops
    const isDifferent = JSON.stringify(currentSelected.map(s => s.attribute_id)) !== JSON.stringify(newSelectedAttributes.map(s => s.attribute_id));
    if (isDifferent) {
      setValue("selectedAttributes", newSelectedAttributes);
    }
  }, [customSpecs, setValue, getValues]);

  const renderUnitsAndVariants = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Variants / Attributes Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Variants</h3>
        </div>

        {selectedAttributesWatch.map((spec, index) => (
          <div
            key={spec.attribute_id}
            className="bg-card p-6 rounded-xl border shadow-sm relative"
          >
            <input
              type="hidden"
              {...register(`selectedAttributes.${index}.attribute_id`)}
              value={spec.attribute_id}
            />
            <div className="flex items-center justify-between mb-4 border-b pb-4">
              <div className="flex-1 space-y-2 mr-4 max-w-[300px]">
                <h4 className="text-sm font-semibold text-primary">
                  Variant {index + 1}
                </h4>
                <p className="text-lg font-bold">{spec.attribute_name}</p>
              </div>
              <div className="flex gap-2 items-end h-full mt-6">
                <Button
                  type="button"
                  onClick={() => {
                    const currentValues =
                      getValues(`selectedAttributes.${index}.values`) || [];
                    setValue(`selectedAttributes.${index}.values`, [
                      ...currentValues,
                      { value_id: "" },
                    ]);
                  }}
                  className="bg-[#0070E0] hover:bg-[#0070E0]/90"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Value
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {selectedAttributesWatch[index]?.values?.map((val, vIndex) => {
                const attrValues = spec.values || []; // `spec` might not have `values`, let's get it from `attributes` array
                const fullAttr = attributes.find(
                  (a) => a.attribute_id === spec.attribute_id,
                );
                const availableValues = fullAttr ? fullAttr.values : [];

                return (
                  <div key={vIndex} className="flex items-end gap-6 max-w-lg">
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-semibold text-muted-foreground">
                        Value
                      </label>
                      <select
                        className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm disabled:opacity-50"
                        {...register(
                          `selectedAttributes.${index}.values.${vIndex}.value_id`,
                        )}
                      >
                        <option value="">Select Value</option>
                        {availableValues.map((av) => (
                          <option key={av.value_id} value={av.value_id}>
                            {av.value_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const currentValues = getValues(
                          `selectedAttributes.${index}.values`,
                        );
                        setValue(
                          `selectedAttributes.${index}.values`,
                          currentValues.filter((_, i) => i !== vIndex),
                        );
                      }}
                      className="flex items-center gap-2 text-red-500 hover:text-red-600 h-11 px-4 font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              {(!selectedAttributesWatch[index]?.values ||
                selectedAttributesWatch[index]?.values.length === 0) && (
                <p className="text-sm text-muted-foreground italic">
                  No values added yet. Click "Add Value".
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Units Section */}
      {thereAreUnits && (
        <div className="space-y-4 pt-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Units</h3>
            <Button
              type="button"
              onClick={() => appendUnit({ unitName: "", relative_factor: 1 })}
              className="bg-[#0070E0] hover:bg-[#0070E0]/90"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Unit
            </Button>
          </div>

          {unitFields.map((field, index) => (
            <div
              key={field.id}
              className="bg-card p-6 rounded-xl border shadow-sm flex items-end gap-6 relative"
            >
              <div className="flex-1 space-y-2">
                <label className="text-sm font-semibold">Unit Name</label>
                {index === 0 ? (
                  <Input
                    readOnly
                    className="h-11 bg-muted/50"
                    {...register(`product_Units.${index}.unitName`)}
                  />
                ) : (
                  <select
                    className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm disabled:opacity-50"
                    {...register(
                      `product_Units.${index}.unit_Of_Measurement_Id`,
                    )}
                    onChange={(e) => {
                      const sel = measurements.find(
                        (m) => m.unit_Name_Id === e.target.value,
                      );
                      if (sel)
                        setValue(
                          `product_Units.${index}.unitName`,
                          sel.unit_name,
                        );
                    }}
                    disabled={unitsLoading}
                  >
                    <option value="">Select Unit</option>
                    {measurements.map((m) => (
                      <option key={m.unit_Name_Id} value={m.unit_Name_Id}>
                        {m.unit_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-semibold">Qty per Unit</label>
                <div className="flex items-center gap-2">
                  {index === 0 ? (
                    <Input
                      type="number"
                      readOnly
                      value={1}
                      className="h-11 bg-muted/50"
                    />
                  ) : (
                    <>
                      <Input
                        type="number"
                        placeholder="Qty"
                        className="h-11"
                        {...register(`product_Units.${index}.relative_factor`)}
                      />
                      <select
                        className="h-11 rounded-md border border-input bg-transparent px-3 text-sm"
                        {...register(
                          `product_Units.${index}.secondunit_Of_Measurement_Id`,
                        )}
                      >
                        <option value="">Select unit</option>
                        {productUnitsWatch
                          .slice(0, index)
                          .map((pUnit, pIdx) => {
                            if (!pUnit.unit_Of_Measurement_Id) return null;
                            return (
                              <option
                                key={pIdx}
                                value={pUnit.unit_Of_Measurement_Id}
                              >
                                {pUnit.unitName || `Unit ${pIdx + 1}`}
                              </option>
                            );
                          })}
                      </select>
                    </>
                  )}
                </div>
              </div>
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeUnit(index)}
                  className="flex items-center gap-2 text-red-500 hover:text-red-600 h-11 px-4 font-medium"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderVariantProperties = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#EBF5FF] p-6 rounded-xl border border-[#0070E0]/20 shadow-sm flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-[#0070E0] mb-1">
            Generated Variants
          </h3>
          <p className="text-sm text-[#0070E0]/80">
            Configure pricing and barcode for each variant combination.
          </p>
        </div>
        <p className="text-3xl font-bold text-[#0070E0]">
          {variantFields.length}
        </p>
      </div>

      <div className="space-y-6">
        {variantFields.map((field, index) => {
          const varDetails = createProductvariantsWatch[index];
          const attrs = varDetails?._attr_details || [];
          const unitId = varDetails?.unit_Of_Measurement_Id;
          const unitObj = measurements.find((m) => m.unit_Name_Id === unitId);

          return (
            <div
              key={field.id}
              className="border rounded-xl p-6 space-y-6 bg-card relative shadow-sm"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-primary text-primary flex items-center justify-center font-bold text-sm">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h4 className="font-semibold text-lg">
                    {varDetails?._display_name}
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {attrs.map((attr, aIdx) => (
                  <div key={aIdx} className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">
                      {attr.attribute_name}
                    </label>
                    <Input
                      readOnly
                      value={attr.value_name}
                      className="h-11 bg-muted/30 text-muted-foreground"
                    />
                  </div>
                ))}
                {unitObj && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground">
                      Unit
                    </label>
                    <Input
                      readOnly
                      value={unitObj.unit_name}
                      className="h-11 bg-muted/30 text-muted-foreground"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2 relative">
                  <label className="text-sm font-semibold text-foreground">
                    Barcode
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="Barcode"
                      className="h-11 pr-10"
                      {...register(`createProductvariants.${index}.barcode`)}
                    />
                    <ScanBarcode className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="space-y-2 relative">
                  <label className="text-sm font-semibold text-foreground">
                    QR Code
                  </label>
                  <div className="relative">
                    <Input
                      placeholder="QR Code"
                      className="h-11 pr-10"
                      {...register(`createProductvariants.${index}.qr_Code`)}
                    />
                    <QrCode className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Cost Price
                  </label>
                  <Input
                    type="number"
                    placeholder="Cost Price"
                    className="h-11"
                    {...register(`createProductvariants.${index}.cost_Price`)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Last Purchase
                  </label>
                  <Input
                    type="number"
                    placeholder="Last Purchase"
                    className="h-11"
                    {...register(
                      `createProductvariants.${index}.last_Purchase_Price`,
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Avg Purchase
                  </label>
                  <Input
                    type="number"
                    placeholder="Avg Purchase"
                    className="h-11"
                    {...register(
                      `createProductvariants.${index}.average_Purchase_Price`,
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Wholesale
                  </label>
                  <Input
                    type="number"
                    placeholder="Wholesale"
                    className="h-11"
                    {...register(
                      `createProductvariants.${index}.wholesale_Price`,
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Consumer Price
                  </label>
                  <Input
                    type="number"
                    placeholder="Consumer Price"
                    className="h-11"
                    {...register(
                      `createProductvariants.${index}.consumer_Price`,
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Minimum Stock
                  </label>
                  <Input
                    type="number"
                    placeholder="Minimum Stock"
                    className="h-11"
                    {...register(
                      `createProductvariants.${index}.minimum_Alert_Level`,
                    )}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <form
      id="simple-product-variants-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {currentStep === 2 && renderDetails()}
      {currentStep === 3 && renderUnitsAndVariants()}
      {currentStep === 4 && renderVariantProperties()}
    </form>
  );
}
