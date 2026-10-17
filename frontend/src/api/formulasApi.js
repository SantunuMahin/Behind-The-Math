import { apiRequest } from './client';

export const formulasApi = {
  getSubjects: () => apiRequest('/subjects/'),
  getFormulas: (params = {}) => {
    const query = new URLSearchParams();
    if (params.subject && params.subject !== 'all') query.append('subject', params.subject);
    if (params.level && params.level !== 'all') query.append('level', params.level);
    if (params.has_demo) query.append('has_demo', 'true');
    if (params.search) query.append('search', params.search);
    const queryString = query.toString();
    return apiRequest(`/formulas/${queryString ? '?' + queryString : ''}`);
  },
  getFormula: (slug) => apiRequest(`/formulas/${slug}/`),
};

export const lessonsApi = {
  getLesson: (slug) => apiRequest(`/lessons/${slug}/`),
};

export const practiceApi = {
  getQuestions: (params = {}) => {
    const query = new URLSearchParams();
    if (params.topic && params.topic !== 'all') query.append('topic', params.topic);
    const queryString = query.toString();
    return apiRequest(`/practice/${queryString ? '?' + queryString : ''}`);
  },
  submitAnswer: (id, answer) =>
    apiRequest(`/practice/${id}/submit/`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    }),
};

export const solverApi = {
  getSolvers: () => apiRequest('/solver/'),
  calculate: (slug, inputs) =>
    apiRequest(`/solver/${slug}/calculate/`, {
      method: 'POST',
      body: JSON.stringify({ inputs }),
    }),
};

export const studentApi = {
  getProfile: () => apiRequest('/profile/'),
  updateProfile: (data) =>
    apiRequest('/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  awardXp: (points) =>
    apiRequest('/profile/', {
      method: 'POST',
      body: JSON.stringify({ action: 'award_xp', points }),
    }),
  completeLab: (lab_slug) =>
    apiRequest('/profile/', {
      method: 'POST',
      body: JSON.stringify({ action: 'complete_lab', lab_slug }),
    }),
  completeFocusSession: (minutes, xp) =>
    apiRequest('/profile/', {
      method: 'POST',
      body: JSON.stringify({ action: 'complete_focus_session', minutes, xp }),
    }),
  uploadAvatar: async (fileOrData) => {
    if (typeof fileOrData === 'string') {
      return apiRequest('/profile/avatar/', {
        method: 'POST',
        body: JSON.stringify({ avatar: fileOrData }),
      });
    }
    const formData = new FormData();
    formData.append('avatar', fileOrData);
    const token = typeof window !== 'undefined' ? localStorage.getItem('btm_auth_token') : null;
    const response = await fetch('/api/v1/profile/avatar/', {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Token ${token}` } : {}),
      },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Upload failed: ${response.statusText}`);
    }
    return await response.json();
  },
  resetAvatar: () =>
    apiRequest('/profile/avatar/', {
      method: 'DELETE',
    }),
  getStats: () => apiRequest('/stats/'),
  getBookmarks: () => apiRequest('/bookmarks/'),
  addBookmark: (formulaId) =>
    apiRequest('/bookmarks/', {
      method: 'POST',
      body: JSON.stringify({ formula: formulaId }),
    }),
  toggleBookmark: (formulaId) =>
    apiRequest('/bookmarks/toggle/', {
      method: 'POST',
      body: JSON.stringify({ formula: formulaId }),
    }),
  removeBookmark: (bookmarkId) =>
    apiRequest(`/bookmarks/${bookmarkId}/`, {
      method: 'DELETE',
    }),
  getNotes: () => apiRequest('/notes/'),
  saveNote: (formulaId, noteText) =>
    apiRequest('/notes/', {
      method: 'POST',
      body: JSON.stringify({ formula: formulaId, note_text: noteText }),
    }),
  getFlashcards: () => apiRequest('/flashcards/'),
  reviewCard: (cardId, quality) =>
    apiRequest(`/flashcards/${cardId}/review/`, {
      method: 'POST',
      body: JSON.stringify({ quality }),
    }),
  logActivity: () =>
    apiRequest('/profile/', {
      method: 'POST',
      body: JSON.stringify({ action: 'log_activity' }),
    }),
};

export const authApi = {
  register: (userData) =>
    apiRequest('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  login: (credentials) =>
    apiRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  logout: () =>
    apiRequest('/auth/logout/', {
      method: 'POST',
    }),
  getMe: () => apiRequest('/auth/me/'),
  changePassword: (data) =>
    apiRequest('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const donationsApi = {
  submitDonation: (donationData) =>
    apiRequest('/donations/submit/', {
      method: 'POST',
      body: JSON.stringify(donationData),
    }),
  getRecentDonations: () => apiRequest('/donations/recent/'),
};
