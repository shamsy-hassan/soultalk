// frontend/src/VerifyFlow.jsx
// Parent component to handle the multi-step phone verification and user onboarding flow

import { useState } from "react";
import PhoneVerification from "./PhoneVerification";
import OtpVerification from "./OtpVerification";
import { useTranslation } from "react-i18next";
import { countryLanguages, countryCodes } from './countryCodes';
import ProfileSetup from "./ProfileSetup"; // Import ProfileSetup

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
  const [selectedLanguage, setSelectedLanguage] = useState(""); // For new users

  // Profile picture will be handled in a later step
  const [profilePicture, setProfilePicture] = useState(null); // File object or base64

  // Flow step management
  // "phone" | "confirm_registered" | "details" | "otp" | "profile_setup" | "done"
  const [step, setStep] = useState("phone");
  const [message, setMessage] = useState(""); // For displaying messages to the user

  // User data after successful verification
  const [verifiedUser, setVerifiedUser] = useState(null);

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
    setUserEmail(""); // Clear email for new details
    setUserUsername(""); // Clear username for new details
    setSelectedLanguage(""); // Clear language for new details
    setStep("details");
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
      const res = await fetch("/api/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone, email: email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setStep("otp");
      } else {
        setMessage(data.error || t("error_requesting_otp"));
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
          const uploadRes = await fetch("/api/upload-profile-picture", {
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
          const updateRes = await fetch("/api/update-user-profile", {
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

  // Determine available languages based on currentPhone's country code
  const currentCountryCode = getCountryCodeFromPhone(currentPhone);
  const availableLanguages = countryLanguages[currentCountryCode] || countryLanguages.default;


  return (
    <div className="max-w-md mx-auto p-6 bg-soultalk-warm-gray rounded-xl shadow-lg">
      {message && <p className={`mb-4 text-center ${message.toLowerCase().includes("error") ? "text-red-500" : "text-soultalk-medium-gray"}`}>{message}</p>}

      {step !== "phone" && <button onClick={handleBack} className="mb-4 text-soultalk-dark-gray hover:text-soultalk-coral">{t('back')}</button>}

      {step === "phone" && (
        <PhoneVerification onCheckPhoneSuccess={handleCheckPhoneSuccess} />
      )}

      {step === "confirm_registered" && (
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4 text-soultalk-dark-gray">{t('number_registered_title')}</h2>
          <p className="text-lg text-soultalk-medium-gray mb-4">{t('number_registered_message', { username: existingUsername, email: existingEmail })}</p>
          <button
            onClick={handleConfirmRegistered}
            className="w-full bg-gradient-to-r from-soultalk-gradient-start to-soultalk-gradient-end text-soultalk-white font-bold py-2 px-4 rounded-lg hover:from-soultalk-gradient-start/90 hover:to-soultalk-gradient-end/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soultalk-lavender transition-all duration-300 ease-in-out mb-2"
          >
            {t('yes_continue')}
          </button>
          <button
            onClick={handleEnterNewDetails}
            className="w-full bg-soultalk-warm-gray text-soultalk-dark-gray font-bold py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soultalk-lavender transition-all duration-300 ease-in-out"
          >
            {t('no_use_different_number')}
          </button>
        </div>
      )}

      {step === "details" && (
        // DetailsInput component will be rendered here
        // For now, inline form until component is created
        <form onSubmit={(e) => { e.preventDefault(); handleDetailsInputComplete(userEmail, userUsername, selectedLanguage); }} className="space-y-4">
          <h2 className="text-xl font-semibold mb-4 text-soultalk-dark-gray">{t('enter_your_details')}</h2>
          <input
            type="email"
            placeholder={t('email_for_otp')}
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-soultalk-lavender"
          />
          <input
            type="text"
            placeholder={t('username')}
            value={userUsername}
            onChange={(e) => setUserUsername(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-soultalk-lavender"
          />
          {/* Language selector will go here, dynamically filtered */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-soultalk-lavender"
          >
            <option value="">{t('select_language')}</option>
            {availableLanguages.map(langCode => (
              <option key={langCode} value={langCode}>{t(`language_${langCode}`)}</option>
            ))}
          </select>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-soultalk-gradient-start to-soultalk-gradient-end text-soultalk-white font-bold py-3 px-4 rounded-lg hover:from-soultalk-gradient-start/90 hover:to-soultalk-gradient-end/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soultalk-lavender transition-all duration-300 ease-in-out"
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
          <h2 className="text-2xl font-bold text-soultalk-teal mb-4">✅ {t('phone_verified_successfully')}!</h2>
          <p className="text-lg text-soultalk-dark-gray mb-6">{t('welcome_username', { username: verifiedUser?.username })}</p>
          <button
            onClick={handleStartChatting}
            className="w-full bg-gradient-to-r from-soultalk-gradient-start to-soultalk-gradient-end text-soultalk-white font-bold py-3 px-4 rounded-lg hover:from-soultalk-gradient-start/90 hover:to-soultalk-gradient-end/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soultalk-lavender transition-all duration-300 ease-in-out"
          >
            {t('start_your_journey')}
          </button>
        </div>
      )}
    </div>
  );
}