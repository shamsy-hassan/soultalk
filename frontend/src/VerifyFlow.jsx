// frontend/src/VerifyFlow.jsx
// Parent component to handle the multi-step phone verification and user onboarding flow

import { useEffect, useState } from "react";
import PhoneVerification from "./PhoneVerification";
import OtpVerification from "./OtpVerification";
import { useTranslation } from "react-i18next";
import { countryCodes } from './countryCodes';
import ProfileSetup from "./ProfileSetup"; // Import ProfileSetup
import { getLanguages } from "./api";
import i18n, { resolveUiLanguage } from "./i18n";
import { BACKEND_BASE_URL } from "./config";

const maskEmail = (email) => {
  if (!email || typeof email !== "string") return "";
  const atIndex = email.indexOf("@");
  if (atIndex === -1) return email;

  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  if (!domain) return email;

  const prefixLen = Math.min(3, local.length);
  const prefix = local.slice(0, prefixLen);
  const suffix = local.length > prefixLen ? local.slice(-1) : "";
  return `${prefix}***${suffix}@${domain}`;
};

const maskName = (name) => {
  if (!name || typeof name !== "string") return "";
  const trimmed = name.trim();
  if (!trimmed) return "";
  if (trimmed.length === 1) return `${trimmed[0]}***`;
  return `${trimmed[0]}***${trimmed[trimmed.length - 1]}`;
};

