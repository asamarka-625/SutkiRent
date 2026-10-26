import { Button, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import type { ReactNode } from 'react';

export interface ErrorStateProps {
  title?: string;
  description?: ReactNode;
  /** Если задан — показывается кнопка «Повторить». */
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Единое оформление состояния ошибки: понятный текст вместо системных
 * сообщений и кнопка повторить.
 */
export function ErrorState({
  title = 'Не удалось загрузить данные',
  description = 'Проверьте подключение к интернету и попробуйте ещё раз.',
  onRetry,
  retryLabel = 'Повторить',
}: ErrorStateProps) {
  return (
    <Stack align="center" justify="center" gap="xs" py={48} px="md" ta="center">
      <ThemeIcon variant="light" color="redColor" size={64} radius="xl">
        <IconAlertTriangle size={32} stroke={1.5} />
      </ThemeIcon>
      <Title order={4} mt="sm">
        {title}
      </Title>
      {description && (
        <Text c="dimmed" maw={420}>
          {description}
        </Text>
      )}
      {onRetry && (
        <Button
          onClick={onRetry}
          mt="sm"
          radius="md"
          variant="light"
          leftSection={<IconRefresh size={16} />}
        >
          {retryLabel}
        </Button>
      )}
    </Stack>
  );
}
