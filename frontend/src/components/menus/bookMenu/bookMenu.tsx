import { AppShell, Button, Checkbox, CheckboxGroup, Divider, Flex, Group, Input, Loader, NumberInput, Paper, Popover, RangeSlider, Select, Text, Textarea, TextInput } from "@mantine/core";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import styles from "./bookMenu.module.css";
import Knob_Start from "..//..//..//icons/Knob_Start.svg?react"
import { useForm } from "@mantine/form";
import { useMediaQuery } from "@mantine/hooks";
import { DateInput } from "@mantine/dates";
import 'dayjs/locale/ru';
import { IconChevronDown, IconX } from "@tabler/icons-react";
import { IMaskInput } from 'react-imask';
import { getObjectCalendar, getObjectCostByDate, setBron } from "../../../services/objectsServices.ts";
import { errorHandler } from "../../../handlers/errorBasicHandler.ts";
import { showNotification } from "@mantine/notifications";
import { DoubleDateRangePicker } from "../../buttons/dateRange_copy.tsx";
import { declineGuestWord } from "../../../handlers/pravopisanieHandler.ts";

// export function logOut() {
//   const navigate = useNavigate();
//   navigate("/partners")
//   // window.location.href = "/auth";

// }


type Props = {
  cost: number,
  capacity: number
}



function getFloorError(floor_finish: string, value: string) {

  if (parseInt(value, 10) > parseInt(floor_finish, 10))
    return "Ошибка диапозона этажей";
  // const diap = (parseInt(value, 10) + parseInt(floor_finish, 10))-1
  // var i
  // for (i in diap) {...
  // }
  return null
}


function getCalendarError(floor_finish: string, value: string) {

  if (parseInt(value, 10) > parseInt(floor_finish, 10))
    return "Ошибка диапозона этажей";
  // const diap = (parseInt(value, 10) + parseInt(floor_finish, 10))-1
  // var i
  // for (i in diap) {...
  // }
  return null
}

