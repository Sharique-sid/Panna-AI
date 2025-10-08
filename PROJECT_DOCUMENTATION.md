# Panna.ai - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [API Routes](#api-routes)
6. [Components Architecture](#components-architecture)
7. [State Management](#state-management)
8. [Authentication Flow](#authentication-flow)
9. [Key Features](#key-features)
10. [Recent Improvements](#recent-improvements)
11. [Known Issues](#known-issues)
12. [Environment Setup](#environment-setup)
13. [Deployment Guide](#deployment-guide)

---

## 📖 Project Overview

**Panna.ai** is a modern, full-stack AI-powered note-taking application built with Next.js 15, Supabase, and Google Gemini AI. It provides a rich markdown editing experience with real-time synchronization, AI-powered features, and a beautiful responsive UI.

### Key Characteristics
- **Type**: Full-stack web application
- **Version**: 1.0.0
- **Author**: Md Taufique Alam
- **License**: MIT
- **Description**: AI-powered note-taking app with real-time sync

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.3.4 (App Router)
- **UI Library**: React 19.0.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React (v0.522.0)
- **Markdown**: react-markdown, remark-gfm, remark-breaks
- **Theme**: next-themes (dark/light mode)
- **Notifications**: Sonner (toast notifications)

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage (for images)
- **Client**: @supabase/supabase-js (v2.50.0)
- **SSR**: @supabase/ssr (v0.6.1)

### State Management
- **Global State**: Zustand (v5.0.5) with persist middleware
- **Forms**: React Hook Form (v7.58.1) + Zod (v3.25.67)

### AI Integration
- **AI Provider**: Google Gemini AI
- **Package**: @google/generative-ai (v0.24.1)
- **Model**: gemini-pro

### Development Tools
- **Package Manager**: npm
- **Testing**: Jest, React Testing Library, Playwright
- **Type Checking**: TypeScript strict mode
- **Linting**: ESLint (Next.js config)

---

## 📁 Project Structure

```
panna.ai/
├── app/                              # Next.js App Router
│   ├── api/                          # API Routes
│   │   ├── ai/                       # AI Integration Endpoints
│   │   │   ├── generate-tags/        # Auto-generate tags
│   │   │   ├── related-notes/        # Find related notes
│   │   │   ├── rephrase/             # Rephrase content
│   │   │   ├── summarize/            # Summarize notes
│   │   │   ├── template/             # Generate templates
│   │   │   └── translate/            # Translate content
│   │   ├── auth/                     # Authentication Endpoints
│   │   │   ├── signin/               # Sign in
│   │   │   ├── signup/               # Sign up
│   │   │   ├── signout/              # Sign out
│   │   │   ├── logout/               # Logout
│   │   │   ├── forgot-password/      # Password reset request
│   │   │   └── update-password/      # Update password
│   │   ├── notes/                    # Notes Endpoints
│   │   │   ├── share/                # Share notes
│   │   │   └── upload-image/         # Image upload
│   │   ├── user/                     # User Endpoints
│   │   │   ├── avatar/               # Update avatar
│   │   │   ├── preferences/          # User preferences
│   │   │   └── profile/              # User profile
│   │   └── debug/                    # Debug Endpoints
│   │       ├── clear-storage/        # Clear storage
│   │       ├── storage/              # Storage info
│   │       └── user-data/            # User data
│   ├── auth/                         # Auth Pages
│   │   ├── signin/                   # Sign in page
│   │   ├── signup/                   # Sign up page
│   │   ├── forgot-password/          # Forgot password page
│   │   └── reset-password/           # Reset password page
│   ├── dashboard/                    # Main Dashboard
│   │   └── page.tsx                  # Dashboard page
│   ├── settings/                     # Settings Page
│   │   └── page.tsx                  # Settings page
│   ├── s/                            # Shared Notes
│   │   └── [slug]/                   # Public note view
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page
│   └── globals.css                   # Global styles
│
├── components/                       # React Components
│   ├── auth/                         # Auth Components
│   │   ├── signin-form.tsx           # Sign in form
│   │   ├── signup-form.tsx           # Sign up form
│   │   └── forgot-password-form.tsx  # Password reset form
│   ├── dashboard/                    # Dashboard Components
│   │   ├── dashboard-layout.tsx      # Main layout
│   │   ├── app-sidebar.tsx           # Sidebar navigation
│   │   ├── notes-list.tsx            # Notes list with multi-select
│   │   ├── note-editor.tsx           # Rich text editor
│   │   ├── top-bar.tsx               # Top navigation bar
│   │   ├── ai-tools-menu.tsx         # AI tools dropdown
│   │   ├── category-select.tsx       # Category selector
│   │   ├── share-dialog.tsx          # Share note dialog
│   │   ├── tag-display.tsx           # Tag display
│   │   ├── simple-tag-input.tsx      # Tag input
│   │   ├── keyboard-shortcuts-dialog.tsx  # Shortcuts help
│   │   └── feature-not-ready-dialog.tsx   # Feature placeholder
│   ├── home/                         # Home Page Components
│   │   └── home-page.tsx             # Landing page
│   ├── setting/                      # Settings Components
│   │   └── settings-page.tsx         # Settings page
│   ├── providers/                    # Context Providers
│   │   └── theme-provider.tsx        # Theme provider
│   └── ui/                           # shadcn/ui Components
│       ├── button.tsx, input.tsx, etc.  # UI primitives
│       └── ...                       # All shadcn components
│
├── hooks/                            # Custom Hooks
│   ├── use-notes-store.ts            # Notes state management (Zustand)
│   ├── use-ai.ts                     # AI integration hook
│   ├── use-realtime.ts               # Real-time updates
│   └── use-mobile.ts                 # Mobile detection
│
├── lib/                              # Libraries & Utilities
│   ├── supabase/                     # Supabase Configuration
│   │   ├── client.ts                 # Client-side Supabase client
│   │   └── server.ts                 # Server-side Supabase client
│   ├── gemini.ts                     # Google Gemini AI setup
│   └── utils.ts                      # Utility functions (cn, etc.)
│
├── types/                            # TypeScript Types
│   └── index.ts                      # Global type definitions
│
├── scripts/                          # Database Scripts
│   ├── create-tables.sql             # Database schema
│   ├── seed-data.sql                 # Sample data
│   ├── fix-storage-policies.sql      # Storage policies
│   ├── setup-storage.sql             # Storage setup
│   └── setup-storage.sh              # Storage setup script
│
├── public/                           # Static Assets
│   ├── favicon.svg                   # Favicon
│   ├── opengraph-image.png           # OG image
│   ├── demo.png                      # Demo screenshot
│   └── ...                           # Other assets
│
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── tailwind.config.js                # Tailwind config
├── next.config.ts                    # Next.js config
├── components.json                   # shadcn/ui config
├── README.md                         # Project README
└── PROJECT_DOCUMENTATION.md          # This file
```

---

## 🗄️ Database Schema

### Tables

#### 1. **notes**
Main table for storing notes.

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  public_share_id TEXT UNIQUE,
  is_public BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,  -- Soft delete
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Fields:**
- `deleted_at`: NULL for active notes, timestamp for trash
- `public_share_id`: Unique slug for public sharing
- `tags`: Array of strings for categorization
- `is_favorite`: Boolean for starred notes

**Indexes:**
- Primary key on `id`
- Index on `user_id` for fast user queries
- Index on `category_id` for category filtering
- Index on `deleted_at` for trash queries
- Full-text search on `title` and `content`

#### 2. **categories**
User-created categories for organizing notes.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. **user_preferences**
User settings and preferences.

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  editor_theme TEXT DEFAULT 'default' CHECK (editor_theme IN ('default', 'github', 'monokai', 'solarized')),
  auto_save BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT FALSE,
  weekly_digest BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

#### 4. **ai_interactions**
Track AI usage for analytics.

```sql
CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,  -- 'summarize', 'rephrase', 'translate', etc.
  prompt TEXT,
  response TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS)

All tables have RLS enabled with policies:

```sql
-- Users can only read their own data
CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own data
CREATE POLICY "Users can insert own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own data
CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);
```

### Storage Buckets

#### **note-images**
For storing note images.

```sql
-- Allow authenticated users to upload images
CREATE POLICY "Users can upload note images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'note-images' AND auth.role() = 'authenticated');

-- Allow users to view their own images
CREATE POLICY "Users can view own images" ON storage.objects
  FOR SELECT USING (bucket_id = 'note-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (bucket_id = 'note-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 🔌 API Routes

### Authentication APIs

#### POST `/api/auth/signup`
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": { "id": "...", "email": "..." },
  "session": { "access_token": "...", "refresh_token": "..." }
}
```

#### POST `/api/auth/signin`
Sign in an existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/signout`
Sign out the current user.

#### POST `/api/auth/forgot-password`
Request password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

#### POST `/api/auth/update-password`
Update user password (requires auth).

**Request:**
```json
{
  "password": "newpassword123"
}
```

### AI APIs

#### POST `/api/ai/summarize`
Summarize note content.

**Request:**
```json
{
  "content": "Long note content..."
}
```

**Response:**
```json
{
  "summary": "Brief summary of the content..."
}
```

#### POST `/api/ai/rephrase`
Rephrase content in different styles.

**Request:**
```json
{
  "content": "Original text",
  "style": "professional" // or "casual", "academic"
}
```

#### POST `/api/ai/translate`
Translate content to different languages.

**Request:**
```json
{
  "content": "Text to translate",
  "targetLanguage": "Spanish"
}
```

#### POST `/api/ai/generate-tags`
Auto-generate tags based on content.

**Request:**
```json
{
  "content": "Note content..."
}
```

**Response:**
```json
{
  "tags": ["tag1", "tag2", "tag3"]
}
```

#### POST `/api/ai/template`
Generate note templates.

**Request:**
```json
{
  "templateType": "meeting-notes"
}
```

#### POST `/api/ai/related-notes`
Find related notes based on content.

**Request:**
```json
{
  "noteId": "uuid",
  "content": "Note content..."
}
```

### User APIs

#### GET `/api/user/profile`
Get current user profile.

#### PUT `/api/user/profile`
Update user profile.

**Request:**
```json
{
  "displayName": "John Doe",
  "bio": "Software developer"
}
```

#### GET `/api/user/preferences`
Get user preferences.

#### PUT `/api/user/preferences`
Update user preferences.

**Request:**
```json
{
  "theme": "dark",
  "fontSize": "medium",
  "autoSave": true
}
```

#### POST `/api/user/avatar`
Upload user avatar (multipart/form-data).

### Notes APIs

#### POST `/api/notes/upload-image`
Upload image for notes (multipart/form-data).

**Response:**
```json
{
  "url": "https://supabase.co/storage/..."
}
```

#### POST `/api/notes/share`
Share a note publicly.

**Request:**
```json
{
  "noteId": "uuid"
}
```

**Response:**
```json
{
  "shareUrl": "https://app.com/s/abc123"
}
```

---

## 🎨 Components Architecture

### Core Components

#### 1. **DashboardLayout** (`components/dashboard/dashboard-layout.tsx`)
Main layout component that orchestrates the entire dashboard.

**Props:**
```typescript
interface DashboardLayoutProps {
  user: User;
}
```

**Features:**
- Three-panel layout (sidebar, notes list, editor)
- Responsive design with mobile adaptations
- State management integration
- Real-time sync coordination

**State:**
- `sidebarOpen`: Controls sidebar visibility
- `isFocusMode`: Toggle focus mode (hide sidebar)
- Notes filtering and search

#### 2. **AppSidebar** (`components/dashboard/app-sidebar.tsx`)
Left sidebar with navigation.

**Features:**
- All notes, favorites, trash views
- Categories list with creation
- User profile dropdown
- Settings link
- Theme toggle

#### 3. **NotesList** (`components/dashboard/notes-list.tsx`)
Middle panel showing list of notes.

**Props:**
```typescript
interface NotesListProps {
  notes: Note[];
  selectedNote: Note | null;
  selectedCategory: string;
  onNoteSelect: (note: Note) => void;
  isLoading?: boolean;
  className?: string;
}
```

**Features:**
- Note cards with title, preview, timestamp, tags
- Multi-select mode with "Select All" option
- Bulk operations (delete, recover, permanent delete)
- Drag and drop support
- Individual note actions (favorite, restore, delete)
- Trash-specific actions with dropdown confirmation
- Loading and empty states

**Recent Updates:**
- Added permanent delete confirmation via dropdown menu
- Bulk delete in trash shows confirmation dropdown
- Individual delete in trash works immediately

#### 4. **NoteEditor** (`components/dashboard/note-editor.tsx`)
Right panel with rich text editor.

**Props:**
```typescript
interface NoteEditorProps {
  note: Note | null;
  categories: Category[];
  onBackToList?: () => void;
  showBackButton?: boolean;
  className?: string;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}
```

**Features:**
- Rich markdown editor with toolbar
- Auto-save functionality
- AI tools integration
- Image upload support
- Tag management
- Category assignment
- Share functionality
- Markdown preview
- Keyboard shortcuts

#### 5. **AIToolsMenu** (`components/dashboard/ai-tools-menu.tsx`)
AI features dropdown.

**Features:**
- Summarize
- Rephrase (multiple styles)
- Translate (multiple languages)
- Generate tags
- Create template
- Find related notes

---

## 💾 State Management

### Zustand Store (`hooks/use-notes-store.ts`)

**Store Structure:**
```typescript
interface NotesStore {
  // State
  notes: Note[];
  categories: Category[];
  selectedNote: Note | null;
  selectedCategory: string;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  // Setters
  setNotes: (notes: Note[]) => void;
  setCategories: (categories: Category[]) => void;
  setSelectedNote: (note: Note | null) => void;
  setSelectedCategory: (categoryId: string) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Notes Operations
  loadNotes: () => Promise<void>;
  createNote: () => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;  // Soft delete
  purgeNote: (id: string) => Promise<void>;   // Permanent delete
  restoreNote: (id: string) => Promise<void>;
  duplicateNote: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;

  // Categories Operations
  loadCategories: () => Promise<void>;
  createCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}
```

**Persistence:**
- Uses Zustand persist middleware
- Stores to localStorage with key `notes-store`
- 50KB size limit with automatic cleanup
- Handles SSR with typeof window checks

**Key Methods:**

1. **loadNotes()**: Fetch all user notes from Supabase
2. **createNote()**: Create new empty note
3. **updateNote()**: Update note fields (title, content, category, tags)
4. **deleteNote()**: Soft delete (set `deleted_at`)
5. **purgeNote()**: Permanent delete from database
6. **restoreNote()**: Restore from trash (clear `deleted_at`)
7. **toggleFavorite()**: Toggle `is_favorite` field

---

## 🔐 Authentication Flow

### Sign Up Flow
1. User fills signup form
2. POST to `/api/auth/signup`
3. Supabase creates user in `auth.users`
4. Confirmation email sent (if enabled)
5. Redirect to dashboard

### Sign In Flow
1. User fills signin form
2. POST to `/api/auth/signin`
3. Supabase validates credentials
4. Session created with JWT
5. Cookies set for auth state
6. Redirect to dashboard

### Password Reset Flow
1. User enters email in forgot-password form
2. POST to `/api/auth/forgot-password`
3. Supabase sends reset email
4. User clicks link in email
5. Redirected to `/auth/reset-password?token=...`
6. User enters new password
7. POST to `/api/auth/update-password`
8. Password updated, redirect to signin

### Session Management
- JWT stored in httpOnly cookies
- Automatic refresh via Supabase client
- Server-side validation in API routes
- Client-side auth state via Supabase hooks

---

## ✨ Key Features

### 1. Rich Markdown Editor
- Full markdown support with live preview
- Toolbar with formatting buttons
- Image upload and embedding
- Syntax highlighting
- GFM (GitHub Flavored Markdown)
- Task lists, tables, code blocks

### 2. Categories & Organization
- Create custom categories
- Assign notes to categories
- Filter by category
- Delete categories (notes set to null)

### 3. Tags System
- Multiple tags per note
- Auto-suggest from existing tags
- Filter by tags
- AI-generated tags

### 4. Favorites
- Star important notes
- Quick access via favorites filter
- Persistent across sessions

### 5. Trash & Restore
- Soft delete to trash
- Restore deleted notes
- Permanent delete from trash
- Bulk operations support

### 6. Search & Filtering
- Full-text search
- Filter by category
- Filter by tags
- Search in title and content

### 7. AI Integration
- **Summarize**: Create brief summaries
- **Rephrase**: Professional, casual, academic styles
- **Translate**: 10+ languages
- **Tags**: Auto-generate relevant tags
- **Templates**: Meeting notes, TODO lists, etc.
- **Related**: Find similar notes

### 8. Real-time Sync
- Auto-save every 2 seconds
- Real-time updates across tabs
- Conflict resolution
- Online/offline detection

### 9. Responsive Design
- Mobile-first approach
- Adaptive layouts for tablet/desktop
- Touch-friendly interface
- Collapsible sidebar on mobile

### 10. Theme Support
- Light/dark mode
- System theme detection
- Persistent preference
- Smooth transitions

---

## 🔧 Recent Improvements

### Trash Management Enhancement (Latest)

**Problem:** 
- No permanent delete option for multiple notes in trash
- No confirmation when permanently deleting notes

**Solution:**
- Added permanent delete button (trash icon) in multi-select mode for trash
- Confirmation shown via dropdown menu (matching existing UI style)
- Individual notes in trash: Click 3-dot menu → "Delete permanently" → Immediate deletion
- Bulk delete in trash: Click trash icon → Dropdown confirmation → "Delete X note(s) permanently"

**Files Changed:**
- `components/dashboard/notes-list.tsx`
  - Added `showDeleteConfirm` state
  - Added `DropdownMenu` for bulk delete confirmation
  - Modified trash multi-select toolbar
  - Added `handlePurgeSelected()` method

**UI/UX:**
- Uses existing dropdown menu style (consistent design)
- Small, compact confirmation (not intrusive)
- Red destructive styling
- Trash icon indicator
- Shows count of notes to be deleted

---

## 🐛 Known Issues

### 1. localStorage is not defined (SSR)
**Error:**
```
ReferenceError: localStorage is not defined
at Object.getItem (hooks\use-notes-store.ts:460:25)
```

**Cause:** Zustand persist middleware trying to access localStorage during SSR

**Status:** Non-blocking warning (app works correctly)

**Potential Fix:** 
```typescript
// Add proper SSR check in storage config
storage: createJSONStorage(() => {
  if (typeof window !== 'undefined') {
    return localStorage;
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };
})
```

### 2. Supabase Connection Timeout
**Error:**
```
TypeError: fetch failed
[cause]: [Error [ConnectTimeoutError]: Connect Timeout Error
```

**Cause:** Network issues or Supabase server timeout

**Status:** Intermittent, usually resolves on retry

**Mitigation:** Add retry logic in Supabase client config

### 3. Critical Dependency Warning (Supabase Realtime)
**Warning:**
```
Critical dependency: the request of a dependency is an expression
```

**Cause:** Dynamic requires in Supabase realtime-js package

**Status:** Known issue in Supabase library, doesn't affect functionality

**Action:** Can be ignored safely

---

## 🌍 Environment Setup

### Required Environment Variables

Create `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Supabase Setup

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy project URL and anon key
4. Run database migrations from `scripts/create-tables.sql`
5. Set up storage bucket for images
6. Enable Row Level Security (RLS)

### Google Gemini Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Copy key to `.env.local`

### Installation Steps

```bash
# Clone repository
git clone <repo-url>
cd panna.ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run database migrations
# Copy SQL from scripts/create-tables.sql
# Run in Supabase SQL Editor

# Start development server
npm run dev

# Open browser
http://localhost:3000
```

---

## 🚀 Deployment Guide

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select Next.js framework preset

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Get deployment URL

### Production Checklist

- [ ] Set up production Supabase project
- [ ] Configure production environment variables
- [ ] Enable RLS policies
- [ ] Set up custom domain (optional)
- [ ] Configure CORS for API routes
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (Google Analytics, Plausible)
- [ ] Test authentication flow
- [ ] Test AI features
- [ ] Test real-time sync
- [ ] Optimize images and assets
- [ ] Set up CDN for static assets

---

## 📊 Performance Optimization

### Current Optimizations

1. **Code Splitting**
   - Automatic with Next.js App Router
   - Dynamic imports for heavy components

2. **Image Optimization**
   - Next.js Image component
   - Automatic WebP conversion
   - Lazy loading

3. **Caching**
   - Zustand persist for offline support
   - Browser localStorage for preferences

4. **Database**
   - Indexed queries (user_id, category_id, deleted_at)
   - RLS for security without performance hit
   - Optimized Supabase queries

### Future Optimizations

1. **Implement React Server Components** for faster initial load
2. **Add Service Worker** for offline functionality
3. **Implement Incremental Static Regeneration** for public notes
4. **Add CDN** for static assets
5. **Optimize Bundle Size** (remove unused dependencies)
6. **Add Loading Skeletons** for better perceived performance

---

## 🧪 Testing Strategy

### Test Files Location
```
__tests__/
├── components/
│   ├── note-editor.test.tsx
│   ├── notes-list.test.tsx
│   └── dashboard-layout.test.tsx
├── hooks/
│   └── use-notes-store.test.ts
├── api/
│   └── auth.test.ts
└── e2e/
    ├── auth.spec.ts
    └── notes.spec.ts
```

### Run Tests
```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E UI
npm run test:e2e:ui
```

---

## 📚 Additional Resources

### Documentation Links
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Google Gemini Docs](https://ai.google.dev/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Zustand Docs](https://docs.pmnd.rs/zustand)

### Project-Specific Docs
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [README.md](./README.md) - Project overview
- [scripts/create-tables.sql](./scripts/create-tables.sql) - Database schema

---

## 🤝 Contributing

### Development Workflow

1. **Clone and setup**
   ```bash
   git clone <repo-url>
   npm install
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes**
   - Write code
   - Add tests
   - Update documentation

4. **Test changes**
   ```bash
   npm test
   npm run type-check
   npm run lint
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Describe changes
   - Link related issues
   - Wait for review

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (via ESLint)
- **Components**: Functional components with hooks
- **File naming**: kebab-case for files, PascalCase for components
- **Imports**: Absolute imports with `@/` prefix

---

## 📞 Support & Contact

### Get Help
- Review this documentation
- Check code comments
- Open an issue on GitHub
- Contact: Hasnain (author)

### Reporting Bugs
Include:
1. Description of the bug
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Screenshots (if applicable)
6. Environment details (browser, OS, etc.)

---

## 📝 Version History

### v1.0.0 (Current)
- ✅ Initial release
- ✅ Full CRUD for notes
- ✅ Categories and tags
- ✅ AI integration
- ✅ Real-time sync
- ✅ Authentication
- ✅ Responsive design
- ✅ Dark/light theme
- ✅ Trash with permanent delete
- ✅ Bulk operations with confirmation

### Future Roadmap
- [ ] Collaboration features
- [ ] Note sharing with permissions
- [ ] Export to PDF/Markdown
- [ ] Backup and restore
- [ ] Search improvements
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] API documentation
- [ ] Webhooks integration

---

## 🎯 Summary

This is a complete, production-ready note-taking application with:
- ✅ Modern Next.js 15 architecture
- ✅ Supabase backend with RLS
- ✅ AI-powered features
- ✅ Real-time collaboration
- ✅ Responsive design
- ✅ Comprehensive state management
- ✅ Full authentication system
- ✅ Rich markdown editor
- ✅ Advanced organization (categories, tags, favorites, trash)

**Use this document as a reference when:**
- Onboarding new developers
- Discussing with AI assistants
- Planning new features
- Debugging issues
- Documenting changes
- Deploying to production

**Happy coding! 📝✨**

