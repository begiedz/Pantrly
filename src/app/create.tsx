import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as Crypto from 'expo-crypto';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

import Screen from '@/components/screen';
import {
  pickImageFromLibrary,
  takeImageWithCamera,
} from '@/lib/images/imagePicker';
import { copyProductImageToStorage } from '@/lib/images/productImages';
import { addProduct } from '@/lib/store/appStore';

export default function CreateScreen() {
  const params = useLocalSearchParams<{
    barcode?: string;
    name?: string;
    brand?: string;
    categories?: string;
    imageUrl?: string;
    source?: string;
  }>();
  const initialBestBefore = useMemo(() => new Date(), []);
  const [barcode, setBarcode] = useState(params.barcode ?? '');
  const [name, setName] = useState(params.name ?? '');
  const [brand, setBrand] = useState(params.brand ?? '');
  const [categories, setCategories] = useState(params.categories ?? '');
  const [remoteImageUrl, setRemoteImageUrl] = useState(params.imageUrl);
  const [selectedImageUri, setSelectedImageUri] = useState<string>();
  const [bestBefore, setBestBefore] = useState<Date>(initialBestBefore);
  const [isSaving, setIsSaving] = useState(false);

  const trimmedBarcode = barcode.trim();
  const trimmedName = name.trim();
  const trimmedBrand = brand.trim();
  const trimmedCategories = categories.trim();

  const selectedBestBefore = bestBefore;
  const previewImageUri = selectedImageUri ?? remoteImageUrl;
  const isScannedProduct = params.source === 'scan';

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (event.type !== 'set' || !selectedDate) {
      return;
    }

    setBestBefore(selectedDate);
  };

  const handleChoosePhoto = async () => {
    try {
      const uri = await pickImageFromLibrary();

      if (!uri) {
        return;
      }

      setSelectedImageUri(uri);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'PHOTO_PERMISSION_DENIED'
      ) {
        Alert.alert(
          'Permission needed',
          'Allow photo access to attach an image to this item.',
        );
        return;
      }

      Alert.alert('Image failed', 'Could not open the photo library.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const uri = await takeImageWithCamera();

      if (!uri) {
        return;
      }

      setSelectedImageUri(uri);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'CAMERA_PERMISSION_DENIED'
      ) {
        Alert.alert(
          'Permission needed',
          'Allow camera access to take a product photo.',
        );
        return;
      }

      Alert.alert('Camera failed', 'Could not take a photo.');
    }
  };

  const handleSave = async () => {
    if (!trimmedName) {
      Alert.alert('Missing name', 'Enter an item name before saving.');
      return;
    }

    setIsSaving(true);

    try {
      const id = Crypto.randomUUID();
      const localImageUri = selectedImageUri
        ? await copyProductImageToStorage(selectedImageUri, id)
        : undefined;

      addProduct({
        id,
        barcode: trimmedBarcode || undefined,
        name: trimmedName,
        brand: trimmedBrand || undefined,
        categories: trimmedCategories
          ? trimmedCategories
              .split(',')
              .map((category) => category.trim())
              .filter(Boolean)
          : undefined,
        imageUrl: remoteImageUrl || undefined,
        localImageUri,
        bestBefore: bestBefore.toISOString(),
      });

      router.replace('/');
    } catch (error) {
      console.error('Failed to save pantry item', error);
      Alert.alert('Save failed', 'Could not save this item.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.container}>
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <Text variant='headlineMedium'>
              {isScannedProduct ? 'Review scanned item' : 'Add pantry item'}
            </Text>
            <Text variant='bodySmall' style={styles.subtleText}>
              {isScannedProduct
                ? 'Check the scanned item details, then set its best before date.'
                : 'Enter an item information and store its best before date.'}
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              mode='outlined'
              label='Item name'
              placeholder='Milk'
              value={name}
              onChangeText={setName}
              autoCapitalize='words'
              returnKeyType='next'
              error={trimmedName.length === 0 && name.length > 0}
            />

            <View>
              <Text variant='bodySmall' style={styles.dateLabel}>
                Best before
              </Text>

              <DateTimePicker
                value={selectedBestBefore}
                mode='date'
                display='default'
                onChange={handleDateChange}
              />
            </View>
            <TextInput
              mode='outlined'
              label='Barcode'
              placeholder='5901234123457'
              value={barcode}
              onChangeText={setBarcode}
              autoCapitalize='none'
              autoCorrect={false}
              keyboardType='number-pad'
              returnKeyType='next'
            />

            <TextInput
              mode='outlined'
              label='Brand'
              placeholder='Brand name'
              value={brand}
              onChangeText={setBrand}
              autoCapitalize='words'
              returnKeyType='next'
            />

            <TextInput
              mode='outlined'
              label='Categories'
              placeholder='dairy, refrigerated'
              value={categories}
              onChangeText={setCategories}
              autoCapitalize='none'
              autoCorrect={false}
              returnKeyType='next'
            />
            <HelperText type='info'>
              Separate categories with commas.
            </HelperText>

            <View style={styles.imageField}>
              {previewImageUri ? (
                <Image
                  source={{ uri: previewImageUri }}
                  style={styles.imagePreview}
                  resizeMode='cover'
                />
              ) : (
                <View style={[styles.imagePreview, styles.imagePlaceholder]}>
                  <Text variant='bodyMedium'>No image</Text>
                </View>
              )}

              <View style={styles.imageActions}>
                <Button mode='outlined' icon='camera' onPress={handleTakePhoto}>
                  Take photo
                </Button>
                <Button
                  mode='outlined'
                  icon='image'
                  onPress={handleChoosePhoto}
                >
                  Choose photo
                </Button>
                {previewImageUri ? (
                  <Button
                    mode='text'
                    onPress={() => {
                      setSelectedImageUri(undefined);
                      setRemoteImageUrl(undefined);
                    }}
                  >
                    Remove
                  </Button>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <Button mode='text' onPress={() => router.back()}>
              Cancel
            </Button>
            <Button mode='contained' onPress={handleSave} loading={isSaving}>
              Save item
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: 24,
    padding: 20,
  },
  header: {
    gap: 8,
    paddingTop: 8,
  },
  subtleText: {
    opacity: 0.7,
  },
  form: {
    gap: 8,
  },
  imageField: {
    gap: 12,
    paddingTop: 8,
  },
  imagePreview: {
    width: 128,
    height: 128,
    borderRadius: 12,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e7eb',
  },
  imageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateLabel: {
    marginBottom: 6,
    opacity: 0.7,
    paddingHorizontal: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 'auto',
    paddingBottom: 12,
  },
});
