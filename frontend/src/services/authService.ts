import { fetchAddress } from "../globalSettings";

interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  first_name?: string;
  last_name?: string;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'unknown';
}

export interface ProfileResponse {
  success: boolean;
  profile?: UserProfile;
  error?: string;
}

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private user: User | null = null;

  private constructor() {
    // Загружаем данные из localStorage при инициализации
    this.token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Вызываем событие для обновления UI
        window.dispatchEvent(new Event('storage'));
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Ошибка соединения с сервером'
      };
    }
  }


  public async logInNatural(username: string, password: string): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    try {
      const response = await fetch(fetchAddress + '/v1/auth/login/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // this.token = data.token;
        // this.user = data.user;
        // localStorage.setItem('token', data.token);
        // localStorage.setItem('user', JSON.stringify(data.user));
        // Вызываем событие для обновления UI
        window.dispatchEvent(new Event('storage'));
      }
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Ошибка соединения с сервером'
      };
    }
  }

  public async registerNatural(formData: any): Promise<any> {
    try {
      const response = await fetch(fetchAddress + '/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      return response;
    } catch (error) {
      console.error('Register API error:', error);
      return {
        message: 'Ошибка соединения с сервером',
        error: 'Ошибка соединения с сервером'
      };
    }
  }

  public async verifyEmail(email: string, code: string): Promise<VerifyResponse> {
    try {
      const response = await fetch(fetchAddress + '/v1/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Verify email API error:', error);
      return {
        error: 'Ошибка соединения с сервером'
      };
    }
  }

  public async resendCode(email: string): Promise<{ message?: string; error?: string }> {
    try {
      const response = await fetch(fetchAddress + '/v1/auth/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Resend code API error:', error);
      return {
        error: 'Ошибка соединения с сервером'
      };
    }
  }

  public async register(username: string, password: string, phone: string): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, phone }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Вызываем событие для обновления UI
        window.dispatchEvent(new Event('storage'));
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Ошибка соединения с сервером'
      };
    }
  }

  public async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Вызываем событие для обновления UI
      window.dispatchEvent(new Event('storage'));
    }
  }

  public async checkAuth(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch('/api/auth/check/', {
        headers: {
          'Authorization': `Token ${this.token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.authenticated) {
        this.user = data.user as User;
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      } else {
        this.logout();
        return false;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public getUser(): User | null {
    return this.user;
  }

  public async getProfile(): Promise<ProfileResponse> {
    if (!this.token) {
      return { success: false, error: 'Не авторизован' };
    }

    try {
      const response = await fetch('/api/auth/profile/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        const profile = data as UserProfile;

        // Синхронизируем first_name/last_name из профиля в локальный user,
        // чтобы в шапке сайта отображалось имя, а не телефон/почта.
        if (this.user) {
          this.user = {
            ...this.user,
            first_name: profile.first_name || this.user.first_name,
            last_name: profile.last_name || this.user.last_name,
          };
          localStorage.setItem('user', JSON.stringify(this.user));
          // Уведомляем слушателей (LogInNavButton) об изменении
          window.dispatchEvent(new Event('storage'));
        }

        return { success: true, profile };
      }

      return { success: false, error: data.error || 'Ошибка при загрузке профиля' };
    } catch (error) {
      return { success: false, error: 'Ошибка соединения с сервером' };
    }
  }

  public async updateProfile(payload: Partial<UserProfile>): Promise<ProfileResponse> {
    if (!this.token) {
      return { success: false, error: 'Не авторизован' };
    }

    try {
      const response = await fetch('/api/auth/profile/', {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Обновляем email в локальном user, если он изменился
        if (this.user && data.email) {
          this.user = { ...this.user, email: data.email };
          localStorage.setItem('user', JSON.stringify(this.user));
        }
        return { success: true, profile: data as UserProfile };
      }

      return { success: false, error: data.error || 'Ошибка при сохранении профиля' };
    } catch (error) {
      return { success: false, error: 'Ошибка соединения с сервером' };
    }
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  public isStaff(): boolean {
    return this.user?.is_staff || false;
  }
}

export default AuthService.getInstance();

// Интерфейсы для API ответов
interface RegisterResponse {
  unique?: boolean;
  message?: string;
  error?: string;
  detail?: string | Array<any>;
  success?: boolean;
}

interface VerifyResponse {
  token?: string;
  user?: any;
  error?: string;
  detail?: string;
  success?: boolean;
}

// Функции API-запросов в стиле AuthService
class RegistrationService {

}


