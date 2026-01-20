// Страница для обработки callback от VK ID (Authorization Code Flow с PKCE)

import { useEffect } from 'react';
// Обмен кода на токен и создание/поиск пользователя теперь полностью
// выполняется на бэке в /api/auth/social-auth/.

const VK_REDIRECT_URI = `${window.location.origin}/auth/vk/callback/`;

export function VKOAuthCallback() {
  useEffect(() => {
    const processCallback = async () => {
      console.log('[VK ID Callback] ========== CALLBACK PAGE LOADED ==========');
      console.log('[VK ID Callback] Full URL:', window.location.href);

      const url = new URL(window.location.href);
      const searchParams = url.searchParams;

      console.log('[VK ID Callback] Search params:', Object.fromEntries(searchParams));

      // Проверяем на ошибки
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (error || errorDescription) {
        const errorMsg = errorDescription || error || 'Ошибка авторизации через VK ID';
        console.error('[VK ID Callback] ========== ОШИБКА ==========');
        console.error('[VK ID Callback] Ошибка:', errorMsg);

        // Отправляем ошибку в основное окно
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'vk-callback-error',
            error: errorMsg,
          }, window.location.origin);
        } else {
          sessionStorage.setItem('vk_oauth_error', errorMsg);
          window.location.href = '/login?vk_oauth_error=1';
        }

        setTimeout(() => {
          if (!window.closed) {
            window.close();
          }
        }, 1000);
        return;
      }

      // Проверяем на VK ID callback (code + device_id + state)
      const code = searchParams.get('code');
      const deviceId = searchParams.get('device_id');
      const state = searchParams.get('state');

      if (code && deviceId && state) {
        console.log('[VK ID Callback] ========== VK ID CALLBACK ==========');
        console.log('[VK ID Callback] Code:', code);
        console.log('[VK ID Callback] Device ID:', deviceId);
        console.log('[VK ID Callback] State:', state);

        // Проверяем state для безопасности
        const expectedState = sessionStorage.getItem('vk_state');
        if (state !== expectedState) {
          console.error('[VK ID Callback] State mismatch!');
          console.error('[VK ID Callback] Expected:', expectedState);
          console.error('[VK ID Callback] Received:', state);

          const errorMsg = 'Ошибка безопасности: state mismatch';
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
              type: 'vk-callback-error',
              error: errorMsg,
            }, window.location.origin);
          }

          setTimeout(() => {
            if (!window.closed) {
              window.close();
            }
          }, 1000);
          return;
        }

        try {
          console.log('[VK ID Callback] Отправляем код на бэкенд для обмена на токен...');

          // Получаем code_verifier из sessionStorage
          const codeVerifier = sessionStorage.getItem('vk_code_verifier');
          if (!codeVerifier) {
            throw new Error('Code verifier не найден в sessionStorage');
          }

          // Отправляем код на бэкенд для безопасного обмена на токен
          const backendResponse = await fetch('/api/auth/social-auth/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': document.cookie.split('csrftoken=')[1]?.split(';')[0] || '',
            },
            body: JSON.stringify({
              provider: 'vk',
              code: code,
              device_id: deviceId,
              state: state,
              code_verifier: codeVerifier,
            }),
          });

          console.log('[VK ID Callback] Backend response status:', backendResponse.status);

          if (!backendResponse.ok) {
            const errorData = await backendResponse.json();
            console.error('[VK ID Callback] Backend error:', errorData);
            throw new Error(errorData.error || 'Ошибка обмена кода на токен');
          }

          const result = await backendResponse.json();
          console.log('[VK ID Callback] Backend result:', result);

          if (!result.success) {
            throw new Error(result.error || 'Ошибка авторизации через VK ID');
          }

          console.log('[VK ID Callback] ========== SUCCESS ==========');
          console.log('[VK ID Callback] Full auth result:', result);

          // Отправляем ПОЛНЫЙ результат авторизации в основное окно
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage(
              {
                type: 'vk-callback-success',
                result,
              },
              window.location.origin
            );
          } else {
            // Фолбэк: сохраняем результат в sessionStorage и редиректим на /login
            sessionStorage.setItem('vk_oauth_result', JSON.stringify(result));
            window.location.href = '/login?vk_oauth_success=1';
          }

        } catch (error: any) {
          console.error('[VK ID Callback] ========== ERROR ==========');
          console.error('[VK ID Callback] Error:', error);

          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({
              type: 'vk-callback-error',
              error: error?.message || 'Ошибка VK ID авторизации',
            }, window.location.origin);
          }
        }

        setTimeout(() => {
          if (!window.closed) {
            window.close();
          }
        }, 1000);
        return;
      }

      // Если ничего не найдено
      console.log('[VK ID Callback] Не найдены параметры авторизации');
      setTimeout(() => {
        if (!window.closed) {
          window.close();
        }
      }, 2000);
    };

    // Небольшая задержка для гарантии, что все загружено
    const timer = setTimeout(processCallback, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3>Обработка авторизации VK ID...</h3>
      <p>Пожалуйста, подождите. Это окно закроется автоматически.</p>
      <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        Если окно не закрывается, закройте его вручную.
      </p>
    </div>
  );
}