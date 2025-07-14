// BV SHOP 標籤機專用出貨明細
(function() {
  'use strict';
  
  let isConverted = false;
  let highlightQuantity = False;
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
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap';
  document.head.appendChild(fontLink);
  
  // 創建控制面板
  function createControlPanel() {
    if (document.getElementById('bv-label-control-panel')) return;
    
    const panel = document.createElement('div');
    panel.id = 'bv-label-control-panel';
    panel.innerHTML = `
      <div class="bv-panel-header">
        <h3>
          <div class="bv-icon-wrapper">
            <span class="material-icons">local_shipping</span>
          </div>
          <span class="bv-panel-title">BV SHOP 標籤機專用出貨明細</span>
        </h3>
        <div class="bv-header-controls">
          <button class="bv-header-button" id="bv-minimize-btn" title="最小化">
            <span class="material-icons">remove</span>
          </button>
        </div>
      </div>
      
      <div class="bv-panel-content-wrapper">
        <div class="bv-panel-body">
          <!-- 設定檔區塊 -->
          <div class="bv-preset-section">
            <div class="bv-preset-row">
              <select id="bv-preset-select">
                <option value="">選擇設定檔</option>
              </select>
              <button class="bv-icon-button" id="bv-save-preset" title="儲存設定">
                <span class="material-icons">save</span>
              </button>
              <button class="bv-icon-button" id="bv-delete-preset" title="刪除設定">
                <span class="material-icons">delete</span>
              </button>
              <button class="bv-icon-button reset-button" id="bv-reset-format" title="清除格式">
                <span class="material-icons">restart_alt</span>
              </button>
            </div>
            <div class="bv-preset-row bv-save-row" id="bv-save-preset-row" style="display:none; margin-top: 10px;">
              <input type="text" id="bv-new-preset-name" placeholder="輸入名稱">
              <div class="bv-button-group">
                <button class="bv-small-button primary" id="bv-confirm-save">確認</button>
                <button class="bv-small-button" id="bv-cancel-save">取消</button>
              </div>
            </div>
          </div>
          
          <!-- 轉換按鈕 -->
          <div class="bv-action-section">
            <button id="bv-convert-btn" class="bv-action-button primary">
              <span class="bv-button-text">轉為10×15cm標籤</span>
            </button>
            
            <button id="bv-revert-btn" class="bv-action-button secondary" style="display: none;">
              <span class="bv-button-text">還原原始格式</span>
            </button>
          </div>
          
          <!-- 標籤設定 -->
          <div class="bv-section">
            <div class="bv-section-header" data-section="label">
              <h4>
                <span class="material-icons bv-section-icon">label</span>
                標籤設定
              </h4>
              <span class="material-icons bv-section-toggle">expand_more</span>
            </div>
            <div class="bv-section-content" id="label-content">
              <div class="bv-control-group">
                <!-- 標籤內距 -->
                <div class="bv-control-label">
                  <span>標籤內距</span>
                  <span class="bv-value-badge" id="bv-padding-value">2.5mm</span>
                </div>
                <input type="range" id="bv-label-padding" min="0" max="5" step="0.5" value="2.5" class="bv-range">
                
                <!-- 表格間距設定 -->
                <div class="bv-spacing-controls">
                  <div class="bv-control-label" style="margin-top: 20px;">
                    <span>標題列間距</span>
                    <span class="bv-value-badge" id="bv-header-padding-value">0.5mm</span>
                  </div>
                  <input type="range" id="bv-header-padding" min="0" max="3" step="0.1" value="0.5" class="bv-range">
                  
                  <div class="bv-control-label" style="margin-top: 15px;">
                    <span>內容列間距</span>
                    <span class="bv-value-badge" id="bv-row-padding-value">0.8mm</span>
                  </div>
                  <input type="range" id="bv-row-padding" min="0" max="3" step="0.1" value="0.8" class="bv-range">
                  
                  <div class="bv-control-label" style="margin-top: 15px;">
                    <span>費用列間距</span>
                    <span class="bv-value-badge" id="bv-fee-padding-value">0.8mm</span>
                  </div>
                  <input type="range" id="bv-fee-padding" min="0" max="3" step="0.1" value="0.8" class="bv-range">
                  
                  <div class="bv-control-label" style="margin-top: 15px;">
                    <span>區塊間距</span>
                    <span class="bv-value-badge" id="bv-section-margin-value">2mm</span>
                  </div>
                  <input type="range" id="bv-section-margin" min="0" max="5" step="0.5" value="2" class="bv-range">
                </div>
                
                <div class="bv-switch-container" style="margin-top: 20px;">
                  <label class="bv-switch">
                    <input type="checkbox" id="bv-highlight-qty">
                    <span class="bv-slider"></span>
                  </label>
                  <span class="bv-switch-label">將數量 ≥ 2 顯示為圓圈數字</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 同步原始控制項的提示 -->
          <div class="bv-info-section">
            <h4>
              <span class="material-icons">info</span>
              提示
            </h4>
            <p>您可使用原本的控制選項來調整顯示內容。</p>
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
    
    button,
    button:focus,
    button:focus-visible,
    button:active,
    button:hover {
      outline: none !important;
      box-shadow: none !important;
    }
    
    select,
    select:focus,
    select:focus-visible,
    select:active {
      outline: none !important;
    }
    
    input,
    input:focus,
    input:focus-visible,
    input:active {
      outline: none !important;
    }
    
    .bv-header-button,
    .bv-header-button:focus,
    .bv-header-button:focus-visible,
    .bv-header-button:active,
    .bv-header-button:hover {
      outline: none !important;
      box-shadow: none !important;
    }
    
    .bv-icon-button,
    .bv-icon-button:focus,
    .bv-icon-button:focus-visible,
    .bv-icon-button:active,
    .bv-icon-button:hover {
      outline: none !important;
    }
    
    .bv-small-button,
    .bv-small-button:focus,
    .bv-small-button:focus-visible,
    .bv-small-button:active,
    .bv-small-button:hover {
      outline: none !important;
    }
    
    .bv-action-button,
    .bv-action-button:focus,
    .bv-action-button:focus-visible,
    .bv-action-button:active,
    .bv-action-button:hover {
      outline: none !important;
    }
    
    .bv-print-button,
    .bv-print-button:focus,
    .bv-print-button:focus-visible,
    .bv-print-button:active,
    .bv-print-button:hover {
      outline: none !important;
    }
    
    .bv-floating-button,
    .bv-floating-button:focus,
    .bv-floating-button:focus-visible,
    .bv-floating-button:active,
    .bv-floating-button:hover {
      outline: none !important;
    }
    
    /* 防止瀏覽器預設的 focus 樣式 */
    :focus {
      outline: 0 !important;
      box-shadow: none !important;
    }
    
    ::-moz-focus-inner {
      border: 0 !important;
    }
      
      /* 控制面板主體 */
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
        min-width: 280px;
      }
      
      #bv-label-control-panel.minimized .bv-panel-header {
        padding: 16px 20px;
      }
      
      #bv-label-control-panel.minimized .bv-panel-header h3 {
        font-size: 16px;
      }
      
      #bv-label-control-panel.minimized .bv-icon-wrapper {
        width: 28px;
        height: 28px;
      }
      
      #bv-label-control-panel.minimized .bv-panel-content-wrapper {
        display: none;
      }
      
      #bv-label-control-panel.minimized .bv-panel-header {
        border-radius: 20px;
      }
      
      /* 浮動按鈕（最小化時的快速操作） */
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
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
        letter-spacing: -0.02em;
      }
      
      .bv-panel-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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
        padding: 28px;
        overflow-y: auto;
        flex: 1;
        -webkit-overflow-scrolling: touch;
      }
      
      /* 面板底部 */
      .bv-panel-footer {
        background: linear-gradient(to top, #fafbfc, #ffffff);
        padding: 20px 28px;
        border-top: 1px solid #eef0f2;
        border-radius: 0 0 20px 20px;
        flex-shrink: 0;
      }
      
      /* 預設區域 */
      .bv-preset-section {
        background: linear-gradient(135deg, #f8f9ff 0%, #f5f6ff 100%);
        border-radius: 14px;
        padding: 18px;
        margin-bottom: 28px;
        border: 1px solid rgba(88, 101, 242, 0.08);
      }
      
      .bv-preset-row {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: nowrap;
      }
      
      /* 儲存設定檔的那一列特別處理 */
      .bv-preset-row.bv-save-row {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      
      #bv-preset-select {
        flex: 1;
        min-width: 0;
        background: white;
        border: 2px solid #e8eaed;
        border-radius: 10px;
        padding: 11px 14px;
        font-size: 14px;
        color: #24292e;
        transition: all 0.2s ease;
        font-weight: 500;
      }
      
      #bv-preset-select:hover {
        border-color: #7289DA;
      }
      
      #bv-preset-select:focus {
        outline: none;
        border-color: #5865F2;
        box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1);
      }
      
      /* 設定檔名稱輸入框 */
      #bv-new-preset-name {
        flex: 1;
        min-width: 0;
        background: white;
        border: 2px solid #e8eaed;
        border-radius: 10px;
        padding: 11px 14px;
        font-size: 14px;
        color: #24292e;
        transition: all 0.2s ease;
        font-weight: 500;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans TC', 'Microsoft JhengHei', Roboto, sans-serif;
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
        font-weight: 400;
      }
      
      .bv-icon-button {
        background: white;
        border: 2px solid #e8eaed;
        border-radius: 10px;
        padding: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        width: 40px;
        height: 40px;
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
        font-size: 20px;
        color: #5865F2;
      }
      
      .bv-icon-button.reset-button:hover {
        background: #fff5f5;
        border-color: #f04747;
      }
      
      .bv-icon-button.reset-button .material-icons {
        color: #f04747;
      }
      
      /* 按鈕群組 */
      .bv-button-group {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }
      
      .bv-small-button {
        padding: 8px 18px;
        background: white;
        border: 2px solid #e8eaed;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
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
      
      /* 動作區域 */
      .bv-action-section {
        margin-bottom: 28px;
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
        font-weight: 600;
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
      
      /* 列印按鈕 */
      .bv-print-button {
        width: 100%;
        background: linear-gradient(135deg, #5865F2 0%, #7289DA 100%);
        color: white;
        border: none;
        padding: 16px 24px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
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
      }
      
      /* 區塊樣式 */
      .bv-section {
        margin-bottom: 0;
      }
      
      .bv-section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 18px;
        background: #f8f9fa;
        border-radius: 12px;
        cursor: pointer;
        user-select: none;
        transition: all 0.2s ease;
        margin-bottom: 18px;
        border: 1px solid transparent;
      }
      
      .bv-section-header:hover {
        background: #f0f2f5;
        border-color: #e8eaed;
      }
      
      .bv-section-header h4 {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: #24292e;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .bv-section-icon {
        font-size: 22px;
        background: linear-gradient(135deg, #5865F2 0%, #7289DA 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .bv-section-toggle {
        color: #6c757d;
        transition: transform 0.3s ease;
        font-size: 24px;
      }
      
      .bv-section-header.collapsed .bv-section-toggle {
        transform: rotate(-90deg);
      }
      
      .bv-section-content {
        max-height: 2000px;
        overflow: hidden;
        transition: max-height 0.3s ease, opacity 0.3s ease, margin-bottom 0.3s ease;
        opacity: 1;
        margin-bottom: 24px;
      }
      
      .bv-section-content.collapsed {
        max-height: 0;
        opacity: 0;
        margin-bottom: 0;
      }
      
      /* 控制群組 */
      .bv-control-group {
        background: #fafbfc;
        border-radius: 14px;
        padding: 20px;
        border: 1px solid #eef0f2;
      }
      
      .bv-control-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
        font-weight: 500;
        color: #24292e;
        font-size: 14px;
      }
      
      .bv-value-badge {
        background: linear-gradient(135deg, #5865F2 0%, #7289DA 100%);
        color: white;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        min-width: 50px;
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
        margin: 16px 0 8px 0;
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
        width: 22px;
        height: 22px;
        background: white;
        border: 3px solid #5865F2;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(88, 101, 242, 0.3);
        transition: all 0.2s ease;
        position: relative;
        z-index: 1;
      }
      
      input[type="range"]::-webkit-slider-thumb:hover {
        transform: scale(1.15);
        box-shadow: 0 4px 12px rgba(88, 101, 242, 0.4);
        border-color: #7289DA;
      }
      
      input[type="range"]::-moz-range-thumb {
        width: 22px;
        height: 22px;
        background: white;
        border: 3px solid #5865F2;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(88, 101, 242, 0.3);
        transition: all 0.2s ease;
      }
      
      /* 間距控制區 */
      .bv-spacing-controls {
        margin-top: 25px;
        padding-top: 20px;
        border-top: 1px solid #e8eaed;
      }
      
      /* 開關容器 */
      .bv-switch-container {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .bv-switch-label {
        font-size: 14px;
        color: #24292e;
        font-weight: 500;
      }
      
      /* 開關樣式 */
      .bv-switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
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
      
      /* 資訊區塊 */
      .bv-info-section {
        background: #fafbfc;
        border-radius: 14px;
        padding: 18px;
        border: 1px solid #eef0f2;
      }
      
      .bv-info-section h4 {
        margin: 0 0 12px 0;
        color: #24292e;
        font-size: 14px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .bv-info-section h4 .material-icons {
        font-size: 18px;
        color: #5865F2;
      }
      
      .bv-info-section p {
        margin: 0;
        color: #586069;
        font-size: 13px;
        line-height: 1.6;
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
      
      /* 透明邊框樣式（給數字 1 使用） */
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
      }
      
      /* 滾動條樣式 */
      .bv-panel-body::-webkit-scrollbar {
        width: 10px;
      }
      
      .bv-panel-body::-webkit-scrollbar-track {
        background: #f8f9fa;
        border-radius: 5px;
      }
      
      .bv-panel-body::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #d4d7dd 0%, #c1c4cb 100%);
        border-radius: 5px;
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
        font-weight: 500;
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
      
      /* 覆蓋原始樣式 - 重要！ */
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
        }
        .bv-converted .order-content {
          background: white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          margin: 20px auto !important;
          width: 377px !important;
        }
      }
      
      @media print {
        #bv-label-control-panel,
        .bv-floating-button {
          display: none !important;
        }
        
        /* 最重要的部分：移除所有 body 寬度限制 */
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
        
        .bv-converted .order-content {
          width: 100mm !important;
          height: 150mm !important;
          margin: 0 !important;
          padding: var(--label-padding, 2.5mm) !important;
          box-sizing: border-box !important;
          page-break-after: always !important;
          page-break-inside: avoid !important;
          box-shadow: none !important;
          border: none !important;
        }
        
        .bv-converted .order-content:last-child {
          page-break-after: avoid !important;
        }
        
        /* 隱藏所有非訂單內容 */
        body > *:not(.order-content) {
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
    
    // 初始化預設系統
    initPresetSystem();
    
    // 初始化拖曳功能
    initDragFunction();
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
      // 檢查是否點擊在按鈕上
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
    
    // 添加事件監聽器
    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    
    // 觸控支援
    header.addEventListener('touchstart', dragStart);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', dragEnd);
  }
  
  // 設置事件監聽器
  function setupEventListeners() {
    // 轉換按鈕
    document.getElementById('bv-convert-btn').addEventListener('click', convertToLabelFormat);
    document.getElementById('bv-revert-btn').addEventListener('click', revertToOriginal);
    
    // 最小化按鈕
    document.getElementById('bv-minimize-btn')?.addEventListener('click', function() {
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
      
      // 儲存狀態
      chrome.storage.local.set({ bvPanelMinimized: isPanelMinimized });
    });
       
    // 浮動列印按鈕
    document.getElementById('bv-floating-print')?.addEventListener('click', function() {
      if (!isConverted) {
        convertToLabelFormat();
        setTimeout(() => {
          window.print();
        }, 500);
      } else {
        window.print();
      }
    });
    
    // 數量標示開關
    document.getElementById('bv-highlight-qty').addEventListener('change', toggleQuantityHighlight);
    
    // 區塊折疊功能
    document.querySelectorAll('.bv-section-header').forEach(header => {
      header.addEventListener('click', function() {
        const section = this.dataset.section;
        const content = document.getElementById(section + '-content');
        const toggle = this.querySelector('.bv-section-toggle');
        
        this.classList.toggle('collapsed');
        content.classList.toggle('collapsed');
        toggle.textContent = content.classList.contains('collapsed') ? 'expand_more' : 'expand_less';
      });
    });
    
    // 內距調整
    document.getElementById('bv-label-padding')?.addEventListener('input', function() {
      document.getElementById('bv-padding-value').textContent = this.value + 'mm';
      updateRangeProgress(this);
      saveSettings();
      if (isConverted) {
        updateLabelStyles();
      }
    });
    
    // 間距調整拉桿
    const spacingControls = [
      { id: 'bv-header-padding', valueId: 'bv-header-padding-value', unit: 'mm' },
      { id: 'bv-row-padding', valueId: 'bv-row-padding-value', unit: 'mm' },
      { id: 'bv-fee-padding', valueId: 'bv-fee-padding-value', unit: 'mm' },
      { id: 'bv-section-margin', valueId: 'bv-section-margin-value', unit: 'mm' }
    ];
    
    spacingControls.forEach(control => {
      document.getElementById(control.id)?.addEventListener('input', function() {
        document.getElementById(control.valueId).textContent = this.value + control.unit;
        updateRangeProgress(this);
        saveSettings();
        if (isConverted) {
          updateLabelStyles();
        }
      });
    });
    
    // 套用並列印按鈕
    document.getElementById('bv-apply-print')?.addEventListener('click', function() {
      if (!isConverted) {
        // 先轉換格式
        convertToLabelFormat();
        // 延遲執行列印
        setTimeout(() => {
          window.print();
        }, 500);
      } else {
        // 已轉換，直接列印
        window.print();
      }
    });
    
    // 初始化 range input 進度條
    document.querySelectorAll('input[type="range"]').forEach(updateRangeProgress);
  }
  
  // 初始化預設系統
  function initPresetSystem() {
    const presetSelect = document.getElementById('bv-preset-select');
    const savePresetBtn = document.getElementById('bv-save-preset');
    const deletePresetBtn = document.getElementById('bv-delete-preset');
    const resetFormatBtn = document.getElementById('bv-reset-format');
    const savePresetRow = document.getElementById('bv-save-preset-row');
    const newPresetName = document.getElementById('bv-new-preset-name');
    const confirmSaveBtn = document.getElementById('bv-confirm-save');
    const cancelSaveBtn = document.getElementById('bv-cancel-save');
    
    if (!presetSelect) return;
    
    // 載入預設檔列表
    loadPresetList();
    
    // 選擇設定檔時載入設定
    presetSelect.addEventListener('change', function() {
      const selectedPreset = presetSelect.value;
      if (selectedPreset) {
        chrome.storage.local.get([`bvPreset_${selectedPreset}`], (result) => {
          const settings = result[`bvPreset_${selectedPreset}`];
          if (settings) {
            applyPresetSettings(settings);
            chrome.storage.local.set({ lastSelectedPreset: selectedPreset });
            showNotification(`已載入設定檔「${selectedPreset}」`);
          }
        });
      }
    });
    
    // 儲存設定按鈕
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
    
    // 確認儲存
    if (confirmSaveBtn) {
      confirmSaveBtn.addEventListener('click', function() {
        if (!newPresetName) return;
        
        const presetName = newPresetName.value.trim();
        if (!presetName) {
          showNotification('輸入名稱', 'warning');
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
            showNotification(`設定檔「${presetName}」已儲存`);
          });
        });
      });
    }
    
    // 取消儲存
    if (cancelSaveBtn) {
      cancelSaveBtn.addEventListener('click', function() {
        if (savePresetRow) {
          savePresetRow.style.display = 'none';
        }
      });
    }
    
    // 刪除設定檔
    if (deletePresetBtn) {
      deletePresetBtn.addEventListener('click', function() {
        const selectedPreset = presetSelect.value;
        if (!selectedPreset) {
          showNotification('請先選擇一個設定檔', 'warning');
          return;
        }
        
        if (confirm(`確定要刪除設定檔「${selectedPreset}」嗎？`)) {
          chrome.storage.local.get(['presetList', 'lastSelectedPreset'], (result) => {
            const allPresets = result.presetList || [];
            const updatedPresets = allPresets.filter(name => name !== selectedPreset);
            
            const storageData = { presetList: updatedPresets };
            
            // 如果刪除的是最後選擇的設定檔，清除記錄
            if (result.lastSelectedPreset === selectedPreset) {
              chrome.storage.local.remove(['lastSelectedPreset']);
            }
            
            // 移除設定檔數據
            chrome.storage.local.remove([`bvPreset_${selectedPreset}`], () => {
              chrome.storage.local.set(storageData, () => {
                loadPresetList();
                showNotification(`設定檔「${selectedPreset}」已刪除`);
              });
            });
          });
        }
      });
    }
    
    // 清除格式按鈕
    if (resetFormatBtn) {
      resetFormatBtn.addEventListener('click', function() {
        if (confirm('確定要將所有設定重置為預設值嗎？\n\n此操作無法復原。')) {
          // 重置設定
          const defaultSettings = getDefaultSettings();
          applyPresetSettings(defaultSettings);
          
          // 清除預設檔選擇
          if (presetSelect) {
            presetSelect.value = '';
          }
          
          // 清除最後選擇的預設檔記錄
          chrome.storage.local.remove(['lastSelectedPreset']);
          
          saveSettings();
          showNotification('已重置為預設值');
        }
      });
    }
    
    // Enter 鍵儲存設定檔
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
      
      // 清空現有選項
      while (presetSelect.options.length > 1) {
        presetSelect.remove(1);
      }
      
      // 添加所有設定檔
      allPresets.forEach(presetName => {
        const option = document.createElement('option');
        option.value = presetName;
        option.textContent = presetName;
        presetSelect.appendChild(option);
        
        // 如果是上次選擇的設定檔，預設選中
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
      labelPadding: document.getElementById('bv-label-padding')?.value || '2.5',
      headerPadding: document.getElementById('bv-header-padding')?.value || '0.5',
      rowPadding: document.getElementById('bv-row-padding')?.value || '0.8',
      feePadding: document.getElementById('bv-fee-padding')?.value || '0.8',
      sectionMargin: document.getElementById('bv-section-margin')?.value || '2',
      // 原始頁面的設定
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
    // 擴充功能設定
    if (settings.highlightQuantity !== undefined) {
      const qtyCheckbox = document.getElementById('bv-highlight-qty');
      if (qtyCheckbox) qtyCheckbox.checked = settings.highlightQuantity;
    }
    
    if (settings.labelPadding !== undefined) {
      const paddingInput = document.getElementById('bv-label-padding');
      if (paddingInput) {
        paddingInput.value = settings.labelPadding;
        document.getElementById('bv-padding-value').textContent = settings.labelPadding + 'mm';
        updateRangeProgress(paddingInput);
      }
    }
    
    // 間距設定
    const spacingSettings = [
      { id: 'bv-header-padding', value: settings.headerPadding, valueId: 'bv-header-padding-value' },
      { id: 'bv-row-padding', value: settings.rowPadding, valueId: 'bv-row-padding-value' },
      { id: 'bv-fee-padding', value: settings.feePadding, valueId: 'bv-fee-padding-value' },
      { id: 'bv-section-margin', value: settings.sectionMargin, valueId: 'bv-section-margin-value' }
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
    
    // 原始頁面設定
    if (settings.fontSize && document.getElementById('fontSize')) {
      document.getElementById('fontSize').value = settings.fontSize;
    }
    
    // Checkbox 設定
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
        // 觸發 change 事件
        const event = new Event('change', { bubbles: true });
        checkbox.dispatchEvent(event);
      }
    });
    
    if (isConverted) {
      updateLabelStyles();
    }
  }
  
  // 取得預設設定
  function getDefaultSettings() {
    return {
      highlightQuantity: false,
      labelPadding: '2.5',
      headerPadding: '0.5',
      rowPadding: '0.8',
      feePadding: '0.8',
      sectionMargin: '2',
      fontSize: '14px',
      showProductImage: false,
      showRemark: false,
      showManageRemark: false,
      showPrintRemark: false,
      showDeliveryTime: false,
      hideInfo: false,
      hidePrice: false,
      showShippingTime: true,
      showLogTraceId: false
    };
  }
  
  // 監聽原始控制項的變更
  function observeOriginalControls() {
    // 監聽所有原始 checkbox
    const checkboxes = document.querySelectorAll('.ignore-print input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        if (isConverted) {
          updateLabelStyles();
        }
      });
    });
    
    // 監聽文字大小選擇
    const fontSizeSelect = document.getElementById('fontSize');
    if (fontSizeSelect) {
      fontSizeSelect.addEventListener('change', () => {
        if (isConverted) {
          updateLabelStyles();
        }
      });
    }
    
    // 監聽底圖透明度
    const opacityInput = document.getElementById('baseImageOpacity');
    if (opacityInput) {
      opacityInput.addEventListener('input', () => {
        if (isConverted) {
          updateLabelStyles();
        }
      });
    }
    
    // 使用 MutationObserver 監聽動態變化
    const observer = new MutationObserver(() => {
      if (isConverted) {
        setTimeout(() => {
          if (highlightQuantity) {
            applyQuantityHighlight();
          }
        }, 100);
      }
    });
    
    // 監聽 order-content 的變化
    document.querySelectorAll('.order-content').forEach(content => {
      observer.observe(content, {
        attributes: true,
        childList: true,
        subtree: true
      });
    });
  }
  
  // 更新 Range Input 進度條
  function updateRangeProgress(input) {
    const value = (input.value - input.min) / (input.max - input.min) * 100;
    input.style.setProperty('--value', value + '%');
  }
  
  // 轉換為標籤格式
  function convertToLabelFormat() {
    if (isConverted) return;
    
    // 移除空白頁
    document.querySelectorAll('.order-content:has(.baseImage)').forEach(e => e.remove());
    
    const contents = document.querySelectorAll('.order-content');
    if (!contents.length) {
      showNotification('沒有找到可轉換的訂單內容', 'warning');
      return;
    }
    
    // 儲存原始 body 樣式
    originalBodyStyle = {
      width: document.body.style.width,
      maxWidth: document.body.style.maxWidth,
      minWidth: document.body.style.minWidth,
      margin: document.body.style.margin,
      padding: document.body.style.padding
    };
    
    // 移除 body 的寬度限制
    document.body.style.width = 'auto';
    document.body.style.maxWidth = 'none';
    document.body.style.minWidth = 'auto';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // 添加轉換標記
    document.body.classList.add('bv-converted');
    
    // 觸發原始頁面的更新
    triggerOriginalPageUpdate();
    
    // 更新標籤樣式
    updateLabelStyles();
    
    // 更新按鈕狀態
    document.getElementById('bv-convert-btn').style.display = 'none';
    document.getElementById('bv-revert-btn').style.display = 'block';
    
    isConverted = true;
    
    // 應用數量標示
    if (highlightQuantity) {
      setTimeout(() => {
        applyQuantityHighlight();
      }, 100);
    }
    
    showNotification('已成功轉換為10×15cm標籤格式');
  }
  
  // 觸發原始頁面的更新事件
  function triggerOriginalPageUpdate() {
    // 觸發 change 事件讓原始頁面重新渲染
    const event = new Event('change', { bubbles: true });
    document.querySelectorAll('.ignore-print input, .ignore-print select').forEach(el => {
      el.dispatchEvent(event);
    });
  }
  
  // 更新標籤樣式
  function updateLabelStyles() {
    // 從原始控制項取得設定
    const fontSize = document.getElementById('fontSize')?.value || '14px';
    const labelPadding = document.getElementById('bv-label-padding')?.value || '2.5';
    
    // 取得間距設定
    const headerPadding = document.getElementById('bv-header-padding')?.value || '0.5';
    const rowPadding = document.getElementById('bv-row-padding')?.value || '0.8';
    const feePadding = document.getElementById('bv-fee-padding')?.value || '0.8';
    const sectionMargin = document.getElementById('bv-section-margin')?.value || '2';
    
    // 移除舊樣式
    const oldStyle = document.getElementById('bv-label-styles');
    if (oldStyle) oldStyle.remove();
    
    // 創建新樣式
    const labelStyles = document.createElement('style');
    labelStyles.id = 'bv-label-styles';
    labelStyles.textContent = `
      /* 關鍵：覆蓋原始 body 寬度設定 */
      body.bv-converted {
        width: auto !important;
        max-width: none !important;
        min-width: auto !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .bv-converted .order-content {
        width: 10cm !important;
        height: 15cm !important;
        padding: ${labelPadding}mm !important;
        --label-padding: ${labelPadding}mm;
        box-sizing: border-box !important;
        overflow: hidden !important;
        font-family: 'Noto Sans TC', 'Microsoft JhengHei', Arial, sans-serif !important;
        font-size: ${fontSize} !important;
        /* 不使用 flex，保持固定間距 */
        display: block !important;
      }
      
      .bv-converted .title {
        font-size: 5mm !important;
        font-weight: bold !important;
        margin: 0 0 ${sectionMargin}mm 0 !important;
        text-align: center !important;
        letter-spacing: 0.5mm !important;
      }
      
      .bv-converted .order-info {
        margin: 0 0 ${sectionMargin}mm 0 !important;
      }
      
      .bv-converted .order-info .row {
        display: flex !important;
        margin: 0 !important;
      }
      
      .bv-converted .order-info .col-6 {
        flex: 1 !important;
        padding: 0 1mm !important;
      }
      
      .bv-converted .order-info .col-6:first-child {
        padding-left: 0 !important;
      }
      
      .bv-converted .order-info .col-6:last-child {
        padding-right: 0 !important;
      }
      
      .bv-converted .order-info p {
        margin: 0 0 1mm 0 !important;
        font-size: calc(${fontSize} - 2px) !important;
        line-height: 1.3 !important;
      }
      
      .bv-converted .list {
        width: 100% !important;
        margin: 0 0 ${sectionMargin}mm 0 !important;
        border-collapse: collapse !important;
      }
      
      .bv-converted .list-title {
        border-top: 0.5mm solid #000 !important;
        border-bottom: 0.5mm solid #000 !important;
      }
      
      /* 使用自訂的間距設定 */
      .bv-converted .list-title th {
        padding: ${headerPadding}mm 1mm !important;
        font-size: calc(${fontSize} - 1px) !important;
        font-weight: bold !important;
        text-align: left !important;
        line-height: 1.2 !important;
      }
      
      .bv-converted .list-title th.text-right,
      .bv-converted .list-item td.text-right {
        text-align: right !important;
      }
      
      .bv-converted .list-item {
        border-bottom: 0.2mm solid #ddd !important;
      }
      
      .bv-converted .list-item td {
        padding: ${rowPadding}mm 1mm !important;
        font-size: calc(${fontSize} - 2px) !important;
        vertical-align: top !important;
        line-height: 1.3 !important;
      }
      
      .bv-converted .list-item-name {
        word-wrap: break-word !important;
      }
      
      .bv-converted .orderProductImage {
        width: 8mm !important;
        height: 8mm !important;
        object-fit: cover !important;
        margin: 0 1mm 0.5mm 0 !important;
        vertical-align: middle !important;
      }
      
      .bv-converted .order-fee {
        width: 100% !important;
        border-collapse: collapse !important;
        margin: 0 0 ${sectionMargin}mm 0 !important;
        border-top: 0.3mm solid #000 !important;
        border-bottom: 0.3mm solid #000 !important;
      }
      
      .bv-converted .order-fee td {
        padding: ${feePadding}mm 1mm !important;
        font-size: calc(${fontSize} - 2px) !important;
        line-height: 1.2 !important;
      }
      
      .bv-converted .order-fee td:first-child {
        text-align: right !important;
      }
      
      .bv-converted .order-fee .total {
        text-align: right !important;
        font-weight: bold !important;
      }
      
      .bv-converted .orderRemark,
      .bv-converted .orderManageRemark,
      .bv-converted .orderPrintRemark {
        font-size: calc(${fontSize} - 3px) !important;
        padding: 2mm !important;
        margin: 0 0 ${sectionMargin}mm 0 !important;
        border: 0.2mm solid #ccc !important;
        background-color: #f9f9f9 !important;
      }
    `;
    
    document.head.appendChild(labelStyles);
    
    // 重新應用數量標示
    if (highlightQuantity) {
      applyQuantityHighlight();
    }
  }
  
  // 還原原始格式
  function revertToOriginal() {
    if (!isConverted) return;
    
    // 還原 body 樣式
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
    
  // 應用數量標示 - 直接替換數字為圓圈
  function applyQuantityHighlight() {
    document.querySelectorAll('.list-item').forEach(item => {
      // 尋找數量欄位
      let qtyCell = null;
      const cells = item.querySelectorAll('td');
      
      // 嘗試找出數量欄位（通常在倒數第二欄）
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
          // 2 以上顯示有邊框的圓圈
          qtyCell.innerHTML = `<span class="bv-qty-circle">${qty}</span>`;
        } else if (qty === 1) {
          // 1 顯示透明邊框的圓圈
          qtyCell.innerHTML = `<span class="bv-qty-circle transparent">${qty}</span>`;
        }
      }
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
    // 移除現有通知
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
      labelPadding: document.getElementById('bv-label-padding')?.value || '2.5',
      headerPadding: document.getElementById('bv-header-padding')?.value || '0.5',
      rowPadding: document.getElementById('bv-row-padding')?.value || '0.8',
      feePadding: document.getElementById('bv-fee-padding')?.value || '0.8',
      sectionMargin: document.getElementById('bv-section-margin')?.value || '2'
    };
    
    chrome.storage.local.set({ bvLabelSettings: settings });
  }
  
  // 載入設定
  function loadSettings() {
    chrome.storage.local.get(['bvLabelSettings', 'lastSelectedPreset', 'bvPanelMinimized'], (result) => {
      if (result.bvLabelSettings) {
        const settings = result.bvLabelSettings;
        
        // 載入基本設定
        highlightQuantity = settings.highlightQuantity !== undefined ? settings.highlightQuantity : false;
        const qtyCheckbox = document.getElementById('bv-highlight-qty');
        if (qtyCheckbox) qtyCheckbox.checked = highlightQuantity;
        
        // 載入內距設定
        const paddingInput = document.getElementById('bv-label-padding');
        if (paddingInput && settings.labelPadding) {
          paddingInput.value = settings.labelPadding;
          document.getElementById('bv-padding-value').textContent = settings.labelPadding + 'mm';
          updateRangeProgress(paddingInput);
        }
        
        // 載入間距設定
        const spacingSettings = [
          { id: 'bv-header-padding', value: settings.headerPadding, valueId: 'bv-header-padding-value' },
          { id: 'bv-row-padding', value: settings.rowPadding, valueId: 'bv-row-padding-value' },
          { id: 'bv-fee-padding', value: settings.feePadding, valueId: 'bv-fee-padding-value' },
          { id: 'bv-section-margin', value: settings.sectionMargin, valueId: 'bv-section-margin-value' }
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
      
      // 載入面板狀態
      if (result.bvPanelMinimized !== undefined) {
        isPanelMinimized = result.bvPanelMinimized;
        const panel = document.getElementById('bv-label-control-panel');
        const minimizeBtn = document.getElementById('bv-minimize-btn');
        
        if (isPanelMinimized && panel && minimizeBtn) {
          panel.classList.add('minimized');
          minimizeBtn.querySelector('.material-icons').textContent = 'add';
        }
      }
      
      // 如果有上次選擇的預設檔，載入它
      if (result.lastSelectedPreset) {
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
