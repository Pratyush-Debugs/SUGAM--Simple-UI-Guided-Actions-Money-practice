/**
 * SUGAM - Background Service Worker (Manifest V3)
 * Handles installation, commands, context menus, and sidePanel routing.
 */

importScripts('../shared/storage.js');

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Populate defaults
    chrome.storage.sync.get(['sugamSettings'], (res) => {
      if (!res.sugamSettings) {
        chrome.storage.sync.set({ sugamSettings: SUGAM_DEFAULT_SETTINGS });
      }
    });
  }

  // Set sidepanel behavior
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
  }

  // Create Context Menus
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'sugam-read-selection',
      title: '🔊 Read aloud with SUGAM',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'sugam-summarise-page',
      title: '🖼️ Summarise page with pictures',
      contexts: ['page']
    });

    chrome.contextMenus.create({
      id: 'sugam-calm-moment',
      title: '🌿 I need a moment (Calm screen)',
      contexts: ['page']
    });
  });
});

// Handle Context Menu Clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  if (info.menuItemId === 'sugam-read-selection') {
    chrome.tabs.sendMessage(tab.id, { action: 'TRIGGER_READ_ALOUD', mode: 'selection' });
  } else if (info.menuItemId === 'sugam-summarise-page') {
    if (chrome.sidePanel && chrome.sidePanel.open) {
      await chrome.sidePanel.open({ tabId: tab.id });
    }
  } else if (info.menuItemId === 'sugam-calm-moment') {
    chrome.tabs.sendMessage(tab.id, { action: 'TRIGGER_CALM_MOMENT' });
  }
});

// Handle Keyboard Commands
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;

  if (command === 'toggle-master-switch') {
    chrome.tabs.sendMessage(tab.id, { action: 'TOGGLE_MASTER_SWITCH' });
  } else if (command === 'trigger-calm-moment') {
    chrome.tabs.sendMessage(tab.id, { action: 'TRIGGER_CALM_MOMENT' });
  }
});

// Message Relay
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'OPEN_SIDE_PANEL' && sender.tab?.id) {
    if (chrome.sidePanel && chrome.sidePanel.open) {
      chrome.sidePanel.open({ tabId: sender.tab.id });
      sendResponse({ success: true });
    }
  } else if (request.action === 'OPEN_UPI_PRACTICE') {
    chrome.tabs.create({ url: chrome.runtime.getURL('sandbox/upi-practice.html') });
    sendResponse({ success: true });
  }
  return true;
});