// This component manages the full phone verification and onboarding flow
export default function VerifyFlow({ onLogin }) {
  const { t } = useTranslation();
  // States to hold user data across steps
  const [currentPhone, setCurrentPhone] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [existingEmail, setExistingEmail] = useState("");
  const [existingUsername, setExistingUsername] = useState("");

  const [userEmail, setUserEmail] = useState(""); // For new or confirmed registered users
  const [userUsername, setUserUsername] = useState(""); // For new or confirmed registered users
  const [selectedLanguage, setSelectedLanguage] = useState(resolveUiLanguage(i18n.language)); // For new users

  // Profile picture will be handled in a later step
  const [profilePicture, setProfilePicture] = useState(null); // File object or base64

  // Flow step management
  // "phone" | "confirm_registered" | "details" | "otp" | "profile_setup" | "done"
  const [step, setStep] = useState("phone");
  const [message, setMessage] = useState(""); // For displaying messages to the user

  // User data after successful verification
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  // --- Step Handlers ---

  // Called by PhoneVerification after checking the phone number
  const handleCheckPhoneSuccess = (phone, registered, email, username) => {
    setCurrentPhone(phone);
    setIsRegistered(registered);
    setExistingEmail(email);
    setExistingUsername(username);

    if (registered) {
      // If registered, ask user to confirm or use different number
      setMessage(""); // Clear any previous message
      setUserEmail(email); // Pre-fill email for registered users
      setUserUsername(username); // Pre-fill username for registered users
      setStep("confirm_registered");
    } else {
      // If new, proceed to collect new details
      setMessage(""); // Clear any previous message
      setSelectedLanguage((prev) => prev || resolveUiLanguage(i18n.language));
      setStep("details");
    }
  };

  // Called when user confirms using registered number
  const handleConfirmRegistered = () => {
    // Registered user will skip details input and go straight to OTP request
    // Email and Username are already pre-filled from existing data
    handleRequestOtp(currentPhone, existingEmail);
  };

  // Called when user wants to enter new details (for new or choosing different number)
  const handleEnterNewDetails = () => {
    setMessage("");
    setCurrentPhone("");
    setIsRegistered(false);
    setExistingEmail("");
    setExistingUsername("");
    setUserEmail("");
    setUserUsername("");
    setSelectedLanguage(resolveUiLanguage(i18n.language));
    setStep("phone");
  };

  // Called by DetailsInput component after collecting email, username, language
  const handleDetailsInputComplete = (email, username, language) => {
    setUserEmail(email);
    setUserUsername(username);
    setSelectedLanguage(language);
    handleRequestOtp(currentPhone, email);
  };

  const handleRequestOtp = async (phone, email) => {
    setMessage("");
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone, email: email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setStep("otp");
      } else {
        const details = data?.details ? ` (${data.details})` : "";
        setMessage(`${data.error || t("error_requesting_otp")}${details}`);
      }
    } catch (err) {
      setMessage(t("failed_to_request_otp"));
    }
  };

  // Called by OtpVerification when OTP is verified
  const handleOtpVerified = (user) => {
    setVerifiedUser(user);
    if (!isRegistered) { // If it's a new user, proceed to profile setup
        setStep("profile_setup");
    } else { // If existing user, go straight to done
        setStep("done");
    }
  };

  // Called by ProfileSetup when profile picture is selected/cropped
  const handleProfileSetupComplete = async (croppedImageBlobUrl) => { // Expecting a blob URL from ProfileSetup
      setMessage("");
      try {
          // 1. Fetch the blob from the Blob URL
          const response = await fetch(croppedImageBlobUrl);
          const imageBlob = await response.blob();
          
          // 2. Create FormData to upload the image
          const formData = new FormData();
          formData.append("profile_picture", imageBlob, "profile.jpeg");

          // 3. Upload the image to the backend
          const uploadRes = await fetch(`${BACKEND_BASE_URL}/api/upload-profile-picture`, {
              method: "POST",
              body: formData, // No Content-Type header needed; browser sets it for FormData
          });
          const uploadData = await uploadRes.json();

          if (!uploadRes.ok) {
              setMessage(uploadData.error || "Failed to upload profile picture.");
              return;
          }

          const permanentProfilePictureUrl = uploadData.profile_picture_url;

          // 4. Update the user's profile with the permanent URL
          const updateRes = await fetch(`${BACKEND_BASE_URL}/api/update-user-profile`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  phone: currentPhone,
                  profile_picture_url: permanentProfilePictureUrl,
              }),
          });
          const updateData = await updateRes.json();

          if (!updateRes.ok) {
              setMessage(updateData.error || "Failed to save profile picture URL.");
              return;
          }

          setProfilePicture(permanentProfilePictureUrl); // Store the permanent URL
          setVerifiedUser(prevUser => ({
              ...prevUser,
              profile_picture_url: permanentProfilePictureUrl
          }));
          setMessage(updateData.message);
          setStep("done");

      } catch (err) {
          setMessage("Error during profile picture upload or update.");
      }
  };

  const handleStartChatting = () => {
    if (verifiedUser) {
      onLogin({
          ...verifiedUser,
          profile_picture_url: verifiedUser.profile_picture_url
      });
    }
  };

  const handleBack = () => {
    // Logic to go back one step
    // This will need to be refined based on the exact flow
    if (step === "confirm_registered" || step === "details") setStep("phone");
    else if (step === "otp") {
      if (isRegistered) setStep("confirm_registered");
      else setStep("details");
    } else if (step === "profile_setup") setStep("otp");
  };

  // Helper to get country code from phone number
  const getCountryCodeFromPhone = (phoneNum) => {
    if (!phoneNum) return "";

    let matchedCode = "";
    // Sort countryCodes by length in descending order to match longer codes first
    const sortedCountryCodes = [...countryCodes].sort((a, b) => b.code.length - a.code.length);

    for (const country of sortedCountryCodes) {
      if (phoneNum.startsWith(country.code)) {
        matchedCode = country.code;
        break;
      }
    }
    return matchedCode;
  };

  const currentCountryCode = getCountryCodeFromPhone(currentPhone);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const data = await getLanguages({ countryCode: currentCountryCode });
        setAvailableLanguages(data.languages || []);
      } catch (error) {
        console.error("Failed to load available languages:", error);
        setAvailableLanguages([]);
      }
    };

    loadLanguages();
  }, [currentCountryCode]);

  const stepIndex = (() => {
    switch (step) {
      case "phone":
        return 0;
      case "confirm_registered":
        return 1;
      case "details":
        return 1;
      case "otp":
        return 2;
      case "profile_setup":
        return 3;
      case "done":
        return 4;
      default:
        return 0;
    }
  })();

  const steps = [
    { id: "phone", label: t("step_phone", { defaultValue: "Phone" }) },
    { id: "details", label: t("step_details", { defaultValue: "Details" }) },
    { id: "otp", label: t("step_otp", { defaultValue: "Code" }) },
    { id: "profile", label: t("step_profile", { defaultValue: "Photo" }) },
    { id: "done", label: t("step_done", { defaultValue: "Done" }) },
  ];

  const messageLower = (message || "").toLowerCase();
  const messageIsError =
    messageLower.includes("error") ||
    messageLower.includes("fail") ||
    messageLower.includes("invalid");

  return (
    <div className="w-full space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {steps.map((s, idx) => {
            const state =
              idx < stepIndex ? "complete" : idx === stepIndex ? "current" : "upcoming";
            const dotClass =
              state === "complete"
                ? "bg-emerald-500"
                : state === "current"
                  ? "bg-soultalk-lavender"
                  : "bg-slate-200 dark:bg-white/10";
            const textClass =
              state === "current" ? "text-slate-900 dark:text-gray-100" : "text-slate-500 dark:text-gray-400";
            return (
              <div key={s.id} className="flex items-center">
                <div className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
                <span className={`ml-2 hidden sm:inline text-xs font-medium ${textClass}`}>
                  {s.label}
                </span>
                {idx !== steps.length - 1 && (
                  <div className="mx-3 h-px w-8 bg-slate-200 dark:bg-white/10 hidden sm:block" />
                )}
              </div>
            );
          })}
        </div>

        {step !== "phone" && (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center justify-center px-3 py-2 text-sm st-combo1-outline"
          >
            {t("back")}
          </button>
        )}
      </div>

      {message && (
        <p
          className={`text-center break-words text-sm sm:text-base rounded-xl border px-4 py-3 ${
            messageIsError
              ? "text-red-700 border-red-200 bg-red-50 dark:text-red-200 dark:border-red-500/30 dark:bg-red-500/10"
              : "text-slate-700 border-slate-200 bg-slate-50 dark:text-gray-200 dark:border-white/10 dark:bg-white/5"
          }`}
        >
          {message}
        </p>
      )}

      {step === "phone" && (
        <PhoneVerification onCheckPhoneSuccess={handleCheckPhoneSuccess} />
      )}

      {step === "confirm_registered" && (
        <div className="text-center space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-gray-100">
              {t("number_registered_title")}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
              {t("number_registered_subtitle", {
                defaultValue: "Continue with the account linked to this phone number.",
              })}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left dark:border-white/10 dark:bg-white/5">
            <div className="text-xs font-medium text-slate-500 dark:text-gray-400">
              {t("account_found", { defaultValue: "Account found" })}
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-gray-100 break-words">
              {t("number_registered_message", {
                username: maskName(existingUsername),
                email: maskEmail(existingEmail),
              })}
            </div>
          </div>

          <button
            onClick={handleConfirmRegistered}
            className="w-full st-combo1-button"
          >
            {t('yes_continue')}
          </button>
          <button
            onClick={handleEnterNewDetails}
            className="w-full st-combo1-outline"
          >
            {t('no_use_different_number')}
          </button>
        </div>
      )}

      {step === "details" && (
        // DetailsInput component will be rendered here
        // For now, inline form until component is created
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDetailsInputComplete(userEmail, userUsername, selectedLanguage);
          }}
          className="space-y-4"
        >
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-gray-100">{t("enter_your_details")}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">
              {t("details_help", {
                defaultValue: "We use your email to deliver a one-time code. No passwords.",
              })}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-gray-200">{t("email", { defaultValue: "Email" })}</label>
            <input
              type="email"
              placeholder={t("email_for_otp")}
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              autoComplete="email"
              required
              className="input-field bg-white/95"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-gray-200">{t("username", { defaultValue: "Username" })}</label>
            <input
              type="text"
              placeholder={t("username")}
              value={userUsername}
              onChange={(e) => setUserUsername(e.target.value)}
              autoComplete="username"
              required
              className="input-field bg-white/95"
            />
          </div>
          {/* Language selector will go here, dynamically filtered */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-gray-200">
              {t("select_language", { defaultValue: "Preferred language" })}
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              required
              className="input-field bg-white/95"
            >
              <option value="">{t("select_language")}</option>
              {availableLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {t(`language_${lang.code}`, {
                    defaultValue: lang.nativeName || lang.name || lang.code,
                  })}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full st-combo1-button"
          >
            {t('request_otp')}
          </button>
        </form>
      )}

      {step === "otp" && (
        <OtpVerification
          phone={currentPhone}
          email={userEmail}
          username={userUsername}
          language={selectedLanguage}
          onVerified={handleOtpVerified}
          onBack={handleBack}
        />
      )}

      {step === "profile_setup" && (
        <ProfileSetup onProfileSetupComplete={handleProfileSetupComplete} onBack={handleBack} />
      )}

      {step === "done" && (
        <div className="text-center mt-8">
          <h2 className="text-xl sm:text-2xl font-bold text-soultalk-lavender mb-4">✅ {t('phone_verified_successfully')}!</h2>
          <p className="text-base sm:text-lg text-soultalk-dark-gray mb-6 break-words">{t('welcome_username', { username: verifiedUser?.username })}</p>
          <button
            onClick={handleStartChatting}
            className="w-full st-combo1-button"
          >
            {t('start_your_journey')}
          </button>
        </div>
      )}
    </div>
  );
}
