# InfoÁgua Mobile 📱

Este diretório contém a aplicação móvel do **InfoÁgua**, desenvolvida utilizando **React Native** e **Expo** (fluxo nativo com `expo-dev-client`).

O aplicativo permite que cidadãos reportem a qualidade e a disponibilidade de água em suas regiões, visualizem alertas, comentem e acompanhem ocorrências locais.

---

## 🛠️ Pré-requisitos

Para compilar e rodar o app nativamente, você precisará de:

- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- [Expo CLI](https://docs.expo.dev/more/expo-cli/) — `npm install -g expo-cli` (ou use via `npx`)
- **Android:** [Android Studio](https://developer.android.com/studio) com o SDK e um emulador/dispositivo configurados
- **iOS (macOS apenas):** [Xcode](https://developer.apple.com/xcode/) com os Command Line Tools instalados e um simulador ou dispositivo físico conectado

> **Nota:** Este projeto usa `expo-dev-client` e **não** é compatível com o aplicativo Expo Go. É necessário o build nativo completo.

---

## ⚙️ Instalação e Inicialização

### 1. Instalar as dependências
```bash
npm install
```

### 2. Gerar os projetos nativos (Android/iOS)

Necessário na primeira vez ou após alterar plugins nativos:
```bash
npx expo prebuild
```

### 3. Compilar e iniciar o app

**Android (emulador ou dispositivo físico via USB):**
```bash
npm run android
# equivalente a: npx expo run:android
```

**iOS (apenas macOS — simulador ou dispositivo físico):**
```bash
npm run ios
# equivalente a: npx expo run:ios
```

**Web (experimental):**
```bash
npm run web
# equivalente a: npx expo start --web
```

---

## 🌐 Configuração da URL da API

O cliente HTTP resolve automaticamente o endereço do backend por plataforma:

| Plataforma | URL padrão |
|---|---|
| Emulador Android | `http://10.0.2.2:3000/v1` |
| Simulador iOS / Web | `http://localhost:3000/v1` |
| Dispositivo físico / CI | `EXPO_PUBLIC_API_URL` (variável de ambiente) |

Para dispositivos físicos ou ambientes de CI, crie um arquivo `.env` na raiz do projeto `mobile/`:
```env
EXPO_PUBLIC_API_URL=http://<ip-do-servidor>:3000/v1
```

---

## 📁 Estrutura de Pastas

**WIP**