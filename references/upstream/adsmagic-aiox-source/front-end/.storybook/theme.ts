import { create } from 'storybook/theming'

export default create({
    base: 'light',

    // Brand
    brandTitle: 'Adsmagic Design System',
    brandUrl: 'https://adsmagic.io',
    brandTarget: '_self',

    // Colors
    colorPrimary: '#6366f1',
    colorSecondary: '#4f46e5',

    // UI
    appBg: '#f8fafc',
    appContentBg: '#ffffff',
    appBorderColor: '#e2e8f0',
    appBorderRadius: 8,

    // Text colors
    textColor: '#1e293b',
    textInverseColor: '#ffffff',
    textMutedColor: '#64748b',

    // Toolbar default and active colors
    barTextColor: '#64748b',
    barSelectedColor: '#6366f1',
    barHoverColor: '#4f46e5',
    barBg: '#ffffff',

    // Form colors
    inputBg: '#ffffff',
    inputBorder: '#e2e8f0',
    inputTextColor: '#1e293b',
    inputBorderRadius: 6,
})
