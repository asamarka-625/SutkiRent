import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, Button, Paper, Title, Container, Group, Alert, Text, Divider, SegmentedControl, PinInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import LogoSVG from "../../icons/logo2.svg?react";
import { Cookies } from 'react-cookie-consent';
import { signInWithGoogle } from '../../services/googleAuthService';
import { signInWithYandex } from '../../services/yandexAuthService';
import { signInWithVK } from '../../services/vkAuthService';
import styles from './loginPage.module.css';

const RECAPTCHA_SITE_KEY = '6LeZ1RMsAAAAAJVLDQ60ppS1uiG2uVuHylo2mq2V';
export function LoginPage() {
  const navigate = useNavigate();

  // Разбираем URL-параметры один раз при инициализации компонента
  const urlParamsInitial = new URLSearchParams(window.location.search);
  const phoneFromUrlInitial = urlParamsInitial.get('phone') || '';
  const errorFromUrlInitial = urlParamsInitial.get('error') || null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorFromUrlInitial);
  const [hasCookie, setHasCookie] = useState<boolean>(false);
  const [smsSent, setSmsSent] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [role, setRole] = useState<'tenant' | 'landlord'>('tenant');

  // Всегда показываем форму входа, независимо от cookie
  useEffect(() => {
    const cookieConsent = Cookies.get('cookie_consent');
    setHasCookie(true); // сейчас используется только для заголовка
    
    // Обработка VK OAuth callback при прямом redirect (не popup)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('vk_oauth') === '1') {
      const token = sessionStorage.getItem('vk_oauth_token');
      const userId = sessionStorage.getItem('vk_oauth_user_id');
      if (token && userId) {
        // Очищаем sessionStorage
        sessionStorage.removeItem('vk_oauth_token');
        sessionStorage.removeItem('vk_oauth_user_id');
        // Обрабатываем VK ID авторизацию
        handleVKAuthFromCallback(token, userId);
      }
      // Убираем параметр из URL
      window.history.replaceState({}, '', '/login');
    }

    // Подключаем скрипт reCAPTCHA v3 один раз
    if (RECAPTCHA_SITE_KEY && !document.getElementById('recaptcha-v3-script')) {
      const script = document.createElement('script');
      script.id = 'recaptcha-v3-script';
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);
  
  // Обработка VK ID OAuth авторизации при прямом redirect
  const handleVKAuthFromCallback = async (accessToken: string, userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Получаем данные пользователя из VK ID API
      const response = await fetch('https://id.vk.ru/oauth2/user_info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          access_token: accessToken,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Не удалось получить данные пользователя из VK ID');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.error_description || data.error.error || 'Ошибка VK ID API');
      }
      
      const user = data.user;
      if (!user) {
        throw new Error('Данные пользователя не найдены');
      }
      
      const socialData = {
        provider: 'vk' as const,
        social_id: String(user.user_id || userId),
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        avatar_url: user.avatar || '',
      };
      
      console.log('[LoginPage] VK ID данные получены из callback:', socialData);
      
      // Отправляем данные на backend
      const requestBody = {
        ...socialData,
        role: role,
      };
      
      console.log('[LoginPage] Отправка данных в backend:', requestBody);
      
      const backendResponse = await fetch('/api/auth/social-auth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const backendData = await backendResponse.json();

      if (backendResponse.ok && backendData.success) {
        if (backendData.needs_additional_data) {
          const params = new URLSearchParams({ token: backendData.token });
          if (backendData.user_data?.first_name) params.append('first_name', backendData.user_data.first_name);
          if (backendData.user_data?.last_name) params.append('last_name', backendData.user_data.last_name);
          navigate(`/social-complete?${params.toString()}`);
        } else {
          localStorage.setItem('token', backendData.token);
          localStorage.setItem('user', JSON.stringify(backendData.user));
          Cookies.set('cookie_consent', 'true', { expires: 365 });
          window.dispatchEvent(new Event('storage'));
          window.location.href = '/lk';
        }
      } else {
        setError(backendData.error || 'Ошибка при авторизации через VK ID');
      }
    } catch (error: any) {
      console.error('[LoginPage] Ошибка обработки VK ID callback:', error);
      setError(error.message || 'Ошибка при авторизации через VK ID');
    }
    
    setLoading(false);
  };

  // Таймер для повторной отправки SMS
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const form = useForm({
    initialValues: {
      phone: phoneFromUrlInitial || '',
    },
    validate: {
      phone: (value) => {
        const phoneRegex = /^[\+]?[78][-\s]?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/;
        const cleanPhone = value.replace(/\s/g, '').replace(/[()-]/g, '');
        if (!value) return 'Введите номер телефона';
        if (!phoneRegex.test(cleanPhone)) return 'Некорректный номер телефона';
        return null;
      },
    },
  });

  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    if (numbers.length <= 1) return `+7`;
    if (numbers.length <= 4) return `+7 (${numbers.slice(1)}`;
    if (numbers.length <= 7) return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4)}`;
    if (numbers.length <= 9) return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7)}`;
    return `+7 (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7, 9)}-${numbers.slice(9, 11)}`;
  };

  const handleSendSMS = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    // Проверяем номер перед отправкой
    const validation = form.validate();
    if (validation.hasErrors) {
      setLoading(false);
      return false;
    }
    
    const cleanPhone = form.values.phone.replace(/\D/g, '');
    const phone = cleanPhone.startsWith('7') ? cleanPhone : `7${cleanPhone}`;
    
    try {
      // Получаем токен reCAPTCHA v3
      let recaptchaToken: string | null = null;
      if (RECAPTCHA_SITE_KEY) {
        const grecaptcha = (window as any).grecaptcha;
        if (!grecaptcha || !grecaptcha.execute) {
          console.error('reCAPTCHA не инициализирована');
        } else {
          try {
            recaptchaToken = await grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'send_sms' });
          } catch (e) {
            console.error('Ошибка выполнения reCAPTCHA:', e);
          }
        }
      }

      const response = await fetch('/api/auth/send-sms/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone,
          recaptcha_token: recaptchaToken,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSmsSent(true);
        setCountdown(60); // 60 секунд до возможности повторной отправки
        setLoading(false);
        return true;
      } else {
        setError(data.error || 'Ошибка при отправке SMS');
        setLoading(false);
        return false;
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
      setLoading(false);
      return false;
    }
  };

  const handleRegisterWithSMS = async () => {
    setLoading(true);
    setError(null);
    
    const cleanPhone = form.values.phone.replace(/\D/g, '');
    const phone = cleanPhone.startsWith('7') ? cleanPhone : `7${cleanPhone}`;
    
    try {
      const response = await fetch('/api/auth/register-sms/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phone, 
          code: smsCode,
          role: 'tenant'  // По умолчанию съёмщик, в будущем можно добавить выбор
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.needs_additional_data) {
          // Требуется завершение регистрации - перенаправляем на страницу завершения
          navigate(`/sms-complete?token=${data.token}`);
        } else {
          // Регистрация завершена - сохраняем токен и переходим в ЛК
          if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
          Cookies.set('cookie_consent', 'true', { expires: 365 });
          window.dispatchEvent(new Event('storage')); // Обновляем UI
          navigate('/lk');
        }
      } else {
        setError(data.error || 'Неверный код подтверждения');
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
    }
    
    setLoading(false);
  };

  // Поток входа через логин/пароль больше не используем на этой странице

  const navigateBack = () => {
    navigate('/');
  };

  const handleSocialAuth = async (provider: 'vk' | 'yandex' | 'google') => {
    setLoading(true);
    setError(null);
    
    try {
      let socialData;
      
      if (provider === 'google') {
        // Используем реальную авторизацию через Google
        try {
          const googleUserData = await signInWithGoogle();
          socialData = googleUserData;
        } catch (googleError: any) {
          setError(googleError.message || 'Ошибка при авторизации через Google');
          setLoading(false);
          return;
        }
      } else if (provider === 'yandex') {
        // Используем реальную авторизацию через Яндекс
        try {
          const yandexUserData = await signInWithYandex();
          socialData = yandexUserData;
        } catch (yandexError: any) {
          setError(yandexError.message || 'Ошибка при авторизации через Яндекс');
          setLoading(false);
          return;
        }
      } else if (provider === 'vk') {
        // Новый поток VK ID:
        // signInWithVK уже открывает popup, обменивает code на токен на бэкенде
        // и возвращает готовый результат VKBackendAuthResult.
        try {
          console.log('[LoginPage] ========== VK АВТОРИЗАЦИЯ START ==========');
          console.log('[LoginPage] Начинаем авторизацию через VK (через VK ID + бэкенд)...');

          const vkResult = await signInWithVK();

          console.log('[LoginPage] ========== VK РЕЗУЛЬТАТ ОТ БЭКЕНДА ==========');
          console.log('[LoginPage] VK backend result:', JSON.stringify(vkResult, null, 2));

          if (!vkResult || !vkResult.success) {
            const msg = vkResult?.error || 'Ошибка при авторизации через VK';
            console.error('[LoginPage] VK результат без success:', msg);
            setError(msg);
            setLoading(false);
            return;
          }

          // Если нужны дополнительные данные — сразу ведём на страницу завершения
          if (vkResult.needs_additional_data) {
            const params = new URLSearchParams();
            if (vkResult.token) {
              params.append('token', vkResult.token);
            }
            if (vkResult.user_data?.first_name) {
              params.append('first_name', vkResult.user_data.first_name);
            }
            if (vkResult.user_data?.last_name) {
              params.append('last_name', vkResult.user_data.last_name);
            }

            console.log('[LoginPage] VK: требуется завершение регистрации, редирект на /social-complete');
            navigate(`/social-complete?${params.toString()}`);
          } else {
            // Полная авторизация без дополнительных данных
            if (vkResult.token) {
              localStorage.setItem('token', vkResult.token);
            }
            if (vkResult.user) {
              localStorage.setItem('user', JSON.stringify(vkResult.user));
            }
            Cookies.set('cookie_consent', 'true', { expires: 365 });
            window.dispatchEvent(new Event('storage'));

            console.log('[LoginPage] VK: авторизация завершена, переход в ЛК');
            window.location.href = '/lk';
          }

          // Для VK мы НЕ вызываем /api/auth/social-auth/ ещё раз — всё уже сделано на бэке.
          setLoading(false);
          return;
        } catch (vkError: any) {
          console.error('[LoginPage] ========== VK ОШИБКА ==========');
          console.error('[LoginPage] Ошибка VK авторизации:', vkError);
          console.error('[LoginPage] Error message:', vkError.message);
          console.error('[LoginPage] Error name:', vkError.name);
          console.error('[LoginPage] Stack trace:', vkError.stack);
          setError(vkError.message || 'Ошибка при авторизации через VK');
          setLoading(false);
          return;
        }
      } else {
        // Для других провайдеров используем mock данные
        socialData = {
          provider: provider,
          social_id: `mock_${provider}_${Date.now()}`,
          email: `user@${provider}.com`,
          first_name: 'Имя',
          last_name: '',
          avatar_url: ''
        };
      }
      
      if (!socialData) {
        console.error('[LoginPage] ========== ОШИБКА: socialData пустой ==========');
        setError('Не удалось получить данные от провайдера');
        setLoading(false);
        return;
      }
      
      const requestBody = {
        ...socialData,
        role: role, // Передаём выбранную роль
      };
      
      console.log('[LoginPage] ========== ОТПРАВКА НА БЭКЕНД ==========');
      console.log('[LoginPage] Отправка данных в backend:', JSON.stringify(requestBody, null, 2));
      console.log('[LoginPage] Provider:', requestBody.provider);
      console.log('[LoginPage] Social ID:', requestBody.social_id);
      console.log('[LoginPage] Email:', requestBody.email);
      console.log('[LoginPage] Role:', requestBody.role);
      
      let response;
      let data;
      
      try {
        response = await fetch('/api/auth/social-auth/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('[LoginPage] ========== ОТВЕТ ОТ БЭКЕНДА ==========');
        console.log('[LoginPage] Response status:', response.status);
        console.log('[LoginPage] Response ok:', response.ok);
        console.log('[LoginPage] Response headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('[LoginPage] Response text:', responseText);
        
        try {
          data = JSON.parse(responseText);
          console.log('[LoginPage] Response data:', JSON.stringify(data, null, 2));
        } catch (parseError: any) {
          console.error('[LoginPage] ========== ОШИБКА ПАРСИНГА JSON ==========');
          console.error('[LoginPage] Ошибка парсинга ответа:', parseError);
          console.error('[LoginPage] Response text:', responseText);
          setError('Ошибка обработки ответа от сервера');
          setLoading(false);
          return;
        }
      } catch (fetchError: any) {
        console.error('[LoginPage] ========== ОШИБКА FETCH ==========');
        console.error('[LoginPage] Ошибка отправки запроса:', fetchError);
        console.error('[LoginPage] Error message:', fetchError.message);
        console.error('[LoginPage] Error stack:', fetchError.stack);
        setError(fetchError.message || 'Ошибка соединения с сервером');
        setLoading(false);
        return;
      }

      if (response.ok && data.success) {
        if (data.needs_additional_data) {
          // Передаем данные пользователя через URL параметры для автозаполнения.
          // Если backend не вернул user_data (например, для уже существующей учётки),
          // используем имя/фамилию из socialData (Яндекс/Google и т.п.).
          const firstName = data.user_data?.first_name || socialData.first_name;
          const lastName = data.user_data?.last_name || socialData.last_name;

          const params = new URLSearchParams({ token: data.token });
          if (firstName) params.append('first_name', firstName);
          if (lastName) params.append('last_name', lastName);
          navigate(`/social-complete?${params.toString()}`);
        } else {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          Cookies.set('cookie_consent', 'true', { expires: 365 });
          window.dispatchEvent(new Event('storage')); // Обновляем UI
          // Перезагружаем страницу, чтобы данные профиля загрузились
          window.location.href = '/lk';
        }
      } else {
        setError(data.error || 'Ошибка при авторизации через соцсеть');
      }
    } catch (error: any) {
      setError(error.message || 'Ошибка соединения с сервером');
    }
    
    setLoading(false);
  };

  return (
    <div className={styles.background}>
      <Container size={420} className={styles.container}>
        <div className={styles.logoContainer}>
          <LogoSVG className={styles.logo} />
        </div>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md" className={styles.paper}>
          <Title order={2} ta="center" mb="md">
            Вход / регистрация по номеру телефона
          </Title>

          {error && (
            <Alert color="red" mb="md">
              {error}
            </Alert>
          )}

          {/* Вход / регистрация через SMS: шаг 1 (телефон) и шаг 2 (код) */}
          {!smsSent && (
            // Шаг 1: Ввод номера телефона
            <>
              <TextInput
                label="Номер телефона"
                placeholder="+7 (999) 999-99-99"
                required
                value={form.values.phone}
                onChange={(event) => {
                  const formatted = formatPhone(event.currentTarget.value);
                  form.setFieldValue('phone', formatted);
                }}
                error={form.errors.phone}
                mb="md"
              />
              <Group justify="space-between" mt="xl">
                <Button 
                  variant="outline"
                  color="gray"
                  onClick={navigateBack}
                >
                  ← Назад
                </Button>
                <Button 
                  onClick={handleSendSMS}
                  loading={loading}
                  disabled={!form.values.phone || !!form.errors.phone}
                >
                  Отправить код
                </Button>
              </Group>
            </>
          )}

          {smsSent && (
            // Шаг 2: Ввод кода из SMS
            <>
              <Text size="sm" color="dimmed" mb="md" ta="center">
                Код подтверждения отправлен на номер {form.values.phone}
              </Text>
              <Group justify="center" mb="md">
                <PinInput
                  length={4}
                  type="number"
                  value={smsCode}
                  onChange={(value) => setSmsCode(value.replace(/\D/g, '').slice(0, 4))}
                  oneTimeCode
                />
              </Group>
              <Group justify="space-between" mt="xl">
                <Button 
                  variant="outline"
                  color="gray"
                  onClick={() => {
                    setSmsSent(false);
                    setSmsCode('');
                    setError(null);
                  }}
                >
                  ← Изменить номер
                </Button>
                <Button 
                  onClick={handleRegisterWithSMS}
                  loading={loading}
                  disabled={smsCode.length !== 4}
                >
                  Подтвердить
                </Button>
              </Group>
              {countdown > 0 ? (
                <Text size="sm" color="dimmed" mt="md" ta="center">
                  Повторная отправка через {countdown} сек.
                </Text>
              ) : (
                <Text 
                  size="sm" 
                  color="blue" 
                  mt="md" 
                  ta="center"
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={handleSendSMS}
                >
                  Отправить код повторно
                </Text>
              )}
            </>
          )}

          <Divider label="или" labelPosition="center" my="md" />

          {/* Выбор роли для регистрации через соцсети */}
          <Text size="sm" weight={500} mb="xs">
            Вы регистрируетесь как:
          </Text>
          <SegmentedControl
            fullWidth
            value={role}
            onChange={(value) => setRole(value as 'tenant' | 'landlord')}
            data={[
              { label: 'Съёмщик', value: 'tenant' },
              { label: 'Арендодатель', value: 'landlord' },
            ]}
            mb="md"
          />

          {/* Кнопки социальных сетей для входа/регистрации */}
          <>
            <Text size="sm" ta="center" mb="sm" weight={500}>
              Войти или зарегистрироваться через:
            </Text>
            <Group grow mb="md">
              <Button
                variant="outline"
                color="blue"
                onClick={() => handleSocialAuth('vk')}
                disabled={loading}
              >
                VK
              </Button>
              <Button
                variant="outline"
                color="red"
                onClick={() => handleSocialAuth('yandex')}
                disabled={loading}
              >
                Яндекс
              </Button>
              <Button
                variant="outline"
                color="gray"
                onClick={() => handleSocialAuth('google')}
                disabled={loading}
              >
                Google
              </Button>
            </Group>
          </>

          {/* Ссылка на отдельную страницу завершения регистрации по телефону (имя, фамилия и т.п.) */}
          <Text size="sm" color="dimmed" mt="md" ta="center">
            Уже есть код, но не завершили регистрацию?{' '}
            <Text
              component="span"
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => navigate('/register')}
            >
              Перейти к оформлению
            </Text>
          </Text>
        </Paper>
      </Container>
    </div>
  );
}
