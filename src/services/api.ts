
// frontend/src/services/api.ts
/**
 * Service Layer for API Communication
 * 
 * This file contains all the functions responsible for making HTTP requests to the backend API.
 * It uses a centralized fetchAPI function to handle common logic like base URL and error handling.
 * 
 * Key features:
 * - Specific functions for each resource (Videos, Playlists, Subjects, Doubts, etc.)
 * - Type-safe responses using TypeScript generics
 * - Standardized error handling
 */
import type { Video, PDF, DoubtWithAnswers, Subject, Playlist, Credit, Article } from '@/types/types';

// AUTOMATIC URL SWITCHING:
const getBaseURL = () => {
  const isProd = import.meta.env.PROD;

  // In production on XAMPP, we are usually at /hexacore/
  // In development, Vite proxy handles /api -> http://localhost/hexacore/api
  if (isProd) {
    const pathname = window.location.pathname.toLowerCase();
    return pathname.includes('/hexacore') ? '/hexacore/api' : '/api';
  }

  return '/api';
};

const API_BASE_URL = getBaseURL();
console.table({ API_BASE_URL, PROD: import.meta.env.PROD });

/**
 * Generic fetch wrapper to handle API requests.
 * Automatically prepends the BASE_URL and checks for non-200 HTTP status codes.
 * 
 * @param endpoint - The API endpoint (e.g., '/videos.php')
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Promise<T> - The parsed JSON response
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Automatically attach auth token to all requests
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    mode: 'cors',
    headers,
  });

  // Handle 401 — token expired or invalid
  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    // Don't redirect if already on auth pages
    const currentPath = window.location.pathname.toLowerCase();
    const isInHexacore = currentPath.includes('/hexacore');
    const authPath = isInHexacore ? '/hexacore/auth' : '/auth';

    if (!currentPath.includes('/auth') && currentPath !== authPath) {
      window.location.href = authPath;
    }
    throw new Error('Session expired. Please sign in again.');
  }

  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const errorBody = await res.json();
      if (errorBody.message) {
        errorMessage = errorBody.message;
      }
    } catch (e) {
      // Failed to parse error body, stick with statusText
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

/**
 * Helper to resolve asset URLs (avatars, thumbnails, etc.)
 */
export function getAssetUrl(path?: string): string {
  if (!path) return '';

  let finalPath = path;

  // 1. Handle Google Drive Links (External)
  if (finalPath.includes('drive.google.com') || finalPath.includes('googleusercontent.com') || finalPath.includes('docs.google.com')) {
    // If it's already a direct lh3 link, return as is
    if (finalPath.includes('lh3.googleusercontent.com')) return finalPath;

    // Robust extraction: Look for ID after /d/, /file/d/, id=, or just the long segment
    const idPattern = /(?:id=|\/d\/|file\/d\/|d\/)([a-zA-Z0-9_-]{25,50})/;
    const match = finalPath.match(idPattern);

    let id = match ? match[1] : '';

    // Final fallback: just find the first long alphanumeric string if the pattern above failed
    if (!id) {
      const fallbackMatch = finalPath.match(/[a-zA-Z0-9_-]{28,50}/);
      id = fallbackMatch ? fallbackMatch[0] : '';
    }

    if (id) {
      // Clean ID of any trailing parameters
      const cleanId = id.split(/[?&=/]/)[0];
      // lh3 is much more reliable for direct <img> tags and avoids "Blocked by Response" errors
      return `https://lh3.googleusercontent.com/d/${cleanId}`;
    }
    return finalPath;
  }

  // 2. Handle Other Absolute URLs
  if (finalPath.startsWith('http')) return finalPath;

  // 3. Handle Relative Paths (Local Assets)
  const cleanPath = finalPath.startsWith('./') ? finalPath.substring(2) : finalPath.startsWith('/') ? finalPath.substring(1) : finalPath;

  // In production (XAMPP), assets are relative to the project root /hexacore/
  if (import.meta.env.PROD) {
    const isHexacore = window.location.pathname.toLowerCase().includes('/hexacore');
    const base = isHexacore ? '/hexacore' : '';
    return `${base}/${cleanPath}`;
  }

  // In development, Vite proxy /uploads handles routing to backend
  return `/uploads/${cleanPath}`;
}

