
export const queryKeys = {
  products: ['products'] as const,
  product: (id: number) => ['products', id] as const,
  categories: ['categories'] as const,
  orders: ['orders'] as const,
  addresses: ['addresses'] as const,
  profile: ['profile'] as const,
}
