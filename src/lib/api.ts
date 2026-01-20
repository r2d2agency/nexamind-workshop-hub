// API configuration for backend connection
// Update this URL to point to your VPS backend

const getApiBaseUrl = (): string => {
  // In development, use local backend
  if (import.meta.env.DEV) {
    return 'http://localhost:3001/api';
  }
  
  // Production: your VPS backend URL
  return 'https://nexamind-bd.teste.gleego.com.br/api';
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

    getPayments: async (params: { page?: number; status?: string } = {}) => {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.set('page', String(params.page));
      if (params.status) queryParams.set('status', params.status);
      
      const response = await apiFetch(`/admin/payments?${queryParams}`);
      return response.json();
    },

    getEvents: async () => {
      const response = await apiFetch('/admin/events');
      return response.json();
    },

    updateEvent: async (id: string, data: Record<string, any>) => {
      const response = await apiFetch(`/admin/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return response.json();
    },
  },
};
