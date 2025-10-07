// Configuration
const API_URL = 'http://localhost:3000'; // Next.js development server
const SUPABASE_URL = 'https://iuvvmbtqbaauvtojnxjd.supabase.co'; // Your Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1dnZtYnRxYmFhdXZ0b2pueGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MDI0NTEsImV4cCI6MjA3NDk3ODQ1MX0.v2oCR6JXGF5NBJ_PYDHT1X1BowDewDWYR7_Fu1Tbs7U'; // Your Supabase anon key

// Mock mode for testing (set to false to use real backend)
// Note: External Supabase script loading is blocked by CSP, so we use mock mode
let MOCK_MODE = false;

// Supabase client (will be initialized in init function)
let supabase;

// DOM Elements
let loginForm, noteForm, loading;
let loginFormElement, noteFormElement;
let errorMessage;
let noteTitle, noteContent;
let logoutBtn, mailIcon;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing extension...');
  init();
});

function init() {
  try {
    // Initialize Supabase client
    if (window.supabase) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false
        }
      });
      console.log('Supabase client initialized successfully');
      MOCK_MODE = false;
    } else {
      console.log('Supabase script not loaded, falling back to mock mode');
      MOCK_MODE = true;
    }
    
    console.log('MOCK_MODE set to:', MOCK_MODE);

    // Get DOM elements
    loginForm = document.getElementById('loginForm');
    noteForm = document.getElementById('noteForm');
    loading = document.getElementById('loading');
    loginFormElement = document.getElementById('loginFormElement');
    noteFormElement = document.getElementById('noteFormElement');
    errorMessage = document.getElementById('errorMessage');
    noteTitle = document.getElementById('noteTitle');
    noteContent = document.getElementById('noteContent');
    logoutBtn = document.getElementById('logoutBtn');
    mailIcon = document.getElementById('mailIcon');

  // Setup event listeners
  loginFormElement.addEventListener('submit', handleLogin);
  noteFormElement.addEventListener('submit', handleSaveNote);
  logoutBtn.addEventListener('click', handleLogout);
  mailIcon.addEventListener('click', handleMailClick);
  
  // Google sign-in button
  const googleSignInBtn = document.getElementById('googleSignInBtn');
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', handleGoogleSignIn);
  }
  
  // Password toggle functionality
  const passwordToggle = document.getElementById('passwordToggle');
  const passwordInput = document.getElementById('password');
  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // Update eye icon
      const eyeIcon = passwordToggle.querySelector('.eye-icon');
      if (type === 'text') {
        eyeIcon.innerHTML = `
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
      } else {
        eyeIcon.innerHTML = `
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        `;
      }
    });
  }

  // Check authentication status
  checkAuth();
  
  } catch (error) {
    console.error('Extension initialization error:', error);
    // Show error message to user
    if (errorMessage) {
      errorMessage.textContent = 'Extension failed to load. Please refresh.';
      errorMessage.classList.add('active');
    }
    
    // Fallback: show login form after 1 second
    setTimeout(() => {
      console.log('Fallback: showing login form');
      hideLoading();
      if (loginForm) {
        loginForm.classList.add('active');
      }
    }, 1000);
  }
}

// Check if user is authenticated
async function checkAuth() {
  console.log('checkAuth called, MOCK_MODE:', MOCK_MODE);
  showLoading();

  try {
    if (MOCK_MODE) {
      console.log('Mock mode: checking stored session');
      // Mock mode - check stored session
      const session = await getSession();
      console.log('Stored session:', session);
      if (session && session.access_token) {
        console.log('Mock session found, showing note form');
        showNoteForm(session.user.email);
        updateMailIcon();
        hideLoading();
        return;
      } else {
        console.log('No mock session, showing login form');
      }
    } else {
      // Real mode - check stored session first, then Supabase
      console.log('Real mode: checking stored session...');
      const storedSession = await getSession();
      
      if (storedSession && storedSession.access_token) {
        console.log('Stored session found, validating with Supabase...');
        try {
          // Set the session in Supabase client
          await supabase.auth.setSession(storedSession);
          
          // Verify the session is still valid
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (session && !error) {
            console.log('Valid session confirmed, showing note form');
            showNoteForm(session.user.email);
            updateMailIcon();
            hideLoading();
            return;
          } else {
            console.log('Stored session invalid, clearing and showing login');
            await clearSession();
          }
        } catch (error) {
          console.log('Error validating stored session:', error);
          await clearSession();
        }
      }
      
      console.log('No valid session, showing login form');
    }
    
    // Show login form if no valid session
    console.log('Showing login form');
    hideLoading();
    showLoginForm();
  } catch (error) {
    console.error('Auth check error:', error);
    hideLoading();
    showLoginForm();
  }
  
  // Fallback timeout - if still loading after 3 seconds, show login form
  setTimeout(() => {
    if (loading && loading.classList.contains('active')) {
      console.log('Auth timeout fallback: showing login form');
      hideLoading();
      showLoginForm();
    }
  }, 3000);
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  clearMessages();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Show loading state on button
  const loginBtn = document.querySelector('.login-btn');
  const btnText = document.querySelector('.btn-text');
  const btnLoader = document.querySelector('.btn-loader');
  
  if (loginBtn && btnText && btnLoader) {
    loginBtn.disabled = true;
    btnText.style.opacity = '0';
    btnLoader.style.display = 'block';
  }

  showLoading();

  try {
    if (MOCK_MODE) {
      // Mock login - simulate successful authentication
      const mockSession = {
        access_token: 'mock_token_' + Date.now(),
        user: {
          email: email,
          id: 'mock_user_' + Date.now()
        }
      };
      
      await saveSession(mockSession);
      showNoteForm(email);
      updateMailIcon();
    } else {
      // Real Supabase authentication
      console.log('Attempting Supabase login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Login result:', { data, error });

      if (error) {
        throw new Error(error.message || 'Login failed');
      }

      if (data.session) {
        console.log('Login successful, saving session and showing note form');
        await saveSession(data.session);
        showNoteForm(email);
        updateMailIcon();
      } else {
        throw new Error('No session returned');
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    showError(error.message || 'Failed to login. Please try again.');
    showLoginForm();
  } finally {
    // Reset button state
    const loginBtn = document.querySelector('.login-btn');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    
    if (loginBtn && btnText && btnLoader) {
      loginBtn.disabled = false;
      btnText.style.opacity = '1';
      btnLoader.style.display = 'none';
    }
  }
}

// Handle Google sign-in
async function handleGoogleSignIn() {
  try {
    console.log('Google sign-in clicked');
    
    if (MOCK_MODE) {
      // Mock Google sign-in
      const mockSession = {
        access_token: 'mock_google_token_' + Date.now(),
        user: {
          email: 'user@gmail.com',
          id: 'mock_google_user_' + Date.now()
        }
      };
      
      await saveSession(mockSession);
      showNoteForm('user@gmail.com');
      updateMailIcon();
      return;
    }

    // Real Google OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback'
      }
    });

    if (error) {
      showError(error.message);
      return;
    }

    // The OAuth flow will redirect to the main app
    // User will need to come back to extension after auth
    
  } catch (error) {
    console.error('Google sign-in error:', error);
    showError("Failed to sign in with Google");
  }
}

// Handle logout
async function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    await clearSession();
    showLoginForm();
  }
}

// Handle mail icon click
async function handleMailClick() {
  const session = await getSession();
  if (session && session.user && session.user.email) {
    // Show user email in a tooltip that appears within the extension
    showUserTooltip(session.user.email);
  } else {
    // Show login prompt
    showUserTooltip('Please login to see your account details');
  }
}

// Show user tooltip within extension
function showUserTooltip(message) {
  // Remove any existing tooltip
  const existingTooltip = document.querySelector('.user-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }
  
  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.className = 'user-tooltip';
  tooltip.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px;">Account</div>
    <div style="font-size: 11px; opacity: 0.9;">${message}</div>
  `;
  
  // Add tooltip styles
  tooltip.style.cssText = `
    position: absolute;
    top: 50px;
    right: 8px;
    background: #000000;
    color: white;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    z-index: 1000;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
    max-width: 180px;
    word-wrap: break-word;
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: fadeIn 0.2s ease-out;
  `;
  
  // Add fade animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-5px); }
    }
  `;
  document.head.appendChild(style);
  
  // Add to container
  document.querySelector('.container').appendChild(tooltip);
  
  // Remove after 4 seconds
  setTimeout(() => {
    if (tooltip.parentNode) {
      tooltip.style.animation = 'fadeOut 0.2s ease-out forwards';
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
      }, 200);
    }
  }, 4000);
}

// Update mail icon with first letter of email
async function updateMailIcon() {
  const session = await getSession();
  if (session && session.user && session.user.email) {
    const firstLetter = session.user.email.charAt(0).toUpperCase();
    mailIcon.textContent = firstLetter;
  } else {
    mailIcon.textContent = 'M';
  }
}

// Handle save note
async function handleSaveNote(e) {
  e.preventDefault();
  clearMessages();

  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();

  if (!content) {
    showError('Please enter some content for your note.');
    return;
  }

  showLoading();

  try {
    if (MOCK_MODE) {
      // Mock save - simulate success
      noteTitle.value = '';
      noteContent.value = '';
      noteTitle.focus();
      return;
    }

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (!session || sessionError) {
      throw new Error('Not authenticated');
    }

    // Call the notes API endpoint
    const response = await fetch(`${API_URL}/api/notes/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ 
        title: title || null,
        content 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        throw new Error(`Server error: ${response.status}`);
      }
      throw new Error(errorData.error || 'Failed to save note');
    }

    const data = await response.json();

    noteTitle.value = '';
    noteContent.value = '';
    noteTitle.focus();
  } catch (error) {
    console.error('Save note error:', error);

    if (error.message === 'Not authenticated') {
      await clearSession();
      showLoginForm();
      showError('Session expired. Please login again.');
    } else {
      showError(error.message || 'Failed to save note. Please try again.');
    }
  } finally {
    hideLoading();
    // Get email from session for showNoteForm
    getSession().then(session => {
      if (session && session.user && session.user.email) {
        showNoteForm(session.user.email);
      }
    });
  }
}


