import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, Dimensions } from 'react-native';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiY2VzYXJwYzQzIiwiYSI6ImNtNGp3YXMyYzBncW8ybHB6ZzZiYXF1bW8ifQ.qrhFpfrxtpOGAACT6PfkZg';

export default function MapScreen({ route }) {
  const { address, data } = route.params;
  const [viewState, setViewState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const query = encodeURIComponent(address);
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_TOKEN}`
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const [longitude, latitude] = data.features[0].center;
          setViewState({
            longitude,
            latitude,
            zoom: 15
          });
        } else {
          setError('Localização não encontrada');
        }
      } catch (err) {
        setError('Erro ao buscar localização');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinates();
  }, [address]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (loading || !viewState) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <Map
          {...viewState}
          style={styles.map}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken={MAPBOX_TOKEN}
          onMove={evt => setViewState(evt.viewState)}
        >
          <Marker
            longitude={viewState.longitude}
            latitude={viewState.latitude}
            anchor="bottom"
          >
            <View style={styles.markerContainer}>
              <View style={styles.marker} />
            </View>
          </Marker>
        </Map>
      </View>
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapContainer: {
    height: Dimensions.get('window').height * 0.7,
    width: '100%',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: 'white',
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
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    margin: 20,
  },
});
