import { createTheme, rem, type MantineColorsTuple } from '@mantine/core';

/**
 * Единая тема Mantine — единственный источник истины для цвета, типографики,
 * отступов, радиусов и дефолтов компонентов. Не задавать цвета и размеры
 * точечно в компонентах: только токены отсюда.
 */

// Фирменный зелёный — глубокий, сдержанный (не кислотный).
// Имя ключа сохранено (`sberGreenColor`), чтобы существующие
// var(--mantine-color-sberGreenColor-*) по всему проекту сразу получили новый цвет.
const brandGreen: MantineColorsTuple = [
  '#ecf6ef',
  '#d7ebdd',
  '#aed7ba',
  '#82c194',
  '#5fae75',
  '#45a160',
  '#389a55',
  '#2f8249',
  '#276a3c',
  '#1e5530',
];

// Нейтральная серая шкала (текст, границы, фоны).
const grayColor: MantineColorsTuple = [
  '#F8F9FA',
  '#F1F3F5',
  '#E9ECEF',
  '#DEE2E6',
  '#CED4DA',
  '#ADB5BD',
  '#868E96',
  '#495057',
  '#343A40',
  '#212529',
];

// Семантические / вспомогательные цвета.
const redColor: MantineColorsTuple = [
  '#ffecec',
  '#f8d9d9',
  '#e9b1b1',
  '#dc8786',
  '#d16363',
  '#ca4d4c',
  '#c84040',
  '#b13232',
  '#9f2a2b',
  '#8c2023',
];

const orangeColor: MantineColorsTuple = [
  '#fff6e2',
  '#feeccf',
  '#f9d7a1',
  '#f5c16f',
  '#f1af44',
  '#f0a329',
  '#ef9d19',
  '#d5880b',
  '#bd7802',
  '#a56700',
];

const fontFamily =
  "'Golos Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export const theme = createTheme({
  primaryColor: 'sberGreenColor',
  primaryShade: { light: 7, dark: 6 },

  fontFamily,
  fontFamilyMonospace: "'JetBrains Mono', Menlo, Monaco, Consolas, 'Courier New', monospace",

  defaultRadius: 'md',

  colors: {
    redColor,
    grayColor,
    orangeColor,
    // Единый бренд-зелёный под обоими историческими ключами,
    // чтобы весь старый код стал единообразным без массовых замен.
    sberGreenColor: brandGreen,
    sutkiGreenColor: brandGreen,
  },

  breakpoints: {
    xs: '30em', // 480px
    sm: '48em', // 768px
    md: '64em', // 1024px
    lg: '74em', // 1184px
    xl: '90em', // 1440px
  },

  fontSizes: {
    xs: rem(12),
    sm: rem(13),
    md: rem(15),
    lg: rem(17),
    xl: rem(20),
  },

  radius: {
    xs: rem(4),
    sm: rem(8),
    md: rem(12),
    lg: rem(16),
    xl: rem(24),
  },

  shadows: {
    xs: '0 1px 2px rgba(16, 24, 40, 0.05)',
    sm: '0 1px 3px rgba(16, 24, 40, 0.08), 0 1px 2px rgba(16, 24, 40, 0.04)',
    md: '0 4px 12px rgba(16, 24, 40, 0.08)',
    lg: '0 12px 28px rgba(16, 24, 40, 0.12)',
    xl: '0 24px 48px rgba(16, 24, 40, 0.16)',
  },

  headings: {
    fontFamily,
    fontWeight: '700',
    sizes: {
      h1: { fontSize: rem(30), lineHeight: '1.25' },
      h2: { fontSize: rem(24), lineHeight: '1.3' },
      h3: { fontSize: rem(19), lineHeight: '1.35' },
      h4: { fontSize: rem(17), lineHeight: '1.4' },
      h5: { fontSize: rem(15), lineHeight: '1.4' },
      h6: { fontSize: rem(13), lineHeight: '1.45' },
    },
  },

  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Textarea: {
      defaultProps: {
        radius: 'md',
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
    },
    Badge: {
      defaultProps: {
        radius: 'sm',
      },
    },
    Modal: {
      defaultProps: {
        radius: 'lg',
        centered: true,
      },
    },
  },
});
