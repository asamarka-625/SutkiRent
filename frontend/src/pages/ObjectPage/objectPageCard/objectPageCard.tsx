import { Divider, Group, Accordion, Spoiler } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import styles from './objectPageCard.module.css'
import React, { useEffect, useRef, useState } from "react";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Carousel } from '@mantine/carousel';
import ContactPhone from "../../../icons/contact_phone.svg?react";
import { getRegionNameById, getTypeNameById } from "../../../services/getEverything.ts";
import type { EmblaOptionsType } from 'embla-carousel';
// import { YandexMap } from "../../../components/map/YandexMap.tsx";
import EmblaCarousel from "../../../components/caurousel/caorusel.tsx";
import { navigateBack } from '../../../handlers/urlSaveHandler.ts'
import DOMPurify from 'dompurify';
import { declineRoomWord, declineSleepsWord } from "../../../handlers/pravopisanieHandler.ts";
import { ImageWithFallback } from "../../../components/image/ImageWithFallback.tsx";
import { YandexMap } from "../../../components/map/YandexMapWithMetro.tsx";
import { LikeButtonHeader } from "../../../components/buttons/likeButton/likeButtonHeader.tsx";

// import { useHistory } from "react-router-dom";


interface InventoryItem {
    id: number;
    name: string;
}

interface Inventory {
    inventory: InventoryItem;
    totalAmount: number;
}

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
    latitude: number;
    longitude: number;
}

