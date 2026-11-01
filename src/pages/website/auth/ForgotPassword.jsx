import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-hot-toast"
import { Mail, ArrowLeft, Send } from "lucide-react"
import { forgotPassword } from "@/services/auth"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return toast.error("أدخل البريد الإلكتروني")

    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
      toast.success("تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني")
    } catch (err) {
      toast.error(err?.message || "حدث خطأ، حاول مجدداً")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* الشعار */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0066d1]/20 mb-4">
            <Mail className="w-8 h-8 text-[#0066d1]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">نسيت كلمة المرور؟</h1>
          <p className="text-slate-400 text-sm">
            أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
          </p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8">
          {sent ? (
            /* حالة النجاح */
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-2">
                <Send className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">تم الإرسال!</h2>
              <p className="text-slate-400 text-sm">
                تحقق من صندوق الوارد في{" "}
                <span className="text-white font-medium">{email}</span>
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-[#0066d1] hover:text-[#0055b3] text-sm font-medium mt-4"
              >
                <ArrowLeft className="w-4 h-4" />
                العودة لتسجيل الدخول
              </Link>
            </div>
          ) : (
            /* النموذج */
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@company.com"
                    dir="ltr"
                    className="w-full pr-10 pl-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#0066d1] focus:ring-1 focus:ring-[#0066d1] transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0066d1] hover:bg-[#0055b3] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
              >
                {loading ? "جارٍ الإرسال..." : "إرسال رابط الاستعادة"}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  العودة لتسجيل الدخول
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

