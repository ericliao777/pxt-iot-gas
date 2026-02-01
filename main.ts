/**
 * ============================================
 * IoT GAS Platform - MakeCode Extension
 * ============================================
 * 
 * 用於 micro:bit 上傳數據到 Google Apps Script 平台
 * 支援 ESP8266 WiFi 模組（使用 AT 指令）
 * 
 * @author Your Name
 * @version 1.0.0
 * ============================================
 */

/**
 * IoT GAS Platform 積木
 */
//% weight=100 color=#00A8E1 icon="\uf1c0" block="IoT GAS"
//% groups=['setup', 'wifi', 'data', 'advanced']
namespace iotgas {
    
    // ==================== 全域變數 ====================
    let deploymentId: string = ""
    let apiKey: string = ""
    let deviceId: string = ""
    let baseUrl: string = ""
    let wifiConnected: boolean = false
    let platformConnected: boolean = false
    
    // ESP8266 序列埠設定
    let txPin: SerialPin = SerialPin.P8
    let rxPin: SerialPin = SerialPin.P12
    let baudRate: BaudRate = BaudRate.BaudRate115200
    
    // 數據暫存
    let tempField1: number = 0
    let tempField2: number = 0
    let tempField3: number = 0
    let tempField4: number = 0
    let tempField5: number = 0
    let tempField6: number = 0
    let tempField7: number = 0
    let tempField8: number = 0
    
    
    // ==================== 初始化設定 ====================
    
    /**
     * 設定平台連線資訊
     * 填入從 GAS 平台取得的 Deployment ID 和 API Key
     * @param depId 你的 Deployment ID，例如：AKfycbx...
     * @param key 你的 API Key，例如：iot_abc123...
     */
    //% block="設定 GAS 平台 ID %depId| API Key %key"
    //% depId.defl="AKfycbx..."
    //% key.defl="iot_abc123..."
    //% group="setup"
    //% weight=100
    export function setupPlatform(depId: string, key: string): void {
        deploymentId = depId
        apiKey = key
        baseUrl = "script.google.com"
        platformConnected = true
        
        basic.showIcon(IconNames.Yes)
        basic.pause(500)
        basic.clearScreen()
    }
    
    
    /**
     * 設定設備 ID
     * 用來識別這台 micro:bit
     * @param devId 設備 ID，例如：classroom-A-01
     */
    //% block="設定設備 ID %devId"
    //% devId.defl="microbit-01"
    //% group="setup"
    //% weight=95
    export function setDeviceId(devId: string): void {
        deviceId = devId
        basic.showString("ID")
        basic.pause(300)
        basic.clearScreen()
    }
    
    
    /**
     * 設定 ESP8266 序列埠接腳
     * 預設：TX=P8, RX=P12
     * @param tx TX 接腳
     * @param rx RX 接腳
     */
    //% block="設定 ESP8266 接腳 TX %tx| RX %rx"
    //% tx.defl=SerialPin.P8
    //% rx.defl=SerialPin.P12
    //% group="setup"
    //% weight=90
    //% advanced=true
    export function setupESP8266Pins(tx: SerialPin, rx: SerialPin): void {
        txPin = tx
        rxPin = rx
    }
    
    
    // ==================== WiFi 連線 ====================
    
    /**
     * 連線到 WiFi
     * 使用 ESP8266 模組連線到 WiFi 網路
     * @param ssid WiFi 名稱
     * @param password WiFi 密碼
     */
    //% block="連線 WiFi SSID %ssid| 密碼 %password"
    //% ssid.defl="your-wifi"
    //% password.defl="your-password"
    //% group="wifi"
    //% weight=80
    export function connectWiFi(ssid: string, password: string): void {
        // 顯示連線中
        basic.showIcon(IconNames.SmallDiamond)
        
        // 初始化序列埠
        serial.redirect(txPin, rxPin, baudRate)
        basic.pause(100)
        
        // 重置 ESP8266
        sendATCommand("AT+RST", 2000)
        
        // 設定為 Station 模式
        sendATCommand("AT+CWMODE=1", 1000)
        
        // 連線到 WiFi
        let connectCmd = "AT+CWJAP=\"" + ssid + "\",\"" + password + "\""
        let response = sendATCommand(connectCmd, 10000)
        
        // 檢查是否連線成功
        if (response.includes("OK") || response.includes("WIFI CONNECTED")) {
            wifiConnected = true
            basic.showIcon(IconNames.Yes)
            basic.pause(1000)
            basic.clearScreen()
        } else {
            wifiConnected = false
            basic.showIcon(IconNames.No)
            basic.pause(1000)
            basic.clearScreen()
        }
    }
    
    
    /**
     * 檢查 WiFi 是否已連線
     */
    //% block="WiFi 已連線"
    //% group="wifi"
    //% weight=75
    export function isWiFiConnected(): boolean {
        return wifiConnected
    }
    
    
    /**
     * 中斷 WiFi 連線
     */
    //% block="中斷 WiFi 連線"
    //% group="wifi"
    //% weight=70
    //% advanced=true
    export function disconnectWiFi(): void {
        sendATCommand("AT+CWQAP", 1000)
        wifiConnected = false
        basic.showIcon(IconNames.No)
        basic.pause(500)
        basic.clearScreen()
    }
    
    
    // ==================== 數據上傳 ====================
    
