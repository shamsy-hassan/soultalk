import { BACKEND_BASE_URL } from './config';
import defaultProfileImage from './assets/default-profile.svg';

export const DEFAULT_PROFILE_IMAGE_URL = defaultProfileImage;

export function resolveProfilePictureUrl(profilePictureUrl) {
  if (!profilePictureUrl) {
    return DEFAULT_PROFILE_IMAGE_URL;
  }

  if (
    profilePictureUrl.startsWith('http://') ||
    profilePictureUrl.startsWith('https://') ||
    profilePictureUrl.startsWith('data:') ||
    profilePictureUrl.startsWith('blob:')
  ) {
    return profilePictureUrl;
  }

  const normalizedPath = profilePictureUrl.startsWith('/')
    ? profilePictureUrl
    : `/${profilePictureUrl}`;

  return `${BACKEND_BASE_URL}${normalizedPath}`;
}
