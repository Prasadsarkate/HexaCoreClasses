# Education & Tech Platform Mobile App UI Requirements Document

## 1. Application Overview

### 1.1 Application Name
EduTech Learning Platform

### 1.2 Application Description
A comprehensive mobile application designed for education and technology learning, providing integrated access to video courses, PDF notes, community support, and personalized learning progress tracking. The platform features a modern, scalable UI design with dynamic subject management and includes a robust admin panel with role-based access control and enhanced security through multi-factor authentication.

### 1.3 Core Features
\n#### Screen 1: Unified Home\n- Top navigation bar featuring user profile photo and search functionality
- Dynamic subject filter chips (horizontally scrollable to accommodate unlimited subjects)
- Featured video card prominently displayed at center
- Horizontal scrollable 'Continue Reading' section for PDF notes
- Smooth transitions and intuitive navigation flow
- Pull-to-refresh functionality\n
#### Screen 2: Content Library (Notes & Videos)
- Dual-tab layout structure:
  - **Tab 1: Video Library by Topics**
    * Grid/card layout displaying subject topics (Python, Java, Web Development, etc.)
    * Each topic card shows:
      - Custom thumbnail image (enlarged size: 280x180px for better clarity and visibility)
      - Topic name\n      - Total number of videos in playlist
      - Overall completion percentage
      - Duration of entire playlist
    * **Java Playlist Example**:
      - Topic: Java Programming Fundamentals
      - Thumbnail: Java logo with code snippets background
      - Total videos: 8
      - Playlist duration: 4 hours 25 minutes
      - Videos included:\n        1. Introduction to Java (25 min)\n        2. Java Syntax and Variables (30 min)
        3. Object-Oriented Programming Basics (35 min)
        4. Classes and Objects in Java (40 min)
        5. Inheritance and Polymorphism (38 min)
        6. Java Collections Framework (42 min)\n        7. Exception Handling (28 min)
        8. File I/O Operations (27 min)
    * Clicking a topic card navigates to Topic Detail View:\n      - Topic header with enlarged thumbnail (320x200px) and description
      - Playlist of all videos under this topic displayed as list items
      - Each video item shows:
        * Video thumbnail (enlarged to 160x90px)
        * Video title and duration
        * Completion status (checkmark icon for completed videos)
        * Individual progress bar for partially watched videos
      - Sequential play button to continue from last watched position
      - Overall playlist progress indicator at top
      - Bookmark option for individual videos
      - Download option for offline viewing
      - **PDF Resources Section**:
        * Dedicated section below video playlist showing related PDFs
        * Each PDF card displays:
          - PDF thumbnail preview (120x160px)
          - PDF title and file size
          - Subject/topic tag\n          - Download button with progress indicator
          - 'Read Online' button to open in-app PDF viewer
        * In-app PDF viewer features:
          - Page navigation with thumbnail sidebar
          - Zoom and pan controls
          - Bookmark pages
          - Search within PDF\n          - Night mode for reading
          - Download for offline access
    * Back navigation to return to topics overview
  - **Tab 2: PDF Library**
    * Google Drive integration with file cards
    * Download and bookmark icons
    * Subject-based categorization
- Advanced filtering by subject, difficulty level, and date\n- Search functionality with auto-suggestions
- Sort options (newest, most popular, alphabetical)
\n#### Screen 3: Enhanced Community & Doubt Section
- Clean help desk interface\n- **'Post a Doubt' button with camera icon support for image attachments**
- **Doubt Feed Display** showing student questions with:
  - **Doubt Status Indicator**:
    * Pending (Orange badge with clock icon)
    * Answered (Green badge with checkmark icon)
    * Verified Answer (Blue badge with verified shield icon)
  - **Timestamp Display**: Shows when doubt was posted (e.g., 2 hours ago, Yesterday, Jan 12, 2026)
  - **Doubt Content**: Question text with attached images if any
  - **Answer Section** (if answered):
    * Admin/Expert answer with verified badge
    * Timestamp of when answer was posted
  - **Action Buttons** (visible to doubt author):
    * Edit Doubt button (pencil icon)
    * Delete Doubt button (trash icon)
    * Confirmation dialog appears before deletion: Are you sure you want to delete this doubt? This action cannot be undone\n- Modern chat-bubble style conversation layout
