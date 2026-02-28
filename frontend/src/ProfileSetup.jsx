// frontend/src/ProfileSetup.jsx
import React, { useState, useCallback, useRef } from 'react';
import ReactCrop, {
  centerCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useTranslation } from 'react-i18next';

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


export default function ProfileSetup({ onProfileSetupComplete, onBack, errorMessage = '' }) {
  const { t } = useTranslation();
  const imgRef = useRef(null);
  const [upImg, setUpImg] = useState(); // Holds the original image selected by user
  const [crop, setCrop] = useState(); // Holds the crop dimensions
  const [completedCrop, setCompletedCrop] = useState(); // Holds the completed crop to draw

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

  const onSaveProfilePicture = async () => {
    if (completedCrop?.width && completedCrop?.height && imgRef.current) {
      const croppedImageBlobUrl = await getCroppedImg(
        imgRef.current,
        completedCrop,
        'newProfilePicture.jpeg'
      );
      onProfileSetupComplete(croppedImageBlobUrl); // Pass the blob URL to parent
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 md:p-6">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 md:p-6">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-soultalk-dark-gray">
            {t('setup_profile_picture')}
          </h2>
          <p className="text-sm text-soultalk-medium-gray mt-2">
            Adjust the crop to choose how your photo appears.
          </p>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 text-center">
            {errorMessage}
          </div>
        )}

        <div className="mt-5">
          <label
            htmlFor="profile-image-upload"
            className="inline-flex items-center justify-center w-full px-4 py-3 rounded-lg bg-soultalk-warm-gray text-soultalk-dark-gray font-semibold cursor-pointer hover:bg-gray-200 transition-colors"
          >
            {upImg ? 'Change photo' : 'Choose photo'}
          </label>
          <input
            id="profile-image-upload"
            type="file"
            accept="image/*"
            onChange={onSelectFile}
            className="hidden"
          />
        </div>

        {upImg && (
          <div className="mt-5 p-3 md:p-4 rounded-xl border border-gray-100 bg-soultalk-warm-gray/40">
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
                  alt="Crop me"
                  src={upImg}
                  onLoad={onImageLoad}
                  className="max-w-full h-auto block rounded-lg"
                />
              </ReactCrop>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            onClick={onSaveProfilePicture}
            disabled={!completedCrop}
            className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soultalk-lavender ${
              completedCrop
                ? 'bg-gradient-to-r from-soultalk-gradient-start to-soultalk-gradient-end text-soultalk-white hover:from-soultalk-gradient-start/90 hover:to-soultalk-gradient-end/90'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {t('save_profile_picture')}
          </button>

          <button
            onClick={() => onProfileSetupComplete()}
            className="w-full py-2 px-4 rounded-lg font-semibold bg-soultalk-warm-gray text-soultalk-dark-gray hover:bg-gray-300 transition-colors"
          >
            {t('skip_for_now')}
          </button>

          <button
            onClick={onBack}
            className="w-full py-2 px-4 rounded-lg border border-gray-300 text-soultalk-medium-gray font-semibold hover:bg-soultalk-warm-gray transition-colors"
          >
            {t('back')}
          </button>
        </div>
      </div>
    </div>
  );
}
