/**
 * Background Service Worker
 * Handles extension lifecycle and message routing
 */

import { ConfigManager } from "./configManager";

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log("CV-Tailor extension installed");
});

// Handle action click - open side panel
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    await chrome.sidePanel.open({ tabId: tab.id });
  }
});

// Message handler for cross-component communication
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message, sendResponse);
  return true; // Keep channel open for async response
});

async function handleMessage(message: any, sendResponse: (response: any) => void) {
  const configManager = ConfigManager.getInstance();

  try {
    switch (message.type) {
      case "GET_CONFIG":
        const config = await configManager.getConfig();
        sendResponse({ success: true, data: config });
        break;

      case "SAVE_CONFIG":
        await configManager.saveConfig(message.data);
        sendResponse({ success: true });
        break;

      case "GET_PROVIDER_CONFIG":
        const providerConfig = await configManager.getProviderConfig();
        sendResponse({ success: true, data: providerConfig });
        break;

      case "IS_CONFIGURED":
        const isConfigured = await configManager.isConfigured();
        sendResponse({ success: true, data: isConfigured });
        break;

      default:
        sendResponse({ success: false, error: "Unknown message type" });
    }
  } catch (error: any) {
    sendResponse({ success: false, error: error.message });
  }
}

export {};
