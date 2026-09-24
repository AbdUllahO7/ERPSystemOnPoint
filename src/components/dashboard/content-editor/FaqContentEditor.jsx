import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export function FaqContentEditor({ data, onChange }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

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
    onChange("items", [...(data.items || []), newItem]);
    setQuestion("");
    setAnswer("");
    toast.success("FAQ added successfully!");
  };

  const handleDeleteFaq = (id) => {
    onChange(
      "items",
      data.items.filter((item) => item.id !== id)
    );
    toast.success("FAQ removed");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
          Frequently Asked Questions (FAQ)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Enter questions and answers to show in the accordion
        </p>
      </div>

      {/* Input form */}
      <div className="space-y-4 p-5 rounded-2xl border border-slate-200 bg-slate-50/40">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800">Question</label>
          <input
            type="text"
            placeholder="e.g. What services does On Point provide?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full bg-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800">Answer</label>
          <textarea
            rows={3}
            placeholder="Enter the answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full bg-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/10 resize-none transition-all"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleAddFaq}
            className="px-6 py-2.5 bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            Save & Add Another
          </button>
        </div>
      </div>

      {/* List of FAQs */}
      <div className="space-y-3 pt-2">
        {data.items?.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl border border-slate-200 bg-white flex items-start justify-between gap-4 shadow-2xs"
          >
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                {item.question}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {item.answer}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleDeleteFaq(item.id)}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
              title="Delete FAQ"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FaqContentEditor;
