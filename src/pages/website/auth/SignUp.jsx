import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Building2, ShoppingBag, Briefcase, Factory, Utensils,
  Stethoscope, Hotel, Sparkles, ShieldCheck, CheckCircle2,
  ArrowLeft, ArrowRight, Mail, Lock, Eye, EyeOff,
  Building, RefreshCw, Coins, Star,
} from "lucide-react";
import { COUNTRIES, BUSINESS_TYPES } from "@/features/auth";
import { registerTenant, verifyOtp, resendOtp, login } from "@/services/auth";

// خريطة أيقونات الأنشطة
const ICON_MAP = {
  Building2, ShoppingBag, Briefcase, Factory,
  Utensils, Stethoscope, Hotel, Sparkles,
};

// ============================================================
// كل العملات المتاحة في النظام
// ============================================================
const ALL_CURRENCIES = [
  { code: "KWD", name: "دينار كويتي",   nameEn: "Kuwaiti Dinar",   flag: "🇰🇼" },
  { code: "USD", name: "دولار أمريكي",  nameEn: "US Dollar",        flag: "🇺🇸" },
  { code: "SAR", name: "ريال سعودي",    nameEn: "Saudi Riyal",      flag: "🇸🇦" },
  { code: "AED", name: "درهم إماراتي", nameEn: "UAE Dirham",        flag: "🇦🇪" },
  { code: "EUR", name: "يورو",          nameEn: "Euro",             flag: "🇪🇺" },
  { code: "GBP", name: "جنيه إسترليني",nameEn: "British Pound",    flag: "🇬🇧" },
  { code: "QAR", name: "ريال قطري",    nameEn: "Qatari Riyal",      flag: "🇶🇦" },
  { code: "OMR", name: "ريال عُماني",  nameEn: "Omani Rial",        flag: "🇴🇲" },
  { code: "BHD", name: "دينار بحريني", nameEn: "Bahraini Dinar",    flag: "🇧🇭" },
  { code: "JOD", name: "دينار أردني",  nameEn: "Jordanian Dinar",   flag: "🇯🇴" },
];

