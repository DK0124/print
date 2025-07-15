// BV SHOP 標籤機-出貨明細
(function() {
  'use strict';
  
  let isConverted = false;
  let highlightQuantity = false;
  let boldMode = false;
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
  
  // 創建控制面板
  function createControlPanel() {
    if (document.getElementById('bv-label-control-panel')) return;
    
    const panel = document.createElement('div');
    panel.id = 'bv-label-control-panel';
    
    // 根據轉換狀態顯示不同內容
    function getPanelContent() {
      if (!isConverted) {
        // A4 模式
        return `
          <div class="bv-panel-header">
            <h3>
              <div class="bv-icon-wrapper">
                <span class="material-icons">local_shipping</span>
              </div>
              <span class="bv-panel-title">BV SHOP 標籤機-出貨明細</span>
            </h3>
            <div class="bv-header-controls">
              <button class="bv-header-button" id="bv-minimize-btn" title="最小化">
                <span class="material-icons">remove</span>
              </button>
            </div>
          </div>
          
          <div class="bv-panel-content-wrapper">
            <div class="bv-panel-body bv-simple-body">
              <!-- 轉換按鈕 -->
              <div class="bv-action-section">
                <button id="bv-convert-btn" class="bv-action-button primary">
                  <span class="material-icons">transform</span>
                  <span class="bv-button-text">轉為10×15cm標籤</span>
                </button>
              </div>
              
              <!-- 數量標示開關 -->
              <div class="bv-simple-controls">
                <div class="bv-switch-container">
                  <label class="bv-switch">
                    <input type="checkbox" id="bv-highlight-qty">
                    <span class="bv-slider"></span>
                  </label>
                  <span class="bv-switch-label">數量提示</span>
                </div>
              </div>
            </div>
            
            <!-- 固定在底部的列印按鈕 -->
            <div class="bv-panel-footer">
              <button class="bv-print-button" id="bv-apply-print">
                <span class="material-icons">print</span>
                <span class="bv-button-text">套用並列印</span>
              </button>
            </div>
          </div>
        `;
      } else {
        // 10×15cm 模式
        return `
          <div class="bv-panel-header">
            <h3>
              <div class="bv-icon-wrapper">
                <span class="material-icons">label</span>
              </div>
              <span class="bv-panel-title">10×15cm 標籤模式</span>
            </h3>
            <div class="bv-header-controls">
              <button class="bv-header-button" id="bv-minimize-btn" title="最小化">
                <span class="material-icons">remove</span>
              </button>
            </div>
          </div>
          
          <div class="bv-panel-content-wrapper">
            <div class="bv-panel-body">
              <!-- 還原按鈕 -->
              <div class="bv-action-section">
                <button id="bv-revert-btn" class="bv-action-button secondary">
                  <span class="material-icons">undo</span>
                  <span class="bv-button-text">還原A4格式</span>
                </button>
              </div>
              
              <!-- 設定區塊 -->
              <div class="bv-settings-section">
                <!-- 間距控制 -->
                <div class="bv-spacing-group">
                  <h4 class="bv-group-title">
                    <span class="material-icons">straighten</span>
                    間距設定
                  </h4>
                  
                  <div class="bv-control-item">
                    <div class="bv-control-label">
                      <span>標籤內距</span>
                      <span class="bv-value-badge" id="bv-padding-value">2.5mm</span>
                    </div>
                    <input type="range" id="bv-label-padding" min="0" max="10" step="0.5" value="2.5" class="bv-range">
                  </div>
                  
                  <div class="bv-control-item">
                    <div class="bv-control-label">
                      <span>標題間距</span>
                      <span class="bv-value-badge" id="bv-header-padding-value">0.5mm</span>
                    </div>
                    <input type="range" id="bv-header-padding" min="0" max="5" step="0.1" value="0.5" class="bv-range">
                  </div>
                  
                  <div class="bv-control-item">
                    <div class="bv-control-label">
                      <span>內容間距</span>
                      <span class="bv-value-badge" id="bv-row-padding-value">0.8mm</span>
                    </div>
                    <input type="range" id="bv-row-padding" min="0" max="5" step="0.1" value="0.8" class="bv-range">
                  </div>
                  
                  <div class="bv-control-item">
                    <div class="bv-control-label">
                      <span>費用間距</span>
                      <span class="bv-value-badge" id="bv-fee-padding-value">0.8mm</span>
                    </div>
                    <input type="range" id="bv-fee-padding" min="0" max="5" step="0.1" value="0.8" class="bv-range">
                  </div>
                </div>
                
                <!-- 開關選項 -->
                <div class="bv-switches-group">
                  <h4 class="bv-group-title">
                    <span class="material-icons">tune</span>
                    顯示設定
                  </h4>
                  
                  <div class="bv-switch-container">
                    <label class="bv-switch">
                      <input type="checkbox" id="bv-highlight-qty">
                      <span class="bv-slider"></span>
                    </label>
                    <span class="bv-switch-label">數量提示</span>
                  </div>
                  
                  <div class="bv-switch-container">
                    <label class="bv-switch">
                      <input type="checkbox" id="bv-bold-mode">
                      <span class="bv-slider"></span>
                    </label>
                    <span class="bv-switch-label">整體加粗</span>
                  </div>
                  
                  <div class="bv-switch-container">
                    <label class="bv-switch">
                      <input type="checkbox" id="bv-hide-extra-info">
                      <span class="bv-slider"></span>
                    </label>
                    <span class="bv-switch-label">精簡模式</span>
                  </div>
                  
                  <div class="bv-switch-container">
                    <label class="bv-switch">
                      <input type="checkbox" id="bv-hide-table-header">
                      <span class="bv-slider"></span>
                    </label>
                    <span class="bv-switch-label">隱藏標題</span>
                  </div>
                </div>
                
                <!-- 預設管理 -->
                <div class="bv-preset-group">
                  <h4 class="bv-group-title">
                    <span class="material-icons">bookmark</span>
                    預設管理
                  </h4>
                  
                  <div class="bv-preset-row">
                    <select id="bv-preset-select">
                      <option value="">選擇預設</option>
                    </select>
                    <div class="bv-preset-actions">
                      <button class="bv-icon-button" id="bv-save-preset" title="儲存設定">
                        <span class="material-icons">save</span>
                      </button>
                      <button class="bv-icon-button" id="bv-delete-preset" title="刪除設定">
                        <span class="material-icons">delete</span>
                      </button>
                    </div>
                  </div>
                  <div class="bv-preset-row bv-save-row" id="bv-save-preset-row" style="display:none;">
                    <input type="text" id="bv-new-preset-name" placeholder="輸入名稱">
                    <div class="bv-button-group">
                      <button class="bv-small-button primary" id="bv-confirm-save">確認</button>
                      <button class="bv-small-button" id="bv-cancel-save">取消</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 固定在底部的列印按鈕 -->
            <div class="bv-panel-footer">
              <button class="bv-print-button" id="bv-apply-print">
                <span class="material-icons">print</span>
                <span class="bv-button-text">套用並列印</span>
              </button>
            </div>
          </div>
        `;
      }
    }
    
    panel.innerHTML = getPanelContent();
    
    // 添加樣式
    const style = document.createElement('style');
    style.textContent = `
    /* 移除所有元素的 focus outline 和邊框 */
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
    
    button:focus,
    select:focus,
    input:focus {
      outline: none !important;
    }
      
    /* 控制面板主體 */
    #bv-label-control-panel,
    #bv-label-control-panel * {
      font-weight: normal !important;
    }
    
    #bv-label-control-panel {
      position: fixed;
      right: 20px;
      top: 20px;
      bottom: 20px;
      width: 380px;
      background: #ffffff;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.06);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans TC', 'Microsoft JhengHei', Roboto, sans-serif;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
    }
    
    #bv-label-control-panel:hover {
      box-shadow: 0 12px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
    }
     
    /* 最小化狀態 */
    #bv-label-control-panel.minimized {
      height: auto;
      bottom: auto;
      width: auto;
      min-width: 320px;
    }
    
    #bv-label-control-panel.minimized .bv-panel-content-wrapper {
      display: none;
    }
    
    /* 浮動按鈕 */
    .bv-floating-button {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #5865F2 0%, #7289DA 100%);
      color: white;
      border: none;
      border-radius: 50%;
      box-shadow: 0 4px 14px rgba(88, 101, 242, 0.3);
      cursor: pointer;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      transition: all 0.3s ease;
    }
    
    .bv-floating-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(88, 101, 242, 0.4);
    }
    
    .bv-floating-button .material-icons {
      font-size: 28px;
    }
    
    #bv-label-control-panel.minimized ~ .bv-floating-button {
      display: flex;
    }
    
    /* 面板標題 */
    .bv-panel-header {
      background: linear-gradient(135deg, #5865F2 0%, #7289DA 100%);
      color: white;
      padding: 20px 24px;
      box-shadow: 0 2px 8px rgba(88, 101, 242, 0.2);
      flex-shrink: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      user-select: none;
    }
    
    .bv-panel-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600 !important;
      display: flex;
      align-items: center;
      gap: 10px;
      letter-spacing: -0.02em;
    }
    
    .bv-panel-title {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 600 !important;
    }
    
    /* 標題控制按鈕 */
    .bv-header-controls {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .bv-header-button {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 8px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      color: white;
    }
    
    .bv-header-button:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }
    
    .bv-header-button .material-icons {
      font-size: 20px;
    }
    
    .bv-icon-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      flex-shrink: 0;
    }
    
    .bv-icon-wrapper .material-icons {
      font-size: 20px;
    }
    
    /* 內容包裝器 */
    .bv-panel-content-wrapper {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }
    
    /* 面板內容 */
    .bv-panel-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
      -webkit-overflow-scrolling: touch;
    }
    
    /* 簡單模式的內容 */
    .bv-panel-body.bv-simple-body {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    /* 面板底部 */
    .bv-panel-footer {
      background: linear-gradient(to top, #fafbfc, #ffffff);
      padding: 20px 24px;
      border-top: 1px solid #eef0f2;
      border-radius: 0 0 20px 20px;
      flex-shrink: 0;
    }
    
    /* 動作區域 */
    .bv-action-section {
      margin-bottom: 0;
    }
    
    /* 動作按鈕 */
    .bv-action-button {
      width: 100%;
      background: linear-gradient(135deg, #5865F2 0%, #7289DA 100%);
      color: white;
      border: none;
      padding: 16px 24px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600 !important;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 4px 14px rgba(88, 101, 242, 0.3);
      position: relative;
      overflow: hidden;
      white-space: nowrap;
    }
    
    .bv-action-button:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #7289DA 0%, #8ea1e1 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .bv-action-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(88, 101, 242, 0.4);
    }
    
    .bv-action-button:hover:before {
      opacity: 1;
    }
    
    .bv-action-button:active {
      transform: translateY(0);
    }
    
    .bv-action-button .material-icons {
      font-size: 24px;
      position: relative;
      z-index: 1;
      flex-shrink: 0;
    }
    
    .bv-action-button .bv-button-text {
      position: relative;
      z-index: 1;
      flex-shrink: 0;
      font-weight: 600 !important;
    }
    
    .bv-action-button.secondary {
      background: linear-gradient(135deg, #f04747 0%, #e74c3c 100%);
      box-shadow: 0 4px 14px rgba(240, 71, 71, 0.3);
    }
    
    .bv-action-button.secondary:before {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    }
    
    .bv-action-button.secondary:hover {
      box-shadow: 0 6px 20px rgba(240, 71, 71, 0.4);
    }
    
    /* 簡單控制區 */
    .bv-simple-controls {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 12px;
    }
    
    /* 設定區塊 */
    .bv-settings-section {
      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-top: 24px;
    }
    
    /* 群組標題 */
    .bv-group-title {
      margin: 0 0 16px 0;
      font-size: 14px;
      font-weight: 600 !important;
      color: #4a5568;
      display: flex;
      align-items: center;
      gap: 8px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .bv-group-title .material-icons {
      font-size: 18px;
      color: #7289DA;
    }
    
    /* 間距群組 */
    .bv-spacing-group,
    .bv-switches-group,
    .bv-preset-group {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #e9ecef;
    }
    
    /* 控制項目 */
    .bv-control-item {
      margin-bottom: 20px;
    }
    
    .bv-control-item:last-child {
      margin-bottom: 0;
    }
    
    .bv-control-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-weight: 500 !important;
      color: #24292e;
      font-size: 14px;
    }
    
    .bv-value-badge {
      background: linear-gradient(135deg, #5865F2 0%, #7289DA 100%);
      color: white;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600 !important;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
      min-width: 45px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(88, 101, 242, 0.2);
    }
    
    /* Range Input */
    input[type="range"] {
      width: 100%;
      height: 6px;
      background: #e8eaed;
      border-radius: 3px;
      outline: none;
      -webkit-appearance: none;
      margin: 0;
      position: relative;
    }
    
    input[type="range"]:before {
      content: '';
      position: absolute;
      height: 6px;
      border-radius: 3px;
      background: linear-gradient(90deg, #5865F2 0%, #7289DA 100%);
      width: var(--value, 0%);
      pointer-events: none;
    }
    
    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      background: white;
      border: 3px solid #5865F2;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(88, 101, 242, 0.3);
      transition: all 0.2s ease;
      position: relative;
      z-index: 1;
    }
    
    input[type="range"]::-webkit-slider-thumb:hover {
      transform: scale(1.1);
      box-shadow: 0 3px 8px rgba(88, 101, 242, 0.4);
    }
    
    input[type="range"]::-moz-range-thumb {
      width: 20px;
      height: 20px;
      background: white;
      border: 3px solid #5865F2;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(88, 101, 242, 0.3);
      transition: all 0.2s ease;
    }
    
    /* 開關容器 */
    .bv-switch-container {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .bv-switch-container:last-child {
      margin-bottom: 0;
    }
    
    .bv-switch-label {
      font-size: 14px;
      color: #24292e;
      font-weight: 500 !important;
      flex: 1;
    }
    
    /* 開關樣式 */
    .bv-switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
      flex-shrink: 0;
    }
    
    .bv-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    
    .bv-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #cbd5e1;
      transition: .3s;
      border-radius: 24px;
    }
    
    .bv-slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .3s;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .bv-switch input:checked + .bv-slider {
      background: linear-gradient(135deg, #5865F2 0%, #7289DA 100%);
    }
    
    .bv-switch input:checked + .bv-slider:before {
      transform: translateX(20px);
    }
    
    /* 預設管理 */
    .bv-preset-row {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .bv-preset-row:last-child {
      margin-bottom: 0;
    }
    
    #bv-preset-select {
      flex: 1;
      min-width: 0;
      background: white;
      border: 2px solid #e8eaed;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 14px;
      color: #24292e;
      transition: all 0.2s ease;
      font-weight: 500 !important;
    }
    
    #bv-preset-select:hover {
      border-color: #7289DA;
    }
    
    #bv-preset-select:focus {
      outline: none;
      border-color: #5865F2;
      box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1);
    }
    
    .bv-preset-actions {
      display: flex;
      gap: 8px;
    }
    
    /* 設定檔名稱輸入框 */
    #bv-new-preset-name {
      flex: 1;
      min-width: 0;
      background: white;
      border: 2px solid #e8eaed;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 14px;
      color: #24292e;
      transition: all 0.2s ease;
      font-weight: 500 !important;
    }
    
    #bv-new-preset-name:hover {
      border-color: #7289DA;
    }
    
    #bv-new-preset-name:focus {
      outline: none;
      border-color: #5865F2;
      box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1);
    }
    
    #bv-new-preset-name::placeholder {
      color: #9ca3af;
      font-weight: 400 !important;
    }
    
    .bv-icon-button {
      background: white;
      border: 2px solid #e8eaed;
      border-radius: 8px;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 36px;
      height: 36px;
      flex-shrink: 0;
    }
    
    .bv-icon-button:hover {
      background: #f8f9ff;
      border-color: #7289DA;
      transform: translateY(-1px);
    }
    
    .bv-icon-button:active {
      transform: translateY(0);
    }
    
    .bv-icon-button .material-icons {
      font-size: 18px;
      color: #5865F2;
    }
    
    /* 按鈕群組 */
    .bv-button-group {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
    
    .bv-small-button {
      padding: 8px 16px;
      background: white;
      border: 2px solid #e8eaed;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600 !important;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    
    .bv-small-button:hover {
      background: #f8f9ff;
      border-color: #7289DA;
      color: #5865F2;
    }
    
    .bv-small-button.primary {
      background: linear-gradient(135deg, #5865F2 0%, #7289DA 100%);
      color: white;
      border-color: transparent;
      box-shadow: 0 2px 6px rgba(88, 101, 242, 0.3);
    }
    
    .bv-small-button.primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(88, 101, 242, 0.35);
    }
    
    /* 列印按鈕 */
    .bv-print-button {
      width: 100%;
      background: linear-gradient(135deg, #5865F2 0%, #7289DA 100%);
      color: white;
      border: none;
      padding: 16px 24px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600 !important;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 4px 14px rgba(88, 101, 242, 0.3);
      position: relative;
      overflow: hidden;
      white-space: nowrap;
    }
    
    .bv-print-button:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #7289DA 0%, #8ea1e1 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .bv-print-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(88, 101, 242, 0.4);
    }
    
    .bv-print-button:hover:before {
      opacity: 1;
    }
    
    .bv-print-button:active {
      transform: translateY(0);
    }
    
    .bv-print-button .material-icons {
      font-size: 24px;
      position: relative;
      z-index: 1;
      flex-shrink: 0;
    }
    
    .bv-print-button .bv-button-text {
      position: relative;
      z-index: 1;
      flex-shrink: 0;
      font-weight: 600 !important;
    }
    
    /* 圓圈數字樣式 */
    .bv-qty-circle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.2em;
      height: 1.2em;
      padding: 0;
      border: 1.5px solid currentColor;
      color: inherit;
      border-radius: 50%;
      font-weight: bold;
      font-size: 0.9em;
      line-height: 1;
      vertical-align: middle;
      position: relative;
      top: -0.05em;
    }
    
    .bv-qty-circle.transparent {
      border-color: transparent;
    }
    
    /* 列印時保持圓圈樣式 */
    @media print {
      .bv-qty-circle {
        border: 1.5px solid currentColor !important;
        color: inherit !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .bv-qty-circle.transparent {
        border-color: transparent !important;
      }
      
      .bv-converted.bold-mode .order-content * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        font-weight: 700 !important;
      }
    }
    
    /* 滾動條樣式 */
    .bv-panel-body::-webkit-scrollbar {
      width: 8px;
    }
    
    .bv-panel-body::-webkit-scrollbar-track {
      background: #f8f9fa;
      border-radius: 4px;
    }
    
    .bv-panel-body::-webkit-scrollbar-thumb {
      background: linear-gradient(135deg, #d4d7dd 0%, #c1c4cb 100%);
      border-radius: 4px;
    }
    
    .bv-panel-body::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(135deg, #b8bcc4 0%, #a8abb3 100%);
    }
    
    /* 通知樣式 */
    .bv-notification {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.95);
      color: #059669;
      padding: 16px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500 !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      z-index: 100001;
      display: flex;
      align-items: center;
      gap: 10px;
      backdrop-filter: blur(10px);
      border-left: 4px solid #10b981;
      animation: slideDown 0.3s ease-out;
    }
    
    .bv-notification.warning {
      color: #d97706;
      border-left-color: #f59e0b;
    }
    
    .bv-notification .material-icons {
      font-size: 20px;
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
    
    /* 覆蓋原始樣式 */
    body.bv-converted {
      width: auto !important;
      max-width: none !important;
      min-width: auto !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    /* 轉換後的樣式 */
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
      
      .bv-page-indicator {
        position: absolute;
        bottom: 10px;
        right: 10px;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: normal !important;
        z-index: 100;
      }
      
      .bv-converted .order-content.bv-original {
        display: none !important;
      }
    }
    
    @media print {
      #bv-label-control-panel,
      .bv-floating-button,
      .bv-page-indicator {
        display: none !important;
      }
      
      html, body {
        width: auto !important;
        max-width: none !important;
        min-width: auto !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      @page {
        size: 100mm 150mm;
        margin: 0;
      }
      
      .bv-label-page {
        width: 100mm !important;
        height: 150mm !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        page-break-after: always !important;
        page-break-inside: avoid !important;
        box-shadow: none !important;
        border: none !important;
      }
      
      .bv-label-page:last-child {
        page-break-after: auto !important;
      }
      
      body > *:not(.bv-page-container):not(.bv-label-page) {
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
  }
  
  // 更新面板內容
  function updatePanelContent() {
    const panel = document.getElementById('bv-label-control-panel');
    if (!panel) return;
    
    // 保存最小化狀態
    const wasMinimized = panel.classList.contains('minimized');
    
    // 更新內容
    panel.innerHTML = getPanelContent();
    
    // 恢復最小化狀態
    if (wasMinimized) {
      panel.classList.add('minimized');
      const minimizeBtn = panel.querySelector('#bv-minimize-btn');
      if (minimizeBtn) {
        minimizeBtn.querySelector('.material-icons').textContent = 'add';
      }
    }
    
    // 重新綁定事件
    setupEventListeners();
    
    // 重新載入設定
    if (isConverted) {
      loadSettings();
      initPresetSystem();
    }
  }
  
  // 取得面板內容的函數
  function getPanelContent() {
    if (!isConverted) {
      // A4 模式
      return `
        <div class="bv-panel-header">
          <h3>
            <div class="bv-icon-wrapper">
              <span class="material-icons">local_shipping</span>
            </div>
            <span class="bv-panel-title">BV SHOP 標籤機-出貨明細</span>
          </h3>
          <div class="bv-header-controls">
            <button class="bv-header-button" id="bv-minimize-btn" title="最小化">
              <span class="material-icons">remove</span>
            </button>
          </div>
        </div>
        
        <div class="bv-panel-content-wrapper">
          <div class="bv-panel-body bv-simple-body">
            <!-- 轉換按鈕 -->
            <div class="bv-action-section">
              <button id="bv-convert-btn" class="bv-action-button primary">
                <span class="material-icons">transform</span>
                <span class="bv-button-text">轉為10×15cm標籤</span>
              </button>
            </div>
            
            <!-- 數量標示開關 -->
            <div class="bv-simple-controls">
              <div class="bv-switch-container">
                <label class="bv-switch">
                  <input type="checkbox" id="bv-highlight-qty">
                  <span class="bv-slider"></span>
                </label>
                <span class="bv-switch-label">數量提示</span>
              </div>
            </div>
          </div>
          
          <!-- 固定在底部的列印按鈕 -->
          <div class="bv-panel-footer">
            <button class="bv-print-button" id="bv-apply-print">
              <span class="material-icons">print</span>
              <span class="bv-button-text">套用並列印</span>
            </button>
          </div>
        </div>
      `;
    } else {
      // 10×15cm 模式
      return `
        <div class="bv-panel-header">
          <h3>
            <div class="bv-icon-wrapper">
              <span class="material-icons">label</span>
            </div>
            <span class="bv-panel-title">10×15cm 標籤模式</span>
          </h3>
          <div class="bv-header-controls">
            <button class="bv-header-button" id="bv-minimize-btn" title="最小化">
              <span class="material-icons">remove</span>
            </button>
          </div>
        </div>
        
        <div class="bv-panel-content-wrapper">
          <div class="bv-panel-body">
            <!-- 還原按鈕 -->
            <div class="bv-action-section">
              <button id="bv-revert-btn" class="bv-action-button secondary">
                <span class="material-icons">undo</span>
                <span class="bv-button-text">還原A4格式</span>
              </button>
            </div>
            
            <!-- 設定區塊 -->
            <div class="bv-settings-section">
              <!-- 間距控制 -->
              <div class="bv-spacing-group">
                <h4 class="bv-group-title">
                  <span class="material-icons">straighten</span>
                  間距設定
                </h4>
                
                <div class="bv-control-item">
                  <div class="bv-control-label">
                    <span>標籤內距</span>
                    <span class="bv-value-badge" id="bv-padding-value">2.5mm</span>
                  </div>
                  <input type="range" id="bv-label-padding" min="0" max="10" step="0.5" value="2.5" class="bv-range">
                </div>
                
                <div class="bv-control-item">
                  <div class="bv-control-label">
                    <span>標題間距</span>
                    <span class="bv-value-badge" id="bv-header-padding-value">0.5mm</span>
                  </div>
                  <input type="range" id="bv-header-padding" min="0" max="5" step="0.1" value="0.5" class="bv-range">
                </div>
                
                <div class="bv-control-item">
                  <div class="bv-control-label">
                    <span>內容間距</span>
                    <span class="bv-value-badge" id="bv-row-padding-value">0.8mm</span>
                  </div>
                  <input type="range" id="bv-row-padding" min="0" max="5" step="0.1" value="0.8" class="bv-range">
                </div>
                
                <div class="bv-control-item">
                  <div class="bv-control-label">
                    <span>費用間距</span>
                    <span class="bv-value-badge" id="bv-fee-padding-value">0.8mm</span>
                  </div>
                  <input type="range" id="bv-fee-padding" min="0" max="5" step="0.1" value="0.8" class="bv-range">
                </div>
              </div>
              
              <!-- 開關選項 -->
              <div class="bv-switches-group">
                <h4 class="bv-group-title">
                  <span class="material-icons">tune</span>
                  顯示設定
                </h4>
                
                <div class="bv-switch-container">
                  <label class="bv-switch">
                    <input type="checkbox" id="bv-highlight-qty">
                    <span class="bv-slider"></span>
                  </label>
                  <span class="bv-switch-label">數量提示</span>
                </div>
                
                <div class="bv-switch-container">
                  <label class="bv-switch">
                    <input type="checkbox" id="bv-bold-mode">
                    <span class="bv-slider"></span>
                  </label>
                  <span class="bv-switch-label">整體加粗</span>
                </div>
                
                <div class="bv-switch-container">
                  <label class="bv-switch">
                    <input type="checkbox" id="bv-hide-extra-info">
                    <span class="bv-slider"></span>
                  </label>
                  <span class="bv-switch-label">精簡模式</span>
                </div>
                
                <div class="bv-switch-container">
                  <label class="bv-switch">
                    <input type="checkbox" id="bv-hide-table-header">
                    <span class="bv-slider"></span>
                  </label>
                  <span class="bv-switch-label">隱藏標題</span>
                </div>
              </div>
              
              <!-- 預設管理 -->
              <div class="bv-preset-group">
                <h4 class="bv-group-title">
                  <span class="material-icons">bookmark</span>
                  預設管理
                </h4>
                
                <div class="bv-preset-row">
                  <select id="bv-preset-select">
                    <option value="">選擇預設</option>
                  </select>
                  <div class="bv-preset-actions">
                    <button class="bv-icon-button" id="bv-save-preset" title="儲存設定">
                      <span class="material-icons">save</span>
                    </button>
                    <button class="bv-icon-button" id="bv-delete-preset" title="刪除設定">
                      <span class="material-icons">delete</span>
                    </button>
                  </div>
                </div>
                <div class="bv-preset-row bv-save-row" id="bv-save-preset-row" style="display:none;">
                  <input type="text" id="bv-new-preset-name" placeholder="輸入名稱">
                  <div class="bv-button-group">
                    <button class="bv-small-button primary" id="bv-confirm-save">確認</button>
                    <button class="bv-small-button" id="bv-cancel-save">取消</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 固定在底部的列印按鈕 -->
          <div class="bv-panel-footer">
            <button class="bv-print-button" id="bv-apply-print">
              <span class="material-icons">print</span>
              <span class="bv-button-text">套用並列印</span>
            </button>
          </div>
        </div>
      `;
    }
  }
  
  // 初始化拖曳功能
  function initDragFunction() {
    const panel = document.getElementById('bv-label-control-panel');
    const header = panel.querySelector('.bv-panel-header');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    
    function dragStart(e) {
      if (e.target.closest('.bv-header-button')) return;
      
      if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
      } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      }
      
      if (e.target === header || header.contains(e.target)) {
        isDragging = true;
        panel.style.transition = 'none';
      }
    }
    
    function dragEnd(e) {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
      panel.style.transition = '';
      
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
    
    chrome.storage.local.get(['bvPanelPosition'], (result) => {
      if (result.bvPanelPosition) {
        xOffset = result.bvPanelPosition.x;
        yOffset = result.bvPanelPosition.y;
        setTranslate(xOffset, yOffset, panel);
      }
    });
    
    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    
    header.addEventListener('touchstart', dragStart);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', dragEnd);
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
          convertToLabelFormat();
          setTimeout(() => {
            window.print();
          }, 500);
        } else {
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
          convertToLabelFormat();
          setTimeout(() => {
            window.print();
          }, 500);
        } else {
          window.print();
        }
      });
    }
    
    // 10×15cm 模式的事件
    if (isConverted) {
      setupLabelModeEventListeners();
    }
  }
  
  // 設置標籤模式的事件監聽器
  function setupLabelModeEventListeners() {
    // 加粗模式
    const boldMode = document.getElementById('bv-bold-mode');
    if (boldMode) {
      boldMode.addEventListener('change', function(e) {
        window.boldMode = e.target.checked;
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
    
    // 精簡模式
    const hideExtraInfo = document.getElementById('bv-hide-extra-info');
    if (hideExtraInfo) {
      hideExtraInfo.addEventListener('change', function(e) {
        window.hideExtraInfo = e.target.checked;
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
    
    // 隱藏標題
    const hideTableHeader = document.getElementById('bv-hide-table-header');
    if (hideTableHeader) {
      hideTableHeader.addEventListener('change', function(e) {
        window.hideTableHeader = e.target.checked;
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
    
    // 初始化 range input 進度條
    document.querySelectorAll('input[type="range"]').forEach(updateRangeProgress);
    
    // 初始化預設系統
    initPresetSystem();
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
      boldMode: document.getElementById('bv-bold-mode')?.checked,
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
      showLogTraceId: document.getElementById('showLogTraceId')?.checked
    };
  }
  
  // 套用預設設定
  function applyPresetSettings(settings) {
    if (settings.highlightQuantity !== undefined) {
      const qtyCheckbox = document.getElementById('bv-highlight-qty');
      if (qtyCheckbox) qtyCheckbox.checked = settings.highlightQuantity;
      highlightQuantity = settings.highlightQuantity;
    }
    
    if (settings.boldMode !== undefined) {
      const boldCheckbox = document.getElementById('bv-bold-mode');
      if (boldCheckbox) boldCheckbox.checked = settings.boldMode;
      boldMode = settings.boldMode;
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
    
    if (settings.fontSize && document.getElementById('fontSize')) {
      document.getElementById('fontSize').value = settings.fontSize;
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
        const event = new Event('change', { bubbles: true });
        checkbox.dispatchEvent(event);
      }
    });
    
    if (isConverted) {
      updateLabelStyles();
    }
  }
  
  // 監聽原始控制項的變更
  function observeOriginalControls() {
    const checkboxes = document.querySelectorAll('.ignore-print input[type="checkbox"]');
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
        }
      });
    });
    
    const fontSizeSelect = document.getElementById('fontSize');
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
        }
      });
    }
    
    const opacityInput = document.getElementById('baseImageOpacity');
    if (opacityInput) {
      opacityInput.addEventListener('input', () => {
        if (isConverted) {
          updateLabelStyles();
        }
      });
    }
  }
  
  // 更新 Range Input 進度條
  function updateRangeProgress(input) {
    const value = (input.value - input.min) / (input.max - input.min) * 100;
    input.style.setProperty('--value', value + '%');
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
    if (boldMode) {
      document.body.classList.add('bold-mode');
    }
    
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
    
    // 更新面板內容
    updatePanelContent();
    
    showNotification('已成功轉換為10×15cm標籤格式');
  }
  
  // 處理分頁
  function handlePagination() {
    document.querySelectorAll('.bv-page-container').forEach(container => container.remove());
    document.querySelectorAll('.bv-label-page').forEach(page => page.remove());
    
    const labelPadding = parseFloat(document.getElementById('bv-label-padding')?.value || '2.5');
    const paddingPx = labelPadding * 3.78;
    const pageHeight = 566;
    const contentHeight = pageHeight - (paddingPx * 2);
    
    document.querySelectorAll('.order-content').forEach((orderContent) => {
      orderContent.classList.add('bv-original');
      
      if (hideExtraInfo) {
        processExtraInfoHiding(orderContent);
      }
      
      const elements = Array.from(orderContent.children);
      let currentPage = null;
      let currentPageContent = null;
      let currentHeight = 0;
      let pageNumber = 1;
      let totalPages = 1;
      
      const pageContainer = document.createElement('div');
      pageContainer.className = 'bv-page-container';
      orderContent.parentNode.insertBefore(pageContainer, orderContent.nextSibling);
      
      let tempHeight = 0;
      elements.forEach(element => {
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
        
        if (tempHeight + elementHeight > contentHeight && tempHeight > 0) {
          totalPages++;
          tempHeight = elementHeight;
        } else {
          tempHeight += elementHeight;
        }
      });
      
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
        
        if (!currentPage || (currentHeight + elementHeight > contentHeight && currentHeight > 0)) {
          currentPage = document.createElement('div');
          currentPage.className = 'bv-label-page';
          currentPage.style.padding = `${paddingPx}px`;
          
          currentPageContent = document.createElement('div');
          currentPageContent.className = 'bv-page-content';
          currentPage.appendChild(currentPageContent);
          
          if (totalPages > 1) {
            const indicator = document.createElement('div');
            indicator.className = 'bv-page-indicator';
            indicator.textContent = `第 ${pageNumber}/${totalPages} 頁`;
            currentPage.appendChild(indicator);
          }
          
          pageContainer.appendChild(currentPage);
          currentHeight = 0;
          pageNumber++;
        }
        
        const elementClone = element.cloneNode(true);
        currentPageContent.appendChild(elementClone);
        currentHeight += elementHeight;
      });
    });
  }
  
  // 處理隱藏額外資訊
  function processExtraInfoHiding(orderContent) {
    const orderInfo = orderContent.querySelector('.order-info');
    if (!orderInfo) return;
    
    const allParagraphs = orderInfo.querySelectorAll('p');
    
    const keepFields = ['訂單編號', '送貨方式', '物流編號', '收件人', '收件人電話'];
    
    allParagraphs.forEach(p => {
      const text = p.textContent;
      let shouldKeep = false;
      
      keepFields.forEach(field => {
        if (text.includes(field)) {
          shouldKeep = true;
        }
      });
      
      if (!shouldKeep) {
        p.style.display = 'none';
      } else {
        p.style.display = '';
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
        ${boldMode ? 'font-weight: 700 !important;' : ''}
      }
      
      .bv-label-page * {
        font-family: 'Noto Sans TC', 'Microsoft JhengHei', Arial, sans-serif !important;
        font-size: ${fontSize} !important;
        ${boldMode ? 'font-weight: 700 !important;' : ''}
      }
      
      ${hideTableHeader ? `
        .bv-converted .list-title,
        .bv-label-page .list-title {
          display: none !important;
        }
      ` : ''}
      
      ${boldMode ? `
        .bv-converted .order-content *,
        .bv-label-page * {
          font-weight: 700 !important;
        }
        
        .bv-converted .list-title,
        .bv-label-page .list-title {
          border-top: 1mm solid #000 !important;
          border-bottom: 1mm solid #000 !important;
        }
        
        .bv-converted .list-item,
        .bv-label-page .list-item {
          border-bottom: 0.5mm solid #999 !important;
        }
        
        .bv-converted .order-fee,
        .bv-label-page .order-fee {
          border-top: 0.8mm solid #000 !important;
          border-bottom: 0.8mm solid #000 !important;
        }
        
        .bv-converted .orderRemark,
        .bv-converted .orderManageRemark,
        .bv-converted .orderPrintRemark,
        .bv-label-page .orderRemark,
        .bv-label-page .orderManageRemark,
        .bv-label-page .orderPrintRemark {
          border: 0.5mm solid #999 !important;
        }
        
        .bv-converted .bv-qty-circle,
        .bv-label-page .bv-qty-circle {
          border-width: 2px !important;
          font-weight: 900 !important;
        }
      ` : ''}
      
      .bv-converted .title,
      .bv-label-page .title {
        font-size: 5mm !important;
        font-weight: ${boldMode ? '900' : 'bold'} !important;
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
        border-top: ${boldMode ? '1mm' : '0.5mm'} solid #000 !important;
        border-bottom: ${boldMode ? '1mm' : '0.5mm'} solid #000 !important;
      }
      
      .bv-converted .list-title th,
      .bv-label-page .list-title th {
        padding: ${headerPadding}mm 1mm !important;
        font-size: calc(${fontSize} - 1px) !important;
        font-weight: ${boldMode ? '900' : 'bold'} !important;
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
        border-bottom: ${boldMode ? '0.5mm solid #999' : '0.2mm solid #ddd'} !important;
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
      
      .bv-converted .order-fee,
      .bv-label-page .order-fee {
        width: 100% !important;
        border-collapse: collapse !important;
        margin: 0 0 3mm 0 !important;
        border-top: ${boldMode ? '0.8mm' : '0.3mm'} solid #000 !important;
        border-bottom: ${boldMode ? '0.8mm' : '0.3mm'} solid #000 !important;
      }
      
      .bv-converted .order-fee td,
      .bv-label-page .order-fee td {
        padding: ${feePadding}mm 1mm !important;
        font-size: calc(${fontSize} - 2px) !important;
        line-height: 1.2 !important;
      }
      
      .bv-converted .order-fee td:first-child,
      .bv-label-page .order-fee td:first-child {
        text-align: right !important;
      }
      
      .bv-converted .order-fee .total,
      .bv-label-page .order-fee .total {
        text-align: right !important;
        font-weight: ${boldMode ? '900' : 'bold'} !important;
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
        border: ${boldMode ? '0.5mm solid #999' : '0.2mm solid #ccc'} !important;
        background-color: #f9f9f9 !important;
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
    
  // 應用數量標示
  function applyQuantityHighlight() {
    const containers = document.querySelectorAll('.order-content, .bv-label-page');
    
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
        
        if (qtyCell && !qtyCell.querySelector('.bv-qty-circle')) {
          const qty = parseInt(qtyCell.textContent.trim());
          if (qty >= 2) {
            qtyCell.innerHTML = `<span class="bv-qty-circle">${qty}</span>`;
          } else if (qty === 1) {
            qtyCell.innerHTML = `<span class="bv-qty-circle transparent">${qty}</span>`;
          }
        }
      });
    });
  }
  
  // 移除數量標示
  function removeQuantityHighlight() {
    document.querySelectorAll('.bv-qty-circle').forEach(circle => {
      const parent = circle.parentElement;
      const qty = circle.textContent;
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
      notification.style.animation = 'slideUp 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  // 儲存設定
  function saveSettings() {
    const settings = {
      highlightQuantity: highlightQuantity,
      boldMode: boldMode,
      hideExtraInfo: hideExtraInfo,
      hideTableHeader: hideTableHeader,
      labelPadding: document.getElementById('bv-label-padding')?.value || '2.5',
      headerPadding: document.getElementById('bv-header-padding')?.value || '0.5',
      rowPadding: document.getElementById('bv-row-padding')?.value || '0.8',
      feePadding: document.getElementById('bv-fee-padding')?.value || '0.8'
    };
    
    chrome.storage.local.set({ bvLabelSettings: settings });
  }
  
  // 載入設定
  function loadSettings() {
    chrome.storage.local.get(['bvLabelSettings', 'lastSelectedPreset', 'bvPanelMinimized'], (result) => {
      if (result.bvLabelSettings) {
        const settings = result.bvLabelSettings;
        
        highlightQuantity = settings.highlightQuantity !== undefined ? settings.highlightQuantity : false;
        const qtyCheckbox = document.getElementById('bv-highlight-qty');
        if (qtyCheckbox) qtyCheckbox.checked = highlightQuantity;
        
        if (isConverted) {
          boldMode = settings.boldMode !== undefined ? settings.boldMode : false;
          const boldCheckbox = document.getElementById('bv-bold-mode');
          if (boldCheckbox) boldCheckbox.checked = boldMode;
          
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
            if (setting.value) {
              const input = document.getElementById(setting.id);
              if (input) {
                input.value = setting.value;
                document.getElementById(setting.valueId).textContent = setting.value + 'mm';
                updateRangeProgress(input);
              }
            }
          });
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
