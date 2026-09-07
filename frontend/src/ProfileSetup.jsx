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
          <div className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full bg-heybuddy-lavender/20 blur-2xl" />
          <div className="pointer-events-none absolute -left-10 -bottom-14 h-32 w-32 rounded-full bg-heybuddy-coral/15 blur-2xl" />
          <div className="text-center relative">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-950/35 border border-gray-800/60">
              <Camera className="h-6 w-6 text-heybuddy-lavender" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-heybuddy-dark-gray">
              {t('setup_profile_picture')}
            </h2>
            <p className="text-sm text-heybuddy-medium-gray mt-2">
              {t('profile_setup_subtitle')}
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
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-heybuddy-warm-gray text-heybuddy-dark-gray border border-emerald-400/15 font-semibold cursor-pointer hover:bg-emerald-500/10 transition-colors"
            >
              <ImageIcon className="w-5 h-5 text-heybuddy-lavender" />
              {upImg ? t('change_photo') : t('choose_photo')}
            </label>
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              onChange={onSelectFile}
              className="hidden"
            />

            <div className="rounded-xl bg-heybuddy-warm-gray/35 border border-emerald-400/15 p-4 text-sm text-heybuddy-medium-gray">
              <p className="font-semibold text-heybuddy-dark-gray inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-heybuddy-lavender" />
                {t('profile_setup_tips_title')}
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>{t('profile_setup_tip_1')}</li>
                <li>{t('profile_setup_tip_2')}</li>
                <li>{t('profile_setup_tip_3')}</li>
              </ul>
            </div>
          </div>

          <label className="block mt-5 text-sm text-heybuddy-dark-gray dark:text-gray-100">
            {t('bio')}
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input-field mt-1"
              rows={4}
              maxLength={160}
              placeholder={t('bio_placeholder')}
            />
	            <div className="mt-2 flex items-center justify-between gap-2 text-xs text-heybuddy-medium-gray">
	              <span>{t('bio_tip')}</span>
	              <span>
	                {t('character_count', {
	                  count: bio.length,
	                  max: 160,
	                  defaultValue: '{{count}}/{{max}}',
	                })}
	              </span>
	            </div>
	          </label>

          {upImg && (
            <div className="mt-5 p-3 md:p-4 rounded-xl border border-emerald-400/15 bg-heybuddy-warm-gray/45">
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
                    alt={t('profile_picture_preview_alt')}
                    src={upImg}
                    onLoad={onImageLoad}
                    className="max-w-full h-auto block rounded-lg"
                  />
                </ReactCrop>
              </div>
              <p className="mt-3 text-xs text-heybuddy-medium-gray text-center">
                {t('profile_setup_drag_to_crop')}
              </p>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <button
              onClick={onSaveProfile}
              disabled={!canSave}
              className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-heybuddy-lavender ${
                canSave
                  ? 'bg-gradient-to-r from-heybuddy-gradient-start to-heybuddy-gradient-end text-emerald-50 hover:from-heybuddy-gradient-start/90 hover:to-heybuddy-gradient-end/90'
                  : 'bg-emerald-500/10 text-heybuddy-medium-gray cursor-not-allowed border border-emerald-400/15'
              }`}
            >
              {t('save_changes')}
            </button>

            <button
              onClick={() => onProfileSetupComplete()}
              className="w-full py-2.5 px-4 rounded-xl font-semibold bg-heybuddy-warm-gray text-heybuddy-dark-gray border border-emerald-400/15 hover:bg-emerald-500/10 transition-colors"
            >
              {t('skip_for_now')}
            </button>

            <button
              onClick={onBack}
              className="w-full py-2.5 px-4 rounded-xl border border-emerald-400/15 text-heybuddy-medium-gray font-semibold hover:bg-emerald-500/10 transition-colors"
            >
              {t('back')}
            </button>
          </div>
        </div>

        <div className="card-elevated p-5 rounded-2xl space-y-3">
          <h3 className="text-lg font-semibold text-heybuddy-dark-gray inline-flex items-center gap-2">
            <Info className="w-4 h-4 text-heybuddy-lavender" />
            {t('profile_setup_why_title')}
          </h3>
          <p className="text-sm text-heybuddy-medium-gray">
            {t('profile_setup_why_body')}
          </p>
          <div className="rounded-xl bg-heybuddy-warm-gray/35 border border-emerald-400/15 p-4 text-sm text-heybuddy-medium-gray">
            <p className="font-semibold text-heybuddy-dark-gray inline-flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-heybuddy-lavender" />
              {t('profile_setup_privacy_title')}
            </p>
            <p className="mt-1">
              {t('profile_setup_privacy_body')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
