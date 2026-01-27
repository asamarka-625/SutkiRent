import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Button, createTheme, MantineProvider, rem, type MantineColorsTuple } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { createBrowserRouter, Route, RouterProvider, Routes } from 'react-router-dom';
import { CookieBanner } from './components/cookieBanner/cookieBanner';
import React from 'react';
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
import { PrivateRoute, ReRoute } from './handlers/privateRouteHandler';
import { LoginPage } from './pages/LoginPage/loginPage';
import { RegisterPage } from './pages/LoginPage/registerPage';
import { SocialCompletePage } from './pages/LoginPage/socialCompletePage';
import { SmsCompletePage } from './pages/LoginPage/smsCompletePage';
import { YandexOAuthCallback } from './pages/LoginPage/yandexOAuthCallback';
import { VKOAuthCallback } from './pages/LoginPage/vkOAuthCallback';
import { LoginPageNatural } from './pages/LoginPage/loginPageNatural/loginPageNatural';
import { RegisterNaturalPage } from './pages/LoginPage/registerNaturalPage';
import { PasswordLostPage } from './pages/LoginPage/passwordLost/passwordLostPage';
import { ResetPasswordPage } from './pages/LoginPage/passwordReset/passwordResetPage';

export function AppWrapper() {
  // Глобальный обработчик ошибок
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      if (event.error && event.error.message && event.error.message.includes('map is not a function')) {
        console.error('❌ Ошибка .map():', event.error);
        console.error('Stack:', event.error.stack);
        // Предотвращаем падение приложения
        event.preventDefault();
      }
    };
    
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  // Prevent FOUC - show content after CSS loads
  useEffect(() => {
    const timer = setTimeout(() => {
      document.body.classList.add('loaded');
    }, 100); // Small delay to ensure CSS is applied

    return () => clearTimeout(timer);
  }, []);

  const router = createBrowserRouter([
    { path: "*", Component: Root },
  ]);

  function Root() {

    return (
      <Routes>
        <Route path="/" element={<WrapperPage />}>
          <Route index element={<LandingPage />} />
          <Route path="search" element={<SearchPage />}></Route>
          <Route path="object/:id" element={<ObjectPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="login" element={<LoginPageNatural/>} />
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
          <Route path="partners" element={<PartnersPage></PartnersPage>} />
          <Route path="credits" element={<RecvPage />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="excursion" element={<ExPage />} />
          <Route path="exPage.html" element={null} />
          <Route path="articles/:id" element={<ArticlePage></ArticlePage>} />
          <Route path="attractions/:id" element={<AttractionPage></AttractionPage>} />
          <Route path="excursions/:id" element={<ExcursionPage></ExcursionPage>} />
          <Route path="exDoc.html" element={null} /> {/* Игнорировать */}
          <Route path="favorites" element={<FavePage></FavePage>} />
          <Route path='*' element={<NotFoundPage></NotFoundPage>} />
        </Route>
        {/* Личный кабинет по схеме из instruction */}
        <Route path="/lk" element={<PrivateRoute Component={WrapperLKPage} />}>
          <Route index element={<ProfilePage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="favorites" element={<FavePage />} />
          <Route path="bonus" element={<BonusPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        {/* <Route path="/auth" element={<LoginPage />}></Route>
      <Route path="/register" element={<RegisterPage />}></Route> */}
        {/* <Route path="/docs/*" element={<ProfileNavBar/>} /> */}
      </Routes>

    );
    // <AuthPages/>
  }

  const redColor: MantineColorsTuple = [
    "#ffecec",
    "#f8d9d9",
    "#e9b1b1",
    "#dc8786",
    "#d16363",
    "#ca4d4c",
    "#c84040",
    "#b13232",
    "#9f2a2b",
    "#8c2023"
  ];

  //4 is the original sutki color
  const sutkiGreenColor: MantineColorsTuple = [
    '#f5fae8',
    '#eaf0db',
    '#d4deba',
    '#bdcb97',
    '#aabb79',
    '#9db265',
    '#96ad5a',
    '#82974a',
    '#73863f',
    '#617430'
  ];

  //9
  const sberGreenColor: MantineColorsTuple = [
    '#ecfeec',
    '#d6fbd5',
    '#a7f9a6',
    '#76f674',
    '#51f34b',
    '#3ef234',
    '#34f229',
    '#29d71f',
    '#1fbf17',
    '#09a509'
  ];

  //6
  const orangeColor: MantineColorsTuple = [
    '#fff6e2',
    '#feeccf',
    '#f9d7a1',
    '#f5c16f',
    '#f1af44',
    '#f0a329',
    '#ef9d19',
    '#d5880b',
    '#bd7802',
    '#a56700'
  ];


  const grayColor: MantineColorsTuple = [
    '#F8F9FA',
    '#F1F3F5',
    '#E9ECEF',
    '#DEE2E6',
    '#CED4DA',
    '#ADB5BD',
    '#868E96',
    '#495057',
    '#343A40',
    '#212529'
  ];



  const theme = createTheme({
    // components: {
    //   Paper: Paper.extend({
    //     vars: (theme, props) => {
    //       if (props.radius === 'xxl') {
    //         return {
    //           root: {
    //             '--button-height': '60px',
    //             '--button-padding-x': '30px',
    //             '--button-fz': '24px',
    //           },
    //         };
    //       }

    //       if (props.size === 'xxs') {
    //         return {
    //           root: {
    //             '--button-height': '24px',
    //             '--button-padding-x': '10px',
    //             '--button-fz': '10px',
    //           },
    //         };
    //       }

    //       return { root: {} };
    //     },
    //   }),
    // },
    primaryColor: 'grayColor',
    colors: {
      redColor,
      grayColor,
      orangeColor,
      sberGreenColor,
      sutkiGreenColor
    },

    breakpoints: {
      xs: '30em',
      // 576px 
      sm: '48em',
      // 768px

      md: '64em',
      // 992px

      lg: '74em',
      // 1200px

      xl: '90em',
      // 1408px
    },

    fontSizes: {
      xs: rem(12),
      sm: rem(13),
      md: rem(14),
      lg: rem(16),
      xl: rem(20),
    },
    headings: {
      sizes: {
        h1: { fontSize: rem(24) },
        h2: { fontSize: rem(20) },
        h3: { fontSize: rem(18) }
      },
    }

  })


  class ErrorBoundaryWithReload extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReload = () => {
      window.location.reload();
    };

    render() {
      if (this.state.hasError) {
        return (
          <div style={{ padding: 20, textAlign: 'center' }}>
            <h2>Произошла ошибка</h2>
            <p>Приложение будет перезагружено автоматически...</p>
            <Button onClick={this.handleReload} color="blue">
              Перезагрузить сейчас
            </Button>
          </div>
        );
      }

      return this.props.children;
    }
  }
  // useEffect(() => {
  //   // Проверяем cookie при монтировании
  //   setShowCookieBanner(!Cookies.get('cookie_consent'));

  //   // Функция для проверки cookie
  //   const checkCookie = () => {
  //     setShowCookieBanner(!Cookies.get('cookie_consent'));
  //   };

  //   // Проверяем изменения каждую секунду (можно оптимизировать)
  //   // const interval = setInterval(checkCookie, 1000);

  // }, []);

  return (
    <MantineProvider theme={theme}>
      <Notifications autoClose={5000} />
      <React.StrictMode>
        <ErrorBoundaryWithReload>
          <RouterProvider router={router} />
        </ErrorBoundaryWithReload>
      </React.StrictMode>
    </MantineProvider>
  );
}