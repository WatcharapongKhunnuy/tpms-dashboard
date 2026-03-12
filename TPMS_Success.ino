#include <U8g2lib.h>
#include <Wire.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>
#include <WiFi.h>
#include <ArduinoWebsockets.h>

using namespace websockets;

WebsocketsClient client;

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";
const char* websocket_server = "wss://tpms-dashboard.onrender.com";

// =======================
// --- Fonts & Display ---
// =======================
#define FONT_MAIN u8g2_font_7x13B_tf
#define FONT_SCND u8g2_font_5x8_tf 

// --- OLED 128x64 I2C setup ---
U8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0, /* reset=*/ U8X8_PIN_NONE);

// =======================
// --- BLE Settings ------
// =======================
int scanTime = 1;  // seconds
BLEScan *pBLEScan;

// =======================
// --- Buzzer ------------
// =======================
#define BUZZER_PIN 13
const int beepDuration = 150;  // ms
const int beepPause = 150;     // ms// โมดูล low-level trigger: idle = HIGH, active = LOW
// เราจะใช้ digitalWrite(Low/High) เพื่อ trigger ระยะเวลาตาม beepDuration

// =======================
// --- Calibration -------
// =======================
#define PRESSURE_SLOPE 1.05
#define PRESSURE_OFFSET -0.5
#define ATM_PRESSURE 14.7

// =======================
// --- 7-segment display ---
// =======================
const int segLen = 8;
const int segThick = 2;
const int digitWidth = segLen + segThick + 2;
const int digitHeight = segLen * 2 + segThick + 3;

// =======================
// --- TPMS Wheel struct --
// =======================
struct TPMSWheel {
    String name;
    float psi;
    int temp;
    bool psiAlert;          // เงื่อนไข alert (true = ต้องกระพริบ)
    bool psiBlinkState;     // สถานะกระพริบ (true/false) ที่ใช้วาด
    bool tempAlert;         // เงื่อนไข temp alert
    bool tempBlinkState;    // สถานะกระพริบ temp
    unsigned long lastToggle;  // เวลา toggle ครั้งล่าสุด
    bool buzzerOn;
};

// --- TPMS Wheels ---
TPMSWheel frontLeft  = {"FL", 0, 0, false, false, false, false, 0, false};
TPMSWheel frontRight = {"FR", 0, 0, false, false, false, false, 0, false};
TPMSWheel rearLeft   = {"RL", 0, 0, false, false, false, false, 0, false};
TPMSWheel rearRight  = {"RR", 0, 0, false, false, false, false, 0, false};

// =======================
// --- Draw Functions ----
// =======================

// (drawCarIcon / drawSegmentDigit / drawSegmentNumber / drawSegmentNumberRightAlign
//  ยังคงเหมือนเดิม — ผมไม่เปลี่ยนตราบใดที่ฟังก์ชันเดิมทำงานถูก)

