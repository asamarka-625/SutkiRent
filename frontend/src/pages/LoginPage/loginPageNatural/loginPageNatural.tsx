import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, Button, Paper, Title, Container, Group, Alert, Text, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import LogoSVG from "../../../icons/logo2.svg?react";
import { Cookies } from 'react-cookie-consent';
import styles from './loginPageNatural.module.css';
import AuthService from '../../../services/authService';

export function LoginPageNatural() {
  const navigate = useNavigate();
  const authService = AuthService;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCookie, setHasCookie] = useState<boolean>(false);

  useEffect(() => {
    const cookieConsent = Cookies.get('cookie_consent');
    setHasCookie(true);
  }, []);

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => !value ? 'Введите логин' : null,
      password: (value) => !value ? 'Введите пароль' : null,
    },
  });

  const handleLogin = async () => {
  setLoading(true);
  setError(null);

  const validation = form.validate();
  if (validation.hasErrors) {
    setLoading(false);
    return;
  }

  try {
    const result = await authService.logInNatural(form.values.username, form.values.password);

    if (result.ok) {
      localStorage.setItem('token', result.json());
      // localStorage.setItem('user', JSON.stringify(result.user));
      Cookies.set('cookie_consent', 'true', { expires: 365 });
      // window.dispatchEvent(new Event('storage'));
      navigate('/lk');
    } else {
      setError(result.error || 'Неверный логин или пароль');
    }
  } catch (error: any) {
    setError(error.message || 'Ошибка соединения с сервером');
  }

  setLoading(false);
};

  const navigateBack = () => {
    navigate('/');
  };

  const navigateToRegister = () => {
    navigate('/register');
  };

  const navigateToForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className={styles.background}>
      <Container size={420} className={styles.container}>
        <div className={styles.logoContainer}>
          <LogoSVG className={styles.logo} />
        </div>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md" className={styles.paper}>
          <Title order={2} ta="center" mb="md">
            Вход в аккаунт
          </Title>

          {error && (
            <Alert color="red" mb="md">
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleLogin)}>
            <TextInput
              label="Логин"
              placeholder="Введите ваш логин"
              required
              {...form.getInputProps('username')}
              mb="md"
            />
            
            <TextInput
              label="Пароль"
              type="password"
              placeholder="Введите ваш пароль"
              required
              {...form.getInputProps('password')}
              mb="xs"
            />
            
            <Text
              size="sm"
              color="blue"
              ta="right"
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={navigateToForgotPassword}
              mb="md"
            >
              Забыли пароль?
            </Text>

            <Group justify="space-between" mt="xl">
              <Button 
                variant="outline"
                color="gray"
                onClick={navigateBack}
              >
                ← Назад
              </Button>
              <Button 
                type="submit"
                loading={loading}
                disabled={!form.values.username || !form.values.password}
              >
                Войти
              </Button>
            </Group>
          </form>

          <Divider label="или" labelPosition="center" my="md" />

          <Text size="sm" color="dimmed" ta="center" mb="sm">
            Нет аккаунта?
          </Text>
          
          <Button 
            fullWidth 
            variant="outline"
            onClick={navigateToRegister}
          >
            Зарегистрироваться
          </Button>
        </Paper>
      </Container>
    </div>
  );
}