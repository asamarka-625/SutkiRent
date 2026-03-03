import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Group,
  Select,
  Paper,
  ActionIcon,
  NumberInput,
  Loader,
  Flex,
  Stack
} from "@mantine/core";
import { IconTrash, IconPlus, IconX } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";
import { errorHandler } from "../../../handlers/errorBasicHandler";
import inventoryService from "../../../services/adminServices"

// Типы данных для таблицы (внутреннее представление)
interface PropertyItem {
  id?: number;
  item_id: string;      // id предмета как строка (из API приходит как строка)
  brand_id: string;      // id бренда как строка (из API приходит как строка)
  quantity: number;
  cost: number;          // цена как число (из API приходит как строка)
  
  // Поля для отображения в UI (заполняются из справочников)
  item_title?: string;
  brand_title?: string;
}

interface DictionaryItem {
  value: string;        // id как строка для Select
  label: string;        // название для отображения
}

interface ObjectOption {
  value: string;
  label: string;
}

// Интерфейсы для данных из API
interface ApiItem {
  id: number;
  title: string;
}

interface ApiBrand {
  id: number;
  title: string;
}

interface ApiInventory {
  item: string;         // id предмета как строка
  brand: string;        // id бренда как строка
  quantity: number;
  price: string;        // цена как строка
}

interface ApiApartment {
  id: number;
  title: string;
}

