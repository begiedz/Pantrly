import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';

import Screen from '@/components/screen';
import { addProduct } from '@/lib/store/appStore';

export default function CreateScreen() {
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [categories, setCategories] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [bestBefore, setBestBefore] = useState<Date>(new Date());
  const [isSaving, setIsSaving] = useState(false);

  const trimmedBarcode = barcode.trim();
  const trimmedName = name.trim();
  const trimmedBrand = brand.trim();
  const trimmedCategories = categories.trim();
  const trimmedImageUrl = imageUrl.trim();

  const selectedBestBefore = bestBefore;

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (event.type !== 'set' || !selectedDate) {
      return;
    }

    setBestBefore(selectedDate);
  };

  const handleSave = async () => {
    if (!trimmedName) {
      Alert.alert('Missing name', 'Enter an item name before saving.');
      return;
    }

    setIsSaving(true);

    try {
      addProduct({
        id: Crypto.randomUUID(),
        barcode: trimmedBarcode || undefined,
        name: trimmedName,
        brand: trimmedBrand || undefined,
        categories: trimmedCategories
          ? trimmedCategories
              .split(',')
              .map((category) => category.trim())
              .filter(Boolean)
          : undefined,
        imageUrl: trimmedImageUrl || undefined,
        bestBefore: bestBefore.toISOString(),
      });

      router.replace('/');
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
            <Text variant='headlineMedium'>Add pantry item</Text>
            <Text variant='bodySmall' style={styles.subtleText}>
              Enter an item information and store its best before date.
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

            {/* <TextInput
              mode='outlined'
              label='Image URL'
              placeholder='https://example.com/item.png'
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize='none'
              autoCorrect={false}
              keyboardType='url'
              returnKeyType='next'
            /> */}
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
