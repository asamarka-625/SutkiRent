import { useState, useRef, useEffect, useImperativeHandle, useMemo } from 'react';
import { DatePickerInput, DatePicker } from '@mantine/dates';
import { Box, Popover, ScrollArea, Group, Text, ActionIcon, Divider, stylesToString, NumberInput, Button, Input, Select, TextInput } from '@mantine/core';
import Plus from "../../../icons/Plus.svg?react";
import Trash from "../../../icons/Trash.svg?react";
import { useCounter, useMediaQuery } from '@mantine/hooks';
import { forwardRef } from 'react';
import { LiaTimesSolid } from "react-icons/lia";
import ArrowSVG from "../../../icons/ArrowDropDown.svg?react";
import styles from './guestButton.module.css'
import { declineAdultsWord, declineKidsWord } from '../../../handlers/pravopisanieHandler';
// import { event } from 'yandex-maps';

interface GuestProps {
  value?: [number, number];
  onChange: (value: [number, number]) => void;
  onBlur?: () => void;
}

type KidsAdd = {
  age: string;
}
const kidsInitialValue: KidsAdd[] = [{ age: "" }];

export const GuestPicker = forwardRef<HTMLButtonElement, GuestProps>(
  ({ value: externalValue, onChange, onBlur }, ref) => {


    const value = useMemo(() => {
      if (Array.isArray(externalValue) && externalValue.length >= 2) {
       return   [
        externalValue[0] && externalValue[0] !== 0 ? externalValue[0] : 1,
        externalValue[1] && externalValue[1] !== 0 ? externalValue[1] : 1
        ]
      }
      return [1, 1];
    }, [externalValue]);

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const minValue = 1;
    const maxValue = 10;
    // const [currentMonth, setCurrentMonth] = useState(new Date());
    //("month")
    //(currentMonth)
    // const scrollAreaRef = useRef<HTMLDivElement>(null);
    // const date0 = useRef<HTMLDivElement>(null);
    // const date1 = useRef<HTMLDivElement>(null);
    const isMobile = useMediaQuery('(max-width: 48em)');
    const [kidsToAdd, setKidsToAdd] = useState([]);
    const [kidsCount, setKidsCount] = useState(0);
    const [kidsToChoose, setKidsToChoose] = useState([
      'до 1 года',
      '1 год',
      ...[2, 3, 4].map(n => `${n} года`),
      ...[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(n => `${n} лет`)
    ]);

    useImperativeHandle(ref, () => {
      return {
        focus() {
          setIsPopoverOpen(true)
        },
      };
    }, []);


    function addKidsSelector() {
      setKidsToAdd([...kidsToAdd, ""]); // Добавляем новое пустое поле
      setKidsCount(kidsCount + 1)// Увеличиваем счетчик детей
    }

    function deleteKidsSelector(index: number) {
      const newSelectors = [...kidsToAdd];
      newSelectors.splice(index, 1); // Удаляем поле по индексу
      setKidsToAdd(newSelectors);
      setKidsCount(kidsCount - 1) // Уменьшаем счетчик детей
    }

    function handleKidsSelect(index: number, e: React.ChangeEvent<HTMLSelectElement>) {
      const newSelectors = [...kidsToAdd];
      newSelectors[index] = e.target.value;
      setKidsToAdd(newSelectors);
    }



    // const [date, setDate] = useState(new Date());

    // function generateMonths() {
    //   const now = new Date();
    //   const currentYear: number = now.getFullYear();
    //   const currentMonth: number = now.getMonth();

    //   const months = [];

    //   const startFrom = currentMonth;
    //   const startYear = currentYear;


    //   for (let month = startFrom; month < 12; month++) {
    //     months.push(new Date(startYear, month, 1));
    //   }
    //   for (let month = 0; month <= startFrom; month++) {
    //     months.push(new Date(currentYear + 1, month, 1));
    //   }

    //   return months;
    // };

    // const months = generateMonths();

    // function scrollToMonth(month: Date) {
    //   setCurrentMonth(new Date(month));
    //   // const index = months.findIndex(m =>
    //   //   m.getMonth() === month.getMonth() && m.getFullYear() === month.getFullYear()
    //   // );
    //   // if (scrollAreaRef.current && index >= 0) {
    //   //   const itemHeight = 40; // Высота одного элемента месяца
    //   //   scrollAreaRef.current.scrollTo({ top: index * itemHeight, behavior: 'smooth' });
    //   // }
    // };



    // При открытии поповера скроллим к текущему месяцу

    // useEffect(() => {
    //   if (isPopoverOpen) {
    //     setTimeout(() => {
    //       scrollToMonth(currentMonth);
    //     }, 0);
    //   }
    // }, [isPopoverOpen]);


    return (
      <Box>
        <Popover
          opened={isPopoverOpen}
          onChange={setIsPopoverOpen}
          position="bottom-start"
          withinPortal
          zIndex={1000}
          shadow="md"
        >
          <Popover.Target>
            <Box style={{ display: isMobile ? 'block' : 'flex', gap: '20px', }}>
              {/* <LiaTimesSolid /> */}
              <TextInput
                styles={{
                  wrapper: {
                    margin: 0
                  },
                }}
                // hideControls
                value={
                  `${value[0]}${declineAdultsWord(value[0])}${kidsCount > 0 ? `, ${kidsCount} ${declineKidsWord(kidsCount)}` : ''}`
                }
                description={isMobile ? "" : "Количество гостей"}
                placeholder={isMobile ? "Количество гостей" : ""}
                className="numbInput"
                variant={isMobile ? "default" : "unstyled"}
                size={isMobile ? "md" : "sm"}
                onClick={() => setIsPopoverOpen(true)}
                readOnly
                onBlur={onBlur}
                rightSectionPointerEvents="auto"
                rightSection={<ArrowSVG width="20px" height="20px" />}
                rightSectionProps={{
                  onClick: () => setIsPopoverOpen(true),
                  style: {
                    cursor: 'pointer',
                  }
                }}
              />
            </Box>
          </Popover.Target>

          <Popover.Dropdown p={0}>
            <Group noWrap>
              <Box style={{ width: '270px' }}>
                {/* <DatePicker
                size={isMobile ? "xs" : 'sm'}
                locale="ru"
                type="range"
                value={value}
                onChange={(newValue) => {
                  onChange(newValue);
                  if (newValue[0] && newValue[1]) {
                    setIsPopoverOpen(false);
                    if (onBlur) onBlur();
                  }
                }}
                numberOfColumns={1}
                onDateChange={(date) => {
                  setCurrentMonth(date);
                  scrollToMonth(date);
                }}
                minDate={new Date()}
                date={currentMonth}
                maxDate={months[months.length - 1]}
                style={{
                  '& .mantine-DatePicker-month': {
                    padding: '10px',
                    width: '100%',
                  },
                  '& .mantine-DatePicker-monthCell': {
                    height: '36px',
                  },
                  '& .mantine-DatePicker-weekday': {
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  '& .mantine-DatePicker-day': {
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                }}
              /> */}
                <Group p={10} justify='space-between' ml={10}>
                  <div>
                    <h3 style={{ width: "80px", lineHeight: "25px" }} className='HeadingStyle3'>Взрослые</h3>
                    <span>от 18 лет</span>
                  </div>

                  <Group align='center' mt={5}>
                    <Button className={styles.buttonControl}
                      onClick={() => onChange([+value[0] - 1, value[1]])}
                      disabled={value[0] === minValue}>-</Button>

                    <h2 style={{ fontSize: "18px" }}>{value[0]}</h2>

                    <Button className={styles.buttonControl}
                      onClick={() => onChange([+value[0] + 1, value[1]])}
                      disabled={value[0] === maxValue}>+</Button>

                  </Group>
                </Group>

                <Group p={10} justify='space-between' ml={10}>
                  {kidsToAdd.map((selectedAge, index) => (
                    <Group key={index} align="center" mb={5}>
                      <Select
                        styles={{
                          dropdown: {
                            zIndex: 10000
                          },
                        }}
                        comboboxProps={{ withinPortal: false }}
                        onClick={(event) => event.stopPropagation()}
                        data={kidsToChoose}
                        value={selectedAge}

                        onChange={(value) => handleKidsSelect(index, { target: { value } } as React.ChangeEvent<HTMLSelectElement>)}
                        placeholder="Выберите возраст ребенка"
                        style={{ flex: 1 }}
                      />
                      <ActionIcon
                        color="red"
                        onClick={() => deleteKidsSelector(index)}
                        variant="outline"
                      >
                        <Trash size={16} />
                      </ActionIcon>
                    </Group>
                  ))}

                  <Button
                    fullWidth
                    onClick={addKidsSelector}
                    leftSection={<Plus size={16} />}
                    variant="transparent"
                  >
                    Добавить ребенка
                  </Button>
                </Group>

                <Group p={10} pb={20} justify='space-between' ml={10}>
                  <div>
                    <h3 style={{ width: "80px", lineHeight: "25px" }} className='HeadingStyle3'>Комнаты</h3>
                    <span>или номера</span>
                  </div>

                  <Group align='center' mt={5}>
                    <Button className={styles.buttonControl}
                      onClick={() => onChange([value[0], value[1] + - 1])}
                      disabled={value[1] <= minValue}>-</Button>

                    <h2 style={{ fontSize: "18px" }}>{value[1]}</h2>

                    <Button className={styles.buttonControl}
                      onClick={() => onChange([value[0], value[1] + + 1])}
                      disabled={value[1] >= maxValue}>+</Button>
                  </Group>
                </Group>
              </Box>
            </Group>
          </Popover.Dropdown>
        </Popover>
      </Box >
    );
  });

GuestPicker.displayName = 'GuestPicker';