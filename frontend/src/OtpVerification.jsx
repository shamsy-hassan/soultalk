// frontend/src/OtpVerification.jsx
// Lets user enter OTP and verify the phone number


import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BACKEND_BASE_URL } from "./config";

export default function OtpVerification({ phone, email, username, language, onVerified, onBack }) {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const messageLower = (message || "").toLowerCase();
  const messageIsError =
    messageLower.includes("error") ||
    messageLower.includes("fail") ||
    messageLower.includes("invalid") ||
    messageLower.includes("expired");

  const handleVerifyOtp = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/verify-otp`, {
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
      const res = await fetch(`${BACKEND_BASE_URL}/api/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || t('otp_resent_message'));
      } else {
        const details = data?.details ? ` (${data.details})` : "";
        setMessage(`${data.error || t('failed_to_resend_otp')}${details}`);
      }
    } catch (err) {
      setMessage(t('failed_to_resend_otp'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-soultalk-dark-gray break-words">
          {t("enter_6_digit_code", { email })}
        </h2>
        <p className="mt-1 text-sm text-soultalk-medium-gray">
          {t("otp_help", { defaultValue: "Enter the 6-digit code to continue." })}
        </p>
      </div>

      <input
        type="text"
        value={otp}
        placeholder={t('enter_otp')}
        onChange={(e) => setOtp(e.target.value)}
        maxLength={6}
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        className="w-full input-field text-center tracking-[0.35em] font-semibold"
        disabled={loading}
      />
      <button 
        onClick={handleVerifyOtp} 
        disabled={loading || otp.length !== 6} 
        className="w-full st-combo1-button"
      >
        {loading ? t('verifying') : t('verify_otp')}
      </button>
      {message && (
        <p
          className={`mt-3 break-words text-sm sm:text-base rounded-xl border px-4 py-3 ${
            messageIsError
              ? "text-red-200 border-red-500/30 bg-red-500/10"
              : "text-soultalk-dark-gray border-emerald-400/15 bg-soultalk-warm-gray/60"
          }`}
        >
          {message}
        </p>
      )}
      {(message.includes(t("invalid_or_expired_otp")) ||
        message.includes(t("failed_to_verify_otp")) ||
        messageLower.includes("invalid") ||
        messageLower.includes("expired") ||
        messageLower.includes("fail")) && (
        <button 
          onClick={handleResendOtp} 
          disabled={resending} 
          className="w-full st-combo1-outline"
        >
          {resending ? t('resending') : t('resend_otp')}
        </button>
      )}
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="w-full st-combo1-outline mt-2"
        >
          {t('back')}
        </button>
      )}
    </div>
  );
}
