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
      {/* Country Code Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <select
          className="w-full sm:w-auto sm:max-w-[240px] p-2.5 border border-gray-200 rounded-lg bg-white/95 focus:outline-none focus:ring-2 focus:ring-soultalk-lavender"
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
          className="w-full min-w-0 flex-grow p-2.5 border border-gray-200 rounded-lg bg-white/95 focus:outline-none focus:ring-2 focus:ring-soultalk-lavender"
        />
      </div>
      
      <button 
        onClick={handleCheckNumber} 
        disabled={checking || !nationalNumber} 
        className="w-full bg-gradient-to-r from-soultalk-gradient-start to-soultalk-gradient-end text-soultalk-white font-bold py-3 px-4 rounded-lg hover:from-soultalk-gradient-start/90 hover:to-soultalk-gradient-end/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soultalk-lavender transition-all duration-300 ease-in-out"
      >
        {checking ? t('processing') : t('continue')}
      </button>

      {message && <p className={`mt-2 text-sm rounded-lg border px-3 py-2 ${message.toLowerCase().includes("error") ? "text-red-500 border-red-200 bg-red-50" : "text-soultalk-medium-gray border-gray-100 bg-soultalk-warm-gray/50"}`}>{message}</p>}
    </div>
  );
}
