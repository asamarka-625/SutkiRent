import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput, Button, Paper, Title, Container, Group, Alert, Text, Divider, PasswordInput, Checkbox, Progress } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import LogoSVG from "../../icons/logo2.svg?react";
import AuthService from '../../services/authService';
import { Cookies } from 'react-cookie-consent';
import styles from './loginPage.module.css';
import authService from '../../services/authService';
import { IMaskInput } from 'react-imask';

  const formatDateLocal = (d: Date) => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

export function RegisterNaturalPage() {
  const navigate = useNavigate();
  const authService = AuthService;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyStep, setVerifyStep] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);

  // Восстановление состояния из sessionStorage
  useEffect(() => {
    const restoreFormState = () => {
      const savedData = sessionStorage.getItem('registrationData');
      if (savedData) {
        const data = JSON.parse(savedData);

        const registrationTime = sessionStorage.getItem('registrationTime');
        const now = Date.now();

        if (registrationTime && (now - parseInt(registrationTime)) < 10 * 60 * 1000) {
          setVerificationEmail(data.email);
          setVerifyStep(true);

          const timePassed = Math.floor((now - parseInt(registrationTime)) / 1000);
          const timeLeft = Math.max(0, 60 - timePassed);

          if (timeLeft > 0) {
            startCountdownWith(timeLeft);
          }
        } else {
          sessionStorage.removeItem('registrationData');
          sessionStorage.removeItem('registrationTime');
        }
      }
    };

    restoreFormState();
  }, []);

  // Таймер для повторной отправки кода
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const form = useForm({
    initialValues: {
      email: '',
      name: '',
      surname: '',
      patronymic: '',
      date_of_birth: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    validate: {
      email: (value) => {
        if (!value) return 'Введите email';
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(value)) return 'Введите корректный email адрес';
        if (value.length > 255) return 'Email не должен превышать 255 символов';
        return null;
      },
      name: (value) => {
        if (!value) return 'Введите имя';
        if (value.length > 64) return 'Имя не должно превышать 64 символов';
        return null;
      },
      surname: (value) => {
        if (value && value.length > 64) return 'Фамилия не должна превышать 64 символов';
        return null;
      },
      patronymic: (value) => {
        if (value && value.length > 64) return 'Отчество не должно превышать 64 символов';
        return null;
      },
      phone: (value) => {
        const phoneRegex = /^[\+]?[78][-\s]?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/;
        const cleanPhone = value.replace(/\s/g, '').replace(/[()-]/g, '');
        if (!value) return 'Введите номер телефона';
        if (!phoneRegex.test(cleanPhone)) return 'Некорректный номер телефона';
        return null;
      },
      password: (value) => {
        if (!value) return 'Введите пароль';
        if (value.length < 6) return 'Пароль должен содержать минимум 6 символов';
        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) return 'Подтвердите пароль';
        if (value !== values.password) return 'Пароли не совпадают';
        return null;
      },
      acceptTerms: (value) => {
        if (!value) return 'Необходимо согласиться с условиями использования';
        return null;
      },
    },
  });

  const checkPasswordStrength = (password: string) => {
    let strength = 0;

    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    setPasswordStrength(Math.min(strength * 20, 100));
  };

  const handlePasswordChange = (value: string) => {
    form.setFieldValue('password', value);
    checkPasswordStrength(value);
    if (form.values.confirmPassword) {
      setPasswordMatch(value === form.values.confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    form.setFieldValue('confirmPassword', value);
    setPasswordMatch(value === form.values.password);
  };

  const startCountdown = () => {
    setCountdown(60);
  };

  const startCountdownWith = (initialTime: number) => {
    setCountdown(initialTime);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);

    const validation = form.validate();
    if (validation.hasErrors) {
      setLoading(false);
      return;
    }

    if (!form.values.acceptTerms) {
      setError('Необходимо согласиться с условиями использования');
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

    if (form.values.password !== form.values.confirmPassword) {
      setError('Пароли не совпадают!');
      setLoading(false);
      return;
    }

    try {
      const formData: any = {
        email: email,
        name: form.values.name,
        password: form.values.password,
      };

      // Добавляем опциональные поля если они заполнены
      if (form.values.surname) formData.surname = form.values.surname;
      if (form.values.patronymic) formData.patronymic = form.values.patronymic;
      if (form.values.date_of_birth) formData.date_of_birth = formatDateLocal(form.values.date_of_birth);
      if (form.values.phone) formData.phone = form.values.phone;

      // Используем метод регистрации в стиле AuthService
      const result = await authService.registerNatural(formData);

      if (result.ok) {
        // Сохраняем данные в sessionStorage для восстановления
        // sessionStorage.setItem('registrationData', JSON.stringify({ email: email }));
        // sessionStorage.setItem('registrationTime', Date.now().toString());

        setVerificationEmail(email);
        setVerifyStep(true);
        startCountdown();

        // Автофокус на поле кода подтверждения
        setTimeout(() => {
          const codeInput = document.getElementById('verificationCode');
          if (codeInput) codeInput.focus();
        }, 300);
      } else {
        setError(result.message || 'Ошибка регистрации');
      }
    } catch (error) {
      setError('Произошла ошибка при отправке данных. Попробуйте позже.');
      console.error('Ошибка:', error);
    }

    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    setError(null);

    // if (!/^\d{6}$/.test(verificationCode)) {
    //   setError('Код должен состоять из 6 цифр');
    //   setLoading(false);
    //   return;
    // }

    try {
      // Используем метод подтверждения email в стиле AuthService
      const result = await authService.verifyEmail(verificationEmail, verificationCode);

      if (result.ok) {
        // Регистрация успешно завершена
        sessionStorage.removeItem('registrationData');
        sessionStorage.removeItem('registrationTime');

        // Показываем сообщение об успехе
        setError('Регистрация успешно завершена! Теперь вы можете войти в систему.');

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.detail?.toString() || result.error || 'Неверный код подтверждения');
      }
    } catch (error) {
      setError('Произошла ошибка при проверке кода. Попробуйте позже.');
      console.error('Ошибка:', error);
    }

    setLoading(false);
  };

  const handleResendCode = async () => {
    if (!verificationEmail) return;

    try {
      // Используем метод повторной отправки кода в стиле AuthService
      const result = await authService.resendCode(verificationEmail);

      if (!result.error) {
        setError(null);
        sessionStorage.setItem('registrationTime', Date.now().toString());
        startCountdown();

        // Сброс поля ввода кода и фокус на него
        setVerificationCode('');
        const codeInput = document.getElementById('verificationCode');
        if (codeInput) codeInput.focus();
      } else {
        setError(result.error || 'Ошибка при отправке кода');
      }
    } catch (error) {
      setError('Произошла ошибка при отправке кода. Попробуйте позже.');
      console.error('Ошибка:', error);
    }
  };

  const handleVerificationCodeChange = (value: string) => {
    const code = value.replace(/\D/g, '');
    setVerificationCode(code.slice(0, 6));

  };

  const navigateBack = () => {
    if (verifyStep) {
      // Сохраняем email при возврате к форме регистрации
      if (verificationEmail) {
        form.setFieldValue('email', verificationEmail);
      }

      setVerifyStep(false);
      setVerificationCode('');
      setCountdown(0);
      setError(null);
    } else {
      navigate('/');
    }
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

  return (
    <div className={styles.background}>
      <Container size={420} className={styles.container}>
        <div className={styles.logoContainer}>
          <LogoSVG className={styles.logo} />
        </div>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md" className={styles.paper}>
          <Title order={2} ta="center" mb="md">
            {verifyStep ? 'Подтверждение email' : 'Регистрация'}
          </Title>

          {error && (
            <Alert color={error.includes('успешно') ? 'green' : 'red'} mb="md">
              {error}
            </Alert>
          )}

          {!verifyStep ? (
            // Форма регистрации
            <form onSubmit={form.onSubmit(handleRegister)}>
              <TextInput
                label="Email"
                placeholder="example@mail.ru"
                required
                {...form.getInputProps('email')}
                mb="md"
              />

              <TextInput
                label="Имя"
                placeholder="Введите ваше имя"
                required
                {...form.getInputProps('name')}
                mb="md"
              />

              <TextInput
                label="Фамилия"
                placeholder="Введите вашу фамилию"
                {...form.getInputProps('surname')}
                mb="md"
              />

              <TextInput
                label="Отчество"
                placeholder="Введите ваше отчество"
                {...form.getInputProps('patronymic')}
                mb="md"
              />

              <DateInput
                label="Дата рождения"
                {...form.getInputProps('date_of_birth')}
                mb="md"
                dateParser={(input) => {
                  const parts = input.split('.');
                  if (parts.length === 3) {
                    return new Date(+parts[2], +parts[1] - 1, +parts[0]);
                  }
                  return null;
                }}
              />

              <TextInput
                label="Номер телефона"
                placeholder="79991234567"
                component={IMaskInput}
                mask="80000000000"
                {...form.getInputProps('phone')}
                mb="md"
              />

              <PasswordInput
                label="Пароль"
                placeholder="Введите пароль"
                required
                value={form.values.password}
                onChange={(e) => handlePasswordChange(e.currentTarget.value)}
                error={form.errors.password}
                mb="xs"
              />

              {form.values.password && (
                <div style={{ marginBottom: 'md' }}>
                  <Progress value={passwordStrength} color={strengthColor} size="sm" mb={4} />
                  <Text size="xs" color="dimmed">
                    Надёжность пароля: <span style={{ color: strengthColor }}>{strengthLevel}</span>
                  </Text>
                </div>
              )}

              <PasswordInput
                label="Подтвердите пароль"
                placeholder="Повторите пароль"
                required
                value={form.values.confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.currentTarget.value)}
                error={form.errors.confirmPassword}
                mb="md"
              />

              {passwordMatch && form.values.confirmPassword && (
                <Text size="xs" color="teal" mb="md">
                  ✓ Пароли совпадают
                </Text>
              )}

              <Checkbox
                label="Я соглашаюсь с условиями использования"
                checked={form.values.acceptTerms}
                onChange={(e) => form.setFieldValue('acceptTerms', e.currentTarget.checked)}
                error={form.errors.acceptTerms}
                mb="xl"
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
                  type="submit"
                  loading={loading}
                >
                  Зарегистрироваться
                </Button>
              </Group>
            </form>
          ) : (
            // Форма подтверждения email
            <>
              <Text size="sm" color="dimmed" mb="md" ta="center">
                Код подтверждения отправлен на email
              </Text>
              <Text size="sm" weight={500} mb="lg" ta="center">
                {verificationEmail}
              </Text>

              <TextInput
                id="verificationCode"
                label="Код подтверждения"
                placeholder="Введите 6-значный код"
                required
                value={verificationCode}
                onChange={(e) => handleVerificationCodeChange(e.target.value)}
                maxLength={6}
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
                  onClick={handleVerify}
                  loading={loading}
                  disabled={verificationCode.length !== 6}
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
                  onClick={handleResendCode}
                >
                  Отправить код повторно
                </Text>
              )}
            </>
          )}

          <Divider label="или" labelPosition="center" my="md" />

          <Text size="sm" color="dimmed" ta="center" mb="sm">
            Уже есть аккаунт?
          </Text>

          <Button
            fullWidth
            variant="outline"
            onClick={() => navigate('/login')}
          >
            Войти
          </Button>
        </Paper>
      </Container>
    </div>
  );
}
