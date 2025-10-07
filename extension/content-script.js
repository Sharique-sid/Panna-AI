// Content script for Panna.ai extension
// Handles double-click text selection to save to Panna.ai

let selectedText = '';
let selectionTimeout = null;

// Handle text selection
document.addEventListener('mouseup', (event) => {
  const selection = window.getSelection();
  const text = selection.toString().trim();
  
  if (text && text.length > 0) {
    selectedText = text;
    
    // Clear any existing timeout
    if (selectionTimeout) {
      clearTimeout(selectionTimeout);
    }
    
    // Set a timeout to clear selection after 2 seconds
    selectionTimeout = setTimeout(() => {
      selectedText = '';
    }, 2000);
  }
});

// Handle double-click events
document.addEventListener('dblclick', async (event) => {
  // Only proceed if we have selected text
  if (!selectedText || selectedText.length === 0) {
    return;
  }
  
  // Prevent default double-click behavior
  event.preventDefault();
  
  try {
    // Send message to background script to save the selected text
    const response = await chrome.runtime.sendMessage({
      action: 'saveSelectedText',
      text: selectedText,
      url: window.location.href,
      title: document.title
    });
    
    if (response && response.success) {
      // Show a subtle visual feedback
      showSaveFeedback();
    }
  } catch (error) {
    console.error('Error saving text to Panna.ai:', error);
  }
});

// Show visual feedback when text is saved
function showSaveFeedback() {
  // Create a temporary notification element
  const notification = document.createElement('div');
  notification.textContent = '📝 Saved to Panna.ai';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Add to page
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }, 300);
  }, 3000);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    sendResponse({ text: selectedText });
  }
});
