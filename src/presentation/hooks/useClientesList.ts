import { useState, useEffect } from 'react'
import { clientesUseCase } from '@/infrastructure/factories/pacientes.factory'
import type { Cliente } from '@/domain/entities/cliente.entity'

export function useClientesList() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  useEffect(() => {
    clientesUseCase.list(1, '').then((data) => setClientes(data.results)).catch(() => {})
  }, [])
  return clientes
}
