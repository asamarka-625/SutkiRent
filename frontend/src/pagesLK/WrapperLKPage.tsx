import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { Flex, AppShell, Button, Burger, Group, Divider } from "@mantine/core";
// core styles are required for all packages
import '@mantine/core/styles.css';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import styles from "./WrapperLKPage.module.css";
// import styles from "./LandingPage.module.css"
import { useCallback, useEffect, useState } from 'react';
import LogoSVG from "../icons/logo2.svg?react"
import Partners from "../icons/partners.svg?react";
import Consult from "../icons/phone.svg?react";


import { LogInNavButton } from '../components/buttons/logInButton/logInButton.tsx';
import { FooterMenu } from '../components/menus/footerMenu/footerMenu.tsx';
import { BurgerMenu } from '../components/menus/burgerMenu/burgerMenu.tsx';
import { getRegionNameById } from '../services/getEverything.ts';
import { usePageName } from '../handlers/nameForLKHandler.ts';
import { ProfileButton } from '../components/buttons/profileButton/profileButton.tsx';
import authService, { UserProfile } from '../services/authService';
import { BurgerMenuLK } from '../components/menus/burgermenuLK/burgerMenuLK.tsx';
// import { CookieBanner } from '../components/cookieBanner/cookieBanner.tsx';
import LikeSVG from "./../icons/like.svg?react";


