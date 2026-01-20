// API configuration for backend connection

const getApiBaseUrl = (): string => {
  // In development, use local backend
  if (import.meta.env.DEV) {
    return 'http://localhost:3001/api';
  }
  
  // Production: VPS backend
  return 'https://teste-nexamind-bd.exf0ty.easypanel.host/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Auth token management
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

// API fetch helper with auth
export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 - unauthorized
  if (response.status === 401) {
    removeAuthToken();
    window.location.href = '/admin/login';
  }

  return response;
};

// Typed API calls
export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  getMe: async () => {
    const response = await apiFetch('/auth/me');
    return response.json();
  },

  // Leads
  leads: {
    create: async (data: {
      name: string;
      email: string;
      phone?: string;
      company?: string;
      eventSlug?: string;
      source?: string;
    }) => {
      const response = await apiFetch('/leads', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    getEvent: async (slug: string) => {
      const response = await fetch(`${API_BASE_URL}/leads/event/${slug}`);
      if (!response.ok) {
        throw new Error('Event not found');
      }
      return response.json();
    },

    getPopup: async (eventSlug: string) => {
      const response = await fetch(`${API_BASE_URL}/leads/popup/${eventSlug}`);
      if (!response.ok) {
        return null;
      }
      return response.json();
    },
  },

  // Legacy - keep for backward compatibility
  createLead: async (data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    eventLocation?: string;
  }) => {
    const response = await apiFetch('/leads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Admin endpoints
  admin: {
    getDashboard: async () => {
      const response = await apiFetch('/admin/dashboard');
      return response.json();
    },

    getLeads: async (params: { page?: number; status?: string; search?: string } = {}) => {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.set('page', String(params.page));
      if (params.status) queryParams.set('status', params.status);
      if (params.search) queryParams.set('search', params.search);
      
      const response = await apiFetch(`/admin/leads?${queryParams}`);
      return response.json();
    },

    updateLead: async (id: string, data: { status?: string; notes?: string }) => {
      const response = await apiFetch(`/admin/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    deleteLead: async (id: string) => {
      const response = await apiFetch(`/admin/leads/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    },

    // Events
    getEvents: async () => {
      const response = await apiFetch('/admin/events');
      return response.json();
    },

    createEvent: async (data: Record<string, any>) => {
      const response = await apiFetch('/admin/events', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    updateEvent: async (id: string, data: Record<string, any>) => {
      const response = await apiFetch(`/admin/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    cloneEvent: async (id: string, data: { slug: string; location: string; date?: string }) => {
      const response = await apiFetch(`/admin/events/${id}/clone`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    deleteEvent: async (id: string) => {
      const response = await apiFetch(`/admin/events/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    },

    // Popups
    getPopups: async () => {
      const response = await apiFetch('/admin/popups');
      return response.json();
    },

    createPopup: async (data: Record<string, any>) => {
      const response = await apiFetch('/admin/popups', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    updatePopup: async (id: string, data: Record<string, any>) => {
      const response = await apiFetch(`/admin/popups/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    deletePopup: async (id: string) => {
      const response = await apiFetch(`/admin/popups/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    },

    // Users
    getUsers: async () => {
      const response = await apiFetch('/admin/users');
      return response.json();
    },

    createUser: async (data: { email: string; name: string; password: string; role?: string }) => {
      const response = await apiFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    updateUser: async (id: string, data: Record<string, any>) => {
      const response = await apiFetch(`/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    deleteUser: async (id: string) => {
      const response = await apiFetch(`/admin/users/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    },

    // Settings
    getSettings: async () => {
      const response = await apiFetch('/admin/settings');
      return response.json();
    },

    updateSettings: async (data: Record<string, string>) => {
      const response = await apiFetch('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    testSmtp: async (data: Record<string, any>) => {
      const response = await apiFetch('/admin/settings/test-smtp', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.json();
    },

    uploadFile: async (file: File) => {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });
      return response.json();
    },

    // Payments (placeholder)
    getPayments: async (params: { page?: number; status?: string } = {}) => {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.set('page', String(params.page));
      if (params.status) queryParams.set('status', params.status);
      
      const response = await apiFetch(`/admin/payments?${queryParams}`);
      return response.json();
    },
  },
};
