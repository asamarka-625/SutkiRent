import { Divider } from "@mantine/core";
import { useEffect, useState } from "react";
import styles from "./objectPage.module.css";
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { showNotification } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
// import EmblaCarousel from './EmblaCarousel'



import '@mantine/dates/styles.css';
import { useMediaQuery } from "@mantine/hooks";

// import { SearchPageCard } from "./searchPageCard/searchPageCard.tsx";
import { ObjectPageCard } from "./objectPageCard/objectPageCard.tsx";
import { BookMenu } from "../../components/menus/bookMenu/bookMenu.tsx";
import { getObjectCostByDate, getObjectDataById } from "../../services/objectsServices.ts";
import { errorHandler } from "../../handlers/errorBasicHandler.ts";
import { ArticlesLandingPage } from "../LandingPage/articlesLanding/articlesLanding.tsx";
import { EventsPage } from "../InfoPages/eventsPage/eventsPage.tsx";


interface NearMetro {
    name: string;
}

interface MediaItem {
    source_type: string;
    url: string;
}

interface Property {
    pk: number;
    short_name: string;
    cost: number;
    type: number;
    amount_rooms: number;
    floor: number;
    sleeps: string;
    capacity: number;
    region: null | string;
    city: string;
    banner: null | string;
    space: number;
    address: string;
    description: string;
    conditions_accommodation: string;
    contacts: string;
    finding_description: string;
    helpful_info: string;
    parking_info: string;
    object_inventories: any[]; // Replace 'any' with more specific type if possible
    services: any[]; // Replace 'any' with more specific type if possible
    near_metro: NearMetro[];
    all_media: MediaItem[];
    latitude: number,
    longitude: number,
}


export function ObjectPage() {
    const { id } = useParams();
    const isSM = useMediaQuery('(max-width: 48em)');
    const isXS = useMediaQuery('(max-width: 30em)');
    const [searchParams, setSearchParams] = useSearchParams();
    // const [cityData, setСityData] = useState(['Санкт-Петербург', 'Москва', 'Воронеж', 'Тверь'])
    // const [categoryData, setCategoryData] = useState(['Гостиница', 'Квартира', 'Студия'])

    // const cityData = ['Санкт-Петербург', 'Москва', 'Воронеж', 'Тверь']
    // const categoryData = ['Гостиница', 'Квартира', 'Студия']

    const navigate = useNavigate()
    const [objects, setObjects] = useState<Property>(
        {
            pk: 206230,
            short_name: "г. Санкт-Петербург, Старорусская 5/3",
            cost: 35000,
            type: 1,
            amount_rooms: 5,
            floor: 6,
            sleeps: "2+2+2+2+2",
            capacity: 10,
            region: null,
            city: "Санкт-Петербург",
            banner: null,
            space: 125,
            address: "Старорусская 5/3",
            description: "<p>Прекрасная 5-ти комнатная квартира в центре города...</p>",
            conditions_accommodation: "",
            contacts: "",
            finding_description: "",
            helpful_info: "",
            parking_info: "",
            object_inventories: [],
            services: [],
            near_metro: [
                { name: "Адмиралтейское" },
                { name: "Маяковская" }
            ],
            all_media: [
            ],
            latitude: 0,
            longitude: 0,
        }

    )

    async function getObjectsDataFunc() {
        // alert(sessionStorage.getItem('filterState'))
        // alert(objectFilterForm.getValues().category + objectFilterForm.getValues().guest)
        const response = await getObjectDataById(id || '')
        if (response.ok) {
            const data = await response.json();
            setObjects(data)
        }
        else {
            const error = await response.json();
            if (errorHandler(response.status) == 5) {
                showNotification({
                    title: "Ошибка сервера, обновите страницу",
                    message: error.statusText,
                    icon: <IconX />
                })
            }
        }

    }


    async function getObjectsCost() {
        const today = new Date()
        const tomorrow = new Date()
        const formattedDateToday = today.toISOString().split('T')[0];
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formattedDateTomo = tomorrow.toISOString().split('T')[0];

        const response = await getObjectCostByDate(id || '', formattedDateToday, formattedDateTomo)
        if (response.ok) {
            const data = await response.json();
            setObjects(prev => ({
                ...prev,
                cost: data.price.details.amount // новое значение
            }));
            // setObjects(data)
        }
        else {
            // setObjects([])
            const error = await response.json();
            if (errorHandler(response.status) == 5) {
                showNotification({
                    title: "Ошибка сервера, обновите страницу",
                    message: error.statusText,
                    icon: <IconX />
                })
            }
        }
    }




    useEffect(() => {
        window.scrollTo(0, 0);
        getObjectsDataFunc()
        // getObjectsCost()
    }, [])

    // const [opened, { toggle }] = useDisclosure();


    return (
        <div className="paperdiv">
            <div className={styles[`pageLayout`]}>
                {/* БАЗА */}
                <ObjectPageCard {...objects} />

                <div><BookMenu cost={objects.cost} capacity={objects.capacity}></BookMenu></div>

                {/* <div className={styles["navbar"]}
                ><SearchMenu opened={opened} catagoryData={categoryData}></SearchMenu></div> */}

            </div>
            <Divider mt={20} size={"md"} color="sutkiGreenColor.4"></Divider>
            <EventsPage></EventsPage>
            <h2 className="HeadingStyle2" style={{marginTop: 16}}>Может быть интересно</h2>
            <ArticlesLandingPage />

        </div>
    )


}
