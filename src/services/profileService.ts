import axios from 'axios';
import { API_URL } from '@/config';

const profileService = {
  async updateProfile(data: {
    displayName?: string;
    profileSlug?: string;
    bio?: string;
  }) {
    const response = await axios.put(
      `${API_URL}/api/profiles/me`,
      {
        display_name: data.displayName,
        slug: data.profileSlug,
        bio: data.bio,
      },
      {
        withCredentials: true,
      }
    );

    return response.data;
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      `${API_URL}/api/profiles/me/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      }
    );

    return response.data;
  },

  async updatePassword(data: {
    currentPassword: string;
    newPassword: string;
  }) {
    const response = await axios.post(
      `${API_URL}/api/auth/password/change`,
      {
        old_password: data.currentPassword,
        new_password: data.newPassword,
      },
      {
        withCredentials: true,
      }
    );

    return response.data;
  },
};

export default profileService;