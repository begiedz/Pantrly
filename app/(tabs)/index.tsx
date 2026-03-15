import { Link, Stack } from 'expo-router';

import { FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Item from '@/components/Item';
import { Text } from '@/components/ui/text';

const SCREEN_OPTIONS = {
  title: 'Pantrly',
  headerTransparent: true,
};

const DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    title: 'First Item',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    title: 'Second Item',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    title: 'Third Item',
  },
];

const Separator = () => <View className='mb-4' />;

const list = false;

export default function Index() {
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      {list ? (
        <SafeAreaView>
          <FlatList
            data={DATA}
            renderItem={({ item }) => <Item title={item.title} />}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={Separator}
          />
        </SafeAreaView>
      ) : (
        <SafeAreaView className='flex-1 items-center justify-center gap-8 p-4'>
          <Text className='text-6xl p-4 bg-lime-500 rounded'>Ply</Text>
          <View className='gap-2 p-4 items-center'>
            <Text className='text-xl'> Welcome to Pantrly!</Text>
            <Text>Your current pantry is empty.</Text>
            <Link href='/scanner'>
              <Link.Trigger>
                <Text className='text-blue-500'>
                  Let's start by scanning some items!
                </Text>
              </Link.Trigger>
            </Link>
          </View>
        </SafeAreaView>
      )}
    </>
  );
}
