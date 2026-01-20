
// import LogoSVG from "../../../icons/logo.svg?react"
import { Button, Divider, Flex, Group, TextInput } from "@mantine/core";
import styles from "./bonusHistoryBlock.module.css";
import { useMediaQuery } from "@mantine/hooks";
import { useState, useEffect } from "react";
import { ProfileButton } from "../../../components/buttons/profileButton/profileButton";
import { BookingCard } from "../../../components/cards/bookingLkCard/bookingsCard";
import { useNavigate } from "react-router-dom";

interface BonusTransaction {
    id: number;
    type: string;
    type_display: string;
    amount: string;
    description: string;
    balance_after: string;
    created_at: string;
    booking_id?: number;
}

export function BonusHistoryBlock() {
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width: 48em)');
    const [isRedacted, setIsRedacted] = useState(false);
    const [transactions, setTransactions] = useState<BonusTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBonusHistory();
    }, []);

    async function loadBonusHistory() {
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
                if (data.success && data.transactions) {
                    setTransactions(data.transactions);
                }
            }
        } catch (error) {
            console.error('Error loading bonus history:', error);
        } finally {
            setLoading(false);
        }
    }

    function formatDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
            return dateString;
        }
    }

    const statistic = transactions.map((item) => ({
        id: item.id.toString(),
        name: item.description,
        amount: item.amount,
        date: formatDate(item.created_at),
        type: item.type
    }));

    const listStatistic = statistic.length > 0 ? statistic.map((item) => {
        const isAccrual = item.type === 'accrual' || item.type === 'admin_accrual';
        const sign = isAccrual ? '+' : '-';
        return (
            <div key={item.id} className={styles.bulletItem}
                style={{ margin: 0, boxShadow: "none" }}>

                <div className={styles.bulletContent} style={{}}>

                    <p style={{ textAlign: "end", color: "var(--mantine-color-grayColor-5)", position: "absolute", top: 0, right: 0}}>{item.date}</p>
                    <div style={{display: "flex", flexDirection: "column", paddingTop: isMobile ? '20px' : '11px'}}>
                        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: "0px" }}>
                            <p style={{ fontSize: "20px", margin: "0px 5px 0px", lineHeight: "normal", color: "var(--mantine-color-sberGreenColor-9)" }}>{sign}{item.amount}</p>
                            <div style={{ color: "var(--mantine-color-sberGreenColor-9)" }}>бонусов</div>
                        </div>
                        <p style={{ textAlign: "start", fontWeight: 600 }}>{item.name}</p>
                    </div>
                </div>
            </div>
        );
    }) : (
        <div style={{ padding: "20px", textAlign: "center", color: "var(--mantine-color-grayColor-6)" }}>
            {loading ? "Загрузка..." : "История транзакций пуста"}
        </div>
    );

    return (
        <div className="papercardLK">
            <div className="paperHeaderLK"
                style={{
                }}
            >
                <h3 className="HeadingStyle3">История начислений</h3>
                <Button className={styles.more} size="compact-md" variant="white"
                    color="sberGreenColor.9"
                    // onClick={() => navigate('/lk/bookings')}
                    >Посмотреть все</Button>

            </div>
            {/* <Divider></Divider> */}

            <div className={`papercard`} style={{ display: "block", paddingTop: "0px", animation: "none" }}>
                <div className={styles.invList}>
                    {listStatistic}
                </div>
            </div>
        </div>
    )
}