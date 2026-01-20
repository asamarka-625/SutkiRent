import { Button, Text, Group, Select, Divider, NumberInput, SimpleGrid, Modal, Skeleton, Loader } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import styles from "./favePage.module.css";
import { useNavigate, useSearchParams } from 'react-router-dom';

import { saveCurrentUrl } from '../../handlers/urlSaveHandler.ts'
import '@mantine/dates/styles.css';
import { useDisclosure, useMediaQuery } from "@mantine/hooks";

import { SearchPageCard } from "../SearchPage/searchPageCard/searchPageCard.tsx";

import YMap from "../../components/map/YMapOnSearch.tsx";

import { showFavorites } from "../../services/cookiesServices.ts";
import { getFavoriteObjects } from "../../services/objectsServices.ts";
import { showNotification } from "@mantine/notifications";
import { errorHandler } from "../../handlers/errorBasicHandler.ts";
import { IconX } from "@tabler/icons-react";
import { apiKey } from "../../globalSettings.ts";

type FavoriteItem = {
    id: number;
    dateIn?: string | undefined;
    dateOut?: string | undefined;
}

interface Banner {
    id: string;
    name: string;
}

type Object = {
    pk: number;
    short_name: string;
    cost: number;
    type: string | null;
    amount_rooms: number;
    sleeps: string;
    floor: number;
    capacity: number;
    region: string | null;
    city: string;
    banner: Banner | null;
    space: number;
    address: string;
    near_metro: []; // или MetroStation[], если есть тип для станций метро
    media: {
        source_type: string; // или union тип, если возможны другие варианты
        url: string;
    };
};

interface Filters {
    id: number,
    name: string
}

interface Point {
    id: number;
    coordinates: [number, number];
    // cost: string;
    media: {
        source_type: string; // или union тип, если возможны другие варианты
        url: string;
    };
    space: number;
    amount_rooms: number;
    address: string;
    floor: number;
    short_name: string;
    cost: number;
    type: string | null;
    sleeps: string;
    capacity: number;
    region: string | null;
    city: string;
    banner: Banner | null;
    near_metro: [];
}
// цена тип 
// сколько комнат, метры кв, этажи, гости
// метро рядом
// адрес
function transformObjectsToPoints(originalArray: any[]): any[] {
    if (!Array.isArray(originalArray)) return [];
    return originalArray.map(obj => ({
        id: obj.pk,
        coordinates: [obj.latitude, obj.longitude],
        cost: obj.cost ? `${obj.cost.toLocaleString('ru-RU')}` : 'Цена не указана',
        media: obj.media || null,
        space: obj.space || null,
        amount_rooms: obj.amount_rooms || null,
        address: obj.address || null,
        floor: obj.floor || null,
        short_name: obj.short_name || null,
        near_metro: obj.near_metro || null,
        capacity: obj.capacity || null
    }));
}

function transformObjects(originalArray: any[]): any[] {
    if (!Array.isArray(originalArray)) return [];
    return originalArray.map(obj => ({
        id: obj.pk,
        coordinates: [obj.latitude, obj.longitude],
        cost: obj.cost ? `${obj.cost.toLocaleString('ru-RU')}` : 'Цена не указана',
        media: obj.media || null,
        space: obj.space || null,
        amount_rooms: obj.amount_rooms || null,
        address: obj.address || null,
        floor: obj.floor || null,
        short_name: obj.short_name || null,
        near_metro: obj.near_metro || null,
        capacity: obj.capacity || null
    }));
}


