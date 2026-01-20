
// import LogoSVG from "../../../icons/logo.svg?react"
import { Button, Divider, Flex, TextInput } from "@mantine/core";
import { ProfileButton } from "../../components/buttons/profileButton/profileButton";
import styles from "./profilePage.module.css";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";
import { MainInfoPage } from "./mainProfile/mainInfoPage";
import { StatisticsPage } from "./statictics/statisticsPage";
import { PersInfoPage } from "./persInfo/persInfoPage";
import { BookingsBlock } from "./bookings/bookingsPage";



export function ProfilePage() {

    const isMobile = useMediaQuery('(max-width: 74em)');
    const [isRedacted, setIsRedacted] = useState(false);

    return (
        <div className="paperdivLK">
            <div style={{ display: isMobile ? "block" : "flex", width: "100%", gap: "16px" }}>
                <div className={styles.leftSection}>

                    <MainInfoPage></MainInfoPage>
                    <StatisticsPage></StatisticsPage>
                </div>
                <div style={{ width: "100%" }}>
                    <PersInfoPage></PersInfoPage>
                    <BookingsBlock></BookingsBlock>
                </div>
            </div>

        </div>
    )
}
