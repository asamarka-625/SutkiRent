
// import LogoSVG from "../../../icons/logo.svg?react"
import { Button, Checkbox, CheckboxGroup, Divider, Flex, Group, NumberInput, Radio, RangeSlider, Select, TextInput } from "@mantine/core";
import styles from "./filter.module.css";
import { useMediaQuery } from "@mantine/hooks";
import { useState } from "react";
import { useForm } from "@mantine/form";
// import { BookingCard } from "../../components/cards/bookingLkCard/bookingsCard";

interface Props {
    // catagoryData: string[],
    opened: boolean

}

export function FilterBlock(props: Props) {


    const [statusData, setStatusData] = useState<string[]>(['Подтверждено', 'Ожидает оплаты', 'Завершено'])
    const statusTabs = statusData.map((item, index) => ({
        value: (index + 1).toString(),
        label: item.toString(),
    }
    ));

    const statusList = statusData.map((tab, index) => (
        <Checkbox size="sm" mt={5} value={tab} label={tab} key={tab} color="sberGreenColor.9"
            styles={{ input: { boxShadow: "inset 1px 1px lightGray" } }} />
    ));

    const [sortData, setSortData] = useState<string[]>(['По дате - сначала новые', 'По дате - сначала старые', 'По цене - по убыванию', 'По цене - по возрастанию',])
    const sortTabs = sortData.map((item, index) => ({
        value: (index + 1).toString(),
        label: item.toString(),
    }
    ));

    const sortList = sortData.map((tab, index) => (
        <Radio size="sm" mt={5} value={tab} label={tab} key={tab} iconColor="sberGreenColor.9" color="grayColor.0"
            styles={{ radio: { boxShadow: "inset 1px 1px lightGray" } }}
        // checked={filterForm.getInputProps('view') === tab.notation_view.toString()} 
        />
    ));

    const [radioCh, setRadioCh] = useState(false);
    const handleRadioChange = (value: string) => {
        setRadioCh(!radioCh)
        if (filterForm.values.view === value) {
            filterForm.setFieldValue('view', '');
        } else {
            filterForm.setFieldValue('view', value);
        }
    };


    const filterForm = useForm({
        mode: 'controlled',
        initialValues: {
            service: ['Подтверждено', 'Ожидает оплаты', 'Завершено'],
            category: [],
            near_metros: [],
            in: [null, null] as [Date | null, Date | null],
            // amount_rooms_min: '',
            // amount_rooms_max: '',
            amount_sleeps_min: '',
            amount_sleeps_max: '',
            floor_start: '',
            floor_finish: '',
            space_min: '',
            space_max: '',
            view: '',
            toilet: '',
            inRoom: [],
            availability: [],
            dopService: [],
        },
        validate: {
        },
        onValuesChange: () => {
            //  const { cost: costForm, out: __, ...filteredValues } = formState
            // sessionStorage.setItem('filterSideState', JSON.stringify(values));
            // // const savedData = sessionStorage.getItem('filterSideState');
            // if (savedData) {
            // filterForm.setValues(JSON.parse(savedData));
            // }
        }
    });


    const isMD = useMediaQuery('(max-width: 64em)');
    const isMobile = useMediaQuery('(max-width: 48em)');

    const [isRedacted, setIsRedacted] = useState(false);

    return (
        // <div className="papercardLK">
        //     <div className="papercard">
        //         {/* <h3 className="HeadingStyle3">Фильтрация</h3> */}
        //         <Flex direction={"column"} gap={15}>
        //             <Select
        //                 miw={200}
        //                 withCheckIcon={false}
        //                 // defaultSearchValue={statusTabs[0].label}
        //                 defaultValue={statusTabs[0].value}
        //                 placeholder=""
        //                 maxDropdownHeight={200}
        //                 data={statusTabs}

        //             // mt="md"
        //             />
        //             <Select
        //                 withCheckIcon={false}
        //                 // defaultSearchValue={statusTabs[0].label}
        //                 defaultValue={statusTabs[0].value}
        //                 placeholder=""
        //                 maxDropdownHeight={200}
        //                 data={sortTabs}

        //             // mt="md"
        //             />
        //         </Flex>

        //         <h3 className="Heading3"></h3>
        //     </div>


        // </div>

        <div
            className={''}
        >
            {/* <AppShell.Navbar p="md" style={{ gap: "10px",
    }} bg={'grayColor.2'} pos={"absolute"}> */}
            <div className={styles["navbar"]}
                style={{
                    // position: isMD ? "absolute" : "relative",
                    transform: props.opened ? "translateX(0)" : isMD ? "translateX(-1000%)" : "",
                    transition: "transform 0.5s ease-in-out",
                }}>

                <Flex className="papercard" align='' direction="column" >
                    <div style={{ marginLeft: 10 }}>
                        <h3 className="HeadingStyle3" style={{ paddingTop: 0 }}>Статус бронирования</h3>
                    </div>
                    <CheckboxGroup  {...filterForm.getInputProps('service')} mt={10}>
                        {statusList}
                    </CheckboxGroup>
                    <Button size="xs" onClick={() => filterForm.setFieldValue('service', statusData)} mt="md" disabled={filterForm.values.service.length == statusData.length}>
                        Показать все
                    </Button>
                </Flex>

                <Divider></Divider>

                {/* <Flex className="papercard" align='' direction="column" >
                    <div style={{ margin: 10 }}>
                        <h3 className="HeadingStyle3">Дата бронирования</h3>
                    </div>
                    <DoubleDateRangePicker
                        className=""
                        value={filterForm.values.in}
                        // ref={dateInputRef}
                        // onBlur={() => guestInputRef.current?.focus()}
                        onChange={(value) => {
                            filterForm.setFieldValue('in', value);
                            // guestInputRef.current?.focus()
                        }}

                    />
                </Flex> */}



                <Divider></Divider>

                <Flex className="papercard" align='' direction="column" >
                    <div style={{ marginLeft: 10 }}>
                        <h3 className="HeadingStyle3">Сортировка</h3>
                    </div>
                    <Radio.Group value={filterForm.values.view}
                        onChange={handleRadioChange} mt={10}>
                        {sortList}
                    </Radio.Group>
                    <Button size="xs" onClick={() => filterForm.setFieldValue('view', null)} mt="md" disabled={!filterForm.values.view}>
                        Сбросить выбор
                    </Button>
                    {/* <Button.Group >
                           {viewData.map((tab) => (
                             <Button
                               key={tab.notation_view}
                               variant={selected === tab.notation_view.toString() ? 'filled' : 'outline'}
                               onClick={() => setSelected(selected === tab.notation_view.toString() ? null : tab.notation_view.toString())}
                             >
                               {tab.notation_view}
                             </Button>
                           ))}
                         </Button.Group> */}

                    {/* <Checkbox size="xs" mt={5} onClick={() => setNotFirst(!notFirst)} label={"Не первый"} color="sberGreenColor.9"
                           styles={{ input: { boxShadow: "inset 1px 1px lightGray" } }} /> */}

                    {/* <Button variant="outline" mt={10} size="compact-xs" fullWidth className={styles["metroButton"]}>Выбрать станции</Button> */}

                </Flex>


                <Divider></Divider>
            </div>
        </div>

    )
}