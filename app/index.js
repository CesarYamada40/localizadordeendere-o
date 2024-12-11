import { registerRootComponent } from 'expo';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'GPS Tracker' }}
        />
        <Stack.Screen 
          name="Map" 
          component={MapScreen} 
          options={{ title: 'Localização' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
registerRootComponent(App);
