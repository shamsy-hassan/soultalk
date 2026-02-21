// frontend/src/OtpVerification.jsx
// Lets user enter OTP and verify the phone number


import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function OtpVerification({ phone, email, username, language, onVerified, onBack }) {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerifyOtp = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, username, language, email }),
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      if (res.ok) {
        localStorage.setItem("soultalk_token", data.token);
        localStorage.setItem("soultalk_user", JSON.stringify(data.user));
        onVerified(data.user);
      }
    } catch (err) {
      setMessage(t('failed_to_verify_otp'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
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
      setMessage(t('failed_to_resend_otp'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2>{t('enter_6_digit_code', { email })}</h2>
      <input
        type="text"
        value={otp}
        placeholder={t('enter_otp')}
        onChange={(e) => setOtp(e.target.value)}
        maxLength={6}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-soultalk-lavender text-center tracking-widest"
        disabled={loading}
      />
      <button 
        onClick={handleVerifyOtp} 
        disabled={loading || otp.length !== 6} 
        className="w-full bg-gradient-to-r from-soultalk-gradient-start to-soultalk-gradient-end text-soultalk-white font-bold py-3 px-4 rounded-lg hover:from-soultalk-gradient-start/90 hover:to-soultalk-gradient-end/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soultalk-lavender transition-all duration-300 ease-in-out"
      >
        {loading ? t('verifying') : t('verify_otp')}
      </button>
      {message && <p style={{ color: message.toLowerCase().includes("error") || message.toLowerCase().includes("fail") || message.toLowerCase().includes("invalid") ? "red" : "green", marginTop: 12 }}>{message}</p>}
      {(message.includes(t("invalid_or_expired_otp")) || message.includes(t("failed_to_verify_otp"))) && (
        <button 
          onClick={handleResendOtp} 
          disabled={resending} 
          className="w-full bg-soultalk-warm-gray text-soultalk-dark-gray font-bold py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soultalk-lavender transition-all duration-300 ease-in-out"
        >
          {resending ? t('resending') : t('resend_otp')}
        </button>
      )}
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="w-full bg-transparent border border-gray-300 text-soultalk-medium-gray font-bold py-2 px-4 rounded-lg hover:bg-soultalk-warm-gray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soultalk-lavender transition-all duration-300 ease-in-out mt-2"
        >
          {t('back')}
        </button>
      )}
    </div>
  );
}