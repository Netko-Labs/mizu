import type { DeploymentListItem, Service } from '@mizu/nagare-domain'
import type { Serialized } from '@/shared/api'

export interface DeploymentsTabProps {
  service: Serialized<Service>
}

export interface DeploymentItemProps {
  deployment: Serialized<DeploymentListItem>
  isCurrent: boolean
  onRollback: (deploymentId: string) => void
  rollbackPending: boolean
}

export interface UseRollbackOptions {
  serviceId: string
  projectId: string
}

export interface UseRollbackResult {
  confirmId: string | null
  setConfirmId: (id: string | null) => void
  rollback: (deploymentId: string) => void
  isPending: boolean
}