    /**
     * 快速上傳數據（1-3 個欄位）
     * 最常用的積木，適合簡單的溫濕度感測器
     * @param f1 欄位 1 的數值（例如：溫度）
     * @param f2 欄位 2 的數值（例如：濕度）
     * @param f3 欄位 3 的數值（例如：光線）
     */
    //% block="快速上傳 欄位1 %f1| 欄位2 %f2|| 欄位3 %f3"
    //% f1.defl=25
    //% f2.defl=60
    //% f3.defl=500
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=inline
    //% group="data"
    //% weight=100
    export function quickUpload(f1: number, f2?: number, f3?: number): void {
        // 檢查是否已設定
        if (!checkSetup()) {
            return
        }
        
        // 建立 JSON 數據
        let jsonData = buildJsonData(f1, f2, f3, null, null, null, null, null)
        
        // 發送 HTTP POST
        sendHttpPost(jsonData)
    }
    
    
    /**
     * 完整上傳數據（支援 8 個欄位）
     * 適合需要更多感測器數據的情況
     */
    //% block="完整上傳 F1 %f1| F2 %f2| F3 %f3|| F4 %f4| F5 %f5| F6 %f6| F7 %f7| F8 %f8"
    //% expandableArgumentMode="enabled"
    //% inlineInputMode=inline
    //% group="data"
    //% weight=95
    //% advanced=true
    export function fullUpload(
        f1: number,
        f2?: number,
        f3?: number,
        f4?: number,
        f5?: number,
        f6?: number,
        f7?: number,
        f8?: number
    ): void {
        // 檢查是否已設定
        if (!checkSetup()) {
            return
        }
        
        // 建立 JSON 數據
        let jsonData = buildJsonData(f1, f2, f3, f4, f5, f6, f7, f8)
        
        // 發送 HTTP POST
        sendHttpPost(jsonData)
    }
    
    
    /**
     * 設定欄位數值（暫存）
     * 可以分開設定每個欄位，最後再一次上傳
     * @param fieldNum 欄位編號（1-8）
     * @param value 數值
     */
    //% block="設定欄位 %fieldNum| 數值 %value"
    //% fieldNum.min=1 fieldNum.max=8
    //% group="data"
    //% weight=90
    //% advanced=true
    export function setField(fieldNum: number, value: number): void {
        switch (fieldNum) {
            case 1: tempField1 = value; break
            case 2: tempField2 = value; break
            case 3: tempField3 = value; break
            case 4: tempField4 = value; break
            case 5: tempField5 = value; break
            case 6: tempField6 = value; break
            case 7: tempField7 = value; break
            case 8: tempField8 = value; break
        }
    }
    
    
    /**
     * 上傳暫存的數據
     * 搭配「設定欄位」積木使用
     */
    //% block="上傳暫存數據"
    //% group="data"
    //% weight=85
    //% advanced=true
    export function uploadStoredData(): void {
        // 檢查是否已設定
        if (!checkSetup()) {
            return
        }
        
        // 建立 JSON 數據
        let jsonData = buildJsonData(
            tempField1,
            tempField2,
            tempField3,
            tempField4,
            tempField5,
            tempField6,
            tempField7,
            tempField8
        )
        
        // 發送 HTTP POST
        sendHttpPost(jsonData)
        
        // 清空暫存
        clearStoredData()
    }
    
    
    /**
     * 清空暫存數據
     */
    //% block="清空暫存數據"
    //% group="data"
    //% weight=80
    //% advanced=true
    export function clearStoredData(): void {
        tempField1 = 0
        tempField2 = 0
        tempField3 = 0
        tempField4 = 0
        tempField5 = 0
        tempField6 = 0
        tempField7 = 0
        tempField8 = 0
    }
    
    
    // ==================== 狀態檢查 ====================
    
    /**
     * 檢查平台是否已設定
     */
    //% block="平台已設定"
    //% group="advanced"
    //% weight=60
    export function isPlatformSetup(): boolean {
        return platformConnected && deploymentId !== "" && apiKey !== ""
    }
    
    
    /**
     * 顯示連線狀態
     * 在 LED 上顯示當前的連線狀態
     */
    //% block="顯示連線狀態"
    //% group="advanced"
    //% weight=55
    export function showConnectionStatus(): void {
        if (!platformConnected) {
            // 未設定平台
            basic.showIcon(IconNames.Confused)
        } else if (!wifiConnected) {
            // 平台已設定但 WiFi 未連線
            basic.showIcon(IconNames.Sad)
        } else {
            // 都已連線
            basic.showIcon(IconNames.Happy)
        }
        basic.pause(1500)
        basic.clearScreen()
    }
    
    
    /**
     * 顯示平台資訊
     * 在 LED 上捲動顯示 Deployment ID
     */
    //% block="顯示平台 ID"
    //% group="advanced"
    //% weight=50
    export function showPlatformInfo(): void {
        if (deploymentId === "") {
            basic.showString("NO ID")
        } else {
            basic.showString(deploymentId.substr(0, 10))
        }
    }
    
    
    // ==================== 內部函數 ====================
    