export function FavePage() {

    // МОДУЛЬ ПАГИНАЦИИ

    const [highlightedId, setHighlightedId] = useState<number | null>(null);
    const [visibleObjects, setVisibleObjects] = useState<Point[]>([
    ]);
    const [favorites, setFavorites] = useState([]);
    const [points, setPoints] = useState<Point[]>([]);

    const isSM = useMediaQuery('(min-width: 30em) and (max-width: 48em)');
    const isXS = useMediaQuery('(max-width: 30em)');


    const [IsDatesSet, setIsDatesSet] = useState(false)
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const extractIds = (arr: FavoriteItem[]): number[] => Array.isArray(arr) ? arr.map(({ id }) => id) : [];

    // Обработка клика с деструктуризацией
    const handleClick = (id: number, arr: { id: number; dateIn?: string; dateOut?: string }[]): { dateIn: string | null; dateOut: string | null; hasDates: boolean } => {
        const obj = arr.find(item => item.id === id);
        const dateIn = obj?.dateIn ?? null;
        const dateOut = obj?.dateOut ?? null;
        return { dateIn, dateOut, hasDates: !!(dateIn && dateOut) };
    };


    const handleNavigateToObject = (id: number) => {
        // handleFormSave()
        // const newParams = new URLSearchParams();
        // Сохраняем только нужные параметры
        // if (searchParams.has('in_start')) {
        //     newParams.set('in_start', searchParams.get('in_start')!);
        // }
        // if (searchParams.has('in_end')) {
        //     newParams.set('in_end', searchParams.get('in_end')!);
        // }
        // Переходим на страницу объекта с сохранением нужных параметров
        const result = handleClick(id, favorites);
        saveCurrentUrl()
        navigate(`/object/${id}?in_start=${result.dateIn || ''}&in_end=${result.dateOut || ''}`);
        window.scrollTo(0, 0)
    };

    async function getObjectsDataFunc() {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            // Если пользователь авторизован, используем API напрямую
            if (token) {
                try {
                    const response = await fetch('/api/favorites/my/', {
                        headers: {
                            'Authorization': `Token ${token}`,
                        },
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('[FavoritesPage] API Response:', data);
                        
                        if (data.success && data.favorites && data.favorites.length > 0) {
                            // Преобразуем данные из API в формат для отображения
                            const favoritesList = data.favorites.map((fav: any) => ({
                                id: fav.object_id,
                                dateIn: fav.date_in || undefined,
                                dateOut: fav.date_out || undefined,
                            }));
                            setFavorites(favoritesList);
                            
                            // Преобразуем объекты из API в формат для отображения
                            const transformed = data.favorites.map((fav: any) => {
                                const obj = fav.object;
                                return {
                                    id: obj.id,
                                    short_name: obj.short_name || '',
                                    cost: obj.cost || 0,
                                    type: null,
                                    amount_rooms: obj.amount_rooms || 0,
                                    sleeps: `${obj.capacity || 0} гостей`,
                                    floor: obj.floor || 0,
                                    capacity: obj.capacity || 0,
                                    region: null,
                                    city: '',
                                    banner: null,
                                    space: obj.space || 0,
                                    address: obj.address || '',
                                    near_metro: [],
                                    media: obj.media || { source_type: '', url: '' },
                                    refreshList: () => handleNavigateToObject(obj.id),
                                    IsDatesSet: !!(fav.date_in && fav.date_out),
                                    highlightedId: null,
                                };
                            });
                            
                            // Преобразуем объекты для карты (нужны coordinates)
                            const pointsForMap = data.favorites.map((fav: any) => {
                                const obj = fav.object;
                                return {
                                    id: obj.id,
                                    coordinates: obj.latitude && obj.longitude ? [obj.latitude, obj.longitude] : [0, 0],
                                    cost: obj.cost || 0,
                                    short_name: obj.short_name || '',
                                    address: obj.address || '',
                                    amount_rooms: obj.amount_rooms || 0,
                                    floor: obj.floor || 0,
                                    space: obj.space || 0,
                                    capacity: obj.capacity || 0,
                                    media: obj.media || { source_type: '', url: '' },
                                    type: null,
                                    sleeps: `${obj.capacity || 0} гостей`,
                                    region: null,
                                    city: '',
                                    banner: null,
                                    near_metro: [],
                                };
                            }).filter((point: any) => point.coordinates[0] !== 0 || point.coordinates[1] !== 0); // Фильтруем объекты без координат
                            
                            console.log('[FavoritesPage] Transformed objects:', transformed);
                            console.log('[FavoritesPage] Points for map:', pointsForMap);
                            setVisibleObjects(transformed);
                            setPoints(pointsForMap);
                            setIsLoading(false);
                            return;
                        } else {
                            // Нет избранного
                            setFavorites([]);
                            setVisibleObjects([]);
                            setPoints([]);
                            setIsLoading(false);
                            return;
                        }
                    }
                } catch (error) {
                    console.error('[FavoritesPage] Error loading from API:', error);
                }
            }
            
            // Fallback для неавторизованных пользователей или если API не сработал
            const favorites = await showFavorites()
            setFavorites(favorites)
            const allIds = favorites ? extractIds(favorites) : [];
            console.log('[FavoritesPage] Favorites (fallback):', favorites);
            console.log('[FavoritesPage] IDs:', allIds);
            
            // Если нет избранного, просто очищаем список
            if (!allIds || allIds.length === 0) {
                setVisibleObjects([]);
                setPoints([]);
                setIsLoading(false);
                return;
            }
            
            const response = await getFavoriteObjects(allIds)

            if (response.ok) {
                const responseData = await response.json();
                const data = Array.isArray(responseData) ? responseData : (responseData.results || []);

                if (data.length === 0) {
                    setPoints([])
                    setVisibleObjects([])
                    return;
                }
                else {
                    setVisibleObjects(transformObjectsToPoints(data));
                    setPoints(transformObjectsToPoints(data));
                    console.log('[FavoritesPage] Transformed objects (fallback):', transformObjectsToPoints(data))
                }
            }
            else {
                setVisibleObjects([])
                setPoints([])
                const error = await response.json();
                console.error('[FavoritesPage] Error loading objects:', error);
                if (errorHandler(response.status) == 5) {
                    showNotification({
                        title: "Ошибка сервера, обновите страницу",
                        message: error.statusText,
                        icon: <IconX />
                    })
                }
            }
        } catch (error) {
            console.error('[FavoritesPage] Error in getObjectsDataFunc:', error);
            setVisibleObjects([]);
            setPoints([]);
        } finally {
            setIsLoading(false);
        }
    }

    const isMobile = useMediaQuery('(max-width: 64em)');


    useEffect(() => {
        getObjectsDataFunc();
        
        // Слушаем изменения localStorage для обновления списка избранного
        const handleStorageChange = () => {
            getObjectsDataFunc();
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        // Также слушаем кастомное событие для обновления в той же вкладке
        window.addEventListener('favoritesUpdated', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('favoritesUpdated', handleStorageChange);
        };
    }, []);

    const [opened, { toggle }] = useDisclosure();
    // const [openedModalFilter, { open: openFilter, close: closeFilter }] = useDisclosure(false);
    const [openedModalMap, { open: openMap, close: closeMap }] = useDisclosure(false);
    return (
        <div className={styles.pageLayoutLarge}>
            <div style={{ backgroundColor: "var(--mantine-color-grayColor-0" }}>

                <Modal opened={openedModalMap} onClose={closeMap} centered withCloseButton={false}
                    overlayProps={{
                        color: '#000',
                        opacity: 0.8,
                        blur: 2,
                    }}
                    styles={{
                        body: {
                            // width: "100%",
                            padding: 0,
                        },
                        content: {
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                        },
                    }}>
                    <div className={styles["closeButton"]} onClick={closeMap}>
                        &times;
                    </div>
                    <div
                        // src="https://avatars.mds.yandex.net/i?id=83de784b29b05799c637ba0ebf86c5b8246c8b01-13196350-images-thumbs&n=13"
                        style={{
                            width: '100vw',
                            height: '80vh',
                            display: 'block',
                            objectFit: "contain"
                        }}
                    >
                        <YMap
                            highlightedObjectId={highlightedId}
                            sethighlightedObjectId={setHighlightedId}
                            refreshList={handleNavigateToObject}
                            points={points}
                            // center={[55.751574, 37.573856]}
                            zoom={12}
                            apiKey={apiKey}
                            visibleObj={setVisibleObjects} />
                    </div>
                </Modal>


                <div className={styles[`pageLayout`]}>

                    <div className="papercard" style={{
                        maxWidth: "100%"
                    }}>
                        <Group className="" mb={10} hiddenFrom="md">
                            <Button color="var(--mantine-color-sberGreenColor-9)"
                                // hiddenFrom="md"
                                variant="outline"
                                onClick={() => {
                                    toggle(); openMap()
                                    // handleFormSave();
                                    // console.log(objectFilterForm.getValues())
                                }}
                                fullWidth
                            >
                                Показать на карте
                            </Button>
                        </Group>
                        <div style={{ display: isMobile ? "block" : "flex", justifyContent: "space-between" }}>
                            <div className={styles.title} style={{ marginBottom: "2px" }}>
                                Избранное
                                {/* {isLoading && <Loader ml="30" size="xs" />} */}
                            </div>
                            <Group className="" mt={10} visibleFrom="md">
                                {/* <Skeleton animate height={"150px"}></Skeleton> */}
                                {/* <Button color="var(--mantine-color-sberGreenColor-9)"
                                    hiddenFrom="md"
                                    variant="outline"
                                    onClick={() => {
                                        toggle(); openMap()
                                        // handleFormSave();
                                        // console.log(objectFilterForm.getValues())
                                    }}
                                >
                                    Показать на карте
                                </Button> */}
                            </Group>


                        </div>
                        {/* БАЗА */}
                        <SimpleGrid className="papercard" style={{
                            justifyItems: "center",
                            display: isSM ? 'none' : 'block',
                            minHeight: isXS ? '100vh' : ''
                        }}>

                            {/* <div>d</div>
                            <div>r</div>
                            <div>dftgh</div>
                            <div>dfss</div> */}
                            {visibleObjects.length == 0 && !isLoading ? <Text>У вас пока нет избранных объектов</Text> :
                                (Array.isArray(visibleObjects) ? visibleObjects : []).map(visibleObjects => <div style={{ width: "100%" }}
                                    // key={visibleObjects.id}
                                    onMouseEnter={() => setHighlightedId(visibleObjects.id)} // вызываем при наведении
                                    onMouseLeave={() => setHighlightedId(null)} // сбрасываем при уходе
                                >
                                    <SearchPageCard
                                        highlightedId={highlightedId}
                                        {...visibleObjects}
                                        refreshList={() => handleNavigateToObject(visibleObjects.id)}
                                        IsDatesSet={IsDatesSet} />
                                </div>

                                )}

                            {isLoading ? <div style={{ width: "100%" }}>
                                <Skeleton mt={10} radius={20} animate height={"250px"} width={"100%"}></Skeleton>
                                <Skeleton mt={10} radius={20} animate height={"250px"} width={"100%"}></Skeleton>
                                <Skeleton mt={10} radius={20} animate height={"250px"} width={"100%"}></Skeleton>
                            </div> : <div></div>}


                        </SimpleGrid>

                        <div className="papercard" style={{
                            justifyItems: "center",
                            display: isSM ? 'grid' : 'none',
                            gridTemplateColumns: isXS ? "1fr" : "1fr 1fr",
                            minHeight: isSM ? '100vh' : ''

                        }}>

                            {visibleObjects.length == 0 && !isLoading ? <Text>У вас пока нет избранных объектов</Text> :
                                (Array.isArray(visibleObjects) ? visibleObjects : []).map(visibleObjects => <SearchPageCard
                                    {...visibleObjects}
                                    refreshList={() => handleNavigateToObject(visibleObjects.id)}
                                    IsDatesSet={IsDatesSet} />

                                )}
                            {isLoading ? <div style={{ width: "100%" }}>
                                <Skeleton mt={10} radius={20} animate height={"250px"} width={"100%"}></Skeleton>
                                <Skeleton mt={10} radius={20} animate height={"250px"} width={"100%"}></Skeleton>
                                <Skeleton mt={10} radius={20} animate height={"250px"} width={"100%"}></Skeleton>
                            </div> : <div></div>}

                        </div>


                        {/* <Button mt={10} onClick={() => navigate("/object/create")}>Создать объект недвижимости</Button> */}
                    </div>

                </div>

            </div>
            <div style={{ width: "100%", height: "100%", display: isMobile ? "none" : '' }}>
                <div style={{ objectFit: "fill", maxWidth: "100%", minWidth: "400px", height: "100vh", position: "sticky", top: "10px" }}
                // src="https://avatars.mds.yandex.net/i?id=83de784b29b05799c637ba0ebf86c5b8246c8b01-13196350-images-thumbs&n=13"></img>
                >
                    <YMap
                        highlightedObjectId={highlightedId}
                        sethighlightedObjectId={setHighlightedId}
                        refreshList={handleNavigateToObject}
                        points={points}
                        // center={[55.751574, 37.573856]}
                        zoom={12}
                        apiKey={apiKey}
                        visibleObj={setVisibleObjects} />

                </div>

            </div>
        </div>
    )


}