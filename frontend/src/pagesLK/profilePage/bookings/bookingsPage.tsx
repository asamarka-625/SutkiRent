
// import LogoSVG from "../../../icons/logo.svg?react"
import { Button, Divider, Flex, TextInput, Loader } from "@mantine/core";
import styles from "./bookingsPage.module.css";
import { useMediaQuery } from "@mantine/hooks";
import { useState, useEffect } from "react";
import { ProfileButton } from "../../../components/buttons/profileButton/profileButton";
import { BookingCard } from "../../../components/cards/bookingLkCard/bookingsCard";
import { useNavigate } from "react-router-dom";


export function BookingsBlock() {
    const [hotelData, setHotelData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width: 48em)');
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
                
                const response = await fetch('/api/bookings/my/', {
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (isMounted && data.success && data.bookings) {
                        // Берем только последние 3 бронирования
                        const recentBookings = data.bookings.slice(0, 3).map((booking: any) => ({
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
                        setHotelData(recentBookings);
                    }
                }
            } catch (error) {
                console.error('[BookingsBlock] Error:', error);
            } finally {
                if (isMounted) {
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
        <div className="papercardLK">

            <div className="paperHeaderLK">
                <h3 className="HeadingStyle3">Последние бронирования</h3>
            </div>
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
    )
}