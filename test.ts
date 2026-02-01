/**
 * 測試檔案
 * 用於在 MakeCode 中測試擴充功能
 */

// 測試基本設定
iotgas.setupPlatform("test-deployment-id", "test-api-key")
iotgas.setDeviceId("test-device")

// 測試數據上傳
iotgas.quickUpload(25, 60, 500)

// 測試狀態檢查
if (iotgas.isPlatformSetup()) {
    basic.showString("OK")
}