    /**
     * 發送 AT 指令
     * @param command AT 指令
     * @param waitTime 等待時間（毫秒）
     */
    function sendATCommand(command: string, waitTime: number): string {
        // 清空序列埠緩衝區
        serial.readString()
        
        // 發送指令
        serial.writeString(command + "\r\n")
        
        // 等待回應
        basic.pause(waitTime)
        
        // 讀取回應
        let response = serial.readString()
        
        return response
    }
    
    
    /**
     * 建立 JSON 數據字串
     */
    function buildJsonData(
        f1: number,
        f2?: number,
        f3?: number,
        f4?: number,
        f5?: number,
        f6?: number,
        f7?: number,
        f8?: number
    ): string {
        let json = "{\"api_key\":\"" + apiKey + "\""
        json += ",\"device_id\":\"" + deviceId + "\""
        
        // 加入欄位數據
        json += ",\"field1\":" + f1
        
        if (f2 !== null && f2 !== undefined) {
            json += ",\"field2\":" + f2
        }
        if (f3 !== null && f3 !== undefined) {
            json += ",\"field3\":" + f3
        }
        if (f4 !== null && f4 !== undefined) {
            json += ",\"field4\":" + f4
        }
        if (f5 !== null && f5 !== undefined) {
            json += ",\"field5\":" + f5
        }
        if (f6 !== null && f6 !== undefined) {
            json += ",\"field6\":" + f6
        }
        if (f7 !== null && f7 !== undefined) {
            json += ",\"field7\":" + f7
        }
        if (f8 !== null && f8 !== undefined) {
            json += ",\"field8\":" + f8
        }
        
        json += "}"
        
        return json
    }
    
    
    /**
     * 發送 HTTP POST 請求
     * @param jsonData JSON 格式的數據
     */
    function sendHttpPost(jsonData: string): void {
        // 顯示上傳中
        basic.showIcon(IconNames.SmallSquare)
        
        try {
            // 準備 HTTP 請求
            let path = "/macros/s/" + deploymentId + "/exec"
            let contentLength = jsonData.length
            
            // 建立 TCP 連線
            let connectCmd = "AT+CIPSTART=\"TCP\",\"" + baseUrl + "\",80"
            let connectResponse = sendATCommand(connectCmd, 3000)
            
            if (!connectResponse.includes("OK") && !connectResponse.includes("ALREADY")) {
                showUploadError()
                return
            }
            
            // 準備 HTTP 請求內容
            let httpRequest = "POST " + path + " HTTP/1.1\r\n"
            httpRequest += "Host: " + baseUrl + "\r\n"
            httpRequest += "Content-Type: application/json\r\n"
            httpRequest += "Content-Length: " + contentLength + "\r\n"
            httpRequest += "Connection: close\r\n"
            httpRequest += "\r\n"
            httpRequest += jsonData
            
            // 發送數據
            let sendCmd = "AT+CIPSEND=" + httpRequest.length
            sendATCommand(sendCmd, 500)
            
            // 等待 ">" 提示符
            basic.pause(500)
            
            // 發送 HTTP 請求
            serial.writeString(httpRequest)
            
            // 等待回應
            basic.pause(3000)
            
            // 關閉連線
            sendATCommand("AT+CIPCLOSE", 500)
            
            // 顯示成功
            showUploadSuccess()
            
        } catch (error) {
            // 顯示錯誤
            showUploadError()
        }
    }
    
    
    /**
     * 檢查是否已完成設定
     */
    function checkSetup(): boolean {
        if (!platformConnected || deploymentId === "" || apiKey === "") {
            basic.showIcon(IconNames.No)
            basic.pause(1000)
            basic.clearScreen()
            return false
        }
        
        if (!wifiConnected) {
            basic.showIcon(IconNames.Sad)
            basic.pause(1000)
            basic.clearScreen()
            return false
        }
        
        return true
    }
    
    
    /**
     * 顯示上傳成功
     */
    function showUploadSuccess(): void {
        basic.showIcon(IconNames.Heart)
        basic.pause(300)
        basic.clearScreen()
    }
    
    
    /**
     * 顯示上傳錯誤
     */
    function showUploadError(): void {
        basic.showIcon(IconNames.No)
        basic.pause(1000)
        basic.clearScreen()
    }
}