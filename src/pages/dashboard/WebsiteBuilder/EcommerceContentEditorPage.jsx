import React, { useState, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  EcommerceContentTabs,
  EcommerceHomeSectionsList,
  EcommerceManageBannerView,
  EcommerceCategoriesTableView,
  EcommerceProductListDetailView,
  EcommerceCategoryProductsTableView,
  EcommerceManageProductsView,
  EcommerceSettingsView,
} from "@/components/dashboard/ecommerce-content";
import { useEcommerceContent } from "@/features/ecommerce-content";

// Lazy-load modal for better code splitting
const AddProductListModal = lazy(() =>
  import("@/components/dashboard/website-builder/AddProductListModal")
);

export function EcommerceContentEditorPage() {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const [isAddListModalOpen, setIsAddListModalOpen] = useState(false);

  const {
    activeTab,
    setActiveTab,
    activeSubView,
    setActiveSubView,
    selectedCategory,
    setSelectedCategory,
    sections,
    banners,
    categories,
    products,
    paymentMethods,
    selectedPaymentMethods,
    isSaving,
    handleMoveSection,
    handleToggleSection,
    handleAddProductList,
    handleAddBanner,
    handleDeleteBanner,
    handleToggleCategory,
    handleToggleCategoryAddAll,
    handleToggleProductItem,
    handleToggleAllProducts,
    handleTogglePaymentMethod,
    handleSaveChanges,
  } = useEcommerceContent({ websiteId });

  // Handle section gear click from Home Page
  const handleOpenSectionSettings = (sectionId) => {
    if (sectionId === "banner") {
      setActiveSubView("banner");
    } else if (sectionId === "categories") {
      setActiveSubView("categories");
    } else if (sectionId.startsWith("product_lists")) {
      setActiveSubView("product_lists");
    }
  };

  // Handle Previous Button Navigation
  const handlePreviousAction = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else if (activeSubView) {
      setActiveSubView(null);
    } else {
      navigate("/dashboard/web-service");
    }
  };

  // Determine dynamic breadcrumbs and titles
  const getSubViewTitle = () => {
    if (selectedCategory) {
      return selectedCategory.name || "Category Name";
    }
    if (activeSubView === "banner") return "Manage Banner";
    if (activeSubView === "categories") return "Categories";
    if (activeSubView === "product_lists") return "Product List Name";
    return null;
  };

  const getSubViewBreadcrumb = () => {
    if (selectedCategory) {
      if (activeTab === "products") {
        return (
          <>
            Manage Products /{" "}
            <span className="text-slate-600 font-bold">
              {selectedCategory.name || "Category Name"}
            </span>
          </>
        );
      }
      return (
        <>
          Home Page / Product List Name /{" "}
          <span className="text-slate-600 font-bold">
            {selectedCategory.name || "Category Name"}
          </span>
        </>
      );
    }
    if (activeSubView === "banner") {
      return (
        <>
          Home Page /{" "}
          <span className="text-slate-600 font-bold">Manage Banner</span>
        </>
      );
    }
    if (activeSubView === "categories") {
      return (
        <>
          Home Page /{" "}
          <span className="text-slate-600 font-bold">Categories</span>
        </>
      );
    }
    if (activeSubView === "product_lists") {
      return (
        <>
          Home Page /{" "}
          <span className="text-slate-600 font-bold">Product List Name</span>
        </>
      );
    }
    return null;
  };

  const isDeepView = Boolean(activeSubView || selectedCategory);
  const subViewTitle = getSubViewTitle();
  const subViewBreadcrumb = getSubViewBreadcrumb();

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="space-y-6">
        {/* Top 2 Cards: Navigation/Breadcrumb (Left) & Actions (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          {/* Left Card: Tabs or Header with Breadcrumbs */}
          <div className="lg:col-span-8 flex flex-col justify-center">
            {isDeepView ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-center space-y-0.5">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  {subViewTitle}
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  {subViewBreadcrumb}
                </p>
              </div>
            ) : (
              <EcommerceContentTabs
                activeTab={activeTab}
                onTabClick={(tab) => {
                  setActiveTab(tab);
                  setActiveSubView(null);
                  setSelectedCategory(null);
                }}
              />
            )}
          </div>

          {/* Right Card: Action Buttons */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handlePreviousAction}
                disabled={isSaving}
                className="w-full sm:w-36 py-3 px-6 rounded-xl bg-slate-500 hover:bg-slate-600 text-white font-bold text-sm shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer text-center"
              >
                Previous
              </button>

              {isDeepView ? (
                <button
                  type="button"
                  onClick={() => handleSaveChanges()}
                  disabled={isSaving}
                  className="w-full sm:w-auto py-3 px-8 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 text-center"
                >
                  Save Changes
                </button>
              ) : activeTab === "settings" ? (
                <button
                  type="button"
                  onClick={() => handleSaveChanges()}
                  disabled={isSaving}
                  className="w-full sm:w-auto py-3 px-6 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 text-center"
                >
                  Save and preview
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === "home") setActiveTab("products");
                    else if (activeTab === "products") setActiveTab("settings");
                  }}
                  className="w-full sm:w-36 py-3 px-6 rounded-xl bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer text-center"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Main Body Content */}
        <div className="w-full">
          {selectedCategory ? (
            <EcommerceCategoryProductsTableView
              categoryName={selectedCategory.name}
              items={products}
              onToggleItem={handleToggleProductItem}
              onToggleAll={handleToggleAllProducts}
              allSelected={products.length > 0 && products.every((p) => p.selected)}
            />
          ) : activeSubView === "banner" ? (
            <EcommerceManageBannerView
              banners={banners}
              onAddBanner={handleAddBanner}
              onDeleteBanner={handleDeleteBanner}
            />
          ) : activeSubView === "categories" ? (
            <EcommerceCategoriesTableView
              categories={categories}
              onToggleCategory={handleToggleCategory}
            />
          ) : activeSubView === "product_lists" ? (
            <EcommerceProductListDetailView
              categories={categories}
              onViewCategoryProducts={(cat) => setSelectedCategory(cat)}
            />
          ) : activeTab === "home" ? (
            <EcommerceHomeSectionsList
              sections={sections}
              onMoveSection={handleMoveSection}
              onToggleSection={handleToggleSection}
              onOpenSectionSettings={handleOpenSectionSettings}
              onAddProductList={() => setIsAddListModalOpen(true)}
            />
          ) : activeTab === "products" ? (
            <EcommerceManageProductsView
              categories={categories}
              onToggleAddAllForCategory={handleToggleCategoryAddAll}
              onViewCategoryProducts={(cat) => setSelectedCategory(cat)}
            />
          ) : activeTab === "settings" ? (
            <EcommerceSettingsView
              paymentMethods={paymentMethods}
              selectedPaymentMethods={selectedPaymentMethods}
              onTogglePaymentMethod={handleTogglePaymentMethod}
            />
          ) : null}
        </div>
      </div>

      {/* Add Product List Modal with Suspense */}
      {isAddListModalOpen && (
        <Suspense fallback={null}>
          <AddProductListModal
            isOpen={isAddListModalOpen}
            onClose={() => setIsAddListModalOpen(false)}
            onAdd={(listName) => {
              handleAddProductList();
            }}
          />
        </Suspense>
      )}

      {/* Page Footer */}
      <footer className="pt-8 pb-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-200/60 mt-8">
        <div>Copyright © ONPOINT</div>
        <div>
          Designed By <span className="font-bold text-[#0066d1]">ONPOINT</span>
        </div>
      </footer>
    </div>
  );
}

export default React.memo(EcommerceContentEditorPage);
