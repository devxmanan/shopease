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
  uploadPreset = "shopease",
  cloudName,
}: UseCloudinaryProps): UseCloudinaryReturn => {
  // Use environment variables directly
  const actualCloudName = cloudName || import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const actualUploadPreset = uploadPreset;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<CloudinaryUploadResult | null> => {
    setUploading(true);
    setError(null);

    try {
      console.log("Starting Cloudinary upload with preset:", actualUploadPreset);
      console.log("Cloudinary cloud name:", actualCloudName);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', actualUploadPreset);

      const url = `https://api.cloudinary.com/v1_1/${actualCloudName}/image/upload`;
      console.log("Upload URL:", url);
      
      // Add specific headers to avoid CORS issues
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await response.json();
      console.log("Cloudinary response:", data);

      if (!response.ok) {
        console.error("Cloudinary upload failed:", data);
        throw new Error(data.error?.message || 'Failed to upload image');
      }

      console.log("Upload successful, secure URL:", data.secure_url);
      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    } catch (err) {
      console.error("Cloudinary upload error:", err);
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
