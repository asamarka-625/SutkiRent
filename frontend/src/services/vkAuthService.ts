

const VK_APP_ID = '54338298';
const VK_REDIRECT_URI = `${window.location.origin}/auth/vk/callback/`;
const VK_AUTH_URL = 'https://id.vk.ru/authorize'; 
const VK_TOKEN_URL = 'https://id.vk.com/oauth2/auth';
const VK_API_URL = 'https://id.vk.com/oauth2/user_info';


export interface VKBackendAuthResult {
  success: boolean;
  token?: string;
  user?: any;
  needs_additional_data?: boolean;
  user_data?: {
    first_name?: string;
    last_name?: string;
  };
  error?: string;
}

// Функции для PKCE
function generateRandomString(length: number): string {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

function generateCodeChallenge(codeVerifier: string): Promise<string> {
  return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
    .then(hash => {
      const base64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    });
}


export async function fetchVKUserInfo(accessToken: string) {
  console.log('[VK ID Auth] ========== fetchVKUserInfo START ==========');
  console.log('[VK ID Auth] Access token length:', accessToken?.length);

  if (!accessToken || accessToken.trim() === '') {
    console.error('[VK ID Auth] ОШИБКА: Access token пустой!');
    throw new Error('Access token пустой или не определен');
  }

  try {
    // Получаем данные пользователя через VK ID API
    const response = await fetch('https://id.vk.com/oauth2/user_info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log('[VK ID Auth] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[VK ID Auth] ОШИБКА получения данных пользователя (status:', response.status, '):', errorText);

      if (response.status === 401) {
        throw new Error('Неверный или истекший токен доступа');
      }
      throw new Error(`Не удалось получить данные пользователя из VK ID (${response.status})`);
    }

    const data = await response.json();
    console.log('[VK ID Auth] Ответ от VK ID API:', JSON.stringify(data, null, 2));

    if (data.error) {
      console.error('[VK ID Auth] ОШИБКА VK ID API:', JSON.stringify(data.error, null, 2));
      throw new Error(data.error.error_description || data.error.error_msg || 'Ошибка VK ID API');
    }

    const user = data.user;
    if (!user) {
      console.error('[VK ID Auth] ОШИБКА: Данные пользователя не найдены в ответе:', data);
      throw new Error('Данные пользователя не найдены');
    }

    console.log('[VK ID Auth] Данные пользователя получены:', {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      avatar: user.avatar,
    });

    const userData = {
      provider: 'vk' as const,
      social_id: String(user.user_id || ''),
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      avatar_url: user.avatar || '',
    };

    console.log('[VK ID Auth] Подготовленные данные для отправки (debug):', userData);
    console.log('[VK ID Auth] ========== fetchVKUserInfo SUCCESS ==========');

    return userData;
  } catch (error) {
    console.error('[VK ID Auth] ========== fetchVKUserInfo ERROR ==========');
    console.error('[VK ID Auth] Error:', error);
    throw error;
  }
}


export const signInWithVK = async (): Promise<VKBackendAuthResult> => {
  console.log('[VK ID Auth] ========== signInWithVK START ==========');

  return new Promise(async (resolve, reject) => {
    try {

      const codeVerifier = generateRandomString(64);
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = generateRandomString(32);


      sessionStorage.setItem('vk_code_verifier', codeVerifier);
      sessionStorage.setItem('vk_state', state);

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: VK_APP_ID,
        scope: 'vkid.personal_info email',
        redirect_uri: VK_REDIRECT_URI,
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      });

      const authUrl = `${VK_AUTH_URL}?${params.toString()}`;

      console.log('[VK ID Auth] Открываем popup с URL:', authUrl);

     
      const popup = window.open(
        authUrl,
        'vk-id-popup',
        'width=600,height=600,scrollbars=yes,resizable=yes,status=yes'
      );

      if (!popup) {
        reject(new Error('Не удалось открыть popup окно. Проверьте настройки блокировки всплывающих окон.'));
        return;
      }

 
      const messageHandler = (event: MessageEvent) => {
        console.log('[VK ID Auth] Получено сообщение:', {
          origin: event.origin,
          type: event.data?.type,
        });

 
        if (event.origin !== window.location.origin) {
          return;
        }

        if (event.data?.type === 'vk-callback-success') {
          console.log('[VK ID Auth] ========== SUCCESS ==========');
          console.log('[VK ID Auth] Auth result received:', event.data);

    
          window.removeEventListener('message', messageHandler);
          clearInterval(checkClosed);
          sessionStorage.removeItem('vk_code_verifier');
          sessionStorage.removeItem('vk_state');

  
          if (popup && !popup.closed) {
            popup.close();
          }

          resolve(event.data.result || event.data);
        } else if (event.data?.type === 'vk-callback-error') {
          console.error('[VK ID Auth] ========== ERROR ==========');
          console.error('[VK ID Auth] Error received:', event.data.error);


          window.removeEventListener('message', messageHandler);
          clearInterval(checkClosed);
          sessionStorage.removeItem('vk_code_verifier');
          sessionStorage.removeItem('vk_state');

 
          if (popup && !popup.closed) {
            popup.close();
          }

          reject(new Error(event.data.error || 'Ошибка авторизации через VK ID'));
        }
      };


      window.addEventListener('message', messageHandler);

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          console.log('[VK ID Auth] Popup закрыт пользователем');
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          sessionStorage.removeItem('vk_code_verifier');
          sessionStorage.removeItem('vk_state');
          reject(new Error('Окно авторизации было закрыто пользователем'));
        }
      }, 1000);

    } catch (error: any) {
      console.error('[VK ID Auth] ========== INIT ERROR ==========');
      console.error('[VK ID Auth] Error:', error);
      reject(new Error(error.message || 'Ошибка инициализации авторизации VK ID'));
    }
  });
};