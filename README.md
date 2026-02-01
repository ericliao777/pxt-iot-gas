# IoT GAS Platform - MakeCode Extension

這是一個用於 micro:bit 的 MakeCode 擴充，可以將感測器數據上傳到 Google Apps Script (GAS) 平台。

## 功能特色

- ✅ 支援 ESP8266 WiFi 模組
- ✅ 最多 8 個數據欄位
- ✅ 簡單易用的積木介面
- ✅ 自動錯誤處理
- ✅ 視覺化狀態顯示

## 硬體需求

- micro:bit V1 或 V2
- ESP8266 WiFi 模組（例如：ESP-01）
- 連接線

## 接線方式
```
ESP8266    →    micro:bit
VCC        →    3.3V
GND        →    GND
TX         →    P12 (RX)
RX         →    P8 (TX)
```

⚠️ **注意**：ESP8266 使用 3.3V，請勿接到 micro:bit 的 5V 接腳！

## 使用步驟

### 1. 建立 GAS 平台

1. 複製 GAS 模板試算表
2. 執行初始化
3. 部署為 Web App
4. 取得 **Deployment ID** 和 **API Key**

### 2. 在 MakeCode 中使用
```blocks
// 1. 設定平台連線資訊
iotgas.setupPlatform(
    "AKfycbx...",      // 你的 Deployment ID
    "iot_abc123..."    // 你的 API Key
)

// 2. 設定設備 ID
iotgas.setDeviceId("classroom-A-01")

// 3. 連線 WiFi
iotgas.connectWiFi("你的WiFi名稱", "WiFi密碼")

// 4. 上傳數據
basic.forever(function () {
    if (iotgas.isWiFiConnected()) {
        let temp = input.temperature()
        let light = input.lightLevel()
        
        iotgas.quickUpload(temp, 50, light)
        
        basic.pause(60000)  // 每分鐘上傳一次
    }
})
```

## 積木說明

### 📡 設定平台

#### 設定 GAS 平台 ID [depId] API Key [key]
設定你的 Deployment ID 和 API Key。

#### 設定設備 ID [devId]
設定這台 micro:bit 的識別 ID。

### 📶 WiFi 連線

#### 連線 WiFi SSID [ssid] 密碼 [password]
連線到 WiFi 網路。

#### WiFi 已連線
檢查 WiFi 是否已連線（回傳 true/false）。

### 📊 數據上傳

#### 快速上傳 欄位1 [f1] 欄位2 [f2] 欄位3 [f3]
上傳 1-3 個數據到平台（最常用）。

#### 完整上傳 F1-F8
上傳最多 8 個欄位的數據。

### 🔧 進階功能

#### 設定欄位 [fieldNum] 數值 [value]
先暫存數據，之後再一次上傳。

#### 上傳暫存數據
上傳之前用「設定欄位」暫存的數據。

#### 顯示連線狀態
在 LED 上顯示目前的連線狀態。

## 常見問題

### Q: WiFi 連線失敗怎麼辦？

A: 請檢查：
1. WiFi 名稱和密碼是否正確
2. ESP8266 接線是否正確
3. ESP8266 是否有供電（LED 應該會亮）

### Q: 上傳失敗怎麼辦？

A: 請檢查：
1. Deployment ID 和 API Key 是否正確
2. WiFi 是否已連線
3. GAS 平台是否正常運作

### Q: 可以上傳多快？

A: 建議至少間隔 30 秒以上，避免超過 GAS 的配額限制。

### Q: 支援 HTTPS 嗎？

A: 目前使用 HTTP (port 80)。如需 HTTPS，建議使用 ESP32 或其他支援的模組。

## 授權

MIT License

## 作者

Your Name

## 相關連結

- [GAS 平台教學](https://github.com/...)
- [micro:bit 官網](https://microbit.org/)
- [MakeCode 編輯器](https://makecode.microbit.org/)