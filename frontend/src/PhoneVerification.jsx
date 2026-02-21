// frontend/src/PhoneVerification.jsx
// Lets user enter phone number and request OTP

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { countryCodes } from './countryCodes'; // Import countryCodes

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
      const res = await fetch("/api/check-phone", {
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
      <div className="flex items-center space-x-2">
        <select
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-soultalk-lavender"
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
          className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-soultalk-lavender"
        />
      </div>
      
      <button 
        onClick={handleCheckNumber} 
        disabled={checking || !nationalNumber} 
        className="w-full bg-gradient-to-r from-soultalk-gradient-start to-soultalk-gradient-end text-soultalk-white font-bold py-3 px-4 rounded-lg hover:from-soultalk-gradient-start/90 hover:to-soultalk-gradient-end/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soultalk-lavender transition-all duration-300 ease-in-out"
      >
        {checking ? t('processing') : t('continue')}
      </button>

      {message && <p className={`mt-2 text-sm ${message.toLowerCase().includes("error") ? "text-red-500" : "text-soultalk-medium-gray"}`}>{message}</p>}
    </div>
  );
}