- Real-time notification system for responses
- Upvote/downvote system for helpful answers
- **Filter doubts by**:
  - Subject\n  - Status (All/Pending/Answered/Verified)
  - Date range
- **My Doubts section**: User can view all their posted doubts with status tracking
- **Edit Doubt Flow**:
  - Click Edit button on doubt card
  - Opens edit form with pre-filled doubt text and images
  - User can modify text and add/remove images
  - Save Changes button to update doubt
  - Cancel button to discard changes
- **Delete Doubt Flow**:
  - Click Delete button on doubt card
  - Confirmation dialog: Are you sure you want to delete this doubt? This action cannot be undone
  - Confirm button to permanently delete
  - Cancel button to abort deletion
\n#### Screen 4: Student Profile & Progress
- Personalized dashboard\n- Circular learning progress chart with detailed statistics
- Offline downloads folder access
- Learning streak and achievement badges
- Subject-wise progress breakdown with topic-level details
- Recent activity timeline showing completed videos and playlists

#### Screen 5: Enhanced Sign Up & Login System
- **Sign Up Flow**:
  - Step 1: User Registration Form
    * Input fields for:
      - Full name
      - Email address\n      - Password (with strength indicator)
      - Confirm password
    * Sign Up button to submit registration
  - Step 2: Email OTP Verification Page
    * Automatically navigates to OTP verification page after clicking Sign Up
    * Display message: OTP has been sent to your registered email
    * 6-digit OTP input field with auto-focus between digits
    * Verify OTP button to complete registration
    * Resend OTP button (enabled after 30 seconds with countdown timer)
    * OTP valid for 5 minutes with clear countdown display
    * Upon successful OTP verification, user is registered and automatically logged into the app
    * Error handling for incorrect OTP with retry option
- **Login Flow**:
  - Multiple login options:
    - Google Sign-In (OSS Google login method)
    - Email and password authentication
    - Phone number authentication with OTP
  - Improved two-factor authentication system:\n    - Step 1: Primary authentication (Email/Phone with password)
    - Step 2: Mandatory OTP verification sent to registered email or phone
    - OTP valid for 5 minutes with resend option after 30 seconds
    - Clear countdown timer display
    - Verification code input with auto-focus between digits
  - **Forgot Password Flow**:
    - Forgot Password link displayed below login form
    - Clicking link navigates to Password Recovery page
    - Step 1: Email Verification
      * Input field for registered email address
      * Send Reset Link button
      * Verification message: Password reset link has been sent to your email
    - Step 2: Email OTP Verification
      * 6-digit OTP input field with auto-focus between digits
      * Verify OTP button\n      * Resend OTP option (enabled after 30 seconds with countdown timer)
      * OTP valid for 10 minutes with clear countdown display
    - Step 3: Reset Password Form
      * Input fields for:\n        - New password (with strength indicator)
        - Confirm new password
      * Password requirements displayed (minimum 8 characters, uppercase, lowercase, number, special character)
      * Reset Password button to submit
      * Success message upon completion with automatic redirect to login page
    - Error handling for invalid email, expired OTP, or password mismatch
    - Back to Login link available at each step
  - Remember device option for trusted devices (valid for 30 days)
  - Session management with automatic logout after 24 hours of inactivity

#### Screen 6: Admin Panel with Role-Based Access Control
- **Admin Authentication**:
  - Username: AdminPrasad9699
  - Password: Prasad@9765
  - Two-factor authentication required for admin access
\n- **Admin Role Types**:
  - **Super Admin (Full Access)**:
    * Complete control over all admin panel features
    * Exclusive access to User Management section
    * Can create, edit, and delete content (videos, PDFs, subjects)
    * Can manage all system settings
  - **Content Admin (Limited Access)**:
    * Access to video and PDF content management only
    * Can upload, edit, and delete videos and PDFs
    * Can create and manage subjects, topics, and playlists
    * Cannot access User Management section
    * Cannot modify system settings or admin roles
