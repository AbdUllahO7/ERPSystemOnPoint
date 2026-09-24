import React from "react";

export function ReturnPolicy() {
  const sections = [
    {
      id: "1",
      title: "1. Scope of This Privacy Policy",
      subtitle: "This Privacy Policy applies to personal information collected through:",
      content:
        'Payments may be processed by third-party payment service providers. These providers may collect your payment card details, bank information, digital-wallet details, billing address, and other information required to complete the transaction At ONPOINT, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how [Legal Company Name], operating as ONPOINT ("ONPOINT," "we," "us," or "our") collects, uses, shares, stores, and protects your information when you visit [Website URL], create an account, place an order, contact us, or otherwise use our services.',
    },
    {
      id: "2",
      title: "2. Information We Collect",
      subtitle: "This Privacy Policy applies to personal information collected through:",
      content:
        'Payments may be processed by third-party payment service providers. These providers may collect your payment card details, bank information, digital-wallet details, billing address, and other information required to complete the transaction At ONPOINT, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how [Legal Company Name], operating as ONPOINT ("ONPOINT," "we," "us," or "our") collects, uses, shares, stores, and protects your information when you visit [Website URL], create an account, place an order, contact us, or otherwise use our services.',
    },
    {
      id: "3",
      title: "3. How We Collect Information",
      subtitle: "This Privacy Policy applies to personal information collected through:",
      content:
        'Payments may be processed by third-party payment service providers. These providers may collect your payment card details, bank information, digital-wallet details, billing address, and other information required to complete the transaction At ONPOINT, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how [Legal Company Name], operating as ONPOINT ("ONPOINT," "we," "us," or "our") collects, uses, shares, stores, and protects your information when you visit [Website URL], create an account, place an order, contact us, or otherwise use our services.',
    },
    {
      id: "4",
      title: "4. How We Use Your Information",
      subtitle: "This Privacy Policy applies to personal information collected through:",
      content:
        'Payments may be processed by third-party payment service providers. These providers may collect your payment card details, bank information, digital-wallet details, billing address, and other information required to complete the transaction At ONPOINT, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how [Legal Company Name], operating as ONPOINT ("ONPOINT," "we," "us," or "our") collects, uses, shares, stores, and protects your information when you visit [Website URL], create an account, place an order, contact us, or otherwise use our services.',
    },
    {
      id: "5",
      title: "5. Legal Bases for Processing",
      subtitle: "This Privacy Policy applies to personal information collected through:",
      content:
        'Payments may be processed by third-party payment service providers. These providers may collect your payment card details, bank information, digital-wallet details, billing address, and other information required to complete the transaction At ONPOINT, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how [Legal Company Name], operating as ONPOINT ("ONPOINT," "we," "us," or "our") collects, uses, shares, stores, and protects your information when you visit [Website URL], create an account, place an order, contact us, or otherwise use our services.',
    },
    {
      id: "6",
      title: "6. Cookies and Similar Technologies",
      subtitle: "This Privacy Policy applies to personal information collected through:",
      content:
        'Payments may be processed by third-party payment service providers. These providers may collect your payment card details, bank information, digital-wallet details, billing address, and other information required to complete the transaction At ONPOINT, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how [Legal Company Name], operating as ONPOINT ("ONPOINT," "we," "us," or "our") collects, uses, shares, stores, and protects your information when you visit [Website URL], create an account, place an order, contact us, or otherwise use our services.',
    },
    {
      id: "7",
      title: "7. How We Share Your Information",
      subtitle: "This Privacy Policy applies to personal information collected through:",
      content:
        'Payments may be processed by third-party payment service providers. These providers may collect your payment card details, bank information, digital-wallet details, billing address, and other information required to complete the transaction At ONPOINT, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how [Legal Company Name], operating as ONPOINT ("ONPOINT," "we," "us," or "our") collects, uses, shares, stores, and protects your information when you visit [Website URL], create an account, place an order, contact us, or otherwise use our services.',
    },
    {
      id: "8",
      title: "8. International Data Transfers",
      subtitle: "This Privacy Policy applies to personal information collected through:",
      content:
        'Payments may be processed by third-party payment service providers. These providers may collect your payment card details, bank information, digital-wallet details, billing address, and other information required to complete the transaction At ONPOINT, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how [Legal Company Name], operating as ONPOINT ("ONPOINT," "we," "us," or "our") collects, uses, shares, stores, and protects your information when you visit [Website URL], create an account, place an order, contact us, or otherwise use our services.',
    },
  ];

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen py-8 md:py-12 px-4 sm:px-8 lg:px-14">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
          Return Policy
        </h1>

        {/* Policy Sections */}
        <div className="space-y-6">
          {sections.map((sec) => (
            <div key={sec.id} className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {sec.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {sec.subtitle}
              </p>
              <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                {sec.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReturnPolicy;
