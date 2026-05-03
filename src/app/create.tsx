import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as Crypto from 'expo-crypto';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
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
  downloadProductImageToStorage,
} from '@/lib/images/productImages';
import mapApiProductToEntity from '@/lib/mappers/productMapper';
import { addProduct } from '@/lib/store/appStore';

export default function CreateScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
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
  const [isIosDatePickerVisible, setIsIosDatePickerVisible] = useState(false);
  const [iosPickerDate, setIosPickerDate] = useState<Date>(initialBestBefore);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const trimmedBarcode = barcode.trim();
  const trimmedName = name.trim();
  const trimmedBrand = brand.trim();
  const trimmedCategories = categories.trim();

  const previewImageUri = selectedImageUri ?? remoteImageUrl;
  const isScannedProduct = params.source === 'scan';
  const isWideLayout = width >= 768;
  const contentPadding = width < 380 ? 16 : width < 768 ? 20 : 24;
  const imagePreviewSize = Math.min(width * (isWideLayout ? 0.22 : 0.32), 180);
  const formattedBestBefore = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(bestBefore),
    [bestBefore],
  );

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (event.type !== 'set' || !selectedDate) {
      return;
    }

    setBestBefore(selectedDate);
  };

  const handleIosDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (event.type !== 'set' || !selectedDate) {
      return;
    }

    setIosPickerDate(selectedDate);
  };

  const handleOpenDatePicker = () => {
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
  };

  const handleCloseIosDatePicker = () => {
    setIsIosDatePickerVisible(false);
  };

  const handleConfirmIosDatePicker = () => {
    setBestBefore(iosPickerDate);
    setIsIosDatePickerVisible(false);
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
        warningHaptic();
        Alert.alert(
          'Permission needed',
          'Allow photo access to attach an image to this item.',
        );
        return;
      }

      errorHaptic();
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
        warningHaptic();
        Alert.alert(
          'Permission needed',
          'Allow camera access to take a product photo.',
        );
        return;
      }

      errorHaptic();
      Alert.alert('Camera failed', 'Could not take a photo.');
    }
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

      setName(product.name ?? '');
      setBrand(product.brand ?? '');
      setCategories(product.categories?.join(', ') ?? '');
      setRemoteImageUrl(product.imageUrl);
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
      const id = Crypto.randomUUID();
      const localImageUri = selectedImageUri
        ? await copyProductImageToStorage(selectedImageUri, id)
        : remoteImageUrl
          ? await downloadProductImageToStorage(remoteImageUrl, id)
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

      successHaptic();
      router.replace('/');
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
      <KeyboardAvoidingView style={styles.container}>
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={[styles.content, { padding: contentPadding }]}
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

            <View>
              <Text variant='bodySmall' style={styles.dateLabel}>
                Best before
              </Text>

              <Pressable
                onPress={handleOpenDatePicker}
                style={styles.dateTrigger}
              >
                <View>
                  <Text variant='labelMedium' style={styles.dateTriggerLabel}>
                    Selected date
                  </Text>
                  <Text variant='titleMedium'>{formattedBestBefore}</Text>
                </View>
                <Text
                  variant='bodyMedium'
                  style={[
                    styles.dateTriggerAction,
                    { color: theme.colors.primary },
                  ]}
                >
                  Change
                </Text>
              </Pressable>
            </View>
            <View
              style={[
                styles.barcodeField,
                !isWideLayout && styles.barcodeFieldStacked,
              ]}
            >
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
                style={!isWideLayout ? styles.barcodeButton : undefined}
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
              Save item
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
    alignItems: 'center',
    gap: 8,
  },
  barcodeFieldStacked: {
    alignItems: 'stretch',
    flexWrap: 'wrap',
  },
  barcodeInput: {
    flex: 1,
    minWidth: 220,
  },
  barcodeButton: {
    width: '100%',
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
  dateLabel: {
    marginBottom: 6,
    opacity: 0.7,
    paddingHorizontal: 12,
  },
  dateTrigger: {
    alignItems: 'center',
    borderColor: '#cbd5e1',
    borderRadius: 4,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  dateTriggerLabel: {
    marginBottom: 4,
    opacity: 0.6,
  },
  dateTriggerAction: {
    fontWeight: '600',
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
