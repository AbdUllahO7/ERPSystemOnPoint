import { Box, Briefcase, Layers } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllProductAttributes } from "@/lib/api";

export default function StepItemType({ 
  itemType, 
  setItemType, 
  productType, 
  setProductType,
  hasCustomSpecs,
  setHasCustomSpecs,
  customSpecs,
  setCustomSpecs 
}) {

  const options = [
    {
      id: "product",
      label: "Product",
      description: "Stockable or non-stock physical item",
      icon: Box,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      id: "service",
      label: "Services",
      description: "Hourly, daily, monthly or fixed service",
      icon: Briefcase,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      id: "bundle",
      label: "Bundle",
      description: "Made from products & services",
      icon: Layers,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  ];

  const { data: attributesRes } = useQuery({
    queryKey: ["product-attributes"],
    queryFn: () => getAllProductAttributes({ PageNumber: 1, PageSize: 100 }),
  });
  const attributes = attributesRes?.data?.items || [];

  const handleCustomSpecChange = (spec, checked) => {
    if (checked) {
      setCustomSpecs([...customSpecs, spec]);
    } else {
      setCustomSpecs(customSpecs.filter((s) => s.attribute_id !== spec.attribute_id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((opt) => {
          const isSelected = itemType === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setItemType(opt.id)}
              className={`flex items-start gap-4 p-6 rounded-xl border text-left transition-all ${
                isSelected
                  ? "border-primary bg-[#0070E0] text-white shadow-md"
                  : "border-border hover:border-primary/50 bg-card hover:bg-muted/50"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-white" : opt.bg}`}>
                <opt.icon className={`w-6 h-6 ${isSelected ? "text-[#0070E0]" : opt.color}`} />
              </div>
              <div>
                <h3 className={`text-base font-bold ${isSelected ? "text-white" : "text-foreground"}`}>
                  {opt.label}
                </h3>
                <p className={`text-sm mt-1 ${isSelected ? "text-blue-100" : "text-muted-foreground"}`}>
                  {opt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {itemType === "product" && (
        <div className="space-y-6 max-w-xl">
          {/* Product Type */}
          <div className="space-y-3">
            <label className="text-base font-semibold text-foreground">
              Is the product simple or assembled?
            </label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="simple"
                  checked={productType === "simple"}
                  onChange={() => setProductType("simple")}
                  className="w-4 h-4 text-[#0070E0] focus:ring-[#0070E0] border-gray-300"
                />
                <span className="text-sm font-medium text-muted-foreground">
                  Simple Product
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="assembled"
                  checked={productType === "assembled"}
                  onChange={() => setProductType("assembled")}
                  className="w-4 h-4 text-[#0070E0] focus:ring-[#0070E0] border-gray-300"
                />
                <span className="text-sm font-medium text-muted-foreground">
                  Assembled Product
                </span>
              </label>
            </div>
          </div>

          {/* Has Customized Specs */}
          {productType === "simple" && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-base font-semibold text-foreground">
                Does it have customized specifications?
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="yes"
                    checked={hasCustomSpecs === "yes"}
                    onChange={() => setHasCustomSpecs("yes")}
                    className="w-4 h-4 text-[#0070E0] focus:ring-[#0070E0] border-gray-300"
                  />
                  <span className="text-sm font-medium text-muted-foreground">
                    Yes
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="no"
                    checked={hasCustomSpecs === "no"}
                    onChange={() => setHasCustomSpecs("no")}
                    className="w-4 h-4 text-[#0070E0] focus:ring-[#0070E0] border-gray-300"
                  />
                  <span className="text-sm font-medium text-muted-foreground">
                    No
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* What are the customized specs */}
          {productType === "simple" && hasCustomSpecs === "yes" && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-base font-semibold text-foreground">
                What are the customized specifications?
              </label>
              <div className="flex flex-wrap items-center gap-6">
                {attributes.map((attr) => (
                  <label key={attr.attribute_id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customSpecs.some(s => s.attribute_id === attr.attribute_id)}
                      onChange={(e) => handleCustomSpecChange(attr, e.target.checked)}
                      className="w-4 h-4 rounded text-[#0070E0] focus:ring-[#0070E0] border-gray-300"
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      {attr.attribute_name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
