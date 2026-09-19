import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/lib/api";
import StepItemType from "./_components/step-item-type";
import StepDetails from "./_components/step-details";
import StepUnitsPrices from "./_components/step-units-prices";
import StepVariantProperties from "./_components/step-variant-properties";
import StepBundleComponents from "./_components/step-bundle-components";
import ServiceForm from "./_components/ServiceForm";
import BundleForm from "./_components/BundleForm";
import AssembledProductForm from "./_components/AssembledProductForm";
import SimpleProductForm from "./_components/SimpleProductForm";
import SimpleProductWithVariantsForm from "./_components/SimpleProductWithVariantsForm";

export default function AddItemPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [currentStep, setCurrentStep] = useState(1);
  
  const [itemType, setItemType] = useState("product");
  const [productType, setProductType] = useState("simple");
  const [hasCustomSpecs, setHasCustomSpecs] = useState("no");
  const [customSpecs, setCustomSpecs] = useState([]);
  const [thereAreUnits, setThereAreUnits] = useState(true);

  const { data: productRes } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && productRes?.data) {
      const pData = productRes.data;
      if (pData.product_Type === "Service") {
        setItemType("service");
      } else if (pData.product_Type === "Bundle") {
        setItemType("bundle");
      } else if (pData.product_Type === "Assembly") {
        setItemType("product");
        setProductType("assembled");
      } else {
        setItemType("product");
        setProductType("simple");
        if (pData.has_Specifications) {
          setHasCustomSpecs("yes");
          // Extract unique attributes from variants
          const attrMap = {};
          pData.variants?.forEach((v) => {
            v.variantValues?.forEach((val) => {
              if (!attrMap[val.product_Attribute_Id]) {
                attrMap[val.product_Attribute_Id] = {
                  attribute_id: val.product_Attribute_Id,
                  attribute_name: val.attribute_Name,
                };
              }
            });
          });
          setCustomSpecs(Object.values(attrMap));
        } else {
          setHasCustomSpecs("no");
        }
      }
    }
  }, [isEdit, productRes]);

  const methods = useForm({
    defaultValues: {
      itemType: "product",
      productType: "simple",
      hasCustomSpecs: "no",
      customSpecs: [],
      units: [
        { unitName: "", qtyPerUnit: "", baseUnit: "" }
      ],
      variants: [
        { values: [{ value: "" }] }
      ],
      variantProperties: [
        { unitName: "", barcode: "", qrCode: "", costPrice: "", lastPurchase: "", avgPurchase: "", wholesale: "", consumerPrice: "" }
      ],
    },
  });

  useEffect(() => {
    methods.setValue("itemType", itemType);
    methods.setValue("productType", productType);
    methods.setValue("hasCustomSpecs", hasCustomSpecs);
    methods.setValue("customSpecs", customSpecs);
  }, [itemType, productType, hasCustomSpecs, customSpecs, methods]);

  const onSubmitProductOrBundle = (data) => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      console.log(`Submit ${itemType}:`, data);
      navigate("/dashboard/inventory/items-management/items");
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleNextStepOne = () => {
    setCurrentStep(2);
  };

  const handleNextFromChild = () => {
    setCurrentStep((prev) => prev + 1);
  };

  let steps = [
    { id: 1, label: "Item Type" },
    { id: 2, label: "Details" },
  ];

  if (itemType === "product") {
    if (productType === "assembled") {
      if (thereAreUnits) {
        steps.push({ id: 3, label: "Units" });
        steps.push({ id: 4, label: "Bundle Components" });
        steps.push({ id: 5, label: "Variant Properties" });
      } else {
        steps.push({ id: 3, label: "Bundle Components" });
      }
    } else {
      if (hasCustomSpecs === "yes") {
        steps.push({ id: 3, label: "Units & Variants" });
        steps.push({ id: 4, label: "Variant Properties" });
      } else {
        if (thereAreUnits) {
          steps.push({ id: 3, label: "Units" });
          steps.push({ id: 4, label: "Variant Properties" });
        }
      }
    }
  } else if (itemType === "bundle") {
    steps.push({ id: 3, label: "Bundle Components" });
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold text-foreground">{isEdit ? "Edit Item" : "Add Item"}</h2>
        <Info className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 mb-6">
        <span className="cursor-pointer hover:text-primary" onClick={() => navigate("/dashboard/inventory/items-management/items")}>Items</span>
        <span>/</span>
        <span className="font-medium text-foreground">{isEdit ? "Edit Item" : "Add Item"}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stepper Card */}
        <div className="lg:col-span-3 bg-card text-card-foreground p-6 rounded-xl border shadow-sm flex items-center justify-center">
          <div className="flex items-center w-full max-w-2xl">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none relative">
                  <div className="flex flex-col items-center gap-2 relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                        isActive
                          ? "border-primary text-primary bg-primary/10"
                          : isCompleted
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30 text-muted-foreground"
                      }`}
                    >
                      {String(step.id).padStart(2, '0')}
                    </div>
                    <span
                      className={`text-sm absolute top-12 whitespace-nowrap font-medium ${
                        isActive || isCompleted ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 transition-colors ${
                        isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm flex items-center justify-center">
          <div className="flex w-full gap-2">
            {currentStep > 1 && (
              <Button type="button" onClick={handlePrev} variant="outline" className="flex-1 h-12 text-base">
                Back
              </Button>
            )}
            
            {currentStep === 1 ? (
              <Button type="button" onClick={handleNextStepOne} className="flex-1 h-12 text-base">
                Next
              </Button>
            ) : itemType === "service" ? (
              <Button type="submit" form="service-form" className="flex-1 h-12 text-base">
                Finish & Add
              </Button>
            ) : itemType === "bundle" ? (
              <Button type="submit" form="bundle-form" className="flex-1 h-12 text-base">
                {currentStep === steps.length ? "Finish & Add" : "Next"}
              </Button>
            ) : itemType === "product" && productType === "assembled" ? (
              <Button type="submit" form="assembled-product-form" className="flex-1 h-12 text-base">
                {currentStep === steps.length ? "Finish & Add" : "Next"}
              </Button>
            ) : itemType === "product" && productType === "simple" && hasCustomSpecs === "no" ? (
              <Button type="submit" form="simple-product-form" className="flex-1 h-12 text-base">
                {currentStep === steps.length ? "Finish & Add" : "Next"}
              </Button>
            ) : itemType === "product" && productType === "simple" && hasCustomSpecs === "yes" ? (
              <Button type="submit" form="simple-product-variants-form" className="flex-1 h-12 text-base">
                {currentStep === steps.length ? "Finish & Add" : "Next"}
              </Button>
            ) : (
              <Button type="submit" form="product-bundle-form" className="flex-1 h-12 text-base">
                {currentStep === steps.length ? "Finish & Add" : "Next"}
              </Button>
            )}
          </div>
        </div>

        {/* Step Content */}
        <div className="lg:col-span-4 mt-6">
          {currentStep === 1 && (
            <StepItemType 
              itemType={itemType}
              setItemType={setItemType}
              productType={productType}
              setProductType={setProductType}
              hasCustomSpecs={hasCustomSpecs}
              setHasCustomSpecs={setHasCustomSpecs}
              customSpecs={customSpecs}
              setCustomSpecs={setCustomSpecs}
            />
          )}

          {currentStep === 2 && itemType === "service" && (
            <ServiceForm />
          )}

          {currentStep > 1 && itemType === "bundle" && (
            <BundleForm currentStep={currentStep} onNext={handleNextFromChild} />
          )}

          {currentStep > 1 && itemType === "product" && productType === "assembled" && (
            <AssembledProductForm 
              currentStep={currentStep} 
              onNext={handleNextFromChild} 
              thereAreUnits={thereAreUnits}
              setThereAreUnits={setThereAreUnits}
            />
          )}

          {currentStep > 1 && itemType === "product" && productType === "simple" && hasCustomSpecs === "no" && (
            <SimpleProductForm 
              currentStep={currentStep} 
              onNext={handleNextFromChild} 
              thereAreUnits={thereAreUnits}
              setThereAreUnits={setThereAreUnits}
            />
          )}

          {currentStep > 1 && itemType === "product" && productType === "simple" && hasCustomSpecs === "yes" && (
            <SimpleProductWithVariantsForm 
              currentStep={currentStep} 
              onNext={handleNextFromChild} 
              thereAreUnits={thereAreUnits}
              setThereAreUnits={setThereAreUnits}
              customSpecs={customSpecs}
            />
          )}
        </div>
      </div>
    </div>
  );
}