// --- ฟังก์ชันวาดรูปรถยนต์แทน Bitmap ---
void drawCarIcon(int offsetX, int offsetY) {
    // (คัดลอกส่วนเดิมของคุณมาที่นี่ — ไม่เปลี่ยน)
    u8g2.drawBox(offsetX + 53, offsetY + 12, 22, 39);
    u8g2.drawBox(offsetX + 54, offsetY + 11, 20, 2);
    u8g2.drawFrame(offsetX + 57, offsetY + 9, 14, 1);
    u8g2.drawBox(offsetX + 55, offsetY + 10, 18, 2);
    u8g2.setDrawColor(0);
    u8g2.drawBox(offsetX + 59, offsetY + 11, 10, 2);
    u8g2.drawBox(offsetX + 58, offsetY + 12, 12, 2);
    u8g2.drawBox(offsetX + 55, offsetY + 12, 2, 3);
    u8g2.drawBox(offsetX + 72, offsetY + 13, 2, 3);
    u8g2.setDrawColor(1);
    u8g2.drawBox(offsetX + 54, offsetY + 12, 2, 3);
    u8g2.drawBox(offsetX + 50, offsetY + 25, 4, 2);
    u8g2.drawBox(offsetX + 53, offsetY + 25, 2, 2);
    u8g2.drawBox(offsetX + 74, offsetY + 25, 4, 2);
    u8g2.drawBox(offsetX + 74, offsetY + 24, 3, 2);
    u8g2.setDrawColor(0);
    u8g2.drawBox(offsetX + 58, offsetY + 27, 12, 2);
    u8g2.drawBox(offsetX + 57, offsetY + 26, 14, 2);
    u8g2.drawBox(offsetX + 57, offsetY + 25, 14, 3);
    u8g2.drawBox(offsetX + 56, offsetY + 22, 16, 4);
    u8g2.drawBox(offsetX + 56, offsetY + 21, 16, 2);
    u8g2.drawBox(offsetX + 58, offsetY + 20, 12, 2);
    u8g2.drawBox(offsetX + 71, offsetY + 12, 2, 3);
    u8g2.drawBox(offsetX + 54, offsetY + 13, 2, 3);
    u8g2.setDrawColor(1);
    u8g2.drawBox(offsetX + 51, offsetY + 24, 4, 2);
    u8g2.setDrawColor(0);
    u8g2.drawBox(offsetX + 56, offsetY + 43, 16, 4);
    u8g2.setDrawColor(1);
    u8g2.drawBox(offsetX + 58, offsetY + 13, 12, 2);
    u8g2.drawBox(offsetX + 72, offsetY + 11, 2, 2);
    u8g2.drawFrame(offsetX + 69, offsetY + 9, 1, 1);
    u8g2.setDrawColor(0);
    u8g2.drawBox(offsetX + 55, offsetY + 29, 2, 12);
    u8g2.drawBox(offsetX + 55, offsetY + 22, 18, 2);
    u8g2.setDrawColor(1);
    u8g2.drawBox(offsetX + 56, offsetY + 29, 2, 2);
    u8g2.setDrawColor(0);
    u8g2.drawBox(offsetX + 71, offsetY + 29, 2, 12);
    u8g2.setDrawColor(1);
    u8g2.drawBox(offsetX + 70, offsetY + 29, 2, 2);
    u8g2.setDrawColor(0);
    u8g2.drawBox(offsetX + 58, offsetY + 41, 2, 2);
    u8g2.drawBox(offsetX + 68, offsetY + 41, 2, 2);
    u8g2.drawBox(offsetX + 57, offsetY + 42, 14, 2);
    u8g2.drawBox(offsetX + 58, offsetY + 46, 12, 2);
    u8g2.setDrawColor(1);
    u8g2.drawBox(offsetX + 54, offsetY + 51, 20, 2);
    u8g2.drawBox(offsetX + 56, offsetY + 52, 16, 2);
    u8g2.drawBox(offsetX + 56, offsetY + 40, 2, 2);
    u8g2.drawBox(offsetX + 70, offsetY + 40, 2, 2);
}

// --- วาดตัวเลขแบบ 7-segment ---
void drawSegmentDigit(int x, int y, int digit) {
    const bool segments[10][7] = {
        {1,1,1,1,1,1,0}, // 0
        {0,1,1,0,0,0,0}, // 1
        {1,1,0,1,1,0,1}, // 2
        {1,1,1,1,0,0,1}, // 3
        {0,1,1,0,0,1,1}, // 4
        {1,0,1,1,0,1,1}, // 5
        {1,0,1,1,1,1,1}, // 6
        {1,1,1,0,0,0,0}, // 7
        {1,1,1,1,1,1,1}, // 8
        {1,1,1,1,0,1,1}  // 9
    };
    if (digit < 0 || digit > 9) return;
    if (segments[digit][0]) u8g2.drawBox(x + 1, y, segLen, segThick);
    if (segments[digit][1]) u8g2.drawBox(x + segLen + 1, y + 1, segThick, segLen);
    if (segments[digit][2]) u8g2.drawBox(x + segLen + 1, y + segLen + 2, segThick, segLen);
    if (segments[digit][3]) u8g2.drawBox(x + 1, y + 2*segLen + 2, segLen, segThick);
    if (segments[digit][4]) u8g2.drawBox(x, y + segLen + 2, segThick, segLen);
    if (segments[digit][5]) u8g2.drawBox(x, y + 1, segThick, segLen);
    if (segments[digit][6]) u8g2.drawBox(x + 1, y + segLen + 1, segLen, segThick);
}

