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


export default function ProfileSetup({ onProfileSetupComplete, onBack }) {
  const { t } = useTranslation();
  const imgRef = useRef(null);
  const [upImg, setUpImg] = useState(); // Holds the original image selected by user
  const [crop, setCrop] = useState(); // Holds the crop dimensions
  const [completedCrop, setCompletedCrop] = useState(); // Holds the completed crop to draw
  const [croppedImageUrl, setCroppedImageUrl] = useState(null); // URL of the cropped image

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
    <div className="space-y-4 text-center p-4">
      <h2 className="text-xl font-semibold mb-4 text-soultalk-dark-gray">{t('setup_profile_picture')}</h2>

      <input type="file" accept="image/*" onChange={onSelectFile} className="block w-full text-sm text-soultalk-medium-gray file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-soultalk-warm-gray file:text-soultalk-dark-gray hover:file:bg-gray-300" />
      {!upImg && (
        <button
          onClick={() => onProfileSetupComplete()}
          className="w-full bg-soultalk-warm-gray text-soultalk-dark-gray font-bold py-2 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soultalk-lavender transition-all duration-300 ease-in-out mt-2"
        >
          {t('skip_for_now')}
        </button>
      )}

      {upImg && (
        <div className="flex justify-center my-4">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={onCropComplete}
            aspect={1} // 1:1 aspect ratio for profile picture
            minWidth={100}
            minHeight={100}
            circularCrop
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={upImg}
              onLoad={onImageLoad}
              className="max-w-full h-auto block"
            />
          </ReactCrop>
        </div>
      )}

      {completedCrop && (
        <>
          <button
            onClick={onSaveProfilePicture}
            className="w-full bg-gradient-to-r from-soultalk-gradient-start to-soultalk-gradient-end text-soultalk-white font-bold py-3 px-4 rounded-lg hover:from-soultalk-gradient-start/90 hover:to-soultalk-gradient-end/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soultalk-lavender transition-all duration-300 ease-in-out"
          >
            {t('save_profile_picture')}
          </button>
          <button
            onClick={() => onProfileSetupComplete()}
            className="w-full bg-gradient-to-r from-soultalk-gradient-start to-soultalk-gradient-end text-soultalk-white font-bold py-3 px-4 rounded-lg hover:from-soultalk-gradient-start/90 hover:to-soultalk-gradient-end/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soultalk-lavender transition-all duration-300 ease-in-out"
          >
            {t('done')}
          </button>
        </>
      )}

      <button
        onClick={onBack}
        className="w-full bg-transparent border border-gray-300 text-soultalk-medium-gray font-bold py-2 px-4 rounded-lg hover:bg-soultalk-warm-gray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-soultalk-lavender transition-all duration-300 ease-in-out mt-2"
      >
        {t('back')}
      </button>
    </div>
  );
}