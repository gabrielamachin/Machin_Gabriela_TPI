import { axiosInstance } from '@/shared/api/axiosInstance'

import type {
  EstadoPedido,
  FiltrosPedidos,
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  ResumenPedidos,
} from '../types'

export async function crearPedido(datos: PedidoCreate): Promise<Pedido> {
  const { data } = await axiosInstance.post<Pedido>('/pedidos', datos)
  return data
}

/** El backend devuelve los pedidos propios (user) o todos (admin) según el rol de la sesión. */
export async function getPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
  const { data } = await axiosInstance.get<PedidosPaginados>('/pedidos', {
    params: {
      skip: filtros.pagina * filtros.limite,
      limit: filtros.limite,
      estado: filtros.estado,
    },
  })
  return data
}

export async function getMisPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
  const { data } = await axiosInstance.get<PedidosPaginados>('/pedidos/mis-pedidos', {
    params: {
      skip: filtros.pagina * filtros.limite,
      limit: filtros.limite,
      estado: filtros.estado,
    },
  })
  return data
}

export async function cancelarPedido(pedidoId: number): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${pedidoId}/cancelar`)
  return data
}

export async function getResumen(): Promise<ResumenPedidos> {
  const { data } = await axiosInstance.get<ResumenPedidos>('/pedidos/resumen')
  return data
}

/** Solo admin: avanza o cancela un pedido según la máquina de estados. */
export async function cambiarEstadoPedido(pedidoId: number, estado: EstadoPedido): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(`/pedidos/${pedidoId}/estado`, { estado })
  return data
}
