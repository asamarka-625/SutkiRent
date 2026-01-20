import { AppShell, Button, Checkbox, CheckboxGroup, Divider, Flex, Group, Input, NumberInput, Paper, Popover, Radio, RangeSlider, Text } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./searchMenu.module.css";
import stylescheckbox from "./CheckboxStyles.module.css";
import Knob_Start from "..//..//..//icons/Knob_Start.svg?react"
import ClearFilter from "..//..//..//icons/ClearFilter.svg?react"
import { useForm } from "@mantine/form";
import { useDebouncedCallback, useMediaQuery } from "@mantine/hooks";
import { getAvailData, getBathroomData, getInventoryData, getMetrosData, getServiceData, getTypeData, getViewData } from "../../../services/getEverything.ts";
import { errorHandler } from "../../../handlers/errorBasicHandler.ts";
import { showNotification } from "@mantine/notifications";
// import { IconX } from "@tabler/icons-react";
// export function logOut() {
//   const navigate = useNavigate();
//   navigate("/partners")
//   // window.location.href = "/auth";

// }


interface Props {
  // catagoryData: string[],
  opened: boolean
  closeApply: () => void;
  openMetroModal: () => void;
}

interface Metro {
  // catagoryData: string[],
  name: string

}

interface Type {
  // catagoryData: string[],
  id: number
  name: string

}

interface AvailbType {
  // catagoryData: string[],
  id: number
  accessibility_type: string
}

interface ViewType {
  notation_view: number
}

interface Bathtype {
  bathroom_type: number
}




function getFloorError(floor_finish: string, value: string) {
  if (parseInt(value, 10) > parseInt(floor_finish, 10))
    return "Ошибка диапозона этажей";
  return null
}


const mincost = 0; const maxcost = 250000;

