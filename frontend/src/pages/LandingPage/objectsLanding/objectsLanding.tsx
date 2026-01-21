import { DoubleDateRangePickerMobile } from "../../../components/buttons/dataRange/dateRange_mobile.tsx";
import { GuestPickerMobile } from "../../../components/buttons/guestButton/guestButton_mobile.tsx";
import { Button, Paper, Flex, Group, Select, Divider, NumberInput, CloseButton } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import styles from "./objectLanding.module.css";
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { errorHandler } from "../../../handlers/errorBasicHandler.ts";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import Plus from "../../../icons/Plus.svg?react";

import '@mantine/dates/styles.css';
import { getObjectsData } from "../../../services/objectsServices.ts";
import { getRegionsData, getTypeData } from "../../../services/getEverything.ts";
import { useMediaQuery } from "@mantine/hooks";
import { DoubleDateRangePicker } from "../../../components/buttons/dateRange_copy.tsx";
import { GuestPicker } from "../../../components/buttons/guestButton/guestButton.tsx";
import { IconX } from "@tabler/icons-react";

interface Banner {
    id: string;
    name: string;
}

// type Object = {
//     pk: number;
//     short_name: string;
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
// цена тип 
// сколько комнат, метры кв, этажи, гости
// метро рядом
// адрес