// Videos
export async function getVideos(subjectId?: string): Promise<Video[]> {
  const query = subjectId ? `?subject_id=${subjectId}` : '';
  return fetchAPI<Video[]>(`/videos.php${query}`);
}

/**
 * Fetches the featured video to display on the Home page.
 * Currently fetches all videos and filters on the client side.
 * Optimization Note: Should ideally be a specific endpoint like /videos.php?featured=true
 */
export async function getFeaturedVideo(): Promise<Video | null> {
  // Basic implementation: fetch all and find featured. Optimization: backend endpoint
  const videos = await getVideos();
  return videos.find(v => v.is_featured) || null;
}

// Playlists
export async function getPlaylists(subjectId?: string): Promise<Playlist[]> {
  const query = subjectId ? `?subject_id=${subjectId}` : '';
  return fetchAPI<Playlist[]>(`/playlists.php${query}`);
}

export async function getPlaylistById(id: string): Promise<Playlist | null> {
  return fetchAPI<Playlist>(`/playlists.php?id=${id}`);
}

export async function getPlaylistVideos(playlistId: string): Promise<Video[]> {
  return fetchAPI<Video[]>(`/videos.php?playlist_id=${playlistId}`);
}

// Subjects
export async function getSubjects(): Promise<Subject[]> {
  return fetchAPI<Subject[]>('/subjects.php');
}

// Doubts
export async function getDoubts(channel?: string, userId?: string): Promise<DoubtWithAnswers[]> {
  let query = '';
  if (channel || userId) {
    const params = new URLSearchParams();
    if (channel) params.append('channel', channel);
    if (userId) params.append('user_id', userId);
    query = `?${params.toString()}`;
  }
  return fetchAPI<DoubtWithAnswers[]>(`/doubts.php${query}`);
}

export async function upvoteDoubt(doubtId: string, userId: string): Promise<{ error: Error | null }> {
  try {
    await fetchAPI('/doubts.php', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: doubtId, user_id: userId, action: 'upvote' })
    });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

/**
 * Creates a new doubt for a student.
 * 
 * @param studentId - The ID of the student posting the doubt
 * @param question - The text of the question
 * @param imageUrl - Optional URL of an attached image
 */
export async function getCommunityStats(): Promise<{ channels: Record<string, number>, contributors: any[] }> {
  return fetchAPI('/community_stats.php');
}

/**
 * Creates a new doubt for a student.
 * 
 * @param studentId - The ID of the student posting the doubt
 * @param question - The text of the question
 * @param channel - The channel name
 * @param type - The type of post (post, poll, code)
 * @param codeSnippet - Optional code snippet
 * @param imageUrl - Optional URL of an attached image
 */
export async function createDoubt(
  studentId: string,
  question: string,
  channel: string = 'general',
  type: 'post' | 'poll' | 'code' = 'post',
  codeSnippet?: string,
  imageUrl?: string,
  pollOptions?: string[]
): Promise<{ error: Error | null }> {
  try {
    await fetchAPI('/doubts.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        question,
        channel,
        type,
        code_snippet: codeSnippet,
        image_url: imageUrl,
        poll_options: pollOptions
      })
    });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}



/**
 * Registers a vote for a specific poll option.
 */
