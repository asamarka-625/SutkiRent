import { Group, Paper, Skeleton, Stack } from '@mantine/core';

export interface ListSkeletonProps {
  /** Сколько карточек-заглушек показать. */
  count?: number;
  /** Форма элемента: карточка объекта или строка. */
  variant?: 'card' | 'row';
}

/**
 * Скелетоны списка — показываются во время загрузки вместо голого <Loader />,
 * сохраняя структуру будущего контента (без «прыжков» layout).
 */
export function ListSkeleton({ count = 4, variant = 'card' }: ListSkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === 'row') {
    return (
      <Stack gap="sm">
        {items.map((_, i) => (
          <Paper key={i} withBorder radius="lg" p="md">
            <Group wrap="nowrap" align="center" gap="md">
              <Skeleton height={56} width={56} radius="md" />
              <Stack gap={8} style={{ flex: 1 }}>
                <Skeleton height={14} width="45%" radius="sm" />
                <Skeleton height={12} width="70%" radius="sm" />
              </Stack>
              <Skeleton height={32} width={96} radius="md" />
            </Group>
          </Paper>
        ))}
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {items.map((_, i) => (
        <Paper key={i} withBorder radius="lg" p="md">
          <Group wrap="nowrap" align="flex-start" gap="md">
            <Skeleton height={140} width={200} radius="md" visibleFrom="sm" />
            <Stack gap={10} style={{ flex: 1 }}>
              <Skeleton height={18} width="55%" radius="sm" />
              <Skeleton height={12} width="80%" radius="sm" />
              <Skeleton height={12} width="40%" radius="sm" />
              <Group justify="space-between" mt="md">
                <Skeleton height={22} width={90} radius="sm" />
                <Skeleton height={34} width={120} radius="md" />
              </Group>
            </Stack>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}
