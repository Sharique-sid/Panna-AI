// Configuration
const API_URL = 'http://localhost:3000'; // Next.js development server
const SUPABASE_URL = 'https://iuvvmbtqbaauvtojnxjd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1dnZtYnRxYmFhdXZ0b2pueGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MDI0NTEsImV4cCI6MjA3NDk3ODQ1MX0.v2oCR6JXGF5NBJ_PYDHT1X1BowDewDWYR7_Fu1Tbs7U';
const MOCK_MODE = false; // Set to true for testing without backend

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'saveToPanna',
    title: 'Save to Panna.ai',
    contexts: ['selection'],
  });

  console.log('Panna.ai extension installed successfully!');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'saveToPanna' && info.selectionText) {
    await saveSelection(info.selectionText, tab);
  }
});

// Save selected text as a note
async function saveSelection(selectedText, tab) {
  try {
    // Get session from storage
    const session = await getSession();

    if (!session || !session.access_token) {
      // Show notification to login
      chrome.notifications.create('pannaNotLoggedIn', {
        type: 'basic',
        iconUrl: 'icons/icon-48.png',
        title: 'Panna.ai - Not Logged In',
        message: 'Please login to the extension first.',
        priority: 2,
        buttons: [
          { title: 'Open Extension' }
        ]
      });
      return;
    }

    // Create a title from the selection (first 50 chars)
    const title = selectedText.length > 50 
      ? selectedText.substring(0, 50) + '...'
      : selectedText;

    // Prepare note content with context
    const content = `${selectedText}\n\n---\nSource: ${tab.title}\n${tab.url}`;

    if (MOCK_MODE) {
      // Mock save - simulate success
      chrome.notifications.create('noteSavedMock', {
        type: 'basic',
        iconUrl: 'icons/icon-48.png',
        title: 'Panna.ai - Saved! (Mock)',
        message: 'Selected text saved to your notes ✓ (Mock Mode)',
        priority: 1,
        buttons: [
          { title: 'View Dashboard' }
        ]
      });
      return;
    }

    // Call API to create note
    const response = await fetch(`${API_URL}/api/extension/notes/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ 
        title,
        content 
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save note');
    }

    const result = await response.json();
    const noteId = result.note?.id;

    // Show success notification with action button
    chrome.notifications.create('noteSavedSuccess', {
      type: 'basic',
      iconUrl: 'icons/icon-48.png',
      title: 'Panna.ai - Saved!',
      message: 'Selected text saved to your notes ✓',
      priority: 1,
      buttons: [
        { title: 'View Dashboard' }
      ]
    });

    // Play sound (optional)
    // chrome.tts.speak('Note saved', { rate: 1.2, pitch: 1.0 });

  } catch (error) {
    console.error('Save selection error:', error);

    // Show error notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-48.png',
      title: 'Panna.ai - Error',
      message: error.message || 'Failed to save note. Please try again.',
      priority: 2,
    });

    // If authentication error, clear session
    if (error.message.includes('auth') || error.message.includes('token')) {
      await clearSession();
    }
  }
}

// Session management helpers
function getSession() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['pannaai_session'], (result) => {
      resolve(result.pannaai_session || null);
    });
  });
}

function clearSession() {
  return new Promise((resolve) => {
    chrome.storage.local.remove('pannaai_session', () => {
      resolve();
    });
  });
}

// Listen for messages from popup (optional)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkAuth') {
    getSession().then(session => {
      sendResponse({ authenticated: !!session });
    });
    return true; // Keep channel open for async response
  }
});

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (notificationId === 'noteSavedSuccess' && buttonIndex === 0) {
    // Open dashboard in new tab
    chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
  } else if (notificationId === 'noteSavedMock' && buttonIndex === 0) {
    // Open dashboard in new tab (mock mode)
    chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
  } else if (notificationId === 'pannaNotLoggedIn' && buttonIndex === 0) {
    // Open extension popup
    chrome.action.openPopup();
  }
});

