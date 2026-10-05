import { supabase, isDemoMode } from './supabase';

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param path - The storage path (e.g., 'products/image.jpg')
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(file: File, bucket: string, path: string): Promise<string> {
  if (isDemoMode) {
    // Return a placeholder URL in demo mode
    return `https://demo.supabase.co/storage/v1/object/public/${bucket}/${path}`;
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Upload a product image
 * @param file - The image file
 * @param productId - The product ID
 * @param index - The image index
 * @returns The public URL
 */
export async function uploadProductImage(
  file: File,
  productId: string,
  index: number
): Promise<string> {
  const extension = file.name.split('.').pop() || 'jpg';
  const path = `${productId}/image_${index}.${extension}`;
  return uploadFile(file, 'products', path);
}

/**
 * Upload a user avatar
 * @param file - The avatar file
 * @param userId - The user ID
 * @returns The public URL
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  const extension = file.name.split('.').pop() || 'jpg';
  const path = `${userId}.${extension}`;
  return uploadFile(file, 'avatars', path);
}

/**
 * Upload verification documents
 * @param file - The document file
 * @param userId - The user ID
 * @param docType - Type of document ('id_front', 'id_back', 'business_photo')
 * @returns The public URL
 */
export async function uploadVerificationDoc(
  file: File,
  userId: string,
  docType: 'id_front' | 'id_back' | 'business_photo'
): Promise<string> {
  const extension = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/${docType}.${extension}`;
  return uploadFile(file, 'verification', path);
}

/**
 * Upload a chat image
 * @param file - The image file
 * @param conversationId - The conversation ID
 * @returns The public URL
 */
export async function uploadChatImage(
  file: File,
  conversationId: string
): Promise<string> {
  const timestamp = Date.now();
  const extension = file.name.split('.').pop() || 'jpg';
  const path = `${conversationId}/${timestamp}.${extension}`;
  return uploadFile(file, 'chats', path);
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The storage path of the file to delete
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  if (isDemoMode) return;

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
}

/**
 * Get a public URL for a storage path
 * @param bucket - The storage bucket name
 * @param path - The storage path
 * @returns The public URL
 */
export function getFileUrl(bucket: string, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}
