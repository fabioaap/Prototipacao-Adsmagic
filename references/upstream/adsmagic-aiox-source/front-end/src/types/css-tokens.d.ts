declare module '*.css' { }

declare global {
    interface CSSStyleDeclaration {
        // HSL vars autocomplete (semantic layer)
        '--background'?: string
        '--foreground'?: string
        '--primary'?: string
        '--primary-foreground'?: string
        '--secondary'?: string
        '--muted'?: string
        '--muted-foreground'?: string
        '--accent'?: string
        '--destructive'?: string
        '--destructive-foreground'?: string
        '--border'?: string
        '--input'?: string
        '--ring'?: string
        '--radius'?: string
        '--radius-xs'?: string
        '--radius-sm'?: string
        '--radius-md'?: string
        '--radius-lg'?: string
        '--radius-xl'?: string
        '--radius-surface'?: string
        '--radius-control'?: string
        '--radius-pill'?: string
        '--space-1'?: string
        '--space-2'?: string
        '--space-3'?: string
        '--space-4'?: string
        '--space-6'?: string
        '--space-8'?: string
        '--control-height-sm'?: string
        '--control-height-md'?: string
        '--control-height-lg'?: string
        '--gutter-mobile'?: string
        '--gutter-tablet'?: string
        '--gutter-desktop'?: string
        '--container-sm'?: string
        '--container-md'?: string
        '--container-lg'?: string
        '--container-xl'?: string
        '--container-2xl'?: string
        // Product layer examples
        '--brand-50'?: string
        '--brand-100'?: string
        '--brand-200'?: string
        '--brand-300'?: string
        '--brand-400'?: string
        '--brand-500'?: string
        '--brand-600'?: string
        '--brand-700'?: string
        '--brand-800'?: string
        '--brand-900'?: string
    }
}

export { }
