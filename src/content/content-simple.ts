import { detectUnits } from '../lib/unit-patterns-simple'

let container: HTMLDivElement | null = null
let currentSelection: string | null = null

// Create container for hover window
function createContainer() {
  if (container) return container
  
  container = document.createElement('div')
  container.id = 'unit-converter-extension-root'
  container.style.cssText = `
    z-index: 999999;
    pointer-events: none;
  `
  document.body.appendChild(container)
  
  return container
}

function showHoverWindow(data: any) {
  createContainer()
  
  if (container && data) {
    // Create the hover window HTML directly
    const html = `
      <div class="converter-hover-window" style="
        position: fixed;
        left: ${data.position.x}px;
        top: ${data.position.y}px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        width: 320px;
        max-height: 300px;
        overflow: hidden;
        pointer-events: auto;
      ">
        <div style="
          padding: 12px 16px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 600; font-size: 14px;">
              ${data.originalValue} ${data.originalUnit}
            </span>
            <span style="
              background: #f3f4f6;
              color: #374151;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 12px;
            ">${data.category}</span>
          </div>
          <button onclick="this.closest('.converter-hover-window').remove()" style="
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            color: #6b7280;
          ">✕</button>
        </div>
        <div style="
          padding: 16px;
          max-height: 240px;
          overflow-y: auto;
        ">
          ${data.conversions.map((conv: any, index: number) => `
            <div style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
              ${index > 0 ? 'border-top: 1px solid #f3f4f6;' : ''}
            ">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 500; font-size: 14px;">${conv.value}</span>
                <span style="
                  color: #6b7280;
                  font-size: 12px;
                  border: 1px solid #e5e7eb;
                  padding: 2px 6px;
                  border-radius: 4px;
                ">${conv.unit}</span>
              </div>
              <button onclick="navigator.clipboard.writeText('${conv.value} ${conv.unit}')" style="
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px 8px;
                color: #6b7280;
                font-size: 12px;
              ">Copy</button>
            </div>
          `).join('')}
        </div>
      </div>
    `
    
    container.innerHTML = html
    container.style.pointerEvents = 'auto'
  }
}

function hideHoverWindow() {
  if (container) {
    container.innerHTML = ''
    container.style.pointerEvents = 'none'
  }
  currentSelection = null
}

// Debounced selection handler
let selectionTimeout: ReturnType<typeof setTimeout>

function handleSelection() {
  clearTimeout(selectionTimeout)
  
  selectionTimeout = setTimeout(() => {
    const selection = window.getSelection()
    const text = selection?.toString().trim()
    
    if (!text || text.length > 100 || text === currentSelection) {
      if (!text && currentSelection) {
        hideHoverWindow()
      }
      return
    }
    
    const units = detectUnits(text)
    
    if (units.length > 0) {
      const range = selection!.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      
      currentSelection = text
      
      // Use the first detected unit
      const unit = units[0]
      
      // Send to background for conversion
      try {
        chrome.runtime.sendMessage({
          type: 'CONVERT_UNITS',
          value: unit.value,
          unitType: unit.unitType,
          category: unit.category,
          text
        }, (response) => {
          // Check if extension context is still valid
          if (chrome.runtime.lastError) {
            console.error('Chrome runtime error:', chrome.runtime.lastError)
            return
          }
          
          if (response?.conversions) {
            showHoverWindow({
              originalValue: unit.value,
              originalUnit: unit.unit,
              conversions: response.conversions,
              category: unit.category,
              position: {
                x: Math.min(rect.left, window.innerWidth - 320),
                y: rect.bottom + 5
              }
            })
          } else if (response?.error) {
            console.error('Conversion error:', response.error)
          }
        })
      } catch (error) {
        // Extension was reloaded, content script is orphaned
        console.error('Extension error:', error)
      }
    } else if (currentSelection) {
      hideHoverWindow()
    }
  }, 300)
}

// Event listeners
document.addEventListener('selectionchange', handleSelection)
document.addEventListener('mouseup', handleSelection)

// Clean up on click outside
document.addEventListener('mousedown', (e) => {
  if (container && !container.contains(e.target as Node)) {
    const selection = window.getSelection()
    if (selection?.toString().trim() !== currentSelection) {
      hideHoverWindow()
    }
  }
})

// Check if extension context is valid
function isExtensionValid() {
  try {
    return chrome.runtime && chrome.runtime.id
  } catch {
    return false
  }
}

// Listen for messages from popup/background
if (isExtensionValid()) {
  chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    if (request.type === 'HIDE_HOVER') {
      hideHoverWindow()
    }
    return true
  })
  
} else {
  // Extension context invalid - page needs refresh
}

export {}