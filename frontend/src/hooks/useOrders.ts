import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ordersApi,
  orderDetailsApi,
  type OrderPayload,
  type OrderDetailPayload,
} from '../api/resources'
import { queryKeys } from './queryKeys'

export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: ordersApi.list,
  })
}

export function useCreateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: OrderPayload) => ordersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orders }),
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: string }) =>
      ordersApi.patch(id, { estado }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orders }),
  })
}

// Actualización parcial de un pedido (solo staff): estado, dirección de envío
// y/o comprador. Se envía únicamente lo que cambia.
export function useUpdateOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<OrderPayload> }) =>
      ordersApi.patch(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orders }),
  })
}

export function useDeleteOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => ordersApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orders }),
  })
}

export function useCreateOrderDetail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: OrderDetailPayload) => orderDetailsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orders }),
  })
}

export function useDeleteOrderDetail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => orderDetailsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.orders }),
  })
}
