import { Button, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconMoodEmpty, type IconProps } from '@tabler/icons-react';
import type { ComponentType, ReactNode } from 'react';

export interface EmptyStateProps {
  /** Иконка состояния (Tabler). По умолчанию — «пусто». */
  icon?: ComponentType<IconProps>;
  title: string;
  description?: ReactNode;
  /** Подпись кнопки действия. Кнопка показывается, только если задан onAction. */
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Единое оформление «пустого» состояния: иконка, заголовок, пояснение
 * и опциональный призыв к действию. Заменяет голые строки текста.
 */
export function EmptyState({
  icon: Icon = IconMoodEmpty,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Stack align="center" justify="center" gap="xs" py={48} px="md" ta="center">
      <ThemeIcon variant="light" color="grayColor" size={64} radius="xl">
        <Icon size={32} stroke={1.5} />
      </ThemeIcon>
      <Title order={4} mt="sm">
        {title}
      </Title>
      {description && (
        <Text c="dimmed" maw={420}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} mt="sm" radius="md">
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
}