// --- วาดตัวเลข 7-segment float ---
void drawSegmentNumber(int x, int y, float value) {
    char buf[8];
    dtostrf(value, 4, 1, buf);
    int cursorX = x;
    for (int i = 0; buf[i] != '\0'; i++) {
        if (buf[i] == '.') {
            u8g2.drawBox(cursorX + 4, y + digitHeight - 3, 2, 2);
            cursorX += digitWidth / 2;
        } else if (buf[i] >= '0' && buf[i] <= '9') {
            drawSegmentDigit(cursorX, y, buf[i] - '0');
            cursorX += digitWidth;
        }
    }
}

void drawSegmentNumberRightAlign(int rightX, int y, float value) {
    char buf[8];
    dtostrf(value, 4, 1, buf);
    int digitCount = 0, dotCount = 0;
    for (int i = 0; buf[i] != '\0'; i++) {
        if (buf[i] >= '0' && buf[i] <= '9') digitCount++;
        else if (buf[i] == '.') dotCount++;
    }
    int totalWidth = digitCount * digitWidth + dotCount * (digitWidth / 2);
    int cursorX = rightX - totalWidth;
    for (int i = 0; buf[i] != '\0'; i++) {
        if (buf[i] == '.') {
            u8g2.drawBox(cursorX + 4, y + digitHeight - 3, 2, 2);
            cursorX += digitWidth / 2;
        } else if (buf[i] >= '0' && buf[i] <= '9') {
            drawSegmentDigit(cursorX, y, buf[i] - '0');
            cursorX += digitWidth;
        }
    }
}

// =======================
// --- BLE Callback ------
// =======================
class MyAdvertisedDeviceCallbacks : public BLEAdvertisedDeviceCallbacks {
    void onResult(BLEAdvertisedDevice advertisedDevice) {
        if (advertisedDevice.haveName() && advertisedDevice.getName() == "BR") {
            int rssi = advertisedDevice.getRSSI();
            if (rssi < -80) {
                return;
            }
            String addr = advertisedDevice.getAddress().toString();
            if (advertisedDevice.haveManufacturerData()) {
                String strManufacturerData = advertisedDevice.getManufacturerData();
                uint8_t cManufacturerData[255];
                size_t dataLength = strManufacturerData.length();
                memcpy(cManufacturerData, strManufacturerData.c_str(), dataLength);

                int temperature = cManufacturerData[2];
                float rawPressure = ((uint16_t)cManufacturerData[3] << 8 | cManufacturerData[4]) / 10.0;
                float gaugePressure = rawPressure - ATM_PRESSURE;
                if (gaugePressure < 0) gaugePressure = 0;
                float calibratedPressure = (gaugePressure * PRESSURE_SLOPE) + PRESSURE_OFFSET;
                if (calibratedPressure < 0) calibratedPressure = 0;

                TPMSWheel* target = nullptr;
                if (addr == "4b:ac:00:00:8e:6a") target = &frontLeft;
                else if (addr == "4b:a3:00:00:f9:03") target = &frontRight;
                else if (addr == "4b:aa:00:00:9f:2b") target = &rearLeft;
                else if (addr == "4b:a4:00:00:b4:60") target = &rearRight;

                if (target != nullptr) {
                    target->psi = calibratedPressure;
                    target->temp = temperature;
                    bool alertCondition = false;
                    if (calibratedPressure >= 43.5) alertCondition = true;
                    if (calibratedPressure <= 29) alertCondition = true;
                    if (temperature >= 68) alertCondition = true;
                    target->buzzerOn = alertCondition;
                }
            }
        }
    }
};