export async function voteInPoll(doubtId: string, optionId: string): Promise<{ error: Error | null }> {
  try {
    await fetchAPI('/poll_actions.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doubt_id: doubtId, option_id: optionId })
    });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

// -- Missing API stubs added to fix build errors --

export async function deleteDoubt(id: string): Promise<{ error: Error | null }> {
  try {
    await fetchAPI(`/doubts.php?id=${id}`, { method: 'DELETE' });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

export async function updateDoubt(id: string, question: string, imageUrl?: string, codeSnippet?: string): Promise<{ error: Error | null }> {
  try {
    await fetchAPI(`/doubts.php?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, image_url: imageUrl, code_snippet: codeSnippet })
    });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

export async function createAnswer(doubtId: string, expertId: string, expertName: string, answerText: string, isExpert: boolean): Promise<{ error: Error | null }> {
  try {
    await fetchAPI('/answers.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doubt_id: doubtId,
        expert_id: expertId,
        expert_name: expertName,
        answer_text: answerText,
        is_expert: isExpert
      })
    });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

export async function updateAnswer(_id: string, _text: string): Promise<{ error: Error | null }> { return { error: null }; }
export async function deleteAnswer(_id: string): Promise<{ error: Error | null }> { return { error: null }; }

// Video Management
export async function createVideo(data: any): Promise<{ error: Error | null }> {
  try {
    await fetchAPI('/videos.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

export async function updateVideo(id: string, data: any): Promise<{ error: Error | null }> {
  try {
    await fetchAPI(`/videos.php?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

export async function deleteVideo(id: string): Promise<{ error: Error | null }> {
  try {
    await fetchAPI(`/videos.php?id=${id}`, { method: 'DELETE' });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

export async function getVideoById(id: string): Promise<Video | null> {
  return fetchAPI<Video>(`/videos.php?id=${id}`);
}

// Playlist Management
export async function importYoutubePlaylist(playlistId: string, youtubeUrl: string): Promise<{ imported_count: number; message: string; errors: string[] }> {
  return fetchAPI<{ imported_count: number; message: string; errors: string[] }>('/yt_playlist_import.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playlist_id: playlistId, playlist_url: youtubeUrl })
  });
}

export async function createPlaylist(data: any): Promise<{ error: Error | null }> {
  try {
    await fetchAPI('/playlists.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

export async function updatePlaylist(id: string, data: any): Promise<{ error: Error | null }> {
  try {
    await fetchAPI(`/playlists.php?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

export async function deletePlaylist(id: string): Promise<{ error: Error | null }> {
  try {
    await fetchAPI(`/playlists.php?id=${id}`, { method: 'DELETE' });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

// Subject Management
export async function createSubject(data: any): Promise<{ error: Error | null }> {
  try {
    await fetchAPI('/subjects.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

// PDF Management
export async function getPlaylistPDFs(playlistId: string): Promise<PDF[]> {
  return fetchAPI<PDF[]>(`/pdfs.php?playlist_id=${playlistId}`);
}

export async function getPDFById(id: string): Promise<PDF | null> {
  return fetchAPI<PDF>(`/pdfs.php?id=${id}`);
}

export async function createPDF(data: any): Promise<{ error: Error | null }> {
  try {
    await fetchAPI('/pdfs.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

export async function updatePDF(id: string, data: any): Promise<{ error: Error | null }> {
  try {
    await fetchAPI(`/pdfs.php?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

export async function deletePDF(id: string): Promise<{ error: Error | null }> {
  try {
    await fetchAPI(`/pdfs.php?id=${id}`, { method: 'DELETE' });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

// Progress & User
export async function getPlaylistProgress(userId: string, playlistId: string): Promise<any[]> {
  const query = `?user_id=${userId}&playlist_id=${playlistId}`;
  return fetchAPI<any[]>(`/progress.php${query}`);
}

export async function updateVideoProgress(userId: string, videoId: string, playlistId: string, time: number, completed: boolean): Promise<{ error: Error | null }> {
  try {
    await fetchAPI('/progress.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        video_id: videoId,
        playlist_id: playlistId,
        watch_time: time,
        completed: completed
      })
    });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

export async function getUserProgress(userId: string, fetchAll: boolean = false): Promise<any[]> {
  try {
    const url = fetchAll ? `/progress.php?user_id=${userId}&all=true` : `/progress.php?user_id=${userId}`;
    return await fetchAPI<any[]>(url);
  } catch (e) {
    console.error("Failed to fetch user progress:", e);
    return [];
  }
}

export async function updateProfile(userId: string, data: any): Promise<{ error: Error | null }> {
  try {
    await fetchAPI('/auth/update_profile.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, user_id: userId })
    });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

export async function getAllUsers(): Promise<any[]> {
  try {
    return await fetchAPI<any[]>('/users.php');
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

export async function updateUserRole(userId: string, role: string): Promise<{ error: Error | null }> {
  try {
    await fetchAPI(`/users.php?id=${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

export async function deleteUser(userId: string): Promise<{ error: Error | null }> {
  try {
    await fetchAPI(`/users.php?id=${userId}`, { method: 'DELETE' });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

// Search
export async function searchContent(query: string): Promise<{ videos: Video[], playlists: Playlist[], pdfs: PDF[] }> {
  return fetchAPI<{ videos: Video[], playlists: Playlist[], pdfs: PDF[] }>(`/search.php?q=${encodeURIComponent(query)}`);
}

// Articles
export async function getArticles(): Promise<Article[]> {
  return fetchAPI<Article[]>('/articles.php');
}

export async function getArticleById(id: string): Promise<Article | null> {
  return fetchAPI<Article>(`/articles.php?id=${id}`);
}

export async function createArticle(articleData: Partial<Article>): Promise<{ error: Error | null }> {
  try {
    await fetchAPI('/articles.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData)
    });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

export async function updateArticle(id: string, articleData: Partial<Article>): Promise<{ error: Error | null }> {
  try {
    await fetchAPI(`/articles.php?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(articleData)
    });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

export async function deleteArticle(id: string): Promise<{ error: Error | null }> {
  try {
    await fetchAPI(`/articles.php?id=${id}`, {
      method: 'DELETE'
    });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

// Misc
export async function getPDFs(subjectId?: string): Promise<PDF[]> {
  const query = subjectId ? `?subject_id=${subjectId}` : '';
  return fetchAPI<PDF[]>(`/pdfs.php${query}`);
}

export async function getRecentPDFs(limit = 5): Promise<PDF[]> {
  return fetchAPI<PDF[]>(`/pdfs.php?limit=${limit}`);
}
export async function updateUserProgressImpl(_userId: string, _data: any) { return { error: null }; }
export async function getBookmarks(_userId: string) { return []; }
export async function addBookmark(_userId: string, _videoId?: string, _pdfId?: string): Promise<{ error: Error | null }> { return { error: null }; }
export async function removeBookmark(_id: string): Promise<{ error: Error | null }> { return { error: null }; }

export async function addDownload(_userId: string, _pdfId: string): Promise<{ error: Error | null }> { return { error: null }; }
export async function isBookmarked(_userId: string, _videoId?: string, _pdfId?: string) { return false; }
export async function isDownloaded(_userId: string, _pdfId: string) { return false; }


// Auth
export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ error: Error | null }> {
  try {
    await fetchAPI('/auth/change_password.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, current_password: currentPassword, new_password: newPassword })
    });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

export async function getAdminStatistics(): Promise<any> {
  try {
    return await fetchAPI('/admin/stats.php');
  } catch (error) {
    console.warn('Failed to fetch admin stats:', error);
  }
}

// Credits Management
export async function getCredits(): Promise<Credit[]> {
  return fetchAPI<Credit[]>('/credits.php');
}

export async function createCredit(data: any): Promise<{ error: Error | null }> {
  try {
    await fetchAPI('/credits.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

export async function updateCredit(id: string, data: any): Promise<{ error: Error | null }> {
  try {
    await fetchAPI(`/credits.php?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}

export async function deleteCredit(id: string): Promise<{ error: Error | null }> {
  try {
    await fetchAPI(`/credits.php?id=${id}`, { method: 'DELETE' });
    return { error: null };
  } catch (e: any) {
    return { error: e };
  }
}