\n- **User Management Section (Super Admin Only)**:
  - **Access Control**:
    * Protected by additional password verification: prasad@9765
    * When any admin attempts to access User Management section, a password prompt appears
    * Password prompt displays: Enter Super Admin password to access User Management
    * Only correct password (prasad@9765) grants access\n    * Content Admins are blocked from accessing this section even if they know the password
    * Failed password attempts are logged with admin username and timestamp
  - **User Management Features** (accessible only after password verification):
    * View registered users list with advanced filters (by registration date, activity level, role, subject enrollment)
    * Search users by name, email, or user ID
    * **User Action Menu** for each user:
      - **Delete User**: Permanently remove user account with confirmation dialog
        * Warning message: This action cannot be undone. All user data including progress, bookmarks, and activity will be permanently deleted
        * Require Super Admin password confirmation for deletion
        * Option to export user data before deletion
      - **Make Admin**: Promote user to Content Admin role
        * Confirmation dialog: Grant Content Admin privileges to this user?
        * Send notification email to user about role change
        * New Content Admin receives access to video and PDF management only
      - **Revoke Admin**: Demote Content Admin back to regular user role
        * Confirmation required\n        * Notification sent to affected user
      - **Suspend User**: Temporarily disable user account
        * Set suspension duration (1 day, 7 days, 30 days, indefinite)
        * Add suspension reason (required field)
        * User receives email notification with suspension details
        * Suspended users cannot login until suspension is lifted
      - **Activate User**: Reactivate suspended user account
      - **Reset Password**: Force password reset for user
        * Send password reset link to user email
        * User must create new password on next login
      - **View User Details**: Open detailed user profile modal showing:
        * Full registration information\n        * Learning progress across all subjects
        * Playlist completion statistics
        * Community activity (doubts posted, answers given)
        * Login history and device information
        * Downloaded content list
    * **Bulk User Actions**:
      - Select multiple users via checkboxes
      - Bulk delete with confirmation\n      - Bulk suspend with reason input
      - Bulk export user data
    * **User Analytics Dashboard**:
      - Total registered users count
      - Active users (logged in within last 30 days)
      - New registrations trend graph
      - User engagement metrics\n      - Top performing students
    * Export user data reports (CSV/Excel format with customizable fields)
    * **Admin Activity Log**:
      - Track all user management actions (deletions, role changes, suspensions)
      - Display admin name, action type, timestamp, affected user
      - Filter logs by date range and action type
\n- **Dashboard (All Admins)**:
  - Key metrics:\n    * Total users, active courses, pending doubts\n    * Content engagement analytics
    * Real-time activity feed
  - Content Admins see content-related metrics only
  - Super Admin sees all metrics including user management statistics
\n- **Subject Management (All Admins)**:
  - **'Create New Subject' button prominently displayed at top of playlists section**:\n    * Opens modal/form to create new subject categories
    * Input fields for:
      - Subject name
      - Subject icon/thumbnail upload
      - Subject color theme
      - Subject description
      - Display order priority
  - Edit existing subjects
  - Archive/delete subjects (with content migration options)
  - View subject-wise content statistics
  - Drag-and-drop reordering of subjects
\n- **Enhanced Video Content Management (All Admins)**:
  - **Topic/Playlist Management**:
    * Create new topics (Python, Java, Web Development, etc.)
    * Upload custom thumbnail for each topic (enlarged display: 320x200px in admin panel for better preview)
    * Add topic description and metadata
    * Set topic display order
    * Edit and delete topics
  - **Video Upload & Organization**:
    * Upload multiple videos to specific topic playlists
    * Assign videos to topics/playlists
    * Set video sequence order within playlist (drag-and-drop reordering)
    * Upload custom thumbnail for each video (enlarged display: 200x112px in admin panel)\n    * Add video metadata (title, description, duration, difficulty level)
    * Mark prerequisite videos within playlist
    * Bulk upload functionality for entire playlists
    * Video preview before publishing
    * **Java Playlist Creation Example**:
      - Admin creates 'Java Programming Fundamentals' playlist
      - Uploads 8 videos with following details:
        1. Introduction to Java - 25 min - Beginner level
        2. Java Syntax and Variables - 30 min - Beginner level
        3. Object-Oriented Programming Basics - 35 min - Intermediate level
        4. Classes and Objects in Java - 40 min - Intermediate level
        5. Inheritance and Polymorphism - 38 min - Intermediate level
        6. Java Collections Framework - 42 min - Advanced level
        7. Exception Handling - 28 min - Intermediate level
        8. File I/O Operations - 27 min - Advanced level
      - Each video assigned custom thumbnail with Java branding
      - Sequential order set for progressive learning
      - Playlist marked as public with download enabled
  - **Playlist Settings**:
    * Configure auto-play next video option
    * Set playlist visibility (public/private/scheduled)
    * Enable/disable video downloads per playlist
    * Add playlist completion certificates
  - Edit and delete existing videos
  - View video analytics (views, completion rates, average watch time)
