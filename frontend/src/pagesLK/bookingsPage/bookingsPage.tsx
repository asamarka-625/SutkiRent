
// import LogoSVG from "../../../icons/logo.svg?react"
import { Button, Divider, Flex, TextInput, Loader } from "@mantine/core";
import styles from "./bookingsPage.module.css";
import { useMediaQuery } from "@mantine/hooks";
import { useState, useEffect } from "react";
import { BookingCard } from "../../components/cards/bookingLkCard/bookingsCard";
import { FilterBlock } from "./filter/filter";


export function BookingsPage() {

    const [hotelData, setHotelData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const isMobile = useMediaQuery('(max-width: 48em)');
    const isMD = useMediaQuery('(max-width: 74em)');
    const [isRedacted, setIsRedacted] = useState(false);

    useEffect(() => {
        let isMounted = true;
        
        const loadBookings = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    if (isMounted) setLoading(false);
                    return;
                }

                console.log('[Bookings] Fetching from /api/bookings/my/');
                const response = await fetch('/api/bookings/my/', {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                });

                console.log('[Bookings] Response status:', response.status);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('[Bookings] Response data:', data);
                    
                    if (isMounted && data.success && data.bookings) {
                        // Преобразуем данные бронирований в формат для BookingCard
                        const bookings = data.bookings.map((booking: any) => ({
                            id: booking.object.id,
                            booking_id: booking.booking_id,
                            short_name: booking.object.short_name,
                            cost: booking.object.cost || booking.total_cost || 0,
                            type: null,
                            amount_rooms: booking.object.amount_rooms || 0,
                            sleeps: `${booking.guests} гостей`,
                            floor: booking.object.floor || 0,
                            capacity: booking.object.capacity || booking.guests,
                            region: null,
                            city: '',
                            banner: { id: booking.status === 'confirmed' ? '2' : '1', name: booking.status_display },
                            space: booking.object.space || 0,
                            address: booking.object.address || '',
                            near_metro: [],
                            media: booking.object.media || { source_type: '', url: '' },
                            refreshList: () => {},
                            IsDatesSet: true,
                            highlightedId: null,
                        }));
                        console.log('[Bookings] Processed bookings:', bookings);
                        console.log('[Bookings] Setting hotelData with', bookings.length, 'items');
                        setHotelData(bookings);
                    }
                } else {
                    console.error('[Bookings] Failed to load:', response.status);
                }
            } catch (error) {
                console.error('[Bookings] Error:', error);
            } finally {
                if (isMounted) {
                    console.log('[Bookings] Setting loading to false');
                    setLoading(false);
                }
            }
        };

        loadBookings();
        
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="paperdivLK">
            <div style={{ display: isMD ? "block" : "flex", width: "100%", gap: "16px" }}>
                <div className={styles.leftSection}>
                <FilterBlock opened={true}></FilterBlock>
                </div>

                <div className="papercardLK" style={{ width: "100%" }}>

                    <div className="paperHeaderLK"
                        style={{
                        }}
                    >
                        <h3 className={"HeadingTitle"}>Мои бронирования</h3>
                    </div>
                    {/* <Divider></Divider> */}
                    <div className="papercard">
                        {loading ? (
                            <Loader />
                        ) : hotelData.length === 0 ? (
                            'У вас пока нет бронирований'
                        ) : (
                            hotelData.map(booking => (
                                <BookingCard key={booking.id} {...booking} />
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}