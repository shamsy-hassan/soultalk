// frontend/src/VerifyFlow.jsx
// Parent component to handle WhatsApp-style phone verification flow


import { useState } from "react";
import PhoneVerification from "./PhoneVerification";
import OtpVerification from "./OtpVerification";
import { CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

// This component manages the full phone verification flow
export default function VerifyFlow({ onLogin }) {
  const { t } = useTranslation();
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
    <div className="w-full max-w-md mx-auto">
      {step === "phone" && (
        <PhoneVerification onOtpRequested={handleOtpRequested} />
      )}
      {step === "otp" && (
        <OtpVerification phone={phone} email={email} username={username} language={language} onVerified={handleVerified} />
      )}
      {step === "done" && (
        <div className="text-center p-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('phone_verified_successfully')}</h2>
          <p className="text-gray-600 mb-6">{t('welcome')}, {username}</p>
          <button
            onClick={handleStartChatting}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 ease-in-out"
          >
            {t('start_your_journey')}
          </button>
        </div>
      )}
    </div>
  );
}