\n- **Enhanced PDF Content Management in Playlists Section (All Admins)**:
  - **'Upload PDF' button in each playlist/topic section**:
    * Upload PDF files with drag-and-drop or file browser
    * Assign PDFs to specific subjects or playlists
    * Add PDF metadata:\n      - PDF title
      - Description
      - Subject/topic association
      - Difficulty level
      - Tags for categorization
    * Upload custom thumbnail preview for PDF (120x160px)
    * Set PDF display order within playlist
    * Bulk upload functionality for multiple PDFs
  - **PDF Management Operations**:
    * View all uploaded PDFs in list/grid view with enlarged thumbnails (150x200px)
    * Edit PDF details (title, description, thumbnail, subject assignment)
    * Delete PDFs with confirmation prompt
    * Move PDFs between subjects/playlists
    * Preview PDF before publishing
    * Set PDF visibility (public/private/scheduled)
    * Enable/disable download option per PDF
    * Track PDF analytics (views, downloads, reading time)
  - Link PDFs to specific topics and video playlists
  - Content preview before publishing
\n- **General PDF Content Management (All Admins)**:\n  - Upload PDF notes with tagging and categorization
  - Link PDFs to specific topics\n  - Edit and delete existing PDFs
  - Bulk upload functionality
  - Content preview before publishing
\n- **Enhanced Community Moderation & Doubt Management (All Admins)**:
  - **Doubt Management Dashboard**:
    * View all doubts with filtering options:\n      - Status filter: All/Pending/Answered/Verified
      - Subject filter\n      - Date range filter
      - Search by keywords or student name
    * Doubt list displays:
      - Student name and profile photo
      - Doubt text with attached images
      - Timestamp of when doubt was posted
      - Current status (Pending/Answered/Verified)
      - Subject/topic tag
  - **Answer Doubt Flow**:
    * Click on any doubt card to open detailed view
    * **Answer Input Section**:
      - Rich text editor for composing answer
      - Option to attach images or code snippets
      - Preview answer before posting
    * **Post Answer button**:
      - Submits answer and automatically changes doubt status to Answered
      - Answer displays with verified badge (admin/expert badge)
      - Timestamp of answer is recorded
      - Student receives real-time notification of answer
    * **Mark as Verified option**:
      - Admin can mark high-quality answers as Verified
      - Verified answers display with blue verified shield icon
      - Verified status visible to all users in community feed
  - **Edit Doubt (Admin Side)**:
    * Admin can edit any doubt for clarity or correction
    * Click Edit button on doubt card
    * Modify doubt text or images
    * Save Changes button to update\n    * Edit history is logged with admin name and timestamp
  - **Delete Doubt (Admin Side)**:
    * Admin can delete inappropriate or duplicate doubts
    * Click Delete button on doubt card
    * Confirmation dialog: Are you sure you want to delete this doubt? This action cannot be undone
    * Confirm button to permanently delete
    * Deletion is logged in admin activity log
  - **Edit Answer**:
    * Admin can edit their own answers
    * Click Edit button on answer section
    * Modify answer text or attachments
    * Save Changes to update answer
  - **Delete Answer**:
    * Admin can delete answers if needed
    * Confirmation required before deletion
    * Doubt status reverts to Pending after answer deletion
  - **Bulk Actions**:
    * Select multiple doubts via checkboxes
    * Bulk delete with confirmation
    * Bulk mark as answered/verified
  - **Community Analytics**:
    * Total doubts posted
    * Pending doubts count
    * Average response time
    * Most active subjects
    * Top contributors (students asking quality questions)
  - Assign expert badges to quality answers
  - Remove inappropriate content\n  - Ban/suspend users if necessary (Content Admins can only suspend, not permanently ban)

- **System Settings (Super Admin Only)**:
  - Configure app notifications
  - Manage subject categories and filters
  - Update app announcements
  - Configure authentication settings
\n## 2. Design Style

