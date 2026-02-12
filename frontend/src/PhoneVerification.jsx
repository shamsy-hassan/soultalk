import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, ArrowRight, CheckCircle, Loader, User, Mail, Phone } from "lucide-react";
import { checkPhone, requestOtp } from "./api"; // Import the API functions

function formatPhoneNumber(input) {
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
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [flowStep, setFlowStep] = useState("enterPhone");

  useEffect(() => {
    setMessage("");
    setError("");
  }, [flowStep]);

  const handleCheckNumber = async () => {
    setError("");
    setChecking(true);
    const formatted = formatPhoneNumber(phone);
    try {
      const data = await checkPhone(formatted);
      if (data.registered) {
        setEmail(data.email);
        setUsername(data.username);
        setFlowStep("confirmRegistered");
      } else {
        setFlowStep("enterNewDetails");
      }
    } catch (err) {
      setError(err.message || t('error_checking_number'));
    } finally {
      setChecking(false);
    }
  };

  const handleRequestOtp = async () => {
    setChecking(true);
    setError("");
    setMessage("");
    const formattedPhone = formatPhoneNumber(phone);
    try {
      const data = await requestOtp(formattedPhone, email);
      setMessage(data.message);
      onOtpRequested(formattedPhone, email, username, language);
    } catch (err) {
      setError(err.message || t('error_requesting_otp'));
    } finally {
      setChecking(false);
    }
  };

  const handleBackToStart = () => {
    setFlowStep("enterPhone");
    setPhone("");
    setEmail("");
    setUsername("");
    setError("");
    setMessage("");
  };

  const renderEnterPhone = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">{t('enter_phone_number')}</h2>
      <div className="relative">
        <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="tel"
          value={phone}
          placeholder={t('phone_placeholder')}
          onChange={(e) => setPhone(e.target.value)}
          disabled={checking}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <button 
        onClick={handleCheckNumber} 
        disabled={checking || !phone} 
        className="w-full flex justify-center items-center bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
      >
        {checking && <Loader className="animate-spin w-5 h-5 mr-2" />}
        {t('continue')}
        {!checking && <ArrowRight className="w-5 h-5 ml-2" />}
      </button>
    </div>
  );

  const renderConfirmRegistered = () => (
     <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
        <p className="text-yellow-800 mb-4">
          {t('number_registered_message', { username, email })}
        </p>
        <div className="flex space-x-2">
          <button 
            onClick={handleRequestOtp} 
            disabled={checking} 
            className="flex-1 flex justify-center items-center bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
          >
            {checking && <Loader className="animate-spin w-5 h-5 mr-2" />}
            {t('yes_continue')}
          </button>
          <button onClick={handleBackToStart} className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
            {t('no_use_different_number')}
          </button>
        </div>
      </div>
  );

  const renderEnterNewDetails = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">{t('enter_your_details')}</h3>
      <div className="relative">
        <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="email"
          value={email}
          placeholder={t('email_for_otp')}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div className="relative">
        <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={username}
          placeholder={t('username')}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
      </div>
       <div className="relative">
        <input
          type="text"
          value={language}
          placeholder={t('language_placeholder')}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <button 
        onClick={handleRequestOtp} 
        disabled={checking || !email || !username || !language} 
        className="w-full flex justify-center items-center bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
      >
        {checking && <Loader className="animate-spin w-5 h-5 mr-2" />}
        {t('request_otp')}
      </button>
       <button onClick={handleBackToStart} className="w-full bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
          {t('back')}
        </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {flowStep === "enterPhone" && renderEnterPhone()}
      {flowStep === "confirmRegistered" && renderConfirmRegistered()}
      {flowStep === "enterNewDetails" && renderEnterNewDetails()}
      
      {error && 
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      }
      {message && 
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-green-700 text-sm">{message}</p>
        </div>
      }
    </div>
  );
}