// =======================
// --- Alert functions ---
// =======================
int getAlertLevel(TPMSWheel* wheels[4]) {
    int maxLevel = 0;
    for(int i = 0; i < 4; i++){
        TPMSWheel* w = wheels[i];
        int level = 0;
        // ตรวจสอบ PSI
        if(w->psi >= 43.5) level = 2;     // Type2 → 2 beep
        else if(w->psi <= 29 && w->psi > 0) level = 2;  // Type1 → 1 beep
        // ตรวจสอบ Temperature
        if(w->temp >= 68) level = max(level, 3); // Temp สูง → Medium (3 beep)
        if(level > maxLevel) maxLevel = level;
    }
    return maxLevel;
}

struct BuzzerState {
  int level;                // 0 = off, 1 = type1, 2 = type2, 3 = type3
  int remainingBeep;        // จำนวน beep ที่เหลือ
  unsigned long lastMillis; // เวลาเปลี่ยนสถานะล่าสุด
  bool active;              // กำลัง beep อยู่หรือไม่
};


BuzzerState buzzer = {0, 0, 0, false};
const int beepCount[4] = {0, 1, 2, 3}; // จำนวน beep ต่อ level

void startBuzzer(int level) {
  if (level <= 0) return;
  buzzer.level = level;
  buzzer.remainingBeep = beepCount[level];
  buzzer.active = false;
  buzzer.lastMillis = 0;
}

void updateBuzzer() {
    unsigned long now = millis();
    if (buzzer.level == 0) return;

    int duration = beepDuration;
    int pause    = beepPause;

    // ถ้ามี beep มากกว่า 1 ครั้ง ให้ดังเร็วขึ้น
    if (buzzer.remainingBeep > 1){
        duration = 80; // ปิ๊บสั้นลง
        pause    = 80; // หยุดสั้นลง
    }

    if (!buzzer.active && buzzer.remainingBeep > 0) {
        tone(BUZZER_PIN, 2000);
        buzzer.active = true;
        buzzer.lastMillis = now;
    } else if (buzzer.active && (now - buzzer.lastMillis >= duration)) {
        noTone(BUZZER_PIN);
        buzzer.active = false;
        buzzer.remainingBeep--;
        buzzer.lastMillis = now;
    } else if (!buzzer.active && buzzer.remainingBeep == 0 && (now - buzzer.lastMillis >= pause)) {
        buzzer.level = 0;
    }
}

// =======================
// --- Display TPMS ------
// =======================
const unsigned long blinkInterval = 500; // 0.5 วินาที

void updateBlinkState() {
    unsigned long currentMillis = millis();
    TPMSWheel* wheels[4] = { &frontLeft, &frontRight, &rearLeft, &rearRight };
    for(int i=0; i<4; i++){
        TPMSWheel* w = wheels[i];
        // กำหนดเงื่อนไข alert
        w->psiAlert  = (w->psi < 29 && w->psi > 0) || (w->psi > 43.5);
        w->tempAlert = (w->temp >= 68);

        // toggle blink state independently ถ้ามี alert เท่านั้น
        if(currentMillis - w->lastToggle >= blinkInterval){
            if(w->psiAlert)  w->psiBlinkState  = !w->psiBlinkState;
            else w->psiBlinkState = false; // ถ้าไม่ alert ให้ปิดการกระพริบ
            if(w->tempAlert) w->tempBlinkState = !w->tempBlinkState;
            else w->tempBlinkState = false;
            w->lastToggle = currentMillis;
        }
    }
}

