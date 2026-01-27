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
  private accessToken: string | null = null;
  private csrfToken: string | null = null;
  private refreshTimeout = null;

  private constructor() {
    // Загружаем данные из localStorage при инициализации
    this.token = localStorage.getItem('token');
    this.accessToken = localStorage.getItem('access_token');
    this.csrfToken = localStorage.getItem('csrf_token');
    console.log(localStorage.getItem('csrf_token'))
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


  public async logInNatural(username: string, password: string): Promise<any> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    try {
      const response = await fetch(fetchAddress + '/v1/auth/login/', {
        method: 'POST',
        body: formData,
      });


      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access_token;
        this.csrfToken = data.csrf_token;
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token);
        }
        if (data.csrf_token) {
          localStorage.setItem('csrf_token', data.csrf_token);
        }
        // Вызываем событие для обновления UI
        window.dispatchEvent(new Event('storage'));
      }
      return response;
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

  public async verifyEmail(email: string, code: string): Promise<any> {
    try {
      const response = await fetch(fetchAddress + '/v1/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      // const data = await response.json();
      return response;
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

  public async apiRequest(url, options = {}): Promise<any> {
    if (!this.accessToken) await this.checkAuthNatural();
    const headers = {
      'Authorization': 'Bearer ' + this.accessToken,
      'X-CSRF-Token': this.csrfToken,
      ...options.headers
    };

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      await this.checkAuthNatural();
      headers['Authorization'] = 'Bearer ' + this.accessToken;
      headers['X-CSRF-Token'] = this.csrfToken;
      response = await fetch(url, { ...options, headers });
    }

    return response;
  }


  public async logoutNatural(): Promise<void> {
    try {
      const response = await this.apiRequest(fetchAddress + '/v1/auth/logout', {
        method: 'POST'
      });

      console.log('DEBUG localStorage before logout:');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        console.log(`${key}: ${localStorage.getItem(key)}`);
      }

      if (response.ok) {
        const data = await response.json();
        localStorage.removeItem('access_token');
        localStorage.removeItem('csrf_token');
        localStorage.removeItem('token');
        this.token = null;
        this.accessToken = null;
        this.csrfToken = null;
        localStorage.clear();
        if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
        await new Promise(resolve => setTimeout(resolve, 100));
        // window.location.href = data.redirect || "/login";
      }
    } catch (error) {
      console.error("Ошибка выхода из сессии", error);
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


  public async checkAuthNatural(): Promise<any> {
    try {
      const response = await fetch(fetchAddress + '/v1/auth/refresh', { method: 'POST' });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access_token;
        this.csrfToken = data.csrf_token;

        if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
        this.refreshTimeout = setTimeout(this.checkAuthNatural, 14 * 60 * 1000);

      // } else if (window.location.pathname !== '/login') {
      //   window.location.href = '/login';
      }
    } catch (error) {
      console.error("Ошибка фонового обновления");
    }
  }

  public async forgotPassword(email: string): Promise<any> {
    try {
      const response = await fetch(fetchAddress + '/v1/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Forgot password API error:', error);
      return {
        detail: 'Произошла ошибка при отправке запроса. Проверьте подключение к интернету.'
      };
    }
  }

   public async checkResetToken(token: string): Promise<any> {
    try {
      const response = await fetch(fetchAddress + '/v1/auth/check-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      return response;
    } catch (error) {
      console.error('Check reset token API error:', error);
      return {
        error: 'Ошибка соединения с сервером'
      };
    }
  }

  public async resetPasswordConfirm(token: string, newPassword: string): Promise<any> {
    try {
      const response = await fetch(fetchAddress + '/v1/auth/password-reset-confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          password: newPassword 
        }),
      });

      return response;
    } catch (error) {
      console.error('Reset password API error:', error);
      return {
        error: 'Ошибка соединения с сервером'
      };
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
    // console.log(this.accessToken)
    return !!this.accessToken;
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


