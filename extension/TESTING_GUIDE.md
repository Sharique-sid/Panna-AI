# Panna.ai Extension Testing Guide

## 🚀 Quick Setup

### 1. Load the Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder from this project
5. The extension should appear in your extensions list

### 2. Test Authentication
1. Click the Panna.ai extension icon in your browser toolbar
2. You should see the login form
3. Use the same credentials you use for the main website
4. After login, you should see the note-taking form

### 3. Test Note Saving
1. Enter a title and content in the extension
2. Click "Save Note"
3. Check your main dashboard at `http://localhost:3000/dashboard`
4. The note should appear in your notes list

### 4. Test Context Menu
1. Select some text on any webpage
2. Right-click and choose "Save to Panna.ai"
3. You should get a notification that the note was saved
4. Check your dashboard to see the saved note

## 🔧 Current Status

### ✅ Working Features
- Extension loads without errors
- Authentication with real Supabase backend
- Note saving to dashboard
- UI matches main website design
- Context menu for selected text

### 🚧 Features to Test
- Screenshot capture (if implemented)
- Error handling for network issues
- Session persistence across browser restarts

## 🐛 Troubleshooting

### Extension Won't Load
- Check that all files are in the `extension` folder
- Verify `manifest.json` is valid JSON
- Check Chrome's extension error console

### Authentication Fails
- Ensure the main website is running on `http://localhost:3000`
- Check that `.env.local` has the correct Supabase credentials
- Verify the extension is using the same Supabase project

### Notes Don't Save
- Check browser console for errors
- Verify the API endpoint `/api/notes/create` is working
- Test the main website's note creation first

## 📝 Testing Checklist

- [ ] Extension loads in Chrome
- [ ] Login form appears
- [ ] Can login with valid credentials
- [ ] Note form appears after login
- [ ] Can save notes successfully
- [ ] Notes appear in main dashboard
- [ ] Context menu works on selected text
- [ ] Logout functionality works
- [ ] Session persists across extension opens
- [ ] Error messages display properly

## 🎯 Next Steps

After basic functionality is confirmed:
1. Test screenshot capture feature
2. Test with different websites
3. Test error scenarios (network issues, invalid credentials)
4. Performance testing with large notes
5. Cross-browser compatibility (Firefox, Edge)
