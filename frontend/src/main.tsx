import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import '@mantine/carousel/styles.css';

import CookieConsent, { Cookies } from "react-cookie-consent";
// import "@fontsource/roboto-flex";
import '@mantine/notifications/styles.css';
// import App from './App';
import { BrowserRouter, Route, RouterProvider, Routes, createBrowserRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import { createTheme, MantineProvider, type MantineColorsTuple, rem, Paper, Button } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { WrapperPage } from './pages/WrapperPage';
// import { WrapperPage } from './pages/WrapperPage';
import { LandingPage } from './pages/LandingPage/landingPage';
import { SearchPage } from './pages/SearchPage/searchPage';
import { ObjectPage } from './pages/ObjectPage/objectPage';
import { AboutPage } from './pages/InfoPages/aboutPage/aboutPage';
import { ArticlesPage } from './pages/InfoPages/articlesPage/articlesPage';
import { ArticlePage } from './pages/InfoPages/articlesPage/singleArticle/articlePage';
import { RecvPage } from './pages/InfoPages/recvPage/recvPage';
import { PartnersPage } from './pages/InfoPages/partnersPage/partnersPage';
import { NotFoundPage } from './pages/404Page/404Page';
import { ExPage } from './pages/ExcursionPage/exPage';
import { PolicyPage } from './pages/InfoPages/policyPage/policyPage';
import { CookieBanner } from './components/cookieBanner/cookieBanner';
import { AppWrapper } from './AppWrapper';



const router = createBrowserRouter([
  { path: "*", Component: Root },
]);

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
{/* <PrivateRoute Component={LandingPage} /> */ }

// 1️⃣ Changed from App to Root
function Root() {

  return (
      <Routes>
        <Route path="/" element={<WrapperPage/>}>
          <Route index element={<LandingPage />} />
          <Route path="search" element={<SearchPage />}>
          </Route>
          <Route path="object/:id" element={<ObjectPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="policy" element={<PolicyPage />} />
          <Route path="partners" element={<PartnersPage></PartnersPage>} />
          <Route path="credits" element={<RecvPage />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="excursion" element={<ExPage />} />
          <Route path="exPage.html" element={null} />
          <Route path="articles/:id" element={<ArticlePage></ArticlePage>} />
          <Route path='*' element={<NotFoundPage></NotFoundPage>} />
          {/* <Route path="/passport" element={<PrivateRoute Component={PassportEdit} />} />
        <Route path="/legalent" element={<PrivateRoute Component={LegalEntPage} />} />
        <Route path="/legalent/:inn" element={<PrivateRoute Component={LegalEntInfo} />} />
        <Route path="/legalent/create" element={<PrivateRoute Component={LegalEntCreate} />} />

        <Route path="/object" element={<ObjectsPage />} />
        <Route path="/object/:id" element={<ObjectInfo />} />
        <Route path="/object/create" element={<ObjectCreate />} />
        <Route path="/docs/template" element={<TemplatePage />} /> 
        <Route path="/docs/signed" element={<ObjectsPage />} />  */}
        </Route>
        {/* <Route path="/auth" element={<LoginPage />}></Route>
      <Route path="/register" element={<RegisterPage />}></Route> */}
        {/* <Route path="/docs/*" element={<ProfileNavBar/>} /> */}
      </Routes>

  );
  // <AuthPages/>
}
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
//  const [showCookieBanner, setShowCookieBanner] = useState<boolean>(!Cookies.get('cookie_consent'));
root.render(
  <AppWrapper/>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )
