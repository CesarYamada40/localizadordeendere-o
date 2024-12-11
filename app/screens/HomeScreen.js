import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';

export default function HomeScreen({ navigation }) {
  const [cep, setCep] = useState('');

  const formatCEP = (text) => {
    // Remove tudo que não é número
    const numbers = text.replace(/[^\d]/g, '');
    // Formata o CEP (xxxxx-xxx)
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const buscarCEP = async () => {
    try {
      const cepLimpo = cep.replace(/\D/g, '');
      if (cepLimpo.length !== 8) {
        Alert.alert('Erro', 'Digite um CEP válido');
        return;
      }

      const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      if (response.data.erro) {
        Alert.alert('Erro', 'CEP não encontrado');
        return;
      }

      navigation.navigate('Map', {
        address: `${response.data.logradouro}, ${response.data.bairro}, ${response.data.localidade}, ${response.data.uf}`,
        cep: cepLimpo,
        data: response.data
      });
    } catch (error) {
      Alert.alert('Erro', 'Erro ao buscar CEP');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Localizador de Endereços</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o CEP (00000-000)"
            value={cep}
            onChangeText={(text) => setCep(formatCEP(text))}
            keyboardType="numeric"
            maxLength={9}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={buscarCEP}
          >
            <Text style={styles.buttonText}>Buscar Localização</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