### 2.1 Visual Theme
- Modern Neumorphism combined with subtle Glassmorphism effects
- Soft shadows and highlights creating depth without heavy borders
- Micro-interactions and smooth animations throughout
- Adaptive dark/light mode support
\n### 2.2 Color Scheme
- Primary: Vibrant Indigo (#5b67ca)
- Secondary: Soft Lavender (#e8eaf6)
- Background: Pure White (#ffffff) / Dark Charcoal (#1e1e2e) for dark mode
- Accent: Electric Blue (#00b4d8) for interactive elements
- Success: Fresh Green (#34c759) for progress indicators
- Alert: Warm Coral (#ff6b6b) for notifications
- Text: Deep Navy (#2d3748) / Light Gray (#e2e8f0) for dark mode
- Gradient overlays for cards and headers
- **Status Colors**:
  - Pending: Orange (#ff9500)
  - Answered: Green (#34c759)
  - Verified: Blue (#007aff)
\n### 2.3 Component Specifications
- Button style: Rounded corners with 16px border-radius, gradient backgrounds, scale animation on press (0.95x)
- Icon style: Duotone icons with 2.5px stroke weight, subtle color fills
- Input fields: Floating labels, smooth focus animations, inline validation feedback
- Cards: Elevated with soft shadows (0 4px 12px rgba(0,0,0,0.08)), 16px border-radius, hover lift effect
- Illustrations: Modern 3D isometric graphics with consistent lighting and color palette
- Progress bars: Animated gradient fills with percentage labels, circular progress indicators for playlists
- Badges: Pill-shaped with icon + text combinations, completion checkmarks for finished videos
- **Status Badges**: Rounded pill badges with icon + status text (Pending/Answered/Verified)
- **Thumbnail specifications**: Enlarged sizes for better clarity - playlist thumbnails (280x180px in library, 320x200px in admin), video thumbnails (160x90px in library, 200x112px in admin), PDF thumbnails (120x160px in library, 150x200px in admin)

### 2.4 Layout Approach
- Fluid responsive grid system (4-column mobile, 8-column tablet, 12-column desktop)
- Consistent 8px base spacing unit with 16px, 24px, 32px increments
- Clear visual hierarchy with proper heading sizes (H1: 28px bold, H2: 22px semibold, H3: 18px medium, Body: 16px regular)
- Bottom navigation bar with animated active state indicators and haptic feedback
- Floating action buttons with expandable sub-actions\n- Sticky headers with blur effect on scroll
- Infinite scroll with skeleton loaders
- Swipe gestures for navigation and actions
- Breadcrumb navigation for topic > playlist > video hierarchy

### 2.5 User Experience Enhancements
- Skeleton screens during content loading
- Empty states with helpful illustrations and action prompts
- Error handling with friendly messages and retry options
- Offline mode with cached content indicators
- Page transitions with 250ms ease-in-out animations
- Touch-friendly tap targets (minimum 48x48px)
- Haptic feedback for key interactions
- Contextual tooltips for first-time users
- Video player controls: play/pause, seek bar, playback speed, quality settings, fullscreen mode
- Auto-save video progress for seamless continuation
- 'Next video' auto-play with 5-second countdown and skip option
- **PDF reader enhancements**: smooth page transitions, pinch-to-zoom, double-tap zoom, page thumbnails sidebar, reading progress indicator, bookmark sync across devices
- Accessibility features: screen reader support, high contrast mode, adjustable font sizes, closed captions for videos
- Performance optimization: lazy loading, image compression, code splitting, adaptive video streaming
- **Real-time notifications**: Push notifications for doubt answers, new content, and important updates

### 2.6 Scalability Features
- Modular component architecture for easy feature additions
- Dynamic content rendering based on admin configurations
- Flexible grid system adapting to varying content volumes
- API-driven subject, topic, and playlist management
- Internationalization support for future multi-language expansion
- Progressive Web App (PWA) capabilities for cross-platform compatibility
- CDN integration for optimized video delivery
- Caching strategies for improved performance
- **Dynamic subject creation**: admin can add unlimited new subjects through 'Create New Subject' button without code changes
- **Scalable PDF management**: support for large PDF libraries with efficient storage and retrieval
- **Role-based access control**: flexible admin permission system supporting multiple admin roles with different access levels
- **Enhanced doubt management system**: scalable architecture supporting high volume of doubts with efficient filtering and response tracking