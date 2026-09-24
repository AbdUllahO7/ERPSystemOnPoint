import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

export function ProfileFaq() {
  const [openFaq, setOpenFaq] = useState(1); // Second item open by default

  const faqs = [
    {
      id: 0,
      question: "What services does On Point provide?",
      answer:
        "On Point delivers end-to-end digital solutions including ERP implementation, custom software development, Branding & UI/UX design, cloud infrastructure, and strategic digital transformation for growing businesses.",
    },
    {
      id: 1,
      question: "How long does a project usually take?",
      answer:
        "The timeline depends on the project's size and requirements. After understanding your goals, we provide a clear scope, schedule, and delivery plan.",
    },
    {
      id: 2,
      question: "Can you create a customized solution for our business?",
      answer:
        "Yes, absolutely. We tailor all our digital architecture and software modules to align precisely with your internal workflows, branding, and scalability requirements.",
    },
    {
      id: 3,
      question: "Do you provide support after project delivery?",
      answer:
        "We offer comprehensive post-launch support, dedicated maintenance packages, SLA agreements, and regular software updates to guarantee continuous operational excellence.",
    },
  ];

  return (
    <section id="faq" className="py-16 md:py-24 px-4 sm:px-8 max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <span className="inline-block px-3.5 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-bold border border-amber-200/80">
          Frequently Asked Questions
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Questions? We've Got Answers
        </h2>
      </div>

      {/* Accordions */}
      <div className="space-y-3.5">
        {faqs.map((faq) => {
          const isOpen = openFaq === faq.id;
          return (
            <div
              key={faq.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                className="w-full p-5 sm:p-6 text-left font-bold text-sm sm:text-base text-slate-900 flex items-center justify-between gap-4"
              >
                <span>{faq.question}</span>
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                  {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-500 leading-relaxed border-t border-slate-100">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ProfileFaq;
