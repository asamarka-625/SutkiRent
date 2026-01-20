import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, Button, Paper, Title, Container, Group, Alert, Text, Divider, SegmentedControl } from '@mantine/core';
import { useForm } from '@mantine/form';
import LogoSVG from "../../icons/logo2.svg?react";
import authService from '../../services/authService';
import { Cookies } from 'react-cookie-consent';
import { signInWithGoogle } from '../../services/googleAuthService';
import { signInWithYandex } from '../../services/yandexAuthService';
import { signInWithVK } from '../../services/vkAuthService';
import styles from './loginPage.module.css';

export function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [smsSent, setSmsSent] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [role, setRole] = useState<'tenant' | 'landlord'>('tenant');

  // Таймер для повторной отправки SMS
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const form = useForm({
    initialValues: {
      phone: '',
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

  const handleSendSMS = async () => {
    setLoading(true);
    setError(null);
    
    const cleanPhone = form.values.phone.replace(/\D/g, '');
    const phone = cleanPhone.startsWith('7') ? cleanPhone : `7${cleanPhone}`;
    
    try {
      const response = await fetch('/api/auth/send-sms/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSmsSent(true);
        setCountdown(60);
      } else {
        setError(data.error || 'Ошибка при отправке SMS');
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
    }
    
    setLoading(false);
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
          role: role
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
          // Перезагружаем страницу, чтобы данные профиля загрузились
          window.location.href = '/lk';
        }
      } else {
        setError(data.error || 'Неверный код подтверждения');
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
    }
    
    setLoading(false);
  };

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
          socialData = {
            ...googleUserData,
            role: role  // Передаём выбранную роль
          };
        } catch (googleError: any) {
          setError(googleError.message || 'Ошибка при авторизации через Google');
          setLoading(false);
          return;
        }
      } else if (provider === 'yandex') {
        // Используем реальную авторизацию через Яндекс
        try {
          const yandexUserData = await signInWithYandex();
          socialData = {
            ...yandexUserData,
            role: role  // Передаём выбранную роль
          };
        } catch (yandexError: any) {
          setError(yandexError.message || 'Ошибка при авторизации через Яндекс');
          setLoading(false);
          return;
        }
      } else if (provider === 'vk') {
        // Используем реальную авторизацию через VK
        try {
          const vkUserData = await signInWithVK();
          socialData = {
            ...vkUserData,
            role: role  // Передаём выбранную роль
          };
        } catch (vkError: any) {
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
          avatar_url: '',
          role: role  // Передаём выбранную роль
        };
      }
      
      const response = await fetch('/api/auth/social-auth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(socialData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.needs_additional_data) {
          // Передаем данные пользователя через URL параметры для автозаполнения
          const params = new URLSearchParams({ token: data.token, role: role });
          if (data.user_data?.first_name) params.append('first_name', data.user_data.first_name);
          if (data.user_data?.last_name) params.append('last_name', data.user_data.last_name);
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
            Регистрация
          </Title>

          {error && (
            <Alert color="red" mb="md">
              {error}
            </Alert>
          )}

          {/* Выбор роли */}
          {!smsSent && (
            <>
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
            </>
          )}

          {/* Кнопки соцсетей убраны — они на странице входа */}

          {!smsSent ? (
            // Шаг 1: Ввод номера телефона и выбор роли
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
          ) : (
            // Шаг 2: Ввод кода из SMS
            <>
              <Text size="sm" c="dimmed" mb="md" ta="center">
                Код подтверждения отправлен на номер {form.values.phone}
              </Text>
              <Text size="sm" weight={500} mb="xs" ta="center">
                Регистрация: {role === 'tenant' ? 'Съёмщик' : 'Арендодатель'}
              </Text>
              <TextInput
                label="Код из SMS"
                placeholder="Введите 4-значный код"
                required
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                maxLength={4}
                mb="md"
              />
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
                <Text size="sm" c="dimmed" mt="md" ta="center">
                  Повторная отправка через {countdown} сек.
                </Text>
              ) : (
                <Text 
                  size="sm" 
                  c="blue" 
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

          <Text size="sm" color="dimmed" mt="md" ta="center">
            Уже есть аккаунт?{' '}
            <Text
              component="span"
              style={{ textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => navigate('/login')}
            >
              Войти
            </Text>
          </Text>
        </Paper>
      </Container>
    </div>
  );
}

