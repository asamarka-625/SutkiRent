
// import LogoSVG from "../../../icons/logo.svg?react"
import { useMediaQuery } from "@mantine/hooks";
import styles from "./bonusPage.module.css";
import { MainBonusBlock } from "./mainBonusBlock/mainBonusBlock";
import { BonusHistoryBlock } from "./bonusHistory/bonusHistoryBlock";



export function BonusPage() {

    const isMobile = useMediaQuery('(max-width: 74em)');

    return (
        <div className="paperdivLK">
            <div style={{ display: isMobile ? "block" : "flex", width: "100%", gap: "16px" }}>
                <div className={styles.leftSection}>
                    <MainBonusBlock></MainBonusBlock>
                </div>
                <div style={{ width: "100%" }}>
                    <BonusHistoryBlock></BonusHistoryBlock>
                </div>
            </div>

        </div>
    )
}