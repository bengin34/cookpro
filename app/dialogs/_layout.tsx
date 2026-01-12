import { Stack } from 'expo-router';

export default function DialogLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="recipe-import"
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Import Recipe',
          headerBackTitle: 'Close',
          headerTintColor: '#e25822',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#ffffff',
          },
        }}
      />
    </Stack>
  );
}
