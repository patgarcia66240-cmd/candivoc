// Interface API locale pour éviter les problèmes d'export
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;
  private useMock: boolean;

  constructor(baseURL: string = import.meta.env.VITE_API_URL || 'http://localhost:3001/api') {
    this.baseURL = baseURL;
    this.useMock = import.meta.env.VITE_USE_MOCK_API === 'true';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    // Si le mode mock est activé, utiliser directement les données mockées
    if (this.useMock) {
      return this.getMockResponse<T>(endpoint, options);
    }

    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Ajouter le token d'authentification si disponible
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      // Si la connexion échoue, utiliser les données mockées silencieusement
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return this.getMockResponse<T>(endpoint, options);
      }

      console.error('API Error:', error);
      throw error;
    }
  }

  private getMockResponse<T>(endpoint: string, _options: RequestInit): Promise<APIResponse<T>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (endpoint.includes('/auth/login')) {
          const mockUser = {
            id: '1',
            email: 'demo@candivoc.com',
            firstName: 'Demo',
            lastName: 'User',
            role: 'candidate' as const,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          resolve({
            success: true,
            data: {
              user: mockUser,
              token: 'mock-jwt-token-' + Date.now()
            } as T
          });
        } else if (endpoint.includes('/auth/register')) {
          const mockUser = {
            id: '2',
            email: 'newuser@candivoc.com',
            firstName: 'New',
            lastName: 'User',
            role: 'candidate' as const,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          resolve({
            success: true,
            data: {
              user: mockUser,
              token: 'mock-jwt-token-' + Date.now()
            } as T
          });
        } else if (endpoint.includes('/auth/me')) {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            resolve({
              success: true,
              data: JSON.parse(storedUser) as T
            });
          } else {
            resolve({
              success: false,
              error: 'User not found'
            });
          }
        } else {
          // Pour les autres endpoints, retourner une réponse mockée générique
          resolve({
            success: true,
            data: {} as T
          });
        }
      }, 500); // Simuler un délai réseau
    });
  }

  async get<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
