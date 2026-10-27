import { useEffect } from 'react';
import { Button, MantineProvider, Stack, Text, Title } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { HelmetProvider } from 'react-helmet-async';
import { createBrowserRouter, Route, RouterProvider, Routes } from 'react-router-dom';
import React from 'react';
import { theme } from './theme';
import { Seo } from './components/seo/Seo';
import { NotFoundPage } from './pages/404Page/404Page';
import { ExPage } from './pages/ExcursionPage/exPage';
import { AboutPage } from './pages/InfoPages/aboutPage/aboutPage';
import { ArticlesPage } from './pages/InfoPages/articlesPage/articlesPage';
import { AttractionPage } from './pages/InfoPages/attractionsPage/singleAttraction/attractionPage';
import { ArticlePage } from './pages/InfoPages/articlesPage/singleArticle/articlePage';
import { ExcursionPage } from './pages/InfoPages/excursionsPage/singleExcursion/excursionPage';
import { PartnersPage } from './pages/InfoPages/partnersPage/partnersPage';
import { CountdownPage } from './pages/InfoPages/countdownPage/countdownPage';
import { PolicyPage } from './pages/InfoPages/policyPage/policyPage';
import { RecvPage } from './pages/InfoPages/recvPage/recvPage';
import { LandingPage } from './pages/LandingPage/landingPage';
import { ObjectPage } from './pages/ObjectPage/objectPage';
import { SearchPage } from './pages/SearchPage/searchPage';
import { WrapperPage } from './pages/WrapperPage';
import { FavePage } from './pages/FavoritesPage/favePage';
import { WrapperLKPage } from './pagesLK/WrapperLKPage';
import { ProfilePage } from './pagesLK/profilePage/profilePage';
import { BookingsPage } from './pagesLK/bookingsPage/bookingsPage';
import { BonusPage } from './pagesLK/bonusPage/bonusPage';
import { NotificationsPage } from './pagesLK/notifications/notificationsPage';
import { SettingsPage } from './pagesLK/settings/settingsPage';
import { PrivateRoute } from './handlers/privateRouteHandler';
import { LoginPageNatural } from './pages/LoginPage/loginPageNatural/loginPageNatural';
import { RegisterNaturalPage } from './pages/LoginPage/registerNaturalPage';
import { SocialCompletePage } from './pages/LoginPage/socialCompletePage';
import { SmsCompletePage } from './pages/LoginPage/smsCompletePage';
import { YandexOAuthCallback } from './pages/LoginPage/yandexOAuthCallback';
import { VKOAuthCallback } from './pages/LoginPage/vkOAuthCallback';
import { PasswordLostPage } from './pages/LoginPage/passwordLost/passwordLostPage';
import { ResetPasswordPage } from './pages/LoginPage/passwordReset/passwordResetPage';
import { AdminPage } from './pages/AdminPages/adminPage';
import { PropertyTablePage } from './pages/AdminPages/AdminTable/adminTablePage';

const router = createBrowserRouter([{ path: '*', Component: Root }]);

function Root() {
  return (
    <Routes>
      <Route path="/" element={<WrapperPage />}>
        <Route index element={<LandingPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="object/:id" element={<ObjectPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="login" element={<LoginPageNatural />} />
        <Route path="register" element={<RegisterNaturalPage />} />
        <Route path="social-complete" element={<SocialCompletePage />} />
        <Route path="forgot-password" element={<PasswordLostPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="sms-complete" element={<SmsCompletePage />} />
        <Route path="auth/yandex/callback" element={<YandexOAuthCallback />} />
        <Route path="auth/yandex/callback/" element={<YandexOAuthCallback />} />
        <Route path="auth/vk/callback" element={<VKOAuthCallback />} />
        <Route path="auth/vk/callback/" element={<VKOAuthCallback />} />
        <Route path="countdown" element={<CountdownPage />} />
        <Route path="policy" element={<PolicyPage />} />
        <Route path="partners" element={<PartnersPage />} />
        <Route path="credits" element={<RecvPage />} />
        <Route path="articles" element={<ArticlesPage />} />
        <Route path="excursion" element={<ExPage />} />
        <Route path="exPage.html" element={null} />
        <Route path="articles/:id" element={<ArticlePage />} />
        <Route path="attractions/:id" element={<AttractionPage />} />
        <Route path="excursions/:id" element={<ExcursionPage />} />
        <Route path="exDoc.html" element={null} />
        <Route path="favorites" element={<FavePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Личный кабинет */}
      <Route path="/lk" element={<PrivateRoute Component={WrapperLKPage} />}>
        <Route index element={<ProfilePage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="favorites" element={<FavePage />} />
        <Route path="bonus" element={<BonusPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Админ-панель */}
      <Route path="/admPanel" element={<PrivateRoute Component={WrapperPage} />}>
        <Route index element={<AdminPage />} />
        <Route path="admin" element={<BookingsPage />} />
        <Route path="table" element={<PropertyTablePage />} />
      </Route>
    </Routes>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundaryWithReload extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Stack align="center" justify="center" gap="sm" mih="60vh" p="xl">
          <Title order={2}>Что-то пошло не так</Title>
          <Text c="dimmed" ta="center">
            Произошла ошибка. Попробуйте обновить страницу.
          </Text>
          <Button onClick={this.handleReload} mt="sm">
            Обновить страницу
          </Button>
        </Stack>
      );
    }

    return this.props.children;
  }
}

export function AppWrapper() {
  // Защита от падения приложения на неожиданных ошибках сторонних данных.
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      if (event.error?.message?.includes('map is not a function')) {
        event.preventDefault();
      }
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  return (
    <HelmetProvider>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <Seo />
        <Notifications autoClose={5000} />
        <React.StrictMode>
          <ErrorBoundaryWithReload>
            <RouterProvider router={router} />
          </ErrorBoundaryWithReload>
        </React.StrictMode>
      </MantineProvider>
    </HelmetProvider>
  );
}
