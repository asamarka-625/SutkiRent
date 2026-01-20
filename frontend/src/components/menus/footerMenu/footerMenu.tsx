import { Button, Flex, Group, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import styles from "./footerMenu.module.css";
import LogoSVG  from "../../../icons/LogoWhite.svg?react"
// export function logOut() {
//   const navigate = useNavigate();
//   navigate("/partners")
//   // window.location.href = "/auth";

// }

const footerMainLinksData = [
  { name: 'Гостям', link: '' }, /* 0 */
  { name: 'Хозяевам жилья', link: '' }, /* 0 */
  { name: 'О нас', link: '' }, /* 0 */
  { name: 'Оплата', link: '' },/* 1 */
  { name: 'Экскурсии', link: '' },/* 2 */
  { name: 'Партнерам', link: '/partners' },/* 3 */
  { name: 'Документы для скачивания', link: '' },/* 4 */
  { name: 'Личный кабинет', link: '' }/* 5 */
]

const footer1Data = [
  { name: 'Как бронировать жилье', link: '' },
  { name: 'Новости', link: '/articles' },
  { name: 'Экскурсии', link: '/excursion' },
  { name: 'Контакты', link: '' },
]

const footer2Data = [
  { name: 'Как сдавать жилье', link: '' },
  { name: 'Разместить объявление', link: '' },
  { name: 'Новости', link: '/articles' },
  { name: 'Экскурсии', link: '/excursion' },
  { name: 'Контакты', link: '' },
]

const footer3Data = [
  { name: 'Компания', link: '/about' },
  { name: 'Реквизиты', link: '/credits' },
  { name: 'Сотрудничество', link: '/partners' },
  { name: 'Документы', link: '' },
  { name: 'Политика конфиденциальности', link: '/policy' },
]

const footerDocsData = [
  { name: 'Договор оферты', link: '' }
]


export function FooterMenu() {
  const navigate = useNavigate()

  const footer1Links = footer1Data.map((tab, index) => (
    <Flex direction='column' gap={0} align='flex-start'>
      <Text
        className={styles[`tab-sub-footer`]}
          onClick={() => {
        navigate(tab.link || '/countdown');
      }}
        variant="transparent">
        {tab.name}
      </Text>
    </Flex>
  ));

  const footer2Links = footer2Data.map((tab, index) => (
    <Flex direction='column' gap={0} align='flex-start'>
      <Text
        className={styles[`tab-sub-footer`]}
         onClick={() => {
        navigate(tab.link || '/countdown');
      }}
        variant="transparent">
        {tab.name}
      </Text>
    </Flex>
  ));

  const footer3Links = footer3Data.map((tab, index) => (
    <Flex direction='column' gap={0} align='flex-start'>
      <Text
        className={styles[`tab-sub-footer`]}
          onClick={() => {
        navigate(tab.link || '/countdown');
      }}
        variant="transparent">
        {tab.name}
      </Text>
    </Flex>
  ));



  return (
    <div>
      <Flex justify='flex-start' align="flex-start" className={styles["footer"]} gap={200}>
        <Flex direction='column' align='flex-start' gap={22}>
          <LogoSVG width={115} height={40} ></LogoSVG>
          <Button disabled
            mt={5}
            mb={5}
            className={styles[`tab-main-footer`]}
            onClick={() => navigate(footerMainLinksData[7].link)}
            variant="transparent">
            {footerMainLinksData[7].name}
          </Button>
          <Flex direction='column' gap={0} align='flex-start'>
            <Text
              className={styles[`tab-sub-footer-static`]}
              variant="transparent">
              Служба поддержки
              <br />
              +7 995 577-53-68
            </Text>
          </Flex>
        </Flex>


        <Flex align={"flex-start"} gap={100} justify={"space-evenly"} w={"70%"}>
          <Flex direction='column' align='flex-start' gap={5}>
            <Text
              className={styles[`tab-main-footer`]}
              // onClick={() => navigate(footerMainLinksData[0].link)}
              variant="transparent">
              {footerMainLinksData[0].name}
            </Text>
            {footer1Links}
          </Flex>

          <Flex direction='column' align='flex-start' gap={5}>
            <Text
              className={styles[`tab-main-footer`]}
              // onClick={() => navigate(footerMainLinksData[1].link)}
              variant="transparent">
              {footerMainLinksData[1].name}
            </Text>
            {footer2Links}
          </Flex>

          <Flex direction='column' align='flex-start' gap={5}>
            <Text
              className={styles[`tab-main-footer`]}
              // onClick={() => navigate(footerMainLinksData[2].link)}
              variant="transparent">
              {footerMainLinksData[2].name}
            </Text>
            {footer3Links}
          </Flex>


          {/* <Flex direction='column' align='flex-start' gap={5}>
            <Button
              className={styles[`tab-main-footer`]}
              onClick={() => navigate(footerMainLinksData[3].link)}
              variant="transparent">
              {footerMainLinksData[3].name}
            </Button>
          </Flex>


          <Flex direction='column' align='flex-start' gap={5}>
            <Button disabled className={styles[`tab-main-footer`]} style={{ cursor: "auto" }}
            >
              {footerMainLinksData[4].name}
            </Button>
            {footerDocsLinks}
          </Flex>*/}
        </Flex>

      </Flex>
      <Flex justify='space-between' align={"center"} style={{ padding: "35px 80px" }} gap={'xl'} className={styles.copy}>
        <Text c={'grayColor.0'} style={{ fontWeight: 200, opacity: "50%" }}>Все права защищены.
          Copyright © 2022-2025 sutki.rent. Сайт не является публичной<br />офертой,и несет информационный характер,
          цены уточняйте у менеджеров компании
        </Text>
        <PrivacyPolicyButton></PrivacyPolicyButton>
      </Flex>

    </div>


  )

}

export function PrivacyPolicyButton() {
  const navigate = useNavigate()
  return (
    <Text
      style={{ fontWeight: 200, opacity: "80%" }}
      className={styles[`tab-sub-footer`]}
      onClick={() => { navigate("/policy"); window.scrollTo(0, 0) }}
      variant="transparent">
      Политика конфиденциальности
    </Text>
  )
}