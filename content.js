// BV SHOP 標籤機-出貨明細
(function() {
  'use strict';
  
  let isConverted = false;
  let highlightQuantity = false;
  let hideExtraInfo = false;
  let hideTableHeader = false;
  let originalBodyStyle = null;
  let isPanelMinimized = false;
  
  // 載入 Material Icons
  const iconLink = document.createElement('link');
  iconLink.rel = 'stylesheet';
  iconLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
  document.head.appendChild(iconLink);
  
  // 載入思源黑體
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&display=swap';
  document.head.appendChild(fontLink);
  
  // Logo 相關變數
  let logoDataUrl = null;
  let logoAspectRatio = 1;
  
  // 儲存原始控制項的參考
  let originalControlsElement = null;
  
  // 創建控制面板
  function createControlPanel() {
    if (document.getElementById('bv-label-control-panel')) return;
    
    // 隱藏原始控制選項，並移除 baseImageOpacity 相關元素
    const ignoreArea = document.querySelector('.ignore-print');
    if (ignoreArea) {
      originalControlsElement = ignoreArea;
      ignoreArea.style.display = 'none';
      
      // 移除 baseImageOpacity 相關元素
      const baseImageOpacityLabel = ignoreArea.querySelector('#baseImageOpacityLabel');
      if (baseImageOpacityLabel) {
        baseImageOpacityLabel.remove();
      }
    }
    
    const panel = document.createElement('div');
    panel.id = 'bv-label-control-panel';
    
    panel.innerHTML = getPanelContent();
    
    // 添加樣式
    const style = document.createElement('style');
    style.textContent = `
    /* 移除所有 focus outline */
    * {
      outline: none !important;
    }
    
    *:focus,
    *:focus-visible,
    *:focus-within,
    *:active {
      outline: none !important;
      box-shadow: none !important;
    }
    
    /* 主面板 - Liquid Glass 風格 (更透明) */
    #bv-label-control-panel {
      position: fixed;
      right: 20px;
      top: 20px;
      bottom: 20px;
      width: 340px;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Noto Sans TC', sans-serif;
      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    
    .bv-glass-panel {
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.45);
      backdrop-filter: blur(30px) saturate(200%);
      -webkit-backdrop-filter: blur(30px) saturate(200%);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 
        0 12px 48px rgba(0, 0, 0, 0.15),
        0 0 0 1px rgba(0, 0, 0, 0.05),
        inset 0 0 0 1px rgba(255, 255, 255, 0.8);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    /* 最小化狀態 */
    #bv-label-control-panel.minimized {
      height: auto;
      bottom: auto;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    
    #bv-label-control-panel.minimized .bv-glass-panel {
      height: auto;
    }
    
    #bv-label-control-panel.minimized .bv-panel-content-wrapper {
      display: none;
    }
    
    /* 浮動按鈕 */
    .bv-floating-button {
      position: fixed;
      bottom: 28px;
      right: 28px;
      width: 56px;
      height: 56px;
      background: rgba(81, 138, 255, 0.85);
      backdrop-filter: blur(15px) saturate(180%);
      -webkit-backdrop-filter: blur(15px) saturate(180%);
      color: white;
      border: none;
      border-radius: 50%;
      box-shadow: 
        0 6px 28px rgba(81, 138, 255, 0.45),
        0 0 0 1px rgba(255, 255, 255, 0.3),
        inset 0 0 0 1px rgba(255, 255, 255, 0.4);
      cursor: pointer;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    
    .bv-floating-button:hover {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 
        0 10px 40px rgba(81, 138, 255, 0.6),
        0 0 0 1px rgba(255, 255, 255, 0.4),
        inset 0 0 0 1px rgba(255, 255, 255, 0.5);
    }
    
    .bv-floating-button:active {
      transform: scale(1.02);
    }
    
    .bv-floating-button .material-icons {
      font-size: 24px;
    }
    
    #bv-label-control-panel.minimized ~ .bv-floating-button {
      display: flex;
    }
    
    /* 面板標題 (縮小版) */
    .bv-panel-header {
      padding: 16px 20px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      background: rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(20px);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
      cursor: move;
      user-select: none;
    }
    
    .bv-header-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }
    
    .bv-icon-wrapper {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #518aff 0%, #0040ff 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 
        0 3px 12px rgba(81, 138, 255, 0.35),
        inset 0 0 0 1px rgba(255, 255, 255, 0.3);
    }
    
    .bv-icon-wrapper.bv-label-mode {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 
        0 3px 12px rgba(16, 185, 129, 0.35),
        inset 0 0 0 1px rgba(255, 255, 255, 0.3);
    }
    
    .bv-icon-wrapper .material-icons {
      font-size: 20px;
    }
    
    .bv-title-group {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    
    .bv-panel-title {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      color: #1a1a1a;
      letter-spacing: -0.01em;
    }
    
    .bv-panel-subtitle {
      font-size: 12px;
      color: #86868b;
      font-weight: 400;
    }
    
    /* Glass 按鈕 (縮小版) */
    .bv-glass-button {
      width: 28px;
      height: 28px;
      background: rgba(0, 0, 0, 0.04);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 0, 0, 0.06);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #424245;
    }
    
    .bv-glass-button:hover {
      background: rgba(0, 0, 0, 0.08);
      transform: scale(1.05);
    }
    
    .bv-glass-button:active {
      transform: scale(0.95);
    }
    
    .bv-glass-button .material-icons {
      font-size: 18px;
    }
    
    .bv-glass-button.bv-primary {
      background: rgba(81, 138, 255, 0.12);
      color: #518aff;
      border-color: rgba(81, 138, 255, 0.25);
    }
    
    .bv-glass-button.bv-primary:hover {
      background: rgba(81, 138, 255, 0.18);
    }
    
    /* 內容區域 (縮小版) */
    .bv-panel-content-wrapper {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }
    
    .bv-panel-body {
      padding: 20px;
      overflow-y: auto;
      flex: 1;
      -webkit-overflow-scrolling: touch;
    }
    
    /* 主要操作區 (縮小版) */
    .bv-primary-section {
      margin-bottom: 20px;
    }
    
    .bv-primary-button,
    .bv-secondary-button {
      width: 100%;
      padding: 0;
      background: linear-gradient(135deg, #518aff 0%, #0040ff 100%);
      border: none;
      border-radius: 14px;
      cursor: pointer;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      box-shadow: 
        0 4px 20px rgba(81, 138, 255, 0.35),
        inset 0 0 0 1px rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 18px;
      color: white;
    }
    
    .bv-secondary-button {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 
        0 4px 20px rgba(16, 185, 129, 0.35),
        inset 0 0 0 1px rgba(255, 255, 255, 0.3);
    }
    
    .bv-primary-button:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 8px 32px rgba(81, 138, 255, 0.45),
        inset 0 0 0 1px rgba(255, 255, 255, 0.4);
    }
    
    .bv-secondary-button:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 8px 32px rgba(16, 185, 129, 0.45),
        inset 0 0 0 1px rgba(255, 255, 255, 0.4);
    }
    
    .bv-primary-button:active,
    .bv-secondary-button:active {
      transform: translateY(0);
    }
    
    .bv-button-icon {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.18);
      backdrop-filter: blur(10px);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .bv-button-icon .material-icons {
      font-size: 24px;
    }
    
    .bv-button-content {
      flex: 1;
      text-align: left;
    }
    
    .bv-button-title {
      display: block;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 1px;
    }
    
    .bv-button-subtitle {
      display: block;
      font-size: 12px;
      opacity: 0.85;
    }
    
    /* 設定卡片 (縮小版) */
    .bv-settings-card {
      background: rgba(246, 246, 248, 0.4);
      backdrop-filter: blur(15px);
      border: 1px solid rgba(0, 0, 0, 0.04);
      border-radius: 14px;
      padding: 16px;
      margin-bottom: 14px;
    }
    
    .bv-card-title {
      margin: 0 0 14px 0;
      font-size: 13px;
      font-weight: 600;
      color: #1a1a1a;
      display: flex;
      align-items: center;
      gap: 6px;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }
    
    .bv-card-title .material-icons {
      font-size: 16px;
      color: #86868b;
    }
    
    /* 設定項目 (縮小版) */
    .bv-setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);
    }
    
    .bv-setting-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    
    .bv-setting-item:first-child {
      padding-top: 0;
    }
    
    .bv-setting-info {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
    }
    
    .bv-setting-info .material-icons {
      font-size: 18px;
      color: #86868b;
    }
    
    .bv-setting-text {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    
    .bv-setting-label {
      font-size: 13px;
      font-weight: 500;
      color: #1a1a1a;
    }
    
    .bv-setting-desc {
      font-size: 11px;
      color: #86868b;
    }
    
    /* Glass 開關 (縮小版) */
    .bv-glass-switch {
      position: relative;
      display: inline-block;
      width: 42px;
      height: 26px;
      cursor: pointer;
    }
    
    .bv-glass-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .bv-switch-slider {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.15);
      border-radius: 26px;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      backdrop-filter: blur(10px);
    }
    
    .bv-switch-slider:before {
      position: absolute;
      content: "";
      height: 22px;
      width: 22px;
      left: 2px;
      bottom: 2px;
      background: white;
      border-radius: 50%;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      box-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.15),
        0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    .bv-glass-switch input:checked + .bv-switch-slider {
      background: linear-gradient(135deg, #518aff 0%, #0040ff 100%);
    }
    
    .bv-glass-switch input:checked + .bv-switch-slider:before {
      transform: translateX(16px);
    }
    
    /* Glass Slider (縮小版) */
    .bv-slider-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .bv-slider-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .bv-slider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
    }
    
    .bv-value-label {
      background: rgba(81, 138, 255, 0.12);
      color: #518aff;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      font-family: 'SF Mono', monospace;
      min-width: 40px;
      text-align: center;
    }
    
    .bv-glass-slider {
      -webkit-appearance: none;
      width: 100%;
      height: 5px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 2.5px;
      outline: none;
      position: relative;
      cursor: pointer;
    }
    
    .bv-glass-slider:before {
      content: '';
      position: absolute;
      height: 5px;
      border-radius: 2.5px;
      background: linear-gradient(90deg, #518aff 0%, #0040ff 100%);
      width: var(--value, 0%);
      pointer-events: none;
    }
    
    .bv-glass-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      background: white;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.15),
        0 1px 2px rgba(0, 0, 0, 0.1),
        inset 0 0 0 1px rgba(0, 0, 0, 0.04);
      transition: all 0.2s ease;
      position: relative;
      z-index: 1;
    }
    
    .bv-glass-slider::-webkit-slider-thumb:hover {
      transform: scale(1.1);
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.2),
        0 2px 4px rgba(0, 0, 0, 0.15),
        inset 0 0 0 1px rgba(0, 0, 0, 0.06);
    }
    
    .bv-glass-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: white;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 
        0 2px 8px rgba(0, 0, 0, 0.15),
        0 1px 2px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
      border: none;
    }
    
    /* 收折功能樣式 */
    .bv-collapsible {
      cursor: pointer;
      user-select: none;
    }
    
    .bv-collapsible:hover {
      background: rgba(0, 0, 0, 0.02);
      margin: -4px -8px;
      padding: 4px 8px;
      border-radius: 8px;
    }
    
    .bv-card-title.bv-collapsible::after {
      content: 'expand_more';
      font-family: 'Material Icons';
      font-size: 20px;
      margin-left: auto;
      transition: transform 0.3s ease;
    }
    
    .bv-settings-card.collapsed .bv-card-title.bv-collapsible::after {
      transform: rotate(-90deg);
    }
    
    .bv-settings-card.collapsed .bv-settings-list,
    .bv-settings-card.collapsed .bv-slider-group,
    .bv-settings-card.collapsed .bv-logo-upload-area,
    .bv-settings-card.collapsed .bv-logo-controls,
    .bv-settings-card.collapsed .bv-preset-controls,
    .bv-settings-card.collapsed .bv-preset-save-row {
      display: none;
    }
    
    /* 預設管理 (縮小版) */
    .bv-preset-controls {
      display: flex;
      gap: 6px;
      align-items: center;
    }
    
    .bv-glass-select {
      flex: 1;
      height: 32px;
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 8px;
      padding: 0 10px;
      font-size: 12px;
      color: #1a1a1a;
      cursor: pointer;
      transition: all 0.2s ease;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2386868b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
      padding-right: 28px;
    }
    
    .bv-glass-select:hover {
      background-color: rgba(255, 255, 255, 0.8);
      border-color: rgba(0, 0, 0, 0.12);
    }
    
    .bv-glass-select:focus {
      background-color: rgba(255, 255, 255, 0.9);
      border-color: #518aff;
      box-shadow: 0 0 0 3px rgba(81, 138, 255, 0.15);
    }
    
    .bv-preset-buttons {
      display: flex;
      gap: 4px;
    }
    
    .bv-preset-save-row {
      display: flex;
      gap: 6px;
      margin-top: 10px;
    }
    
    .bv-glass-input {
      flex: 1;
      height: 32px;
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 8px;
      padding: 0 10px;
      font-size: 12px;
      color: #1a1a1a;
      transition: all 0.2s ease;
    }
    
    .bv-glass-input::placeholder {
      color: #86868b;
    }
    
    .bv-glass-input:hover {
      background-color: rgba(255, 255, 255, 0.8);
      border-color: rgba(0, 0, 0, 0.12);
    }
    
    .bv-glass-input:focus {
      background-color: rgba(255, 255, 255, 0.9);
      border-color: #518aff;
      box-shadow: 0 0 0 3px rgba(81, 138, 255, 0.15);
    }
    
    /* 底部區域 (縮小版) */
    .bv-panel-footer {
      padding: 14px 20px 20px;
      background: rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(20px);
      border-top: 1px solid rgba(0, 0, 0, 0.06);
      flex-shrink: 0;
    }
    
    .bv-glass-action-button {
      width: 100%;
      height: 42px;
      background: linear-gradient(135deg, #518aff 0%, #0040ff 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      box-shadow: 
        0 4px 20px rgba(81, 138, 255, 0.35),
        inset 0 0 0 1px rgba(255, 255, 255, 0.3);
    }
    
    .bv-glass-action-button:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 8px 32px rgba(81, 138, 255, 0.45),
        inset 0 0 0 1px rgba(255, 255, 255, 0.4);
    }
    
    .bv-glass-action-button:active {
      transform: translateY(0);
    }
    
    .bv-glass-action-button .material-icons {
      font-size: 20px;
    }
    
    /* 滾動條 */
    .bv-panel-body::-webkit-scrollbar {
      width: 8px;
    }
    
    .bv-panel-body::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .bv-panel-body::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.15);
      border-radius: 8px;
      border: 2px solid transparent;
      background-clip: padding-box;
    }
    
    .bv-panel-body::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.25);
      background-clip: padding-box;
    }
    
    /* 通知 */
    .bv-notification {
      position: fixed;
      top: 28px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(25px) saturate(200%);
      -webkit-backdrop-filter: blur(25px) saturate(200%);
      padding: 14px 20px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 500;
      box-shadow: 
        0 10px 40px rgba(0, 0, 0, 0.15),
        0 0 0 1px rgba(0, 0, 0, 0.05),
        inset 0 0 0 1px rgba(255, 255, 255, 0.8);
      z-index: 100001;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: slideDown 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    
    .bv-notification.success {
      color: #059669;
    }
    
    .bv-notification.warning {
      color: #d97706;
    }
    
    .bv-notification .material-icons {
      font-size: 18px;
    }
    
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translate(-50%, -20px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }
    
    @keyframes slideUp {
      from {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      to {
        opacity: 0;
        transform: translate(-50%, -20px);
      }
    }
    
    /* 數量標示 - 圓形/圓角矩形樣式 */
    .bv-qty-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.5em;
      height: 1.3em;
      padding: 0.1em 0.4em;
      background: transparent;
      color: inherit !important;
      border: 1.5px solid #333333;
      border-radius: 0.65em;
      font-weight: inherit;
      font-size: 0.7em;
      line-height: 1;
      vertical-align: middle;
      position: relative;
      top: -0.05em;
      white-space: nowrap;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* 個位數使用圓形 */
    .bv-qty-badge.single-digit {
      width: 1.3em;
      min-width: 1.3em;
      padding: 0.1em 0;
      border-radius: 50%;
    }
    
    /* 數量為 1 時完全透明（無外框無填充） */
    .bv-qty-badge.qty-one {
      background: transparent !important;
      color: inherit !important;
      border: none !important;
    }
    
    /* 列印樣式確保顏色正確 */
    @media print {
      .bv-qty-badge {
        background: transparent !important;
        color: black !important;
        border: 1.5px solid #333333 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .bv-qty-badge.single-digit {
        width: 1.3em !important;
        border-radius: 50% !important;
      }
      
      .bv-qty-badge.qty-one {
        background: transparent !important;
        color: black !important;
        border: none !important;
      }
    }
    
    /* 數量圖標樣式 - 使用文字而非圖標 */
    .bv-counter-icon {
      font-family: 'Material Icons';
      font-weight: normal;
      font-style: normal;
      font-size: 18px;
      display: inline-block;
      line-height: 1;
      text-transform: none;
      letter-spacing: normal;
      word-wrap: normal;
      white-space: nowrap;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      -moz-osx-font-smoothing: grayscale;
      font-feature-settings: 'liga';
    }
    
    .bv-counter-icon::before {
      content: "filter_2";
    }
    
    /* 數字輸入框樣式 */
    .bv-number-input {
      width: 60px;
      height: 32px;
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 8px;
      padding: 0 10px;
      font-size: 12px;
      color: #1a1a1a;
      text-align: center;
      transition: all 0.2s ease;
    }
    
    .bv-number-input:hover {
      background-color: rgba(255, 255, 255, 0.8);
      border-color: rgba(0, 0, 0, 0.12);
    }
    
    .bv-number-input:focus {
      background-color: rgba(255, 255, 255, 0.9);
      border-color: #518aff;
      box-shadow: 0 0 0 3px rgba(81, 138, 255, 0.15);
    }
    
    /* 帶單位的輸入框容器 */
    .bv-input-with-unit {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .bv-unit-label {
      font-size: 12px;
      color: #86868b;
    }
    
    /* 轉換後的樣式 */
    body.bv-converted {
      width: auto !important;
      max-width: none !important;
      min-width: auto !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    /* Logo 上傳區域樣式 */
    .bv-logo-upload-area {
      border: 2px dashed rgba(0, 0, 0, 0.12);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: rgba(246, 246, 248, 0.3);
      margin-bottom: 16px;
      position: relative;
      overflow: hidden;
    }
    
    .bv-logo-upload-area:hover {
      border-color: #518aff;
      background: rgba(81, 138, 255, 0.05);
    }
    
    .bv-logo-upload-area.has-logo {
      border-style: solid;
      padding: 16px;
      background: rgba(255, 255, 255, 0.8);
    }
    
    .bv-logo-upload-area .material-icons {
      vertical-align: middle;
      line-height: 1;
    }
    
    .bv-logo-preview {
      max-width: 100%;
      max-height: 100px;
      margin: 0 auto;
      display: block;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }
    
    .bv-upload-hint {
      color: #86868b;
      font-size: 13px;
      margin-top: 10px;
      font-weight: 500;
    }
    
    .bv-logo-controls {
      display: none;
    }
    
    .bv-logo-controls.active {
      display: block;
      animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .bv-remove-logo-btn {
      background: linear-gradient(135deg, #f04747 0%, #e74c3c 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 16px;
      transition: all 0.2s ease;
      box-shadow: 0 2px 6px rgba(240, 71, 71, 0.3);
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    
    .bv-remove-logo-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(240, 71, 71, 0.35);
    }
    
    .bv-remove-logo-btn .material-icons {
      font-size: 16px;
      vertical-align: middle;
      line-height: 1;
    }
    
    /* 底圖在標籤上的樣式 */
    .label-background-logo {
      position: absolute !important;
      z-index: 1 !important;
      pointer-events: none;
      object-fit: contain !important;
    }
    
    /* 確保內容在底圖上方 */
    .bv-label-page > *:not(.label-background-logo) {
      position: relative !important;
      z-index: 2 !important;
    }
    
    /* A4 模式的底圖樣式 */
    .order-content .label-background-logo {
      position: absolute !important;
      z-index: 1 !important;
      pointer-events: none;
      object-fit: contain !important;
    }
    
    .order-content > *:not(.label-background-logo) {
      position: relative !important;
      z-index: 2 !important;
    }
    
    @media screen {
      body.bv-converted {
        background: #f0f0f0;
        padding: 20px 0;
      }
      
      .bv-page-container {
        margin: 0 auto 20px;
        width: fit-content;
      }
      
      .bv-label-page {
        width: 377px !important;
        height: 566px !important;
        background: white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        margin-bottom: 20px;
        position: relative;
        overflow: hidden;
        box-sizing: border-box;
      }
      
      .bv-page-content {
        width: 100%;
        height: 100%;
        position: relative;
      }
      
      .bv-converted .order-content.bv-original {
        display: none !important;
      }
      
      /* 隱藏原本的控制選項 */
      .bv-converted .ignore-print {
        display: none !important;
      }
    }
    
    @media print {
      /* A4 模式的列印樣式 */
      body:not(.bv-converted) {
        /* 保持原始的 A4 格式 */
      }
      
      /* 隱藏控制面板和浮動按鈕 */
      #bv-label-control-panel,
      .bv-floating-button {
        display: none !important;
      }
      
      /* 標籤模式的列印樣式 */
      body.bv-converted {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
      }
      
      @page {
        size: 100mm 150mm;
        margin: 0;
      }
      
      body.bv-converted .bv-label-page {
        width: 100mm !important;
        height: 150mm !important;
        margin: 0 !important;
        box-sizing: border-box !important;
        page-break-after: always !important;
        page-break-inside: avoid !important;
        box-shadow: none !important;
        border: none !important;
      }
      
      body.bv-converted .bv-label-page:last-child {
        page-break-after: auto !important;
      }
      
      body.bv-converted > *:not(.bv-page-container):not(.bv-label-page) {
        display: none !important;
      }
    }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(panel);
    
    // 創建浮動按鈕
    const floatingButton = document.createElement('button');
    floatingButton.className = 'bv-floating-button';
    floatingButton.id = 'bv-floating-print';
    floatingButton.title = '快速列印';
    floatingButton.innerHTML = '<span class="material-icons">print</span>';
    document.body.appendChild(floatingButton);
    
    // 綁定事件
    setupEventListeners();
    
    // 監聽原始控制項的變更
    observeOriginalControls();
    
    // 載入設定
    loadSettings();
    
    // 初始化拖曳功能
    initDragFunction();
    
    // 同步原始控制項的值到面板
    syncOriginalControlsToPanel();
    
    // A4 模式下也要更新樣式
    if (!isConverted) {
      updateA4Styles();
    }
    
    // 初始化收折功能
    initCollapsibles();
  }
  
  // 初始化收折功能
  function initCollapsibles() {
    document.querySelectorAll('.bv-card-title.bv-collapsible').forEach(title => {
      title.addEventListener('click', function() {
        const card = this.closest('.bv-settings-card');
        if (card) {
          card.classList.toggle('collapsed');
          // 儲存收折狀態
          const cardId = Array.from(card.parentElement.children).indexOf(card);
          const collapsedCards = JSON.parse(localStorage.getItem('bvCollapsedCards') || '[]');
          if (card.classList.contains('collapsed')) {
            if (!collapsedCards.includes(cardId)) {
              collapsedCards.push(cardId);
            }
          } else {
            const index = collapsedCards.indexOf(cardId);
            if (index > -1) {
              collapsedCards.splice(index, 1);
            }
          }
          localStorage.setItem('bvCollapsedCards', JSON.stringify(collapsedCards));
        }
      });
    });
    
    // 恢復收折狀態
    const collapsedCards = JSON.parse(localStorage.getItem('bvCollapsedCards') || '[]');
    const cards = document.querySelectorAll('.bv-settings-card');
    collapsedCards.forEach(cardId => {
      if (cards[cardId]) {
        cards[cardId].classList.add('collapsed');
      }
    });
  }
  
  // 同步原始控制項的值到面板
  function syncOriginalControlsToPanel() {
    if (!originalControlsElement) return;
    
    // 同步 checkbox
    const checkboxes = [
      'showProductImage',
      'showRemark',
      'showManageRemark',
      'showPrintRemark',
      'showDeliveryTime',
      'hideInfo',
      'hidePrice',
      'showShippingTime',
      'showLogTraceId'
    ];
    
    checkboxes.forEach(id => {
      const originalCheckbox = originalControlsElement.querySelector(`#${id}`);
      const panelCheckbox = document.getElementById(id);
      if (originalCheckbox && panelCheckbox) {
        panelCheckbox.checked = originalCheckbox.checked;
      }
    });
    
    // 同步文字大小
    const originalFontSize = originalControlsElement.querySelector('#fontSize');
    const panelFontSize = document.getElementById('fontSize');
    if (originalFontSize && panelFontSize) {
      panelFontSize.value = originalFontSize.value;
    }
  }
  
  // 更新面板內容
  function updatePanelContent() {
    const panel = document.getElementById('bv-label-control-panel');
    if (!panel) return;
    
    const wasMinimized = panel.classList.contains('minimized');
    
    // 保存當前位置
    const currentTransform = panel.style.transform;
    
    panel.innerHTML = getPanelContent();
    
    if (wasMinimized) {
      panel.classList.add('minimized');
      // 確保最小化按鈕圖標正確
      const minimizeBtn = panel.querySelector('#bv-minimize-btn .material-icons');
      if (minimizeBtn) {
        minimizeBtn.textContent = 'add';
      }
    }
    
    // 恢復位置
    panel.style.transform = currentTransform;
    
    // 重新綁定事件
    setupEventListeners();
    
    if (isConverted) {
      loadSettings();
      initPresetSystem();
      initLogoUpload();
    } else {
      syncOriginalControlsToPanel();
      initLogoUpload();
    }
    
    // 重新初始化拖曳功能
    initDragFunction();
    
    // 重新初始化收折功能
    initCollapsibles();
  }
  
  // 初始化拖曳功能（修復版）
  function initDragFunction() {
    const panel = document.getElementById('bv-label-control-panel');
    const header = panel.querySelector('.bv-panel-header');
    
    if (!panel || !header) return;
    
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    
    // 從 transform 中取得當前位置
    const transform = panel.style.transform;
    if (transform) {
      const match = transform.match(/translate\((-?\d+(?:\.\d+)?)px,\s*(-?\d+(?:\.\d+)?)px\)/);
      if (match) {
        xOffset = parseFloat(match[1]);
        yOffset = parseFloat(match[2]);
      }
    }
    
    function dragStart(e) {
      // 如果點擊的是按鈕或其子元素，不要開始拖曳
      if (e.target.closest('.bv-glass-button') || e.target.closest('.bv-minimize-btn')) return;
      
      if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
      } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      }
      
      if (e.target === header || (header.contains(e.target) && !e.target.closest('.bv-glass-button'))) {
        isDragging = true;
        panel.style.transition = 'none';
        e.preventDefault(); // 防止選取文字
      }
    }
    
    function dragEnd(e) {
      if (!isDragging) return;
      
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
      panel.style.transition = '';
      
      // 儲存位置
      chrome.storage.local.set({
        bvPanelPosition: {
          x: xOffset,
          y: yOffset
        }
      });
    }
    
    function drag(e) {
      if (isDragging) {
        e.preventDefault();
        
        if (e.type === "touchmove") {
          currentX = e.touches[0].clientX - initialX;
          currentY = e.touches[0].clientY - initialY;
        } else {
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;
        }
        
        xOffset = currentX;
        yOffset = currentY;
        
        setTranslate(currentX, currentY, panel);
      }
    }
    
    function setTranslate(xPos, yPos, el) {
      el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }
    
    // 載入儲存的位置
    chrome.storage.local.get(['bvPanelPosition'], (result) => {
      if (result.bvPanelPosition) {
        xOffset = result.bvPanelPosition.x;
        yOffset = result.bvPanelPosition.y;
        setTranslate(xOffset, yOffset, panel);
      }
    });
    
    // 直接綁定事件，不替換元素
    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    
    header.addEventListener('touchstart', dragStart, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', dragEnd);
  }
  
  // 初始化 Logo 上傳功能
  function initLogoUpload() {
    const logoUploadArea = document.getElementById('logo-upload-area');
    const logoInput = document.getElementById('logo-input');
    const logoPreview = document.getElementById('logo-preview');
    const uploadPrompt = document.getElementById('upload-prompt');
    const logoControls = document.getElementById('logo-controls');
    const removeLogoBtn = document.getElementById('remove-logo-btn');
    
    // Logo 控制項
    const logoSizeSlider = document.getElementById('logo-size-slider');
    const logoXSlider = document.getElementById('logo-x-slider');
    const logoYSlider = document.getElementById('logo-y-slider');
    const logoOpacitySlider = document.getElementById('logo-opacity-slider');
    
    // Logo 上傳事件
    if (logoUploadArea) {
      logoUploadArea.addEventListener('click', function() {
        logoInput.click();
      });
    }
    
    if (logoInput) {
      logoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg')) {
          const reader = new FileReader();
          reader.onload = function(event) {
            logoDataUrl = event.target.result;
            
            const img = new Image();
            img.onload = function() {
              logoAspectRatio = img.width / img.height;
              
              logoPreview.src = logoDataUrl;
              logoPreview.style.display = 'block';
              uploadPrompt.style.display = 'none';
              logoUploadArea.classList.add('has-logo');
              logoControls.classList.add('active');
              
              saveSettings();
              
              if (isConverted) {
                updateLabelStyles();
                setTimeout(() => {
                  handlePagination();
                  if (highlightQuantity) {
                    applyQuantityHighlight();
                  }
                }, 100);
              } else {
                updateA4Styles();
                updateA4Logos();
              }
            };
            img.src = logoDataUrl;
          };
          reader.readAsDataURL(file);
        } else {
          showNotification('請上傳 PNG 或 JPG 格式的圖片', 'warning');
        }
      });
    }
    
    // 移除 Logo
    if (removeLogoBtn) {
      removeLogoBtn.addEventListener('click', function() {
        logoDataUrl = null;
        logoAspectRatio = 1;
        logoPreview.style.display = 'none';
        uploadPrompt.style.display = 'block';
        logoUploadArea.classList.remove('has-logo');
        logoControls.classList.remove('active');
        logoInput.value = '';
        
        saveSettings();
        
        if (isConverted) {
          updateLabelStyles();
          setTimeout(() => {
            handlePagination();
            if (highlightQuantity) {
              applyQuantityHighlight();
            }
          }, 100);
        } else {
          updateA4Styles();
          updateA4Logos();
        }
      });
    }
    
    // Logo 控制項事件
    [logoSizeSlider, logoXSlider, logoYSlider, logoOpacitySlider].forEach(slider => {
      if (slider) {
        slider.addEventListener('input', function() {
          document.getElementById(this.id.replace('-slider', '')).textContent = this.value + '%';
          updateRangeProgress(this);
          saveSettings();
          
          if (isConverted) {
            updateLabelStyles();
          } else {
            updateA4Styles();
          }
        });
      }
    });
    
    // 載入已儲存的 Logo
    if (logoDataUrl) {
      logoPreview.src = logoDataUrl;
      logoPreview.style.display = 'block';
      uploadPrompt.style.display = 'none';
      logoUploadArea.classList.add('has-logo');
      logoControls.classList.add('active');
    }
  }
  
  // 設置事件監聽器
  function setupEventListeners() {
    const convertBtn = document.getElementById('bv-convert-btn');
    const revertBtn = document.getElementById('bv-revert-btn');
    const minimizeBtn = document.getElementById('bv-minimize-btn');
    const floatingPrint = document.getElementById('bv-floating-print');
    const highlightQty = document.getElementById('bv-highlight-qty');
    const applyPrint = document.getElementById('bv-apply-print');
    
    if (convertBtn) {
      convertBtn.addEventListener('click', convertToLabelFormat);
    }
    
    if (revertBtn) {
      revertBtn.addEventListener('click', revertToOriginal);
    }
    
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', function() {
        const panel = document.getElementById('bv-label-control-panel');
        const icon = this.querySelector('.material-icons');
        
        if (isPanelMinimized) {
          panel.classList.remove('minimized');
          icon.textContent = 'remove';
          isPanelMinimized = false;
        } else {
          panel.classList.add('minimized');
          icon.textContent = 'add';
          isPanelMinimized = true;
        }
        
        chrome.storage.local.set({ bvPanelMinimized: isPanelMinimized });
      });
    }
       
    if (floatingPrint) {
      floatingPrint.addEventListener('click', function() {
        if (!isConverted) {
          // A4 模式下直接列印 A4 格式
          window.print();
        } else {
          // 標籤模式下列印標籤
          preparePrintStyles();
          window.print();
        }
      });
    }
    
    if (highlightQty) {
      highlightQty.addEventListener('change', toggleQuantityHighlight);
    }
    
    if (applyPrint) {
      applyPrint.addEventListener('click', function() {
        if (!isConverted) {
          // A4 模式：套用數量標示（如果啟用）然後列印 A4 格式
          if (highlightQuantity) {
            applyQuantityHighlight();
          }
          window.print();
        } else {
          // 標籤模式：準備列印樣式然後列印標籤
          preparePrintStyles();
          window.print();
        }
      });
    }
    
    // 根據模式設置事件監聽器
    if (isConverted) {
      setupLabelModeEventListeners();
    } else {
      setupA4ModeEventListeners();
    }
  }
  
  // 設置 A4 模式的事件監聽器
  function setupA4ModeEventListeners() {
    // 原本的顯示控制選項
    const controlIds = [
      'showProductImage',
      'showRemark',
      'showManageRemark',
      'showPrintRemark',
      'showDeliveryTime',
      'hideInfo',
      'hidePrice',
      'showShippingTime',
      'showLogTraceId',
      'fontSize'
    ];
    
    controlIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', function() {
          // 同步到原始控制項
          if (originalControlsElement) {
            const originalElement = originalControlsElement.querySelector(`#${id}`);
            if (originalElement) {
              if (element.type === 'checkbox') {
                originalElement.checked = element.checked;
              } else {
                originalElement.value = element.value;
              }
              // 觸發原始元素的 change 事件
              const event = new Event('change', { bubbles: true });
              originalElement.dispatchEvent(event);
            }
          }
          
          saveSettings();
          updateA4Styles();
          
          if (highlightQuantity) {
            applyQuantityHighlight();
          }
        });
      }
    });
    
    // 初始化 Logo 上傳
    initLogoUpload();
  }
  
  // 設置標籤模式的事件監聽器
  function setupLabelModeEventListeners() {
    // 精簡模式
    const hideExtraInfoCheckbox = document.getElementById('bv-hide-extra-info');
    if (hideExtraInfoCheckbox) {
      hideExtraInfoCheckbox.addEventListener('change', function(e) {
        hideExtraInfo = e.target.checked;
        saveSettings();
        
        // 重新分頁以應用精簡模式
        setTimeout(() => {
          handlePagination();
          if (highlightQuantity) {
            applyQuantityHighlight();
          }
        }, 100);
      });
    }
    
    // 隱藏標題
    const hideTableHeaderCheckbox = document.getElementById('bv-hide-table-header');
    if (hideTableHeaderCheckbox) {
      hideTableHeaderCheckbox.addEventListener('change', function(e) {
        hideTableHeader = e.target.checked;
        saveSettings();
        updateLabelStyles();
        setTimeout(() => {
          handlePagination();
          if (highlightQuantity) {
            applyQuantityHighlight();
          }
        }, 100);
      });
    }
    
    // 間距調整
    const spacingControls = [
      { id: 'bv-label-padding', valueId: 'bv-padding-value', unit: 'mm' },
      { id: 'bv-header-padding', valueId: 'bv-header-padding-value', unit: 'mm' },
      { id: 'bv-row-padding', valueId: 'bv-row-padding-value', unit: 'mm' },
      { id: 'bv-fee-padding', valueId: 'bv-fee-padding-value', unit: 'mm' }
    ];
    
    spacingControls.forEach(control => {
      const input = document.getElementById(control.id);
      if (input) {
        input.addEventListener('input', function() {
          document.getElementById(control.valueId).textContent = this.value + control.unit;
          updateRangeProgress(this);
          saveSettings();
          updateLabelStyles();
          setTimeout(() => {
            handlePagination();
            if (highlightQuantity) {
              applyQuantityHighlight();
            }
          }, 100);
        });
      }
    });
    
    // 原本的顯示控制選項
    const controlIds = [
      'showProductImage',
      'showRemark',
      'showManageRemark',
      'showPrintRemark',
      'showDeliveryTime',
      'hideInfo',
      'hidePrice',
      'showShippingTime',
      'showLogTraceId',
      'fontSize'
    ];
    
    controlIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', function() {
          // 觸發原本的更新事件
          const event = new Event('change', { bubbles: true });
          const originalElement = document.querySelector(`.ignore-print #${id}`);
          if (originalElement) {
            if (element.type === 'checkbox') {
              originalElement.checked = element.checked;
            } else {
              originalElement.value = element.value;
            }
            originalElement.dispatchEvent(event);
          }
          
          saveSettings();
          updateLabelStyles();
          setTimeout(() => {
            handlePagination();
            if (highlightQuantity) {
              applyQuantityHighlight();
            }
          }, 100);
        });
      }
    });
    
    // 初始化 range input 進度條
    document.querySelectorAll('input[type="range"]').forEach(updateRangeProgress);
    
    // 初始化預設系統
    initPresetSystem();
    
    // 初始化 Logo 上傳
    initLogoUpload();
  }
  
  // 準備列印樣式
  function preparePrintStyles() {
    const labelPadding = document.getElementById('bv-label-padding')?.value || '2.5';
    
    const oldPrintStyle = document.getElementById('bv-print-styles');
    if (oldPrintStyle) oldPrintStyle.remove();
    
    const printStyle = document.createElement('style');
    printStyle.id = 'bv-print-styles';
    printStyle.textContent = `
      @media print {
        .bv-label-page {
          padding: ${labelPadding}mm !important;
        }
      }
    `;
    document.head.appendChild(printStyle);
  }
  
  // 初始化預設系統
  function initPresetSystem() {
    const presetSelect = document.getElementById('bv-preset-select');
    const savePresetBtn = document.getElementById('bv-save-preset');
    const deletePresetBtn = document.getElementById('bv-delete-preset');
    const savePresetRow = document.getElementById('bv-save-preset-row');
    const newPresetName = document.getElementById('bv-new-preset-name');
    const confirmSaveBtn = document.getElementById('bv-confirm-save');
    const cancelSaveBtn = document.getElementById('bv-cancel-save');
    
    if (!presetSelect) return;
    
    loadPresetList();
    
    presetSelect.addEventListener('change', function() {
      const selectedPreset = presetSelect.value;
      if (selectedPreset) {
        chrome.storage.local.get([`bvPreset_${selectedPreset}`], (result) => {
          const settings = result[`bvPreset_${selectedPreset}`];
          if (settings) {
            applyPresetSettings(settings);
            chrome.storage.local.set({ lastSelectedPreset: selectedPreset });
            showNotification(`已載入預設「${selectedPreset}」`);
            
            setTimeout(() => {
              handlePagination();
              if (highlightQuantity) {
                applyQuantityHighlight();
              }
            }, 100);
          }
        });
      }
    });
    
    if (savePresetBtn) {
      savePresetBtn.addEventListener('click', function() {
        if (savePresetRow) {
          savePresetRow.style.display = 'flex';
        }
        if (newPresetName) {
          newPresetName.value = presetSelect.value || '';
          newPresetName.focus();
        }
      });
    }
    
    if (confirmSaveBtn) {
      confirmSaveBtn.addEventListener('click', function() {
        if (!newPresetName) return;
        
        const presetName = newPresetName.value.trim();
        if (!presetName) {
          showNotification('請輸入名稱', 'warning');
          return;
        }
        
        const settings = getCurrentSettings();
        
        chrome.storage.local.get(['presetList'], (result) => {
          const allPresets = result.presetList || [];
          if (!allPresets.includes(presetName)) {
            allPresets.push(presetName);
          }
          
          const storageData = {
            [`bvPreset_${presetName}`]: settings,
            presetList: allPresets,
            lastSelectedPreset: presetName
          };
          
          chrome.storage.local.set(storageData, () => {
            loadPresetList();
            if (savePresetRow) {
              savePresetRow.style.display = 'none';
            }
            showNotification(`預設「${presetName}」已儲存`);
          });
        });
      });
    }
    
    if (cancelSaveBtn) {
      cancelSaveBtn.addEventListener('click', function() {
        if (savePresetRow) {
          savePresetRow.style.display = 'none';
        }
      });
    }
    
    if (deletePresetBtn) {
      deletePresetBtn.addEventListener('click', function() {
        const selectedPreset = presetSelect.value;
        if (!selectedPreset) {
          showNotification('請先選擇一個預設', 'warning');
          return;
        }
        
        if (confirm(`確定要刪除預設「${selectedPreset}」嗎？`)) {
          chrome.storage.local.get(['presetList', 'lastSelectedPreset'], (result) => {
            const allPresets = result.presetList || [];
            const updatedPresets = allPresets.filter(name => name !== selectedPreset);
            
            const storageData = { presetList: updatedPresets };
            
            if (result.lastSelectedPreset === selectedPreset) {
              chrome.storage.local.remove(['lastSelectedPreset']);
            }
            
            chrome.storage.local.remove([`bvPreset_${selectedPreset}`], () => {
              chrome.storage.local.set(storageData, () => {
                loadPresetList();
                showNotification(`預設「${selectedPreset}」已刪除`);
              });
            });
          });
        }
      });
    }
    
    if (newPresetName) {
      newPresetName.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && confirmSaveBtn) {
          confirmSaveBtn.click();
        }
      });
    }
  }
  
  // 載入預設檔列表
  function loadPresetList() {
    const presetSelect = document.getElementById('bv-preset-select');
    if (!presetSelect) return;
    
    chrome.storage.local.get(['presetList', 'lastSelectedPreset'], (result) => {
      const allPresets = result.presetList || [];
      const lastSelected = result.lastSelectedPreset;
      
      while (presetSelect.options.length > 1) {
        presetSelect.remove(1);
      }
      
      allPresets.forEach(presetName => {
        const option = document.createElement('option');
        option.value = presetName;
        option.textContent = presetName;
        presetSelect.appendChild(option);
        
        if (presetName === lastSelected) {
          option.selected = true;
        }
      });
    });
  }
  
  // 取得當前設定
  function getCurrentSettings() {
    return {
      highlightQuantity: document.getElementById('bv-highlight-qty')?.checked,
      hideExtraInfo: document.getElementById('bv-hide-extra-info')?.checked,
      hideTableHeader: document.getElementById('bv-hide-table-header')?.checked,
      labelPadding: document.getElementById('bv-label-padding')?.value || '2.5',
      headerPadding: document.getElementById('bv-header-padding')?.value || '0.5',
      rowPadding: document.getElementById('bv-row-padding')?.value || '0.8',
      feePadding: document.getElementById('bv-fee-padding')?.value || '0.8',
      fontSize: document.getElementById('fontSize')?.value || '14px',
      showProductImage: document.getElementById('showProductImage')?.checked,
      showRemark: document.getElementById('showRemark')?.checked,
      showManageRemark: document.getElementById('showManageRemark')?.checked,
      showPrintRemark: document.getElementById('showPrintRemark')?.checked,
      showDeliveryTime: document.getElementById('showDeliveryTime')?.checked,
      hideInfo: document.getElementById('hideInfo')?.checked,
      hidePrice: document.getElementById('hidePrice')?.checked,
      showShippingTime: document.getElementById('showShippingTime')?.checked,
      showLogTraceId: document.getElementById('showLogTraceId')?.checked,
      logoDataUrl: logoDataUrl,
      logoAspectRatio: logoAspectRatio,
      logoSize: document.getElementById('logo-size-slider')?.value || '30',
      logoX: document.getElementById('logo-x-slider')?.value || '50',
      logoY: document.getElementById('logo-y-slider')?.value || '50',
      logoOpacity: document.getElementById('logo-opacity-slider')?.value || '20'
    };
  }
  
  // 套用預設設定
  function applyPresetSettings(settings) {
    if (settings.highlightQuantity !== undefined) {
      const qtyCheckbox = document.getElementById('bv-highlight-qty');
      if (qtyCheckbox) qtyCheckbox.checked = settings.highlightQuantity;
      highlightQuantity = settings.highlightQuantity;
    }
    
    if (settings.hideExtraInfo !== undefined) {
      const hideExtraCheckbox = document.getElementById('bv-hide-extra-info');
      if (hideExtraCheckbox) hideExtraCheckbox.checked = settings.hideExtraInfo;
      hideExtraInfo = settings.hideExtraInfo;
    }
    
    if (settings.hideTableHeader !== undefined) {
      const hideHeaderCheckbox = document.getElementById('bv-hide-table-header');
      if (hideHeaderCheckbox) hideHeaderCheckbox.checked = settings.hideTableHeader;
      hideTableHeader = settings.hideTableHeader;
    }
    
    if (settings.labelPadding !== undefined) {
      const paddingInput = document.getElementById('bv-label-padding');
      if (paddingInput) {
        paddingInput.value = settings.labelPadding;
        document.getElementById('bv-padding-value').textContent = settings.labelPadding + 'mm';
        updateRangeProgress(paddingInput);
      }
    }
    
    const spacingSettings = [
      { id: 'bv-header-padding', value: settings.headerPadding, valueId: 'bv-header-padding-value' },
      { id: 'bv-row-padding', value: settings.rowPadding, valueId: 'bv-row-padding-value' },
      { id: 'bv-fee-padding', value: settings.feePadding, valueId: 'bv-fee-padding-value' }
    ];
    
    spacingSettings.forEach(setting => {
      if (setting.value !== undefined) {
        const input = document.getElementById(setting.id);
        if (input) {
          input.value = setting.value;
          document.getElementById(setting.valueId).textContent = setting.value + 'mm';
          updateRangeProgress(input);
        }
      }
    });
    
    if (settings.fontSize) {
      const fontSizeSelect = document.getElementById('fontSize');
      if (fontSizeSelect) fontSizeSelect.value = settings.fontSize;
    }
    
    const checkboxSettings = {
      showProductImage: settings.showProductImage,
      showRemark: settings.showRemark,
      showManageRemark: settings.showManageRemark,
      showPrintRemark: settings.showPrintRemark,
      showDeliveryTime: settings.showDeliveryTime,
      hideInfo: settings.hideInfo,
      hidePrice: settings.hidePrice,
      showShippingTime: settings.showShippingTime,
      showLogTraceId: settings.showLogTraceId
    };
    
    Object.keys(checkboxSettings).forEach(key => {
      const checkbox = document.getElementById(key);
      if (checkbox && checkboxSettings[key] !== undefined) {
        checkbox.checked = checkboxSettings[key];
      }
    });
    
    // Logo 設定
    if (settings.logoDataUrl) {
      logoDataUrl = settings.logoDataUrl;
      logoAspectRatio = settings.logoAspectRatio || 1;
      
      const logoPreview = document.getElementById('logo-preview');
      const uploadPrompt = document.getElementById('upload-prompt');
      const logoUploadArea = document.getElementById('logo-upload-area');
      const logoControls = document.getElementById('logo-controls');
      
      if (logoPreview) {
        logoPreview.src = logoDataUrl;
        logoPreview.style.display = 'block';
      }
      if (uploadPrompt) uploadPrompt.style.display = 'none';
      if (logoUploadArea) logoUploadArea.classList.add('has-logo');
      if (logoControls) logoControls.classList.add('active');
    }
    
    const logoSettings = [
      { id: 'logo-size-slider', value: settings.logoSize, valueId: 'logo-size' },
      { id: 'logo-x-slider', value: settings.logoX, valueId: 'logo-x' },
      { id: 'logo-y-slider', value: settings.logoY, valueId: 'logo-y' },
      { id: 'logo-opacity-slider', value: settings.logoOpacity, valueId: 'logo-opacity' }
    ];
    
    logoSettings.forEach(setting => {
      if (setting.value !== undefined) {
        const input = document.getElementById(setting.id);
        if (input) {
          input.value = setting.value;
          document.getElementById(setting.valueId).textContent = setting.value + '%';
          updateRangeProgress(input);
        }
      }
    });
    
    if (isConverted) {
      updateLabelStyles();
    } else {
      updateA4Styles();
    }
  }
  
  // 監聽原始控制項的變更
  function observeOriginalControls() {
    if (!originalControlsElement) return;
    
    const checkboxes = originalControlsElement.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        if (isConverted) {
          updateLabelStyles();
          setTimeout(() => {
            handlePagination();
            if (highlightQuantity) {
              applyQuantityHighlight();
            }
          }, 100);
        } else {
          updateA4Styles();
          if (highlightQuantity) {
            applyQuantityHighlight();
          }
        }
      });
    });
    
    const fontSizeSelect = originalControlsElement.querySelector('#fontSize');
    if (fontSizeSelect) {
      fontSizeSelect.addEventListener('change', () => {
        if (isConverted) {
          updateLabelStyles();
          setTimeout(() => {
            handlePagination();
            if (highlightQuantity) {
              applyQuantityHighlight();
            }
          }, 100);
        } else {
          updateA4Styles();
          if (highlightQuantity) {
            applyQuantityHighlight();
          }
        }
      });
    }
  }
  
  // 更新 Range Input 進度條
  function updateRangeProgress(input) {
    const value = (input.value - input.min) / (input.max - input.min) * 100;
    input.style.setProperty('--value', value + '%');
  }
  
  // 取得面板內容的函數
  function getPanelContent() {
    if (!isConverted) {
      // A4 模式
      return `
        <div class="bv-glass-panel">
          <div class="bv-panel-header">
            <div class="bv-header-content">
              <div class="bv-icon-wrapper">
                <span class="material-icons">description</span>
              </div>
              <div class="bv-title-group">
                <h3 class="bv-panel-title">BV SHOP 出貨明細</h3>
                <span class="bv-panel-subtitle">A4 格式模式</span>
              </div>
            </div>
            <button class="bv-glass-button bv-minimize-btn" id="bv-minimize-btn">
              <span class="material-icons">remove</span>
            </button>
          </div>
          
          <div class="bv-panel-content-wrapper">
            <div class="bv-panel-body">
              <!-- 主要操作區 -->
              <div class="bv-primary-section">
                <button id="bv-convert-btn" class="bv-primary-button">
                  <div class="bv-button-icon">
                    <span class="material-icons">transform</span>
                  </div>
                  <div class="bv-button-content">
                    <span class="bv-button-title">轉換為標籤格式</span>
                    <span class="bv-button-subtitle">10×15cm 熱感標籤</span>
                  </div>
                </button>
              </div>
              
              <!-- 顯示設定 -->
              <div class="bv-settings-card">
                <h4 class="bv-card-title bv-collapsible">
                  <span class="material-icons">visibility</span>
                  顯示設定
                </h4>
                
                <div class="bv-settings-list">
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="bv-counter-icon"></span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">數量標示</span>
                        <span class="bv-setting-desc">外框標示數量 ≥ 2</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="bv-highlight-qty">
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">image</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">顯示商品圖片</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="showProductImage">
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">comment</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">顯示顧客備註</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="showRemark" checked>
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">admin_panel_settings</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">顯示後台備註</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="showManageRemark" checked>
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">print</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">顯示列印備註</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="showPrintRemark" checked>
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">schedule</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">顯示指定配送時段</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="showDeliveryTime" checked>
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">visibility_off</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">隱藏個人資訊</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="hideInfo">
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">money_off</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">隱藏價格</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="hidePrice">
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">local_shipping</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">顯示預計出貨日</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="showShippingTime" checked>
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">qr_code</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">顯示物流編號</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="showLogTraceId" checked>
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">text_fields</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">文字大小</span>
                      </div>
                    </div>
                    <select id="fontSize" class="bv-glass-select" style="width: 100px;">
                      <option value="12px">12 px</option>
                      <option value="13px">13 px</option>
                      <option value="14px" selected>14 px</option>
                      <option value="15px">15 px</option>
                      <option value="16px">16 px</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <!-- 底圖設定 -->
              <div class="bv-settings-card">
                <h4 class="bv-card-title bv-collapsible">
                  <span class="material-icons">image</span>
                  底圖設定
                </h4>
                
                <div class="bv-logo-upload-area" id="logo-upload-area">
                  <input type="file" id="logo-input" accept="image/png,image/jpeg,image/jpg" style="display:none;">
                  <img id="logo-preview" class="bv-logo-preview" style="display:none;">
                  <div id="upload-prompt">
                    <span class="material-icons" style="font-size:36px; color: #86868b;">add_photo_alternate</span>
                    <div class="bv-upload-hint">點擊上傳底圖（支援 PNG/JPG）</div>
                  </div>
                </div>
                
                <div class="bv-logo-controls" id="logo-controls">
                  <div class="bv-slider-group">
                    <div class="bv-slider-item">
                      <div class="bv-slider-header">
                        <span>底圖大小</span>
                        <span class="bv-value-label" id="logo-size">30%</span>
                      </div>
                      <input type="range" id="logo-size-slider" min="10" max="100" value="30" class="bv-glass-slider">
                    </div>
                    
                    <div class="bv-slider-item">
                      <div class="bv-slider-header">
                        <span>水平位置</span>
                        <span class="bv-value-label" id="logo-x">50%</span>
                      </div>
                      <input type="range" id="logo-x-slider" min="0" max="100" value="50" class="bv-glass-slider">
                    </div>
                    
                    <div class="bv-slider-item">
                      <div class="bv-slider-header">
                        <span>垂直位置</span>
                        <span class="bv-value-label" id="logo-y">50%</span>
                      </div>
                      <input type="range" id="logo-y-slider" min="0" max="100" value="50" class="bv-glass-slider">
                    </div>
                    
                    <div class="bv-slider-item">
                      <div class="bv-slider-header">
                        <span>淡化程度</span>
                        <span class="bv-value-label" id="logo-opacity">20%</span>
                      </div>
                      <input type="range" id="logo-opacity-slider" min="0" max="100" value="20" class="bv-glass-slider">
                    </div>
                  </div>
                  
                  <button class="bv-remove-logo-btn" id="remove-logo-btn">
                    <span class="material-icons">delete</span>
                    移除底圖
                  </button>
                </div>
              </div>
            </div>
            
            <div class="bv-panel-footer">
              <button class="bv-glass-action-button" id="bv-apply-print">
                <span class="material-icons">print</span>
                <span>套用並列印</span>
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      // 10×15cm 模式
      return `
        <div class="bv-glass-panel">
          <div class="bv-panel-header">
            <div class="bv-header-content">
              <div class="bv-icon-wrapper bv-label-mode">
                <span class="material-icons">label</span>
              </div>
              <div class="bv-title-group">
                <h3 class="bv-panel-title">BV SHOP 出貨明細</h3>
                <span class="bv-panel-subtitle">標籤格式模式</span>
              </div>
            </div>
            <button class="bv-glass-button bv-minimize-btn" id="bv-minimize-btn">
              <span class="material-icons">remove</span>
            </button>
          </div>
          
          <div class="bv-panel-content-wrapper">
            <div class="bv-panel-body">
              <!-- 主要操作區 -->
              <div class="bv-primary-section">
                <button id="bv-revert-btn" class="bv-secondary-button">
                  <div class="bv-button-icon">
                    <span class="material-icons">undo</span>
                  </div>
                  <div class="bv-button-content">
                    <span class="bv-button-title">還原 A4 格式</span>
                    <span class="bv-button-subtitle">返回原始版面</span>
                  </div>
                </button>
              </div>
              
              <!-- 間距設定 -->
              <div class="bv-settings-card">
                <h4 class="bv-card-title bv-collapsible">
                  <span class="material-icons">straighten</span>
                  間距調整
                </h4>
                
                <div class="bv-slider-group">
                  <div class="bv-slider-item">
                    <div class="bv-slider-header">
                      <span>標籤內距</span>
                      <span class="bv-value-label" id="bv-padding-value">2.5mm</span>
                    </div>
                    <input type="range" id="bv-label-padding" min="0" max="10" step="0.5" value="2.5" class="bv-glass-slider">
                  </div>
                  
                  <div class="bv-slider-item">
                    <div class="bv-slider-header">
                      <span>標題間距</span>
                      <span class="bv-value-label" id="bv-header-padding-value">0.5mm</span>
                    </div>
                    <input type="range" id="bv-header-padding" min="0" max="5" step="0.1" value="0.5" class="bv-glass-slider">
                  </div>
                  
                  <div class="bv-slider-item">
                    <div class="bv-slider-header">
                      <span>內容間距</span>
                      <span class="bv-value-label" id="bv-row-padding-value">0.8mm</span>
                    </div>
                    <input type="range" id="bv-row-padding" min="0" max="5" step="0.1" value="0.8" class="bv-glass-slider">
                  </div>
                  
                  <div class="bv-slider-item">
                    <div class="bv-slider-header">
                      <span>費用間距</span>
                      <span class="bv-value-label" id="bv-fee-padding-value">0.8mm</span>
                    </div>
                    <input type="range" id="bv-fee-padding" min="0" max="5" step="0.1" value="0.8" class="bv-glass-slider">
                  </div>
                </div>
              </div>
              
              <!-- 顯示設定 -->
              <div class="bv-settings-card">
                <h4 class="bv-card-title bv-collapsible">
                  <span class="material-icons">visibility</span>
                  顯示設定
                </h4>
                
                <div class="bv-settings-list">
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="bv-counter-icon"></span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">數量標示</span>
                        <span class="bv-setting-desc">外框標示數量 ≥ 2</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="bv-highlight-qty">
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">compress</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">精簡模式</span>
                        <span class="bv-setting-desc">僅顯示必要資訊</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="bv-hide-extra-info">
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">view_headline</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">隱藏標題</span>
                        <span class="bv-setting-desc">隱藏表格標題列</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="bv-hide-table-header">
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                  
                  <!-- 文字大小選項 -->
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">text_fields</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">文字大小</span>
                      </div>
                    </div>
                    <select id="fontSize" class="bv-glass-select" style="width: 100px;">
                      <option value="12px">12 px</option>
                      <option value="13px">13 px</option>
                      <option value="14px">14 px</option>
                      <option value="15px">15 px</option>
                      <option value="16px">16 px</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <!-- 原本的顯示控制選項 -->
              <div class="bv-settings-card">
                <h4 class="bv-card-title bv-collapsible">
                  <span class="material-icons">settings</span>
                  詳細設定
                </h4>
                
                <div class="bv-settings-list">
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">image</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">顯示商品圖片</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="showProductImage">
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">comment</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">顯示顧客備註</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="showRemark" checked>
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">admin_panel_settings</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">顯示後台備註</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="showManageRemark" checked>
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">print</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">顯示列印備註</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="showPrintRemark" checked>
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">schedule</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">顯示指定配送時段</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="showDeliveryTime" checked>
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">visibility_off</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">隱藏個人資訊</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="hideInfo">
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">money_off</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">隱藏價格</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="hidePrice">
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">local_shipping</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">顯示預計出貨日</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="showShippingTime" checked>
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                  
                  <div class="bv-setting-item">
                    <div class="bv-setting-info">
                      <span class="material-icons">qr_code</span>
                      <div class="bv-setting-text">
                        <span class="bv-setting-label">顯示物流編號</span>
                      </div>
                    </div>
                    <label class="bv-glass-switch">
                      <input type="checkbox" id="showLogTraceId" checked>
                      <span class="bv-switch-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
              
              <!-- 底圖設定 -->
              <div class="bv-settings-card">
                <h4 class="bv-card-title bv-collapsible">
                  <span class="material-icons">image</span>
                  底圖設定
                </h4>
                
                <div class="bv-logo-upload-area" id="logo-upload-area">
                  <input type="file" id="logo-input" accept="image/png,image/jpeg,image/jpg" style="display:none;">
                  <img id="logo-preview" class="bv-logo-preview" style="display:none;">
                  <div id="upload-prompt">
                    <span class="material-icons" style="font-size:36px; color: #86868b;">add_photo_alternate</span>
                    <div class="bv-upload-hint">點擊上傳底圖（支援 PNG/JPG）</div>
                  </div>
                </div>
                
                <div class="bv-logo-controls" id="logo-controls">
                  <div class="bv-slider-group">
                    <div class="bv-slider-item">
                      <div class="bv-slider-header">
                        <span>底圖大小</span>
                        <span class="bv-value-label" id="logo-size">30%</span>
                      </div>
                      <input type="range" id="logo-size-slider" min="10" max="100" value="30" class="bv-glass-slider">
                    </div>
                    
                    <div class="bv-slider-item">
                      <div class="bv-slider-header">
                        <span>水平位置</span>
                        <span class="bv-value-label" id="logo-x">50%</span>
                      </div>
                      <input type="range" id="logo-x-slider" min="0" max="100" value="50" class="bv-glass-slider">
                    </div>
                    
                    <div class="bv-slider-item">
                      <div class="bv-slider-header">
                        <span>垂直位置</span>
                        <span class="bv-value-label" id="logo-y">50%</span>
                      </div>
                      <input type="range" id="logo-y-slider" min="0" max="100" value="50" class="bv-glass-slider">
                    </div>
                    
                    <div class="bv-slider-item">
                      <div class="bv-slider-header">
                        <span>淡化程度</span>
                        <span class="bv-value-label" id="logo-opacity">20%</span>
                      </div>
                      <input type="range" id="logo-opacity-slider" min="0" max="100" value="20" class="bv-glass-slider">
                    </div>
                  </div>
                  
                  <button class="bv-remove-logo-btn" id="remove-logo-btn">
                    <span class="material-icons">delete</span>
                    移除底圖
                  </button>
                </div>
              </div>
              
              <!-- 預設管理 -->
              <div class="bv-settings-card">
                <h4 class="bv-card-title bv-collapsible">
                  <span class="material-icons">bookmark</span>
                  預設管理
                </h4>
                
                <div class="bv-preset-controls">
                  <select id="bv-preset-select" class="bv-glass-select">
                    <option value="">選擇預設...</option>
                  </select>
                  <div class="bv-preset-buttons">
                    <button class="bv-glass-button" id="bv-save-preset" title="儲存">
                      <span class="material-icons">save</span>
                    </button>
                    <button class="bv-glass-button" id="bv-delete-preset" title="刪除">
                      <span class="material-icons">delete</span>
                    </button>
                  </div>
                </div>
                
                <div class="bv-preset-save-row" id="bv-save-preset-row" style="display:none;">
                  <input type="text" id="bv-new-preset-name" class="bv-glass-input" placeholder="輸入預設名稱...">
                  <div class="bv-preset-buttons">
                    <button class="bv-glass-button bv-primary" id="bv-confirm-save">
                      <span class="material-icons">check</span>
                    </button>
                    <button class="bv-glass-button" id="bv-cancel-save">
                      <span class="material-icons">close</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="bv-panel-footer">
              <button class="bv-glass-action-button" id="bv-apply-print">
                <span class="material-icons">print</span>
                <span>套用並列印</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }
  
  // 更新 A4 模式的樣式
  function updateA4Styles() {
    if (isConverted) return;
    
    const fontSize = document.getElementById('fontSize')?.value || '14px';
    
    // Logo 設定
    const logoSize = document.getElementById('logo-size-slider')?.value || '30';
    const logoX = document.getElementById('logo-x-slider')?.value || '50';
    const logoY = document.getElementById('logo-y-slider')?.value || '50';
    const logoOpacity = document.getElementById('logo-opacity-slider')?.value || '20';
    
    // 隱藏原本的 baseImage
    document.querySelectorAll('.baseImage').forEach(img => {
      img.style.display = 'none';
    });
    
    const oldA4Style = document.getElementById('bv-a4-styles');
    if (oldA4Style) oldA4Style.remove();
    
    const a4Styles = document.createElement('style');
    a4Styles.id = 'bv-a4-styles';
    a4Styles.textContent = `
      /* A4 底圖樣式 */
      .order-content {
        position: relative !important;
      }
      
      .order-content .label-background-logo {
        width: ${logoSize}% !important;
        height: auto !important;
        left: ${logoX}% !important;
        top: ${logoY}% !important;
        transform: translate(-50%, -50%) !important;
        opacity: ${(100 - logoOpacity) / 100} !important;
      }
    `;
    
    document.head.appendChild(a4Styles);
    
    // 更新底圖
    updateA4Logos();
  }
  
  // 更新 A4 模式的底圖
  function updateA4Logos() {
    if (isConverted) return;
    
    // 移除現有的底圖
    document.querySelectorAll('.order-content .label-background-logo').forEach(logo => logo.remove());
    
    if (logoDataUrl) {
      document.querySelectorAll('.order-content').forEach(content => {
        // 跳過有 baseImage 的 order-content
        if (content.querySelector('.baseImage')) return;
        
        const logo = document.createElement('img');
        logo.className = 'label-background-logo';
        logo.src = logoDataUrl;
        content.insertBefore(logo, content.firstChild);
      });
    }
  }
  
  // 轉換為標籤格式
  function convertToLabelFormat() {
    if (isConverted) return;
    
    document.querySelectorAll('.order-content:has(.baseImage)').forEach(e => e.remove());
    
    const contents = document.querySelectorAll('.order-content');
    if (!contents.length) {
      showNotification('沒有找到可轉換的訂單內容', 'warning');
      return;
    }
    
    originalBodyStyle = {
      width: document.body.style.width,
      maxWidth: document.body.style.maxWidth,
      minWidth: document.body.style.minWidth,
      margin: document.body.style.margin,
      padding: document.body.style.padding
    };
    
    document.body.style.width = 'auto';
    document.body.style.maxWidth = 'none';
    document.body.style.minWidth = 'auto';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    document.body.classList.add('bv-converted');
    
    triggerOriginalPageUpdate();
    
    updateLabelStyles();
    
    setTimeout(() => {
      handlePagination();
      
      if (highlightQuantity) {
        setTimeout(() => {
          applyQuantityHighlight();
        }, 100);
      }
    }, 100);
    
    isConverted = true;
    
    updatePanelContent();
    
    showNotification('已成功轉換為10×15cm標籤格式');
  }
  
  // 處理分頁（移除頁碼功能）
  function handlePagination() {
    document.querySelectorAll('.bv-page-container').forEach(container => container.remove());
    document.querySelectorAll('.bv-label-page').forEach(page => page.remove());
    
    const labelPadding = parseFloat(document.getElementById('bv-label-padding')?.value || '2.5');
    const paddingMm = labelPadding;
    const paddingPx = labelPadding * 3.78;
    const pageHeight = 566;
    const contentHeight = pageHeight - (paddingPx * 2);
    
    document.querySelectorAll('.order-content').forEach((orderContent) => {
      orderContent.classList.add('bv-original');
      
      // 複製一份用於處理
      const orderContentClone = orderContent.cloneNode(true);
      
      // 處理精簡模式
      if (hideExtraInfo) {
        processExtraInfoHiding(orderContentClone);
      }
      
      const elements = Array.from(orderContentClone.children);
      let currentPage = null;
      let currentPageContent = null;
      let currentHeight = 0;
      
      const pageContainer = document.createElement('div');
      pageContainer.className = 'bv-page-container';
      orderContent.parentNode.insertBefore(pageContainer, orderContent.nextSibling);
      
      // 創建分頁
      elements.forEach((element, index) => {
        if (hideTableHeader && element.classList.contains('list-title')) {
          return;
        }
        
        const clone = element.cloneNode(true);
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
          position: absolute;
          visibility: hidden;
          width: ${377 - paddingPx * 2}px;
        `;
        wrapper.appendChild(clone);
        document.body.appendChild(wrapper);
        
        const elementHeight = wrapper.offsetHeight;
        document.body.removeChild(wrapper);
        
        if (elementHeight === 0) return;
        
        if (!currentPage || (currentHeight + elementHeight > contentHeight && currentHeight > 0)) {
          currentPage = document.createElement('div');
          currentPage.className = 'bv-label-page';
          currentPage.style.padding = `${paddingMm}mm`;
          
          currentPageContent = document.createElement('div');
          currentPageContent.className = 'bv-page-content';
          currentPage.appendChild(currentPageContent);
          
          pageContainer.appendChild(currentPage);
          currentHeight = 0;
        }
        
        const elementClone = element.cloneNode(true);
        currentPageContent.appendChild(elementClone);
        currentHeight += elementHeight;
      });
    });
    
    // 添加底圖到所有標籤
    updateLogos();
  }
  
  // 更新所有標籤的底圖
  function updateLogos() {
    document.querySelectorAll('.label-background-logo').forEach(logo => logo.remove());
    
    if (logoDataUrl) {
      document.querySelectorAll('.bv-label-page').forEach(page => {
        const logo = document.createElement('img');
        logo.className = 'label-background-logo';
        logo.src = logoDataUrl;
        page.insertBefore(logo, page.firstChild);
      });
    }
  }
  
  // 處理隱藏額外資訊（精簡模式）
  function processExtraInfoHiding(container) {
    const orderInfo = container.querySelector('.order-info');
    if (!orderInfo) return;
    
    const allParagraphs = orderInfo.querySelectorAll('p');
    
    // 要保留的欄位
    const keepPatterns = [
      /訂單編號/,
      /送貨方式/,
      /物流編號/,
      /收件人(?!地址|電話)/,
      /收件人電話/
    ];
    
    allParagraphs.forEach(p => {
      const text = p.textContent.trim();
      let shouldKeep = false;
      
      for (let pattern of keepPatterns) {
        if (pattern.test(text)) {
          shouldKeep = true;
          break;
        }
      }
      
      if (!shouldKeep) {
        p.remove();
      }
    });
  }
  
  // 觸發原始頁面的更新事件
  function triggerOriginalPageUpdate() {
    const event = new Event('change', { bubbles: true });
    document.querySelectorAll('.ignore-print input, .ignore-print select').forEach(el => {
      el.dispatchEvent(event);
    });
  }
  
  // 更新標籤樣式
  function updateLabelStyles() {
    const fontSize = document.getElementById('fontSize')?.value || '14px';
    const labelPadding = document.getElementById('bv-label-padding')?.value || '2.5';
    
    const headerPadding = document.getElementById('bv-header-padding')?.value || '0.5';
    const rowPadding = document.getElementById('bv-row-padding')?.value || '0.8';
    const feePadding = document.getElementById('bv-fee-padding')?.value || '0.8';
    
    // Logo 設定
    const logoSize = document.getElementById('logo-size-slider')?.value || '30';
    const logoX = document.getElementById('logo-x-slider')?.value || '50';
    const logoY = document.getElementById('logo-y-slider')?.value || '50';
    const logoOpacity = document.getElementById('logo-opacity-slider')?.value || '20';
    
    const logoHeightMM = logoSize ? parseFloat(150) * parseFloat(logoSize) / 100 : 0;
    const logoWidthMM = logoHeightMM * logoAspectRatio;
    
    const oldStyle = document.getElementById('bv-label-styles');
    if (oldStyle) oldStyle.remove();
    
    const labelStyles = document.createElement('style');
    labelStyles.id = 'bv-label-styles';
    labelStyles.textContent = `
      body.bv-converted {
        width: auto !important;
        max-width: none !important;
        min-width: auto !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .bv-converted .order-content {
        font-family: 'Noto Sans TC', 'Microsoft JhengHei', Arial, sans-serif !important;
        font-size: ${fontSize} !important;
      }
      
      .bv-label-page * {
        font-family: 'Noto Sans TC', 'Microsoft JhengHei', Arial, sans-serif !important;
        font-size: ${fontSize} !important;
      }
      
      ${hideTableHeader ? `
        .bv-converted .list-title,
        .bv-label-page .list-title {
          display: none !important;
        }
      ` : ''}
      
      .bv-converted .title,
      .bv-label-page .title {
        font-size: 5mm !important;
        font-weight: bold !important;
        margin: 0 0 3mm 0 !important;
        text-align: center !important;
        letter-spacing: 0.5mm !important;
      }
      
      .bv-converted .order-info,
      .bv-label-page .order-info {
        margin: 0 0 3mm 0 !important;
      }
      
      .bv-converted .order-info .row,
      .bv-label-page .order-info .row {
        display: flex !important;
        margin: 0 !important;
      }
      
      .bv-converted .order-info .col-6,
      .bv-label-page .order-info .col-6 {
        flex: 1 !important;
        padding: 0 1mm !important;
      }
      
      .bv-converted .order-info .col-6:first-child,
      .bv-label-page .order-info .col-6:first-child {
        padding-left: 0 !important;
      }
      
      .bv-converted .order-info .col-6:last-child,
      .bv-label-page .order-info .col-6:last-child {
        padding-right: 0 !important;
      }
      
      .bv-converted .order-info p,
      .bv-label-page .order-info p {
        margin: 0 0 1mm 0 !important;
        font-size: calc(${fontSize} - 2px) !important;
        line-height: 1.3 !important;
      }
      
      .bv-converted .list,
      .bv-label-page .list {
        width: 100% !important;
        margin: 0 0 3mm 0 !important;
        border-collapse: collapse !important;
      }
      
      .bv-converted .list-title,
      .bv-label-page .list-title {
        border-top: 0.5mm solid #000 !important;
        border-bottom: 0.5mm solid #000 !important;
      }
      
      .bv-converted .list-title th,
      .bv-label-page .list-title th {
        padding: ${headerPadding}mm 1mm !important;
        font-size: calc(${fontSize} - 1px) !important;
        font-weight: bold !important;
        text-align: left !important;
        line-height: 1.2 !important;
      }
      
      .bv-converted .list-title th.text-right,
      .bv-converted .list-item td.text-right,
      .bv-label-page .list-title th.text-right,
      .bv-label-page .list-item td.text-right {
        text-align: right !important;
      }
      
      .bv-converted .list-item,
      .bv-label-page .list-item {
        border-bottom: 0.2mm solid #ddd !important;
      }
      
      .bv-converted .list-item td,
      .bv-label-page .list-item td {
        padding: ${rowPadding}mm 1mm !important;
        font-size: calc(${fontSize} - 2px) !important;
        vertical-align: top !important;
        line-height: 1.3 !important;
      }
      
      .bv-converted .list-item-name,
      .bv-label-page .list-item-name {
        word-wrap: break-word !important;
      }
      
      .bv-converted .orderProductImage,
      .bv-label-page .orderProductImage {
        width: 8mm !important;
        height: 8mm !important;
        object-fit: cover !important;
        margin: 0 1mm 0.5mm 0 !important;
        vertical-align: middle !important;
      }
      
      /* 費用表格樣式優化 */
      .bv-converted .order-fee,
      .bv-label-page .order-fee {
        width: 100% !important;
        border-collapse: collapse !important;
        margin: 0 0 3mm 0 !important;
        border-top: 0.3mm solid #000 !important;
        border-bottom: 0.3mm solid #000 !important;
        table-layout: fixed !important;
      }
      
      .bv-converted .order-fee td,
      .bv-label-page .order-fee td {
        padding: ${feePadding}mm 1mm !important;
        font-size: calc(${fontSize} - 2px) !important;
        line-height: 1.2 !important;
        vertical-align: middle !important;
        font-weight: normal !important;
      }
      
      .bv-converted .order-fee td:first-child,
      .bv-label-page .order-fee td:first-child {
        text-align: right !important;
        width: 80% !important;
        padding-right: 2mm !important;
      }
      
      .bv-converted .order-fee td:last-child,
      .bv-label-page .order-fee td:last-child {
        text-align: right !important;
        width: 20% !important;
        white-space: nowrap !important;
      }
      
      .bv-converted .order-fee .total,
      .bv-label-page .order-fee .total {
        text-align: right !important;
        font-weight: normal !important;
      }
      
      .bv-converted .orderRemark,
      .bv-converted .orderManageRemark,
      .bv-converted .orderPrintRemark,
      .bv-label-page .orderRemark,
      .bv-label-page .orderManageRemark,
      .bv-label-page .orderPrintRemark {
        font-size: calc(${fontSize} - 3px) !important;
        padding: 2mm !important;
        margin: 0 0 3mm 0 !important;
        border: 0.2mm solid #ccc !important;
        background-color: #f9f9f9 !important;
      }
      
      /* 底圖樣式 */
      .label-background-logo {
        width: ${logoWidthMM}mm !important;
        height: ${logoHeightMM}mm !important;
        left: ${logoX}% !important;
        top: ${logoY}% !important;
        transform: translate(-50%, -50%) !important;
        opacity: ${(100 - logoOpacity) / 100} !important;
      }
    `;
    
    document.head.appendChild(labelStyles);
  }
  
  // 還原原始格式
  function revertToOriginal() {
    if (!isConverted) return;
    
    if (originalBodyStyle) {
      Object.keys(originalBodyStyle).forEach(prop => {
        document.body.style[prop] = originalBodyStyle[prop];
      });
    }
    
    location.reload();
  }
  
  // 切換數量標示
  function toggleQuantityHighlight(e) {
    highlightQuantity = e.target.checked;
    saveSettings();
    
    if (highlightQuantity) {
      applyQuantityHighlight();
    } else {
      removeQuantityHighlight();
    }
  }
    
  // 應用數量標示（修改版：個位數用圓形，十位數以上用圓角矩形）
  function applyQuantityHighlight() {
    // 選擇所有可能的容器（包括 A4 模式的 .order-content）
    const containers = isConverted ? 
      document.querySelectorAll('.bv-label-page') : 
      document.querySelectorAll('.order-content');
    
    containers.forEach(container => {
      container.querySelectorAll('.list-item').forEach(item => {
        let qtyCell = null;
        const cells = item.querySelectorAll('td');
        
        for (let i = cells.length - 2; i >= 0; i--) {
          const text = cells[i].textContent.trim();
          if (/^\d+$/.test(text) && parseInt(text) > 0) {
            qtyCell = cells[i];
            break;
          }
        }
        
        if (qtyCell && !qtyCell.querySelector('.bv-qty-badge')) {
          const qty = parseInt(qtyCell.textContent.trim());
          
          if (qty === 1) {
            // 數量 1：完全透明，沒有外框
            qtyCell.innerHTML = `<span class="bv-qty-badge qty-one">${qty}</span>`;
          } else if (qty >= 2 && qty <= 9) {
            // 個位數（2-9）：圓形外框
            qtyCell.innerHTML = `<span class="bv-qty-badge single-digit">${qty}</span>`;
          } else if (qty >= 10) {
            // 十位數以上：圓角矩形外框
            qtyCell.innerHTML = `<span class="bv-qty-badge">${qty}</span>`;
          }
        }
      });
    });
  }
  
  // 移除數量標示
  function removeQuantityHighlight() {
    document.querySelectorAll('.bv-qty-badge').forEach(badge => {
      const parent = badge.parentElement;
      const qty = badge.textContent;
      parent.textContent = qty;
    });
  }
  
  // 顯示通知
  function showNotification(message, type = 'success') {
    const existing = document.querySelector('.bv-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `bv-notification ${type}`;
    
    const icon = document.createElement('span');
    icon.className = 'material-icons';
    icon.textContent = type === 'success' ? 'check_circle' : 'warning';
    
    notification.appendChild(icon);
    notification.appendChild(document.createTextNode(message));
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      setTimeout(() => notification.remove(), 400);
    }, 3000);
  }
  
  // 儲存設定
  function saveSettings() {
    const settings = {
      highlightQuantity: highlightQuantity,
      hideExtraInfo: hideExtraInfo,
      hideTableHeader: hideTableHeader,
      labelPadding: document.getElementById('bv-label-padding')?.value || '2.5',
      headerPadding: document.getElementById('bv-header-padding')?.value || '0.5',
      rowPadding: document.getElementById('bv-row-padding')?.value || '0.8',
      feePadding: document.getElementById('bv-fee-padding')?.value || '0.8',
      fontSize: document.getElementById('fontSize')?.value || '14px',
      showProductImage: document.getElementById('showProductImage')?.checked,
      showRemark: document.getElementById('showRemark')?.checked,
      showManageRemark: document.getElementById('showManageRemark')?.checked,
      showPrintRemark: document.getElementById('showPrintRemark')?.checked,
      showDeliveryTime: document.getElementById('showDeliveryTime')?.checked,
      hideInfo: document.getElementById('hideInfo')?.checked,
      hidePrice: document.getElementById('hidePrice')?.checked,
      showShippingTime: document.getElementById('showShippingTime')?.checked,
      showLogTraceId: document.getElementById('showLogTraceId')?.checked,
      logoDataUrl: logoDataUrl,
      logoAspectRatio: logoAspectRatio,
      logoSize: document.getElementById('logo-size-slider')?.value || '30',
      logoX: document.getElementById('logo-x-slider')?.value || '50',
      logoY: document.getElementById('logo-y-slider')?.value || '50',
      logoOpacity: document.getElementById('logo-opacity-slider')?.value || '20'
    };
    
    chrome.storage.local.set({ bvLabelSettings: settings });
  }
  
  // 載入設定
  function loadSettings() {
    chrome.storage.local.get(['bvLabelSettings', 'lastSelectedPreset', 'bvPanelMinimized'], (result) => {
      if (result.bvLabelSettings) {
        const settings = result.bvLabelSettings;
        
        // 共通設定
        highlightQuantity = settings.highlightQuantity !== undefined ? settings.highlightQuantity : false;
        const qtyCheckbox = document.getElementById('bv-highlight-qty');
        if (qtyCheckbox) qtyCheckbox.checked = highlightQuantity;
        
        // 載入其他設定
        if (settings.fontSize) {
          const fontSizeSelect = document.getElementById('fontSize');
          if (fontSizeSelect) fontSizeSelect.value = settings.fontSize;
        }
        
        const checkboxSettings = {
          showProductImage: settings.showProductImage,
          showRemark: settings.showRemark,
          showManageRemark: settings.showManageRemark,
          showPrintRemark: settings.showPrintRemark,
          showDeliveryTime: settings.showDeliveryTime,
          hideInfo: settings.hideInfo,
          hidePrice: settings.hidePrice,
          showShippingTime: settings.showShippingTime,
          showLogTraceId: settings.showLogTraceId
        };
        
        Object.keys(checkboxSettings).forEach(key => {
          const checkbox = document.getElementById(key);
          if (checkbox && checkboxSettings[key] !== undefined) {
            checkbox.checked = checkboxSettings[key];
          }
        });
        
        // 標籤模式專屬設定
        if (isConverted) {
          hideExtraInfo = settings.hideExtraInfo !== undefined ? settings.hideExtraInfo : false;
          const hideExtraCheckbox = document.getElementById('bv-hide-extra-info');
          if (hideExtraCheckbox) hideExtraCheckbox.checked = hideExtraInfo;
          
          hideTableHeader = settings.hideTableHeader !== undefined ? settings.hideTableHeader : false;
          const hideHeaderCheckbox = document.getElementById('bv-hide-table-header');
          if (hideHeaderCheckbox) hideHeaderCheckbox.checked = hideTableHeader;
          
          const paddingInput = document.getElementById('bv-label-padding');
          if (paddingInput && settings.labelPadding) {
            paddingInput.value = settings.labelPadding;
            document.getElementById('bv-padding-value').textContent = settings.labelPadding + 'mm';
            updateRangeProgress(paddingInput);
          }
          
          const spacingSettings = [
            { id: 'bv-header-padding', value: settings.headerPadding, valueId: 'bv-header-padding-value' },
            { id: 'bv-row-padding', value: settings.rowPadding, valueId: 'bv-row-padding-value' },
            { id: 'bv-fee-padding', value: settings.feePadding, valueId: 'bv-fee-padding-value' }
          ];
          
          spacingSettings.forEach(setting => {
            if (setting.value !== undefined) {
              const input = document.getElementById(setting.id);
              if (input) {
                input.value = setting.value;
                document.getElementById(setting.valueId).textContent = setting.value + 'mm';
                updateRangeProgress(input);
              }
            }
          });
        }
        
        // Logo 設定
        if (settings.logoDataUrl) {
          logoDataUrl = settings.logoDataUrl;
          logoAspectRatio = settings.logoAspectRatio || 1;
          
          const logoPreview = document.getElementById('logo-preview');
          const uploadPrompt = document.getElementById('upload-prompt');
          const logoUploadArea = document.getElementById('logo-upload-area');
          const logoControls = document.getElementById('logo-controls');
          
          if (logoPreview) {
            logoPreview.src = logoDataUrl;
            logoPreview.style.display = 'block';
          }
          if (uploadPrompt) uploadPrompt.style.display = 'none';
          if (logoUploadArea) logoUploadArea.classList.add('has-logo');
          if (logoControls) logoControls.classList.add('active');
        }
        
        const logoSettings = [
          { id: 'logo-size-slider', value: settings.logoSize, valueId: 'logo-size' },
          { id: 'logo-x-slider', value: settings.logoX, valueId: 'logo-x' },
          { id: 'logo-y-slider', value: settings.logoY, valueId: 'logo-y' },
          { id: 'logo-opacity-slider', value: settings.logoOpacity, valueId: 'logo-opacity' }
        ];
        
        logoSettings.forEach(setting => {
          if (setting.value !== undefined) {
            const input = document.getElementById(setting.id);
            if (input) {
              input.value = setting.value;
              document.getElementById(setting.valueId).textContent = setting.value + '%';
              updateRangeProgress(input);
            }
          }
        });
        
        // 同步到原始控制項（如果在 A4 模式）
        if (!isConverted && originalControlsElement) {
          Object.keys(checkboxSettings).forEach(key => {
            const originalCheckbox = originalControlsElement.querySelector(`#${key}`);
            if (originalCheckbox && checkboxSettings[key] !== undefined) {
              originalCheckbox.checked = checkboxSettings[key];
            }
          });
          
          const originalFontSize = originalControlsElement.querySelector('#fontSize');
          if (originalFontSize && settings.fontSize) {
            originalFontSize.value = settings.fontSize;
          }
        }
      }
      
      if (result.bvPanelMinimized !== undefined) {
        isPanelMinimized = result.bvPanelMinimized;
        const panel = document.getElementById('bv-label-control-panel');
        const minimizeBtn = document.getElementById('bv-minimize-btn');
        
        if (isPanelMinimized && panel && minimizeBtn) {
          panel.classList.add('minimized');
          minimizeBtn.querySelector('.material-icons').textContent = 'add';
        }
      }
      
      if (result.lastSelectedPreset && isConverted) {
        chrome.storage.local.get([`bvPreset_${result.lastSelectedPreset}`], (presetResult) => {
          const presetSettings = presetResult[`bvPreset_${result.lastSelectedPreset}`];
          if (presetSettings) {
            applyPresetSettings(presetSettings);
          }
        });
      }
    });
  }
  
  // 初始化
  if (window.location.href.includes('order_print')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createControlPanel);
    } else {
      createControlPanel();
    }
  }
})();
