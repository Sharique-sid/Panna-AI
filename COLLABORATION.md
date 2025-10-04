# 🤝 Real-Time Collaboration Guide for Panna.ai

## Overview
Panna.ai now supports real-time collaboration with video/audio conferencing, live chat, and collaborative editing.

## Features

### 1. **Shareable Links** 🔗
- Generate unique share links for any note
- Share with friends, colleagues, or collaborators
- Copy link with one click
- Public or private access control

### 2. **Permission Management** 🔐
- **Owner**: Full control over the note
- **Editor**: Can edit note content and chat
- **Viewer**: Read-only access, can only view and chat

### 3. **Real-Time Collaborative Editing** ✍️
- Multiple users can edit the same note simultaneously
- See changes as they happen
- Auto-save prevents data loss
- Conflict resolution built-in

### 4. **Video & Audio Conferencing** 📹
- Start video calls with collaborators
- Screen sharing for presentations
- Mute/unmute audio and video
- High-quality WebRTC connections

### 5. **Live Chat** 💬
- Real-time chat sidebar
- Send messages instantly
- See who's online
- Message history persists

### 6. **Presence Indicators** 👥
- See who's currently viewing the note
- Online/offline status
- Active collaborators list with avatars

## Setup Instructions

### Step 1: Run Database Migration
Execute the SQL script to create the chat messages table:

```bash
# In your Supabase SQL Editor, run:
scripts/add-chat-table.sql
```

### Step 2: Enable Realtime for Chat
In your Supabase dashboard:
1. Go to **Database** → **Replication**
2. Enable realtime for `note_chat_messages` table

### Step 3: (Optional) Configure Video/Audio
For production video/audio, integrate a WebRTC service:

#### Option A: Daily.co (Recommended)
```bash
npm install @daily-co/daily-js
```

Add to `.env.local`:
```env
NEXT_PUBLIC_DAILY_API_KEY=your_daily_api_key
```

#### Option B: Agora
```bash
npm install agora-rtc-sdk-ng
```

Add to `.env.local`:
```env
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id
```

#### Option C: 100ms
```bash
npm install @100mslive/react-sdk
```

Add to `.env.local`:
```env
NEXT_PUBLIC_HMS_TOKEN_ENDPOINT=your_100ms_token_endpoint
```

## Usage

### Sharing a Note
1. Open any note in the editor
2. Click the **Share** button in the toolbar
3. Toggle "Enable sharing" to generate a link
4. Copy and share the link with collaborators

### Starting a Video Call
1. Open the **Collaboration Panel** (right sidebar)
2. Click **"Start Video Call"**
3. Allow camera/microphone permissions
4. Collaborators will see the call notification

### Using Live Chat
1. Open the Collaboration Panel
2. Type your message in the chat input
3. Press Enter or click Send
4. Messages appear instantly for all collaborators

### Managing Permissions
1. Click the **Settings** icon in the Collaboration Panel
2. Select a collaborator
3. Change their role (Viewer/Editor)
4. Changes apply immediately

## API Endpoints

### Chat API
```typescript
// Send a message
POST /api/chat
Body: { noteId: string, message: string }

// Get messages
GET /api/chat?noteId=xxx

// Delete a message
DELETE /api/chat
Body: { messageId: string }
```

### Share API
```typescript
// Enable sharing
POST /api/notes/share
Body: { noteId: string, action: "enable" }

// Disable sharing
POST /api/notes/share
Body: { noteId: string, action: "disable" }
```

## Database Schema

### note_chat_messages
```sql
CREATE TABLE note_chat_messages (
  id UUID PRIMARY KEY,
  note_id UUID REFERENCES notes(id),
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  user_avatar TEXT,
  message TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### note_collaborators
```sql
CREATE TABLE note_collaborators (
  id UUID PRIMARY KEY,
  note_id UUID REFERENCES notes(id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP,
  accepted_at TIMESTAMP
);
```

## Real-Time Events

### Presence Tracking
```typescript
// Subscribe to presence
channel.on('presence', { event: 'sync' }, () => {
  const users = channel.presenceState()
  // Update UI with online users
})
```

### Note Changes
```typescript
// Subscribe to note updates
channel.on('postgres_changes', {
  event: 'UPDATE',
  schema: 'public',
  table: 'notes',
  filter: `id=eq.${noteId}`
}, (payload) => {
  // Update note content
})
```

### Chat Messages
```typescript
// Subscribe to new messages
channel.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'note_chat_messages',
  filter: `note_id=eq.${noteId}`
}, (payload) => {
  // Display new message
})
```

## Security

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access notes they own or are invited to
- Chat messages are scoped to note access
- Permissions enforced at database level

### Authentication
- All API routes require authentication
- JWT tokens validated on every request
- User sessions managed by Supabase Auth

## Troubleshooting

### Video/Audio Not Working
- Check browser permissions for camera/microphone
- Ensure HTTPS (required for WebRTC)
- Verify API keys are correct
- Check network/firewall settings

### Chat Messages Not Appearing
- Verify Realtime is enabled in Supabase
- Check RLS policies are correct
- Ensure user has access to the note
- Check browser console for errors

### Share Link Not Working
- Verify note is marked as public
- Check the share link format
- Ensure RLS policies allow public access
- Verify the slug is correctly generated

## Best Practices

1. **Limit Collaborators**: Keep collaboration groups small for best performance
2. **Use Permissions Wisely**: Grant minimum necessary access
3. **Monitor Usage**: Track video call minutes if using paid services
4. **Regular Backups**: Export important collaborative notes
5. **Test Locally**: Use ngrok or similar for local WebRTC testing

## Future Enhancements

- [ ] Cursor tracking (see where others are typing)
- [ ] Commenting system
- [ ] Version history
- [ ] File attachments in chat
- [ ] Voice messages
- [ ] Drawing/whiteboard mode
- [ ] Recording video calls
- [ ] AI-powered meeting summaries

## Support

For issues or questions:
- Check the documentation
- Review code comments
- Open a GitHub issue
- Contact support

---

**Happy Collaborating! 🎉**
