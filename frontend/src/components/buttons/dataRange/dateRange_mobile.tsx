import { useState, useRef, useEffect, useImperativeHandle } from 'react';
import { DatePickerInput, DatePicker } from '@mantine/dates';
import { Box, Popover, ScrollArea, Group, Text, ActionIcon, Divider, stylesToString, Flex, Button } from '@mantine/core';
// import { IconCalendar, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { forwardRef } from 'react';
import { LiaTimesSolid } from "react-icons/lia";
import styles from './dateRange.module.css'
import { declineNightsWord } from '../../../handlers/pravopisanieHandler';

interface DoubleDateRangePickerProps {
  value?: [Date | null, Date | null];
  onChange: (value: [Date | null, Date | null]) => void;
  onBlur?: () => void;
  excludeDate?: (date: Date) => boolean;
  className?: string
}


export const DoubleDateRangePickerMobile = forwardRef<HTMLButtonElement, DoubleDateRangePickerProps>(
  ({ value = [null, null], onChange, onBlur, excludeDate, className = 'datePicker' }, ref) => {

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const [isSettingOut, setIsSettingOut] = useState(false);
    const [isSettingIn, setIsSettingIn] = useState(false);

    const [currentMonth, setCurrentMonth] = useState(new Date());
    //("month")
    //(currentMonth)
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const isMobile = useMediaQuery('(max-width: 48em)');
 const isSM = useMediaQuery('(max-width: 30em)');

    const calculateNights = ([start, end]) => 
  start && end ? Math.max(0, Math.floor((end- start) / 86400000)) : 0;

    useImperativeHandle(ref, () => {
      return {
        focus() {
          setIsPopoverOpen(true)
        },
      };
    }, []);




    const [date, setDate] = useState(new Date());

    function generateMonths() {
      const now = new Date();
      const currentYear: number = now.getFullYear();
      const currentMonth: number = now.getMonth();

      const months = [];

      const startFrom = currentMonth;
      const startYear = currentYear;


      for (let month = startFrom; month < 12; month++) {
        months.push(new Date(startYear, month, 1));
      }
      for (let month = 0; month <= startFrom; month++) {
        months.push(new Date(currentYear + 1, month, 1));
      }

      return months;
    };

    const months = generateMonths();

    function scrollToMonth(month: Date) {
      setCurrentMonth(new Date(month));
      // const index = months.findIndex(m =>
      //   m.getMonth() === month.getMonth() && m.getFullYear() === month.getFullYear()
      // );
      // if (scrollAreaRef.current && index >= 0) {
      //   const itemHeight = 40; // Высота одного элемента месяца
      //   scrollAreaRef.current.scrollTo({ top: index * itemHeight, behavior: 'smooth' });
      // }
    };

    // function handleScroll() {
    //   if (scrollAreaRef.current) {
    //     const scrollTop = scrollAreaRef.current.scrollTop;
    //     const itemHeight = 40;
    //     const visibleIndex = Math.floor(scrollTop / itemHeight);
    //     if (visibleIndex >= 0 && visibleIndex < months.length) {
    //       setCurrentMonth(new Date(months[visibleIndex]));
    //     }
    //   }
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
          position="bottom"
          withinPortal
          zIndex={1000}
          shadow="md"
          withOverlay
          overlayProps={{ blur: '8px' }}
          transitionProps={{
            transition: 'slide-up',
            duration: 300,
            timingFunction: 'ease-out'
          }}

        >
          <Popover.Target>
            <Box style={{ display: className === 'datePicker' ? isMobile ? 'block' : 'flex' : 'flex', gap: '20px' }}>
              {/* <LiaTimesSolid /> */}
              <div className={styles.dateContainer}>
                <DatePickerInput
                  styles={{
                    wrapper: {
                      margin: 0
                    },
                    root: {
                      width: className === 'datePicker' ? '140px' : "100%"
                    }
                  }}
                  size={className === 'datePicker' ? "sm" : className === 'datePickerMobile' ? 'md' : 'sm'}
                  description={className === 'datePicker' ?
                    isMobile ? "" : "Дата заезда" : ""
                  }
                  placeholder={className === 'datePicker' ?
                    isMobile ? "Дата заезда" : "" :
                    className === 'datePickerMobile' ? "Заезд" : 'от'
                  }
                  clearable
                  className={className}
                  variant={className === 'datePicker' ? "unstyled" : 'default'}
                  // valueFormat="DD/MM/YYYY"
                  valueFormat="DD MMM, dd"
                  locale="ru"
                  value={value[0]}
                  onClick={() => { setIsPopoverOpen(true); setIsSettingIn(true) }}
                  readOnly
                // onBlur={onBlur}
                // style={{
                //   '& .mantine-DatePickerInputInput': {
                //     cursor: 'pointer',
                //   },
                // }}
                />
                {className === 'datePicker' ? value[0] ?
                  <LiaTimesSolid className={styles.rightSection} onClick={() => { onChange([null, value[1]]); setIsPopoverOpen(true) }} />
                  : "" : ""}
              </div>

              {className === 'datePicker' ? <Divider orientation="vertical" p={0} m={0} /> : ''}

              <div className={styles.dateContainer}>
                <DatePickerInput
                  styles={{
                    wrapper: {
                      margin: 0
                    },
                    root: {
                      margin: 0,
                      width: className === 'datePicker' ? '140px' : "100%"
                    }
                  }}
                  // rightSection={<LiaTimesSolid />}
                  description={className === 'datePicker' ? isMobile ? "" : "Дата выезда" : ''}
                  placeholder={className === 'datePicker' ?
                    isMobile ? "Дата выезда" : "" :
                    className === 'datePickerMobile' ? "Выезд" : 'до'
                  }
                  className={className}
                  variant={className === 'datePicker' ? "unstyled" : 'default'}
                  clearable
                  size={className === 'datePicker' ? "sm" : className === 'datePickerMobile' ? 'md' : 'sm'}
                  // valueFormat="DD/MM/YYYY"
                  valueFormat="DD MMM, dd"
                  locale="ru"
                  value={value[1]}
                  onClick={() => { setIsPopoverOpen(true); setIsSettingOut(true) }}
                  readOnly
                // icon={<IconCalendar size="1rem" />}

                // style={{
                //   '& .mantine-DatePickerInput-input': {
                //     cursor: 'pointer',
                //     // maxWidth: '240px',
                //   },
                // }}
                />
                {className === 'datePicker' ? value[1] ?
                  <LiaTimesSolid className={styles.rightSection} onClick={() => { onChange([value[0], null]); setIsPopoverOpen(true) }} />
                  : "" : ''}
              </div>

              {className === 'datePicker' ? <Divider orientation="vertical" p={0} m={0} /> : ''}

            </Box>
          </Popover.Target>

          <Popover.Dropdown p={0}>
            <Flex direction={'column'}>
              {/* Боковая панель с месяцами */}
              {/* <Box
                style={{
                  width: isMobile ? '80px' : '120px',
                  borderRight: '1px solid #e9ecef',
                  backgroundColor: '#f8f9fa',
                }}
              >
                <ScrollArea
                  viewportRef={scrollAreaRef}
                  // onScrollPositionChange={handleScroll}
                  style={{ height: '300px' }}
                >
                  {months.map((month) => (
                    <Box
                      key={`${month.getMonth()}-${month.getFullYear()}`}
                      style={{
                        padding: '10px',
                        cursor: 'pointer',
                        backgroundColor:
                          month.getMonth() === currentMonth.getMonth() &&
                            month.getFullYear() === currentMonth.getFullYear()
                            ? '#e9ecef'
                            : 'transparent',
                        '&:hover': {
                          backgroundColor: '#e9ecef',
                        },
                      }}
                      onClick={() => scrollToMonth(month)}
                    >
                      <Text size="sm" align="center">
                        {month.toLocaleString('ru', { month: 'long', year: 'numeric' })}
                      </Text>
                    </Box>
                  ))}
                </ScrollArea>
              </Box> */}
              <Box
                style={{
                  height: "",
                  borderBottom: '1px solid #e9ecef',
                  backgroundColor: '#f8f9fa',
                  padding: 16
                }}>
                <h3 className={'HeadingStyle3'} style={{ color: "var(--mantine-color-grayColor-8" }}>
                  {!value[1] || isSettingOut ? "Введите дату выезда" : "Введите дату заезда"}
                </h3>
              </Box>
              {/* Основной календарь */}
              <Box style={{ padding: '20px', paddingBottom: 0 }}>
                <DatePicker
                  size={isSM ? 'sm' : 'md'}
                  locale="ru"
                  type="range"
                  value={value}
                  onChange={(newValue) => {
                    if (isSettingOut) {
                      const updatedValue = [value[0], newValue[1]];
                      onChange(updatedValue);
                      setIsSettingOut(false)
                    }
                    // if (isSettingIn) {
                    //   const updatedValue = [newValue[0], value[1]];
                    //   onChange(updatedValue);
                    // }
                    else {
                      onChange(newValue);
                    }
                    // if (newValue[0] && newValue[1]) {
                    //   setIsPopoverOpen(false);
                    //   if (onBlur) onBlur();
                    // }
                  }}
                  numberOfColumns={1}
                  onDateChange={(date) => {
                    setCurrentMonth(date);
                    scrollToMonth(date);
                  }}
                  minDate={new Date()}
                  date={currentMonth}
                  maxDate={months[months.length - 1]}
                  excludeDate={excludeDate || (() => false)}
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
                />
                <Group px="md" pb="sm">
                  {/* <ActionIcon
                  size="sm"
                  onClick={() => {
                    const prevMonth = new Date(currentMonth);
                    prevMonth.setMonth(prevMonth.getMonth() - 1);
                    // Проверяем, чтобы не выйти за пределы допустимого диапазона
                    if (prevMonth >= months[0]) {
                      scrollToMonth(prevMonth);
                    }
                  }}
                  disabled={currentMonth <= months[0]}
                >
                  <IconChevronUp size={16} />
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  onClick={() => {
                    const nextMonth = new Date(currentMonth);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    // Проверяем, чтобы не выйти за пределы допустимого диапазона
                    if (nextMonth <= months[months.length - 1]) {
                      scrollToMonth(nextMonth);
                    }
                  }}
                  disabled={currentMonth >= months[months.length - 1]}
                >
                  <IconChevronDown size={16} />
                </ActionIcon> */}
                </Group>
              </Box>
              <Box style={{
                backgroundColor: '#f8f9fa',
                padding: '16px'
              }}>
                <Button fullWidth size='md'
                  color="var(--mantine-color-orangeColor-6)"

                  onClick={() => {
                    // setIsSettingIn(false)
                    setIsPopoverOpen(false);
                    //   if (onBlur) onBlur();
                  }}>
                  Выбрать {!value[1] ? "дату заезда" : calculateNights(value) + " " + declineNightsWord(calculateNights(value))}
                </Button>
              </Box>
            </Flex>
          </Popover.Dropdown>
        </Popover>
      </Box>
    );
  });

DoubleDateRangePickerMobile.displayName = 'DoubleDateRangePickerMobile';