// Validate session with backend
async function validateSession(accessToken) {
  if (MOCK_MODE) {
    // Mock validation - always return true for testing
    return true;
  }

  try {
    const response = await fetch(`${API_URL}/api/extension/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Validate session error:', error);
    return false;
  }
}

// Session management using chrome.storage
async function getSession() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['pannaai_session'], (result) => {
      resolve(result.pannaai_session || null);
    });
  });
}

async function saveSession(session) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ pannaai_session: session }, () => {
      resolve();
    });
  });
}

async function clearSession() {
  return new Promise((resolve) => {
    chrome.storage.local.remove('pannaai_session', () => {
      resolve();
    });
  });
}

// UI Helper Functions
function showLoginForm() {
  hideLoading();
  loginForm.classList.add('active');
  noteForm.classList.remove('active');
  document.getElementById('mainHeader').style.display = 'none'; // Hide header on login page
  mailIcon.style.display = 'none'; // Hide mail icon on login page
  logoutBtn.style.display = 'none'; // Hide logout button on login page
}

function showNoteForm(email) {
  hideLoading();
  loginForm.classList.remove('active');
  noteForm.classList.add('active');
  document.getElementById('mainHeader').style.display = 'flex'; // Show header when logged in
  mailIcon.style.display = 'flex'; // Show mail icon when logged in
  logoutBtn.style.display = 'block'; // Show logout button when logged in
  // userEmail removed - email only shows in mail icon now
  noteContent.focus();
}

function showLoading() {
  loading.classList.add('active');
  loginForm.classList.remove('active');
  noteForm.classList.remove('active');
}

function hideLoading() {
  loading.classList.remove('active');
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('active');
  setTimeout(() => {
    errorMessage.classList.remove('active');
  }, 5000);
}

function clearMessages() {
  errorMessage.classList.remove('active');
}

