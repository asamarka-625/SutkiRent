import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TextInput, Button, Paper, Title, Container, Group, Alert, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import LogoSVG from "../../icons/logo2.svg?react";
import { Cookies } from 'react-cookie-consent';
import styles from './loginPage.module.css';

export function SocialCompletePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = searchParams.get('token') || '';
  const firstNameFromUrl = searchParams.get('first_name') || '';
  const lastNameFromUrl = searchParams.get('last_name') || '';

  const form = useForm({
    initialValues: {
      first_name: firstNameFromUrl,
      last_name: lastNameFromUrl,
      phone: '',
    },
    validate: {
      first_name: (value) => (!value ? 'Введите имя' : null),
      last_name: (value) => (!value ? 'Введите фамилию' : null),
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

  const handleSubmit = async (values: { first_name: string; last_name: string; phone: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/complete-social-registration/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          first_name: values.first_name,
          last_name: values.last_name,
          phone: values.phone,
        }),
      });

      const data = await response.json();

      // Специальный случай: номер уже привязан к другой учётке
      if (
        !response.ok &&
        data?.error === 'Этот номер телефона уже привязан к другой учетной записи. Войдите по SMS или через ранее использованную соцсеть.'
      ) {
        // Перенаправляем на страницу входа и передаём номер телефона и текст ошибки
        const phoneParam = encodeURIComponent(values.phone);
        const errorParam = encodeURIComponent(data.error);
        navigate(`/login?phone=${phoneParam}&error=${errorParam}`);
        return;
      }

      if (response.ok && data.success) {
        // Сохраняем токен и пользователя
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        // Устанавливаем куки согласия
        Cookies.set('cookie_consent', 'true', { expires: 365 });
        window.dispatchEvent(new Event('storage')); // Обновляем UI
        // Перезагружаем страницу, чтобы данные профиля загрузились
        window.location.href = '/lk';
      } else {
        setError(data.error || 'Ошибка при завершении регистрации');
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
    }
    
    setLoading(false);
  };

  if (!token) {
    return (
      <div className={styles.background}>
        <Container size={420} className={styles.container}>
          <Paper withBorder shadow="md" p={30} mt={30} radius="md" className={styles.paper}>
            <Alert color="red" mb="md">
              Отсутствует токен авторизации
            </Alert>
            <Button onClick={() => navigate('/login')} fullWidth>
              Вернуться к входу
            </Button>
          </Paper>
        </Container>
      </div>
    );
  }

  return (
    <div className={styles.background}>
      <Container size={420} className={styles.container}>
        <div className={styles.logoContainer}>
          <LogoSVG className={styles.logo} />
        </div>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md" className={styles.paper}>
          <Title order={2} ta="center" mb="md">
            Завершение регистрации
          </Title>

          <Text size="sm" color="dimmed" mb="md" ta="center">
            Для завершения регистрации заполните обязательные поля
          </Text>

          {error && (
            <Alert color="red" mb="md">
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="Имя"
              placeholder="Введите имя"
              required
              {...form.getInputProps('first_name')}
              mb="md"
            />
            <TextInput
              label="Фамилия"
              placeholder="Введите фамилию"
              required
              {...form.getInputProps('last_name')}
              mb="md"
            />
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
              mb="xl"
            />
            <Button 
              type="submit" 
              loading={loading}
              fullWidth
            >
              Завершить регистрацию
            </Button>
          </form>
        </Paper>
      </Container>
    </div>
  );
}



