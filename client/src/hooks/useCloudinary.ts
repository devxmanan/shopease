import { useState } from 'react';

interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

interface UseCloudinaryProps {
  uploadPreset: string;
  cloudName: string;
}

interface UseCloudinaryReturn {
  uploading: boolean;
  error: string | null;
  uploadImage: (file: File) => Promise<CloudinaryUploadResult | null>;
  uploadMultipleImages: (files: File[]) => Promise<CloudinaryUploadResult[]>;
}

export const useCloudinary = ({
  uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "shop_ease",
  cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "",
}: UseCloudinaryProps): UseCloudinaryReturn => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<CloudinaryUploadResult | null> => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to upload image');
      }

      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultipleImages = async (files: File[]): Promise<CloudinaryUploadResult[]> => {
    setUploading(true);
    setError(null);
    
    try {
      const uploadPromises = files.map(file => uploadImage(file));
      const results = await Promise.all(uploadPromises);
      // Filter out null results
      return results.filter(Boolean) as CloudinaryUploadResult[];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      return [];
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    error,
    uploadImage,
    uploadMultipleImages,
  };
};
