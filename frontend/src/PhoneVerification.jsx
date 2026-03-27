// frontend/src/PhoneVerification.jsx
// Lets user enter phone number and request OTP

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { countryCodes } from './countryCodes'; // Import countryCodes
import { BACKEND_BASE_URL } from "./config";

// Helper function to format phone number (now more generic)
function formatPhoneNumber(countryCode, nationalNumber) {
  // Remove any non-digit characters from the national number
  const cleanedNationalNumber = nationalNumber.replace(/\D/g, '');
  return `${countryCode}${cleanedNationalNumber}`;
}

export default function PhoneVerification({ onCheckPhoneSuccess }) { // Renamed prop
  const { t } = useTranslation();
  const [selectedCountryCode, setSelectedCountryCode] = useState("+254"); // Default to Kenya
  const [nationalNumber, setNationalNumber] = useState("");
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);
  
  useEffect(() => {
    setMessage("");
  }, []);

  const handleCheckNumber = async () => {
    setMessage("");
    setChecking(true);
    const fullPhoneNumber = formatPhoneNumber(selectedCountryCode, nationalNumber);
    
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/check-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhoneNumber }),
      });
      const data = await res.json();
      if (res.ok) {
        onCheckPhoneSuccess(fullPhoneNumber, data.registered, data.email, data.username);
      } else {
        setMessage(data.error || t('error_checking_number'));
      }
    } catch (err) {
      setMessage(t('failed_to_check_number'));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-soultalk-dark-gray">
          {t("enter_phone", { defaultValue: "Enter your phone number" })}
        </h3>
        <p className="mt-1 text-sm text-soultalk-medium-gray">
          {t("phone_help", { defaultValue: "We’ll send a one-time code to your email." })}
        </p>
      </div>

      {/* Country Code Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <select
          className="w-full sm:w-auto sm:max-w-[260px] input-field bg-white/95 py-3"
          value={selectedCountryCode}
          onChange={(e) => setSelectedCountryCode(e.target.value)}
          disabled={checking}
        >
          {countryCodes.map((country) => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.code} ({country.name})
            </option>
          ))}
        </select>
        {/* Phone Number Input */}
        <input
          type="tel" // Use type="tel" for phone numbers
          value={nationalNumber}
          placeholder={t('phone_placeholder')}
          onChange={(e) => setNationalNumber(e.target.value)}
          disabled={checking}
          inputMode="tel"
          autoComplete="tel"
          className="w-full min-w-0 flex-grow input-field bg-white/95"
        />
      </div>
      
      <button 
        onClick={handleCheckNumber} 
        disabled={checking || !nationalNumber} 
        className="w-full st-combo1-button"
      >
        {checking ? t('processing') : t('continue')}
      </button>

      {message && (
        <p
          className={`mt-2 break-words text-sm rounded-xl border px-4 py-3 ${
            message.toLowerCase().includes("error") ||
            message.toLowerCase().includes("fail")
              ? "text-red-700 border-red-200 bg-red-50 dark:text-red-200 dark:border-red-500/30 dark:bg-red-500/10"
              : "text-soultalk-dark-gray border-slate-200 bg-slate-50 dark:text-gray-200 dark:border-white/10 dark:bg-white/5"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
