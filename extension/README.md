# Panna.ai Browser Extension - Quick Capture

A lightweight browser extension that allows you to capture notes instantly from anywhere on the web.

## 🚀 Features

### 1. **Popup Note Taker**
- Click the extension icon to open a quick note-taking popup
- Type your note and save it directly to your Panna.ai account
- Clean, modern UI that matches the main application

### 2. **Right-Click to Save** (Context Menu)
- Highlight any text on any webpage
- Right-click and select "Save to Panna.ai"
- Text is automatically saved with source information (page title + URL)

### 3. **Capture Current Page**
- One-click button to capture the current page's title and URL
- Perfect for bookmarking articles, research, or interesting pages

### 4. **Quick Dashboard Access**
- Direct link to open your Panna.ai dashboard
- Seamless integration with the main web application

## 📦 Installation

### For Development (Chrome/Edge)

1. **Navigate to Extensions**
   - Open Chrome/Edge
   - Go to `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode" (toggle in top-right corner)

2. **Load the Extension**
   - Click "Load unpacked"
   - Navigate to `take-notes/extension/` folder
   - Select the folder and click "Select Folder"

3. **Configure API URL** (if needed)
   - Edit `popup.js` and `background.js`
   - Update `API_URL` to match your backend URL
   - For local development: `http://localhost:3001`
   - For production: `https://your-domain.com`

4. **Pin the Extension**
   - Click the puzzle icon in Chrome toolbar
   - Find "Panna.ai - Quick Capture"
   - Click the pin icon to keep it visible

### For Firefox

1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select the `manifest.json` file from the extension folder

## 🔧 Configuration

### Setting Up Backend Connection

Before using the extension, you need to configure it to connect to your Panna.ai backend:

1. **Get Your Supabase Credentials**
   - Go to your Supabase project dashboard
   - Copy your Project URL and anon/public key

2. **Update Extension Configuration**
   
   Edit `extension/popup.js`:
   ```javascript
   const API_URL = 'http://localhost:3001'; // Your backend URL
   const SUPABASE_URL = 'your-project-url.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```

   Edit `extension/background.js`:
   ```javascript
   const API_URL = 'http://localhost:3001'; // Your backend URL
   ```

3. **Reload the Extension**
   - Go back to `chrome://extensions/`
   - Click the refresh icon on the Panna.ai extension card

## 💻 Usage

### First Time Setup

1. **Login**
   - Click the extension icon
   - Enter your Panna.ai email and password
   - Click "Sign In"

2. **Your session is saved securely**
   - You only need to login once
   - The extension will remember you across browser sessions

### Creating Notes

**Method 1: Quick Popup**
1. Click the extension icon
2. Type your note in the text area
3. Click "Save Note"
4. ✅ Note is instantly saved to your account

**Method 2: Context Menu**
1. Highlight any text on any webpage
2. Right-click
3. Select "Save to Panna.ai"
4. ✅ Selected text is saved with source information

**Method 3: Capture Page**
1. Click the extension icon
2. Click "🔗 Capture Page" button
3. Page title and URL are added to the note field
4. Add additional notes if desired
5. Click "Save Note"

## 🔐 Security

### How Authentication Works

1. **Secure Token Storage**
   - Your session token is stored in `chrome.storage.local`
   - This is isolated storage that only the extension can access
   - Tokens are never exposed to web pages

2. **Token Validation**
   - On every API request, your token is validated
   - Expired tokens are automatically cleared
   - You'll be prompted to login again if needed

3. **API Security**
   - All API requests use HTTPS in production
   - JWT tokens are sent in `Authorization` headers
   - Backend validates every request with Supabase Auth

### What Data is Stored?

- **Session Token**: Your Supabase auth token (JWT)
- **User Email**: For display purposes only
- **No Passwords**: Passwords are never stored locally

## 🛠️ Technical Architecture

### Extension Structure

```
extension/
├── manifest.json       # Extension configuration
├── popup.html          # UI for the popup window
├── popup.js            # Logic for popup (login, note creation)
├── background.js       # Service worker (context menu, notifications)
├── icons/              # Extension icons (16, 48, 128px)
└── README.md           # This file
```

