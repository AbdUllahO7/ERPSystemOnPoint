import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    toast.success("تم تسجيل الدخول بنجاح!");
    navigate("/account");
  };

  const handleSocialLogin = (provider) => {
    toast.success(`جاري تسجيل الدخول عبر ${provider}...`);
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 bg-[#222226]/95">
      {/* Login Card */}
      <div className="w-full max-w-[430px] bg-white rounded-[32px] sm:rounded-[36px] shadow-2xl p-7 sm:p-9 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-left">
          Login
        </h1>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* E-Mail */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-900 block">E-Mail</label>
            <input
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/15 transition-all"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-slate-900 block">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:border-[#0066d1] focus:ring-2 focus:ring-[#0066d1]/15 transition-all"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-[#0066d1] hover:bg-[#0052a8] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.99]"
            >
              Login
            </button>
          </div>
        </form>

        {/* OR Divider */}
        <div className="text-center text-xs font-bold text-slate-400 tracking-wider">
          OR
        </div>

        {/* Social Buttons Row */}
        <div className="flex items-center gap-2.5">
          {/* Google Button */}
          <button
            type="button"
            onClick={() => handleSocialLogin("Google")}
            className="flex-1 py-3 px-3 bg-[#e8f1fc] hover:bg-[#d8e8fa] text-[#0066d1] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            {/* Google Colorful G */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="truncate">Sign in with Google</span>
          </button>

          {/* Facebook Button */}
          <button
            type="button"
            onClick={() => handleSocialLogin("Facebook")}
            className="w-11 h-11 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#1877f2] flex items-center justify-center transition-colors shrink-0"
            aria-label="Sign in with Facebook"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>

          {/* Apple Button */}
          <button
            type="button"
            onClick={() => handleSocialLogin("Apple")}
            className="w-11 h-11 rounded-xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-black flex items-center justify-center transition-colors shrink-0"
            aria-label="Sign in with Apple"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.64-.78 1.08-1.86.96-2.95-1 .04-2.18.67-2.84 1.45-.58.67-1.1 1.77-.96 2.83 1.12.09 2.2-.55 2.84-1.33z" />
            </svg>
          </button>
        </div>

        {/* Link to Sign Up */}
        <div className="pt-2 text-center text-xs text-slate-500">
          Don't have an account?{" "}
          <Link to="/auth/sign-up" className="text-[#0066d1] font-bold hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
