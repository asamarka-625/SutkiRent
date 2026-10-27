import { useState } from 'react';
import {
  Button,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IMaskInput } from 'react-imask';
import { IconHeadset, IconMail, IconPhone } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { Seo } from '../../../components/seo/Seo';

const CONTACT_PHONE = '+7 995 577-53-68';
const CONTACT_PHONE_HREF = 'tel:+79955775368';
const CONTACT_EMAIL = 'elkined@yandex.ru';

export function CountdownPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const form = useForm({
    initialValues: { name: '', phone: '', comment: '' },
    validate: {
      name: (v) => (v.trim().length < 2 ? 'Укажите имя' : null),
      phone: (v) =>
        v.replace(/\D/g, '').length < 11 ? 'Укажите корректный телефон' : null,
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setSending(true);
    try {
      // Данные заявки, готовые к отправке на бэкенд.
      // TODO: подключить реальный эндпоинт приёма заявок (POST /api/consultations/).
      const payload = {
        name: values.name.trim(),
        phone: values.phone,
        comment: values.comment.trim(),
      };
      void payload;
      await new Promise((r) => setTimeout(r, 600));
      setSubmitted(true);
      showNotification({
        color: 'sberGreenColor',
        title: 'Заявка отправлена',
        message: 'Мы свяжемся с вами в ближайшее время.',
      });
      form.reset();
    } finally {
      setSending(false);
    }
  });

  return (
    <div className="paperdiv">
      <Seo
        title="Бесплатная консультация"
        description="Оставьте заявку — поможем подобрать жильё или ответим на вопросы по аренде и управлению недвижимостью Sutki Rent."
      />

      <Container size="md" px={0} py="md">
        <Stack align="center" gap="xs" mb="lg" ta="center">
          <ThemeIcon variant="light" color="sberGreenColor" size={56} radius="xl">
            <IconHeadset size={30} stroke={1.6} />
          </ThemeIcon>
          <Title order={2}>Бесплатная консультация</Title>
          <Text c="dimmed" maw={560}>
            Оставьте заявку — поможем подобрать жильё, ответим на вопросы по бронированию
            или управлению вашей недвижимостью. Перезвоним в ближайшее время.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="lg">
          <Paper component="a" href={CONTACT_PHONE_HREF} withBorder radius="lg" p="md"
            style={{ textDecoration: 'none', color: 'inherit' }}>
            <Group gap="sm" wrap="nowrap">
              <ThemeIcon variant="light" color="sberGreenColor" size={40} radius="md">
                <IconPhone size={20} />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed">Телефон</Text>
                <Text fw={600} size="sm">{CONTACT_PHONE}</Text>
              </div>
            </Group>
          </Paper>
          <Paper component="a" href={`mailto:${CONTACT_EMAIL}`} withBorder radius="lg" p="md"
            style={{ textDecoration: 'none', color: 'inherit' }}>
            <Group gap="sm" wrap="nowrap">
              <ThemeIcon variant="light" color="sberGreenColor" size={40} radius="md">
                <IconMail size={20} />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed">Почта</Text>
                <Text fw={600} size="sm">{CONTACT_EMAIL}</Text>
              </div>
            </Group>
          </Paper>
          <Paper withBorder radius="lg" p="md">
            <Group gap="sm" wrap="nowrap">
              <ThemeIcon variant="light" color="sberGreenColor" size={40} radius="md">
                <IconHeadset size={20} />
              </ThemeIcon>
              <div>
                <Text size="xs" c="dimmed">Режим</Text>
                <Text fw={600} size="sm">Ежедневно, 9:00–21:00</Text>
              </div>
            </Group>
          </Paper>
        </SimpleGrid>

        <Paper withBorder radius="lg" p="xl">
          {submitted ? (
            <Stack align="center" gap="xs" py="md" ta="center">
              <ThemeIcon variant="light" color="sberGreenColor" size={56} radius="xl">
                <IconHeadset size={30} stroke={1.6} />
              </ThemeIcon>
              <Title order={4}>Спасибо! Заявка принята</Title>
              <Text c="dimmed" maw={420}>
                Мы свяжемся с вами в ближайшее время. Если вопрос срочный — позвоните нам
                по телефону {CONTACT_PHONE}.
              </Text>
              <Button variant="light" mt="sm" onClick={() => setSubmitted(false)}>
                Отправить ещё одну заявку
              </Button>
            </Stack>
          ) : (
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <Title order={4}>Оставить заявку</Title>
                <TextInput
                  label="Как к вам обращаться"
                  placeholder="Имя"
                  withAsterisk
                  {...form.getInputProps('name')}
                />
                <TextInput
                  label="Телефон"
                  placeholder="+7 (___) ___-__-__"
                  withAsterisk
                  component={IMaskInput}
                  // @ts-expect-error — IMaskInput prop прокидывается в DOM-инпут
                  mask="+7 (000) 000-00-00"
                  {...form.getInputProps('phone')}
                />
                <Textarea
                  label="Комментарий"
                  placeholder="Коротко опишите вопрос (необязательно)"
                  autosize
                  minRows={3}
                  maxRows={6}
                  {...form.getInputProps('comment')}
                />
                <Button type="submit" loading={sending} size="md" radius="md">
                  Отправить заявку
                </Button>
                <Text size="xs" c="dimmed">
                  Нажимая «Отправить заявку», вы соглашаетесь на обработку персональных данных.
                </Text>
              </Stack>
            </form>
          )}
        </Paper>
      </Container>
    </div>
  );
}
