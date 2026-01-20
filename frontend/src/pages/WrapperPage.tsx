import { useDisclosure } from '@mantine/hooks';
import { Flex, AppShell, Button, Burger, Group, Divider } from "@mantine/core";
// core styles are required for all packages
import '@mantine/core/styles.css';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import styles from "./WrapperPage.module.css";
// import styles from "./LandingPage.module.css"
import { useEffect, useState } from 'react';
import LogoSVG from "../icons/logo2.svg?react"
import Partners from "../icons/partners.svg?react"
import Consult from "../icons/phone.svg?react"

import { LogInNavButton } from '../components/buttons/logInButton/logInButton.tsx';
import { FooterMenu } from '../components/menus/footerMenu/footerMenu.tsx';
import { BurgerMenu } from '../components/menus/burgerMenu/burgerMenu.tsx';
import { getRegionNameById } from '../services/getEverything.ts';
import { CookieBanner } from '../components/cookieBanner/cookieBanner.tsx';
import { WidgetBanner } from '../components/widgetBanner/widgetBanner.tsx';
import LikeSVG from "./../icons/like.svg?react";

export function WrapperPage() {
  const navigate = useNavigate()
  const [opened, { toggle }] = useDisclosure();
  const [regionName, setRegionName] = useState('')

  const likes = [
    { link: '/favorites', icon: <LikeSVG /> }
  ]


  const upperTabsData = [
    { name: 'Партнерам', link: '/partners', icon: <Partners width={25} height={25} />, sicon: <Partners /> },
    { name: 'Консультация', link: '/countdown', icon: <Consult width={25} height={25} />, sicon: <Consult /> },
  ]

  const upperSecondTabsData = [
    { name: 'О нас', link: '/about' },
    { name: 'Поиск', link: '/search' },
    { name: 'Экскурсии', link: '/excursion' },
    { name: 'Новости', link: '/articles' },
  ]
  
  // Для мобильной версии добавляем "Личный кабинет"
  const upperSecondTabsDataMobile = [
    ...upperSecondTabsData,
    { name: 'Реквизиты', link: '/credits' },
    { name: 'Личный кабинет', link: '/lk' },
  ]



  const upperlikes = likes.map((tab, index) => (
    <Flex gap={"xs"} align={"center"} className={styles[`tab`]} key={index.toString()}
      onClick={() => navigate(tab.link || '/countdown')}>
      {tab.icon}
    </Flex>
  ));

  const upperTabs = upperTabsData.map((tab, index) => (
    <Button
      key={index.toString()}
      size='xs'
      className={styles[`tab`]}
      onClick={() => navigate(tab.link || '/countdown')}
      variant="outline">
      <Flex gap={"xs"} align={"center"}>
        {tab.sicon}
        <div
          className='mantine-visible-from-lg'
          // className={styles['desktop-component']}
          style={{ marginBottom: 1 }}
        >{tab.name}</div>
      </Flex>
    </Button>
  ));


  async function displayRegion() {
    const storedData = sessionStorage.getItem('mainPageState');
    const regionId = (storedData ? JSON.parse(storedData) : null)?.region?.toString() || '';
    let regionName: string = await getRegionNameById(regionId);
    setRegionName(regionName)
  }

  useEffect(() => {
    displayRegion()
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
      key={index.toString()}
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
      <CookieBanner />
      <WidgetBanner/>
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
            <LogoSVG width="115" height="40" onClick={() => { navigate("/"); opened && toggle() }}></LogoSVG>

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

              {/* <div style={{ display: "block" }}>
              <div className='textStyle12' style={{ fontWeight: 500 }}>+7 995 577-53-68</div>
              <Badge size='sm' color='sberGreenColor.9'
                styles={{
                  label: {

                  }
                }}>кешбек 30%</Badge>
            </div> */}
              {/* <Group>
              <div style={{ display: "block" }}>
                <p className='textStyle12' style={{ color: "var(--mantine-color-grayColor-6)" }}>Давайте
                  <br />
                  дружить
                </p>
              </div>
            </Group> */}
              {upperSecondTabs}
            </Group>
            <Group justify='flex-end' gap={'xs'}>
              {upperlikes}
              {upperTabs}
              <LogInNavButton></LogInNavButton>
              {/* <div>штука справа</div> */}
            </Group>

          </Flex>
        </div>

        {/* {location.pathname == ("/search") ? 
        <SearchMenu></SearchMenu>
          :  */}
        <BurgerMenu upperSecondTabsData={upperSecondTabsDataMobile} upperTabsData={upperTabsData} toggle={toggle} />
        {/* } */}

        {/* <BurgerMenu upperSecondTabsData={upperSecondTabsData} upperTabsData={upperTabsData} /> */}
        <AppShell.Main 
        bg={'rgb(241, 235, 238)'}
        // bg={'grayColor.2'}
        
        >
          {/* gray color2 */}

          <div className='mantine-visible-from-sm'  >
            <Outlet />
          </div>
          {/* мобильная версия */}
          <div className='mantine-hidden-from-sm' style={{ marginTop: 60 }}>
            <Outlet />
          </div>
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
