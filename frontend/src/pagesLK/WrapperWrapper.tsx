import { useDisclosure } from '@mantine/hooks';
import { Flex, AppShell, Button, Burger, Group, Divider } from "@mantine/core";
// core styles are required for all packages
import '@mantine/core/styles.css';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import styles from "./WrapperLKPage.module.css";
// import styles from "./LandingPage.module.css"
import { useCallback, useEffect, useState } from 'react';
import LogoSVG from "../icons/logo2.svg?react"
import Notif from "../icons/notifications.svg?react"


import { LogInNavButton } from '../components/buttons/logInButton/logInButton.tsx';
import { FooterMenu } from '../components/menus/footerMenu/footerMenu.tsx';
import { BurgerMenu } from '../components/menus/burgerMenu/burgerMenu.tsx';
import { getRegionNameById } from '../services/getEverything.ts';
import { usePageName } from '../handlers/nameForLKHandler.ts';
import { ProfileButton } from '../components/buttons/profileButton/profileButton.tsx';
import { BurgerMenuLK } from '../components/menus/burgermenuLK/burgerMenuLK.tsx';
// import { CookieBanner } from '../components/cookieBanner/cookieBanner.tsx';

export function WrapperLKPage() {


  const navigate = useNavigate()
  const location = useLocation(); // Получаем текущий location
  const [opened, { toggle }] = useDisclosure();
  const pageName = usePageName();



  const upperTabsData = [
    { name: '', link: '', icon: <Notif width={15} height={15}/>, sicon: <Notif width={15} height={15}/> },
    // { name: 'Консультация', link: '', icon: <Consult width={25} height={25} />, sicon: <Consult /> },
  ]

  const upperSecondTabsData = [
    { name: 'О нас', link: '/about' },
    { name: 'Поиск', link: '/search' },
    { name: 'Экскурсии', link: '/excursion' },
    { name: 'Новости', link: '/articles' },

  ]



  // const upperlikes = likes.map((tab, index) => (
  //   <Flex gap={"xs"} align={"center"} className={styles[`tab`]}
  //     onClick={() => {
  //       if (tab.link) {
  //         navigate(tab.link);
  //       }
  //     }}>
  //     {tab.icon}
  //   </Flex>
  // ));



  const upperTabs = upperTabsData.map((tab, index) => (
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


  async function displayPageName() {
    // как доблавить зависимость от смены url в useeffect
    usePageName()
  }

  useEffect(() => {
    displayPageName()
  }, [location]);


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
        padding="md">
        <AppShell.Header
          // pos={"relative"} 
          style={{ zIndex: 200 }}
        >
          <Flex align="center" justify='space-between' className={styles["lowerUpperMenuMobile"]} gap={'xl'}>
            <Flex align="center">
              <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            </Flex>
            <LogoSVG width="115" height="40" onClick={() => { navigate("/"); toggle() }}></LogoSVG>

            {/* {upperSecondTabs}  */}
          </Flex>

        </AppShell.Header>
        

        {/* {location.pathname == ("/search") ? 
        <SearchMenu></SearchMenu>
          :  */}
        <BurgerMenuLK upperSecondTabsData={upperSecondTabsData} upperTabsData={upperTabsData} toggle={toggle} />

        <AppShell.Main bg={'grayColor.2'}>
            <Outlet />
        </AppShell.Main>
      </AppShell>
    </div>
  );
}
