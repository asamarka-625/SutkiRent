// Google OAuth Service
// Использует Google Identity Services (новый API)

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string }) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: {
              credential: string;
            }) => void;
          }) => void;
          prompt: (notification?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = '699458279824-9nklb4l28jp0tgo6kf7o95h89ko4q7nv.apps.googleusercontent.com';

export interface GoogleUserData {
  provider: 'google';
  social_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

let googleAuthInitialized = false;
let currentResolve: ((value: GoogleUserData) => void) | null = null;
let currentReject: ((reason?: any) => void) | null = null;

// Инициализация Google Sign-In один раз при загрузке
const initializeGoogleAuthOnce = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (googleAuthInitialized && window.google?.accounts.id) {
      resolve();
      return;
    }

    if (window.google?.accounts.id) {
      // Инициализируем Google Sign-In один раз
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: { credential: string }) => {
            if (!currentResolve) return;
            
            try {
              // Декодируем JWT токен для получения данных пользователя
              const base64Url = response.credential.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split('')
                  .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                  .join('')
              );
              
              const payload = JSON.parse(jsonPayload);
              
              const userData: GoogleUserData = {
                provider: 'google',
                social_id: payload.sub,
                email: payload.email || '',
                first_name: payload.given_name || '',
                last_name: payload.family_name || '',
                avatar_url: payload.picture || '',
              };

              const resolveFn = currentResolve;
              currentResolve = null;
              currentReject = null;
              resolveFn(userData);
            } catch (error: any) {
              const rejectFn = currentReject;
              currentResolve = null;
              currentReject = null;
              if (rejectFn) {
                rejectFn(new Error('Ошибка при обработке данных Google: ' + (error.message || 'Неизвестная ошибка')));
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
        });
        googleAuthInitialized = true;
        resolve();
      } catch (error: any) {
        reject(new Error('Ошибка инициализации Google Sign-In: ' + (error.message || 'Неизвестная ошибка')));
      }
      return;
    }

    // Ждем загрузки Google SDK
    const checkGoogle = setInterval(() => {
      if (window.google?.accounts.id) {
        clearInterval(checkGoogle);
        clearTimeout(timeout);
        
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response: { credential: string }) => {
              if (!currentResolve) return;
              
              try {
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                
                const payload = JSON.parse(jsonPayload);
                
                const userData: GoogleUserData = {
                  provider: 'google',
                  social_id: payload.sub,
                  email: payload.email || '',
                  first_name: payload.given_name || '',
                  last_name: payload.family_name || '',
                  avatar_url: payload.picture || '',
                };

                const resolveFn = currentResolve;
                currentResolve = null;
                currentReject = null;
                resolveFn(userData);
              } catch (error: any) {
                const rejectFn = currentReject;
                currentResolve = null;
                currentReject = null;
                if (rejectFn) {
                  rejectFn(new Error('Ошибка при обработке данных Google: ' + (error.message || 'Неизвестная ошибка')));
                }
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false,
          });
          googleAuthInitialized = true;
          resolve();
        } catch (error: any) {
          reject(new Error('Ошибка инициализации Google Sign-In: ' + (error.message || 'Неизвестная ошибка')));
        }
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(checkGoogle);
      if (!window.google?.accounts.id) {
        reject(new Error('Google Sign-In SDK не загрузился. Проверьте подключение к интернету.'));
      }
    }, 10000);
  });
};

export const signInWithGoogle = (): Promise<GoogleUserData> => {
  return new Promise((resolve, reject) => {
    // Отменяем предыдущий запрос, если он есть
    if (currentReject) {
      currentReject(new Error('Новый запрос авторизации отменил предыдущий'));
    }

    currentResolve = resolve;
    currentReject = reject;

    // Инициализируем Google Sign-In и используем prompt()
    initializeGoogleAuthOnce()
      .then(() => {
        if (!window.google?.accounts.id) {
          currentResolve = null;
          currentReject = null;
          reject(new Error('Google Sign-In SDK не инициализирован'));
          return;
        }

        // Используем prompt() для показа окна выбора аккаунта
        try {
          window.google.accounts.id.prompt((notification: any) => {
            // Обработка уведомлений от Google
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              const rejectFn = currentReject;
              currentResolve = null;
              currentReject = null;
              if (rejectFn) {
                rejectFn(new Error('Не удалось показать окно выбора аккаунта Google. Проверьте настройки в Google Console: добавьте домен в "Авторизованные источники JavaScript" и убедитесь, что Client ID правильный.'));
              }
            }
          });
        } catch (error: any) {
          const rejectFn = currentReject;
          currentResolve = null;
          currentReject = null;
          if (rejectFn) {
            rejectFn(new Error('Ошибка при вызове Google Sign-In: ' + (error.message || 'Неизвестная ошибка')));
          }
        }
      })
      .catch((error) => {
        currentResolve = null;
        currentReject = null;
        reject(error);
      });
  });
};

