import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Group,
  Select,
  TextInput,
  Paper,
  ActionIcon,
  NumberInput,
  Loader,
  Flex
} from "@mantine/core";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { errorHandler } from "../../../handlers/errorBasicHandler";

// Типы данных, приходящих с бекенда
interface PropertyItem {
  id?: number; // для существующих строк
  property: string;
  model: string;
  quantity: number;
  cost: number;
}

interface DictionaryItem {
  value: string;
  label: string;
}

export function PropertyTablePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tableData, setTableData] = useState<PropertyItem[]>([]);
  
  // Справочники для выпадающих списков
  const [propertyDict, setPropertyDict] = useState<DictionaryItem[]>([]);
  const [modelDict, setModelDict] = useState<DictionaryItem[]>([]);

  // Загрузка данных таблицы
  const getTableDataFunc = async () => {
    setIsLoading(true);
    try {
      const response = await getContentListByCategory('property-table'); // замените на нужный эндпоинт
      
      if (response.ok) {
        const data = await response.json();
        // Предполагаем, что данные приходят в формате, который можно преобразовать в PropertyItem[]
        setTableData(data);
      } else {
        setTableData([]);
        const error = await response.json();
        if (errorHandler(response.status) === 5) {
          showNotification({
            title: "Ошибка сервера, обновите страницу",
            message: error.statusText,
            icon: <IconX />
          });
        }
      }
    } catch (error) {
      console.error("Error loading table data:", error);
      showNotification({
        title: "Ошибка",
        message: "Не удалось загрузить данные таблицы",
        icon: <IconX />
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка справочников (вызывается один раз при инициализации)
  const getDictionaries = async () => {
    try {
      // Замените на реальные эндпоинты для получения списков имущества и моделей
      const [propertyRes, modelRes] = await Promise.all([
        getDictionariesList('property'), 
        getDictionariesList('model')
      ]);
      
      if (propertyRes.ok) {
        const data = await propertyRes.json();
        setPropertyDict(data.map((item: any) => ({
          value: item.id?.toString() || item.name,
          label: item.name
        })));
      }
      
      if (modelRes.ok) {
        const data = await modelRes.json();
        setModelDict(data.map((item: any) => ({
          value: item.id?.toString() || item.name,
          label: item.name
        })));
      }
    } catch (error) {
      console.error("Error loading dictionaries:", error);
      showNotification({
        title: "Ошибка",
        message: "Не удалось загрузить справочники",
        icon: <IconX />
      });
    }
  };

  // Инициализация страницы
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await Promise.all([getDictionaries(), getTableDataFunc()]);
      setIsLoading(false);
    };
    
    initialize();
  }, []);

  // Добавление новой пустой строки
  const addNewRow = () => {
    setTableData(prev => [
      ...prev,
      { property: '', model: '', quantity: 1, cost: 0 }
    ]);
  };

  // Удаление строки по индексу
  const deleteRow = (index: number) => {
    setTableData(prev => prev.filter((_, i) => i !== index));
  };

  // Обновление поля в конкретной строке
  const updateRow = (index: number, field: keyof PropertyItem, value: string | number) => {
    setTableData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  // Сохранение всех данных таблицы
  const saveTableData = async () => {
    setIsSaving(true);
    try {
      // Фильтруем строки, где не заполнены обязательные поля
      const validData = tableData.filter(row => row.property && row.model);
      
      const response = await saveTableDataEndpoint(validData); // замените на реальный эндпоинт
      
      if (response.ok) {
        showNotification({
          title: "Успешно",
          message: "Данные сохранены",
          color: "green"
        });
        // Опционально: обновить данные с сервера, чтобы получить актуальные ID
        await getTableDataFunc();
      } else {
        const error = await response.json();
        showNotification({
          title: "Ошибка сохранения",
          message: error.message || "Попробуйте снова",
          icon: <IconX />
        });
      }
    } catch (error) {
      console.error("Error saving table data:", error);
      showNotification({
        title: "Ошибка",
        message: "Не удалось сохранить данные",
        icon: <IconX />
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Заглушки для функций запросов (замените на реальные)
  const getContentListByCategory = async (category: string) => {
    // Имитация запроса
    return {
      ok: true,
      json: async () => [
        { id: 1, property: 'Недвижимость', model: 'Квартира', quantity: 2, cost: 5000000 },
        { id: 2, property: 'Транспорт', model: 'Автомобиль', quantity: 1, cost: 1500000 }
      ]
    } as any;
  };

  const getDictionariesList = async (type: string) => {
    // Имитация запроса справочников
    const dicts = {
      property: [
        { id: 1, name: 'Недвижимость' },
        { id: 2, name: 'Транспорт' },
        { id: 3, name: 'Оборудование' }
      ],
      model: [
        { id: 1, name: 'Квартира' },
        { id: 2, name: 'Автомобиль' },
        { id: 3, name: 'Станок' }
      ]
    };
    return {
      ok: true,
      json: async () => dicts[type as keyof typeof dicts] || []
    } as any;
  };

  const saveTableDataEndpoint = async (data: PropertyItem[]) => {
    // Имитация сохранения
    return {
      ok: true,
      json: async () => ({ success: true })
    } as any;
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ height: '400px' }}>
        <Loader size="lg" />
      </Flex>
    );
  }

  return (
    <Paper shadow="sm" p="md" radius="md" style={{ backgroundColor: 'white' }}>
      <Group justify="space-between" mb="md">
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Редактирование имущества</h2>
        <Group>
          <Button 
            onClick={addNewRow} 
            leftSection={<IconPlus size={16} />}
            variant="outline"
          >
            Добавить строку
          </Button>
          <Button 
            onClick={saveTableData} 
            loading={isSaving}
            color="var(--mantine-color-sberGreenColor-9)"
          >
            Сохранить
          </Button>
        </Group>
      </Group>

      <Table 
        striped 
        highlightOnHover 
        withTableBorder 
        withColumnBorders
        style={{ 
          borderCollapse: 'collapse',
          '& th': { 
            backgroundColor: '#f8f9fa',
            fontWeight: 600,
            padding: '12px 8px'
          }
        }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: '50px', textAlign: 'center' }}>№ п/п</Table.Th>
            <Table.Th>Имущество</Table.Th>
            <Table.Th>Марка/Модель</Table.Th>
            <Table.Th style={{ width: '100px' }}>Кол-во</Table.Th>
            <Table.Th style={{ width: '120px' }}>Стоимость</Table.Th>
            <Table.Th style={{ width: '50px' }}></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {tableData.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                Нет данных. Добавьте первую строку.
              </Table.Td>
            </Table.Tr>
          ) : (
            tableData.map((row, index) => (
              <Table.Tr key={index}>
                <Table.Td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  {index + 1}
                </Table.Td>
                <Table.Td>
                  <Select
                    data={propertyDict}
                    value={row.property}
                    onChange={(value) => updateRow(index, 'property', value || '')}
                    placeholder="Выберите"
                    searchable
                    clearable
                    styles={{
                      input: { border: 'none', background: 'transparent' }
                    }}
                  />
                </Table.Td>
                <Table.Td>
                  <Select
                    data={modelDict}
                    value={row.model}
                    onChange={(value) => updateRow(index, 'model', value || '')}
                    placeholder="Выберите"
                    searchable
                    clearable
                    styles={{
                      input: { border: 'none', background: 'transparent' }
                    }}
                  />
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    value={row.quantity}
                    onChange={(value) => updateRow(index, 'quantity', value || 0)}
                    min={1}
                    hideControls
                    styles={{
                      input: { border: 'none', textAlign: 'center', background: 'transparent' }
                    }}
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    value={row.cost}
                    onChange={(e) => updateRow(index, 'cost', e.currentTarget.value)}
                    styles={{
                      input: { border: 'none', textAlign: 'right', background: 'transparent' }
                    }}
                  />
                </Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>
                  <ActionIcon 
                    color="red" 
                    onClick={() => deleteRow(index)}
                    variant="subtle"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}