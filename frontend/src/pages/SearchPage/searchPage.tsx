import { DoubleDateRangePickerMobile } from "../../components/buttons/dataRange/dateRange_mobile.tsx";
import { GuestPickerMobile } from "../../components/buttons/guestButton/guestButton_mobile.tsx";
import { Button, Text, Group, Select, Divider, NumberInput, SimpleGrid, Modal, Skeleton, Loader, CloseButton } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import styles from "./searchPage.module.css";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { showNotification } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
// import { useWatch } from 'react-hook-form';

import { saveCurrentUrl } from '../../handlers/urlSaveHandler.ts'
import '@mantine/dates/styles.css';
import { useDisclosure, useMediaQuery } from "@mantine/hooks";

import { SearchMenu } from "../../components/menus/searchMenu/searchMenu.tsx";
import { SearchPageCard } from "./searchPageCard/searchPageCard.tsx";
import { getObjectsData, getObjectsDataParallel } from "../../services/objectsServices.ts";
import { errorHandler } from "../../handlers/errorBasicHandler.ts";
import { getFiltersFromBackData, getRegionsData, getTypeData } from "../../services/getEverything.ts";
import { DoubleDateRangePicker } from "../../components/buttons/dateRange_copy.tsx";
import YMap from "../../components/map/YMapOnSearch.tsx";
import { GuestPicker } from "../../components/buttons/guestButton/guestButton.tsx";
import { apiKey } from "../../globalSettings.ts";



interface Banner {
    id: string;
    name: string;
}

// type Object = {
//     id: number;
//     title: string;
//     cost: number;
//     type: string | null;
//     amount_rooms: number;
//     sleeps: string;
//     floor: number;
//     capacity: number;
//     region: string | null;
//     city: string;
//     banner: Banner | null;
//     space: number;
//     address: string;
//     near_metro: []; // или MetroStation[], если есть тип для станций метро
//     media: {
//         source_type: string; // или union тип, если возможны другие варианты
//         url: string;
//     };
// };

interface Filters {
    id: number,
    name: string
}

interface Point {
    id: number;
    coordinates: [number, number];
    // cost: string;
    media: [];
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
        id: obj.id,
        coordinates: [obj.latitude, obj.longitude],
        cost: obj.cost ? `${obj.cost.toLocaleString('ru-RU')}` : obj.price,
        media: { source_type: '', url: obj?.media[0] },
        space: obj.space || null,
        amount_rooms: obj.rooms || null,
        address: obj.address || null,
        floor: obj.floor || null,
        short_name: obj.title || null,
        near_metro: obj.metro || null,
        capacity: obj.capacity || null,
        sleeps: obj.sleeps || null
    }));
}

// function transformObjects(originalArray: any[]): any[] {
//     if (!Array.isArray(originalArray)) return [];
//     return originalArray.map(obj => ({
//         id: obj.pk,
//         coordinates: [obj.latitude, obj.longitude],
//         cost: obj.cost ? `${obj.cost.toLocaleString('ru-RU')}` : 'Цена не указана',
//         media: obj.media || null,
//         space: obj.space || null,
//         amount_rooms: obj.amount_rooms || null,
//         address: obj.address || null,
//         floor: obj.floor || null,
//         short_name: obj.short_name || null,
//         near_metro: obj.near_metro || null,
//         capacity: obj.capacity || null
//     }));
// }

const createRange = (minValue, maxValue) => {
    const hasMin = minValue !== undefined && minValue !== '';
    const hasMax = maxValue !== undefined && maxValue !== '';

    if (!hasMin && !hasMax) return null;

    const range = {};
    if (hasMin) range.min = Number(minValue);
    if (hasMax) range.max = Number(maxValue);

    return range;
};

