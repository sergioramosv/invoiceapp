export type TemplateStyle = 'default' | 'minimal' | 'corporate' | 'creative'

export const TEMPLATE_STYLES: { id: TemplateStyle; name: string; description: string }[] = [
  { id: 'default', name: 'Clasico', description: 'Diseno limpio y profesional' },
  { id: 'minimal', name: 'Minimal', description: 'Ultra-limpio, solo lo esencial' },
  { id: 'corporate', name: 'Corporativo', description: 'Formal con cabecera destacada' },
  { id: 'creative', name: 'Creativo', description: 'Moderno con acentos de color' },
]
