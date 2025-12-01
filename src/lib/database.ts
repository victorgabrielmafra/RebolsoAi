// Sistema de banco de dados com ISOLAMENTO TOTAL por usuário
import fs from 'fs'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'database.json')

// Lista de e-mails com permissões de administrador
const ADMIN_EMAILS = [
  'victorgabrielmafrafernandes47@gmail.com'
]

export interface User {
  id: string
  email: string
  password: string // hash bcrypt
  name: string
  plan: 'free' | 'pro' | 'premium'
  isVerified: boolean
  isAdmin?: boolean // Permissão de administrador
  verificationToken?: string
  createdAt: string
  reimbursementsThisMonth: number
  lastMonthReset: string // Para controle mensal
}

export interface Reimbursement {
  id: string
  userId: string // ISOLAMENTO: cada reembolso pertence a UM usuário
  tipo: string
  profissional: string
  valor: number
  valorReembolso: number
  data: string
  status: 'pendente' | 'em_analise' | 'aprovado' | 'recusado' | 'enviado'
  operadora: string
  protocolo: string
  createdAt: string
  sentToOperatorAt?: string
}

export interface ActionLog {
  id: string
  userId: string
  action: string
  details: string
  timestamp: string
}

interface Database {
  users: User[]
  reimbursements: Reimbursement[]
  logs: ActionLog[]
}

// Verificar se e-mail é de administrador
function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

// Inicializar banco de dados
function initDB(): Database {
  const dataDir = path.join(process.cwd(), 'data')
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  if (!fs.existsSync(DB_PATH)) {
    const initialData: Database = {
      users: [],
      reimbursements: [],
      logs: []
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2))
    console.log('[DB] Banco de dados inicializado')
    return initialData
  }

  const data = fs.readFileSync(DB_PATH, 'utf-8')
  return JSON.parse(data)
}

// Ler banco de dados
export function readDB(): Database {
  try {
    return initDB()
  } catch (error) {
    console.error('Erro ao ler banco de dados:', error)
    return { users: [], reimbursements: [], logs: [] }
  }
}

// Escrever no banco de dados
export function writeDB(data: Database): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Erro ao escrever no banco de dados:', error)
  }
}

// ==================== USUÁRIOS ====================

export function getUserByEmail(email: string): User | undefined {
  const db = readDB()
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase())
}

export function getUserById(id: string): User | undefined {
  const db = readDB()
  return db.users.find(u => u.id === id)
}

export function getUserByVerificationToken(token: string): User | undefined {
  const db = readDB()
  return db.users.find(u => u.verificationToken === token)
}

export function createUser(user: Omit<User, 'id' | 'createdAt' | 'reimbursementsThisMonth' | 'lastMonthReset' | 'isVerified' | 'isAdmin'>): User {
  const db = readDB()
  
  const newUser: User = {
    ...user,
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    isVerified: false,
    isAdmin: isAdminEmail(user.email), // Verificar se é admin
    createdAt: new Date().toISOString(),
    reimbursementsThisMonth: 0,
    lastMonthReset: new Date().toISOString()
  }
  
  db.users.push(newUser)
  writeDB(db)
  
  // Log da criação
  addLog({
    userId: newUser.id,
    action: 'USER_CREATED',
    details: `Usuário ${newUser.email} criado com plano ${newUser.plan}${newUser.isAdmin ? ' (ADMIN)' : ''}`
  })
  
  console.log(`[DB] Usuário criado: ${newUser.email} (ID: ${newUser.id})${newUser.isAdmin ? ' [ADMIN]' : ''}`)
  return newUser
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const db = readDB()
  const userIndex = db.users.findIndex(u => u.id === id)
  if (userIndex === -1) return null
  
  db.users[userIndex] = { ...db.users[userIndex], ...updates }
  writeDB(db)
  
  console.log(`[DB] Usuário atualizado: ${id}`)
  return db.users[userIndex]
}

