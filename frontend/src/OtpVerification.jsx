import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader, ShieldCheck, AlertTriangle } from "lucide-react";

export default function OtpVerification({ phone, email, username, language, onVerified }) {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, username, language, email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || t('verification_successful'));
        localStorage.setItem("soultalk_token", data.token);
        localStorage.setItem("soultalk_user", JSON.stringify(data.user));
        onVerified(data.user);
      } else {
        setError(data.error || data.message || t('failed_to_verify_otp'));
      }
    } catch (err) {
      setError(t('failed_to_verify_otp'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, email }),
      });
      const data = await res.json();
      setMessage(data.message || t('otp_resent_message'));
    } catch (err) {
      setError(t('failed_to_resend_otp'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-4 text-center">
      <h2 className="text-lg font-semibold text-gray-800">{t('enter_6_digit_code')}</h2>
      <p className="text-sm text-gray-600">
        {t('sent_to_email', { email })}
      </p>
      
      <input
        type="text"
        value={otp}
        placeholder="------"
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
        maxLength={6}
        className="w-full text-center text-3xl tracking-[0.5em] font-mono bg-gray-100 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500"
        disabled={loading}
      />
      
      <button 
        onClick={handleVerifyOtp} 
        disabled={loading || otp.length !== 6} 
        className="w-full flex justify-center items-center bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
      >
        {loading ? <Loader className="animate-spin w-5 h-5 mr-2" /> : <ShieldCheck className="w-5 h-5 mr-2" />}
        {t('verify_otp')}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      {message && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-green-500" />
          <p className="text-green-700 text-sm">{message}</p>
        </div>
      )}

      <div className="text-sm">
        <p className="text-gray-600">{t('did_not_receive_code')}</p>
        <button 
          onClick={handleResendOtp} 
          disabled={resending}
          className="font-medium text-purple-600 hover:text-purple-800 disabled:text-gray-400"
        >
          {resending ? t('resending') : t('resend_otp')}
        </button>
      </div>
    </div>
  );
}
