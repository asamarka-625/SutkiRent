import { AppShell, Button, Divider, Flex, Group } from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./burgerMenuLK.module.css";
import { useMediaQuery } from "@mantine/hooks";

interface Props {
  upperSecondTabsData: Array<{
    name: string;
    link: string;
    icon: JSX.Element;
  }>;
  upperTabsData: Array<{
    name: string;
    link: string;
    icon: JSX.Element;
    sicon: JSX.Element;
  }>;
  opened: boolean;
  toggle: () => void;
}

export function BurgerMenuLK(props: Props) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 64em)");
  const location = useLocation();

  const upperSecondTabs = props.upperSecondTabsData.map((tab) => {
    const isActive = location.pathname === tab.link;
    return (
      <div
        key={tab.link}
        style={{ display: "flex", padding: "3px" }}
        onClick={() => {
          navigate(tab.link);
          props.toggle();
        }}
      >
        {isActive ? <div className={styles.highlighter}></div> : ""}
        <div className={styles[isActive ? "active" : "tab"]}>
          <Group gap={"12px"}>
            {tab.icon}
            {tab.name}
          </Group>
        </div>
      </div>
    );
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "16px",
        transform: isMobile ? `translateX(${props.opened ? "0%" : "-100%"})` : "",
        transition: "transform 0.3s ease",
        zIndex: 9999999,
        position: isMobile ? "fixed" : "sticky",
        backgroundColor: "var(--mantine-color-grayColor-2)",
        background: "var(--mantine-color-grayColor-2)",
      }}
    >
      <div className={styles.pageLayout}>
        <Flex className={styles.lowerUpperMenuMobileDesk} direction="column">
          <div className={styles.tabsContainer}>{upperSecondTabs}</div>
          <Button
            mt="md"
            size="xs"
            variant="outline"
            color="gray"
            onClick={async () => {
              await authService.logout();
              props.toggle();
              navigate('/');
            }}
          >
            Выйти
          </Button>
        </Flex>
      </div>
    </div>
  );
}


