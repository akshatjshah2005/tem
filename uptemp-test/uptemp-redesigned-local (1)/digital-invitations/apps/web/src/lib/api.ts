import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; mobile: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: { name?: string; mobile?: string }) =>
    api.put('/auth/me', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
};

// Invitation API
export const invitationAPI = {
  getAll: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    api.get('/invitations', { params }),
  getOne: (id: string) => api.get(`/invitations/${id}`),
  create: (data: { name: string; templateId?: string; description?: string }) =>
    api.post('/invitations', data),
  update: (id: string, data: any) => api.put(`/invitations/${id}`, data),
  delete: (id: string) => api.delete(`/invitations/${id}`),
  duplicate: (id: string) => api.post(`/invitations/${id}/duplicate`),
  publish: (id: string) => api.put(`/invitations/${id}/publish`),
  unpublish: (id: string) => api.put(`/invitations/${id}/unpublish`),
};

// Guest API
export const guestAPI = {
  getAll: (invitationId: string, params?: any) =>
    api.get(`/guests/invitation/${invitationId}`, { params }),
  getOne: (guestId: string) => api.get(`/guests/${guestId}`),
  create: (invitationId: string, data: any) =>
    api.post(`/guests/invitation/${invitationId}`, data),
  update: (guestId: string, data: any) => api.put(`/guests/${guestId}`, data),
  delete: (guestId: string) => api.delete(`/guests/${guestId}`),
  import: (invitationId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/guests/invitation/${invitationId}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  assignEvents: (guestId: string, eventIds: string[]) =>
    api.put(`/guests/${guestId}/events`, { eventIds }),
  regenerateLink: (guestId: string) =>
    api.post(`/guests/${guestId}/regenerate-link`),
};

// Event API
export const eventAPI = {
  getAll: (invitationId: string) => api.get(`/events/invitation/${invitationId}`),
  getOne: (eventId: string) => api.get(`/events/${eventId}`),
  create: (invitationId: string, data: any) =>
    api.post(`/events/invitation/${invitationId}`, data),
  update: (eventId: string, data: any) => api.put(`/events/${eventId}`, data),
  delete: (eventId: string) => api.delete(`/events/${eventId}`),
  reorder: (invitationId: string, eventIds: string[]) =>
    api.put(`/events/invitation/${invitationId}/reorder`, { eventIds }),
};

// Template API
export const templateAPI = {
  getAll: (params?: { category?: string; page?: number; limit?: number }) =>
    api.get('/templates', { params }),
  getOne: (id: string) => api.get(`/templates/${id}`),
  getBySlug: (slug: string) => api.get(`/templates/slug/${slug}`),
  getCategories: () => api.get('/templates/categories'),
  adminGetAll: (params?: any) => api.get('/templates/admin/all', { params }),
  adminPublish: (id: string) => api.put(`/templates/admin/${id}/publish`),
  adminUnpublish: (id: string) => api.put(`/templates/admin/${id}/unpublish`),
};

// Media API
export const mediaAPI = {
  getAll: (invitationId: string) => api.get(`/media/invitation/${invitationId}`),
  upload: (invitationId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/media/invitation/${invitationId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (mediaId: string) => api.delete(`/media/${mediaId}`),
  reorder: (invitationId: string, mediaIds: string[]) =>
    api.put(`/media/invitation/${invitationId}/reorder`, { mediaIds }),
  setCover: (mediaId: string) => api.put(`/media/${mediaId}/cover`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  getUserDetails: (id: string) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id: string, isActive: boolean) =>
    api.put(`/admin/users/${id}/status`, { isActive }),
  getInvitations: (params?: any) => api.get('/admin/invitations', { params }),
  getBulkRequests: (params?: any) => api.get('/admin/bulk-requests', { params }),
  updateBulkRequestStatus: (id: string, status: string, adminNotes?: string) =>
    api.put(`/admin/bulk-requests/${id}`, { status, adminNotes }),
};

// RSVP API
export const rsvpAPI = {
  submit: (token: string, data: { response: string; guestsCount?: number; dietary?: string; message?: string; eventIds?: string[] }) =>
    api.post(`/rsvp/${token}`, data),
  getStats: (invitationId: string) => api.get(`/rsvp/invitation/${invitationId}`),
};
