import React from 'react';
import { Heart } from 'lucide-react';
import { resolveProfilePictureUrl, DEFAULT_PROFILE_IMAGE_URL } from './profileImage';

const UserAvatar = ({ targetUser, isOnline }) => {
  const profilePictureUrl = resolveProfilePictureUrl(targetUser.profile_picture_url);

  return (
    <div className="relative flex-shrink-0">
      <img 
        src={profilePictureUrl}
        alt={targetUser.username}
        className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-sm"
        onError={(e) => {
          console.log("Failed to load image for user:", targetUser.username, profilePictureUrl);
          e.currentTarget.src = DEFAULT_PROFILE_IMAGE_URL;
        }}
      />
      {/* Online indicator */}
      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
        isOnline ? 'bg-green-500' : 'bg-gray-400'
      }`}>
        {isOnline && (
          <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
        )}
      </div>
      {/* Soul Connection Badge (for mutual connections) */}
      {Math.random() > 0.5 && ( // Keep Math.random for now as per original code
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-soultalk-coral to-soultalk-lavender rounded-full flex items-center justify-center border-2 border-white shadow-sm">
          <Heart className="w-2.5 h-2.5 text-white fill-current" />
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
