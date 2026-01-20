import { useState } from 'react';
import { DatePickerInput, DatePicker } from '@mantine/dates';
import { Box, Popover } from '@mantine/core';
import React from 'react';

const DoubleDateRangePicker = () => {
  const [value, setValue] = useState<[Date | null, Date | null]>([null, null]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <Box>
      <Popover
        opened={isPopoverOpen}
        onChange={setIsPopoverOpen}
        position="bottom"
        withinPortal
      >
        <Popover.Target>
          <Box>
            <DatePickerInput
              label="Заезд"
              placeholder="Выберите дату заезда"
              value={value[0]}
              onClick={() => setIsPopoverOpen(true)}
              readOnly
            />
            <DatePickerInput
              label="Выезд"
              placeholder="Выберите дату выезда"
              value={value[1]}
              onClick={() => setIsPopoverOpen(true)}
              readOnly
              mt="sm"
            />
          </Box>
        </Popover.Target>

        <Popover.Dropdown p={0}>
          <DatePicker
            type="range"
            value={value}
            onChange={(newValue) => {
              setValue(newValue);
              if (newValue[0] && newValue[1]) {
                setIsPopoverOpen(false); // Закрываем после выбора
              }
            }}
          />
        </Popover.Dropdown>
      </Popover>
    </Box>
  );
};

export default DoubleDateRangePicker;