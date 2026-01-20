// Yandex OAuth Service
// Использует OAuth 2.0 flow через popup окно

const YANDEX_CLIENT_ID = '8d71629b63ee406889624879c90062c2';
const YANDEX_REDIRECT_URI = `${window.location.origin}/auth/yandex/callback/`;

export interface YandexUserData {
  provider: 'yandex';
  social_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

/**
 * Получает данные пользователя из Яндекс API по access token
 */
async function fetchYandexUserInfo(accessToken: string): Promise<YandexUserData> {
  const response = await fetch('https://login.yandex.ru/info?format=json', {
    headers: {
      'Authorization': `OAuth ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Не удалось получить данные пользователя из Яндекс');
  }

  const data = await response.json();

  // Парсим имя и фамилию из полного имени
  const realName = data.real_name || data.display_name || '';
  const nameParts = realName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    provider: 'yandex',
    social_id: data.id || data.client_id || '',
    email: data.default_email || data.emails?.[0] || '',
    first_name: firstName,
    last_name: lastName,
    avatar_url: data.default_avatar_id 
      ? `https://avatars.yandex.net/get-yapic/${data.default_avatar_id}/islands-200`
      : '',
  };
}

/**
 * Открывает popup окно для авторизации через Яндекс
 */
function openYandexAuthPopup(): Promise<string> {
  return new Promise((resolve, reject) => {
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      `https://oauth.yandex.ru/authorize?response_type=token&client_id=${YANDEX_CLIENT_ID}&redirect_uri=${encodeURIComponent(YANDEX_REDIRECT_URI)}`,
      'Yandex OAuth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      reject(new Error('Не удалось открыть окно авторизации. Разрешите всплывающие окна в настройках браузера.'));
      return;
    }

    // Слушаем сообщения от popup окна
    let messageReceived = false;
    const messageHandler = (event: MessageEvent) => {
      // Проверяем origin для безопасности
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'yandex-oauth-success' && event.data.access_token) {
        messageReceived = true;
        window.removeEventListener('message', messageHandler);
        clearInterval(checkClosed);
        if (!popup.closed) {
          popup.close();
        }
        resolve(event.data.access_token);
      } else if (event.data.type === 'yandex-oauth-error') {
        messageReceived = true;
        window.removeEventListener('message', messageHandler);
        clearInterval(checkClosed);
        if (!popup.closed) {
          popup.close();
        }
        reject(new Error(event.data.error || 'Ошибка авторизации через Яндекс'));
      }
    };

    window.addEventListener('message', messageHandler);

    // Проверяем, не закрыл ли пользователь popup вручную
    // Но даем больше времени на обработку callback (2 секунды)
    const checkClosed = setInterval(() => {
      if (popup.closed && !messageReceived) {
        // Даем время на получение сообщения после закрытия popup
        setTimeout(() => {
          if (!messageReceived) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            reject(new Error('Авторизация отменена'));
          }
        }, 2000);
      }
    }, 500);

    // Таймаут на случай, если popup не закрылся
    setTimeout(() => {
      if (!popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        popup.close();
        reject(new Error('Превышено время ожидания авторизации'));
      }
    }, 300000); // 5 минут
  });
}

/**
 * Авторизация через Яндекс
 */
export const signInWithYandex = async (): Promise<YandexUserData> => {
  try {
    // Открываем popup и получаем access token
    const accessToken = await openYandexAuthPopup();
    
    // Получаем данные пользователя
    const userData = await fetchYandexUserInfo(accessToken);
    
    return userData;
  } catch (error: any) {
    throw new Error(error.message || 'Ошибка при авторизации через Яндекс');
  }
};

