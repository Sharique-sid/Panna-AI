// Simplified Supabase client for browser extension
// This avoids CSP issues by not using external CDN

class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.auth = new SupabaseAuth(url, key);
  }

  createClient(url, key) {
    return new SupabaseClient(url, key);
  }
}

class SupabaseAuth {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.session = null;
  }

  async signInWithPassword({ email, password }) {
    try {
      const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Supabase auth error:', errorData);
        return { data: null, error: errorData };
      }

      const data = await response.json();
      this.session = data;
      return { data: { session: data, user: data.user }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async signInWithOAuth({ provider, options }) {
    // For OAuth, we need to redirect to the main app
    const redirectUrl = options.redirectTo || `${window.location.origin}/auth/callback`;
    const authUrl = `${this.url}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(redirectUrl)}`;
    
    // Open in new tab for OAuth flow
    chrome.tabs.create({ url: authUrl });
    
    return { data: null, error: null };
  }

  async getSession() {
    if (!this.session) {
      return { data: { session: null }, error: null };
    }
    return { data: { session: this.session }, error: null };
  }

  async setSession(session) {
    this.session = session;
    return { data: { session }, error: null };
  }
}

// Create global supabase object
window.supabase = {
  createClient: (url, key, options = {}) => {
    return new SupabaseClient(url, key);
  }
};

console.log('Local Supabase client loaded successfully');
