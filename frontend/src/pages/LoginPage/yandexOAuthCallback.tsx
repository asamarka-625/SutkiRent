// Страница для обработки callback от Яндекс OAuth
import { useEffect } from 'react';

export function YandexOAuthCallback() {
  useEffect(() => {
    // Небольшая задержка, чтобы убедиться, что страница полностью загружена
    const processCallback = () => {
      // Получаем access_token из URL hash (Яндекс возвращает токен в hash, а не в query)
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const error = params.get('error');
      const errorDescription = params.get('error_description');

      console.log('[Yandex OAuth Callback] Hash:', hash);
      console.log('[Yandex OAuth Callback] Access token:', accessToken ? 'получен' : 'не получен');
      console.log('[Yandex OAuth Callback] Error:', error);

      if (error) {
        // Отправляем ошибку родительскому окну
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'yandex-oauth-error',
            error: errorDescription || error,
          }, window.location.origin);
          // Даем время на обработку сообщения перед закрытием
          setTimeout(() => window.close(), 100);
        } else {
          window.close();
        }
        return;
      }

      if (accessToken) {
        // Отправляем токен родительскому окну
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'yandex-oauth-success',
            access_token: accessToken,
          }, window.location.origin);
          // Даем время на обработку сообщения перед закрытием
          setTimeout(() => window.close(), 100);
        } else {
          window.close();
        }
      } else {
        // Если токена нет, отправляем ошибку
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({
            type: 'yandex-oauth-error',
            error: 'Токен не получен',
          }, window.location.origin);
          setTimeout(() => window.close(), 100);
        } else {
          window.close();
        }
      }
    };

    // Небольшая задержка для гарантии, что все загружено
    const timer = setTimeout(processCallback, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <p>Обработка авторизации...</p>
      <p>Это окно закроется автоматически.</p>
    </div>
  );
}