void displayTPMS() {
    unsigned long currentMillis = millis();
    int psiX[4]   = {0, 80, 0, 80};
    int psiY[4]   = {0, 0, 32, 32};
    int tempX[4]  = {0, 100, 0, 100};
    int tempY[4]  = {30, 30, 62, 62};
    
    TPMSWheel* wheels[4] = { &frontLeft, &frontRight, &rearLeft, &rearRight };

    u8g2.clearBuffer();
    u8g2.setFont(FONT_SCND);
    u8g2.setCursor(54, 7);
    u8g2.print("TPMS");
    u8g2.setCursor(49, 64);
    u8g2.print("CK-032");

    drawCarIcon(0, 0);

    for (int i = 0; i < 4; i++) {
        TPMSWheel* w = wheels[i];
        // PSI
        bool drawPsi = true;
        if(w->psiAlert) {
            drawPsi = w->psiBlinkState; // วาดเมื่อ state ของ blink = true
        }
        if(drawPsi){
            if (i == 1 || i == 3) drawSegmentNumberRightAlign(128, psiY[i], w->psi);
            else drawSegmentNumber(psiX[i], psiY[i], w->psi);
        }
        // Temp
        u8g2.setFont(FONT_MAIN);
        bool drawTemp = true;
        if(w->tempAlert) drawTemp = w->tempBlinkState;
        if(drawTemp){
            // ป้องกันวาดเกินขอบ Y (display สูงสุด 64)
            int drawY = tempY[i];
            // if(drawY > 60) drawY = 60;
            u8g2.setCursor(tempX[i], drawY);
            u8g2.print(w->temp);
            u8g2.print("\xB0");
            u8g2.print("c");
        }
    }
    u8g2.sendBuffer();
}

// =======================
// --- Setup ------------
// =======================
void setup() {
    Serial.begin(115200);
    
    pinMode(BUZZER_PIN, OUTPUT);
    noTone(BUZZER_PIN); // idle
    
    u8g2.begin();
    u8g2.clearBuffer();
    u8g2.setFont(u8g2_font_6x10_tr);
    u8g2.sendBuffer();

    // WiFi Connection
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connected");

    // WebSocket Connection
    client.connect(websocket_server);
    client.onMessage([](WebsocketsMessage message) {
        Serial.print("Got Message: ");
        Serial.println(message.data());
    });

    BLEDevice::init("");
    pBLEScan = BLEDevice::getScan();
    pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
    pBLEScan->setActiveScan(true);
    pBLEScan->setInterval(100);
    pBLEScan->setWindow(99);
}

// =======================
// --- Loop --------------
// =======================
void loop() {
    // 3️⃣ Check WiFi Connection
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi disconnected. Reconnecting...");
        WiFi.begin(ssid, password);
        delay(500);
    }

    TPMSWheel* wheels[4] = { &frontLeft, &frontRight, &rearLeft, &rearRight };

    // คำนวณระดับ alert สูงสุด
    int level = getAlertLevel(wheels);
    if (level > 0 && buzzer.level == 0) {
        startBuzzer(level);
    }

    updateBuzzer();
    updateBlinkState();
    displayTPMS();
    
    // 1️⃣ WebSocket communication and data push with Reconnect logic
    if (client.available()) {
        client.poll();
        
        String json = "{\"type\":\"update\",\"data\":{";
        json += "\"fl\":{\"pressure\":" + String(frontLeft.psi) + ",\"temp\":" + String(frontLeft.temp) + "},";
        json += "\"fr\":{\"pressure\":" + String(frontRight.psi) + ",\"temp\":" + String(frontRight.temp) + "},";
        json += "\"rl\":{\"pressure\":" + String(rearLeft.psi) + ",\"temp\":" + String(rearLeft.temp) + "},";
        json += "\"rr\":{\"pressure\":" + String(rearRight.psi) + ",\"temp\":" + String(rearRight.temp) + "}";
        json += "}}";

        client.send(json);
        Serial.println("Sent TPMS update: " + json);
        
        // 2️⃣ Rate limiting: 0.5 Hz update rate (Real car behavior)
        delay(2000); 
    } else {
        Serial.println("Reconnecting WebSocket...");
        client.connect(websocket_server);
        delay(1000);
    }

    pBLEScan->start(scanTime, false);
    pBLEScan->clearResults();
}