export function WrapperLKPage() {
  const navigate = useNavigate()
  const location = useLocation(); // Получаем текущий location
  const [opened, { toggle }] = useDisclosure();
  const pageName = usePageName();
  const [userName, setUserName] = useState<string>('Профиль');
  const [gender, setGender] = useState<'male' | 'female' | 'unknown'>('unknown');

  // Те же кнопки, что и на основной обёртке (О нас, Поиск, и т.д.)
  const likes = [
    { link: '/favorites', icon: <LikeSVG /> }
  ];

  // Верхнее меню сайта (Партнёрам, Консультация)
  const siteTabsData: { name: string; link: string; icon: JSX.Element; sicon: JSX.Element }[] = [
    { name: 'Партнерам', link: '/partners', icon: <Partners width={25} height={25} />, sicon: <Partners /> },
    { name: 'Консультация', link: '/countdown', icon: <Consult width={25} height={25} />, sicon: <Consult /> },
  ];

  const upperSecondTabsDataSite = [
    { name: 'На главную', link: '/' },
    { name: 'О нас', link: '/about' },
    { name: 'Поиск', link: '/search' },
    { name: 'Экскурсии', link: '/excursion' },
    { name: 'Новости', link: '/articles' },
  ];
  // Навигация ЛК (профиль, бронирования и т.п.) — слева в боковом меню
  const upperTabsData: { name: string; link: string; icon: JSX.Element; sicon: JSX.Element }[] = [];

  const upperSecondTabsData = [
    { name: 'Профиль', link: '/lk', icon: <></> },
    { name: 'Мои бронирования', link: '/lk/bookings', icon: <></> },
    { name: 'Избранное', link: '/lk/favorites', icon: <></> },
    { name: 'Бонусный счет', link: '/lk/bonus', icon: <></> },
    { name: 'Уведомления', link: '/lk/notifications', icon: <></> },
    { name: 'Настройки', link: '/lk/settings', icon: <></> },
  ]

  const upperTabs = siteTabsData.map((tab, index) => (
    <Button
      size='sm'
      className={styles[`tab`]}
      onClick={() => {
        if (tab.link) {
          navigate(tab.link);
        }
      }}
      variant="outline">
      <Flex gap={"xs"} align={"center"}>
        {tab.sicon}
      </Flex>
    </Button>
  ));

  const upperSecondTabsSite = upperSecondTabsDataSite.map((tab, index) => (
    <Button
      key={index.toString()}
      className={styles[`tab`]}
      onClick={() => navigate(tab.link)}
      variant="outline">
      <Group gap={"8px"}>
        {tab.name}
      </Group>
    </Button>
  ));

  const upperlikes = likes.map((tab, index) => (
    <Flex gap={"xs"} align={"center"} className={styles[`tab`]} key={index.toString()}
      onClick={() => navigate(tab.link)}>
      {tab.icon}
    </Flex>
  ));


  async function displayPageName() {
    // как доблавить зависимость от смены url в useeffect
    usePageName()
  }

  useEffect(() => {
    displayPageName()
  }, [location]);

  useEffect(() => {
    // Берём имя пользователя из authService/localStorage
    const rawUser = authService.getUser() || (() => {
      try {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    })();

    if (rawUser) {
      const candidateName =
        (rawUser.first_name as string | undefined) ||
        (rawUser.username as string | undefined) ||
        '';
      setUserName(candidateName || 'Профиль');
    }
    
    // Загружаем профиль для получения gender (и возможного уточнения имени)
    (async () => {
      const profileResp = await authService.getProfile();
      if (profileResp.success && profileResp.profile) {
        const profile = profileResp.profile as UserProfile;
        setGender(profile.gender || 'unknown');

        const candidateName =
          (profile.first_name as string | undefined) ||
          (rawUser?.first_name as string | undefined) ||
          (rawUser?.username as string | undefined) ||
          '';
        if (candidateName) {
          setUserName(candidateName);
        }
      }
    })();
  }, []);


  // const burgerUpperTabs = upperTabsData.map((tab, index) => (
  //   <Button
  //     className={styles[`tab`]}
  //     onClick={() => navigate(tab.link)}
  //     variant="outline">
  //     <Flex gap={"xs"} align={"center"}>
  //       <div
  //         // className={styles['desktop-component']}
  //         style={{ marginBottom: 1 }}
  //       >{tab.name}</div>
  //     </Flex>
  //   </Button>
  // ));

  const upperSecondTabs = upperSecondTabsData.map((tab, index) => (
    <Button
      className={styles[`tab`]}
      onClick={() => navigate(tab.link)}
      variant="outline">
      <Group gap={"8px"}>
        {tab.name}
      </Group>
    </Button>
  ));



  return (
    <div>
      {/* <CookieBanner /> */}
      <AppShell
        navbar={{ width: 'sm', breakpoint: 'sm', collapsed: { mobile: !opened } }}
      // padding="md"
      >
        <AppShell.Header
          // pos={"relative"} 
          style={{ zIndex: 200 }}
        >
          <Flex align="center" justify='space-between' className={styles["lowerUpperMenuMobile"]} gap={'xl'}>
            <Flex align="center">
              <Burger opened={opened} onClick={toggle} size="sm" />
            </Flex>
            <LogoSVG width="115" height="40" onClick={() => { navigate("/"); toggle() }}></LogoSVG>

            {/* {upperSecondTabs}  */}
          </Flex>

        </AppShell.Header>
        <div className={styles['header']}>
          {/* <Flex justify='space-between' align="center" className={styles["upperMenu"]}>
            <Group justify='flex-start'
           
            >
              <LocationNavButton userCity={regionName || 'Санкт-Петербург'} />

              <div>{upperTabs}
              </div>
            </Group>
            <Group justify='flex-end'>
             
            </Group>
          </Flex> */}

          {/* <Divider p="0px"></Divider> */}

          <Flex align="center" justify='space-between' className={styles["lowerUpperMenu"]} gap={'xl'}>
            <Group justify='flex-start' gap={'xl'}>
              <div className={styles[`tab`]}>
                <LogoSVG onClick={() => navigate("/")} width="115" height="40"></LogoSVG>
              </div>
              {upperSecondTabsSite}
            </Group>
            <Group justify='flex-end' gap={'xs'}>
              {upperlikes}
              {upperTabs}
              <ProfileButton name={userName} gender={gender}></ProfileButton>
              <Button
                size="xs"
                variant="outline"
                color="gray"
                onClick={async () => {
                  await authService.logout();
                  navigate('/');
                }}
              >
                Выйти
              </Button>
            </Group>
          </Flex>
        </div>

        {/* {location.pathname == ("/search") ? 
        <SearchMenu></SearchMenu>
          :  */}
        {/* } */}

        {/* <BurgerMenu upperSecondTabsData={upperSecondTabsData} upperTabsData={upperTabsData} /> */}
        <AppShell.Main bg={'grayColor.2'}>

          <div className={styles.pageLayoutLarge}>
              <BurgerMenuLK upperSecondTabsData={upperSecondTabsData} upperTabsData={upperTabsData} opened={opened} toggle={toggle} />
              <Outlet />
          </div>

          {/* мобильная версия */}
          {/* <div className='mantine-hidden-from-sm' style={{ marginTop: 60 }}>
            <BurgerMenuLK upperSecondTabsData={upperSecondTabsData} upperTabsData={upperTabsData} opened={opened} />
            <Outlet />
          </div> */}
        </AppShell.Main>

        <AppShell.Footer bg={'grayColor.1'}
          className={styles['footer']}
        >
          <div className='mantine-visible-from-lg'>
            <FooterMenu ></FooterMenu>
          </div>

          <Divider p="0px"></Divider>
          {/* <Flex justify='flex-start' style={{ padding: "35px 80px" }} bg={'grayColor.2'} gap={'xl'}>
            <Text style={{ fontWeight: 200 }}>Copyright © Sutki Rent 2022</Text>
            <PrivacyPolicyButton></PrivacyPolicyButton>
          </Flex> */}

          {/*        Copyright © Sutki Rent 2022 className={styles["desktop-component"]}footer-text
          <Text className={styles["desktop-component"]}>SUTKI.RENT 2024</Text>
          {/* <Group justify="center" gap="lg" grow className={styles["mobile-component"]}>
            {upperTabsMobile}
          </Group> 

   


 <Flex justify='space-between' style={{ padding: "6px 20px" }}  bg={'grayColor.2'}>
 <Text className={styles["desktop-component"]}>Copyright 2024</Text>
 </Flex> */}
        </AppShell.Footer>
      </AppShell>
    </div>
  );
}
