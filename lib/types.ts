// Taxonomía portada tal cual de gastos-app (C:\Users\PAREDES\gastos-app\lib\types.ts)
// para mantener consistencia entre ambas apps.

export type PaymentMethod = 'efectivo' | 'debito' | 'credito' | 'transferencia' | 'otro';

export type TransactionType = 'fijo' | 'variable';

export type TransactionSource = 'manual' | 'mercadopago';

export type CategorySource = 'manual' | 'ai' | 'ai_low_confidence';

export type Category =
  | 'Comida'
  | 'Transporte'
  | 'Salidas'
  | 'Supermercado'
  | 'Servicios'
  | 'Gimnasio'
  | 'Ropa'
  | 'Salud'
  | 'Educación'
  | 'Suscripciones'
  | 'Inversiones'
  | 'Otros';

export const CATEGORIES: Category[] = [
  'Comida',
  'Transporte',
  'Salidas',
  'Supermercado',
  'Servicios',
  'Gimnasio',
  'Ropa',
  'Salud',
  'Educación',
  'Suscripciones',
  'Inversiones',
  'Otros',
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'debito', label: 'Débito' },
  { value: 'credito', label: 'Crédito' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'otro', label: 'Otro' },
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Comida: '#f97316',
  Transporte: '#3b82f6',
  Salidas: '#a855f7',
  Supermercado: '#22c55e',
  Servicios: '#eab308',
  Gimnasio: '#ec4899',
  Ropa: '#06b6d4',
  Salud: '#ef4444',
  Educación: '#8b5cf6',
  Suscripciones: '#14b8a6',
  Inversiones: '#84cc16',
  Otros: '#6b7280',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Comida: '🍔',
  Transporte: '🚗',
  Salidas: '🎉',
  Supermercado: '🛒',
  Servicios: '💡',
  Gimnasio: '💪',
  Ropa: '👕',
  Salud: '🏥',
  Educación: '📚',
  Suscripciones: '📱',
  Inversiones: '📈',
  Otros: '📦',
};

// Una línea de contexto por categoría para el prompt del categorizador de IA
// (lib/ai/categorize.ts) — ayuda al modelo a distinguir casos límite.
export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  Comida: 'Restaurantes, delivery de comida, cafeterías, kioscos de comida preparada',
  Transporte: 'Colectivo, subte, taxi, remis, apps de transporte, combustible, peajes, estacionamiento',
  Salidas: 'Cine, bares, eventos, entretenimiento, salidas sociales',
  Supermercado: 'Supermercado, almacén, verdulería — compras de insumos para consumir en casa',
  Servicios: 'Luz, gas, agua, internet, teléfono, expensas',
  Gimnasio: 'Cuota de gimnasio, clases deportivas, actividad física paga',
  Ropa: 'Indumentaria, calzado, accesorios',
  Salud: 'Farmacia, médico, obra social, estudios médicos',
  Educación: 'Cursos, universidad, libros de estudio, material educativo',
  Suscripciones: 'Streaming, software, apps con cobro recurrente',
  Inversiones: 'Compra de activos financieros, aportes a inversiones, ahorro',
  Otros: 'Cualquier gasto que no encaje claramente en las categorías anteriores',
};
