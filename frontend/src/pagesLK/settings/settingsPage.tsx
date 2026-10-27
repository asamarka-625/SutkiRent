import { useEffect, useState } from 'react';
import { Button, Divider, Group, Stack, Switch, Text } from '@mantine/core';
import { IconBell, IconLock, IconMail, IconMessage } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '@mantine/notifications';

const STORAGE_KEY = 'sr_notification_prefs';

interface NotifPrefs {
  email: boolean;
  sms: boolean;
  promo: boolean;
}

const DEFAULT_PREFS: NotifPrefs = { email: true, sms: true, promo: false };

function loadPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    // игнорируем недоступность хранилища
  }
  return DEFAULT_PREFS;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  const update = (key: keyof NotifPrefs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...prefs, [key]: e.currentTarget.checked };
    setPrefs(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // игнорируем недоступность хранилища
    }
    showNotification({
      color: 'sberGreenColor',
      title: 'Настройки сохранены',
      message: 'Изменения применены.',
    });
  };

  return (
    <div className="paperdivLK">
      <div className="papercardLK">
        <div className="paperHeaderLK">
          <h3 className="HeadingTitle">Настройки</h3>
        </div>

        <div className="papercard">
          <Stack gap="lg" p="sm">
            {/* Уведомления */}
            <Stack gap="xs">
              <Group gap="xs">
                <IconBell size={18} />
                <Text fw={600}>Уведомления</Text>
              </Group>
              <Text size="sm" c="dimmed">
                Выберите, как вам удобно получать сообщения о бронированиях и статусах.
              </Text>

              <Switch
                mt="xs"
                checked={prefs.email}
                onChange={update('email')}
                label="Уведомления на e-mail"
                description="Подтверждения и статусы бронирований"
                thumbIcon={<IconMail size={12} />}
                color="sberGreenColor"
              />
              <Switch
                checked={prefs.sms}
                onChange={update('sms')}
                label="SMS-уведомления"
                description="Короткие сообщения о важных событиях"
                thumbIcon={<IconMessage size={12} />}
                color="sberGreenColor"
              />
              <Switch
                checked={prefs.promo}
                onChange={update('promo')}
                label="Акции и новости"
                description="Спецпредложения и полезные материалы"
                color="sberGreenColor"
              />
            </Stack>

            <Divider />

            {/* Безопасность */}
            <Stack gap="xs">
              <Group gap="xs">
                <IconLock size={18} />
                <Text fw={600}>Безопасность</Text>
              </Group>
              <Text size="sm" c="dimmed">
                Рекомендуем периодически менять пароль для защиты аккаунта.
              </Text>
              <Group mt="xs">
                <Button
                  variant="light"
                  radius="md"
                  leftSection={<IconLock size={16} />}
                  onClick={() => navigate('/forgot-password')}
                >
                  Сменить пароль
                </Button>
              </Group>
            </Stack>
          </Stack>
        </div>
      </div>
    </div>
  );
}