export function ObjectPageCard(props: Property) {
    const OPTIONS: EmblaOptionsType = {}
    const navigate = useNavigate()
    const isMobile = useMediaQuery('(max-width: 48em)');
    const SLIDE_COUNT = 10
    // const SLIDES = Array.from(Array(SLIDE_COUNT).keys())
    const urls = (Array.isArray(props.all_media) ? props.all_media : []).map((media: MediaItem) => media.url);
    const SLIDES = urls

    const [opened, { open, close }] = useDisclosure(false);
    const [selectedImage, setSelectedImage] = React.useState('');
    const handleImageClick = (url) => {
        setSelectedImage(url.url);
        open();
    };

    // function openTab(tabName: string, event: Event): void {
    //     // Убеждаемся, что event.currentTarget является HTMLButtonElement
    //     const currentTarget = event.currentTarget as HTMLButtonElement;

    //     document.querySelectorAll('.tab-content').forEach(tab => {
    //         tab.classList.add('hidden');
    //     });

    //     document.querySelectorAll('.tab-button').forEach(button => {
    //         button.classList.remove('border-blue-500', 'text-blue-500');
    //         button.classList.add('border-transparent', 'text-gray-600', 'hover:border-gray-300', 'hover:text-gray-800');
    //     });

    //     const tabElement = document.getElementById(tabName);
    //     if (tabElement) {
    //         tabElement.classList.remove('hidden');
    //     }

    //     currentTarget.classList.remove('border-transparent', 'text-gray-600');
    //     currentTarget.classList.add('border-blue-500', 'text-blue-500');
    // }

    // function toggleDetails(): void {
    //     const detailsContent = document.getElementById('details-content');
    //     const toggleIcon = document.getElementById('toggle-icon');

    //     if (!detailsContent || !toggleIcon) return;

    //     if (detailsContent.classList.contains('hidden')) {
    //         detailsContent.classList.remove('hidden');
    //         toggleIcon.classList.remove('fa-chevron-down');
    //         toggleIcon.classList.add('fa-chevron-up');
    //     } else {
    //         detailsContent.classList.add('hidden');
    //         toggleIcon.classList.remove('fa-chevron-up');
    //         toggleIcon.classList.add('fa-chevron-down');
    //     }
    // }


    const [activeTab, setActiveTab] = useState('amenities');

    const contentRef = useRef<HTMLDivElement>(null);
    const [typeName, setTypeName] = useState('')
    const [regionName, setRegionName] = useState('')

    const [inventory, setInventory] = useState<Inventory[]>([
        // {
        //     "inventory": { "id": 1, "name": "" },
        //     "totalAmount": 0
        // },
        // {
        //     "inventory": { "id": 2, "name": "" },
        //     "totalAmount": 0
        // }
    ])

    // const [props, setprops] = useState<ObjectType>(

    const [showAll, setShowAll] = useState(false);
    const additionsList = props.description || '';
    const visibleAdditionsList = showAll ? additionsList : additionsList.slice(0, 300);

    // const SLIDES = [1, 2, 3]

    const slides = (Array.isArray(props.all_media) ? props.all_media : []).map((url) => (
        <Carousel.Slide key={url.url}
            onClick={() => handleImageClick(url)}
            style={{ cursor: 'pointer' }}>
            <img src={url.url} className={styles["carouselImages"]} />
        </Carousel.Slide>
    ));

    const servicesList = (Array.isArray(props.services) ? props.services : []).map((item) => (
        <li key={item.id} className="bullet-item">
            <div className="bullet-number"></div>
            <div className="bullet-content">
                <h3>{item.name}</h3>
            </div>
        </li>
    ));

    const services2List = (Array.isArray(props.services) ? props.services : []).map((item) => (
        <li>
            {item.icon && <ImageWithFallback src={item.icon} alt="" fallbackSrc="/src/icons/Knob_Start.svg" className={styles.serviceIcon} />}
            {item.name[0].toUpperCase() + item.name.slice(1)}
        </li>
    ));


    const inventoryList = (Array.isArray(props.object_inventories) ? props.object_inventories : [])
        // Сначала группируем по id инвентаря
        .reduce((acc, current) => {
            const existing = acc.find(item => item.inventory.id === current.inventory.id);
            if (existing) {
                existing.totalAmount += current.amount;
            } else {
                acc.push({
                    ...current,
                    totalAmount: current.amount
                });
            }
            return acc;
        }, [])
        // Затем преобразуем в JSX
        .map((item) => (
            <li key={item.inventory.id} className="bullet-item">
                {/* <div className="bullet-number"></div> */}
                <div className="bullet-content" style={{ padding: "10px" }}>
                    <p style={{color: "var(--mantine-color-grayColor-9)"}}>{item.inventory.name[0].toUpperCase() + item.inventory.name.slice(1)}</p>
                    <p>В количестве: {item.totalAmount}</p>
                </div>
            </li>
        ));


    async function displayType() {
        const regionId = props.type;
        let regionName: string = await getTypeNameById(regionId?.toString() || '');
        setTypeName(regionName)
    }

    async function displayRegion() {
        const regionId = props.region;
        let regionName: string = await getRegionNameById(regionId?.toString() || '');
        setRegionName(regionName)
        // console.log(regionName)
    }

    // var browserHistory = ReactRouter.browserHistory;
    // let history = useHistory();
    const handleGoBack = (event) => {
        console.log("ТЕЛЕПЛРТАЦИЯ")
        navigateBack(navigate) // Передаем navigate для SPA-навигации без перезагрузки
        // navigate(-1);
        // setHasNavigated(true);
        // this.props.history.goB
        // history.goBack()
        // if (window.history.state?.idx > 0) {
        //     window.history.back() // Возврат, если есть история
        // } else {
        //     navigate('/'); // Или переход на дефолтную страницу
        // }
    };
    const mapRef = useRef<HTMLDivElement>(null);

    const scrollToMap = (e: React.MouseEvent) => {
        e.preventDefault();
        if (mapRef.current) {
            mapRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const [hasNavigated, setHasNavigated] = useState(false);

    useEffect(() => {
        displayType()
        displayRegion()
        // getInventoryDataFunc()
    }, [props]);


    return (
        <div className={styles[`pageLayout`]} >
            <div className="papercard" style={{ position: 'relative' }}>
                <a className={styles[`backToSearch`]} onClick={handleGoBack}>Назад</a>
                <Group style={{ position: 'relative', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <h2 className="HeadingStyle2" style={{ flex: 1 }}>{props.short_name}</h2>
                    <LikeButtonHeader id={props.pk} />
                </Group>
                <Group pl={"var(--mantine-font-size-sm)"}>
                    {/* <Badge color="sutkiGreenColor.4" mt={1}>9.0 {props.id}</Badge> */}
                    <div>{props.address}</div>
                    <a className={styles[`showOnMap`]} onClick={scrollToMap}>Показать на карте</a>
                </Group>
            </div>
            <Divider mt={10} mb={20}></Divider>
            {/* <div className="papercard"> */}
            <div style={{ width: '900px', margin: '0 auto', maxWidth: '100%', paddingTop: "20px" }}>
                <EmblaCarousel slides={SLIDES} options={OPTIONS} />
            </div>

            {/* <div className="papercard">
                <div style={{ width: '600px', margin: '0 auto', maxWidth: '100%' }}>

                    <Carousel height={!isMobile ? 400 : 300}
                        slideSize={!isMobile ? "600px" : "300px"}
                        slideGap={0}
                        align="start"
                        styles={{
                            root: {
                                maxWidth: '600px',
                            },
                            viewport: {
                                maxWidth: '600px',
                            },
                            // изменять расстояние между стрелками здесь
                            controls: {
                                ...(!isMobile && {
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: 'calc(100% + 100px)',
                                    left: '-50px',
                                    right: '-34px',
                                })
                            },
                            control: {
                                backgroundColor: 'rgba(255,255,255,0.8)',
                                color: '#333',
                                border: '1px solid #ddd',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                },
                                '&[data-inactive]': {
                                    opacity: 0,
                                    cursor: 'default',
                                },
                            },
                            indicator: {
                                bottom: '-30px',
                            },
                        }}
                    >{slides}</Carousel>
                    <Modal opened={opened} onClose={close} size="auto" centered withCloseButton={false}
                        overlayProps={{
                            color: '#000',
                            opacity: 0.8,
                            blur: 2,
                        }}
                        styles={{
                            body: {
                                padding: 0,
                            },
                            content: {
                                backgroundColor: 'transparent',
                                boxShadow: 'none',
                            },
                        }}>
                        <div className={styles["closeButton"]} onClick={close}>
                            &times;
                        </div>
                        <img
                            src={selectedImage}
                            style={{
                                maxWidth: '80vw',
                                maxHeight: '80vh',
                                display: 'block',
                                objectFit: "contain"
                            }}
                        />
                    </Modal>
                </div>

            </div> */}
            <Divider mt={10}></Divider>
            {/* <ImageGallery {...props}></ImageGallery> */}



            <div className="papercard">
                <div className={styles["papercardItem"]}>

                    <div style={{
                        // maxWidth: '56rem',
                        margin: '0 auto',
                        // padding: '1.5rem',
                        // backgroundColor: 'white',
                        borderRadius: '0.5rem',
                        // boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        // marginTop: '1.5rem'
                    }}>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            marginBottom: '1rem'
                        }}>Информация об объекте</h2>

                        {/* Основные характеристики */}
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: '#e5e7eb',
                                color: '#1f2937',
                                borderRadius: '9999px',
                                padding: '0.5rem 1rem'
                            }}>
                                <i className="fas fa-home" style={{ marginRight: '0.5rem', color: '#4b5563' }}></i>
                                {props.space}м²
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: '#e5e7eb',
                                color: '#1f2937',
                                borderRadius: '9999px',
                                padding: '0.5rem 1rem'
                            }}>
                                <i className="fas fa-door-open" style={{ marginRight: '0.5rem', color: '#4b5563' }}></i>
                                {props.amount_rooms} {declineRoomWord(props.amount_rooms)}
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: '#e5e7eb',
                                color: '#1f2937',
                                borderRadius: '9999px',
                                padding: '0.5rem 1rem'
                            }}>
                                <i className="fas fa-bed" style={{ marginRight: '0.5rem', color: '#4b5563' }}></i>
                                {props.sleeps} {declineSleepsWord(props.sleeps)}
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: '#e5e7eb',
                                color: '#1f2937',
                                borderRadius: '9999px',
                                padding: '0.5rem 1rem'
                            }}>
                                <i className="fas fa-building" style={{ marginRight: '0.5rem', color: '#4b5563' }}></i>
                                {props.floor} этаж
                            </div>
                            {/* Остальные характеристики аналогично */}
                        </div>

                        {/* Информация из "Дополнительно" */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ color: '#4b5563' }}>
                                <i className="fas fa-info-circle" style={{ marginRight: '0.5rem', color: '#4b5563' }}></i>

                                <Spoiler
                                    hideLabel={"Скрыть"}
                                    showLabel={"Показать все"}
                                    expanded={showAll}
                                    maxHeight={90}
                                    classNames={{
                                        control: styles.descShowMore,
                                    }}
                                    onExpandedChange={() => { setShowAll(!showAll) }}>
                                    <div className={contentRef?.current ? contentRef.current.scrollHeight > 90 ? showAll ? styles.expanded : styles.collapsed : styles.expanded : styles.expanded}
                                        ref={contentRef}
                                        dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(additionsList) + "<p></p>"
                                        }}></div>
                                </Spoiler>


                                {/* <div onClick={() => setShowAll(!showAll)} className={styles["descShowMore"]}>
                                    {additionsList.length > 300 && (
                                        showAll ? 'Скрыть' : `Показать все`
                                    )}
                                </div> */}
                            </p>
                        </div>

                        {/* Вкладки */}
                        <div className="tabs-container">
                            <div className="tabs">
                                {/* Вкладки */}
                                <button
                                    className={`tab-label ${activeTab === 'amenities' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('amenities')}
                                >
                                    Удобства
                                </button>

                                <button
                                    className={`tab-label ${activeTab === 'rules' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('rules')}
                                >
                                    Правила
                                </button>

                                <button
                                    className={`tab-label ${activeTab === 'inventory' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('inventory')}
                                >
                                    Инвентарь
                                </button>

                                {/* Контент */}
                                <div className={`tab-content ${activeTab === 'amenities' ? 'active' : ''}`} id="amenities-content">
                                    <ul className="amenities-list">
                                        {props.services.length != 0 ? services2List : "Дополнительных услуг нет"}
                                    </ul>
                                </div>

                                <div className={`tab-content ${activeTab === 'rules' ? 'active' : ''}`} id="rules-content">
                                    <div>{props.conditions_accommodation ? <div
                                        dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(props.conditions_accommodation) + "<p></p>"
                                        }}></div> : "Условий для заселения нет."}</div>
                                </div>

                                <div className={`tab-content ${activeTab === 'inventory' ? 'active' : ''}`} id="inv-content">
                                    <ul className="inv-list">
                                        {props.object_inventories.length != 0 ? inventoryList : "Инвентарь не перечислен"}
                                    </ul>
                                </div>
                            </div>
                        </div>


                        {/* <button
                            style={{
                                marginTop: '1rem',
                                color: '#3b82f6',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            onClick={(e) => toggleDetails()}
                        >
                            <i id="toggle-icon" className="fas fa-chevron-down" style={{ marginRight: '0.5rem', color: '#4b5563' }}></i> Подробнее
                        </button>

                        <div id="details-content" style={{
                            display: 'none',
                            marginTop: '1rem',
                            padding: '1rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '0.5rem'
                        }}>
                        
                        </div> */}
                    </div>


                </div>
            </div>

            <Divider mt={10}></Divider>

            {/* Все скрывающиеся элементы здесь */}
            <Accordion styles={{
                content: {
                    padding: 0 // Убираем padding у содержимого
                },
                item: {
                    borderBottom: 'none' // Убираем нижнюю границу
                }
            }}>

                <div className="papercard" style={{ paddingBottom: 5, paddingTop: 5 }}>
                    <div className={styles["papercardItem"]}>
                        <div className="mantine-hidden-from-sm">
                            {/* <Divider mt={10} mb={18}></Divider> */}
                            <h3 className={styles["HeadingStyle3"]} style={{ marginBottom: "10px" }}>Услуги</h3>
                            <ul className="amenities-list">
                                {services2List || "Дополнительных услуг нет"}
                                {/* <li><i className="fas fa-tv"></i>Телевизор</li>
                                        <li><i className="fas fa-wifi"></i> Wi-Fi</li>
                                        <li><i className="fas fa-soap"></i> Стиральная машина</li>
                                        <li><i className="fas fa-utensils"></i> Кухня</li> */}
                            </ul>
                            {/* <Divider mt={10}></Divider> */}
                        </div>
                    </div>
                    <Divider mt={10} hiddenFrom="sm"></Divider>
                    <div className={styles["papercardItem"]}>
                        <Accordion.Item value="adittions">
                            <Accordion.Control className={styles["accordion"]}>
                                <h3 className={styles["HeadingStyle3"]}>Подробнее</h3>
                            </Accordion.Control>
                            <Accordion.Panel>
                                <Divider mb={18} mt={10}></Divider>

                                <h3 className={styles["HeadingStyle3"]}>Полезная информация</h3>

                                <div className={styles["desc"]}>
                                    <div>{props.helpful_info ? <div
                                        dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(props.helpful_info) + "<p></p>"
                                        }}></div> : "Дополнительной информации нет."}</div>
                                </ div>

                                <div style={{display: !isMobile ? 'none' : 'inherit' }}>
                                    <h3 className={styles["HeadingStyle3"]} style={{ marginTop: "10px" }}>Условия заселения:</h3>
                                    <div className={styles["desc"]}>
                                        <div>{props.conditions_accommodation ? <div
                                            dangerouslySetInnerHTML={{
                                                __html: DOMPurify.sanitize(props.conditions_accommodation) + "<p></p>"
                                            }}></div> : "Условий для заселения нет."}</div>
                                    </ div>
                                </div>
                                    <h3 className={styles["HeadingStyle3"]} style={{ marginTop: "10px" }}>Как найти?</h3>

                                    <div className={styles["desc"]}>
                                        <div>{props.finding_description ? <div
                                            dangerouslySetInnerHTML={{
                                                __html: DOMPurify.sanitize(props.finding_description) + "<p></p>"
                                            }}></div> : "Инструкций нет."}</div>
                                    </div>

                                    <h3 className={styles["HeadingStyle3"]} style={{ marginTop: "10px" }}>Информация по парковке</h3>
                                    <div className={styles["desc"]}>
                                        <div>{props.parking_info ? <div
                                            dangerouslySetInnerHTML={{
                                                __html: DOMPurify.sanitize(props.parking_info) + "<p></p>"
                                            }}></div> : "Информации нет."}</div>
                                    </div>


                                    {/* {props.services.length != 0 ?
                                    <div className="bullet-list-container">
                                        <ul className="cool-bullet-list">
                                            {servicesList}
                                        </ul>
                                    </div>
                                    : "Услуг нет."
                                } */}

                            </Accordion.Panel>
                        </Accordion.Item>
                    </div>
                    <Divider mt={10} hiddenFrom="sm"></Divider>
                    <div className={styles["papercardItem"]}>
                        <Accordion.Item value="mobileservice" hiddenFrom="sm">
                            <Accordion.Control className={styles["accordion"]}>
                                <h3 className={styles["HeadingStyle3"]}>Инвентарь</h3>
                            </Accordion.Control>
                            <Accordion.Panel>
                                {props.object_inventories.length != 0 ? <Divider mb={18} mt={10}></Divider> : ""}

                                <div>
                                    <ul className="inv-list">
                                        {props.object_inventories.length != 0 ? inventoryList : "Инвентарь не перечислен"}
                                        {/* <li><i className="fas fa-tv"></i>Телевизор</li>
                                        <li><i className="fas fa-wifi"></i> Wi-Fi</li>
                                        <li><i className="fas fa-soap"></i> Стиральная машина</li>
                                        <li><i className="fas fa-utensils"></i> Кухня</li> */}
                                    </ul>
                                </div>

                                {/* {props.services.length != 0 ?
                                    <div className="bullet-list-container">
                                        <ul className="cool-bullet-list">
                                            {servicesList}
                                        </ul>
                                    </div>
                                    : "Услуг нет."
                                } */}

                            </Accordion.Panel>
                        </Accordion.Item>
                    </div>
                </div>

            </Accordion>
            <Divider mt={10}></Divider>
            <div className="papercard"
                id="map"
                ref={mapRef}
            >
                <div className={styles["papercardItem"]}>
                    <Group>
                        <h3 className={styles["HeadingStyle3"]} style={{marginBottom: "15px"}}>{props.address}, {regionName}</h3>
                    </Group>
                    <YandexMap
                        // lat={55.751574} lon={37.573856} 
                        lat={props.latitude} lon={props.longitude}
                    />

                    {/* <StaticYandexMap address={props.address}></StaticYandexMap> */}

                    {/* <Group className={styles[`characteristics`]} gap={3}>
                        <div>{regionName}</div>
                    </Group> */}

                </div>
            </div>

            <Divider mt={10}></Divider>

            <div className="papercard">
                <div className={styles["papercardItem"]}>
                    <Group gap={26}>
                        <ContactPhone width="35" height="35"></ContactPhone>
                        <h3 className={styles["HeadingStyle3"]}>Контакты</h3>
                        <div>{props.contacts ? <div
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(props.contacts) + "<p></p>"
                            }}></div> : "Без обратной связи"}</div>
                    </Group>
                </div>
            </div>
            <Divider mt={10}></Divider>

        </div>

    );
}


// {/* <div className={styles[`carddiv`]} style={{
//     ...(isMobile && { gridRow: 2 })
// }}>
//     <Flex
//         className={styles[`cardDescription`]}
//         direction={"column"}>

//         <div className={styles[``]}>Sutki Rent отель в центре {props.id}</div>
//         {/* <h3 className="HeadingStyle3">{props.short_name}</h3> */}
//         <Group className={styles[`characteristics`]} gap={3}>
//             {/* <div>{props.amount_rooms} комнат • </div> */}
//             <div>18 м2 • </div>
//             {/* <Divider orientation="vertical" /> */}
//             {/* <div>{props.floor} этаж • </div> */}
//             {/* <Divider orientation="vertical" /> */}
//             <div>2 гостя</div>
//             {/* <Divider orientation="vertical" /> */}
//         </Group>
//         <div className={styles[`location`]}>
//             <div className={styles[``]}>Близко к метро</div>
//             <div className={styles[``]}>
//                 <Flex gap={"xs"} align={"center"}>
//                     {/* <LocationSVG width="15" height="15" /> */}
//                     {/* <div style={{ marginBottom: 1 }}>{props.address}</div> */}
//                 </Flex>
//             </div>
//         </div>
//         <Badge color="sutkiGreenColor.4" mt={10}>9.0</Badge>
//         {/* <Button mt={10}
//                         visibleFrom="xl"
//                         className="searchButton"
//                         color="var(--mantine-color-sberGreenColor-9)"
//                         onClick={() => navigate("/object/" + props.id)}
//                     >
//                         Забронировать
//                     </Button> */}
//     </Flex>
// </div>



// <div className={styles[`costLayout`]} style={{
//     ...(isMobile && {
//         gridRow: 3,
//         width: '100%',
//         // paddingTop: 'var(--mantine-spacing-sm)',
//     }),
// }}>

//     <Flex className="HeadingStyleCostSmall" gap={5} align="center" justify={"center"} >
//         <span>от</span>
//         {/* <h3>{props.cost} ₽</h3> */}
//         <span>сутки</span>
//     </Flex>
//     <Button
//         m={10}
//         color="var(--mantine-color-sberGreenColor-9)"
//         onClick={() => navigate("/object/" + props.id)}
//     >
//         Забронировать
//     </Button>
// </div> */}