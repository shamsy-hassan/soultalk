// frontend/src/VerifyFlow.jsx
// Parent component to handle WhatsApp-style phone verification flow


import { useState } from "react";
import PhoneVerification from "./PhoneVerification";
import OtpVerification from "./OtpVerification";

// This component manages the full phone verification flow
export default function VerifyFlow({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); // Add email state
  const [username, setUsername] = useState("");
  const [language, setLanguage] = useState("");
  const [step, setStep] = useState("phone"); // "phone" | "otp" | "done"
  const [verified, setVerified] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState(null);

  // When OTP is requested (after phone check/confirmation)
  const handleOtpRequested = (enteredPhone, enteredEmail, enteredUsername, enteredLanguage) => {
    setPhone(enteredPhone);
    setEmail(enteredEmail); // Set email
    setUsername(enteredUsername);
    setLanguage(enteredLanguage);
    setStep("otp");
  };

  // When OTP is verified
  const handleVerified = (user) => {
    setVerifiedUser(user);
    setVerified(true);
    setStep("done");
    setUsername(user.username);
  };

  const handleStartChatting = () => {
    if (verifiedUser) {
      onLogin(verifiedUser);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px", background: "#fafcff" }}>
      {step === "phone" && (
        <PhoneVerification onOtpRequested={handleOtpRequested} />
      )}
      {step === "otp" && (
        <OtpVerification phone={phone} email={email} username={username} language={language} onVerified={handleVerified} />
      )}
      {step === "done" && (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h2>✅ Phone Verified Successfully!</h2>
          <p>Welcome, {username}</p>
          <button
            onClick={handleStartChatting}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 ease-in-out"
          >
            Start Your Journey
          </button>
        </div>
      )}
    </div>
  );
}
