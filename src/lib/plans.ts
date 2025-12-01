// Sistema de planos e limitações
import { User } from './database'

export interface PlanLimits {
  name: string
  maxReimbursementsPerMonth: number
  canGeneratePDF: boolean
  canSendToOperator: boolean
  hasFullHistory: boolean
  hasAutomaticSend: boolean
  hasPriorityProcessing: boolean
  hasAdvancedDashboard: boolean
}

export const PLANS: Record<User['plan'], PlanLimits> = {
  free: {
    name: 'Gratuito',
    maxReimbursementsPerMonth: 1,
    canGeneratePDF: false,
    canSendToOperator: false,
    hasFullHistory: false,
    hasAutomaticSend: false,
    hasPriorityProcessing: false,
    hasAdvancedDashboard: false
  },
  pro: {
    name: 'Pro',
    maxReimbursementsPerMonth: 10,
    canGeneratePDF: true,
    canSendToOperator: true,
    hasFullHistory: true,
    hasAutomaticSend: false,
    hasPriorityProcessing: false,
    hasAdvancedDashboard: false
  },
  premium: {
    name: 'Premium',
    maxReimbursementsPerMonth: Infinity,
    canGeneratePDF: true,
    canSendToOperator: true,
    hasFullHistory: true,
    hasAutomaticSend: true,
    hasPriorityProcessing: true,
    hasAdvancedDashboard: true
  }
}

// Verificar se usuário pode criar novo reembolso
export function canCreateReimbursement(user: User): { allowed: boolean; reason?: string } {
  const limits = PLANS[user.plan]
  
  if (user.reimbursementsThisMonth >= limits.maxReimbursementsPerMonth) {
    return {
      allowed: false,
      reason: `Você atingiu o limite de ${limits.maxReimbursementsPerMonth} reembolso(s) por mês do plano ${limits.name}. Faça upgrade para continuar.`
    }
  }

  return { allowed: true }
}

// Verificar se usuário pode gerar PDF
export function canGeneratePDF(user: User): { allowed: boolean; reason?: string } {
  const limits = PLANS[user.plan]
  
  if (!limits.canGeneratePDF) {
    return {
      allowed: false,
      reason: `Geração de PDF não está disponível no plano ${limits.name}. Faça upgrade para o plano Pro ou Premium.`
    }
  }

  return { allowed: true }
}

// Verificar se usuário pode enviar para operadora
export function canSendToOperator(user: User): { allowed: boolean; reason?: string } {
  const limits = PLANS[user.plan]
  
  if (!limits.canSendToOperator) {
    return {
      allowed: false,
      reason: `Envio para operadora não está disponível no plano ${limits.name}. Faça upgrade para o plano Pro ou Premium.`
    }
  }

  return { allowed: true }
}

// Obter informações do plano do usuário
export function getUserPlanInfo(user: User): PlanLimits & { currentUsage: number } {
  const limits = PLANS[user.plan]
  return {
    ...limits,
    currentUsage: user.reimbursementsThisMonth
  }
}