export function ObjectsLandingPage() {


    const upperTabsData = [
        { name: 'Больше фильтров', link: '/search', icon: <Plus width="25" height="25" /> },
    ]
    const upperTabs = upperTabsData.map((tab, index) => (
        <Button
            className={styles[`tab`]}
            onClick={() => navigate(tab.link)}
            variant="outline">
            <Flex gap={"xs"} align={"center"}>
                {tab.icon}
                <div
                    style={{ marginBottom: 1 }}
                >{tab.name}</div>
            </Flex>
        </Button>
    ));

    // const newCity = { id: -1, name: "Все регионы" };
    // const newCategory = { id: -1, name: "Все категории" };
    const [cityData, setСityData] = useState<Filters[]>([])
    const cityDataRem = (Array.isArray(cityData) ? cityData : []).map(item => ({
        value: item.order.toString(), // Select обычно ожидает string
        label: item.title,
    }));
    const [categoryData, setCategoryData] = useState<Filters[]>([])
    const categoryDataRem = (Array.isArray(categoryData) ? categoryData : []).map(item => ({
        value: item.id.toString(), // Select обычно ожидает string
        label: item.name,
    }));

    const inputs = useRef<HTMLInputElement[]>([]);

    const selectInputRef = useRef<HTMLInputElement>();
    const dateInputRef = useRef<HTMLInputElement>();
    const guestInputRef = useRef<HTMLInputElement>();

    const selectMobileInputRef = useRef<HTMLInputElement>();
    const dateMobileInputRef = useRef<HTMLInputElement>();
    const guestMobileInputRef = useRef<HTMLInputElement>();

    const [IsDatesSet, setIsDatesSet] = useState(false)

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


    // const cityData = ['Санкт-Петербург', 'Москва', 'Воронеж', 'Тверь']
    // const categoryData = ['Гостиница', 'Квартира', 'Студия']
    const [datein, setDatein] = useState<Date | null>(() => {
        const tomorrow = new Date();
        return tomorrow;
    });
    const [dateout, setDateout] = useState<Date | null>(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    });

    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [objects, setObjects] = useState<Object[]>([

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
            guest: [2, 1] as [number, number]
        },
        validate: {
        },
    });


    async function getFiltersData() {

        const regions = await getRegionsData()
        const type = await getTypeData()


        if (regions.ok) {
            const data = await regions.json();
            // setСityData([newCity, ...data])
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

        if (type.ok) {
            const data = await type.json();
            // setCategoryData([newCategory, ...data])
            setCategoryData(Array.isArray(data) ? data : (data.results || []))
        }
        else {
            setCategoryData([])
            const error = await type.json();
            if (errorHandler(type.status) == 5) {
                showNotification({
                    title: "Ошибка сервера, обновите страницу",
                    message: error.statusText,
                    icon: <IconX />
                })
            }
        }



    }
    const [searchParams, setSearchParams] = useSearchParams();

    const handleFilterChange = () => {
        const newParams = new URLSearchParams(searchParams);
        const formValues = objectFilterForm.values;

        if (formValues.region) newParams.set('region', formValues.region);
        // if (formValues.category) newParams.set('category', formValues.category);
        if (formValues.in[0]) newParams.set('in_start', formValues.in[0].toISOString());
        if (formValues.in[1]) newParams.set('in_end', formValues.in[1].toISOString());
        // if (formValues.out) newParams.set('out', formValues.out);
        if (formValues.guest) {
            newParams.set('guest', formValues.guest[0]?.toString() || "2");
            newParams.set('amount_rooms_min', formValues.guest[1]?.toString() || "1");
        }

        setSearchParams(newParams, { replace: true });
        // if (value) {
        //   newParams.set(name, value);
        // } else {
        //   newParams.delete(name);
        // }
        // setSearchParams(newParams);
        // handleFormSave()
        navigate({
            pathname: '/search', // ваша целевая страница
            search: newParams.toString()
        });
    };

    const handleFormSave = () => {
        const formState = objectFilterForm.values
        const { in: _, out: __, ...filteredValues } = formState
        sessionStorage.setItem('mainPageState', JSON.stringify(filteredValues));
        navigate('/search')
    };

    // //Избавляюсь от дат и загружаю все в сессион сторадж перед нажатием на любой объект 
    // const handleNavigateToObject = (id: number) => {
    //     handleFormSave()
    //     navigate(`/object/${id}`);
    //     window.scrollTo(0, 0)
    // };



    //При загрузке страницы
    useEffect(() => {
        getFiltersData()
        objectFilterForm.setValues({
            region: searchParams.get('region') || '',
            // category: searchParams.get('category') || '',
            in: [
                searchParams.get('in_start') ? new Date(searchParams.get('in_start')!) : null,
                searchParams.get('in_end') ? new Date(searchParams.get('in_end')!) : null,
            ],
            // out: searchParams.get('out') || '',
            guest: searchParams.get('guest') || '2',
        });
        // const savedData = sessionStorage.getItem('mainPageState');
        // // alert(savedData)
        // if (savedData) {
        //     objectFilterForm.setValues(JSON.parse(savedData));
        // }
        // getObjectsDataFunc()
    }, []);


    const isMobile = useMediaQuery('(max-width: 48em)');
    return (
        <>
            {/* ФИЛЬТР */}
            <Paper shadow="sm" p={"md"} radius={20}
                style={{
                    backgroundSize: "100% 150%",
                    backgroundRepeat: "no-repeat",
                    backgroundImage: isMobile ? "none" : `url(/background.jpg)`
                }}>
                <div className='mantine-visible-from-sm'>
                    <h1 className="HeadingStyle1"
                        style={{
                            marginTop: "90px",
                            marginBottom: "0px",
                            textAlign: "center",
                            color: "var(--mantine-color-grayColor-0)"
                        }}>
                        Посуточная аренда квартир
                    </h1>
                    <h1 className="HeadingStyle1"
                        style={{
                            marginBottom: "50px",
                            textAlign: "center",
                            fontSize: "24px",
                            color: "var(--mantine-color-grayColor-0)"
                        }}>
                        В Санкт-Петербурге и других регионах РФ
                    </h1>
                </div>
                <form>
                    <div className="filterBlockMobile">
                        <div>
                            <Select
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
                                withCheckIcon={false}
                                rightSectionPointerEvents="all"
                                searchable
                                size="lg"
                                placeholder="Куда поехать?"
                                className="citySelectMobile"
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
                                ref={dateMobileInputRef}
                                // onBlur={() => guestMobileInputRef.current?.focus()}
                                onChange={(value) => {
                                    objectFilterForm.setFieldValue('in', value);
                                }}
                            // onBlur={() => handleBlur(4)}
                            />
                            {/* <Divider></Divider> */}
                        </div>

                        <div className="numpInputGroup">
                            <GuestPickerMobile
                                value={objectFilterForm.values.guest}
                                ref={guestMobileInputRef}
                                // onBlur={() => guestInputRef.current?.focus()}
                                onChange={(value) => {
                                    objectFilterForm.setFieldValue('guest', value);
                                    console.log("заданог значение" + objectFilterForm.values.guest[0] + " " + objectFilterForm.values.guest[1])
                                    // guestInputRef.current?.focus()
                                }}>
                            </GuestPickerMobile>
                        </div>
                    </div>
                    <Group justify="center">
                        <div className="filterBlock">
                            <div className="filterBlockRegion">
                                <div>
                                    <Group gap={0} className="filterItem">
                                        <Select
                                            styles={{
                                                wrapper: {
                                                    margin: 0
                                                },
                                            }}
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
                                            clearable
                                            withCheckIcon={false}
                                            searchable
                                            // placeholder="Город, регион..."
                                            className="citySelect"
                                            maxDropdownHeight={200}
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
                                    {/* <NumberInput
                                        styles={{
                                            wrapper: {
                                                margin: 0
                                            },
                                        }}
                                        ref={guestInputRef}
                                        hideControls
                                        description="Количество гостей"
                                        min={1}
                                        className="numbInput"
                                        variant="unstyled"
                                        // placeholder="Гости"
                                        // rightSection={<Person></Person>}
                                        key={objectFilterForm.key('guest')}
                                        {...objectFilterForm.getInputProps('guest')}
                                    /> */}
                                    <GuestPicker
                                        value={Array.isArray(objectFilterForm.values.guest)
                                            ? [objectFilterForm.values.guest[0] || 2, objectFilterForm.values.guest[1] || 1]
                                            : [2, 1]}
                                        ref={guestInputRef}
                                        // onBlur={() => guestInputRef.current?.focus()}
                                        onChange={(value) => {
                                            objectFilterForm.setFieldValue('guest', value);
                                            console.log("заданог значение" + objectFilterForm.values.guest[0] + " " + objectFilterForm.values.guest[1])
                                            // guestInputRef.current?.focus()
                                        }}></GuestPicker>
                                </div>
                            </div>
                        </div>
                        <Button
                            fullWidth
                            // ml={30}
                            w={120}
                            // radius={10}
                            className="filterBlockButton"
                            color="var(--mantine-color-sberGreenColor-9)"
                            onClick={() => {
                                handleFilterChange();
                                // getObjectsDataFunc(); 
                                //(objectFilterForm.getValues())
                            }}
                        >
                            Найти
                        </Button>
                    </Group>
                    {/* <Button
                        fullWidth
                        // ml={30}
                        w={120}
                        // radius={10}
                        className="filterBlockButton"
                        color="var(--mantine-color-sberGreenColor-9)"
                        onClick={() => {
                            handleFilterChange();
                            // getObjectsDataFunc(); 
                            //(objectFilterForm.getValues())
                        }}
                    >
                        Найти
                    </Button> */}

                    {/* {upperTabs} */}
                </form>

                <div className={styles.bannerContainer}>
                    <div className={styles.bannerBlock}>
                        <h2 className={styles.bannerHead}>100+</h2>
                        <span className={styles.bannerText}>объектов в управлении</span>
                    </div>
                    <div className={styles.bannerBlock}>
                        <h2 className={styles.bannerHead}>18 лет</h2>
                        <span className={styles.bannerText}>на рынке аренды</span>
                    </div>
                    <div className={styles.bannerBlock}>
                        <h2 className={styles.bannerHead}>100 000+</h2>
                        <span className={styles.bannerText}>довольных клиентов</span>
                    </div>
                </div>
            </Paper >

            {/* <Group justify="center">
                    <div className="papergrid">
                   
                        {(Array.isArray(objects) ? objects : []).length == 0 ? <Text className="HeadingStyle3">На выбранные даты не нашлось свободных вариантов</Text> :
                            (Array.isArray(objects) ? objects : []).map(objects => <ObjectLandingCard {...objects}
                                refreshList={() => handleNavigateToObject(objects.pk)}
                                IsDatesSet={IsDatesSet}
                            />

                            )}
                    </div>


                </Group> */}



        </>
    )


}