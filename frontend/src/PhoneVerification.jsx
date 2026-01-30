// frontend/src/PhoneVerification.jsx
// Lets user enter phone number and request OTP

import { useState, useEffect } from "react";

function formatPhoneNumber(input) {
  // Basic E.164 formatting, assumes input like 254700000000 or +254700000000
  let num = input.replace(/\D/g, "");
  if (num.startsWith("0")) num = "254" + num.slice(1);
  if (!num.startsWith("254") && num.length === 9) num = "254" + num;
  return "+" + num;
}

export default function PhoneVerification({ onOtpRequested }) {
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
        setMessage(data.error || "Error checking number");
      }
    } catch (err) {
      setMessage("Failed to check number");
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
        setMessage(data.error || "Error requesting OTP");
      }
    } catch (err) {
      setMessage("Failed to request OTP");
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
      <h2>Enter Phone Number</h2>
      <input
        type="text"
        value={phone}
        placeholder="e.g. +254700000000"
        onChange={(e) => setPhone(e.target.value)}
        disabled={checking}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />
      <button onClick={handleCheckNumber} disabled={checking || !phone} style={{ width: "100%", padding: 8 }}>
        {checking ? "Processing..." : "Continue"}
      </button>
    </>
  );

  const renderConfirmRegistered = () => (
     <div style={{ marginTop: 16, background: "#fffbe6", padding: 12, borderRadius: 8, border: "1px solid #ffe58f" }}>
        <p style={{ color: "#ad8b00", marginBottom: 8 }}>
          This number is already registered to <strong>{username}</strong>. An OTP will be sent to <strong>{email}</strong>.
        </p>
        <button onClick={handleConfirmRegistered} disabled={checking} style={{ marginRight: 8, background: "#1890ff", color: "white", padding: "6px 16px", borderRadius: 4 }}>
          {checking? "Sending OTP..." : "Yes, continue"}
        </button>
        <button onClick={handleBackToStart} style={{ background: "#f5222d", color: "white", padding: "6px 16px", borderRadius: 4 }}>
          No, use different number
        </button>
        <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
          We are sending a code to verify it's really you.
        </div>
      </div>
  );

  const renderEnterNewDetails = () => (
    <>
      <h3 style={{ marginTop: 16 }}>Enter Your Details</h3>
      <input
        type="email"
        value={email}
        placeholder="Email for OTP"
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />
      <input
        type="text"
        value={username}
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />
      <input
        type="text"
        value={language}
        placeholder="Language (e.g. en, sw, am)"
        onChange={(e) => setLanguage(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 8 }}
      />
      <button onClick={handleRequestOtp} disabled={checking || !email || !username || !language} style={{ width: "100%", padding: 8 }}>
        {checking ? "Requesting OTP..." : "Request OTP"}
      </button>
       <button onClick={handleBackToStart} style={{ width: "100%", padding: 8, marginTop: 8, background: "transparent", border: "1px solid #ccc", color: "#555" }}>
          Back
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
