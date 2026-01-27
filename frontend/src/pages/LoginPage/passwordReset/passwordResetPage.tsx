import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TextInput, Button, Paper, Title, Container, Group, Alert, Text, PasswordInput, Progress } from '@mantine/core';
import { useForm } from '@mantine/form';
import LogoSVG from "../../../icons/logo2.svg?react";
import AuthService from '../../../services/authService';
import styles from './passwordResetPage.module.css';

const authService = AuthService;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [loadingCheck, setLoadingCheck] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Проверяем токен при загрузке компонента
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setError('Неверная или устаревшая ссылка для сброса пароля');
        setLoadingCheck(false);
        return;
      }

      try {
        const result = await authService.checkResetToken(token);
        
        if (result.valid && result.email) {
          setTokenValid(true);
          setUserEmail(result.email);
        } else {
          setError(result.detail?.toString() || result.error || 'Неверная или устаревшая ссылка для сброса пароля');
        }
      } catch (error) {
        setError('Ошибка при проверке ссылки. Попробуйте позже.');
      } finally {
        setLoadingCheck(false);
      }
    };

    checkToken();
  }, [token]);

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    setPasswordStrength(Math.min(strength * 20, 100));
  };

  const form = useForm({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      newPassword: (value) => {
        if (!value) return 'Введите новый пароль';
        if (value.length < 6) return 'Пароль должен содержать минимум 6 символов';
        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) return 'Подтвердите пароль';
        if (value !== values.newPassword) return 'Пароли не совпадают';
        return null;
      },
    },
  });

  const handlePasswordChange = (value: string) => {
    form.setFieldValue('newPassword', value);
    checkPasswordStrength(value);
  };

  const getStrengthColor = () => {
    let strengthLevel = 'слабый';
    let color = '#f56565';

    if (passwordStrength >= 80) {
      strengthLevel = 'сильный';
      color = '#38a169';
    } else if (passwordStrength >= 60) {
      strengthLevel = 'средний';
      color = '#d69e2e';
    }

    return { color, strengthLevel };
  };

  const { color: strengthColor, strengthLevel } = getStrengthColor();

  const handleResetPassword = async () => {
    if (!token) {
      setError('Неверная или устаревшая ссылка для сброса пароля');
      return;
    }

    setLoading(true);
    setError(null);

    const validation = form.validate();
    if (validation.hasErrors) {
      setLoading(false);
      return;
    }

    if (form.values.newPassword !== form.values.confirmPassword) {
      setError('Пароли не совпадают!');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.resetPasswordConfirm(token, form.values.newPassword);

      if (result.success || !result.error) {
        setSuccess(true);
        // Автоматический редирект через 3 секунды
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.detail?.toString() || result.error || 'Ошибка при сбросе пароля');
      }
    } catch (error) {
      setError('Произошла ошибка при сбросе пароля. Попробуйте позже.');
      console.error('Ошибка сети:', error);
    }

    setLoading(false);
  };

  const navigateBack = () => {
    navigate('/login');
  };

  if (loadingCheck) {
    return (
      <div className={styles.background}>
        <Container size={420} className={styles.container}>
          <div className={styles.logoContainer}>
            <LogoSVG className={styles.logo} />
          </div>
          <Paper withBorder shadow="md" p={30} mt={30} radius="md" className={styles.paper}>
            <Title order={2} ta="center" mb="md">
              Проверка ссылки...
            </Title>
            <Text ta="center" color="dimmed">
              Пожалуйста, подождите
            </Text>
          </Paper>
        </Container>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className={styles.background}>
        <Container size={420} className={styles.container}>
          <div className={styles.logoContainer}>
            <LogoSVG className={styles.logo} />
          </div>
          <Paper withBorder shadow="md" p={30} mt={30} radius="md" className={styles.paper}>
            <Title order={2} ta="center" mb="md">
              Ошибка сброса пароля
            </Title>
            {error && (
              <Alert color="red" mb="md">
                {error}
              </Alert>
            )}
            <Text ta="center" mb="xl" color="dimmed">
              Ссылка для сброса пароля недействительна или устарела.
              Запросите новую ссылку на странице восстановления пароля.
            </Text>
            <Button
              fullWidth
              onClick={navigateBack}
              variant="outline"
            >
              Вернуться ко входу
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
            {success ? 'Пароль успешно изменен!' : 'Создание нового пароля'}
          </Title>

          {success ? (
            // Сообщение об успешном сбросе пароля
            <>
              <Alert color="green" mb="xl">
                Ваш пароль был успешно изменен!
              </Alert>
              <Text size="sm" color="dimmed" mb="xl" ta="center">
                Теперь вы можете войти в систему с новым паролем.
                Вы будете перенаправлены на страницу входа через несколько секунд...
              </Text>
              <Button
                fullWidth
                onClick={navigateBack}
              >
                Перейти к входу сейчас
              </Button>
            </>
          ) : (
            // Форма сброса пароля
            <>
              <Text size="sm" color="dimmed" mb="md" ta="center">
                Создайте новый пароль для вашего аккаунта
              </Text>
              
              {userEmail && (
                <Alert color="blue" mb="md">
                  Аккаунт: <strong>{userEmail}</strong>
                </Alert>
              )}

              {error && (
                <Alert color="red" mb="md">
                  {error}
                </Alert>
              )}

              <form onSubmit={form.onSubmit(handleResetPassword)}>
                <PasswordInput
                  label="Новый пароль"
                  placeholder="Введите новый пароль"
                  required
                  value={form.values.newPassword}
                  onChange={(e) => handlePasswordChange(e.currentTarget.value)}
                  error={form.errors.newPassword}
                  mb="xs"
                />

                {form.values.newPassword && (
                  <div style={{ marginBottom: 'md' }}>
                    <Progress value={passwordStrength} color={strengthColor} size="sm" mb={4} />
                    <Text size="xs" color="dimmed">
                      Надёжность пароля: <span style={{ color: strengthColor }}>{strengthLevel}</span>
                    </Text>
                  </div>
                )}

                <PasswordInput
                  label="Подтвердите новый пароль"
                  placeholder="Повторите новый пароль"
                  required
                  {...form.getInputProps('confirmPassword')}
                  mb="xl"
                />

                <Group justify="space-between" mt="xl">
                  <Button
                    variant="outline"
                    color="gray"
                    onClick={navigateBack}
                  >
                    ← Назад ко входу
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={!form.values.newPassword || !form.values.confirmPassword}
                  >
                    Сбросить пароль
                  </Button>
                </Group>
              </form>
            </>
          )}

          {!success && (
            <>
              <Divider label="или" labelPosition="center" my="md" />
              <Text size="sm" color="dimmed" ta="center" mb="sm">
                Вспомнили пароль?
              </Text>
              <Button
                fullWidth
                variant="outline"
                onClick={navigateBack}
              >
                Вернуться ко входу
              </Button>
            </>
          )}
        </Paper>
      </Container>
    </div>
  );
}