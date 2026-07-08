// Claves de caché centralizadas para TanStack Query. Tenerlas en un único lugar
// evita typos y facilita invalidar la caché tras las mutaciones.
export const queryKeys = {
  products: ['products'] as const,
  product: (id: number) => ['products', id] as const,
  categories: ['categories'] as const,
  orders: ['orders'] as const,
  addresses: ['addresses'] as const,
}
