
// import LogoSVG from "../../../icons/logo.svg?react"
import { Button, Divider, Flex, TextInput } from "@mantine/core";
import styles from "./instructionsBlock.module.css";
import { useMediaQuery } from "@mantine/hooks";
import { IMaskInput } from 'react-imask';
import { useState } from "react";
import { ProfileButton } from "../../../components/buttons/profileButton/profileButton";



export function InstructionsBlock() {

    const isMobile = useMediaQuery('(max-width: 48em)');
    const [isRedacted, setIsRedacted] = useState(false);

    const statistic = [{ id: '1', name: "Текущий баланс", amount: "850 баллов" }]

    const listStatistic = statistic.map((item) => (
        <li key={item.id} className="bullet-item" data-area={`1`}
            style={{ margin: 0, boxShadow: "none" }}>
            {/* <div className="bullet-number"></div> */}
            <div className="bullet-content" style={{}}>
                <p style={{}}>{item.name[0].toUpperCase() + item.name.slice(1)}</p>
                <h3 style={{ fontSize: "24px" }}>{item.amount}</h3>
            </div>
        </li>
    ));

    return (
        <div className="papercardLK">
            {/* <div className="paperHeaderLK"
                style={{
                    backgroundColor: "var(--mantine-color-sberGreenColor-9)",
                    color: "var(--mantine-color-grayColor-0)"
                }}
            >
                <h2 className={"HeadingTitle"} style={{ color: "var(--mantine-color-grayColor-0)" }}>Бонусный счет</h2>
            </div> */}
            <div className="papercard" style={{ gap: "20px" }}>
                <h3 className="HeadingStyle3">Как начисляются бонусы?</h3>
                
                Бонусы начисляются за активности на сайте: оформление бронирований, отзывы и другие плюшки

            </div>
        </div>
    )
}