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
  Modal,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const estados = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
];

export default function HomeScreen({ navigation }) {
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [estado, setEstado] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [resultados, setResultados] = useState([]);
  const [buscarPorCep, setBuscarPorCep] = useState(true);

  const buscarEndereco = async () => {
    if (buscarPorCep) {
      if (!cep || cep.length !== 8) {
        Alert.alert('Atenção', 'Digite um CEP válido com 8 números');
        return;
      }
      buscarPorCEP();
    } else {
      if (!estado) {
        Alert.alert('Atenção', 'Selecione um estado');
        return;
      }
      if (!endereco || endereco.trim().length < 3) {
        Alert.alert('Atenção', 'Digite pelo menos 3 caracteres do endereço');
        return;
      }
      buscarPorLogradouro();
    }
  };

  const buscarPorCEP = async () => {
    setBuscando(true);
    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (response.data.erro) {
        Alert.alert('Endereço não encontrado', 'O CEP informado não existe.');
        return;
      }
      setResultados([response.data]);
      setModalVisible(true);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível buscar o CEP. Tente novamente.');
    } finally {
      setBuscando(false);
    }
  };

  const buscarPorLogradouro = async () => {
    setBuscando(true);
    try {
      const enderecoFormatado = endereco
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

      // Primeiro tenta buscar diretamente na capital do estado
      const estadoSelecionado = estados.find(e => e.sigla === estado);
      const capital = getCapitalDoEstado(estado);
      
      try {
        const url = `https://viacep.com.br/ws/${estado}/${capital}/${enderecoFormatado}/json/`;
        const response = await axios.get(url, { timeout: 5000 });
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          setResultados(response.data);
          setModalVisible(true);
          return;
        }
      } catch (error) {
        console.log('Erro ao buscar na capital:', error.message);
      }

      // Se não encontrou na capital, tenta em algumas cidades principais
      const cidadesPrincipais = getCidadesPrincipais(estado);
      let todosResultados = [];

      for (const cidade of cidadesPrincipais) {
        try {
          const url = `https://viacep.com.br/ws/${estado}/${cidade}/${enderecoFormatado}/json/`;
          const response = await axios.get(url, { timeout: 5000 });
          
          if (Array.isArray(response.data) && response.data.length > 0) {
            todosResultados = [...todosResultados, ...response.data];
          }
        } catch (error) {
          console.log('Erro ao buscar em:', cidade, error.message);
        }
      }

      if (todosResultados.length === 0) {
        // Se não encontrou resultados, sugere tentar com outro formato
        const sugestoes = [
          enderecoFormatado.startsWith('rua') ? enderecoFormatado : `rua ${enderecoFormatado}`,
          enderecoFormatado.startsWith('avenida') ? enderecoFormatado : `avenida ${enderecoFormatado}`,
          enderecoFormatado.startsWith('av') ? enderecoFormatado : `av ${enderecoFormatado}`
        ];

        for (const sugestao of sugestoes) {
          try {
            const url = `https://viacep.com.br/ws/${estado}/${capital}/${sugestao}/json/`;
            const response = await axios.get(url, { timeout: 5000 });
            
            if (Array.isArray(response.data) && response.data.length > 0) {
              todosResultados = [...todosResultados, ...response.data];
              break;
            }
          } catch (error) {
            console.log('Erro ao buscar sugestão:', error.message);
          }
        }
      }

      if (todosResultados.length === 0) {
        Alert.alert(
          'Nenhum resultado encontrado',
          'Tente:\n- Verificar o nome da rua\n- Adicionar "Rua" ou "Avenida"\n- Selecionar outro estado'
        );
        return;
      }

      // Remove duplicados
      const uniqueResults = todosResultados.filter((item, index, self) =>
        index === self.findIndex((t) => (
          t.cep === item.cep && t.logradouro === item.logradouro
        ))
      );

      setResultados(uniqueResults);
      setModalVisible(true);
    } catch (error) {
      console.error('Erro na busca:', error);
      Alert.alert(
        'Erro na busca',
        'Verifique sua conexão com a internet e tente novamente.'
      );
    } finally {
      setBuscando(false);
    }
  };

  const getCapitalDoEstado = (uf) => {
    const capitais = {
      'AC': 'Rio Branco',
      'AL': 'Maceio',
      'AP': 'Macapa',
      'AM': 'Manaus',
      'BA': 'Salvador',
      'CE': 'Fortaleza',
      'DF': 'Brasilia',
      'ES': 'Vitoria',
      'GO': 'Goiania',
      'MA': 'Sao Luis',
      'MT': 'Cuiaba',
      'MS': 'Campo Grande',
      'MG': 'Belo Horizonte',
      'PA': 'Belem',
      'PB': 'Joao Pessoa',
      'PR': 'Curitiba',
      'PE': 'Recife',
      'PI': 'Teresina',
      'RJ': 'Rio de Janeiro',
      'RN': 'Natal',
      'RS': 'Porto Alegre',
      'RO': 'Porto Velho',
      'RR': 'Boa Vista',
      'SC': 'Florianopolis',
      'SP': 'Sao Paulo',
      'SE': 'Aracaju',
      'TO': 'Palmas'
    };
    return capitais[uf] || '';
  };

  const getCidadesPrincipais = (uf) => {
    const cidades = {
      'SP': ['Sao Paulo', 'Campinas', 'Santos', 'Guarulhos', 'Osasco'],
      'RJ': ['Rio de Janeiro', 'Niteroi', 'Sao Goncalo', 'Duque de Caxias'],
      'MG': ['Belo Horizonte', 'Uberlandia', 'Contagem', 'Juiz de Fora'],
      // Adicione mais cidades para outros estados conforme necessário
    };
    return cidades[uf] || [getCapitalDoEstado(uf)];
  };

  const selecionarEndereco = (endereco) => {
    setModalVisible(false);
    navigation.navigate('Map', {
      address: `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade}, ${endereco.uf}`,
      data: endereco,
      tipo: 'endereco'
    });
  };

  return (
    <LinearGradient
      colors={['#1e3c72', '#2a5298']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <MaterialIcons name="location-on" size={40} color="#1e3c72" />
              <Text style={styles.title}>GPS Tracker</Text>
              <Text style={styles.subtitle}>Encontre qualquer endereço</Text>
            </View>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, buscarPorCep && styles.activeTab]}
                onPress={() => setBuscarPorCep(true)}
              >
                <MaterialIcons 
                  name="pin-drop" 
                  size={24} 
                  color={buscarPorCep ? '#1e3c72' : '#666'} 
                />
                <Text style={[styles.tabText, buscarPorCep && styles.activeTabText]}>
                  CEP
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !buscarPorCep && styles.activeTab]}
                onPress={() => setBuscarPorCep(false)}
              >
                <MaterialIcons 
                  name="search" 
                  size={24} 
                  color={!buscarPorCep ? '#1e3c72' : '#666'} 
                />
                <Text style={[styles.tabText, !buscarPorCep && styles.activeTabText]}>
                  Endereço
                </Text>
              </TouchableOpacity>
            </View>

            {buscarPorCep ? (
              <View style={styles.inputContainer}>
                <MaterialIcons name="location-on" size={24} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Digite o CEP (apenas números)"
                  value={cep}
                  onChangeText={text => setCep(text.replace(/\D/g, ''))}
                  keyboardType="numeric"
                  maxLength={8}
                  placeholderTextColor="#999"
                />
              </View>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="map" size={24} color="#666" style={styles.inputIcon} />
                  <Picker
                    selectedValue={estado}
                    onValueChange={value => setEstado(value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Selecione o estado" value="" />
                    {estados.map(estado => (
                      <Picker.Item 
                        key={estado.sigla} 
                        label={estado.nome} 
                        value={estado.sigla}
                      />
                    ))}
                  </Picker>
                </View>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="location-city" size={24} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Digite o nome da rua"
                    value={endereco}
                    onChangeText={setEndereco}
                    placeholderTextColor="#999"
                  />
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.searchButton}
              onPress={buscarEndereco}
              disabled={buscando}
            >
              {buscando ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialIcons name="search" size={24} color="#fff" />
                  <Text style={styles.searchButtonText}>Buscar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {resultados.length} {resultados.length === 1 ? 'endereço encontrado' : 'endereços encontrados'}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={resultados}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.enderecoItem}
                    onPress={() => selecionarEndereco(item)}
                  >
                    <View style={styles.enderecoIcon}>
                      <MaterialIcons name="location-on" size={24} color="#1e3c72" />
                    </View>
                    <View style={styles.enderecoInfo}>
                      <Text style={styles.enderecoText}>
                        {item.logradouro}
                      </Text>
                      <Text style={styles.bairroText}>
                        {item.bairro}
                      </Text>
                      <Text style={styles.cidadeText}>
                        {item.localidade}/{item.uf}
                      </Text>
                      <Text style={styles.cepText}>CEP: {item.cep}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color="#ccc" />
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3c72',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    marginBottom: 20,
    padding: 5,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#1e3c72',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  picker: {
    flex: 1,
    height: 50,
  },
  searchButton: {
    backgroundColor: '#1e3c72',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  enderecoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  enderecoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  enderecoInfo: {
    flex: 1,
  },
  enderecoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  bairroText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  cidadeText: {
    fontSize: 14,
    color: '#666',
  },
  cepText: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
});
