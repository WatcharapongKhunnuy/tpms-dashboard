#include <WiFi.h>
#include <ArduinoWebsockets.h>

using namespace websockets;

WebsocketsClient client;

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* websocket_server = "wss://tpms-dashboard.onrender.com";

void setup() {
    Serial.begin(115200);
    
    // Connect to WiFi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connected");

    // Connect to WebSocket server
    client.connect(websocket_server);
    
    client.onMessage([](WebsocketsMessage message) {
        Serial.print("Got Message: ");
        Serial.println(message.data());
    });
}

void loop() {
    if (client.available()) {
        client.poll();
        
        // Example: Sending simulated data every 5 seconds
        // Replace this with your actual BLE TPMS data
        String json = "{\"type\":\"update\",\"data\":{";
        json += "\"fl\":{\"pressure\":32.5,\"temp\":35,\"status\":\"ok\"},";
        json += "\"fr\":{\"pressure\":32.1,\"temp\":36,\"status\":\"ok\"},";
        json += "\"rl\":{\"pressure\":30.8,\"temp\":34,\"status\":\"ok\"},";
        json += "\"rr\":{\"pressure\":31.2,\"temp\":35,\"status\":\"ok\"}";
        json += "}}";

        client.send(json);
        Serial.println("Data sent: " + json);
        
        delay(5000);
    } else {
        Serial.println("WebSocket disconnected. Retrying...");
        client.connect(websocket_server);
        delay(2000);
    }
}
