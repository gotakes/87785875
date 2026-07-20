# Arquitetura de Rastreamento em Tempo Real (Segundo Plano)

Como Engenheiro de Software Sênior, preparei a arquitetura definitiva para o rastreamento ininterrupto da sua frota. Como o nosso projeto web (PWA) utiliza React, a abordagem ideal para ter **acesso nativo irrestrito** ao dispositivo é encapsulá-lo utilizando **Capacitor** ou **React Native**.

Abaixo detalho a implementação nativa (Android - Kotlin) para um **Foreground Service**, que é a única forma garantida pelo Android de manter o GPS ativo a cada 2 segundos quando o app é minimizado ou a tela é bloqueada. 

Para a sua base atual, você pode utilizar o plugin `@capacitor-community/background-geolocation` que implementa essa exata arquitetura nativa por baixo dos panos.

---

## 1. Permissões Necessárias (AndroidManifest.xml)

Para que o Android permita o uso do GPS em segundo plano e a criação de um serviço persistente, você precisa destas permissões:

```xml
<!-- Permissões de Localização -->
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<!-- Necessário para Android 10+ (API 29+) para rastrear com o app fechado -->
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

<!-- Permissão para manter o serviço vivo na notificação -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" /> <!-- Android 14+ -->

<!-- Permissões de energia e inicialização -->
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
```

---

## 2. Implementação do Foreground Service (Kotlin)

O `Foreground Service` cria uma notificação inamovível, informando ao sistema operacional: *"Não mate este processo, o usuário sabe que ele está rodando"*.

### `LocationTrackingService.kt`
```kotlin
package com.elnathan.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*

class LocationTrackingService : Service() {

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback

    companion object {
        const val CHANNEL_ID = "TrackingChannel"
        const val NOTIFICATION_ID = 123
    }

    override fun onCreate() {
        super.onCreate()
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Inicia o serviço em primeiro plano com notificação
        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Rastreamento Ativo")
            .setContentText("Enviando localização em tempo real...")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()

        startForeground(NOTIFICATION_ID, notification)
        startLocationUpdates()

        // START_STICKY reinicia o serviço automaticamente se for morto por falta de RAM
        return START_STICKY 
    }

    private fun startLocationUpdates() {
        // Configuração FusedLocationProviderClient (A cada 2s, Alta Precisão)
        val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 2000L)
            .setMinUpdateIntervalMillis(2000L) // 2 segundos
            .setMaxUpdateDelayMillis(2000L)
            .build()

        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                for (location in locationResult.locations) {
                    // Enviar para o servidor (WebSocket/MQTT ou Firestore)
                    val lat = location.latitude
                    val lng = location.longitude
                    val speed = location.speed // Velocidade
                    
                    // Exemplo: sendMessageViaWebSocket(lat, lng, speed)
                }
            }
        }

        try {
            fusedLocationClient.requestLocationUpdates(
                locationRequest,
                locationCallback,
                Looper.getMainLooper()
            )
        } catch (unlikely: SecurityException) {
            // Tratar falta de permissão
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        fusedLocationClient.removeLocationUpdates(locationCallback)
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
```

---

## 3. Gestão de Bateria e Otimizações (Dica de Ouro)

O maior vilão do rastreio de 2 segundos são os fabricantes (Xiaomi, Samsung, Motorola) matando serviços de GPS agressivamente. Para contornar:

1. **Ação do Usuário (Obrigatório):** Você deve direcionar o usuário para a tela de configurações do Android solicitando ignorar as otimizações de bateria.
2. Código para abrir a tela de bateria do Android:
```kotlin
val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
    data = Uri.parse("package:$packageName")
}
startActivity(intent)
```

---

## 4. Resiliência e Reconexão (WebSocket/MQTT vs Firebase)

Atualmente estamos usando Firebase Firestore via chamadas `setDoc` ou `updateDoc`. O SDK do Firebase é excelente pois:
- Tem **suporte a cache local (Offline Persistence)**. Se o motorista entra num túnel e perde o sinal, o Firebase salva as localizações no banco de dados local do celular e as "descarrega" no servidor assim que o 4G volta. 
- Usa **WebSockets** por baixo dos panos, o que significa que as atualizações a cada 2s não abrem uma nova requisição HTTP, economizando muita bateria.

Se decidir migrar para um WebSocket puro (ex: Socket.io) ou MQTT no futuro:
- **Lógica de reconexão automática:**
```javascript
let socket = new WebSocket("wss://seuservidor.com");

function connect() {
  socket = new WebSocket("wss://seuservidor.com");
  socket.onclose = (e) => {
    console.log("Conexão caiu. Reconectando em 1 segundo...");
    setTimeout(function() { connect(); }, 1000);
  };
  socket.onerror = (err) => {
    socket.close();
  };
}
```
Para garantir que as posições não se percam, deve-se criar uma "fila" (Array/SQLite) em memória. O que falhar no envio, é adicionado à fila e enviado como lote (`batch`) na reconexão.