export function PropertyTablePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isObjectsLoading, setIsObjectsLoading] = useState(false);
  const [tableData, setTableData] = useState<PropertyItem[]>([]);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [objectsList, setObjectsList] = useState<ObjectOption[]>([]);
  
  // Справочники для выпадающих списков
  const [propertyDict, setPropertyDict] = useState<DictionaryItem[]>([]);
  const [modelDict, setModelDict] = useState<DictionaryItem[]>([]);

  // Загрузка списка объектов для выбора
  const getObjectsList = async () => {
    setIsObjectsLoading(true);
    try {
      const data = await inventoryService.getApartments();
      
      setObjectsList(data.map((item: ApiApartment) => ({
        value: item.id.toString(),
        label: item.title || `Объект ${item.id}`
      })));
    } catch (error: any) {
      console.error("Error loading objects list:", error);
      setObjectsList([]);
      
      if (error.message?.includes('401') || error.message?.includes('авторизован')) {
        showNotification({
          title: "Ошибка авторизации",
          message: "Пожалуйста, войдите в систему",
          icon: <IconX />
        });
      } else {
        showNotification({
          title: "Ошибка",
          message: error.message || "Не удалось загрузить список объектов",
          icon: <IconX />
        });
      }
    } finally {
      setIsObjectsLoading(false);
    }
  };

  // Загрузка данных таблицы для выбранного объекта
  const getTableDataFunc = async (objectId: string) => {
    setIsLoading(true);
    try {
      const data = await inventoryService.getApartmentInventory(objectId);
      
      // Преобразуем данные из API в формат PropertyItem
      // API возвращает: { item: "2", brand: "2", quantity: 1, price: "110.00" }
      const transformedData: PropertyItem[] = data.map((item: ApiInventory) => {
        // Находим названия для отображения по ID из справочников
        const itemDict = propertyDict.find(d => d.value === item.item);
        const brandDict = modelDict.find(d => d.value === item.brand);
        
        return {
          item_id: item.item,                    // оставляем как строку
          brand_id: item.brand,                   // оставляем как строку
          quantity: item.quantity,
          cost: parseFloat(item.price) || 0,      // преобразуем строку в число
          item_title: itemDict?.label || '',
          brand_title: brandDict?.label || ''
        };
      });
      
      setTableData(transformedData);
    } catch (error: any) {
      console.error("Error loading table data:", error);
      setTableData([]);
      
      showNotification({
        title: "Ошибка",
        message: error.message || "Не удалось загрузить данные таблицы",
        icon: <IconX />
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка справочников (вызывается один раз при инициализации)
  const getDictionaries = async () => {
    try {
      // Параллельно загружаем предметы и бренды
      const [itemsData, brandsData] = await Promise.all([
        inventoryService.getItems(),
        inventoryService.getBrands()
      ]);
      
      // API возвращает массив объектов с полями id и title
      // Преобразуем id в строку для Select компонента
      const itemsDict = itemsData.map((item: ApiItem) => ({
        value: item.id.toString(),    // id как строка
        label: item.title
      }));
      
      const brandsDict = brandsData.map((brand: ApiBrand) => ({
        value: brand.id.toString(),   // id как строка
        label: brand.title
      }));
      
      setPropertyDict(itemsDict);
      setModelDict(brandsDict);
      
      // Если уже есть загруженные данные таблицы, обновляем отображаемые названия
      if (tableData.length > 0) {
        setTableData(prev => prev.map(row => ({
          ...row,
          item_title: itemsDict.find(d => d.value === row.item_id)?.label || '',
          brand_title: brandsDict.find(d => d.value === row.brand_id)?.label || ''
        })));
      }
    } catch (error: any) {
      console.error("Error loading dictionaries:", error);
      showNotification({
        title: "Ошибка",
        message: error.message || "Не удалось загрузить справочники",
        icon: <IconX />
      });
    }
  };

  // Инициализация страницы - загружаем справочники и список объектов
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        await Promise.all([getDictionaries(), getObjectsList()]);
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, []);

  // Загрузка данных таблицы при изменении выбранного объекта
  useEffect(() => {
    if (selectedObject && propertyDict.length > 0 && modelDict.length > 0) {
      getTableDataFunc(selectedObject);
    } else {
      setTableData([]);
    }
  }, [selectedObject, propertyDict, modelDict]);

  // Добавление новой пустой строки
  const addNewRow = () => {
    setTableData(prev => [
      ...prev,
      { 
        item_id: '',
        brand_id: '',
        quantity: 1, 
        cost: 0,
        item_title: '',
        brand_title: ''
      }
    ]);
  };

  // Удаление строки по индексу
  const deleteRow = (index: number) => {
    setTableData(prev => prev.filter((_, i) => i !== index));
  };

  // Обновление поля в конкретной строке
  const updateRow = (index: number, field: keyof PropertyItem, value: string | number | null) => {
    if (value === null) return;
    
    setTableData(prev => {
      const newData = [...prev];
      
      if (field === 'item_id') {
        // При выборе имущества
        const selectedItem = propertyDict.find(item => item.value === value);
        newData[index] = { 
          ...newData[index], 
          item_id: value as string,
          item_title: selectedItem?.label || ''
        };
      } else if (field === 'brand_id') {
        // При выборе бренда
        const selectedBrand = modelDict.find(brand => brand.value === value);
        newData[index] = { 
          ...newData[index], 
          brand_id: value as string,
          brand_title: selectedBrand?.label || ''
        };
      } else {
        // Для числовых полей
        newData[index] = { ...newData[index], [field]: value };
      }
      
      return newData;
    });
  };

  // Сохранение всех данных таблицы для выбранного объекта
  const saveTableData = async () => {
    if (!selectedObject) {
      showNotification({
        title: "Ошибка",
        message: "Выберите объект для редактирования",
        icon: <IconX />
      });
      return;
    }

    // Проверяем, что все строки заполнены корректно
    const invalidRows = tableData.filter(row => !row.item_id || !row.brand_id);
    if (invalidRows.length > 0) {
      showNotification({
        title: "Ошибка валидации",
        message: "Заполните имущество и марку/модель для всех строк",
        icon: <IconX />
      });
      return;
    }

    setIsSaving(true);
    try {
      // Преобразуем в формат, который ожидает API
      // API ожидает: { item: "2", brand: "2", quantity: 1, price: "110.00" }
      const apiData = tableData.map(row => ({
        item_id: row.item_id,                    // уже строка
        brand_id: row.brand_id,                   // уже строка
        quantity: row.quantity,
        price: row.cost.toFixed(2)             // число в строку с двумя знаками
      }));
      
      await inventoryService.updateApartmentInventory(selectedObject, apiData);
      
      showNotification({
        title: "Успешно",
        message: "Данные сохранены",
        color: "green"
      });
      
      // Обновляем данные с сервера, чтобы получить актуальные
      await getTableDataFunc(selectedObject);
    } catch (error: any) {
      console.error("Error saving table data:", error);
      showNotification({
        title: "Ошибка сохранения",
        message: error.message || "Не удалось сохранить данные",
        icon: <IconX />
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !selectedObject) {
    return (
      <Flex justify="center" align="center" style={{ height: '400px' }}>
        <Loader size="lg" />
      </Flex>
    );
  }

  return (
    <Paper shadow="sm" p="md" radius="md" style={{ backgroundColor: 'white' }} className="paperdiv">
      <Stack gap="md">
        {/* Блок выбора объекта */}
        <Paper withBorder p="md" radius="md" style={{ backgroundColor: '#f8f9fa' }}>
          <Group align="flex-end">
            <div style={{ flex: 1 }}>
              <Select
                label="Выберите объект для редактирования"
                placeholder={isObjectsLoading ? "Загрузка объектов..." : "Выберите из списка"}
                data={objectsList}
                value={selectedObject}
                onChange={setSelectedObject}
                searchable
                clearable
                disabled={isObjectsLoading}
                styles={{
                  label: { fontWeight: 600, marginBottom: 4 }
                }}
              />
            </div>
            {/* {selectedObject && (
              <Button 
                variant="subtle" 
                color="gray"
                onClick={() => setSelectedObject(null)}
                leftSection={<IconX size={16} />}
              >
                Очистить
              </Button>
            )} */}
          </Group>
        </Paper>

        {selectedObject ? (
          <>
            <Group justify="space-between" mb="md">
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
                Редактирование имущества
                {objectsList.find(obj => obj.value === selectedObject) && (
                  <span style={{ fontSize: '1rem', fontWeight: 400, marginLeft: 8, color: '#666' }}>
                    {objectsList.find(obj => obj.value === selectedObject)?.label}
                  </span>
                )}
              </h2>
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

            {isLoading ? (
              <Flex justify="center" align="center" style={{ height: '300px' }}>
                <Loader size="lg" />
              </Flex>
            ) : (
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
                        Нет данных для этого объекта. Добавьте первую строку.
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    tableData.map((row, index) => (
                      <Table.Tr key={row.id || index}>
                        <Table.Td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          {index + 1}
                        </Table.Td>
                        <Table.Td>
                          <Select
                            data={propertyDict}
                            value={row.item_id}
                            onChange={(value) => updateRow(index, 'item_id', value)}
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
                            value={row.brand_id}
                            onChange={(value) => updateRow(index, 'brand_id', value)}
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
                          <NumberInput
                            value={row.cost}
                            onChange={(value) => updateRow(index, 'cost', value || 0)}
                            min={0}
                            hideControls
                            thousandSeparator=" "
                            precision={2}
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
            )}
          </>
        ) : (
          <Flex justify="center" align="center" style={{ height: '300px' }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#666', marginBottom: 8 }}>Объект не выбран</h3>
              <p style={{ color: '#999' }}>Выберите объект из списка выше для редактирования имущества</p>
            </div>
          </Flex>
        )}
      </Stack>
    </Paper>
  );
}