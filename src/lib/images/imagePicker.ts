import * as ImagePicker from 'expo-image-picker';

const DEFAULT_IMAGE_OPTIONS = {
  allowsEditing: true,
  aspect: [1, 1] as [number, number],
  mediaTypes: 'images' as const,
  quality: 0.8,
};

export async function pickImageFromLibrary() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error('PHOTO_PERMISSION_DENIED');
  }

  const result = await ImagePicker.launchImageLibraryAsync(
    DEFAULT_IMAGE_OPTIONS,
  );

  if (result.canceled) {
    return;
  }

  return result.assets[0]?.uri;
}

export async function takeImageWithCamera() {
  const permission = await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    throw new Error('CAMERA_PERMISSION_DENIED');
  }

  const result = await ImagePicker.launchCameraAsync(DEFAULT_IMAGE_OPTIONS);

  if (result.canceled) {
    return;
  }

  return result.assets[0]?.uri;
}
