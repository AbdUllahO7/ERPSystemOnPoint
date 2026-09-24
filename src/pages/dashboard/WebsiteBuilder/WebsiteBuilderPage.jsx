import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  WebsiteBuilderStepper,
  WebsiteBuilderActions,
  StepWebsiteType,
  StepInfoIdentity,
  StepSectionsSettings,
  StepPublishing,
} from "@/components/dashboard/website-builder";
import { useWebsiteBuilder, WEBSITE_TYPES } from "@/features/website-builder";

export function WebsiteBuilderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  const {
    currentStep,
    websiteType,
    info,
    identity,
    sections,
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
    goToNextStep,
    goToPreviousStep,
    goToStep,
    handlePublish,
  } = useWebsiteBuilder({ websiteId: editId });

  const onPublishComplete = (result) => {
    // Navigate to preview or websites dashboard
    if (result.type === WEBSITE_TYPES.COMPANY || result.websiteType === WEBSITE_TYPES.COMPANY) {
      navigate("/profile");
    } else {
      navigate("/");
    }
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
              onStepClick={goToStep}
            />
          </div>

          {/* Action Card */}
          <div className="lg:col-span-4 flex flex-col justify-center">
            <WebsiteBuilderActions
              currentStep={currentStep}
              onPrevious={goToPreviousStep}
              onNext={goToNextStep}
              onPublish={() => handlePublish(onPublishComplete)}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>

        {/* Step Dynamic Content */}
        <div className="w-full">
          {currentStep === 1 && (
            <StepWebsiteType
              selectedType={websiteType}
              onSelectType={handleSelectWebsiteType}
            />
          )}

          {currentStep === 2 && (
            <StepInfoIdentity
              info={info}
              identity={identity}
              onUpdateInfo={handleUpdateInfo}
              onUpdateIdentity={handleUpdateIdentity}
              onUploadLogo={handleUploadLogo}
            />
          )}

          {currentStep === 3 && (
            <StepSectionsSettings
              sections={sections}
              onMoveSection={handleMoveSection}
              onToggleSection={handleToggleSection}
            />
          )}

          {currentStep === 4 && (
            <StepPublishing
              websiteType={websiteType}
              info={info}
              subdomain={subdomain}
              onSubdomainChange={setSubdomain}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-8 pb-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-200/60 mt-8">
        <div>Copyright © ONPOINT</div>
        <div>Designed By <span className="font-bold text-[#0066d1]">ONPOINT</span></div>
      </footer>
    </div>
  );
}

export default WebsiteBuilderPage;
