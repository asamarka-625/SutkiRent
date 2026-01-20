import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TextInput, Button, Paper, Title, Container, Group, Alert, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import LogoSVG from "../../icons/logo2.svg?react";
import { Cookies } from 'react-cookie-consent';
import styles from './loginPage.module.css';

export function SmsCompletePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = searchParams.get('token') || '';

  const form = useForm({
    initialValues: {
      first_name: '',
      last_name: '',
    },
    validate: {
      first_name: (value) => (!value ? 'Введите имя' : null),
      last_name: (value) => (!value ? 'Введите фамилию' : null),
    },
  });

  const handleSubmit = async (values: { first_name: string; last_name: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/complete-sms-registration/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          first_name: values.first_name,
          last_name: values.last_name,
        }),
      });

      const data = await response.json();

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
            <Button onClick={() => navigate('/register')} fullWidth>
              Вернуться к регистрации
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
            Для завершения регистрации заполните обязательные поля (имя и фамилия).
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

