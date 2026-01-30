// frontend/src/OtpVerification.jsx
// Lets user enter OTP and verify the phone number


import { useState } from "react";

export default function OtpVerification({ phone, email, username, language, onVerified }) {
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
      setMessage("Failed to verify OTP");
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
      setMessage(data.message || "OTP has been resent.");
    } catch (err) {
      setMessage("Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      <h2>Enter the 6-digit code sent to {email}</h2>
      <input
        type="text"
        value={otp}
        placeholder="Enter OTP"
        onChange={(e) => setOtp(e.target.value)}
        maxLength={6}
        style={{ width: "100%", padding: 8, marginBottom: 8, fontSize: 18, letterSpacing: 4, textAlign: "center" }}
        disabled={loading}
      />
      <button onClick={handleVerifyOtp} disabled={loading || otp.length !== 6} style={{ width: "100%", padding: 8 }}>
        {loading ? "Verifying..." : "Verify OTP"}
      </button>
      {message && <p style={{ color: message.toLowerCase().includes("error") || message.toLowerCase().includes("fail") || message.toLowerCase().includes("invalid") ? "red" : "green", marginTop: 12 }}>{message}</p>}
      {message.includes("Invalid or expired OTP") && (
        <button 
          onClick={handleResendOtp} 
          disabled={resending} 
          style={{ width: "100%", padding: 8, marginTop: 8, background: "transparent", border: "1px solid #ccc", color: "#555" }}
        >
          {resending ? "Resending..." : "Resend OTP"}
        </button>
      )}
    </div>
  );
}