export function SearchPage() {

    // МОДУЛЬ ПАГИНАЦИИ


    const pageRef = useRef<number>(1);
    const lastPage = useRef<number>(1);
    const abrupt = useRef<boolean>(false);
    const countAll = useRef<number>(0);
    const loadMoreRef = useRef<boolean>(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [highlightedId, setHighlightedId] = useState<number | null>(null);
    const [visibleObjects, setVisibleObjects] = useState<Point[]>([]);
    const [allObjects, setAllObjects] = useState<Point[]>([]); // Все объекты для клиентской пагинации


    const [searchParams, setSearchParams] = useSearchParams();
    const [points, setPoints] = useState<Point[]>([]);

    const [IsDatesSet, setIsDatesSet] = useState(false)
    const isSM = useMediaQuery('(min-width: 30em) and (max-width: 48em)');
    const isXS = useMediaQuery('(max-width: 30em)');

    // const newCity = { id: -1, name: "Все регионы" };
    // const newCategory = { id: -1, name: "Все категории" };
    const [cityData, setСityData] = useState<Filters[]>([])
    const [filtersSearch, setFiltersSearch] = useState()

    const cityDataRem = (Array.isArray(cityData) ? cityData : []).map(item => ({
        value: item.id?.toString(), // Select обычно ожидает string
        label: item.title,
    }));
    const [categoryData, setCategoryData] = useState<Filters[]>([])
    const categoryDataRem = (Array.isArray(categoryData) ? categoryData : []).map(item => ({
        value: item.id?.toString(), // Select обычно ожидает string
        label: item.name,
    }));


    const selectInputRef = useRef<HTMLInputElement>();
    const dateInputRef = useRef<HTMLInputElement>();
    const guestInputRef = useRef<HTMLInputElement>();
    // const cityData = ['Санкт-Петербург', 'Москва', 'Воронеж', 'Тверь']
    // const categoryData = ['Гостиница', 'Квартира', 'Студия']

    const navigate = useNavigate();
    const isLoading = useRef<boolean>(false);;
    const [datein, setDatein] = useState<Date | null>(() => {
        const tomorrow = new Date();
        return tomorrow;
    });
    const [dateout, setDateout] = useState<Date | null>(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    });

    const [objects, setObjects] = useState([

    ])

    const objectFilterForm = useForm({
        mode: 'controlled',
        initialValues: {
            region: '',
            category: '',
            in: [null, null] as [Date | null, Date | null],
            // datein,
            out:
                '',
            // dateout,
            guest: [1, 1] as [number, number],
            kids: []
        },
        validate: {
        },
        // onValuesChange: (values, previousValues) => {
        //     if (!previousValues) return;

        //     if (values.guest !== previousValues.guest || values.out !== previousValues.out) {
        //         getObjectsCalendar();
        //     }
        // }
    });


    const getSideParamsFromURL = (searchParams: URLSearchParams) => {
        if (!searchParams) return {};
        // Обработка массивов
        const arrayFields = ['service', 'category', 'near_metros', 'inRoom', 'availability', 'dopService', 'view', 'toilet'];
        const arrayParams: Record<string, string[]> = {};

        // Получаем все параметры как entries [key, value][]
        const paramsEntries = searchParams ? Array.from(searchParams?.entries()) : [];

        arrayFields.forEach(field => {
            // Ищем запись с нужным ключом
            const paramEntry = paramsEntries.find(([key]) => key === field);
            if (paramEntry) {
                arrayParams[field] = paramEntry[1].split(',');
            }
        });

        // Обработка числовых значений
        const numberFields = [
            'amount_rooms_min', 'amount_rooms_max',
            'amount_sleeps_min', 'amount_sleeps_max',
            'floor_start', 'floor_finish',
            'space_min', 'space_max',
            'cost_min', 'cost_max'
        ];
        const numberParams: Record<string, number> = {};

        numberFields.forEach(field => {
            const param = searchParams.get(field);
            if (param) {
                numberParams[field] = Number(param);
            }
        });

        // Обработка строковых значений
        // const stringParams: Record<string, string> = {};
        // const stringFields = ['view', 'toilet'];

        // stringFields.forEach(field => {
        //     const param = searchParams.get(field);
        //     if (param) {
        //         stringParams[field] = param;
        //     }
        // });

        return {
            ...arrayParams,
            ...numberParams,
            // ...stringParams
        };
    };

    async function getObjectsDataFunc(searchParamsInFunc: URLSearchParams, abruptCancel = false) {
        // setIsLoading(true);

        if (!isLoading.current) {
            if (loadMoreRef.current) {
                setIsLoadingMore(true);
                console.log('Загружается больше, Страница ' + pageRef.current)
                isLoading.current = true;
            } else {
                // setPage(1);
                isLoading.current = true;
                console.log('Обычная загрузка страницы ' + pageRef.current)
            }
            const params = getSideParamsFromURL(searchParamsInFunc) || [];

            const inDate1 = objectFilterForm.getValues().in[0];
            const inDate2 = objectFilterForm.getValues().in[1];
            const rooms = objectFilterForm.getValues().guest[1];

            if (inDate1 && inDate2) setIsDatesSet(true); else setIsDatesSet(false);

            // Когда указаны даты, backend возвращает все доступные объекты за раз
            // Используем клиентскую пагинацию для показа по 20 объектов
            const hasDates = inDate1 && inDate2;
            // if (hasDates && loadMore) {
            //     // Клиентская пагинация: показываем следующие 20 из allObjects
            //     const currentLength = visibleObjects.length;
            //     const nextBatch = allObjects.slice(currentLength, currentLength + 20);

            //     if (nextBatch.length > 0) {
            //         setVisibleObjects(prev => [...prev, ...nextBatch]);
            //         setPoints(prev => [...prev, ...nextBatch]);
            //         setHasMore(currentLength + nextBatch.length < allObjects.length);
            //     } else {
            //         setHasMore(false);
            //     }
            //     setIsLoadingMore(false);
            //     return;
            // }

            console.log('🚀 идет запуск запроса (backend делает параллельную загрузку)...')
            // console.log('ДЕТИ')
            // console.log(objectFilterForm.getValues().kids)

            const objectsParams = {
                page: pageRef.current,

                // adults - проверяем, существует ли значение
                ...(objectFilterForm.getValues().guest?.[0] && {
                    adults: Number(objectFilterForm.getValues().guest[0])
                }),

                // children - добавляем только если есть значение больше 0
                ...(objectFilterForm.getValues().kids && {
                    children: objectFilterForm.getValues().kids
                }),

                ...(objectFilterForm.getValues().region && {
                    region_id: objectFilterForm.getValues().region
                    // region_id: 1
                }),

                // start_date - добавляем только если inDate1 существует
                ...(inDate1 && {
                    start_date: new Intl.DateTimeFormat('fr-CA', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }).format(inDate1)
                }),

                // end_date - добавляем только если inDate2 существует
                ...(inDate2 && {
                    end_date: new Intl.DateTimeFormat('fr-CA', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }).format(inDate2)
                }),

                ...(params.category && {
                    type_apartment: params.category
                }),
                ...(params.near_metros && {
                    metro: params.near_metros
                }),
                ...(params.view && {
                    windows: params.view
                }),
                ...(params.toilet && {
                    bathrooms: params.toilet
                }),
                ...(params.inRoom && {
                    items: params.inRoom
                }),

                ...(() => {
                    const priceRange = createRange(params.cost_min, params.cost_max);
                    const sleepRange = createRange(params.amount_sleeps_min, params.amount_sleeps_max);
                    const areaRange = createRange(params.space_min, params.space_max);
                    const roomRange = createRange(rooms, params.amount_rooms_max);
                    const floorRange = createRange(params.floor_start, params.floor_finish);

                    const result = {};
                    if (priceRange) result.price = priceRange;
                    if (sleepRange) result.sleep = sleepRange;
                    if (areaRange) result.area = areaRange;
                    if (roomRange) result.room = roomRange;
                    if (floorRange) result.floor = floorRange;

                    return result;
                })()

            };

            const response = await getObjectsData(objectsParams)

            if (response.ok) {
                const responseData = await response.json();
                const data = responseData.apartments || [];
                countAll.current += responseData.count;
                loadMoreRef.current = responseData.next_page || false;

                console.log(data);

                if (data.length === 0 || abrupt.current === true && abruptCancel === false) {
                    setPoints([])
                    lastPage.current = pageRef.current;
                    setIsLoadingMore(false);
                    setHasMore(false);
                    isLoading.current = false;
                    pageRef.current = 1;
                    return;
                }

                const filteredData = data;
                // Сортируем: сначала элементы с banner != null, затем остальные
                const sortedData = [...filteredData].sort((a, b) => {
                    const hasBannerA = a.banner != null ? 1 : 0;
                    const hasBannerB = b.banner != null ? 1 : 0;
                    return hasBannerB - hasBannerA; // Сортируем по убыванию (1 сначала, потом 0)
                });

                const transformedData = transformObjectsToPoints(sortedData);

                // Для запросов с датами backend возвращает ШТУКИ ПО RC-страницам; пока показываем как есть
                console.log(loadMoreRef.current)
                // Для запросов БЕЗ дат - используем серверную пагинацию page=N
                if (loadMoreRef.current) {
                    isLoading.current = false;
                    console.log('loadMore triggered')
                    // догружаем следующую страницу и добавляем к списку
                    const nextBatch = transformedData;
                    if (nextBatch.length > 0 && !abrupt.current) {
                        setVisibleObjects(prev => [...prev, ...nextBatch]);
                        setPoints(prev => [...prev, ...nextBatch]);
                        setHasMore(nextBatch.length === 10);
                        pageRef.current = pageRef.current + 1;
                        getObjectsDataFunc(searchParams)
                    } else if (abrupt.current) {
                        setVisibleObjects(nextBatch);
                        setPoints(nextBatch);
                        pageRef.current = pageRef.current + 1;
                        getObjectsDataFunc(searchParams)
                    }

                } else {
                    // первая страница
                    console.log('ПОСЛЕДНЯЯ СТРАНИЦА' + loadMoreRef.current)
                    setVisibleObjects(prev => [...prev, ...transformedData]);
                    setPoints(prev => [...prev, ...transformedData]);
                    setHasMore(false);
                    pageRef.current = 1;
                }

                if (abrupt.current) {
                    abrupt.current = false;
                }

                isLoading.current = false;
                setIsLoadingMore(false);

            } else {
                setHasMore(false);
                setVisibleObjects([])
                const error = await response.json();
                if (errorHandler(response.status) == 5) {
                    showNotification({
                        title: "Ошибка сервера, обновите страницу",
                        message: error.statusText,
                        // icon: <IconX />
                    })
                }
            }
            isLoading.current = false;

        }

    }

    const isMobile = useMediaQuery('(max-width: 64em)');
    const handleFilterChange = () => {
        const newParams = new URLSearchParams(searchParams);
        const formValues = objectFilterForm.values;

        if (formValues.region) newParams.set('region', formValues.region);
        else newParams.delete('region');
        // if (formValues.category) newParams.set('category', formValues.category);
        if (formValues.in[0]) newParams.set('in_start', formValues.in[0].toISOString());
        else newParams.delete('in_start');
        if (formValues.in[1]) newParams.set('in_end', formValues.in[1].toISOString());
        else newParams.delete('in_end');
        // if (formValues.out) newParams.set('out', formValues.out);
        // alert(formValues.guest[0].toString())
        if (formValues.guest) {
            newParams.set('guest', formValues.guest[0].toString());
            newParams.set('amount_rooms_min', formValues.guest[1]?.toString() || "1");
        }
        else newParams.delete('guest');

        if (formValues.kids?.length) newParams.set('children', JSON.stringify(formValues.kids));
        else newParams.delete('children');

        Array.from(newParams.entries()).forEach(([key, value]) => {
            if (!value || value === '') newParams.delete(key);
        });
        setSearchParams(newParams, { replace: true });
        // if (value) {
        //   newParams.set(name, value);
        // } else {
        //   newParams.delete(name);
        // }
        // setSearchParams(newParams);
    };

    // let abortController: AbortController | null = null;

    const handleFormSave = () => {
        closeFilter()
        handleFilterChange()
        setVisibleObjects([])
        setPoints([])
        //("tg tg")
        // setPage(1);

        pageRef.current = 1;
        console.log('handleFormSave страница' + pageRef.current)

        setHasMore(true);
        console.log('ЕСть больше' + hasMore)

        isLoading.current = false;
        abrupt.current = true;
        countAll.current = 0;
        getObjectsDataFunc(searchParams, true);

        // const formState = objectFilterForm.values
        // const { in: _, out: __, ...filteredValues } = formState
        // sessionStorage.setItem('mainPageState', JSON.stringify(filteredValues));
    };

    //Избавляюсь от дат и загружаю все в сессион сторадж перед нажатием на любой объект
    const handleNavigateToObject = (id: number) => {
        // Сохраняем состояние поиска перед переходом
        sessionStorage.setItem('searchState', JSON.stringify({
            visibleObjects: visibleObjects,
            scrollPosition: window.scrollY,
            page: pageRef.current,
            hasMore: hasMore
        }));

        // handleFormSave()
        const newParams = new URLSearchParams();
        // Сохраняем только нужные параметры
        if (searchParams.has('in_start')) {
            newParams.set('in_start', searchParams.get('in_start')!);
        }
        if (searchParams.has('in_end')) {
            newParams.set('in_end', searchParams.get('in_end')!);
        }
        // Переходим на страницу объекта с сохранением нужных параметров
        saveCurrentUrl()
        navigate(`/object/${id}?${newParams.toString()}`);
        // navigate(`/object/${id}`);
        // window.scrollTo(0, 0)
    };

    async function getFiltersData() {

        const regions = await getRegionsData()



        if (regions.ok) {
            const data = await regions.json();
            setСityData(Array.isArray(data) ? data : (data.results || []))
        }
        else {
            setСityData([])
            const error = await regions.json();
            if (errorHandler(regions.status) == 5) {
                showNotification({
                    title: "Ошибка сервера, обновите страницу",
                    message: error.statusText,
                    icon: <IconX />
                })
            }
        }

        // if (type.ok) {
        //     const data = await type.json();
        //     setCategoryData(Array.isArray(data) ? data : (data.results || []))
        // }
        // else {
        //     setCategoryData([])
        //     const error = await type.json();
        //     if (errorHandler(type.status) == 5) {
        //         showNotification({
        //             title: "Ошибка сервера, обновите страницу",
        //             message: error.statusText,
        //             icon: <IconX />
        //         })
        //     }
        // }

    }

    async function getFiltersSearchData(regionId: string) {

        const regions = await getFiltersFromBackData(regionId)

        if (regions.ok) {
            console.log('rfrlt;fptmsk')
            console.log(regions)
            setFiltersSearch(regions)
        }
        else {
            setFiltersSearch(null)
            const error = await regions.json();
            if (errorHandler(regions.status) == 5) {
                showNotification({
                    title: "Ошибка сервера, обновите страницу",
                    message: error.statusText,
                    icon: <IconX />
                })
            }
        }
    }

    const inputs = useRef<HTMLInputElement[]>([]);

    // Add input to ref array
    const addToRefs = (el: HTMLInputElement | null, index: number) => {
        if (el) inputs.current[index] = el;
    };

    // Handle blur event
    const handleBlur = (index: number) => {
        if (inputs.current[index + 1]) {
            inputs.current[index + 1].focus();
        }
    };

    //  useEffect(() => {
    //         const originalConsoleError = console.error;

    //         console.error = (...args) => {
    //             if (args.some(arg => typeof arg === 'string' && arg.includes('Yandex Maps API'))) {
    //                 return; // Игнорируем ошибки Яндекс Карт
    //             }
    //             originalConsoleError(...args);
    //         };

    //         return () => {
    //             console.error = originalConsoleError;
    //         };
    //     }, []);


    //При загрузке страницы
    useEffect(() => {
        getFiltersData()
        let kidsFromParams: { age: string | number }[] = [];
        const childrenParam = searchParams.get('children');

        if (childrenParam) {
            try {
                kidsFromParams = JSON.parse(childrenParam);

                // Проверяем, что это массив и имеет правильную структуру
                if (!Array.isArray(kidsFromParams)) {
                    kidsFromParams = [];
                } else {
                    // Нормализуем данные: убеждаемся, что каждый элемент имеет поле age
                    kidsFromParams = kidsFromParams.filter(kid =>
                        kid && typeof kid === 'object' && 'age' in kid
                    );
                }
            } catch (error) {
                console.error('Error parsing children from URL:', error);
                kidsFromParams = [];
            }
        }

        objectFilterForm.setValues({
            region: searchParams.get('region') || '',
            // category: searchParams.get('category') || '',
            in: [
                searchParams.get('in_start') ? new Date(searchParams.get('in_start')!) : null,
                searchParams.get('in_end') ? new Date(searchParams.get('in_end')!) : null,
            ],
            // out: searchParams.get('out') || '',
            guest: [Number(searchParams.get('guest')) || '1', Number(searchParams.get('amount_rooms_min')) || '1'],
            kids: kidsFromParams
        });

        console.log('KIDS' + objectFilterForm.values.kids)

        // Проверяем, есть ли сохраненное состояние поиска
        const savedState = sessionStorage.getItem('searchState');
        if (savedState) {
            try {
                const { visibleObjects: savedObjects, scrollPosition, page, hasMore: savedHasMore } = JSON.parse(savedState);

                // Восстанавливаем состояние
                setVisibleObjects(savedObjects);
                setPoints(savedObjects);
                pageRef.current = page;
                setHasMore(savedHasMore);
                isLoading.current = false;

                // Восстанавливаем позицию скролла после рендера
                setTimeout(() => {
                    window.scrollTo(0, scrollPosition);
                }, 100);

                // Очищаем сохраненное состояние
                sessionStorage.removeItem('searchState');
            } catch (e) {
                console.error('Ошибка восстановления состояния:', e);
                // Если ошибка - загружаем данные обычным способом
                pageRef.current = 1;
                setHasMore(true);
                getObjectsDataFunc(searchParams);
            }
        } else {
            // Нет сохраненного состояния - загружаем данные обычным способом
            pageRef.current = 1;
            setHasMore(true);
            getObjectsDataFunc(searchParams);
        }
    }, []);

    useEffect(() => {
        // const handleScroll = () => {
        //     if (
        //         !(window.innerHeight + document.documentElement.scrollTop >=
        //             document.documentElement.offsetHeight - (window.innerHeight * 2)) ||
        //         isLoadingMore ||
        //         !hasMore
        //     ) {
        //         return;
        //     }
        //     // Загружаем следующую страницу
        //     console.log('handleScroll' + pageRef.current)
        //     getObjectsDataFunc(searchParams, true);
        // };

        // window.addEventListener('scroll', handleScroll);
        // return () => window.removeEventListener('scroll', handleScroll);
    }, [isLoadingMore, hasMore, pageRef, visibleObjects]);

    useEffect(() => {
        console.log('useEffect for regions ' + objectFilterForm.getValues().region)
        getFiltersSearchData(objectFilterForm.getValues().region)
    }, [objectFilterForm.values.region]);




    useEffect(() => {

        const checkArrays = () => {
            console.group('Array checks:');
            console.log('points:', points, 'isArray:', Array.isArray(points));
            console.log('visibleObjects:', visibleObjects, 'isArray:', Array.isArray(visibleObjects));
            console.log('cityData:', cityData, 'isArray:', Array.isArray(cityData));
            console.log('categoryData:', categoryData, 'isArray:', Array.isArray(categoryData));
            console.log('objects:', objects, 'isArray:', Array.isArray(objects));
            console.groupEnd();
        };

        checkArrays();
    }, [points, visibleObjects, cityData, categoryData, objects]);


    // const regionValue = useWatch({
    //     control: objectFilterForm.control,
    //     name: 'region'
    // });

    const [opened, { toggle }] = useDisclosure();
    const [openedModalFilter, { open: openFilter, close: closeFilter }] = useDisclosure(false);
    const [openedModalMap, { open: openMap, close: closeMap }] = useDisclosure(false);
    return (
        <div className={styles.pageLayoutLarge}>
            <div style={{ backgroundColor: isMobile ? "" : "var(--mantine-color-grayColor-0" }}>
                <form>
                    <div className="filterBlockMobile">
                        <div>
                            <Select
                                // rightSection={<span />}
                                withCheckIcon={false}
                                searchable
                                size="lg"
                                placeholder="Куда поехать?"
                                rightSection={
                                    objectFilterForm.values.region ? (
                                        <CloseButton
                                            onClick={() => objectFilterForm.setFieldValue('region', null)}
                                            size="sm"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        />
                                    ) : (
                                        <span />
                                    )
                                }
                                className="citySelectMobile"
                                // maxDropdownHeight={400}
                                // styles={{
                                //     dropdown: {
                                //         maxHeight: '400px',
                                //         overflowY: 'auto'
                                //     }
                                // }}
                                // variant="unstyled"
                                defaultValue="-1"
                                data={cityDataRem}
                                key={objectFilterForm.key('region')}
                                {...objectFilterForm.getInputProps('region')}
                            />
                            {/* <Divider></Divider> */}
                        </div>
                        <div className="">
                            <DoubleDateRangePickerMobile
                                className="datePickerMobile"
                                value={objectFilterForm.values.in}
                                onChange={(value) => {
                                    objectFilterForm.setFieldValue('in', value);

                                    setTimeout(() => handleBlur(4), 50);
                                }}
                                onBlur={() => handleBlur(4)}
                            />
                            {/* <Divider></Divider> */}
                        </div>

                        <div className="numpInputGroup">
                            <GuestPickerMobile
                                value={objectFilterForm.values.guest}
                                // onBlur={() => guestInputRef.current?.focus()}
                                onChange={(value) => {
                                    objectFilterForm.setFieldValue('guest', value);
                                    console.log("задано значение" + objectFilterForm.values.guest[0] + " " + objectFilterForm.values.guest[1])
                                    // guestInputRef.current?.focus()
                                }} />
                        </div>
                    </div>
                    <Group justify="center">
                        <div className="filterBlock" style={{ marginTop: 40 }}>
                            <div className="filterBlockRegion">
                                <div>
                                    <Group gap={0} className="filterItem">
                                        <Select
                                            // rightSection={(value) => { value !== '' ? <Input.ClearButton onClick={() => setValue('')} /> : <span />}
                                            // rightSection={
                                            //     objectFilterForm.values.region ? (
                                            //         <Input.ClearButton
                                            //             onClick={(e) => {
                                            //                 e.stopPropagation();
                                            //                 objectFilterForm.setFieldValue('region', ""); // Сбрасываем значение
                                            //                 // setTimeout(() => {
                                            //                 //     const input = document.querySelector('.citySelect input');
                                            //                 //     input?.focus();
                                            //                 // }, 10);
                                            //             }}
                                            //         />
                                            //     ) : <span />
                                            // }

                                            rightSection={<span />}
                                            description="Куда поехать?"
                                            // clearable
                                            withCheckIcon={false}
                                            searchable
                                            // placeholder="Город, регион..."
                                            className="citySelect"
                                            maxDropdownHeight={400}
                                            styles={{
                                                dropdown: {
                                                    maxHeight: '400px',
                                                    overflowY: 'auto'
                                                }
                                            }}
                                            variant="unstyled"
                                            // rightSection={<IconChevronDown size={16} />}
                                            data={cityDataRem}
                                            // defaultValue="-1"
                                            // defaultSearchValue={newCity.name}
                                            key={objectFilterForm.key('region')}
                                            {...objectFilterForm.getInputProps('region')}
                                            // ref={(el) => addToRefs(el, 0)}

                                            ref={selectInputRef}

                                            onBlur={() => dateInputRef.current?.focus()}

                                            onChange={(value) => {

                                                objectFilterForm.getInputProps('region').onChange(value);
                                                dateInputRef.current?.focus()
                                            }}

                                        // mt="md"
                                        />
                                        <Divider orientation="vertical" />
                                    </Group>
                                </div>

                                {/* <div >
                                                        <Group gap={0} className="filterItem">
                                                            <Select
                                                                styles={{
                                                                    wrapper: {
                                                                        margin: 0
                                                                    },
                                                                }}
                                                                description="Категория"
                                                                clearable
                                                                withCheckIcon={false}
                                                                searchable
                                                                // placeholder="Категория"
                                                                className="citySelect"
                                                                maxDropdownHeight={200}
                                                                variant="unstyled"
                                                                defaultValue="-1"
                                                                defaultSearchValue={newCategory.name}
                                                                // rightSection={<IconChevronDown size={16} />}
                                                                data={categoryDataRem}
                                                                key={objectFilterForm.key('category')}
                                                                {...objectFilterForm.getInputProps('category')}
                                                                ref={(el) => addToRefs(el, 1)}
                                                                onBlur={() => handleBlur(1)}

                                                                onChange={(value) => {
                                                                    // 1. Вызываем оригинальный onChange из form.getInputProps
                                                                    objectFilterForm.getInputProps('category').onChange(value);

                                                                    // 2. Добавляем переход к следующему полю
                                                                    setTimeout(() => {
                                                                        if (value && value !== "-1") { // Проверяем, что значение действительно выбрано
                                                                            handleBlur(1); // Или moveToNextField(0)
                                                                        }
                                                                    }, 50); // Небольшая задержка для корректной работы
                                                                }}
                                                            // mt="md"
                                                            />
                                                            <Divider orientation="vertical" />
                                                        </Group>
                                                    </div> */}
                            </div>
                            <div className="filterBlockDates">

                                <DoubleDateRangePicker
                                    value={objectFilterForm.values.in}
                                    ref={dateInputRef}
                                    onBlur={() => guestInputRef.current?.focus()}
                                    onChange={(value) => {
                                        objectFilterForm.setFieldValue('in', value);
                                        // guestInputRef.current?.focus()
                                    }}

                                />
                                {/* <div className="">
                                                        <Group>
                                                            <DateInput
                                                                styles={{
                                                                    wrapper: {
                                                                        margin: 0
                                                                    },
                                                                }}
                                                                description="Дата заезда"

                                                                // value={datein}         // Controlled value
                                                                // onChange={setDatein}
                                                                // defaultValue={new Date()}
                                                                clearable
                                                                className="datePicker"
                                                                variant="unstyled"
                                                                valueFormat="DD/MM/YYYY"
                                                                // placeholder="Заезд"
                                                                // rightSection={<Calendar></Calendar>}
                                                                key={objectFilterForm.key('in')}
                                                                {...objectFilterForm.getInputProps('in')}

                                                                ref={(el) => addToRefs(el, 2)}
                                                                onBlur={() => handleBlur(2)}

                                                                onChange={(value) => {
                                                                    // 1. Вызываем оригинальный onChange из form.getInputProps
                                                                    objectFilterForm.getInputProps('in').onChange(value);

                                                                    // 2. Добавляем переход к следующему полю
                                                                    setTimeout(() => {

                                                                        handleBlur(2); // Или moveToNextField(0)

                                                                    }, 50); // Небольшая задержка для корректной работы
                                                                }}


                                                            />
                                                            <Divider orientation="vertical" /></Group>
                                                    </div>
                                                    <div className="">
                                                        <Group> <DateInput
                                                            styles={{
                                                                wrapper: {
                                                                    margin: 0
                                                                },
                                                            }}
                                                            description="Дата выезда"

                                                            className="datePicker"
                                                            variant="unstyled"
                                                            // value={dateout}         // Controlled value
                                                            // onChange={setDateout}
                                                            clearable
                                                            valueFormat="DD/MM/YYYY"
                                                            // placeholder="Выезд"
                                                            // rightSection={<Calendar></Calendar>}
                                                            key={objectFilterForm.key('out')}
                                                            {...objectFilterForm.getInputProps('out')}


                                                            ref={(el) => addToRefs(el, 3)}
                                                            onBlur={() => handleBlur(3)}

                                                            onChange={(value) => {
                                                                // 1. Вызываем оригинальный onChange из form.getInputProps
                                                                objectFilterForm.getInputProps('out').onChange(value);

                                                                // 2. Добавляем переход к следующему полю
                                                                setTimeout(() => {

                                                                    handleBlur(3); // Или moveToNextField(0)

                                                                }, 50); // Небольшая задержка для корректной работы
                                                            }}


                                                        />
                                                            <Divider orientation="vertical" /></Group>
                                                    </div> */}
                                <div className="numpInputGroup">
                                    <GuestPicker
                                        value={objectFilterForm.values.guest}
                                        // ref={guestInputRef}
                                        // onBlur={() => guestInputRef.current?.focus()}
                                        kids={objectFilterForm.values.kids}
                                        onKidsChange={(value) => {
                                            objectFilterForm.setFieldValue('kids', value);
                                            console.log(objectFilterForm.values.kids)
                                            // guestInputRef.current?.focus()
                                        }}
                                        onChange={(value) => {
                                            objectFilterForm.setFieldValue('guest', value);
                                            console.log("заданог значение" + objectFilterForm.values.guest[0] + " " + objectFilterForm.values.guest[1])
                                            // guestInputRef.current?.focus()
                                        }}></GuestPicker>

                                </div>
                            </div>
                        </div>
                        {/* <Button
                            fullWidth
                            // ml={30}
                            w={120}
                            // radius={10}
                            color="var(--mantine-color-sberGreenColor-9)"
                            onClick={() => {
                                // handleFilterChange();
                                // getObjectsDataFunc();
                                console.log(objectFilterForm.getValues())
                            }}
                        >
                            Найти
                        </Button> */}
                    </Group>

                </form>

                <Modal opened={openedModalFilter} onClose={() => { closeFilter(); toggle() }} centered
                    zIndex={11000}
                    overlayProps={{
                        color: '#000',
                        opacity: 0.8,
                        blur: 2,
                    }}
                    styles={{
                        header: {
                            display: 'none',
                        },
                        body: {
                            padding: 0,
                            // zIndex: 11150
                        },
                        content: {
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                        },
                    }}>
                    <div className={styles["closeButton"]} onClick={() => { closeFilter(); toggle() }}>
                        &times;
                    </div>
                    <div className={styles["navbarMobile"]}>
                        <SearchMenu filtersSearch={filtersSearch} opened={true} closeApply={handleFormSave}></SearchMenu>
                    </div>
                </Modal>

                <Modal opened={openedModalMap} onClose={closeMap} centered withCloseButton={false}
                    zIndex={11000}
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


                <div className={styles.textHigh} onClick={() => { toggle(); openFilter() }}>
                    Открыть список фильтров
                </div>

                <div className={styles[`pageLayout`]}>

                    <div className={styles["navbar"]}
                    ><SearchMenu filtersSearch={filtersSearch} opened={opened} closeApply={handleFormSave}></SearchMenu></div>

                    <div className="papercard" style={{
                        maxWidth: "100%"
                    }}>
                        <Group className="" mb={10} hiddenFrom="md">
                            <Button color="var(--mantine-color-sberGreenColor-9)"
                                variant={isMobile ? "filled" : "outline"}
                                onClick={() => {
                                    handleFormSave();

                                    //(objectFilterForm.getValues(), searchParams.get('amount_rooms_min'))
                                }}
                                fullWidth
                            >
                                {isMobile ?
                                    isLoadingMore || isLoading.current ?
                                        <span className={styles.loadtext}><Loader type="dots" ml="20" size="xs" color="white" /></span> :
                                        "Применить фильтры" : ""}
                            </Button>
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
                        <div style={{ display: isMobile ? "block" : "flex", justifyContent: "space-between", alignItems: "center" }}>
                            {/* <Burger className="HeadingStyle2" opened={opened} onClick={toggle} hiddenFrom="md" size="sm" /> */}
                            <div className={styles.title} style={{ marginBottom: "2px" }}>
                                Результаты поиска
                                {!isMobile ? <div>
                                    {isLoading.current || isLoadingMore ?
                                        <div className={styles.loadtext}>Идет загрузка стр.. {pageRef.current}<Loader type="dots" ml="30" size="xs" /></div> :
                                        <div className={styles.loadtext}>Найдено {countAll.current} объектов</div>}
                                </div> : ': ' + visibleObjects.length.toString()}

                            </div>
                            <Group className="" mt={10} visibleFrom="md">
                                <Button color="var(--mantine-color-sberGreenColor-9)"
                                    variant={isMobile ? "filled" : "outline"}
                                    onClick={() => {
                                        handleFormSave();
                                        // getObjectsDataFunc(searchParams, false);
                                        //(objectFilterForm.getValues(), searchParams.get('amount_rooms_min'))
                                    }}
                                    w={200}
                                >
                                    {isLoading.current ? <Loader color="green" size={13}></Loader> : "Применить фильтры"}
                                </Button>
                            </Group>


                        </div>
                        {/* БАЗА */}
                        <SimpleGrid className="papercard" style={{
                            justifyItems: "center",
                            display: isSM ? 'none' : 'block',
                            minHeight: isXS ? '100vh' : ''
                        }}>

                            {/* Центральный индикатор загрузки (как на модуле RealtyCalendar) */}
                            {isLoading.current && visibleObjects.length === 0 ? (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '400px',
                                    gap: '20px'
                                }}>
                                    <div className={styles.customLoader}></div>
                                    <Text size="md" c="dimmed" style={{ fontSize: '16px' }}>
                                        Ищем доступные предложения...
                                    </Text>
                                </div>
                            ) : visibleObjects.length == 0 && !isLoading.current ? (
                                <Text>На выбранные даты не нашлось больше свободных вариантов</Text>
                            ) : (
                                <>
                                    {(Array.isArray(visibleObjects) ? visibleObjects : []).map(visibleObjects => <div style={{ width: "100%" }}
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

                                    {/* Skeleton-загрузчики для подгрузки следующих объектов */}
                                    {isLoadingMore && <div style={{ width: "100%" }}>
                                        <Skeleton mt={10} radius={20} animate height={"250px"} width={"100%"}></Skeleton>
                                        <Skeleton mt={10} radius={20} animate height={"250px"} width={"100%"}></Skeleton>
                                        <Skeleton mt={10} radius={20} animate height={"250px"} width={"100%"}></Skeleton>
                                    </div>}
                                </>
                            )}


                        </SimpleGrid>

                        <div className="papercard" style={{
                            justifyItems: "center",
                            display: isSM ? 'grid' : 'none',
                            gridTemplateColumns: isXS ? "1fr" : "1fr 1fr",
                            minHeight: isSM ? '100vh' : ''

                        }}>

                            {/* Центральный индикатор загрузки (мобильная версия) */}
                            {isLoading.current && visibleObjects.length === 0 ? (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: '400px',
                                    gap: '20px',
                                    gridColumn: '1 / -1'
                                }}>
                                    <div className={styles.customLoader}></div>
                                    <Text size="md" c="dimmed" style={{ fontSize: '16px' }}>
                                        Ищем доступные предложения...
                                    </Text>
                                </div>
                            ) : visibleObjects.length == 0 && !isLoading.current ? (
                                <Text style={{ gridColumn: '1 / -1' }}>На выбранные даты не нашлось больше свободных вариантов</Text>
                            ) : (
                                <>
                                    {(Array.isArray(visibleObjects) ? visibleObjects : []).map(visibleObjects => <SearchPageCard
                                        {...visibleObjects}
                                        refreshList={() => handleNavigateToObject(visibleObjects.id)}
                                        IsDatesSet={IsDatesSet} />
                                    )}
                                    {isLoadingMore && <div style={{ width: "100%", gridColumn: '1 / -1' }}>
                                        <Skeleton mt={10} radius={20} animate height={"250px"} width={"100%"}></Skeleton>
                                        <Skeleton mt={10} radius={20} animate height={"250px"} width={"100%"}></Skeleton>
                                        <Skeleton mt={10} radius={20} animate height={"250px"} width={"100%"}></Skeleton>
                                    </div>}
                                </>
                            )}

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