import Home from './pages/Home';
import Library from './pages/Library';
import Articles from './pages/Articles';
import PlaylistDetail from './pages/PlaylistDetail';
import VideoPlayer from './pages/VideoPlayer';
import PDFReader from './pages/PDFReader';
import Community from './pages/Community';
import Profile from './pages/Profile';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Credits from './pages/Credits';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPlaylists from './pages/admin/AdminPlaylists';
import AdminPlaylistVideos from './pages/admin/AdminPlaylistVideos';
import AdminVideos from './pages/admin/AdminVideos';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDoubts from './pages/admin/AdminDoubts';
import AdminCredits from './pages/admin/AdminCredits';
import AdminArticles from './pages/admin/AdminArticles';
import SearchResults from './pages/SearchResults';
import AdminSettings from './pages/admin/AdminSettings';
import ProjectOverview from './pages/ProjectOverview';
import Legal from './pages/Legal';
import ArticleDetail from './pages/ArticleDetail';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

/**
 * Central Route Configuration
 * 
 * Defines all available routes in the application.
 * `visible` flag is used to determine if the route should appear in auto-generated navigation menus (if any).
 */
const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <Home />
  },
  {
    name: 'Library',
    path: '/library',
    element: <Library />
  },
  {
    name: 'Articles',
    path: '/articles',
    element: <Articles />
  },
  {
    name: 'Article Detail',
    path: '/articles/:id',
    element: <ArticleDetail />,
    visible: false
  },
  {
    name: 'Playlist Detail',
    path: '/playlist/:id',
    element: <PlaylistDetail />,
    visible: false
  },
  {
    name: 'Video Player',
    path: '/video/:id',
    element: <VideoPlayer />,
    visible: false
  },
  {
    name: 'PDF Reader',
    path: '/pdf/:id',
    element: <PDFReader />,
    visible: false
  },
  {
    name: 'Community',
    path: '/community',
    element: <Community />
  },
  {
    name: 'Profile',
    path: '/profile',
    element: <Profile />
  },
  {
    name: 'Login',
    path: '/login',
    element: <Login />,
    visible: false
  },
  {
    name: 'Reset Password',
    path: '/reset-password',
    element: <ResetPassword />,
    visible: false
  },
  {
    name: 'Credits & Partners',
    path: '/credits',
    element: <Credits />,
    visible: true
  },
  {
    name: 'Admin Dashboard',
    path: '/admin',
    element: <AdminDashboard />,
    visible: false
  },
  {
    name: 'Admin Playlists',
    path: '/admin/playlists',
    element: <AdminPlaylists />,
    visible: false
  },
  {
    name: 'Admin Playlist Videos',
    path: '/admin/playlists/:id/videos',
    element: <AdminPlaylistVideos />,
    visible: false
  },
  {
    name: 'Admin Videos',
    path: '/admin/videos',
    element: <AdminVideos />,
    visible: false
  },
  {
    name: 'Admin Users',
    path: '/admin/users',
    element: <AdminUsers />,
    visible: false
  },
  {
    name: 'Admin Doubts',
    path: '/admin/doubts',
    element: <AdminDoubts />,
    visible: false
  },
  {
    name: 'Search Results',
    path: '/search',
    element: <SearchResults />,
    visible: false,
  },
  {
    name: 'Admin Credits',
    path: '/admin/credits',
    element: <AdminCredits />,
    visible: false
  },
  {
    name: 'Admin Articles',
    path: '/admin/articles',
    element: <AdminArticles />,
    visible: false
  },
  {
    name: 'Admin Settings',
    path: '/admin/settings',
    element: <AdminSettings />,
    visible: false
  },
  {
    name: 'About Project',
    path: '/about',
    element: <ProjectOverview />,
    visible: false
  },
  {
    name: 'Legal & Policies',
    path: '/legal',
    element: <Legal />,
    visible: false
  }
];

export default routes;
