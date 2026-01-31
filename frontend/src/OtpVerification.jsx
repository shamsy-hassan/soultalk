// frontend/src/OtpVerification.jsx
// Lets user enter OTP and verify the phone number


import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function OtpVerification({ phone, email, username, language, onVerified }) {
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
    <div>
      <h2>{t('enter_6_digit_code', { email })}</h2>
      <input
        type="text"
        value={otp}
        placeholder={t('enter_otp')}
        onChange={(e) => setOtp(e.target.value)}
        maxLength={6}
        style={{ width: "100%", padding: 8, marginBottom: 8, fontSize: 18, letterSpacing: 4, textAlign: "center" }}
        disabled={loading}
      />
      <button onClick={handleVerifyOtp} disabled={loading || otp.length !== 6} style={{ width: "100%", padding: 8 }}>
        {loading ? t('verifying') : t('verify_otp')}
      </button>
      {message && <p style={{ color: message.toLowerCase().includes("error") || message.toLowerCase().includes("fail") || message.toLowerCase().includes("invalid") ? "red" : "green", marginTop: 12 }}>{message}</p>}
      {message.includes("Invalid or expired OTP") && (
        <button 
          onClick={handleResendOtp} 
          disabled={resending} 
          style={{ width: "100%", padding: 8, marginTop: 8, background: "transparent", border: "1px solid #ccc", color: "#555" }}
        >
          {resending ? t('resending') : t('resend_otp')}
        </button>
      )}
    </div>
  );
}
