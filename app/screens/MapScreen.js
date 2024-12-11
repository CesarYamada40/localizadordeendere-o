import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';

export default function MapScreen({ route, navigation }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(null);
  const [markerFixed, setMarkerFixed] = useState(false);

  const { address, cep, data, tipo } = route.params;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        console.log('Iniciando carregamento do mapa com dados:', {
          address,
          cep,
          tipo
        });
        
        // Solicitar permissão de localização
        let { status } = await Location.requestForegroundPermissionsAsync();
        console.log('Status da permissão de localização:', status);
        
        if (status !== 'granted') {
          console.error('Permissão de localização negada pelo usuário');
          setErrorMsg('Permissão de localização negada');
          setLoading(false);
          return;
        }

        // Obter localização atual
        let currentLocation = await Location.getCurrentPositionAsync({});
        console.log('Localização atual obtida:', {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude
        });
        setLocation(currentLocation);

        // Geocodificar o endereço
        console.log('Tentando geocodificar endereço:', address);
        let geocodedLocation;
        
        try {
          geocodedLocation = await Location.geocodeAsync(address);
          console.log('Resultado da geocodificação:', geocodedLocation);
          
          if (!geocodedLocation || geocodedLocation.length === 0) {
            throw new Error('Endereço não encontrado');
          }
          
        } catch (geocodeError) {
          console.error('Erro na primeira tentativa de geocodificação:', geocodeError);
          
          // Se falhar, tenta com o endereço simplificado
          const enderecoSimplificado = `${data.logradouro}, ${data.localidade}, ${data.uf}`;
          console.log('Tentando com endereço simplificado:', enderecoSimplificado);
          
          try {
            geocodedLocation = await Location.geocodeAsync(enderecoSimplificado);
            console.log('Resultado da geocodificação simplificada:', geocodedLocation);
            
            if (!geocodedLocation || geocodedLocation.length === 0) {
              throw new Error('Endereço simplificado não encontrado');
            }
          } catch (simplifiedGeocodeError) {
            console.error('Erro na segunda tentativa de geocodificação:', simplifiedGeocodeError);
            throw new Error('Não foi possível encontrar o endereço no mapa');
          }
        }

        const newRegion = {
          latitude: geocodedLocation[0].latitude,
          longitude: geocodedLocation[0].longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        
        console.log('Definindo nova região do mapa:', newRegion);
        setRegion(newRegion);
        setMarkerFixed(true);

      } catch (error) {
        console.error('Erro geral no carregamento do mapa:', error);
        console.error('Detalhes completos do erro:', {
          message: error.message,
          stack: error.stack
        });
        setErrorMsg(error.message || 'Erro ao carregar o mapa');
      } finally {
        setLoading(false);
      }
    })();
  }, [address, cep, data, tipo]);

  const toggleMarkerFixed = () => {
    setMarkerFixed(!markerFixed);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando mapa...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
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

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude
            }}
            title={data.logradouro}
            description={`${data.bairro}, ${data.localidade} - ${data.uf}`}
            draggable={!markerFixed}
            onDragEnd={(e) => {
              setRegion({
                ...region,
                latitude: e.nativeEvent.coordinate.latitude,
                longitude: e.nativeEvent.coordinate.longitude
              });
            }}
          />
        </MapView>
      )}
      <TouchableOpacity
        style={[
          styles.fixButton,
          markerFixed && styles.fixButtonActive
        ]}
        onPress={toggleMarkerFixed}
      >
        <MaterialIcons
          name={markerFixed ? "location-on" : "location-searching"}
          size={24}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  map: {
    flex: 1,
  },
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addressContainer: {
    marginBottom: 15,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  addressText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  fixButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  fixButtonActive: {
    backgroundColor: '#4CAF50',
  },
  fixButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  addressCard: {
    padding: 20,
    backgroundColor: 'white',
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
  addressDetail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});
