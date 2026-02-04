import { useState, useRef, useEffect, useImperativeHandle, useMemo } from 'react';
import { Box, Popover, Group, ActionIcon, Button, Select, TextInput, Flex } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { forwardRef } from 'react';
import Plus from "../../../icons/Plus.svg?react";
import Trash from "../../../icons/Trash.svg?react";
import ArrowSVG from "../../../icons/ArrowDropDown.svg?react";
import styles from './guestButton.module.css';
import { declineAdultsWord, declineKidsWord } from '../../../handlers/pravopisanieHandler';

interface GuestProps {
  value?: [number, number];
  kids?: { age: string | number }[];
  onChange: (value: [number, number]) => void;
  onKidsChange?: (kids: { age: string | number }[]) => void;
  onBlur?: () => void;
}

interface Kid {
  age: string | number;
}

// Формируем данные для Select в правильном формате
const kidsToChoose = [
  { value: '1', label: '1 год' },
  ...[2, 3, 4].map(n => ({
    value: n.toString(),
    label: `${n} года`
  })),
  ...[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(n => ({
    value: n.toString(),
    label: `${n} лет`
  }))
];

export const GuestPickerMobile = forwardRef<HTMLButtonElement, GuestProps>(
  ({ value: externalValue, kids: externalKids, onChange, onKidsChange, onBlur }, ref) => {

    const value = useMemo(() => {
      if (Array.isArray(externalValue) && externalValue.length >= 2) {
        return [
          externalValue[0] && externalValue[0] !== 0 ? externalValue[0] : 1,
          externalValue[1] && externalValue[1] !== 0 ? externalValue[1] : 1,
        ]
      }
      return [1, 1];
    }, [externalValue]);

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const minValue = 1;
    const maxValue = 10;
    const isMobile = useMediaQuery('(max-width: 48em)');

    // Инициализация kids из внешнего пропа или пустого массива
    const kids = useMemo(() => {
      return externalKids || [];
    }, [externalKids]);

    useImperativeHandle(ref, () => {
      return {
        focus() {
          setIsPopoverOpen(true)
        },
      };
    }, []);

    // Функция для получения отображаемого значения из возраста
    const getDisplayValue = (age: string | number): string => {
      if (age === 0 || age === '0') return 'до 1 года';
      const num = parseInt(age.toString());
      if (isNaN(num)) return age.toString();
      if (num === 1) return '1 год';
      if (num === 2 || num === 3 || num === 4) return `${num} года`;
      return `${num} лет`;
    };

    // Обработчик добавления ребенка
    const handleAddKid = () => {
      const newKids = [...kids, { age: '1' }]; // Добавляем "до 1 года" по умолчанию
      if (onKidsChange) {
        onKidsChange(newKids);
      }
    };

    // Обработчик удаления ребенка
    const handleDeleteKid = (index: number) => {
      const newKids = [...kids];
      newKids.splice(index, 1);
      if (onKidsChange) {
        onKidsChange(newKids);
      }
    };

    // Обработчик изменения возраста ребенка
    const handleKidAgeChange = (index: number, age: string | null) => {
      if (age === null) return;
      
      const newKids = [...kids];
      // Сохраняем как строку, но можно и как число
      newKids[index] = { age };
      if (onKidsChange) {
        onKidsChange(newKids);
      }
    };

    // Получаем значение для Select из объекта ребенка
    const getKidSelectValue = (kid: Kid): string => {
      if (kid.age === 0 || kid.age === '0') return '0';
      return kid.age.toString();
    };

    // Подсчет количества детей для отображения
    const kidsCount = kids.length;

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
            <Box style={{ display: isMobile ? 'block' : 'flex', gap: '20px', }}>
              <TextInput
                styles={{
                  wrapper: {
                    margin: 0
                  },
                }}
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
            <Flex direction="column">
              <Box style={{ width: '280px' }}>
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
                  {kids.map((kid, index) => (
                    <Group key={index} align="center" mb={5}>
                      <Select
                        size='md'
                        styles={{
                          dropdown: {
                            zIndex: 10000
                          },
                        }}
                        comboboxProps={{ withinPortal: false }}
                        onClick={(event) => event.stopPropagation()}
                        data={kidsToChoose}
                        value={getKidSelectValue(kid)}
                        onChange={(value) => handleKidAgeChange(index, value)}
                        placeholder="Выберите возраст ребенка"
                        style={{ flex: 1 }}
                      />
                      <ActionIcon
                        color="red"
                        onClick={() => handleDeleteKid(index)}
                        variant="outline"
                      >
                        <Trash size={16} />
                      </ActionIcon>
                    </Group>
                  ))}

                  <Button
                    fullWidth
                    onClick={handleAddKid}
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
                      onClick={() => onChange([value[0], value[1] - 1])}
                      disabled={value[1] <= minValue}>-</Button>

                    <h2 style={{ fontSize: "18px" }}>{value[1]}</h2>

                    <Button className={styles.buttonControl}
                      onClick={() => onChange([value[0], value[1] + 1])}
                      disabled={value[1] >= maxValue}>+</Button>
                  </Group>
                </Group>
              </Box>
              
              {/* Кнопка подтверждения для мобильной версии */}
              <Box style={{
                backgroundColor: '#f8f9fa',
                padding: '16px'
              }}>
                <Button 
                  fullWidth 
                  size='md'
                  color="var(--mantine-color-orangeColor-6)"
                  onClick={() => {
                    setIsPopoverOpen(false);
                    if (onBlur) onBlur();
                  }}
                >
                  Выбрать
                </Button>
              </Box>
            </Flex>
          </Popover.Dropdown>
        </Popover>
      </Box>
    );
  });

GuestPickerMobile.displayName = 'GuestPickerMobile';