// 🚨 CRÍTICO: Deletar usuário (usado quando e-mail não é enviado)
export function deleteUser(id: string): boolean {
  const db = readDB()
  const userIndex = db.users.findIndex(u => u.id === id)
  
  if (userIndex === -1) {
    console.error(`[DB] ❌ Tentativa de deletar usuário inexistente: ${id}`)
    return false
  }
  
  const deletedUser = db.users[userIndex]
  db.users.splice(userIndex, 1)
  writeDB(db)
  
  console.log(`[DB] 🗑️ Usuário deletado: ${deletedUser.email} (ID: ${id})`)
  
  // Log da deleção
  addLog({
    userId: id,
    action: 'USER_DELETED',
    details: `Usuário ${deletedUser.email} deletado (falha no envio de e-mail)`
  })
  
  return true
}

// ==================== REEMBOLSOS ====================

export function createReimbursement(reimbursement: Omit<Reimbursement, 'id' | 'createdAt' | 'status'>): Reimbursement {
  const db = readDB()
  
  const newReimbursement: Reimbursement = {
    ...reimbursement,
    id: `reimb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'pendente',
    createdAt: new Date().toISOString()
  }
  
  db.reimbursements.push(newReimbursement)
  writeDB(db)
  
  // Log da criação
  addLog({
    userId: reimbursement.userId,
    action: 'REIMBURSEMENT_CREATED',
    details: `Reembolso ${newReimbursement.protocolo} criado - R$ ${reimbursement.valorReembolso}`
  })
  
  console.log(`[DB] Reembolso criado: ${newReimbursement.protocolo} (Usuário: ${reimbursement.userId})`)
  return newReimbursement
}

// ISOLAMENTO: retorna APENAS reembolsos do usuário específico
export function getReimbursementsByUserId(userId: string): Reimbursement[] {
  const db = readDB()
  return db.reimbursements.filter(r => r.userId === userId)
}

export function getReimbursementById(id: string): Reimbursement | undefined {
  const db = readDB()
  return db.reimbursements.find(r => r.id === id)
}

export function updateReimbursement(id: string, updates: Partial<Reimbursement>): Reimbursement | null {
  const db = readDB()
  const reimbIndex = db.reimbursements.findIndex(r => r.id === id)
  if (reimbIndex === -1) return null
  
  const oldStatus = db.reimbursements[reimbIndex].status
  db.reimbursements[reimbIndex] = { ...db.reimbursements[reimbIndex], ...updates }
  writeDB(db)
  
  // Log da atualização
  if (updates.status && updates.status !== oldStatus) {
    addLog({
      userId: db.reimbursements[reimbIndex].userId,
      action: 'REIMBURSEMENT_STATUS_CHANGED',
      details: `Status alterado de ${oldStatus} para ${updates.status}`
    })
  }
  
  console.log(`[DB] Reembolso atualizado: ${id}`)
  return db.reimbursements[reimbIndex]
}

// ==================== LOGS ====================

export function addLog(log: Omit<ActionLog, 'id' | 'timestamp'>): void {
  const db = readDB()
  
  const newLog: ActionLog = {
    ...log,
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString()
  }
  
  db.logs.push(newLog)
  writeDB(db)
}

export function getLogsByUserId(userId: string): ActionLog[] {
  const db = readDB()
  return db.logs.filter(l => l.userId === userId)
}

// ==================== MANUTENÇÃO ====================

// Resetar contador mensal (executar todo início de mês via cron job)
export function resetMonthlyCounters(): void {
  const db = readDB()
  const now = new Date()
  
  db.users = db.users.map(user => {
    const lastReset = new Date(user.lastMonthReset)
    
    // Se passou mais de 30 dias, resetar contador
    if (now.getTime() - lastReset.getTime() > 30 * 24 * 60 * 60 * 1000) {
      console.log(`[DB] Resetando contador mensal do usuário: ${user.email}`)
      return {
        ...user,
        reimbursementsThisMonth: 0,
        lastMonthReset: now.toISOString()
      }
    }
    
    return user
  })
  
  writeDB(db)
}

// Estatísticas do usuário (isoladas)
export function getUserStats(userId: string): {
  totalReimbursements: number
  totalValue: number
  totalReimbursed: number
  byStatus: Record<string, number>
} {
  const reimbursements = getReimbursementsByUserId(userId)
  
  return {
    totalReimbursements: reimbursements.length,
    totalValue: reimbursements.reduce((sum, r) => sum + r.valor, 0),
    totalReimbursed: reimbursements.reduce((sum, r) => sum + r.valorReembolso, 0),
    byStatus: reimbursements.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}
