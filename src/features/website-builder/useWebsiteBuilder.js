import { useState, useCallback } from "react";
import {
  WEBSITE_TYPES,
  DEFAULT_COMPANY_SECTIONS,
  DEFAULT_ECOMMERCE_SECTIONS,
  INITIAL_BUILDER_STATE,
} from "./website-builder.constants";
import toast from "react-hot-toast";

export function useWebsiteBuilder(initialConfig = INITIAL_BUILDER_STATE) {
  const [currentStep, setCurrentStep] = useState(1);
  const [websiteType, setWebsiteType] = useState(initialConfig.type || WEBSITE_TYPES.COMPANY);
  const [info, setInfo] = useState(initialConfig.info);
  const [identity, setIdentity] = useState(initialConfig.identity);
  const [sections, setSections] = useState(initialConfig.sections);
  const [subdomain, setSubdomain] = useState(initialConfig.subdomain);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Switch website type and update default sections
  const handleSelectWebsiteType = useCallback((type) => {
    setWebsiteType(type);
    if (type === WEBSITE_TYPES.COMPANY) {
      setSections(DEFAULT_COMPANY_SECTIONS);
    } else {
      setSections(DEFAULT_ECOMMERCE_SECTIONS);
    }
  }, []);

  // Update info fields
  const handleUpdateInfo = useCallback((field, value) => {
    setInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Auto sync subdomain if editing websiteName
    if (field === "websiteName") {
      const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
      setSubdomain(sanitized || "mysite");
    }
  }, []);

  // Update identity fields
  const handleUpdateIdentity = useCallback((field, value) => {
    setIdentity((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Move section Up or Down
  const handleMoveSection = useCallback((index, direction) => {
    setSections((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      
      const newSections = [...prev];
      const temp = newSections[index];
      newSections[index] = newSections[targetIndex];
      newSections[targetIndex] = temp;
      return newSections;
    });
  }, []);

  // Toggle section visibility
  const handleToggleSection = useCallback((id) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === id
          ? { ...sec, status: sec.status === "Apparent" ? "Hidden" : "Apparent" }
          : sec
      )
    );
  }, []);

  // Step Navigation
  const goToNextStep = useCallback(() => {
    if (currentStep === 1) {
      if (!websiteType) {
        toast.error("Please select a website type");
        return;
      }
    } else if (currentStep === 2) {
      if (!info.websiteName?.trim()) {
        toast.error("Please enter a website name");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  }, [currentStep, websiteType, info]);

  const goToPreviousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  }, []);

  // Publish
  const handlePublish = useCallback(async (onSuccess) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success("Website successfully created and published!");
      if (onSuccess) onSuccess({ websiteType, info, identity, sections, subdomain });
    } catch (error) {
      toast.error("Failed to publish website. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [websiteType, info, identity, sections, subdomain]);

  return {
    currentStep,
    websiteType,
    info,
    identity,
    sections,
    subdomain,
    isSubmitting,
    setSubdomain,
    handleSelectWebsiteType,
    handleUpdateInfo,
    handleUpdateIdentity,
    handleMoveSection,
    handleToggleSection,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    handlePublish,
  };
}

export default useWebsiteBuilder;
