import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { MAPBOX_API_KEY } from '@env';
import * as Location from 'expo-location';

const MapScreen = ({ route }) => {
  const { address, data } = route.params;
  const [region, setRegion] = useState({
    latitude: -23.550520,
    longitude: -46.633308,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // Solicita permissão de localização
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permissão de localização negada');
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setError(null);
        const query = encodeURIComponent(address);
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_API_KEY}`
        );

        if (!response.ok) {
          throw new Error('Erro na resposta do servidor');
        }

        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const [longitude, latitude] = data.features[0].center;
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        } else {
          setError('Endereço não encontrado');
        }
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar o mapa. Tente novamente.');
        Alert.alert(
          'Erro',
          'Não foi possível carregar o mapa. Verifique sua conexão com a internet.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsLoading(false);
      }
    })();
  }, [address]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        region={region}
      >
        <MapView.Marker
          coordinate={{
            latitude: region.latitude,
            longitude: region.longitude,
          }}
          title={address}
          description={data?.bairro || ''}
        />
      </MapView>
      <View style={styles.addressCard}>
        <Text style={styles.addressTitle}>Endereço Encontrado:</Text>
        <Text style={styles.addressText}>{address}</Text>
        {data && (
          <>
            <Text style={styles.addressDetail}>CEP: {data.cep}</Text>
            <Text style={styles.addressDetail}>Bairro: {data.bairro}</Text>
            <Text style={styles.addressDetail}>Cidade: {data.localidade}</Text>
            <Text style={styles.addressDetail}>Estado: {data.uf}</Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '70%',
  },
  addressCard: {
    backgroundColor: 'white',
    padding: 15,
    margin: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  addressText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  addressDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default MapScreen;
