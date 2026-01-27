import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, Button, Paper, Title, Container, Group, Alert, Text, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import LogoSVG from "../../../icons/logo2.svg?react";
import AuthService from '../../../services/authService';
import styles from './passwordLostPage.module.css';

const authService = AuthService;

export function PasswordLostPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [canResend, setCanResend] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Проверяем таймер для повторной отправки при загрузке
  useEffect(() => {
    const checkResendTimer = () => {
      const requestTime = sessionStorage.getItem('resetRequestTime');
      if (requestTime) {
        const timePassed = Date.now() - parseInt(requestTime);
        if (timePassed < 60000) { // 60 секунд
          const secondsLeft = Math.ceil((60000 - timePassed) / 1000);
          setResendCountdown(secondsLeft);
          setCanResend(false);
        } else {
          setCanResend(true);
        }
      }
    };

    checkResendTimer();
    
    // Автофокус на поле email
    const emailInput = document.getElementById('resetEmail');
    if (emailInput) {
      setTimeout(() => emailInput.focus(), 100);
    }

    // Восстанавливаем состояние если пользователь вернулся
    const savedEmail = sessionStorage.getItem('resetEmail');
    if (savedEmail && window.location.pathname === '/forgot-password') {
      const successFromStorage = sessionStorage.getItem('resetSuccess');
      if (successFromStorage === 'true') {
        setSuccess(true);
        setSentEmail(savedEmail);
      } else {
        form.setFieldValue('email', savedEmail);
      }
    }
  }, []);

  // Таймер для повторной отправки
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendCountdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [resendCountdown, canResend]);

  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => {
        if (!value) return 'Введите email';
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(value)) return 'Введите корректный email адрес';
        return null;
      },
    },
  });

  const handleForgotPassword = async () => {
    setLoading(true);
    setError(null);

    const validation = form.validate();
    if (validation.hasErrors) {
      setLoading(false);
      return;
    }

    const email = form.values.email.trim();
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      setError('Введите корректный email адрес');
      setLoading(false);
      return;
    }

    try {
      // Используем метод forgotPassword из AuthService
      const result = await authService.forgotPassword(email);

      if (!result.detail) {
        // Успешно
        setSentEmail(email);
        setSuccess(true);
        
        // Сохраняем данные в sessionStorage
        sessionStorage.setItem('resetEmail', email);
        sessionStorage.setItem('resetRequestTime', Date.now().toString());
        sessionStorage.setItem('resetSuccess', 'true');
      } else {
        setError(result.detail?.toString() || result.error || 'Ошибка при отправке запроса на восстановление');
      }
    } catch (error) {
      setError('Произошла ошибка при отправке запроса. Проверьте подключение к интернету.');
      console.error('Ошибка сети:', error);
    }

    setLoading(false);
  };

  const handleResendRequest = async () => {
    if (!canResend) return;

    const email = sessionStorage.getItem('resetEmail');
    const requestTime = sessionStorage.getItem('resetRequestTime');

    if (!email) {
      setError('Ошибка: email не найден. Заполните форму заново.');
      setSuccess(false);
      sessionStorage.removeItem('resetEmail');
      sessionStorage.removeItem('resetRequestTime');
      sessionStorage.removeItem('resetSuccess');
      return;
    }

    // Проверяем время между запросами
    if (requestTime) {
      const timePassed = Date.now() - parseInt(requestTime);
      if (timePassed < 60000) { // 60 секунд
        const secondsLeft = Math.ceil((60000 - timePassed) / 1000);
        setError(`Повторный запрос можно отправить через ${secondsLeft} секунд`);
        setResendCountdown(secondsLeft);
        setCanResend(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await authService.forgotPassword(email);

      if (!result.detail) {
        // Успешно
        setError(null);
        sessionStorage.setItem('resetRequestTime', Date.now().toString());
        setResendCountdown(60);
        setCanResend(false);
        
        // Показываем всплывающее сообщение об успехе
        alert('Новые инструкции отправлены на ваш email');
      } else {
        setError(result.detail?.toString() || result.error || 'Ошибка при повторной отправке');
      }
    } catch (error) {
      setError('Произошла ошибка при отправке запроса');
      console.error('Ошибка:', error);
    }

    setLoading(false);
  };

  const navigateBack = () => {
    navigate('/login');
  };

  const handleBackToForm = () => {
    setSuccess(false);
    setError(null);
    sessionStorage.removeItem('resetSuccess');
    
    // Восстанавливаем email в форму
    const savedEmail = sessionStorage.getItem('resetEmail');
    if (savedEmail) {
      form.setFieldValue('email', savedEmail);
    }
  };

  return (
    <div className={styles.background}>
      <Container size={420} className={styles.container}>
        <div className={styles.logoContainer}>
          <LogoSVG className={styles.logo} />
        </div>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md" className={styles.paper}>
          <Title order={2} ta="center" mb="md">
            {success ? 'Проверьте вашу почту' : 'Восстановление пароля'}
          </Title>

          {error && (
            <Alert color="red" mb="md">
              {error}
            </Alert>
          )}

          {!success ? (
            // Форма восстановления пароля
            <>
              <Text size="sm" color="dimmed" mb="md" ta="center">
                Введите email, указанный при регистрации, и мы отправим инструкции по восстановлению пароля
              </Text>

              <form onSubmit={form.onSubmit(handleForgotPassword)}>
                <TextInput
                  id="resetEmail"
                  label="Email"
                  placeholder="example@mail.ru"
                  required
                  {...form.getInputProps('email')}
                  mb="xl"
                />

                <Group justify="space-between" mt="xl">
                 
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={!form.values.email || !!form.errors.email}
                  >
                    Отправить инструкции
                  </Button>
                </Group>
              </form>
            </>
          ) : (
            // Сообщение об успешной отправке
            <>
              <Alert color="green" mb="md">
                Инструкции по восстановлению пароля отправлены на email:
              </Alert>
              
              <Text size="lg" weight={500} ta="center" mb="lg">
                {sentEmail}
              </Text>

              <Text size="sm" color="dimmed" mb="xl" ta="center">
                Проверьте вашу почту и следуйте инструкциям в письме.
                Если письмо не пришло, проверьте папку "Спам" или отправьте запрос повторно.
              </Text>

              <Group justify="space-between" mt="xl">
                <Button
                  variant="outline"
                  color="gray"
                  onClick={handleBackToForm}
                >
                  Изменить email
                </Button>
                
                <Button
                  onClick={handleResendRequest}
                  loading={loading}
                  disabled={!canResend}
                  variant="outline"
                >
                  {resendCountdown > 0 ? (
                    `Отправить повторно через ${resendCountdown} сек.`
                  ) : (
                    'Отправить повторно'
                  )}
                </Button>
              </Group>

              {/* {resendCountdown > 0 && (
                <Text size="sm" color="dimmed" mt="md" ta="center">
                  Повторная отправка доступна через {resendCountdown} секунд
                </Text>
              )} */}
            </>
          )}

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
        </Paper>
      </Container>
    </div>
  );
}