### API Endpoints Used

1. **`POST /api/auth/signin`**
   - Authenticates user with Supabase
   - Returns session token

2. **`GET /api/extension/validate`**
   - Validates session token
   - Returns user information

3. **`POST /api/extension/notes/create`**
   - Creates a new note
   - Requires authentication header

### Manifest V3 Features

- **Service Worker**: Modern background script architecture
- **Permissions**: Minimal required permissions (storage, contextMenus, activeTab)
- **Host Permissions**: Limited to your backend domain
- **CSP**: Content Security Policy for enhanced security

## 🎨 Customization

### Changing the UI Theme

Edit `popup.html` CSS section:

```css
/* Change gradient colors */
background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
```

### Adding Custom Keyboard Shortcuts

Add to `manifest.json`:

```json
"commands": {
  "quick-note": {
    "suggested_key": {
      "default": "Ctrl+Shift+N"
    },
    "description": "Open quick note popup"
  }
}
```

## 🐛 Troubleshooting

### Extension Won't Load

- Check that all files are present in the extension folder
- Make sure `manifest.json` is valid JSON
- Check Chrome DevTools console for errors

### Can't Login

- Verify `API_URL` is correct in `popup.js`
- Check your backend is running (`http://localhost:3001`)
- Open DevTools on the popup (right-click icon → Inspect)
- Check console for error messages

### Notes Not Saving

- Ensure you're logged in (click extension icon to check)
- Verify backend API endpoints are working
- Check Network tab in DevTools for failed requests
- Confirm database permissions in Supabase

### Right-Click Menu Not Appearing

- Make sure you have text selected
- Verify `contextMenus` permission in manifest.json
- Reload the extension and try again

## 📝 Development Notes

### Testing Locally

1. Start your Next.js backend:
   ```bash
   npm run dev
   ```

2. Load the extension in Chrome (see Installation above)

3. Test all features:
   - [ ] Login flow
   - [ ] Create note from popup
   - [ ] Save selected text
   - [ ] Capture page button
   - [ ] Logout

### Before Production Deployment

1. **Update API URLs**
   - Change `http://localhost:3001` to production URL
   - Update in both `popup.js` and `background.js`

2. **Generate Icons**
   - Create 16x16, 48x48, and 128x128 PNG icons
   - Place in `icons/` folder
   - Use your Panna.ai logo/branding

3. **Update Manifest**
   - Set correct `host_permissions` for production
   - Update version number
   - Add your website URL

4. **Test Thoroughly**
   - Test in Chrome and Edge
   - Test all authentication flows
   - Test error handling
   - Verify all API calls work

5. **Package for Distribution**
   ```bash
   # Zip the extension folder
   zip -r panna-ai-extension.zip extension/
   ```

6. **Submit to Chrome Web Store**
   - Create developer account
   - Pay one-time $5 fee
   - Upload ZIP file
   - Fill out store listing
   - Wait for review (1-3 days)

## 🎯 Interview Talking Points

When presenting this extension in an interview, highlight:

1. **Security First**
   - Secure token storage
   - Token validation
   - Protected API endpoints

2. **User Experience**
   - Frictionless capture workflow
   - Context menu integration
   - Minimal clicks required

3. **Full-Stack Implementation**
   - Frontend (extension UI)
   - Backend (new API endpoints)
   - Database (leverages existing schema)

4. **Best Practices**
   - Manifest V3 (latest standard)
   - Minimal permissions
   - Error handling
   - Loading states

5. **Scalability**
   - Reuses existing auth system
   - Leverages existing database
   - Can be extended with more features

## 🚀 Future Enhancements

Ideas for v2:

- [ ] Offline mode with sync queue
- [ ] OCR for images (capture screenshots)
- [ ] Voice notes with speech-to-text
- [ ] Rich text formatting in popup
- [ ] Keyboard shortcuts
- [ ] Category selection
- [ ] Tag suggestions
- [ ] Quick search through existing notes
- [ ] Share extension with team members

## 📄 License

MIT License - Same as main Panna.ai project

## 👨‍💻 Author

Built as part of the Panna.ai ecosystem by Hasnain

---

**Happy Note-Taking! 📝✨**