export function BookMenu(props: Props) {
  const navigate = useNavigate()
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookingSubmitted, setBookingSubmitted] = useState<boolean>(false);

  function getPeopleData() {
    // Если capacity отсутствует, используем безопасный дефолт (например, 10)
    const maxGuests = Number(props.capacity) && Number(props.capacity) > 0 ? Number(props.capacity) : 10;
    const peopleDataTemp: string[] = [];
    for (let i = 1; i <= maxGuests; i++) {
      peopleDataTemp.push(i + " " + declineGuestWord(i));
    }
    return peopleDataTemp;
  }



  const [peopleData, setPeopleData] = useState<string[]>([''])
  const [costData, setCostData] = useState<number>()
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const guestTabs = peopleData.map((item, index) => ({
    value: (index + 1).toString(),
    label: item.toString(),
  }
  ));
  // console.log(guestTabs)


  const isMD = useMediaQuery('(max-width: 64em)');
  const ref = useRef(null);
  // Получаем выбранные категории и объединяем в строку
  const [datein, setDatein] = useState<Date | null>(() => {
    const tomorrow = new Date();
    return tomorrow;
  });
  const [dateout, setDateout] = useState<Date | null>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });


  const bookForm = useForm({
    mode: 'controlled',
    initialValues: {
      in: [null, null] as [Date | null, Date | null],
      out: dateout,
    },
    validate: {
    },
    onValuesChange: (values, previousValues) => {
      if (!previousValues) return;

      if (values.in !== previousValues.in || values.out !== previousValues.out) {
        getObjectsCalendar();
      }
    }
  });

  const [bonusBalance, setBonusBalance] = useState<number>(0);
  const [useBonuses, setUseBonuses] = useState<number>(0);

  // Загружаем баланс бонусов пользователя
  useEffect(() => {
    async function loadBonusBalance() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('/api/auth/bonus/info/', {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.balance) {
            setBonusBalance(parseFloat(data.balance) || 0);
          }
        }
      } catch (error) {
        console.error('Error loading bonus balance:', error);
      }
    }
    loadBonusBalance();
  }, []);

  const bookFormDetails = useForm({
    mode: 'uncontrolled',
    initialValues: {
      guest: 1,
      phone: '',
      email: '',
      fam: '',
      name: '',
      wish: '',
      promo: '',
      bonuses: 0,
      additional_phone: ''
    },
    validate: {
      phone: (value) => {
        const digits = (value || '').replace(/[^0-9]/g, '');
        // +7 (XXX) XXX-XX-XX => 11 цифр вместе с ведущей 7
        return digits.length === 11 ? null : 'Заполните, пожалуйста';
      },
      name: (value) => (value && value.trim().length > 0 ? null : 'Заполните, пожалуйста'),
      fam: (value) => (value && value.trim().length > 0 ? null : 'Заполните, пожалуйста'),
    },
  });

  useEffect(() => {
    bookForm.setValues({
      in: [searchParams.get('in_start') ? new Date(searchParams.get('in_start')!) : datein, 
         searchParams.get('in_end') ? new Date(searchParams.get('in_end')!) : dateout],
    });
    
    // Автозаполнение данных пользователя в форму бронирования
    const loadUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) return;
        
        const response = await fetch('/api/auth/profile/', {
          headers: {
            'Authorization': `Token ${token}`,
          },
        });
        
        if (response.ok) {
          const profile = await response.json();
          
          // Форматируем телефон для отображения
          const formatPhone = (phone: string) => {
            if (!phone) return '';
            const digits = phone.replace(/\D/g, '');
            if (digits.length === 11 && digits.startsWith('7')) {
              return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
            }
            return phone;
          };
          
          bookFormDetails.setValues({
            fam: profile.last_name || '',
            name: profile.first_name || '',
            phone: formatPhone(profile.phone || ''),
            email: profile.email || '',
          });
        }
      } catch (error) {
        console.error('Error loading user profile for booking:', error);
      }
    };
    
    loadUserData();
  }, []);

  async function getObjectsCost() {
    const inDate = new Date(bookForm.getValues().in[0] || '');
    const outDate = new Date(bookForm.getValues().in[1] || '');

    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
      setCostData(0);
      setIsCostLoading(false);
      return;
    }

    const formattedDateToday = formatDateLocal(inDate);
    const formattedDateTomo = formatDateLocal(outDate);

    setIsCostLoading(true);
    try {
      const response = await getObjectCostByDate(id || '', formattedDateToday, formattedDateTomo)
      if (response.ok) {
        const data = await response.json();
        setCostData(data.price.details.amount);
      }
      else {
        setCostData(0)
      }
    } catch (error) {
      console.error('Error getting object cost:', error);
      setCostData(0);
    } finally {
      setIsCostLoading(false);
    }
  }

  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCostLoading, setIsCostLoading] = useState(false);
  const [costOneDay, setCostOneDay] = useState("");

  const formatDateLocal = (d: Date) => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  async function getObjectsCalendar() {
    setIsLoading(true);
    const inDate = new Date(bookForm.getValues().in[0] || '');
    if (isNaN(inDate.getTime())) {
      setIsAvailable(null);
      setIsLoading(false);
      return;
    }
    // Устанавливаем начальную дату как сегодня (или другую логичную дату)
    const startDate = new Date(); // или можно использовать минимально возможную дату
    const formattedDateToday = formatDateLocal(startDate);

    // Добавляем месяц к выбранной дате въезда
    const endDate = new Date(inDate);
    endDate.setMonth(endDate.getMonth() + 3);
    const formattedDateEnd = formatDateLocal(endDate);

    const inToDate = new Date(inDate);
    inToDate.setMonth(inToDate.getMonth() - 3);
    const formattedinToDate = formatDateLocal(inToDate);


    // const inDate = new Date(bookForm.getValues().in || '');
    // const formattedDateToday = inDate.toISOString().split('T')[0];
    // const twoMonthsLater = new Date(inDate);
    // twoMonthsLater.setMonth(twoMonthsLater.getDate() + 30);
    // const formattedDateTwo = twoMonthsLater.toISOString().split('T')[0];

    const response = await getObjectCalendar(id || '', formattedinToDate, formattedDateEnd)
    if (response.ok) {
      const data = await response.json();
      const calendar = Array.isArray(data.calendar) ? data.calendar : [];
      const unavailableDates = calendar
        .filter(day => !day.available)
        .map(day => new Date(day.date));
      // console.log("ПИ")
      // console.log(unavailableDates)
      setDisabledDates(unavailableDates);
      getObjectsCost();

      // Определяем доступность выбранного интервала дат по календарю RC
      const range = bookForm.getValues().in as [Date | null, Date | null];
      const start = range?.[0] ? new Date(range[0]) : null;
      const end = range?.[1] ? new Date(range[1]) : null;

      if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const startStr = formatDateLocal(start);
        const endStr = formatDateLocal(end);

        const msPerDay = 24 * 60 * 60 * 1000;
        const nights = Math.max(0, Math.round((end.getTime() - start.getTime()) / msPerDay));

        let available = true;

        // Проверяем, что все дни в интервале [start, end) доступны
        for (let d = new Date(start); d < end; d = new Date(d.getTime() + msPerDay)) {
          const dayStr = formatDateLocal(d);
          const dayInfo = calendar.find((item: any) => item.date === dayStr);
          if (!dayInfo || dayInfo.available === false) {
            available = false;
            break;
          }
        }

        // Проверяем min_stay и ограничения заезда/выезда, если всё ещё доступно
        if (available) {
          const startDayInfo = calendar.find((item: any) => item.date === startStr);
          const endDayInfo = calendar.find((item: any) => item.date === endStr);

          // Нельзя заезжать в дату с closed_on_arrival
          if (startDayInfo?.closed_on_arrival) {
            available = false;
          }

          // Нельзя выезжать в дату с closed_on_departure
          if (available && endDayInfo?.closed_on_departure) {
            available = false;
          }

          // Проверяем минимальный срок проживания
          const minStay = startDayInfo?.min_stay;
          if (available && typeof minStay === 'number' && minStay > 0 && nights > 0 && nights < minStay) {
            available = false;
          }
        }

        setIsAvailable(available);

        // Стоимость одного дня — по дате заезда
        const startDay = calendar.find((item: any) => item.date === startStr);
        const price = startDay?.price ?? null;
        setCostOneDay(price != null ? String(price) : "");
      } else {
        // Некорректный интервал — считаем, что данных недостаточно
        setIsAvailable(null);
        setCostOneDay("");
      }
    }
    else {
      setCostData(0)
      setIsAvailable(false)
    }

    setIsLoading(false);
  }

  async function setBronya() {
    // setIsLoading(true);
    const validation = bookFormDetails.validate();
    if (validation.hasErrors) {
      // не отправляем запрос при локальных ошибках формы
      return;
    }
    const range = bookForm.getValues().in as [Date | null, Date | null];
    const start = range?.[0] ? new Date(range[0]) : null;
    const end = range?.[1] ? new Date(range[1]) : null;
    const formattedDateToday = start
    ? `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
    : '';
    const formattedDateTomo = end
    ? `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
    : '';

    // Проверяем, что количество бонусов не превышает баланс
    const bonusesToUse = useBonuses > 0 ? Math.min(Math.max(0, useBonuses), bonusBalance) : 0;
    
    // Если пользователь попытался использовать больше бонусов, чем есть, показываем ошибку
    if (useBonuses > bonusBalance) {
      alert(`Нельзя использовать больше ${bonusBalance.toFixed(2)} бонусов. Доступно: ${bonusBalance.toFixed(2)}`);
      return;
    }

    const response = await setBron(
      id || '',
      bookFormDetails.getValues().guest,
      formattedDateToday,
      formattedDateTomo,
      bookFormDetails.getValues().wish,
      bookFormDetails.getValues().fam,
      bookFormDetails.getValues().name,
      bookFormDetails.getValues().phone,
      bookFormDetails.getValues().additional_phone,
      bookFormDetails.getValues().email,
      bonusesToUse
    )

    if (response.ok) {
      alert('Забронировано успешно! Скоро с вами свяжутся для дальнейших действий')
      setBookingSubmitted(true);
    }
    else {
      const error = await response.json();
      alert('При попытке брони произошла ошибка, проверьте правильность введенных вами данных или свяжитесь с администратором')
      if (errorHandler(response.status) == 5) {
        showNotification({
          title: "Ошибка сервера, обновите страницу",
          message: error.statusText,
          icon: <IconX />
        })
      }
    }
    // setIsLoading(false)

  }



  useEffect(() => {
    setPeopleData(getPeopleData());
    getObjectsCalendar()
  }, [props]);


  return (
    <form>
      <div className={styles["pageLayout"]}>
        <div className={styles["grayArea"]}></div>
        <div className={styles["paper"]}>
          <Flex className="papercard" align='' direction="column" gap={10}>
              <DoubleDateRangePicker
              className=""
                // блокируем выбор дат после успешной заявки
                style={{ pointerEvents: bookingSubmitted ? 'none' : 'auto', opacity: bookingSubmitted ? 0.6 : 1 }}
                excludeDate={(date) => {
                  // Отключаем все даты, которые не доступны для бронирования
                  return disabledDates.some(disabledDate =>
                    date.getDate() === disabledDate.getDate() &&
                    date.getMonth() === disabledDate.getMonth() &&
                    date.getFullYear() === disabledDate.getFullYear()
                  );
                }}
                value={bookForm.values.in}
                // ref={dateInputRef}
                // onBlur={() => guestInputRef.current?.focus()}
                onChange={(value) => {
                  if (!bookingSubmitted) {
                    bookForm.setFieldValue('in', value);
                  }
                  // guestInputRef.current?.focus()
                }}

              />
              {/* <DateInput
                {...bookForm.getInputProps('in')}
                excludeDate={(date) => {
                  // Отключаем все даты, которые не доступны для бронирования
                  return disabledDates.some(disabledDate =>
                    date.getDate() === disabledDate.getDate() &&
                    date.getMonth() === disabledDate.getMonth() &&
                    date.getFullYear() === disabledDate.getFullYear()
                  );
                }}
                minDate={new Date()} // Запрещаем выбор прошедших дат
                locale="ru"
                valueFormat="DD MMM, dd"
                placeholder="от"
                size="xs"
                style={{ flex: 1, minWidth: 0 }}
              />

              <DateInput
                {...bookForm.getInputProps('out')}
                excludeDate={(date) => {
                  return disabledDates.some(disabledDate =>
                    date.getDate() === disabledDate.getDate() &&
                    date.getMonth() === disabledDate.getMonth() &&
                    date.getFullYear() === disabledDate.getFullYear()
                  );
                }}
                minDate={bookForm.values.in || new Date()} // Дата выезда не может быть раньше даты заезда
                locale="ru"
                valueFormat="DD MMM, dd"
                placeholder="до"
                size="xs"
                style={{ flex: 1, minWidth: 0 }}
              /> */}
 
            <Select
              withCheckIcon={false}
              placeholder="Количество человек"
              maxDropdownHeight={200}
              rightSection={<IconChevronDown size={16} />}
              disabled={bookingSubmitted}
              data={guestTabs}
              key={bookFormDetails.key('guest')}
              {...bookFormDetails.getInputProps('guest')}

            // mt="md"
            />

            {(costData == 0 && !isCostLoading) ? "" :
              <Group justify="space-between" mt={10} direction="column" align="stretch" gap="xs">
                {useBonuses > 0 && !isCostLoading && costData && costData > 0 && (
                  <Group justify="space-between">
                    <span className={styles["HeadingStyle3"]} style={{ fontSize: "14px" }}>Стоимость:</span>
                    <span className={styles["HeadingStyle3Cost"]} style={{ fontSize: "14px", textDecoration: "line-through", opacity: 0.7 }}>{costData} ₽</span>
                  </Group>
                )}
                {useBonuses > 0 && !isCostLoading && costData && costData > 0 && (
                  <Group justify="space-between">
                    <span className={styles["HeadingStyle3"]} style={{ fontSize: "14px", color: "var(--mantine-color-sberGreenColor-9)" }}>Списано бонусов:</span>
                    <span className={styles["HeadingStyle3Cost"]} style={{ fontSize: "14px", color: "var(--mantine-color-sberGreenColor-9)" }}>-{useBonuses} ₽</span>
                  </Group>
                )}
                <Group justify="space-between">
                  <h3 className={styles["HeadingStyle3"]}>Итого:</h3>
                  {isCostLoading ? (
                    <Loader size="xs" />
                  ) : (
                    <h3 className={styles["HeadingStyle3Cost"]} style={useBonuses > 0 ? { color: "var(--mantine-color-sberGreenColor-9)" } : {}}>
                      {costData == 0 ? "Ошибка " : Math.max(0, costData - useBonuses)} ₽
                    </h3>
                  )}
                </Group>
              </Group>}
            {isAvailable === false ? (
              <span className={styles.redText}>
                Недоступна бронь на эти даты {isLoading && <Loader size="xs" ml={10} />}
              </span>
            ) : ""}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div className={styles["grayBlock"]}>
                <Group justify="space-between">
                  {costData == 0 || !costOneDay ? "" : (
                    <p className={styles["HeadingStyle3"]}>
                      Внести предоплату в размере стоимости одного дня: {costOneDay}₽
                    </p>
                  )}
                  {/* <p className={styles["HeadingStyle3Cost"]}></p> */}
                </Group>
              </div>
              {/* <div className={styles["grayBlock"]}>
                <Group justify="space-between">
                  <p className={styles["HeadingStyle3"]}>Оплата про заселении:</p>
                  <p className={styles["HeadingStyle3Cost"]}>{costData ? costData - props.cost : props.cost}₽</p>
                </Group>
              </div> */}
            </div>
          </Flex>
          <Flex className="papercard" align='' direction="column" >
            <TextInput
              label="Ваш телефон для бронирования"
              withAsterisk
              placeholder="+7 (___) ___-__-__"
              component={IMaskInput}
              disabled={bookingSubmitted}
              mask="+7 (000) 000-00-00"
              inputRef={ref}
              key={bookFormDetails.key('phone')}
              {...bookFormDetails.getInputProps('phone')}
            // styles={{
            //   input: {
            //     fontSize: '16px',
            //     letterSpacing: '0.5px'
            //   }
            // }}
            />
            <TextInput
              label="E-Mail (опционально):"
              // placeholder="+7 (___) ___-__-__"
              placeholder="example@domain.com"
              type="email"
              disabled={bookingSubmitted}
              mt={10}
              key={bookFormDetails.key('email')}
              {...bookFormDetails.getInputProps('email')}
              styles={{
                label: {
                  fontWeight: '400'
                  // fontSize: '16px',
                  // letterSpacing: '0.5px'
                }
              }}
            />
            <span className={styles["xsText"]}>Отправим код подтверждения и информацию по бронированию</span>
          </Flex>
          <Flex className="papercard" align='' direction="column" >
            <Group justify="space-between" mt={10}>
              <TextInput
                size="sm"
                style={{ flex: 1, minWidth: 0 }}
                key={bookFormDetails.key('fam')}
                disabled={bookingSubmitted}
                {...bookFormDetails.getInputProps('fam')}
                label="Фамилия"
                withAsterisk
                placeholder="Фамилия"
                component={IMaskInput}
              // mask="+7 (000) 000-00-00"
              // inputRef={ref}
              // styles={{
              //   input: {
              //     fontSize: '16px',
              //     letterSpacing: '0.5px'
              //   }
              // }}
              />
              <TextInput
                size="sm"
                style={{ flex: 1, minWidth: 0 }}
                label="Имя"
                withAsterisk
                placeholder="Имя"
                component={IMaskInput}
                disabled={bookingSubmitted}
                key={bookFormDetails.key('name')}
                {...bookFormDetails.getInputProps('name')}
              // mask="+7 (000) 000-00-00"
              // inputRef={ref}
              // styles={{
              //   input: {
              //     fontSize: '16px',
              //     letterSpacing: '0.5px'
              //   }
              // }}
              />
            </Group>
            {bonusBalance > 0 && (
              <NumberInput
                mt={10}
                label="Использовать бонусы"
                description={`Доступно бонусов: ${bonusBalance.toFixed(2)} (1 бонус = 1 рубль)`}
                placeholder="0"
                min={0}
                max={bonusBalance}
                step={1}
                disabled={bookingSubmitted}
                value={useBonuses}
                onChange={(value) => {
                  const numValue = typeof value === 'number' ? value : 0;
                  // Ограничиваем максимальное значение балансом бонусов
                  setUseBonuses(Math.min(Math.max(0, numValue), bonusBalance));
                }}
                error={useBonuses > bonusBalance ? `Нельзя использовать больше ${bonusBalance.toFixed(2)} бонусов` : undefined}
              />
            )}
            <Textarea mt={10}
              autosize
              maxRows={50}
              // resize="vertical"
              disabled={bookingSubmitted}
              key={bookFormDetails.key('wish')}
              {...bookFormDetails.getInputProps('wish')}
              description="Ваши пожелания:">
            </Textarea>

            {/* <TextInput
              size="sm"
              key={bookFormDetails.key('promo')}
              {...bookFormDetails.getInputProps('promo')}
              mt={10}
              style={{ flex: 1, minWidth: 0 }}
              description="Ввести промокод"
              // placeholder="Имя"
              component={IMaskInput}
            // mask="+7 (000) 000-00-00"
            // inputRef={ref}
            // styles={{
            //   input: {
            //     fontSize: '16px',
            //     letterSpacing: '0.5px'
            //   }
            // }}
            /> */}
          </Flex>
          <Flex className="papercard" align='center' direction="column" >
            <span className={styles["xsText"]}>Нажимая «Забронировать», вы соглашаетесь с условиями оферты
              <a className={styles.textHigh} href="https://homereserve.ru/assets/oferta-DCQc6LM8.pdf">
                Перевод без риска</a>,
              <a className={styles.textHigh} href="https://homereserve.ru/assets/politika-B9iOD3WH.pdf">
                Политика в области обработки персональных данных</a>  и условиями
              <a className={styles.textHigh} href="https://homereserve.ru/AAAwUw/booking-rules">Правил проживания</a>,
              <a className={styles.textHigh} href="https://homereserve.ru/assets/pravila-CDm_SrpL.pdf">Правил бронирования</a>
            </span>
          </Flex>
          <Button mb={30} ml={5} mr={5}
            disabled={bookingSubmitted || isAvailable === false}
            color="sberGreenColor.9"
            onClick={setBronya}
          >
            {bookingSubmitted ? 'Заявка отправлена' : 'Забронировать'}
          </Button>

        </div>
      </div>
    </form>
  )
}

