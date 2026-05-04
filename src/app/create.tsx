import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as Crypto from 'expo-crypto';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Button,
  HelperText,
  Modal,
  Portal,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

import { getProductByBarcode } from '@/api/products';
import Screen from '@/components/screen';
import { baseUrl, fields } from '@/config';
import {
  errorHaptic,
  impactHaptic,
  successHaptic,
  warningHaptic,
} from '@/lib/haptics';
import {
  pickImageFromLibrary,
  takeImageWithCamera,
} from '@/lib/images/imagePicker';
import {
  copyProductImageToStorage,
  deleteProductImage,
  downloadProductImageToStorage,
} from '@/lib/images/productImages';
import mapApiProductToEntity from '@/lib/mappers/productMapper';
import {
  addProduct,
  getProductById,
  updateProduct,
} from '@/lib/store/appStore';

function formatBestBefore(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function parseCategories(value: string) {
  const categories = value
    .split(',')
    .map((category) => category.trim())
    .filter(Boolean);

  return categories.length > 0 ? categories : undefined;
}

export default function CreateScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{
    id?: string;
    barcode?: string;
    name?: string;
    brand?: string;
    categories?: string;
    imageUrl?: string;
    source?: string;
  }>();

  const product = params.id ? getProductById(params.id) : undefined;
  const originalStoredImageUri = product?.localImageUri;
  const isEditing = Boolean(product);
  const initialBestBefore = product?.bestBefore
    ? new Date(product.bestBefore)
    : new Date();

  const [barcode, setBarcode] = useState(
    product?.barcode ?? params.barcode ?? '',
  );
  const [name, setName] = useState(product?.name ?? params.name ?? '');
  const [brand, setBrand] = useState(product?.brand ?? params.brand ?? '');
  const [categories, setCategories] = useState(
    product?.categories?.join(', ') ?? params.categories ?? '',
  );
  const [remoteImageUrl, setRemoteImageUrl] = useState(
    product?.imageUrl ?? params.imageUrl,
  );
  const [storedImageUri, setStoredImageUri] = useState(originalStoredImageUri);
  const [selectedImageUri, setSelectedImageUri] = useState<string>();
  const [bestBefore, setBestBefore] = useState<Date>(initialBestBefore);
  const [isIosDatePickerVisible, setIsIosDatePickerVisible] = useState(false);
  const [iosPickerDate, setIosPickerDate] = useState<Date>(initialBestBefore);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const trimmedBarcode = barcode.trim();
  const trimmedName = name.trim();
  const trimmedBrand = brand.trim();
  const trimmedCategories = categories.trim();

  const previewImageUri = selectedImageUri ?? storedImageUri ?? remoteImageUrl;
  const isScannedProduct = params.source === 'scan';
  const isWideLayout = width >= 768;
  const contentPadding = width < 380 ? 16 : width < 768 ? 20 : 24;
  const imagePreviewSize = Math.min(width * (isWideLayout ? 0.22 : 0.32), 180);
  const screenTitle = isEditing ? 'Edit product' : 'New product';
  const headerTitle = isEditing
    ? 'Update pantry item details.'
    : isScannedProduct
      ? 'Check the scanned item details, then set its best before date.'
      : 'Enter an item information and store its best before date.';
  const formattedBestBefore = formatBestBefore(bestBefore);

  function handleDateChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (event.type !== 'set' || !selectedDate) {
      return;
    }

    setBestBefore(selectedDate);
  }

  function handleIosDateChange(
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) {
    if (event.type !== 'set' || !selectedDate) {
      return;
    }

    setIosPickerDate(selectedDate);
  }

  function handleOpenDatePicker() {
    impactHaptic();

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: bestBefore,
        mode: 'date',
        display: 'default',
        onChange: handleDateChange,
      });
      return;
    }

    setIosPickerDate(bestBefore);
    setIsIosDatePickerVisible(true);
  }

  function handleCloseIosDatePicker() {
    setIsIosDatePickerVisible(false);
  }

  function handleConfirmIosDatePicker() {
    setBestBefore(iosPickerDate);
    setIsIosDatePickerVisible(false);
  }

  function fillProductFields(
    nextProduct: NonNullable<ReturnType<typeof mapApiProductToEntity>>,
  ) {
    setName(nextProduct.name ?? '');
    setBrand(nextProduct.brand ?? '');
    setCategories(nextProduct.categories?.join(', ') ?? '');
    setRemoteImageUrl(nextProduct.imageUrl);
  }

  async function handleImageSelection(
    action: () => Promise<string | undefined>,
    permissionError: 'PHOTO_PERMISSION_DENIED' | 'CAMERA_PERMISSION_DENIED',
    permissionMessage: string,
    failureTitle: string,
    failureMessage: string,
  ) {
    try {
      const uri = await action();

      if (uri) {
        setSelectedImageUri(uri);
      }
    } catch (error) {
      if (error instanceof Error && error.message === permissionError) {
        warningHaptic();
        Alert.alert('Permission needed', permissionMessage);
        return;
      }

      errorHaptic();
      Alert.alert(failureTitle, failureMessage);
    }
  }

  const handleChoosePhoto = async () => {
    await handleImageSelection(
      pickImageFromLibrary,
      'PHOTO_PERMISSION_DENIED',
      'Allow photo access to attach an image to this item.',
      'Image failed',
      'Could not open the photo library.',
    );
  };

  const handleTakePhoto = async () => {
    await handleImageSelection(
      takeImageWithCamera,
      'CAMERA_PERMISSION_DENIED',
      'Allow camera access to take a product photo.',
      'Camera failed',
      'Could not take a photo.',
    );
  };

  const handleFetchByBarcode = async () => {
    if (!trimmedBarcode) {
      warningHaptic();
      Alert.alert('Missing barcode', 'Enter a barcode before fetching.');
      return;
    }

    setIsFetchingProduct(true);

    try {
      const response = await getProductByBarcode(
        baseUrl,
        trimmedBarcode,
        fields,
      );
      const product = mapApiProductToEntity(response);

      if (!product) {
        warningHaptic();
        Alert.alert('Not found', 'No product found for this barcode.');
        return;
      }

      fillProductFields(product);
      successHaptic();
      Alert.alert('Product found', 'Filled the item details from barcode.');
    } catch (error) {
      console.error('Barcode lookup failed:', error);
      errorHaptic();
      Alert.alert('Lookup failed', 'Could not fetch product data.');
    } finally {
      setIsFetchingProduct(false);
    }
  };

  const handleSave = async () => {
    if (!trimmedName) {
      warningHaptic();
      Alert.alert('Missing name', 'Enter an item name before saving.');
      return;
    }

    setIsSaving(true);

    try {
      const id = product?.id ?? Crypto.randomUUID();
      let localImageUri = storedImageUri;

      if (!previewImageUri && originalStoredImageUri) {
        await deleteProductImage(originalStoredImageUri);
        localImageUri = undefined;
      } else if (selectedImageUri) {
        if (originalStoredImageUri) {
          await deleteProductImage(originalStoredImageUri);
        }

        localImageUri = await copyProductImageToStorage(selectedImageUri, id);
      } else if (!storedImageUri && remoteImageUrl) {
        localImageUri = await downloadProductImageToStorage(remoteImageUrl, id);
      }

      const nextProduct = {
        id,
        barcode: trimmedBarcode || undefined,
        name: trimmedName,
        brand: trimmedBrand || undefined,
        categories: parseCategories(trimmedCategories),
        imageUrl: remoteImageUrl || undefined,
        localImageUri,
        bestBefore: bestBefore.toISOString(),
      };

      if (isEditing) {
        updateProduct(nextProduct);
      } else {
        addProduct(nextProduct);
      }

      successHaptic();

      if (isEditing) {
        router.back();
      } else {
        router.replace('/');
      }
    } catch (error) {
      console.error('Failed to save pantry item', error);
      errorHaptic();
      Alert.alert(
        'Save failed',
        isScannedProduct
          ? 'Could not store this item image for offline use.'
          : 'Could not save this item.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Screen>
      <Stack.Screen
        options={{
          title: screenTitle,
        }}
      />

      <KeyboardAvoidingView style={styles.container}>
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={[styles.content, { padding: contentPadding }]}
        >
          <View style={[styles.header, isWideLayout && styles.headerWide]}>
            <Text variant='headlineMedium'>
              {isEditing
                ? 'Edit pantry item'
                : isScannedProduct
                  ? 'Review scanned item'
                  : 'Add pantry item'}
            </Text>

            <Text variant='bodySmall' style={styles.subtleText}>
              {headerTitle}
            </Text>
          </View>

          <View style={[styles.form, isWideLayout && styles.formWide]}>
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

            <TextInput
              mode='outlined'
              label='Best before'
              value={formattedBestBefore}
              editable={false}
              showSoftInputOnFocus={false}
              right={
                <TextInput.Icon
                  icon='calendar'
                  onPress={handleOpenDatePicker}
                />
              }
              onPressIn={handleOpenDatePicker}
            />

            <View style={styles.barcodeField}>
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
                style={styles.barcodeInput}
              />

              <Button
                style={styles.barcodeButton}
                mode='outlined'
                icon='database-search-outline'
                onPress={() => {
                  impactHaptic();
                  void handleFetchByBarcode();
                }}
                loading={isFetchingProduct}
                disabled={!trimmedBarcode || isFetchingProduct}
              >
                Fill
              </Button>
            </View>

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

            <View
              style={[styles.imageField, isWideLayout && styles.imageFieldWide]}
            >
              {previewImageUri ? (
                <Image
                  source={{ uri: previewImageUri }}
                  style={[
                    styles.imagePreview,
                    {
                      width: imagePreviewSize,
                      height: imagePreviewSize,
                    },
                  ]}
                  resizeMode='cover'
                />
              ) : (
                <View
                  style={[
                    styles.imagePreview,
                    styles.imagePlaceholder,
                    {
                      width: imagePreviewSize,
                      height: imagePreviewSize,
                    },
                  ]}
                >
                  <Text variant='bodyMedium'>No image</Text>
                </View>
              )}

              <View style={styles.imageActions}>
                <Button
                  mode='outlined'
                  icon='camera'
                  onPress={() => {
                    impactHaptic();
                    void handleTakePhoto();
                  }}
                >
                  Take photo
                </Button>

                <Button
                  mode='outlined'
                  icon='image'
                  onPress={() => {
                    impactHaptic();
                    void handleChoosePhoto();
                  }}
                >
                  Choose photo
                </Button>

                {previewImageUri ? (
                  <Button
                    mode='text'
                    onPress={() => {
                      impactHaptic();
                      setSelectedImageUri(undefined);
                      setStoredImageUri(undefined);
                      setRemoteImageUrl(undefined);
                    }}
                  >
                    Remove
                  </Button>
                ) : null}
              </View>
            </View>
          </View>

          <View
            style={[styles.actions, !isWideLayout && styles.actionsStacked]}
          >
            <Button
              style={!isWideLayout ? styles.actionButton : undefined}
              mode='text'
              onPress={() => {
                impactHaptic();
                router.back();
              }}
            >
              Cancel
            </Button>

            <Button
              style={!isWideLayout ? styles.actionButton : undefined}
              mode='contained'
              onPress={() => {
                impactHaptic();
                void handleSave();
              }}
              loading={isSaving}
            >
              {isEditing ? 'Save changes' : 'Save item'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {Platform.OS === 'ios' ? (
        <Portal>
          <Modal
            visible={isIosDatePickerVisible}
            onDismiss={handleCloseIosDatePicker}
            contentContainerStyle={[
              styles.iosDateModal,
              { backgroundColor: theme.colors.background },
            ]}
          >
            <Text variant='titleMedium'>Best before</Text>

            <View style={styles.iosDatePickerContainer}>
              <DateTimePicker
                value={iosPickerDate}
                mode='date'
                display='spinner'
                onChange={handleIosDateChange}
              />
            </View>

            <View style={styles.iosDateModalActions}>
              <Button mode='text' onPress={handleCloseIosDatePicker}>
                Cancel
              </Button>

              <Button mode='contained' onPress={handleConfirmIosDatePicker}>
                Done
              </Button>
            </View>
          </Modal>
        </Portal>
      ) : null}
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
  headerWide: {
    alignSelf: 'center',
    maxWidth: 720,
    width: '100%',
  },
  subtleText: {
    opacity: 0.7,
  },
  form: {
    gap: 8,
  },
  formWide: {
    alignSelf: 'center',
    maxWidth: 720,
    width: '100%',
  },
  barcodeField: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
  barcodeInput: {
    flex: 1,
    minWidth: 0,
  },
  barcodeButton: {
    alignSelf: 'center',
    flexShrink: 0,
    justifyContent: 'center',
  },

  imageField: {
    gap: 12,
    paddingTop: 8,
  },
  imageFieldWide: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  imagePreview: {
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
  iosDatePickerContainer: {
    alignItems: 'center',
    marginTop: 12,
    overflow: 'hidden',
  },
  iosDateModal: {
    borderRadius: 24,
    margin: 20,
    padding: 20,
  },
  iosDateModalActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 'auto',
    paddingBottom: 12,
  },
  actionsStacked: {
    flexWrap: 'wrap-reverse',
  },
  actionButton: {
    minWidth: 140,
  },
});
