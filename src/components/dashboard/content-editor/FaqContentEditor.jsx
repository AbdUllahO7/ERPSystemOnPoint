import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export function FaqContentEditor({ data, onChange }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const defaultQuestions = [
    { id: "faq-1", question: "What services does On Point provide?", answer: "Comprehensive digital transformation, ERP, UI/UX, and cloud solutions." },
    { id: "faq-2", question: "What services does On Point provide?", answer: "Comprehensive digital transformation, ERP, UI/UX, and cloud solutions." },
    { id: "faq-3", question: "What services does On Point provide?", answer: "Comprehensive digital transformation, ERP, UI/UX, and cloud solutions." },
    { id: "faq-4", question: "What services does On Point provide?", answer: "Comprehensive digital transformation, ERP, UI/UX, and cloud solutions." },
    { id: "faq-5", question: "What services does On Point provide?", answer: "Comprehensive digital transformation, ERP, UI/UX, and cloud solutions." },
    { id: "faq-6", question: "What services does On Point provide?", answer: "Comprehensive digital transformation, ERP, UI/UX, and cloud solutions." },
    { id: "faq-7", question: "What services does On Point provide?", answer: "Comprehensive digital transformation, ERP, UI/UX, and cloud solutions." },
    { id: "faq-8", question: "What services does On Point provide?", answer: "Comprehensive digital transformation, ERP, UI/UX, and cloud solutions." },
  ];

  const items = data.items?.length > 0 ? data.items : defaultQuestions;

  const handleAddFaq = () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }
    const newItem = {
      id: `faq-${Date.now()}`,
      question,
      answer: answer || "Detailed answer regarding our digital services.",
    };
    onChange("items", [...items, newItem]);
    setQuestion("");
    setAnswer("");
    toast.success("FAQ added successfully!");
  };

  const handleDeleteFaq = (id, e) => {
    e.stopPropagation();
    onChange(
      "items",
      items.filter((item) => item.id !== id)
    );
    toast.success("FAQ removed");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
          FAQ Section
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Enter the question and answer text
        </p>
      </div>

      {/* Inputs Form */}
      <div className="space-y-4">
        {/* Question */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800">Question</label>
          <input
            type="text"
            placeholder="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
          />
        </div>

        {/* Answer */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800">Answer</label>
          <textarea
            rows={3}
            placeholder="Answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 resize-none transition-all leading-relaxed"
          />
        </div>

        {/* Save & Add Another Centered / Wide Button */}
        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={handleAddFaq}
            className="w-full sm:w-auto min-w-[260px] py-3.5 px-8 bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Save & Add Another
          </button>
        </div>
      </div>

      {/* 2-Column Grid of FAQ Item Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-4 border-t border-slate-100">
        {items.map((item) => (
          <div
            key={item.id}
            className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-2xs hover:border-slate-300 transition-colors group"
          >
            <span className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-1">
              {item.question}
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={(e) => handleDeleteFaq(item.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FaqContentEditor;
