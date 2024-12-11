# GPS Tracker Mobile App

Um aplicativo móvel para buscar endereços por CEP e visualizar suas localizações no mapa.

## Funcionalidades

- Busca de endereços por CEP usando a API ViaCEP
- Visualização do endereço no mapa usando react-native-maps
- Interface adaptativa para web e mobile
- Suporte a geolocalização
- Design responsivo e moderno

## Tecnologias Utilizadas

- React Native
- Expo
- React Navigation
- React Native Maps
- Mapbox API para geocoding
- Axios para requisições HTTP

## Como Executar

1. Clone o repositório:
   ```bash
   git clone [seu-repositorio]
   cd gps-tracker-mobile
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione sua chave do Mapbox:
     ```
     MAPBOX_API_KEY=sua_chave_aqui
     ```

4. Execute o projeto:
   ```bash
   npx expo start
   ```

5. Para executar no dispositivo:
   - Escaneie o QR code com o app Expo Go (Android/iOS)
   - Ou pressione 'a' para abrir no emulador Android
   - Ou pressione 'i' para abrir no simulador iOS

## Versão Web

A versão web do aplicativo está disponível, mas com funcionalidade limitada:
- Visualização dos dados do endereço
- Interface adaptada para navegadores
- Sem suporte para visualização do mapa (exclusivo para mobile)

## Estrutura do Projeto

```
gps-tracker-mobile/
├── app/
│   ├── screens/
│   │   ├── HomeScreen.js    # Tela inicial com busca de CEP
│   │   ├── MapScreen.js     # Visualização do mapa (mobile)
│   │   └── MapScreen.web.js # Versão web da tela de mapa
├── App.js                   # Configuração principal do app
└── package.json            # Dependências e scripts

## Contribuindo

Sinta-se à vontade para contribuir com o projeto. Abra uma issue ou envie um pull request.
