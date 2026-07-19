# Configuração de Rastreador em Segundo Plano (Capacitor)

Este projeto foi arquitetado como uma aplicação web (PWA) e atualmente roda no navegador.
**Importante:** Navegadores web modernos (Chrome, Safari) *não garantem* a execução contínua de rastreamento de localização quando o aplicativo está em segundo plano, com a tela apagada ou bloqueada, por motivos de economia de bateria e privacidade.

A base de código web já foi otimizada para tentar manter a conexão ativa (usando a API de `WakeLock` e `watchPosition`), mas para atingir um **rastreamento nativo e ininterrupto**, preparamos o projeto para ser empacotado como um aplicativo híbrido usando o **Capacitor**.

## Como Compilar o App Híbrido com Rastreamento Nativo

As bibliotecas `@capacitor/core` e `@capacitor/geolocation` já foram instaladas e o arquivo `capacitor.config.ts` foi gerado.

1. **Adicionar as plataformas nativas:**
   ```bash
   npm install @capacitor/android @capacitor/ios
   npm run build
   npx cap add android
   npx cap add ios
   ```

2. **Configurar as permissões no Android (`android/app/src/main/AndroidManifest.xml`):**
   Adicione dentro da tag `<manifest>`:
   ```xml
   <!-- Permissões de Localização em Primeiro e Segundo Plano -->
   <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
   <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
   <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
   <uses-permission android:name="android.permission.WAKE_LOCK" />
   ```

3. **Configurar as permissões no iOS (`ios/App/App/Info.plist`):**
   Adicione:
   ```xml
   <key>NSLocationWhenInUseUsageDescription</key>
   <string>Precisamos da sua localização para rastrear o andamento das Ordens de Serviço.</string>
   <key>NSLocationAlwaysUsageDescription</key>
   <string>Rastreamento em segundo plano necessário para atualizar as OS em trânsito mesmo com a tela apagada.</string>
   <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
   <string>Necessário para precisão máxima na entrega.</string>
   <key>UIBackgroundModes</key>
   <array>
       <string>location</string>
   </array>
   ```

4. **Instalação do Plugin de Background Geolocation:**
   Para garantir que o sistema não encerre o processo do app, recomendamos instalar um plugin de background oficial:
   ```bash
   npm install @capacitor-community/background-geolocation
   npx cap sync
   ```
