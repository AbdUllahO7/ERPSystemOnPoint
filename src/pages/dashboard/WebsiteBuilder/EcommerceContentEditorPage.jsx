import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  EcommerceContentTabs,
  EcommerceHomeSectionsList,
  EcommerceManageBannerView,
  EcommerceCategoriesTableView,
  EcommerceProductListDetailView,
} from "@/components/dashboard/ecommerce-content";
import { EcommerceCategoryProductsView } from "@/components/dashboard/website-builder";
import { useEcommerceContent } from "@/features/ecommerce-content";
import { MOCK_INVENTORY_ITEMS } from "@/features/website-builder";

export function EcommerceContentEditorPage() {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const [selectedCategoryForProducts, setSelectedCategoryForProducts] = useState(null);

  const {
    activeTab,
    setActiveTab,
    activeSubView,
    setActiveSubView,
    sections,
    banners,
    categories,
    isLoading,
    isSaving,
    handleMoveSection,
    handleToggleSection,
    handleAddProductList,
    handleAddBanner,
    handleDeleteBanner,
    handleToggleCategory,
    handleSaveChanges,
  } = useEcommerceContent({ websiteId });

  // Handle section gear click to drill-down into sub-management view
  const handleOpenSectionSettings = (sectionId) => {
    if (sectionId === "banner") {
      setActiveSubView("banner");
    } else if (sectionId === "categories") {
      setActiveSubView("categories");
    } else if (sectionId.startsWith("product_lists")) {
      setActiveSubView("product_lists");
    }
  };

  const handlePreviousAction = () => {
    if (selectedCategoryForProducts) {
      setSelectedCategoryForProducts(null);
    } else if (activeSubView) {
      setActiveSubView(null);
    } else {
      navigate("/dashboard/web-service");
    }
  };

  const getSubViewTitle = () => {
    if (selectedCategoryForProducts) return `${selectedCategoryForProducts.name} Products`;
    if (activeSubView === "banner") return "Manage Banner";
    if (activeSubView === "categories") return "Categories";
    if (activeSubView === "product_lists") return "Product List Name";
    return null;
  };

  const subViewTitle = getSubViewTitle();

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="space-y-6">
        {/* Top 2 Cards: Navigation/Breadcrumb (Left) & Actions (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          {/* Left Card: Tabs or Breadcrumb */}
          <div className="lg:col-span-8 flex flex-col justify-center">
            {activeSubView ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-center space-y-0.5">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {subViewTitle}
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Home Page / <span className="text-slate-600 font-bold">{subViewTitle}</span>
                </p>
              </div>
            ) : (
              <EcommerceContentTabs
                activeTab={activeTab}
                onTabClick={(tab) => {
                  setActiveTab(tab);
                  setActiveSubView(null);
                }}
              />
            )}
          </div>

          {/* Right Card: Actions (Previous & Next / Save Changes) */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handlePreviousAction}
                disabled={isSaving}
                className="w-full sm:w-36 py-3 px-6 rounded-xl bg-slate-500 hover:bg-slate-600 text-white font-bold text-sm shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>

              {activeSubView ? (
                <button
                  type="button"
                  onClick={() => handleSaveChanges()}
                  disabled={isSaving}
                  className="w-full sm:w-auto py-3 px-8 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  Save Changes
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="w-full sm:w-36 py-3 px-6 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Views */}
        <div className="w-full">
          {/* 1. Sub-Views (when inside a section's settings) */}
          {activeSubView === "banner" && (
            <EcommerceManageBannerView
              banners={banners}
              onAddBanner={handleAddBanner}
              onDeleteBanner={handleDeleteBanner}
            />
          )}

          {activeSubView === "categories" && (
            <EcommerceCategoriesTableView
              categories={categories}
              onToggleCategory={handleToggleCategory}
            />
          )}

          {activeSubView === "product_lists" && (
            <>
              {selectedCategoryForProducts ? (
                <EcommerceCategoryProductsView
                  category={selectedCategoryForProducts}
                  items={MOCK_INVENTORY_ITEMS}
                  onToggleItemSelection={() => {}}
                  onAddAndBack={() => setSelectedCategoryForProducts(null)}
                  onPrevious={() => setSelectedCategoryForProducts(null)}
                />
              ) : (
                <EcommerceProductListDetailView
                  categories={categories}
                  onViewCategoryProducts={(cat) => setSelectedCategoryForProducts(cat)}
                />
              )}
            </>
          )}

          {/* 2. Main Tab Views */}
          {!activeSubView && activeTab === "home" && (
            <EcommerceHomeSectionsList
              sections={sections}
              onMoveSection={handleMoveSection}
              onToggleSection={handleToggleSection}
              onOpenSectionSettings={handleOpenSectionSettings}
              onAddProductList={handleAddProductList}
            />
          )}

          {!activeSubView && activeTab === "products" && (
            <EcommerceCategoriesTableView
              categories={categories}
              onToggleCategory={handleToggleCategory}
            />
          )}

          {!activeSubView && activeTab === "settings" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                E-Commerce Store General Settings
              </h3>
              <p className="text-xs text-slate-500">
                Configure payment gateways, shipping methods, and checkout preferences.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-8 pb-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-200/60 mt-8">
        <div>Copyright © ONPOINT</div>
        <div>
          Designed By <span className="font-bold text-[#0066d1]">ONPOINT</span>
        </div>
      </footer>
    </div>
  );
}

export default EcommerceContentEditorPage;
