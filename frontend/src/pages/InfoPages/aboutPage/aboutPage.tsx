import { Box, Container, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import {
    IconBuildingCommunity,
    IconClockHour4,
    IconKey,
    IconMapPin,
    IconUsersGroup,
} from "@tabler/icons-react";
import LogoSVG from "../../../icons/logo.svg?react";
import { Seo } from "../../../components/seo/Seo";

const stats = [
    { icon: IconBuildingCommunity, value: "100+", label: "объектов в управлении" },
    { icon: IconClockHour4, value: "15 лет", label: "на рынке посуточной аренды" },
    { icon: IconUsersGroup, value: "100 000+", label: "довольных клиентов" },
    { icon: IconMapPin, value: "4", label: "региона присутствия" },
    { icon: IconKey, value: "50+", label: "собственников нам доверяют" },
];

export function AboutPage() {
    return (
        <div className="paperdiv">
            <Seo
                title="О нас"
                description="Sutki Rent — сеть посуточной аренды жилья. Более 100 объектов в управлении, 15 лет на рынке, 4 региона присутствия." />

            <Container size="lg" px={0}>
                {/* Герой */}
                <Stack align="center" gap="md" py="xl">
                    <Box style={{ width: "100%", maxWidth: 260 }}>
                        <LogoSVG style={{ width: "100%", height: "auto" }} />
                    </Box>
                    <Title order={2} ta="center" maw={720}>
                        Наши гости — наша главная ценность
                    </Title>
                    <Text ta="center" c="dimmed" maw={680} size="lg">
                        Мы предлагаем ощутить гостеприимство сети Sutki Rent в его лучшем проявлении.
                    </Text>
                </Stack>

                {/* Цифры */}
                <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="md" mt="md">
                    {stats.map((s) => (
                        <Paper key={s.label} withBorder radius="lg" p="lg">
                            <Stack align="center" gap={6} ta="center">
                                <ThemeIcon variant="light" color="sberGreenColor" size={48} radius="xl">
                                    <s.icon size={26} stroke={1.6} />
                                </ThemeIcon>
                                <Text fw={700} fz={24} lh={1.1} mt={4}>
                                    {s.value}
                                </Text>
                                <Text size="sm" c="dimmed">
                                    {s.label}
                                </Text>
                            </Stack>
                        </Paper>
                    ))}
                </SimpleGrid>

                {/* Текст */}
                <Paper withBorder radius="lg" p="xl" mt="xl">
                    <Stack gap="md">
                        <Text>
                            Мы — ваш надёжный партнёр в мире современной аренды. Для владельцев мы становимся
                            профессиональной командой, которая круглосуточно заботится о вашей недвижимости,
                            максимизируя её доходность. Для гостей — мы те, кто создаёт уют во время ваших поездок.
                            Доверяя нам, вы получаете комфорт и свободу от хлопот.
                        </Text>
                        <Text>
                            Комфортное жильё любого класса посуточно и на длительный срок — от центра до окраин
                            Санкт-Петербурга, а также в других регионах России.
                        </Text>
                        <Title order={4} ta="center" mt="sm">
                            Станьте частью истории Sutki Rent!
                        </Title>
                    </Stack>
                </Paper>
            </Container>
        </div>
    );
}
