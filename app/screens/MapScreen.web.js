import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

const MapScreen = ({ route }) => {
  const { address, data } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.webMessage}>
        <Text style={styles.title}>Visualização Web Indisponível</Text>
        <Text style={styles.subtitle}>Por favor, use o aplicativo móvel para visualizar o mapa.</Text>
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  webMessage: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  addressCard: {
    backgroundColor: 'white',
    padding: 15,
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
});

export default MapScreen;
