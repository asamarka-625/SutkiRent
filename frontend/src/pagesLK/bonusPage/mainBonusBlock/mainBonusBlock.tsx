
// import LogoSVG from "../../../icons/logo.svg?react"
import { Button, Divider, Flex, TextInput } from "@mantine/core";
import styles from "./mainBonusBlock.module.css";
import { useMediaQuery } from "@mantine/hooks";
import { IMaskInput } from 'react-imask';
import { useState, useEffect } from "react";
import { ProfileButton } from "../../../components/buttons/profileButton/profileButton";
import ArrowDropDown   from "../../../icons/ArrowDropDown.svg?react" 
import authService from "../../../services/authService";


export function MainBonusBlock() {

    const isMobile = useMediaQuery('(max-width: 48em)');
    const [isOpened, setIsOpened] = useState(false);
    const [balance, setBalance] = useState<string>("0");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBonusInfo();
    }, []);

    async function loadBonusInfo() {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch('/api/auth/bonus/info/', {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setBalance(data.balance || "0");
                }
            }
        } catch (error) {
            console.error('Error loading bonus info:', error);
        } finally {
            setLoading(false);
        }
    }

    const statistic = [{ id: '1', name: "Текущий баланс", amount: loading ? "Загрузка..." : `${balance} бонусов` }]

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
        <div>
            <div className="papercardLK" style={{ position: "relative", zIndex: 1 }}>
                <div className="paperHeaderLK"
                    style={{
                        backgroundColor: "var(--mantine-color-sberGreenColor-9)",
                        color: "var(--mantine-color-grayColor-0)"
                    }}
                >
                    <h2 className={"HeadingTitle"} style={{ color: "var(--mantine-color-grayColor-0)" }}>Бонусный счет</h2>
                </div>
                <div className="papercard" style={{ gap: "20px" }}>
                    <div className={`tab-content`} style={{ display: "block", paddingTop: "0px", animation: "none" }}>
                        {listStatistic}
                    </div>
                    {/* <Divider mt={10}></Divider> */}

                    <Button
                        fullWidth
                        color="sberGreenColor.9"
                        onClick={() => setIsOpened(!isOpened)}
                        variant="outline"
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}>
                            <span style={{
                                maxWidth: isOpened ? '0px' : '200px',
                                opacity: isOpened ? 0 : 1,
                                overflow: 'hidden',
                                transition: 'all 0.3s ease-in-out',
                                whiteSpace: 'nowrap'
                            }}>
                                Как получить бонусы?
                            </span>
                            <ArrowDropDown width="18px" height="18px" style={{
                                transform: isOpened ? 'rotate(0deg)' : 'rotate(-90deg)',
                                transition: 'transform 0.3s ease-in-out'
                            }} />
                        </div>
                    </Button>

                    {/* <Button fullWidth color="sberGreenColor.9"
                        onClick={() => setIsOpened(!isOpened)}
                        // disabled={isRedacted}
                        variant={"outline"}
                    >
                        Как получить бонусы?
                    </Button> */}
                </div>
            </div>

            <div className={styles.banner} style={{
                transform: `translateY(${isOpened ? '0%' : '-120%'})`,
                transition: 'all 0.4s ease', // Добавляем плавную анимацию
                opacity: isOpened ? 1 : 0,
                position: isOpened ? 'relative' : 'absolute'
            }}>
                <div className="papercard" style={{ gap: "20px" }}>
                    <h3 className="HeadingStyle3">Как начисляются бонусы?</h3>

                    Бонусы начисляются за активности на сайте: оформление бронирований, отзывы и другие плюшки
                </div>
            </div>
        </div>
    )
}