import { getConversionsForUnit } from '../lib/conversion-engine'

// Default preferences
const defaultPreferences = {
  decimalPlaces: 2,
  showAllConversions: true,
  preferredUnits: {},
  theme: 'auto'
}

// Background service worker for Chrome extension
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.sync.set({ preferences: defaultPreferences })
  }
})

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  switch (request.type) {
    case 'CONVERT_UNITS':
      try {
        const { value, unitType, category } = request
        const conversions = getConversionsForUnit(value, unitType, category)
        sendResponse({ conversions })
      } catch (error) {
        console.error('Conversion error:', error)
        sendResponse({ error: 'Conversion failed: ' + (error as Error).message })
      }
      break
      
    case 'GET_PREFERENCES':
      chrome.storage.sync.get(['preferences'], (data) => {
        sendResponse(data.preferences || defaultPreferences)
      })
      break
      
    case 'SET_PREFERENCES':
      chrome.storage.sync.set({ preferences: request.preferences }, () => {
        sendResponse({ success: true })
      })
      break
      
    default:
      if (request.action === 'convert') {
        // Legacy support
        sendResponse({ success: true })
      } else {
        sendResponse({ error: 'Unknown message type' })
      }
  }
  
  return true // Keep message channel open for async response
})

export {}