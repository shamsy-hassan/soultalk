// frontend/src/PhoneVerification.jsx
// Lets user enter phone number and request OTP

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

function formatPhoneNumber(input) {
  // Basic E.164 formatting, assumes input like 254700000000 or +254700000000
  let num = input.replace(/\D/g, "");
  if (num.startsWith("0")) num = "254" + num.slice(1);
  if (!num.startsWith("254") && num.length === 9) num = "254" + num;
  return "+" + num;
}

export default function PhoneVerification({ onOtpRequested }) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [language, setLanguage] = useState("en");
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);
  
  // 'enterPhone', 'confirmRegistered', 'enterNewDetails'
  const [flowStep, setFlowStep] = useState("enterPhone");

  useEffect(() => {
    setMessage("");
  }, []);

  const handleCheckNumber = async () => {
    setMessage("");
    setChecking(true);
    const formatted = formatPhoneNumber(phone);
    try {
      const res = await fetch("/api/check-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formatted }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.registered) {
          setEmail(data.email);
          setUsername(data.username);
          setFlowStep("confirmRegistered");
        } else {
          setFlowStep("enterNewDetails");
        }
      } else {
        setMessage(data.error || t('error_checking_number'));
      }
    } catch (err) {
      setMessage(t('failed_to_check_number'));
    } finally {
      setChecking(false);
    }
  };

  const handleRequestOtp = async () => {
    setChecking(true);
    setMessage("");
    const formattedPhone = formatPhoneNumber(phone);
    try {
      const res = await fetch("/api/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, email: email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        onOtpRequested(formattedPhone, email, username, language);
      } else {
        setMessage(data.error || t('error_requesting_otp'));
      }
    } catch (err) {
      setMessage(t('failed_to_request_otp'));
    } finally {
      setChecking(false);
    }
  };

  const handleConfirmRegistered = () => {
    handleRequestOtp();
  };
  
  const handleBackToStart = () => {
    setFlowStep("enterPhone");
    setPhone("");
    setEmail("");
    setUsername("");
    setMessage("");
  }

  const renderEnterPhone = () => (
    <>
      <h2>{t('enter_phone_number')}</h2>
      <input
        type="text"
        value={phone}
        placeholder={t('phone_placeholder')}
        onChange={(e) => setPhone(e.target.value)}
        disabled={checking}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />
      <button onClick={handleCheckNumber} disabled={checking || !phone} style={{ width: "100%", padding: 8 }}>
        {checking ? t('processing') : t('continue')}
      </button>
    </>
  );

  const renderConfirmRegistered = () => (
     <div style={{ marginTop: 16, background: "#fffbe6", padding: 12, borderRadius: 8, border: "1px solid #ffe58f" }}>
        <p style={{ color: "#ad8b00", marginBottom: 8 }}>
          {t('number_registered_message', { username, email })}
        </p>
        <button onClick={handleConfirmRegistered} disabled={checking} style={{ marginRight: 8, background: "#1890ff", color: "white", padding: "6px 16px", borderRadius: 4 }}>
          {checking? t('sending_otp') : t('yes_continue')}
        </button>
        <button onClick={handleBackToStart} style={{ background: "#f5222d", color: "white", padding: "6px 16px", borderRadius: 4 }}>
          {t('no_use_different_number')}
        </button>
        <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
          {t('sending_code_message')}
        </div>
      </div>
  );

  const renderEnterNewDetails = () => (
    <>
      <h3 style={{ marginTop: 16 }}>{t('enter_your_details')}</h3>
      <input
        type="email"
        value={email}
        placeholder={t('email_for_otp')}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />
      <input
        type="text"
        value={username}
        placeholder={t('username')}
        onChange={(e) => setUsername(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />
      <input
        type="text"
        value={language}
        placeholder={t('language_placeholder')}
        onChange={(e) => setLanguage(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />
      <button onClick={handleRequestOtp} disabled={checking || !email || !username || !language} style={{ width: "100%", padding: 8 }}>
        {checking ? t('requesting_otp') : t('request_otp')}
      </button>
       <button onClick={handleBackToStart} style={{ width: "100%", padding: 8, marginTop: 8, background: "transparent", border: "1px solid #ccc", color: "#555" }}>
          {t('back')}
        </button>
    </>
  );

  return (
    <div>
      {flowStep === "enterPhone" && renderEnterPhone()}
      {flowStep === "confirmRegistered" && renderConfirmRegistered()}
      {flowStep === "enterNewDetails" && renderEnterNewDetails()}
      {message && <p style={{ color: message.toLowerCase().includes("error") ? "red" : "#333", marginTop: 12 }}>{message}</p>}
    </div>
  );
}
