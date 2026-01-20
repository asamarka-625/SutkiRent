
// import LogoSVG from "../../../icons/logo.svg?react"
import styles from "./statisticsPage.module.css";
import { useState, useEffect } from "react";



export function StatisticsPage() {
    const [bookingsCount, setBookingsCount] = useState("0");
    const [favoritesCount, setFavoritesCount] = useState("0");
    
    useEffect(() => {
        const loadCounts = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                // Загружаем количество бронирований
                const bookingsResponse = await fetch('/api/bookings/my/', {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                });
                
                if (bookingsResponse.ok) {
                    const bookingsData = await bookingsResponse.json();
                    if (bookingsData.success && bookingsData.bookings) {
                        setBookingsCount(bookingsData.bookings.length.toString());
                    }
                }
                
                // Загружаем количество избранного
                const favoritesResponse = await fetch('/api/favorites/my/', {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                });
                
                if (favoritesResponse.ok) {
                    const favoritesData = await favoritesResponse.json();
                    if (favoritesData.success && favoritesData.favorites) {
                        setFavoritesCount(favoritesData.favorites.length.toString());
                    }
                }
            } catch (error) {
                console.error('[Statistics] Error loading counts:', error);
            }
        };
        
        loadCounts();
    }, []);
    
    // Пока нет реальных данных по активности, показываем нули
    const statistic = [
        { id: "1", name: "Бронирований", amount: bookingsCount },
        { id: "2", name: "Избранное", amount: favoritesCount },
        { id: "3", name: "Бонусов", amount: "0" },
        { id: "4", name: "Отзывов", amount: "0" },
    ];

    const listStatistic = statistic.map((item) => (
            <li key={item.id} className="bullet-item" data-area={`${item.id}`} 
            style={{margin: 0, boxShadow: "none"}}>
                {/* <div className="bullet-number"></div> */}
                <div className="bullet-content" style={{ }}>
                    <p style={{}}>{item.name[0].toUpperCase() + item.name.slice(1)}</p>
                    <h3 style={{fontSize: "22px"}}>{item.amount}</h3>
                </div>
            </li>
        ));
    return (
        <div className="papercardLK">

            <div className="paperHeaderLK"
                style={{
                }}
            >
                <h3 className="HeadingStyle3">Моя активность</h3>
            </div>
            {/* <Divider></Divider> */}
            {/* <div className="papercard"> */}
            {/* <div className={styles.pageLayout}> */}
            <div className={`tab-content`} style={{display: "block", paddingTop: "0px", animation: "none"}}>
                <ul className={styles.pageLayout}>
                    {listStatistic}
                </ul>
            </div>

            {/* </div> */}
            {/* </div> */}
            {/* <div className={styles.fave}></div>
                    <div className={styles.achieve}></div>
                    <div className={styles.reviews}></div> */}
        </div>
    )
}