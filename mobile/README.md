# InfoÁgua Mobile 📱

Este diretório contém a aplicação móvel do **InfoÁgua**, desenvolvida utilizando **React Native** e **Expo**.

O aplicativo permite que cidadãos reportem a qualidade e a disponibilidade de água em suas regiões, visualizem alertas, comentem e acompanhem previsões do tempo locais.

---

## 🛠️ Pré-requisitos

Para rodar e testar o aplicativo móvel, você precisará de:
*   [Node.js](https://nodejs.org/) (versão LTS recomendada)
*   Para testar no celular físico: Instale o aplicativo **Expo Go** (disponível na [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) ou [Apple App Store](https://apps.apple.com/app/expo-go/id984021508)).
*   Para testar no computador: Emulador Android configurado (via Android Studio) ou Simulador iOS (disponível apenas no macOS via Xcode).

---

## ⚙️ Instalação e Inicialização

### 1. Instalar as dependências
```bash
npm install
```

### 2. Iniciar o servidor de desenvolvimento (Metro Bundler)
```bash
npm run start
```
ou usando o Expo CLI diretamente:
```bash
npx expo start
```

---

## 📲 Como testar o aplicativo

Após rodar o comando de inicialização, o terminal exibirá um **QR Code** e algumas opções. Escolha a melhor forma de visualizar o app:

*   **No celular físico (Expo Go):** Abra a câmera do seu celular (iOS) ou o aplicativo Expo Go (Android) e escaneie o QR Code mostrado no terminal. Certifique-se de que o computador e o celular estejam conectados na **mesma rede Wi-Fi**.
*   **No Emulador Android:** Com o emulador já aberto, pressione `a` no terminal onde o Metro Bundler está rodando.
*   **No Simulador iOS:** Pressione `i` no terminal para iniciar o app no simulador da Apple.
*   **No Navegador (Web):** Pressione `w` no terminal para abrir a versão experimental no navegador.

---

## 📁 Estrutura de Pastas

**WIP**