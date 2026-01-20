import { AppShell, Button, Flex, Group, Text, Paper, CloseButton } from "@mantine/core";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./burgerMenu.module.css";
import authService from "../../../services/authService";
// import { ReactComponent as LogoSVG } from "..//..//..//icons/logo.svg"
// export function logOut() {
//   const navigate = useNavigate();
//   navigate("/partners")
//   // window.location.href = "/auth";

// }


interface Props {
  // paddingTop: string,
  upperSecondTabsData: Array<{
    name: string;
    link: string;
  }>,
  upperTabsData: Array<{
    name: string;
    link: string;
    icon: JSX.Element;
    sicon: JSX.Element;
  }>,
  toggle: () => void

}

export function BurgerMenu(props: Props) {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const likes = [
    { link: '/favorites', name: 'Избранное' }
  ]

    const likeTab = likes.map((tab, index) => (
    <Button
    key={index.toString()}
      className={styles[`tab`]}
      onClick={() => { navigate(tab.link); props.toggle() }}
      variant="outline">
      <Group gap={"8px"}>
        {tab.name}
      </Group>
    </Button>
  ));

  const upperSecondTabs = props.upperSecondTabsData.map((tab, index) => (
    <Button
    key={index.toString()}
      className={styles[`tab`]}
      onClick={() => { navigate(tab.link); props.toggle() }}
      variant="outline">
      <Group gap={"8px"}>
        {tab.name}
      </Group>
    </Button>
  ));

  const burgerUpperTabs = props.upperTabsData.map((tab, index) => (
    <Button
    key={index.toString()}
      className={styles[`tab`]}
      onClick={() => { navigate(tab.link); props.toggle(); }}
      variant="outline">
      <Flex gap={"xs"} align={"center"}>
        <div
          // className={styles['desktop-component']}
          style={{ marginBottom: 1 }}
        >{tab.name}</div>
      </Flex>
    </Button>
  ));

  return (
    <div className="mantine-hidden-from-sm">
      <AppShell.Navbar 
        p="md" 
        bg={'grayColor.2'} >
        <Flex 
          className={styles["lowerUpperMenuMobile"]} 
          align='center' 
          direction="column"
          style={{
            position: "relative",
            zIndex: 1,
            backgroundColor: "var(--mantine-color-grayColor-2)",
            minHeight: "100vh",
            width: "100%",
          }}
        >
          {/* Кнопка закрытия */}
          <Flex justify="flex-end" style={{ width: "100%", marginBottom: "16px", paddingTop: "8px" }}>
            <CloseButton
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                props.toggle();
              }}
              size="lg"
              aria-label="Закрыть меню"
              style={{ zIndex: 10000 }}
            />
          </Flex>

          {/* Ссылка на личный кабинет, если пользователь авторизован */}
          {isAuthenticated && (
            <Button
              className={styles[`tab`]}
              onClick={() => { navigate('/lk'); props.toggle(); }}
              variant="outline"
              fullWidth
              mb="md"
            >
              <Group gap={"8px"}>
                Личный кабинет
              </Group>
            </Button>
          )}

          {upperSecondTabs}
          {burgerUpperTabs}
          {likeTab}
        </Flex>
      </AppShell.Navbar>
    </div>
  )

}

