import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  WebsiteBuilderStepper,
  WebsiteBuilderActions,
  StepWebsiteType,
  StepInfoIdentity,
  StepSectionsSettings,
  StepEcommerceProducts,
  EcommerceCategoryProductsView,
  StepPublishing,
  PublishSuccessModal,
  AddProductListModal,
} from "@/components/dashboard/website-builder";
import { useWebsiteBuilder, WEBSITE_TYPES } from "@/features/website-builder";

export function WebsiteBuilderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const typeParam = searchParams.get("type");
  const initialType =
    typeParam === "ecommerce"
      ? WEBSITE_TYPES.ECOMMERCE
      : typeParam === "company"
        ? WEBSITE_TYPES.COMPANY
        : null;

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isAddListModalOpen, setIsAddListModalOpen] = useState(false);
  const [publishedResult, setPublishedResult] = useState(null);

  const {
    currentStep,
    totalSteps,
    websiteType,
    info,
    identity,
    sections,
    paymentMethods,
    categories,
    selectedCategoryForProducts,
    setSelectedCategoryForProducts,
    inventoryItems,
    subdomain,
    isLoading,
    isSubmitting,
    setSubdomain,
    handleSelectWebsiteType,
    handleUpdateInfo,
    handleUpdateIdentity,
    handleUploadLogo,
    handleMoveSection,
    handleToggleSection,
    handleTogglePaymentMethod,
    handleToggleCategoryAll,
    handleToggleItemSelection,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    handlePublish,
  } = useWebsiteBuilder({ websiteId: editId, initialType });

  const isEcommerce = websiteType === WEBSITE_TYPES.ECOMMERCE;

  const onPublishComplete = (result) => {
    setPublishedResult(result);
    setIsSuccessModalOpen(true);
  };

  const handleProceedToContent = () => {
    setIsSuccessModalOpen(false);
    const targetId = publishedResult?.id || editId || (isEcommerce ? "site-2" : "site-1");
    if (isEcommerce) {
      navigate(`/dashboard/web-service/ecommerce-content/${targetId}`);
    } else {
      navigate(`/dashboard/web-service/content/${targetId}`);
    }
  };

  const handleAddListFromModal = (listName) => {
    goToNextStep();
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex flex-col justify-between p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="space-y-6">
        {/* Top 2 Cards: Stepper (Left) & Actions (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          {/* Stepper Card */}
          <div className="lg:col-span-8 flex flex-col justify-center">
            <WebsiteBuilderStepper
              currentStep={currentStep}
              websiteType={websiteType}
              onStepClick={goToStep}
            />
          </div>

          {/* Action Card */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <WebsiteBuilderActions
              currentStep={currentStep}
              totalSteps={totalSteps}
              isCategoryProductView={Boolean(selectedCategoryForProducts)}
              isEditMode={Boolean(editId)}
              onPrevious={goToPreviousStep}
              onNext={goToNextStep}
              onPublish={() => handlePublish(onPublishComplete)}
              onAddAndBack={() => setSelectedCategoryForProducts(null)}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>

        {/* Step Dynamic Content */}
        <div className="w-full">
          {/* Step 1: Website Type */}
          {currentStep === 1 && (
            <StepWebsiteType
              selectedType={websiteType}
              onSelectType={handleSelectWebsiteType}
            />
          )}

          {/* Step 2: Info & Identity */}
          {currentStep === 2 && (
            <StepInfoIdentity
              info={info}
              identity={identity}
              websiteType={websiteType}
              onUpdateInfo={handleUpdateInfo}
              onUpdateIdentity={handleUpdateIdentity}
              onUploadLogo={handleUploadLogo}
            />
          )}

          {/* Step 3: Sections & Settings (Company) / Home Page & Settings (E-Commerce) */}
          {currentStep === 3 && (
            <StepSectionsSettings
              websiteType={websiteType}
              sections={sections}
              paymentMethods={paymentMethods}
              onMoveSection={handleMoveSection}
              onToggleSection={handleToggleSection}
              onTogglePaymentMethod={handleTogglePaymentMethod}
              onAddProductList={() => setIsAddListModalOpen(true)}
            />
          )}

          {/* Step 4 for E-Commerce: Products (Category Selection or Products Table) */}
          {isEcommerce && currentStep === 4 && (
            <>
              {selectedCategoryForProducts ? (
                <EcommerceCategoryProductsView
                  category={selectedCategoryForProducts}
                  items={inventoryItems}
                  onToggleItemSelection={handleToggleItemSelection}
                  onAddAndBack={() => setSelectedCategoryForProducts(null)}
                  onPrevious={() => setSelectedCategoryForProducts(null)}
                />
              ) : (
                <StepEcommerceProducts
                  categories={categories}
                  onToggleCategoryAll={handleToggleCategoryAll}
                  onViewCategoryProducts={(cat) => setSelectedCategoryForProducts(cat)}
                />
              )}
            </>
          )}

          {/* Publishing Step: Step 4 for Company, Step 5 for E-Commerce */}
          {((!isEcommerce && currentStep === 4) || (isEcommerce && currentStep === 5)) && (
            <StepPublishing
              websiteType={websiteType}
              info={info}
              subdomain={subdomain}
              onSubdomainChange={setSubdomain}
            />
          )}
        </div>
      </div>

      {/* Modals (1:1 with Figma Images) */}
      {/* 1. Congratulations Modal */}
      <PublishSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onProceed={handleProceedToContent}
        websiteUrl={`www.${subdomain || (isEcommerce ? "store" : "onpoint")}.onpoint.com`}
        isEcommerce={isEcommerce}
      />

      {/* 2. Add List Modal */}
      <AddProductListModal
        isOpen={isAddListModalOpen}
        onClose={() => setIsAddListModalOpen(false)}
        onAdd={handleAddListFromModal}
      />

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

export default WebsiteBuilderPage;