// ============================================================
// مكوّن شريط التقدم
// ============================================================
function StepBar({ current }) {
  const labels = ["بيانات الشركة", "حساب المدير", "تأكيد البريد", "تم!"];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
          الخطوة {current} من 4
        </span>
        <span className="text-xs font-bold text-slate-700">{labels[current - 1]}</span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              s < current ? "bg-emerald-500" : s === current ? "bg-[#0066d1]" : "bg-slate-100"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// مكوّن اختيار العملات — على شكل select
// ============================================================
function CurrencySelector({ baseCurrency, selectedCurrencies, onBaseChange, onSelectedChange }) {
  const toggleSelected = (code) => {
    if (code === baseCurrency) return; // الأساسية لا تُحذف
    const next = selectedCurrencies.includes(code)
      ? selectedCurrencies.filter((c) => c !== code)
      : [...selectedCurrencies, code];
    onSelectedChange(next);
  };

  const handleBaseChange = (code) => {
    onBaseChange(code);
    // نضيفها للمحددة إذا لم تكن موجودة
    if (!selectedCurrencies.includes(code)) {
      onSelectedChange([...selectedCurrencies, code]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* العملة الأساسية — select */}
        <div className="space-y-1.5 text-right">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-end gap-1.5">
            العملة الأساسية <span className="text-rose-500">*</span>
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          </label>
          <div className="relative">
            <select
              value={baseCurrency}
              onChange={(e) => handleBaseChange(e.target.value)}
              className="w-full appearance-none text-right bg-white text-sm px-4 py-3 pr-10 rounded-xl border-2 border-amber-300 text-slate-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all cursor-pointer"
              dir="rtl"
            >
              {ALL_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} — {c.name}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500">
              <Star className="w-4 h-4 fill-amber-400" />
            </span>
          </div>
          <p className="text-[11px] text-amber-600 text-right">
            ستُستخدم هذه العملة كمرجع أساسي في جميع العمليات
          </p>
        </div>

        {/* العملات المقبولة — multi-select بكروت صغيرة */}
        <div className="space-y-1.5 text-right">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-end gap-1.5">
            العملات المقبولة
            <Coins className="w-3.5 h-3.5 text-slate-400" />
          </label>
          <div className="border-2 border-slate-200 rounded-xl bg-white p-2 space-y-1 max-h-[148px] overflow-y-auto">
            {ALL_CURRENCIES.map((c) => {
              const isSelected = selectedCurrencies.includes(c.code);
              const isBase = baseCurrency === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  disabled={isBase}
                  onClick={() => toggleSelected(c.code)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-all text-right ${
                    isBase
                      ? "bg-amber-50 cursor-not-allowed"
                      : isSelected
                      ? "bg-blue-50 hover:bg-blue-100 cursor-pointer"
                      : "hover:bg-slate-50 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isBase ? (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">أساسية</span>
                    ) : isSelected ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0066d1]" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 inline-block" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className={`text-xs font-bold ${
                      isBase ? "text-amber-700" : isSelected ? "text-[#0066d1]" : "text-slate-700"
                    }`}>
                      {c.code}
                    </span>
                    <span className="text-[11px] text-slate-400">{c.name}</span>
                    <span className="text-base">{c.flag}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-400 text-right">
            محدد: <span className="text-slate-600 font-medium">{selectedCurrencies.join(" · ")}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// الخطوة 1 — بيانات الشركة والنشاط والدولة والعملات
// ============================================================
function Step1({ form, setForm, onNext }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.companyName.trim()) {
      toast.error("يرجى إدخال اسم الشركة");
      return;
    }
    if (!form.baseCurrencyCode) {
      toast.error("يرجى اختيار العملة الأساسية");
      return;
    }
    if (!form.selectedCurrencyCodes.length) {
      toast.error("يرجى اختيار عملة واحدة على الأقل");
      return;
    }
    onNext();
  };

  // عند تغيير الدولة — نحدّث العملات بالقيم الافتراضية للدولة
  const handleCountryChange = (countryCode) => {
    const country = COUNTRIES.find((c) => c.code === countryCode);
    setForm((f) => ({
      ...f,
      country: countryCode,
      baseCurrencyCode: country.baseCurrencyCode,
      selectedCurrencyCodes: country.selectedCurrencyCodes,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* اسم الشركة والفرع */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5 text-right">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-end gap-1.5">
            اسم الشركة / المؤسسة <span className="text-rose-500">*</span>
            <Building className="w-3.5 h-3.5 text-slate-400" />
          </label>
          <input
            type="text"
            required
            placeholder="مثال: شركة الأنوار للتجارة"
            value={form.companyName}
            onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
            className="w-full text-right bg-slate-50 text-sm px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/15 transition-all"
          />
        </div>
        <div className="space-y-1.5 text-right">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-end gap-1.5">
            اسم الفرع الرئيسي
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
          </label>
          <input
            type="text"
            placeholder="الفرع الرئيسي"
            value={form.mainBranchName}
            onChange={(e) => setForm((f) => ({ ...f, mainBranchName: e.target.value }))}
            className="w-full text-right bg-slate-50 text-sm px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/15 transition-all"
          />
        </div>
      </div>

      {/* اختيار الدولة */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center justify-end gap-1.5">
          الدولة <span className="text-rose-500">*</span>
          <Coins className="w-3.5 h-3.5 text-slate-400" />
        </label>
        <div className="grid grid-cols-3 gap-3">
          {COUNTRIES.map((c) => {
            const selected = form.country === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => handleCountryChange(c.code)}
                className={`p-3.5 rounded-2xl border-2 text-right transition-all cursor-pointer flex flex-col gap-2 ${
                  selected
                    ? "border-[#0066d1] bg-blue-50 ring-2 ring-[#0066d1]/10"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{c.flag}</span>
                  {selected && <CheckCircle2 className="w-4 h-4 text-[#0066d1]" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{c.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{c.currencyName}</p>
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-400 text-right">
          اختيار الدولة يضبط العملات الافتراضية تلقائياً — يمكنك تعديلها أدناه
        </p>
      </div>

      {/* اختيار العملات */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <CurrencySelector
          baseCurrency={form.baseCurrencyCode}
          selectedCurrencies={form.selectedCurrencyCodes}
          onBaseChange={(code) =>
            setForm((f) => ({
              ...f,
              baseCurrencyCode: code,
              selectedCurrencyCodes: f.selectedCurrencyCodes.includes(code)
                ? f.selectedCurrencyCodes
                : [...f.selectedCurrencyCodes, code],
            }))
          }
          onSelectedChange={(codes) =>
            setForm((f) => ({ ...f, selectedCurrencyCodes: codes }))
          }
        />
      </div>

      {/* اختيار نوع النشاط */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center justify-end gap-1.5">
          نوع النشاط التجاري <span className="text-rose-500">*</span>
          <Sparkles className="w-3.5 h-3.5 text-slate-400" />
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto p-0.5">
          {BUSINESS_TYPES.map((b) => {
            const Icon = ICON_MAP[b.iconName] || Building2;
            const selected = form.businessType === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, businessType: b.id }))}
                className={`p-3 rounded-2xl border-2 text-right transition-all cursor-pointer flex flex-col gap-2 ${
                  selected
                    ? "border-[#0066d1] bg-blue-50 ring-2 ring-[#0066d1]/10"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      selected ? "bg-[#0066d1] text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      selected ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {b.badge}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">{b.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3.5 bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        متابعة — بيانات المدير
        <ArrowLeft className="w-4 h-4" />
      </button>
    </form>
  );
}

// ============================================================
// الخطوة 2 — حساب المدير المسؤول
// ============================================================
function Step2({ form, setForm, onNext, onBack, loading }) {
  const [showPw, setShowPw] = useState(false);

  const country = COUNTRIES.find((c) => c.code === form.country);
  const business = BUSINESS_TYPES.find((b) => b.id === form.businessType);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.adminEmail.trim()) { toast.error("أدخل بريد المدير الإلكتروني"); return; }
    if (!form.adminPassword)     { toast.error("أدخل كلمة المرور"); return; }
    if (form.adminPassword !== form.confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    await onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ملخص الخطوة 1 */}
      <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-[#0066d1] font-bold flex items-center gap-1 cursor-pointer hover:underline"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          تعديل
        </button>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-900">
            {form.companyName} — {country?.name} {country?.flag}
          </p>
          <p className="text-[11px] text-slate-500">
            {business?.title} · أساسية: {form.baseCurrencyCode} · محدد: {form.selectedCurrencyCodes.join(", ")}
          </p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0066d1] flex items-center justify-center">
          <Building2 className="w-5 h-5" />
        </div>
      </div>

      {/* البريد */}
      <div className="space-y-1.5 text-right">
        <label className="text-xs font-bold text-slate-700 flex items-center justify-end gap-1.5">
          البريد الإلكتروني للمدير <span className="text-rose-500">*</span>
          <Mail className="w-3.5 h-3.5 text-slate-400" />
        </label>
        <input
          type="email"
          required
          placeholder="admin@yourcompany.com"
          value={form.adminEmail}
          onChange={(e) => setForm((f) => ({ ...f, adminEmail: e.target.value }))}
          className="w-full text-left bg-slate-50 text-sm px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/15 transition-all"
        />
        <p className="text-[11px] text-slate-400">
          سيُرسَل رمز التحقق (OTP) إلى هذا البريد لتفعيل حسابك
        </p>
      </div>

      {/* كلمة المرور */}
      <div className="space-y-1.5 text-right">
        <label className="text-xs font-bold text-slate-700 flex items-center justify-end gap-1.5">
          كلمة المرور <span className="text-rose-500">*</span>
          <Lock className="w-3.5 h-3.5 text-slate-400" />
        </label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            required
            placeholder="Password@123!"
            value={form.adminPassword}
            onChange={(e) => setForm((f) => ({ ...f, adminPassword: e.target.value }))}
            className="w-full text-left bg-slate-50 text-sm px-4 py-3 pl-10 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/15 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* تأكيد كلمة المرور */}
      <div className="space-y-1.5 text-right">
        <label className="text-xs font-bold text-slate-700 flex items-center justify-end gap-1.5">
          تأكيد كلمة المرور <span className="text-rose-500">*</span>
          <Lock className="w-3.5 h-3.5 text-slate-400" />
        </label>
        <input
          type={showPw ? "text" : "password"}
          required
          placeholder="أعد كلمة المرور"
          value={form.confirmPassword}
          onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
          className="w-full text-left bg-slate-50 text-sm px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/15 transition-all"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="w-1/3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all cursor-pointer"
        >
          رجوع
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3.5 bg-[#0066d1] hover:bg-[#0052a8] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> جاري تسجيل الشركة...</>
          ) : (
            <>إنشاء الحساب <ArrowLeft className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </form>
  );
}

// ============================================================
// الخطوة 3 — تأكيد رمز OTP
// ============================================================
function Step3({ email, onVerify, loading }) {
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    try {
      await resendOtp({ email });
      toast.success("تم إرسال كود جديد إلى بريدك");
      setCooldown(60);
    } catch (err) {
      toast.error(err?.message || "تعذّر إرسال الكود، حاول مجدداً");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.trim().length < 4) { toast.error("أدخل رمز التحقق"); return; }
    onVerify(otp.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center space-y-3 py-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto ring-8 ring-blue-50/50">
          <ShieldCheck className="w-8 h-8 text-[#0066d1]" />
        </div>
        <div>
          <p className="text-base font-bold text-slate-900">تأكيد البريد الإلكتروني</p>
          <p className="text-xs text-slate-500 mt-1">
            أُرسل كود تحقق مكوّن من 6 أرقام إلى:{" "}
            <span className="font-bold text-slate-800 break-all">{email}</span>
          </p>
        </div>
      </div>

      <div className="max-w-xs mx-auto space-y-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="_ _ _ _ _ _"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          className="w-full text-center tracking-[0.6em] text-2xl font-extrabold py-4 bg-slate-50 rounded-2xl border-2 border-slate-200 text-slate-900 focus:outline-none focus:border-[#0066d1] focus:ring-4 focus:ring-[#0066d1]/10 transition-all"
        />
        <p className="text-[11px] text-center text-slate-400">
          (في بيئة التطوير: جرّب 123456 إذا لم يصلك البريد)
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || otp.length < 4}
        className="w-full py-3.5 bg-[#0066d1] hover:bg-[#0052a8] disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          <><RefreshCw className="w-4 h-4 animate-spin" /> جاري التحقق...</>
        ) : (
          <><CheckCircle2 className="w-4 h-4" /> تأكيد الحساب وتفعيله</>
        )}
      </button>

      <div className="text-center">
        {cooldown > 0 ? (
          <p className="text-xs text-slate-400">
            إعادة الإرسال بعد <span className="font-bold text-slate-600">{cooldown}</span> ثانية
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-xs text-[#0066d1] font-bold hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
            لم يصلك الكود؟ إعادة الإرسال
          </button>
        )}
      </div>
    </form>
  );
}

// ============================================================
// الخطوة 4 — نجاح التسجيل
// ============================================================
function Step4({ form, onGoToDashboard }) {
  const country = COUNTRIES.find((c) => c.code === form.country);
  const business = BUSINESS_TYPES.find((b) => b.id === form.businessType);

  return (
    <div className="text-center space-y-6 py-4">
      <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
      </div>

      <div>
        <h2 className="text-xl font-extrabold text-slate-900">تهانينا! 🎉 تم إنشاء شركتك بنجاح</h2>
        <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
          تم تهيئة شجرة الحسابات والعملات وإعدادات{" "}
          <span className="font-bold text-slate-800">{business?.title}</span>{" "}
          لدولة <span className="font-bold text-slate-800">{country?.name}</span> تلقائياً
        </p>
      </div>

      {/* ملخص التسجيل */}
      <div className="text-right p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-sm mx-auto space-y-2 text-xs">
        {[
          { label: "الشركة",          value: form.companyName },
          { label: "الدولة",          value: `${country?.name} ${country?.flag}` },
          { label: "النشاط",          value: business?.title },
          { label: "العملة الأساسية", value: form.baseCurrencyCode },
          { label: "العملات المقبولة",value: form.selectedCurrencyCodes.join(" · ") },
          { label: "المدير",          value: form.adminEmail },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center gap-2">
            <span className="font-bold text-slate-900">{value}</span>
            <span className="text-slate-500 shrink-0">{label}:</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onGoToDashboard}
        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        الانتقال إلى لوحة التحكم
        <ArrowLeft className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================================================
// المكوّن الرئيسي — SignUp
// ============================================================
export function SignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    mainBranchName: "الفرع الرئيسي",
    country: "kuwait",
    businessType: "general",
    // العملات — مبدئياً حسب الكويت (KWD أساسية + USD مقبولة)
    baseCurrencyCode: "KWD",
    selectedCurrencyCodes: ["KWD", "USD"],
    adminEmail: "",
    adminPassword: "",
    confirmPassword: "",
  });

  // الخطوة 1 → 2
  const handleStep1Next = () => setStep(2);

  // الخطوة 2 → POST RegisterTenant → 3
  const handleStep2Next = async () => {
    const payload = {
      companyName:    form.companyName.trim(),
      businessType:   form.businessType,
      country:        form.country,
      initializeSettings: {
        baseCurrencyCode:      form.baseCurrencyCode,
        selectedCurrencyCodes: form.selectedCurrencyCodes,
      },
      taxType:        null,
      mainBranchName: form.mainBranchName.trim() || "الفرع الرئيسي",
      adminEmail:     form.adminEmail.trim(),
      adminPassword:  form.adminPassword,
    };

    setLoading(true);
    try {
      await registerTenant(payload);
      toast.success("تم تسجيل الشركة! أدخل رمز التحقق المُرسَل لبريدك.");
      setStep(3);
    } catch (err) {
      toast.error(err?.message || "فشل التسجيل، تحقق من البيانات وحاول مجدداً");
    } finally {
      setLoading(false);
    }
  };

  // الخطوة 3 → POST VerifyOtp → (auto-login) → 4
  const handleVerify = async (otp) => {
    setLoading(true);
    try {
      await verifyOtp({
        email:   form.adminEmail.trim(),
        otp,
        purpose: "EmailConfirmation",
      });
      toast.success("تم تفعيل الحساب بنجاح!");

      // تسجيل دخول تلقائي بعد التأكيد
      try {
        await login({ email: form.adminEmail.trim(), password: form.adminPassword });
      } catch (loginErr) {
        console.warn("Auto-login after verify:", loginErr?.message);
      }

      setStep(4);
    } catch (err) {
      toast.error(err?.message || "رمز التحقق غير صحيح أو منتهي الصلاحية");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 sm:px-6 bg-[#222226]/95">
      <div className="w-full max-w-[820px] bg-white rounded-[32px] shadow-2xl p-6 sm:p-10 space-y-7 animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        {step < 4 && (
          <div className="space-y-1 text-right">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {step === 1 && "تسجيل شركة جديدة"}
              {step === 2 && "بيانات المدير المسؤول"}
              {step === 3 && "تأكيد البريد الإلكتروني"}
            </h1>
            <p className="text-xs text-slate-500">
              {step === 1 && "اختر الدولة ونوع نشاط شركتك — سيتم تهيئة شجرة الحسابات تلقائياً"}
              {step === 2 && "أدخل بيانات المدير الرئيسي الذي سيدير لوحة التحكم"}
              {step === 3 && `أرسلنا رمز تحقق إلى: ${form.adminEmail}`}
            </p>
          </div>
        )}

        {/* شريط التقدم */}
        {step < 4 && <StepBar current={step} />}

        {/* محتوى الخطوة */}
        {step === 1 && <Step1 form={form} setForm={setForm} onNext={handleStep1Next} />}
        {step === 2 && (
          <Step2
            form={form}
            setForm={setForm}
            onNext={handleStep2Next}
            onBack={() => setStep(1)}
            loading={loading}
          />
        )}
        {step === 3 && (
          <Step3
            email={form.adminEmail.trim()}
            onVerify={handleVerify}
            loading={loading}
          />
        )}
        {step === 4 && (
          <Step4
            form={form}
            onGoToDashboard={() => navigate("/dashboard")}
          />
        )}

        {/* رابط تسجيل الدخول */}
        {step < 4 && (
          <p className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            لديك حساب بالفعل؟{" "}
            <Link to="/auth/sign-in" className="text-[#0066d1] font-bold hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default SignUp;
