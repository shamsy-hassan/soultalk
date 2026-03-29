// frontend/src/ProfileSetup.jsx
import React, { useState, useCallback, useRef } from 'react';
import ReactCrop, {
  centerCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useTranslation } from 'react-i18next';
import { Camera, ShieldCheck, Sparkles, Image as ImageIcon, Info } from 'lucide-react';

// Helper function to get a cropped image from the canvas
function getCroppedImg(image, crop, fileName) {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  // As a blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        //reject(new Error('Canvas is empty'));
        console.error('Canvas is empty');
        return;
      }
      blob.name = fileName;
      resolve(URL.createObjectURL(blob));
    }, 'image/jpeg', 0.8);
  });
}

// Function to center the crop
function centerAspectCrop(
  mediaWidth,
  mediaHeight,
  aspect
) {
  const crop = centerCrop(
    {
      unit: '%',
      width: 90,
    },
    mediaWidth,
    mediaHeight,
    aspect
  );
  return crop;
}


export default function ProfileSetup({ user, onProfileSetupComplete, onBack, errorMessage = '' }) {
  const { t } = useTranslation();
  const imgRef = useRef(null);
  const [upImg, setUpImg] = useState(); // Holds the original image selected by user
  const [crop, setCrop] = useState(); // Holds the crop dimensions
  const [completedCrop, setCompletedCrop] = useState(); // Holds the completed crop to draw
  const [bio, setBio] = useState(() => (user?.bio || ''));

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop react to the new image
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setUpImg(reader.result?.toString() || ''),
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = useCallback((e) => {
    imgRef.current = e.currentTarget;
    setCrop(centerAspectCrop(e.currentTarget.width, e.currentTarget.height, 1)); // Aspect ratio 1:1 for profile picture
  }, []);

  const onCropComplete = useCallback((crop) => {
    setCompletedCrop(crop);
  }, []);

  const onSaveProfile = async () => {
    const bioPayload = typeof bio === 'string' ? bio : '';
    if (completedCrop?.width && completedCrop?.height && imgRef.current) {
      const croppedImageBlobUrl = await getCroppedImg(
        imgRef.current,
        completedCrop,
        'newProfilePicture.jpeg'
      );
      onProfileSetupComplete({ croppedImageUrl: croppedImageBlobUrl, bio: bioPayload });
      return;
    }
    onProfileSetupComplete({ bio: bioPayload });
  };

  const initialBio = (user?.bio || '').trim();
  const bioChanged = bio.trim() !== initialBio;
  const canSave = Boolean(completedCrop) || bioChanged;

  return (
    <div className="w-full max-w-xl mx-auto p-4 md:p-6">
      <div className="space-y-4">
        <div className="hero-panel p-5 md:p-6">
          <div className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full bg-soultalk-lavender/20 blur-2xl" />
          <div className="pointer-events-none absolute -left-10 -bottom-14 h-32 w-32 rounded-full bg-soultalk-coral/15 blur-2xl" />
          <div className="text-center relative">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-950/35 border border-gray-800/60">
              <Camera className="h-6 w-6 text-soultalk-lavender" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-soultalk-dark-gray">
              {t('setup_profile_picture')}
            </h2>
            <p className="text-sm text-soultalk-medium-gray mt-2">
              {t('profile_setup_subtitle', { defaultValue: 'Pick a photo and adjust the crop. You can change it later anytime.' })}
            </p>
          </div>

          {errorMessage && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 text-center">
              {errorMessage}
            </div>
          )}

          <div className="mt-5 space-y-3">
            <label
              htmlFor="profile-image-upload"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-soultalk-warm-gray text-soultalk-dark-gray border border-emerald-400/15 font-semibold cursor-pointer hover:bg-emerald-500/10 transition-colors"
            >
              <ImageIcon className="w-5 h-5 text-soultalk-lavender" />
              {upImg ? t('change_photo', { defaultValue: 'Change photo' }) : t('choose_photo', { defaultValue: 'Choose photo' })}
            </label>
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              onChange={onSelectFile}
              className="hidden"
            />

            <div className="rounded-xl bg-soultalk-warm-gray/35 border border-emerald-400/15 p-4 text-sm text-soultalk-medium-gray">
              <p className="font-semibold text-soultalk-dark-gray inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-soultalk-lavender" />
                {t('profile_setup_tips_title', { defaultValue: 'Photo tips' })}
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>{t('profile_setup_tip_1', { defaultValue: 'Use a clear face photo with good lighting.' })}</li>
                <li>{t('profile_setup_tip_2', { defaultValue: 'Center your face in the circle.' })}</li>
                <li>{t('profile_setup_tip_3', { defaultValue: 'Avoid screenshots with tiny faces.' })}</li>
              </ul>
            </div>
          </div>

          <label className="block mt-5 text-sm text-soultalk-dark-gray dark:text-gray-100">
            {t('bio', { defaultValue: 'Bio (About)' })}
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input-field mt-1"
              rows={4}
              maxLength={160}
              placeholder={t('bio_placeholder', { defaultValue: 'Tell people a little about you…' })}
            />
            <div className="mt-2 flex items-center justify-between gap-2 text-xs text-soultalk-medium-gray">
              <span>{t('bio_tip', { defaultValue: 'Keep it friendly and short.' })}</span>
              <span>{bio.length}/160</span>
            </div>
          </label>

          {upImg && (
            <div className="mt-5 p-3 md:p-4 rounded-xl border border-emerald-400/15 bg-soultalk-warm-gray/45">
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={onCropComplete}
                  aspect={1}
                  minWidth={100}
                  minHeight={100}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    alt={t('profile_picture_preview_alt', { defaultValue: 'Profile picture preview' })}
                    src={upImg}
                    onLoad={onImageLoad}
                    className="max-w-full h-auto block rounded-lg"
                  />
                </ReactCrop>
              </div>
              <p className="mt-3 text-xs text-soultalk-medium-gray text-center">
                {t('profile_setup_drag_to_crop', { defaultValue: 'Drag to reposition, and resize to fit your face nicely.' })}
              </p>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <button
              onClick={onSaveProfile}
              disabled={!canSave}
              className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-soultalk-lavender ${
                canSave
                  ? 'bg-gradient-to-r from-soultalk-gradient-start to-soultalk-gradient-end text-emerald-50 hover:from-soultalk-gradient-start/90 hover:to-soultalk-gradient-end/90'
                  : 'bg-emerald-500/10 text-soultalk-medium-gray cursor-not-allowed border border-emerald-400/15'
              }`}
            >
              {t('save_changes', { defaultValue: 'Save changes' })}
            </button>

            <button
              onClick={() => onProfileSetupComplete()}
              className="w-full py-2.5 px-4 rounded-xl font-semibold bg-soultalk-warm-gray text-soultalk-dark-gray border border-emerald-400/15 hover:bg-emerald-500/10 transition-colors"
            >
              {t('skip_for_now')}
            </button>

            <button
              onClick={onBack}
              className="w-full py-2.5 px-4 rounded-xl border border-emerald-400/15 text-soultalk-medium-gray font-semibold hover:bg-emerald-500/10 transition-colors"
            >
              {t('back')}
            </button>
          </div>
        </div>

        <div className="card-elevated p-5 rounded-2xl space-y-3">
          <h3 className="text-lg font-semibold text-soultalk-dark-gray inline-flex items-center gap-2">
            <Info className="w-4 h-4 text-soultalk-lavender" />
            {t('profile_setup_why_title', { defaultValue: 'Why add a photo?' })}
          </h3>
          <p className="text-sm text-soultalk-medium-gray">
            {t('profile_setup_why_body', { defaultValue: 'A profile photo helps people recognize you and makes conversations feel more human. If you prefer, you can skip and add one later.' })}
          </p>
          <div className="rounded-xl bg-soultalk-warm-gray/35 border border-emerald-400/15 p-4 text-sm text-soultalk-medium-gray">
            <p className="font-semibold text-soultalk-dark-gray inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-soultalk-lavender" />
              {t('profile_setup_privacy_title', { defaultValue: 'Privacy note' })}
            </p>
            <p className="mt-1">
              {t('profile_setup_privacy_body', { defaultValue: 'Choose a photo you’re comfortable sharing. Avoid IDs, documents, or anything sensitive in the background.' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
