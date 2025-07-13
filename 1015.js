javascript:(function(){
  'use strict';
  
  /* BV SHOP 出貨明細標籤列印工具 - 書籤版 */
  
  if(!window.location.href.includes('order_print')){
    alert('請在 BV SHOP 出貨列印頁面使用此工具');
    return;
  }
  
  if(window.BVLabelTool){
    alert('工具已載入');
    return;
  }
  
  window.BVLabelTool = true;
  
  let isConverted = false;
  let highlightQuantity = true;
  let originalBodyStyle = null;
  
  /* 載入外部資源 */
  const iconLink = document.createElement('link');
  iconLink.rel = 'stylesheet';
  iconLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
  document.head.appendChild(iconLink);
  
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap';
  document.head.appendChild(fontLink);
  
  /* 創建控制面板 */
  function createControlPanel(){
    if(document.getElementById('bv-label-control-panel')) return;
    
    const panel = document.createElement('div');
    panel.id = 'bv-label-control-panel';
    panel.innerHTML = `
      <div class="bv-panel-header">
        <h3>
          <div class="bv-icon-wrapper">
            <span class="material-icons">local_shipping</span>
          </div>
          BV SHOP 出貨標籤列印
        </h3>
        <button class="bv-close-btn" onclick="document.getElementById('bv-label-control-panel').remove();window.BVLabelTool=false;">
          <span class="material-icons">close</span>
        </button>
      </div>
      
      <div class="bv-panel-body">
        <div class="bv-preset-section">
          <div class="bv-preset-row">
            <select id="bv-preset-select">
              <option value="">-- 選擇設定檔 --</option>
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
            <input type="text" id="bv-new-preset-name" placeholder="輸入設定檔名稱">
            <div class="bv-button-group">
              <button class="bv-small-button primary" id="bv-confirm-save">確認</button>
              <button class="bv-small-button" id="bv-cancel-save">取消</button>
            </div>
          </div>
        </div>
        
        <div class="bv-action-section">
          <button id="bv-convert-btn" class="bv-action-button primary">
            <span class="material-icons">transform</span>
            <span class="bv-button-text">轉換為10×15cm標籤</span>
          </button>
          
          <button id="bv-revert-btn" class="bv-action-button secondary" style="display: none;">
            <span class="material-icons">restore</span>
            <span class="bv-button-text">還原原始格式</span>
          </button>
        </div>
        
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
              <div class="bv-control-label">
                <span>標籤內距</span>
                <span class="bv-value-badge" id="bv-padding-value">2.5mm</span>
              </div>
              <input type="range" id="bv-label-padding" min="0" max="5" step="0.5" value="2.5" class="bv-range">
              
              <div class="bv-switch-container" style="margin-top: 20px;">
                <label class="bv-switch">
                  <input type="checkbox" id="bv-highlight-qty" checked>
                  <span class="bv-slider"></span>
                </label>
                <span class="bv-switch-label">將數量 ≥ 2 顯示為圓圈數字</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bv-info-section">
          <h4>
            <span class="material-icons">info</span>
            提示
          </h4>
          <p>本工具會自動同步原始頁面的顯示設定，您可以使用原本的控制選項來調整顯示內容。</p>
        </div>
      </div>
      
      <div class="bv-panel-footer">
        <button class="bv-print-button" id="bv-apply-print">
          <span class="material-icons">print</span>
          <span class="bv-button-text">套用並列印</span>
        </button>
      </div>
    `;
    
    /* 添加樣式 */
    const style = document.createElement('style');
    style.textContent = `
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
      
      .bv-panel-header {
        background: linear-gradient(135deg, #5865F2 0%, #7289DA 100%);
        color: white;
        padding: 24px 28px;
        box-shadow: 0 2px 8px rgba(88, 101, 242, 0.2);
        flex-shrink: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .bv-panel-header h3 {
        margin: 0;
        font-size: 19px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
        letter-spacing: -0.02em;
      }
      
      .bv-close-btn {
        background: rgba(255,255,255,0.1);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .bv-close-btn:hover {
        background: rgba(255,255,255,0.2);
      }
      
      .bv-icon-wrapper {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 8px;
      }
      
      .bv-icon-wrapper .material-icons {
        font-size: 20px;
      }
      
      .bv-panel-body {
        padding: 28px;
        overflow-y: auto;
        flex: 1;
        -webkit-overflow-scrolling: touch;
      }
      
      .bv-panel-footer {
        background: linear-gradient(to top, #fafbfc, #ffffff);
        padding: 20px 28px;
        border-top: 1px solid #eef0f2;
        border-radius: 0 0 20px 20px;
        flex-shrink: 0;
      }
      
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
      
      .bv-action-section {
        margin-bottom: 28px;
      }
      
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
        border: none;
      }
      
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
      
      .bv-qty-circle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        height: 20px;
        padding: 0 4px;
        border: 2px solid #333;
        color: #333;
        border-radius: 50%;
        font-weight: bold;
        font-size: 12px;
      }
      
      @media print {
        .bv-qty-circle {
          border: 2px solid #000 !important;
          color: #000 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
      
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
      
      body.bv-converted {
        width: auto !important;
        max-width: none !important;
        min-width: auto !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
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
        #bv-label-control-panel {
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
        
        body > *:not(.order-content) {
          display: none !important;
        }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(panel);
    
    /* 設置事件監聽器 */
    setupEventListeners();
    observeOriginalControls();
    loadSettings();
    initPresetSystem();
  }
  
  /* 設置事件監聽器 */
  function setupEventListeners(){
    document.getElementById('bv-convert-btn').addEventListener('click', convertToLabelFormat);
    document.getElementById('bv-revert-btn').addEventListener('click', revertToOriginal);
    document.getElementById('bv-highlight-qty').addEventListener('change', toggleQuantityHighlight);
    
    document.querySelectorAll('.bv-section-header').forEach(header => {
      header.addEventListener('click', function(){
        const section = this.dataset.section;
        const content = document.getElementById(section + '-content');
        const toggle = this.querySelector('.bv-section-toggle');
        
        this.classList.toggle('collapsed');
        content.classList.toggle('collapsed');
        toggle.textContent = content.classList.contains('collapsed') ? 'expand_more' : 'expand_less';
      });
    });
    
    document.getElementById('bv-label-padding')?.addEventListener('input', function(){
      document.getElementById('bv-padding-value').textContent = this.value + 'mm';
      updateRangeProgress(this);
      saveSettings();
      if(isConverted){
        updateLabelStyles();
      }
    });
    
    document.getElementById('bv-apply-print')?.addEventListener('click', function(){
      if(!isConverted){
        convertToLabelFormat();
        setTimeout(() => {
          window.print();
        }, 500);
      }else{
        window.print();
      }
    });
    
    document.querySelectorAll('input[type="range"]').forEach(updateRangeProgress);
  }
  
  /* 初始化預設系統 */
  function initPresetSystem(){
    const presetSelect = document.getElementById('bv-preset-select');
    const savePresetBtn = document.getElementById('bv-save-preset');
    const deletePresetBtn = document.getElementById('bv-delete-preset');
    const resetFormatBtn = document.getElementById('bv-reset-format');
    const savePresetRow = document.getElementById('bv-save-preset-row');
    const newPresetName = document.getElementById('bv-new-preset-name');
    const confirmSaveBtn = document.getElementById('bv-confirm-save');
    const cancelSaveBtn = document.getElementById('bv-cancel-save');
    
    if(!presetSelect) return;
    
    loadPresetList();
    
    presetSelect.addEventListener('change', function(){
      const selectedPreset = presetSelect.value;
      if(selectedPreset){
        const settings = localStorage.getItem(`bvPreset_${selectedPreset}`);
        if(settings){
          applyPresetSettings(JSON.parse(settings));
          localStorage.setItem('lastSelectedPreset', selectedPreset);
          showNotification(`已載入設定檔「${selectedPreset}」`);
        }
      }
    });
    
    if(savePresetBtn){
      savePresetBtn.addEventListener('click', function(){
        if(savePresetRow){
          savePresetRow.style.display = 'flex';
        }
        if(newPresetName){
          newPresetName.value = presetSelect.value || '';
          newPresetName.focus();
        }
      });
    }
    
    if(confirmSaveBtn){
      confirmSaveBtn.addEventListener('click', function(){
        if(!newPresetName) return;
        
        const presetName = newPresetName.value.trim();
        if(!presetName){
          showNotification('請輸入設定檔名稱', 'warning');
          return;
        }
        
        const settings = getCurrentSettings();
        const allPresets = JSON.parse(localStorage.getItem('presetList') || '[]');
        
        if(!allPresets.includes(presetName)){
          allPresets.push(presetName);
        }
        
        localStorage.setItem(`bvPreset_${presetName}`, JSON.stringify(settings));
        localStorage.setItem('presetList', JSON.stringify(allPresets));
        localStorage.setItem('lastSelectedPreset', presetName);
        
        loadPresetList();
        if(savePresetRow){
          savePresetRow.style.display = 'none';
        }
        showNotification(`設定檔「${presetName}」已儲存`);
      });
    }
    
    if(cancelSaveBtn){
      cancelSaveBtn.addEventListener('click', function(){
        if(savePresetRow){
          savePresetRow.style.display = 'none';
        }
      });
    }
    
    if(deletePresetBtn){
      deletePresetBtn.addEventListener('click', function(){
        const selectedPreset = presetSelect.value;
        if(!selectedPreset){
          showNotification('請先選擇一個設定檔', 'warning');
          return;
        }
        
        if(confirm(`確定要刪除設定檔「${selectedPreset}」嗎？`)){
          const allPresets = JSON.parse(localStorage.getItem('presetList') || '[]');
          const updatedPresets = allPresets.filter(name => name !== selectedPreset);
          
          localStorage.setItem('presetList', JSON.stringify(updatedPresets));
          localStorage.removeItem(`bvPreset_${selectedPreset}`);
          
          if(localStorage.getItem('lastSelectedPreset') === selectedPreset){
            localStorage.removeItem('lastSelectedPreset');
          }
          
          loadPresetList();
          showNotification(`設定檔「${selectedPreset}」已刪除`);
        }
      });
    }
    
    if(resetFormatBtn){
      resetFormatBtn.addEventListener('click', function(){
        if(confirm('確定要將所有設定重置為預設值嗎？\n\n此操作無法復原。')){
          const defaultSettings = getDefaultSettings();
          applyPresetSettings(defaultSettings);
          
          if(presetSelect){
            presetSelect.value = '';
          }
          
          localStorage.removeItem('lastSelectedPreset');
          saveSettings();
          showNotification('已重置為預設值');
        }
      });
    }
    
    if(newPresetName){
      newPresetName.addEventListener('keypress', function(e){
        if(e.key === 'Enter' && confirmSaveBtn){
          confirmSaveBtn.click();
        }
      });
    }
  }
  
  /* 載入預設檔列表 */
  function loadPresetList(){
    const presetSelect = document.getElementById('bv-preset-select');
    if(!presetSelect) return;
    
    const allPresets = JSON.parse(localStorage.getItem('presetList') || '[]');
    const lastSelected = localStorage.getItem('lastSelectedPreset');
    
    while(presetSelect.options.length > 1){
      presetSelect.remove(1);
    }
    
    allPresets.forEach(presetName => {
      const option = document.createElement('option');
      option.value = presetName;
      option.textContent = presetName;
      presetSelect.appendChild(option);
      
      if(presetName === lastSelected){
        option.selected = true;
      }
    });
  }
  
  /* 取得當前設定 */
  function getCurrentSettings(){
    return {
      highlightQuantity: document.getElementById('bv-highlight-qty')?.checked,
      labelPadding: document.getElementById('bv-label-padding')?.value || '2.5',
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
  
  /* 套用預設設定 */
  function applyPresetSettings(settings){
    if(settings.highlightQuantity !== undefined){
      const qtyCheckbox = document.getElementById('bv-highlight-qty');
      if(qtyCheckbox) qtyCheckbox.checked = settings.highlightQuantity;
    }
    
    if(settings.labelPadding !== undefined){
      const paddingInput = document.getElementById('bv-label-padding');
      if(paddingInput){
        paddingInput.value = settings.labelPadding;
        document.getElementById('bv-padding-value').textContent = settings.labelPadding + 'mm';
        updateRangeProgress(paddingInput);
      }
    }
    
    if(settings.fontSize && document.getElementById('fontSize')){
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
      if(checkbox && checkboxSettings[key] !== undefined){
        checkbox.checked = checkboxSettings[key];
        const event = new Event('change', { bubbles: true });
        checkbox.dispatchEvent(event);
      }
    });
    
    if(isConverted){
      updateLabelStyles();
    }
  }
  
  /* 取得預設設定 */
  function getDefaultSettings(){
    return {
      highlightQuantity: true,
      labelPadding: '2.5',
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
  
  /* 監聽原始控制項的變更 */
  function observeOriginalControls(){
    const checkboxes = document.querySelectorAll('.ignore-print input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        if(isConverted){
          updateLabelStyles();
        }
      });
    });
    
    const fontSizeSelect = document.getElementById('fontSize');
    if(fontSizeSelect){
      fontSizeSelect.addEventListener('change', () => {
        if(isConverted){
          updateLabelStyles();
        }
      });
    }
    
    const opacityInput = document.getElementById('baseImageOpacity');
    if(opacityInput){
      opacityInput.addEventListener('input', () => {
        if(isConverted){
          updateLabelStyles();
        }
      });
    }
    
    const observer = new MutationObserver(() => {
      if(isConverted){
        setTimeout(() => {
          if(highlightQuantity){
            applyQuantityHighlight();
          }
        }, 100);
      }
    });
    
    document.querySelectorAll('.order-content').forEach(content => {
      observer.observe(content, {
        attributes: true,
        childList: true,
        subtree: true
      });
    });
  }
  
  /* 更新 Range Input 進度條 */
  function updateRangeProgress(input){
    const value = (input.value - input.min) / (input.max - input.min) * 100;
    input.style.setProperty('--value', value + '%');
  }
  
  /* 轉換為標籤格式 */
  function convertToLabelFormat(){
    if(isConverted) return;
    
    document.querySelectorAll('.order-content:has(.baseImage)').forEach(e => e.remove());
    
    const contents = document.querySelectorAll('.order-content');
    if(!contents.length){
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
    
    document.getElementById('bv-convert-btn').style.display = 'none';
    document.getElementById('bv-revert-btn').style.display = 'block';
    
    isConverted = true;
    
    if(highlightQuantity){
      setTimeout(() => {
        applyQuantityHighlight();
      }, 100);
    }
    
    showNotification('已成功轉換為10×15cm標籤格式');
  }
  
  /* 觸發原始頁面的更新事件 */
  function triggerOriginalPageUpdate(){
    const event = new Event('change', { bubbles: true });
    document.querySelectorAll('.ignore-print input, .ignore-print select').forEach(el => {
      el.dispatchEvent(event);
    });
  }
  
  /* 更新標籤樣式 */
  function updateLabelStyles(){
    const fontSize = document.getElementById('fontSize')?.value || '14px';
    const labelPadding = document.getElementById('bv-label-padding')?.value || '2.5';
    
    const oldStyle = document.getElementById('bv-label-styles');
    if(oldStyle) oldStyle.remove();
    
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
        width: 10cm !important;
        height: 15cm !important;
        padding: ${labelPadding}mm !important;
        --label-padding: ${labelPadding}mm;
        box-sizing: border-box !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
        font-family: 'Noto Sans TC', 'Microsoft JhengHei', Arial, sans-serif !important;
        font-size: ${fontSize} !important;
      }
      
      .bv-converted .title {
        font-size: 5mm !important;
        font-weight: bold !important;
        margin: 0 0 3mm 0 !important;
        text-align: center !important;
        letter-spacing: 0.5mm !important;
      }
      
      .bv-converted .order-info {
        margin: 0 0 2mm 0 !important;
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
        margin: 0 0 2mm 0 !important;
        border-collapse: collapse !important;
        flex-grow: 1 !important;
      }
      
      .bv-converted .list-title {
        border-top: 0.5mm solid #000 !important;
        border-bottom: 0.5mm solid #000 !important;
      }
      
      .bv-converted .list-title th {
        padding: 1.5mm 1mm !important;
        font-size: calc(${fontSize} - 1px) !important;
        font-weight: bold !important;
        text-align: left !important;
      }
      
      .bv-converted .list-title th.text-right,
      .bv-converted .list-item td.text-right {
        text-align: right !important;
      }
      
      .bv-converted .list-item {
        border-bottom: 0.2mm solid #ddd !important;
      }
      
      .bv-converted .list-item td {
        padding: 1.5mm 1mm !important;
        font-size: calc(${fontSize} - 2px) !important;
        vertical-align: top !important;
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
        margin-top: auto !important;
        flex-shrink: 0 !important;
        border-top: 0.3mm solid #000 !important;
        border-bottom: 0.3mm solid #000 !important;
      }
      
      .bv-converted .order-fee td {
        padding: 1.5mm 1mm !important;
        font-size: calc(${fontSize} - 2px) !important;
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
        margin: 2mm 0 !important;
        border: 0.2mm solid #ccc !important;
        background-color: #f9f9f9 !important;
        flex-shrink: 0 !important;
      }
    `;
    
    document.head.appendChild(labelStyles);
    
    if(highlightQuantity){
      applyQuantityHighlight();
    }
  }
  
  /* 還原原始格式 */
  function revertToOriginal(){
    if(!isConverted) return;
    
    if(originalBodyStyle){
      Object.keys(originalBodyStyle).forEach(prop => {
        document.body.style[prop] = originalBodyStyle[prop];
      });
    }
    
    location.reload();
  }
  
  /* 切換數量標示 */
  function toggleQuantityHighlight(e){
    highlightQuantity = e.target.checked;
    saveSettings();
    
    if(highlightQuantity){
      applyQuantityHighlight();
    }else{
      removeQuantityHighlight();
    }
  }
  
  /* 應用數量標示 */
  function applyQuantityHighlight(){
    document.querySelectorAll('.list-item').forEach(item => {
      let qtyCell = null;
      const cells = item.querySelectorAll('td');
      
      for(let i = cells.length - 2; i >= 0; i--){
        const text = cells[i].textContent.trim();
        if(/^\d+$/.test(text) && parseInt(text) > 0){
          qtyCell = cells[i];
          break;
        }
      }
      
      if(qtyCell && !qtyCell.querySelector('.bv-qty-circle')){
        const qty = parseInt(qtyCell.textContent.trim());
        if(qty >= 2){
          qtyCell.innerHTML = `<span class="bv-qty-circle">${qty}</span>`;
        }
      }
    });
  }
  
  /* 移除數量標示 */
  function removeQuantityHighlight(){
    document.querySelectorAll('.bv-qty-circle').forEach(circle => {
      const parent = circle.parentElement;
      const qty = circle.textContent;
      parent.textContent = qty;
    });
  }
  
  /* 顯示通知 */
  function showNotification(message, type = 'success'){
    const existing = document.querySelector('.bv-notification');
    if(existing) existing.remove();
    
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
  
  /* 儲存設定 */
  function saveSettings(){
    const settings = {
      highlightQuantity: highlightQuantity,
      labelPadding: document.getElementById('bv-label-padding')?.value || '2.5'
    };
    
    localStorage.setItem('bvLabelSettings', JSON.stringify(settings));
  }
  
  /* 載入設定 */
  function loadSettings(){
    const savedSettings = localStorage.getItem('bvLabelSettings');
    const lastSelectedPreset = localStorage.getItem('lastSelectedPreset');
    
    if(savedSettings){
      const settings = JSON.parse(savedSettings);
      
      highlightQuantity = settings.highlightQuantity !== undefined ? settings.highlightQuantity : true;
      const qtyCheckbox = document.getElementById('bv-highlight-qty');
      if(qtyCheckbox) qtyCheckbox.checked = highlightQuantity;
      
      const paddingInput = document.getElementById('bv-label-padding');
      if(paddingInput && settings.labelPadding){
        paddingInput.value = settings.labelPadding;
        document.getElementById('bv-padding-value').textContent = settings.labelPadding + 'mm';
        updateRangeProgress(paddingInput);
      }
    }
    
    if(lastSelectedPreset){
      const presetSettings = localStorage.getItem(`bvPreset_${lastSelectedPreset}`);
      if(presetSettings){
        applyPresetSettings(JSON.parse(presetSettings));
      }
    }
  }
  
  /* 初始化 */
  createControlPanel();
})();