export function SearchMenu({ opened, closeApply, openMetroModal }: Props) {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams();
  const [costForm, setCostForm] = useState([mincost, maxcost] as [number, number])
  const [selected, setSelected] = useState('')


  const debouncedUpdate = (formValues) => {
    // console.log("меняем валью")
    const newParams = new URLSearchParams(searchParams);
    //("х" + costForm)
    if (costForm[0] !== 0) newParams.set('cost_min', costForm[0].toString());
    else newParams.delete('cost_min');

    if (costForm[1] !== maxcost) newParams.set('cost_max', costForm[1].toString());
    else newParams.delete('cost_max');

    // Обработка массивов
    const arrayFields = ['service', 'category', 'near_metros', 'inRoom', 'availability', 'dopService'];
    arrayFields.forEach(field => {
      if (formValues[field]?.length) {
        newParams.set(field, formValues[field].join(','));
      }
      else newParams.delete(field);
    });

    // Обработка числовых значений
    const numberFields = [
      'amount_rooms_min', 'amount_rooms_max',
      'amount_sleeps_min', 'amount_sleeps_max',
      'floor_start', 'floor_finish',
      'space_min', 'space_max'
    ];
    numberFields.forEach(field => {
      if (formValues[field]) newParams.set(field, formValues[field]);
      else newParams.delete(field);
    });

    // Обработка строковых значений
    if (formValues.view) newParams.set('view', formValues.view);
    else newParams.delete('view');
    if (formValues.toilet) newParams.set('toilet', formValues.toilet);
    else newParams.delete('toilet');

    // Удаляем пустые параметры
    Array.from(newParams.entries()).forEach(([key, value]) => {
      if (!value || value === '') newParams.delete(key);
    });
    setSearchParams(newParams, { replace: true });
  }

  const filterForm = useForm({
    mode: 'controlled',
    initialValues: {
      cost: costForm,
      service: [],
      category: [],
      near_metros: [],
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
      floor_start: (value) => (getFloorError(filterForm.getValues().floor_finish, value)),
    },
    onValuesChange: (values) => {
      debouncedUpdate(values)
      //  const { cost: costForm, out: __, ...filteredValues } = formState
      // sessionStorage.setItem('filterSideState', JSON.stringify(values));
      // // const savedData = sessionStorage.getItem('filterSideState');
      // if (savedData) {
      // filterForm.setValues(JSON.parse(savedData));
      // }
    }
  });

  const resetForm = () => {
    setCostForm([mincost, maxcost])
    filterForm.setValues({
      service: [],
      category: [],
      near_metros: [],
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
    });
  };

  const isMD = useMediaQuery('(max-width: 64em)');
  // Получаем выбранные категории и объединяем в строку
  const selectedCategoriesString = filterForm.values.category.join(', ');
  const [metroData, setMetroData] = useState<Metro[]>([])
  // const [notFirst, setNotFirst] = useState(false)
  const [showAll, setShowAll] = useState(false);
  const [radioCh, setRadioCh] = useState(false);
  const [showAllDop, setShowAllDop] = useState(false);

  const handleFormSave = () => {
    const formState = filterForm.values
    const { near_metros: _, ...filteredValues } = formState
    sessionStorage.setItem('filterSideState', JSON.stringify(formState));
  };
  const handleRadioChange = (value: string) => {
    setRadioCh(!radioCh)
    if (filterForm.values.view === value) {
      filterForm.setFieldValue('view', '');
    } else {
      filterForm.setFieldValue('view', value);
    }
  };


  // async function getMetroDataFunc() {
  //   console.log(filterForm.getValues().near_metros)
  //   console.log(metroData)
  //   // alert(sessionStorage.getItem('filterState'))
  //   // alert(objectFilterForm.getValues().category + objectFilterForm.getValues().guest)
  //   const response = await getMetrosData()
  //   if (response.ok) {
  //     const data = await response.json();
  //     setMetroData(data)
  //   }
  //   else {
  //     setMetroData([])
  //     const error = await response.json();
  //     if (errorHandler(response.status) == 5) {
  //       showNotification({
  //         title: "Ошибка сервера, обновите страницу",
  //         message: error.statusText,
  //         icon: <IconX />
  //       })
  //     }
  //   }
  // }

  async function getFiltersData() {

    const type = await getTypeData()
    const metros = await getMetrosData()
    const inventory = await getInventoryData()
    const service = await getServiceData()
    // const view = await getViewData()
    // const bathroom = await getBathroomData()
    // const availab = await getAvailData()

    if (metros.ok) {
      const data = await metros.json();
      setMetroData(data)
    }
    else {
      setMetroData([])
      const error = await metros.json();
      if (errorHandler(metros.status) == 5) {
        showNotification({
          title: "Ошибка сервера, обновите страницу",
          message: error.statusText,
          // icon: <IconX />
        })
      }
    }

    if (type.ok) {
      const data = await type.json();
      setCategoryData(data)
    }
    else {
      setCategoryData([])
      const error = await type.json();
      if (errorHandler(type.status) == 5) {
        showNotification({
          title: "Ошибка сервера, обновите страницу",
          message: error.statusText,
          // icon: <IconX />
        })
      }
    }

    if (inventory.ok) {
      const data = await inventory.json();
      setAdditions(data)
    }
    else {
      setAdditions([])
      const error = await inventory.json();
      if (errorHandler(inventory.status) == 5) {
        showNotification({
          title: "Ошибка сервера, обновите страницу",
          message: error.statusText,
          // icon: <IconX />
        })
      }
    }


    if (service.ok) {
      const data = await service.json();
      setDop(data)
    }
    else {
      setDop([])
      const error = await service.json();
      if (errorHandler(service.status) == 5) {
        showNotification({
          title: "Ошибка сервера, обновите страницу",
          message: error.statusText,
          // icon: <IconX />
        })
      }
    }


    // if (view.ok) {
    //   const data = await view.json();
    //   setView(data)
    // }
    // else {
    //   setView([])
    //   const error = await view.json();
    //   if (errorHandler(view.status) == 5) {
    //     showNotification({
    //       title: "Ошибка сервера, обновите страницу",
    //       message: error.statusText,
    //       icon: <IconX />
    //     })
    //   }
    // }


    // if (bathroom.ok) {
    //   const data = await bathroom.json();
    //   setTualet(data)
    // }
    // else {
    //   setTualet([])
    //   const error = await bathroom.json();
    //   if (errorHandler(bathroom.status) == 5) {
    //     showNotification({
    //       title: "Ошибка сервера, обновите страницу",
    //       message: error.statusText,
    //       icon: <IconX />
    //     })
    //   }
    // }

    // if (availab.ok) {
    //   const data = await availab.json();
    //   setAvailaBData(data)
    // }
    // else {
    //   setAvailaBData([])
    //   const error = await availab.json();
    //   if (errorHandler(availab.status) == 5) {
    //     showNotification({
    //       title: "Ошибка сервера, обновите страницу",
    //       message: error.statusText,
    //       icon: <IconX />
    //     })
    //   }
    // }


  }


  // async function getMetrosDataFunc() {

  //   const response = await getMetrosData()
  //   if (response.ok) {
  //     const data = await response.json();
  //     setMetroData(data)
  //   }
  //   else {
  //     setMetroData([])
  //     const error = await response.json();
  //     if (errorHandler(response.status) == 5) {
  //       showNotification({
  //         title: "Ошибка сервера, обновите страницу",
  //         message: error.statusText,
  //         icon: <IconX />
  //       })
  //     }
  //   }

  // }



  useEffect(() => {
    debouncedUpdate(filterForm.values)

  }, [costForm]);



  //При загрузке страницы
  useEffect(() => {
    setCostForm([searchParams.has('cost_min') ? Number(searchParams.get('cost_min')) : 0,
    searchParams.has('cost_max') ? Number(searchParams.get('cost_max')) : maxcost]);

    filterForm.setValues({
      service: searchParams.get('service')?.split(',').filter(Boolean) || [],
      category: searchParams.get('category')?.split(',').filter(Boolean) || [],
      near_metros: searchParams.get('near_metros')?.split(',').filter(Boolean) || [],
      amount_rooms_min: searchParams.get('amount_rooms_min') || '',
      amount_rooms_max: searchParams.get('amount_rooms_max') || '',
      amount_sleeps_min: searchParams.get('amount_sleeps_min') || '',
      amount_sleeps_max: searchParams.get('amount_sleeps_max') || '',
      floor_start: searchParams.get('floor_start') || '',
      floor_finish: searchParams.get('floor_finish') || '',
      space_min: searchParams.get('space_min') || '',
      space_max: searchParams.get('space_max') || '',
      view: searchParams.get('view') || '',
      toilet: searchParams.get('toilet') || '',
      inRoom: searchParams.get('inRoom')?.split(',').filter(Boolean) || [],
      availability: searchParams.get('availability')?.split(',').filter(Boolean) || [],
      dopService: searchParams.get('dopService')?.split(',').filter(Boolean) || []
    });
    getFiltersData();
    // sessionStorage.setItem('filterSideState', '');
    // getMetrosDataFunc()

    // filterForm.setValues(paramsToFormValues);
    //("fvjuec")
    //(filterForm.getValues())

    // setCostForm([paramsToFormValues.cost.min, paramsToFormValues.cost.max]);
    // filterForm.setValues(searchParams.getAll)
    // const savedData = sessionStorage.getItem('filterSideState');
    // // alert(savedData)
    // if (savedData) {
    //   filterForm.setValues(JSON.parse(savedData));
    // }
  }, []);




  const [dopsData, setDopsData] = useState(['Парковка', 'Бесконтакт. заселение', 'Отчетные документы'])
  const [availaBData, setAvailaBData] = useState<AvailbType[]>([])

  const [categoryData, setCategoryData] = useState<Type[]>([])
  const [viewData, setView] = useState<ViewType[]>([])
  const [tualetData, setTualet] = useState<Bathtype[]>([])

  const floorsData = ['Не первый', 'Не последний']

  const [additions, setAdditions] = useState<Type[]>([])
  const additionsList = (Array.isArray(additions) ? additions : []).map((tab, index) => (
    <Checkbox size="xs" mt={5} value={tab.id.toString()} label={tab.name[0].toUpperCase() + tab.name.slice(1)} color="sberGreenColor.9"
      styles={{ input: { boxShadow: "inset 1px 1px lightGray" } }} />
  ));
  const visibleAdditionsList = showAll ? additionsList : additionsList.slice(0, 3);

  const [dop, setDop] = useState<Type[]>([])
  const dopList = (Array.isArray(dop) ? dop : []).map((tab, index) => (
    <Checkbox size="xs" mt={5} value={tab.id.toString()} label={tab.name[0].toUpperCase() + tab.name.slice(1)} color="sberGreenColor.9"
      styles={{ input: { boxShadow: "inset 1px 1px lightGray" } }} />
  ));
  const visibleDopList = showAllDop ? dopList : dopList.slice(0, 3);

  const dopsList = (Array.isArray(dopsData) ? dopsData : []).map((tab, index) => (
    <Checkbox size="xs" mt={5} value={tab} label={tab} key={tab} color="sberGreenColor.9"
      styles={{ input: { boxShadow: "inset 1px 1px lightGray" } }} />
  ));

  const availList = (Array.isArray(availaBData) ? availaBData : []).map((tab, index) => (
    <Checkbox size="xs" mt={5} value={tab.id.toString()} label={tab.accessibility_type} key={tab.accessibility_type} color="sberGreenColor.9"
      styles={{ input: { boxShadow: "inset 1px 1px lightGray" } }} />
  ));

  const categoryList = (Array.isArray(categoryData) ? categoryData : []).map((tab, index) => (
    <Checkbox size="xs" mt={5} value={tab.id.toString()} label={tab.name} key={tab.id} color="sberGreenColor.9"
      styles={{ input: { boxShadow: "inset 1px 1px lightGray" } }} />
  ));

  const viewList = (Array.isArray(viewData) ? viewData : []).map((tab, index) => (
    <Radio size="xs" mt={5} value={tab.notation_view} label={tab.notation_view} key={tab.notation_view} iconColor="sberGreenColor.9" color="grayColor.0"
      styles={{ radio: { boxShadow: "inset 1px 1px lightGray" } }}
    // checked={filterForm.getInputProps('view') === tab.notation_view.toString()}
    />
  ));

  const tyaletList = (Array.isArray(tualetData) ? tualetData : []).map((tab, index) => (
    <Radio size="xs" mt={5} value={tab.bathroom_type} label={tab.bathroom_type} key={tab.bathroom_type} iconColor="sberGreenColor.9" color="grayColor.0"
      styles={{ radio: { boxShadow: "inset 1px 1px lightGray" } }} />
  ));

  const metroList = (Array.isArray(metroData) ? metroData : []).map((tab, index) => (
    <Checkbox size="xs" mt={5} value={tab.name} label={tab.name} key={tab.name} color="sberGreenColor.9"
      styles={{ input: { boxShadow: "inset 1px 1px lightGray" } }} />
  ));

  const floorsList = floorsData.map((tab, index) => (
    <Checkbox size="xs" mt={5} value={tab} label={tab} key={tab} color="sberGreenColor.9"
      styles={{ input: { boxShadow: "inset 1px 1px lightGray" } }} />
  ));

  return (
    <div
    // className="mantine-hidden-from-sm"
    >
      {/* <AppShell.Navbar p="md" style={{ gap: "10px",
    }} bg={'grayColor.2'} pos={"absolute"}> */}
      <div className={styles.buttonRow}>
        <Button size="sm" variant={isMD ? "filled" : "subtle"} w={isMD ? "" : '70px'}
          onClick={() => resetForm()} mt="md" >
          <ClearFilter width="15px" height="15px"></ClearFilter>
        </Button>
      </div>
      <div className={styles["navbar"]}
        style={{
          // position: isMD ? "absolute" : "relative",
          transform: opened ? "translateX(0)" : isMD ? "translateX(-1000%)" : "",
          transition: "transform 0.5s ease-in-out",
        }}>

        {/* ЦЕНА */}
        <Flex className="papercard" align='' direction="column" >
          <div style={{ marginLeft: 10 }}>
            <h4 className="HeadingStyle3">Цена, руб</h4>
            <Group justify="space-between">
              <NumberInput hideControls min={1} placeholder="от" size="xs" style={{ flex: 1, minWidth: 0 }}
                onValueChange={(value) => setCostForm(prev => value.value != '' || null ? [Number(value.value), prev[1]] : [0, prev[1]])}
                defaultValue={0}
                value={costForm[0]}
              // key={filterForm.key('cost.0')} 
              // {...filterForm.getInputProps('cost.0')}
              >

              </NumberInput>
              <NumberInput hideControls min={1} placeholder="до" size="xs" style={{ flex: 1, minWidth: 0 }}
                onValueChange={(value) => setCostForm(prev => value.value != '' || null ? [prev[0], Number(value.value)] : [prev[0], maxcost])}
                startValue={maxcost}
                value={costForm[1]}
              // key={filterForm.key('cost.1')} // Для uncontrolled режима
              // {...filterForm.getInputProps('cost.1')}
              >

              </NumberInput>
            </Group>
          </div>
          <RangeSlider min={0} max={maxcost} step={1} defaultValue={[0, maxcost]} mt={10}
            onChange={(value) => {
              setCostForm(value)
              //  filterForm.setFieldValue('cost', value);
            }}
            value={costForm}
            // key={filterForm.key('cost')}
            // {...filterForm.getInputProps('cost')}
            color="grayColor.3"
            style={{
              boxShadow: "0"
            }}
            styles={{ thumb: { backgroundColor: "", border: "none" } }}
            thumbSize={15}
            thumbChildren={[<Knob_Start size={15} key="1" />, <Knob_Start size={15} key="2" />]} />
          {/* <Badge color="sutkiGreenColor.4" mt={10}>9.0</Badge> */}
        </Flex>


        <Divider></Divider>


        {/* <Flex className="papercard" align='' direction="column" >
      
          <CheckboxGroup  {...filterForm.getInputProps('service')} mt={10}>
            {dopsList}
          </CheckboxGroup>
        </Flex>


        <Divider></Divider> */}

        <Flex className="papercard" align='' direction="column" >
          <div style={{ marginLeft: 10 }}>
            <h4 className="HeadingStyle3" style={{ paddingTop: 0 }}>Типы жилья</h4>
          </div>
          <CheckboxGroup  {...filterForm.getInputProps('category')} mt={10}>
            {categoryList}
          </CheckboxGroup>
        </Flex>


        <Divider></Divider>

        {/* МЕТРО РЯДОМ */}
        <Flex className="papercard" align='' direction="column" >
          <div style={{ marginLeft: 10 }}>
            <h4 className="HeadingStyle3">Метро рядом</h4>
          </div>
          <div>
            {/* <Popover width={200} position="bottom" withArrow shadow="md" keepMounted>
              <Popover.Target>
                <Button variant="outline" mt={10} size="xs" fullWidth
                  className={styles["metroButton"]}>
                  Выбрать станции
                </Button>
              </Popover.Target>
              <Popover.Dropdown style={{ overflowY: "scroll", maxHeight: "200px" }}>
                <CheckboxGroup key={filterForm.values.near_metros.join(',')} {...filterForm.getInputProps('near_metros')} mt={10}>
                  {metroList}
                </CheckboxGroup>
              </Popover.Dropdown>
            </Popover> */}

            <Button variant="outline" mt={10} size="xs" fullWidth onClick={openMetroModal}
              className={styles["metroButton"]}>
              Выбрать станции
            </Button>
          </div>
        </Flex>


        <Divider></Divider>

        {/* КОМНАТЫ*/}
        <Flex className="papercard" align='' direction="column" >
          {/* <div style={{ marginLeft: 10 }}>
            <h4 className="HeadingStyle3">Комнаты</h4>
          </div>
          <Group justify="space-between" mt={10}>
            <NumberInput hideControls min={1} placeholder="от" size="xs" style={{ flex: 1, minWidth: 0 }}  {...filterForm.getInputProps('amount_rooms_min')}></NumberInput>
            <NumberInput hideControls min={1} placeholder="до" size="xs" style={{ flex: 1, minWidth: 0 }}  {...filterForm.getInputProps('amount_rooms_max')}></NumberInput>
          </Group> */}

          <div style={{ marginLeft: 10 }}>
            <h4 className="HeadingStyle3">Спальные места</h4>
          </div>
          <Group justify="space-between" mt={10}>
            <NumberInput hideControls min={1} placeholder="от" size="xs" style={{ flex: 1, minWidth: 0 }}  {...filterForm.getInputProps('amount_sleeps_min')}></NumberInput>
            <NumberInput hideControls min={1} placeholder="до" size="xs" style={{ flex: 1, minWidth: 0 }}  {...filterForm.getInputProps('amount_sleeps_max')}></NumberInput>
          </Group>
        </Flex>


        <Divider></Divider>

        {/* ЭТАЖИ */}
        <Flex className="papercard" align='' direction="column" >
          <div style={{ marginLeft: 10 }}>
            <h4 className="HeadingStyle3">Этаж</h4>
          </div>
          <Group justify="space-between" mt={10} mb={5}>
            <NumberInput hideControls min={1} placeholder="от" size="xs" style={{ flex: 1, minWidth: 0 }}  {...filterForm.getInputProps('floor_start')}></NumberInput>
            <NumberInput hideControls min={1} placeholder="до" size="xs" style={{ flex: 1, minWidth: 0 }}  {...filterForm.getInputProps('floor_finish')}></NumberInput>
          </Group>
          {floorsList}
          {/* <Checkbox size="xs" mt={5} onClick={() => setNotFirst(!notFirst)} label={"Не первый"} color="sberGreenColor.9"
            styles={{ input: { boxShadow: "inset 1px 1px lightGray" } }} /> */}

          {/* <Button variant="outline" mt={10} size="compact-xs" fullWidth className={styles["metroButton"]}>Выбрать станции</Button> */}

        </Flex>
        <Divider></Divider>

        {/* Площадь */}
        <Flex className="papercard" align='' direction="column" >
          <div style={{ marginLeft: 10 }}>
            <h4 className="HeadingStyle3">Площадь, м²</h4>
          </div>
          <Group justify="space-between" mt={10}>
            <NumberInput hideControls min={1} placeholder="от" size="xs" style={{ flex: 1, minWidth: 0 }}  {...filterForm.getInputProps('space_min')}></NumberInput>
            <NumberInput hideControls min={1} placeholder="до" size="xs" style={{ flex: 1, minWidth: 0 }}  {...filterForm.getInputProps('space_max')}></NumberInput>
          </Group>
          {/* <Checkbox size="xs" mt={5} onClick={() => setNotFirst(!notFirst)} label={"Не первый"} color="sberGreenColor.9"
            styles={{ input: { boxShadow: "inset 1px 1px lightGray" } }} /> */}

          {/* <Button variant="outline" mt={10} size="compact-xs" fullWidth className={styles["metroButton"]}>Выбрать станции</Button> */}

        </Flex>
        <Divider></Divider>

        {/* ВИД ИЗ ОКНА */}
        <Flex className="papercard" align='' direction="column" >
          <div style={{ marginLeft: 10 }}>
            <h4 className="HeadingStyle3">Вид из окна</h4>
          </div>
          <Radio.Group value={filterForm.values.view}
            onChange={handleRadioChange} mt={10}>
            {viewList}
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

        {/* САНУЗЕЛ */}
        <Flex className="papercard" align='' direction="column" >
          <div style={{ marginLeft: 10 }}>
            <h4 className="HeadingStyle3">Санузел</h4>
          </div>
          <Radio.Group  {...filterForm.getInputProps('toilet')} mt={10}>
            {tyaletList}
          </Radio.Group>
          <Button size="xs" onClick={() => filterForm.setFieldValue('toilet', null)} mt="md" disabled={!filterForm.values.toilet}>
            Сбросить выбор
          </Button>
          {/* <Checkbox size="xs" mt={5} onClick={() => setNotFirst(!notFirst)} label={"Не первый"} color="sberGreenColor.9"
            styles={{ input: { boxShadow: "inset 1px 1px lightGray" } }} /> */}

          {/* <Button variant="outline" mt={10} size="compact-xs" fullWidth className={styles["metroButton"]}>Выбрать станции</Button> */}

        </Flex>
        <Divider></Divider>


        {/* В ПОМЕЩЕНИИ */}
        <Flex className="papercard" align='' direction="column" >
          <div style={{ marginLeft: 10 }}>
            <h4 className="HeadingStyle3">В помещении</h4>
          </div>
          <div>
            <CheckboxGroup {...filterForm.getInputProps('inRoom')} mt={10}>
              {visibleAdditionsList}
            </CheckboxGroup>
            <div style={{ textAlign: "center" }}>
              {additionsList.length > 3 && (
                <Button
                  variant="subtle"
                  size="sm"
                  mt="xs"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? 'Скрыть' : `Показать все (${additionsList.length})`}
                </Button>
              )}
            </div>

          </div>
        </Flex>

        <Divider></Divider>

        {/* ДОСТУПНОСТЬ */}
        <Flex className="papercard" align='' direction="column" >
          <div style={{ marginLeft: 10 }}>
            <h4 className="HeadingStyle3" style={{ paddingTop: 0 }}>Доступность</h4>
          </div>
          <CheckboxGroup  {...filterForm.getInputProps('availability')} mt={10}>
            {availList}
          </CheckboxGroup>
        </Flex>


        <Divider></Divider>

        {/* ДОП УСЛУГИ */}
        <Flex className="papercard" align='' direction="column" >
          <div style={{ marginLeft: 10 }}>
            <h4 className="HeadingStyle3">Доп. услуги</h4>
          </div>
          <div>
            <CheckboxGroup {...filterForm.getInputProps('dopService')} mt={10}>
              {visibleDopList}
            </CheckboxGroup>
            <div style={{ textAlign: "center" }}>
              {dopList.length > 3 && (
                <Button
                  variant="subtle"
                  size="sm"
                  mt="xs"
                  onClick={() => setShowAllDop(!showAllDop)}
                >
                  {showAllDop ? 'Скрыть' : `Показать все (${dopList.length})`}
                </Button>
              )}
            </div>

          </div>
        </Flex>
        <div className={styles.buttonRowMobile}>
          <Button size="sm" variant={isMD ? "filled" : "subtle"} fullWidth m={0}
            onClick={() => resetForm()} mt="md" >
            <Group>
              <ClearFilter width="15px" height="15px"></ClearFilter> Очистить фильтры
            </Group>
          </Button>
          <Button size="sm" variant={isMD ? "filled" : "subtle"} fullWidth m={0} color="sberGreenColor.9"
            onClick={() => closeApply()} mt="md" >
            Применить фильтры
          </Button>
        </div>
      </div>


    </div>
  )

}

