// Sistema de autenticação REAL e SEGURO
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getUserByEmail, createUser, User, updateUser, getUserByVerificationToken, deleteUser } from './database'
import { sendVerificationEmail, sendWelcomeEmail } from './email'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'reembolsai-secret-key-change-in-production'

export interface AuthResponse {
  success: boolean
  message: string
  user?: Omit<User, 'password'>
  token?: string
}

// Validar formato de e-mail
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validar força da senha
function isStrongPassword(password: string): { valid: boolean; reason?: string } {
  if (password.length < 8) {
    return { valid: false, reason: 'Senha deve ter no mínimo 8 caracteres' }
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: 'Senha deve conter pelo menos uma letra maiúscula' }
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, reason: 'Senha deve conter pelo menos uma letra minúscula' }
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: 'Senha deve conter pelo menos um número' }
  }
  
  return { valid: true }
}

// Gerar token de verificação único
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Registrar novo usuário COM VALIDAÇÕES REAIS E ENVIO DE E-MAIL OBRIGATÓRIO
export async function registerUser(
  email: string, 
  password: string, 
  name: string,
  confirmPassword?: string
): Promise<AuthResponse> {
  try {
    console.log(`[AUTH] 🔐 Iniciando registro para: ${email}`)

    // ✅ VALIDAÇÃO 1: Dados obrigatórios
    if (!email || !password || !name) {
      return { success: false, message: 'Todos os campos são obrigatórios' }
    }

    // ✅ VALIDAÇÃO 2: Formato do e-mail
    if (!isValidEmail(email)) {
      return { success: false, message: 'E-mail inválido' }
    }

    // ✅ VALIDAÇÃO 3: Confirmação de senha
    if (confirmPassword && password !== confirmPassword) {
      return { success: false, message: 'As senhas não coincidem' }
    }

    // ✅ VALIDAÇÃO 4: Força da senha
    const passwordValidation = isStrongPassword(password)
    if (!passwordValidation.valid) {
      return { success: false, message: passwordValidation.reason! }
    }

    // ✅ VALIDAÇÃO 5: E-mail já existe (IMPEDIR DUPLICADOS)
    const existingUser = getUserByEmail(email)
    if (existingUser) {
      console.log(`[AUTH] ❌ Tentativa de cadastro com e-mail duplicado: ${email}`)
      return { success: false, message: 'Este e-mail já está cadastrado' }
    }

    // ✅ VALIDAÇÃO 6: Verificar variáveis de ambiente ANTES de criar conta
    const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS']
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    // Verificar se existe NEXT_PUBLIC_APP_URL ou APP_URL
    if (!process.env.NEXT_PUBLIC_APP_URL && !process.env.APP_URL) {
      missingVars.push('NEXT_PUBLIC_APP_URL ou APP_URL')
    }
    
    if (missingVars.length > 0) {
      console.error(`[AUTH] ❌ ERRO CRÍTICO: Variáveis de ambiente ausentes: ${missingVars.join(', ')}`)
      return { 
        success: false, 
        message: 'Sistema de e-mail não configurado. Entre em contato com o suporte.' 
      }
    }

    console.log('[AUTH] ✅ Todas as validações passaram')

    // Hash da senha com bcrypt (CRIPTOGRAFIA REAL)
    const hashedPassword = await bcrypt.hash(password, 12)

    // Gerar token de verificação
    const verificationToken = generateVerificationToken()

    console.log('[AUTH] 📝 Criando usuário no banco de dados...')

    // Criar usuário no banco
    const newUser = createUser({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name.trim(),
      plan: 'free', // Todos começam no plano gratuito
      verificationToken
    })

    console.log(`[AUTH] ✅ Usuário criado no banco: ${newUser.email} (ID: ${newUser.id})`)
    console.log('[AUTH] 📧 Tentando enviar e-mail de verificação...')

    // 🚨 CRÍTICO: Enviar e-mail de verificação - SE FALHAR, DELETAR USUÁRIO
    const emailSent = await sendVerificationEmail(newUser.email, newUser.name, verificationToken)
    
    if (!emailSent) {
      console.error('[AUTH] ❌ FALHA CRÍTICA: E-mail de verificação NÃO foi enviado!')
      console.error('[AUTH] 🗑️ Deletando usuário criado para evitar contas inválidas...')
      
      // DELETAR usuário do banco (não pode existir sem e-mail enviado)
      deleteUser(newUser.id)
      
      console.error('[AUTH] ❌ Usuário deletado. Cadastro bloqueado.')
      
      return { 
        success: false, 
        message: 'Falha ao enviar e-mail de verificação. Verifique suas configurações de e-mail e tente novamente.' 
      }
    }

    console.log('[AUTH] ✅ E-mail de verificação enviado com sucesso!')

    // Gerar token JWT seguro (mesmo sem verificação, para login automático)
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        plan: newUser.plan
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = newUser

    console.log(`[AUTH] ✅ Registro completo: ${newUser.email} (ID: ${newUser.id})`)

    return {
      success: true,
      message: 'Conta criada com sucesso! Verifique seu e-mail para ativar sua conta.',
      user: userWithoutPassword,
      token
    }
  } catch (error) {
    console.error('[AUTH] ❌ Erro ao registrar usuário:', error)
    return { success: false, message: 'Erro ao criar conta. Tente novamente.' }
  }
}

// Login de usuário COM VERIFICAÇÃO REAL E BLOQUEIO
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    console.log(`[AUTH] 🔐 Tentativa de login: ${email}`)

    // Validar dados obrigatórios
    if (!email || !password) {
      return { success: false, message: 'E-mail e senha são obrigatórios' }
    }

    // Buscar usuário no banco (VERIFICAÇÃO REAL)
    const user = getUserByEmail(email.toLowerCase().trim())
    if (!user) {
      console.log(`[AUTH] ❌ Usuário não encontrado: ${email}`)
      return { success: false, message: 'E-mail ou senha incorretos' }
    }

    // Verificar senha com bcrypt (COMPARAÇÃO SEGURA)
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      console.log(`[AUTH] ❌ Senha incorreta para: ${email}`)
      return { success: false, message: 'E-mail ou senha incorretos' }
    }

    // 🚨 BLOQUEIO CRÍTICO: Verificar se e-mail foi verificado
    if (!user.isVerified) {
      console.log(`[AUTH] ❌ Login bloqueado - e-mail não verificado: ${email}`)
      return { 
        success: false, 
        message: 'Seu e-mail ainda não foi verificado. Verifique sua caixa de entrada ou spam.' 
      }
    }

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        plan: user.plan
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user

    console.log(`[AUTH] ✅ Login bem-sucedido: ${user.email} (ID: ${user.id})`)

    return {
      success: true,
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      token
    }
  } catch (error) {
    console.error('[AUTH] ❌ Erro ao fazer login:', error)
    return { success: false, message: 'Erro ao fazer login' }
  }
}

// Verificar e-mail do usuário
export async function verifyUserEmail(token: string): Promise<AuthResponse> {
  try {
    console.log(`[AUTH] 🔍 Verificando token: ${token.substring(0, 10)}...`)

    // Buscar usuário pelo token
    const user = getUserByVerificationToken(token)
    
    if (!user) {
      console.log('[AUTH] ❌ Token inválido ou expirado')
      return { success: false, message: 'Token de verificação inválido ou expirado' }
    }

    // Se já está verificado
    if (user.isVerified) {
      console.log(`[AUTH] ⚠️ Conta já verificada: ${user.email}`)
      return { success: false, message: 'Esta conta já foi verificada' }
    }

    // Atualizar usuário para verificado
    const updatedUser = updateUser(user.id, {
      isVerified: true,
      verificationToken: undefined // Remover token após uso
    })

    if (!updatedUser) {
      console.error('[AUTH] ❌ Erro ao atualizar usuário')
      return { success: false, message: 'Erro ao verificar conta' }
    }

    console.log(`[AUTH] ✅ E-mail verificado: ${updatedUser.email}`)

    // Enviar e-mail de boas-vindas
    console.log('[AUTH] 📧 Enviando e-mail de boas-vindas...')
    await sendWelcomeEmail(updatedUser.email, updatedUser.name)

    return {
      success: true,
      message: 'E-mail verificado com sucesso! Você já pode fazer login.'
    }
  } catch (error) {
    console.error('[AUTH] ❌ Erro ao verificar e-mail:', error)
    return { success: false, message: 'Erro ao verificar e-mail' }
  }
}

// Reenviar e-mail de verificação
export async function resendVerificationEmail(email: string): Promise<AuthResponse> {
  try {
    console.log(`[AUTH] 🔄 Reenviando e-mail de verificação para: ${email}`)

    const user = getUserByEmail(email.toLowerCase().trim())
    
    if (!user) {
      console.log('[AUTH] ❌ Usuário não encontrado')
      return { success: false, message: 'Usuário não encontrado' }
    }

    if (user.isVerified) {
      console.log('[AUTH] ⚠️ Conta já verificada')
      return { success: false, message: 'Esta conta já está verificada' }
    }

    // Gerar novo token
    const newToken = generateVerificationToken()
    
    // Atualizar token no banco
    updateUser(user.id, { verificationToken: newToken })

    console.log('[AUTH] 📧 Tentando reenviar e-mail...')

    // Reenviar e-mail
    const emailSent = await sendVerificationEmail(user.email, user.name, newToken)

    if (!emailSent) {
      console.error('[AUTH] ❌ Falha ao reenviar e-mail')
      return { success: false, message: 'Erro ao enviar e-mail. Tente novamente mais tarde.' }
    }

    console.log('[AUTH] ✅ E-mail reenviado com sucesso')

    return {
      success: true,
      message: 'E-mail de verificação reenviado! Confira sua caixa de entrada.'
    }
  } catch (error) {
    console.error('[AUTH] ❌ Erro ao reenviar e-mail:', error)
    return { success: false, message: 'Erro ao reenviar e-mail' }
  }
}

// Verificar token JWT (VALIDAÇÃO REAL)
export function verifyToken(token: string): { userId: string; email: string; plan: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; plan: string }
    return decoded
  } catch (error) {
    console.error('[AUTH] ❌ Token inválido:', error)
    return null
  }
}

// Middleware para verificar autenticação (PROTEÇÃO DE ROTAS)
export function requireAuth(token: string | undefined): { userId: string; email: string } | null {
  if (!token) {
    console.log('[AUTH] ❌ Acesso negado: token ausente')
    return null
  }
  
  const decoded = verifyToken(token)
  if (!decoded) {
    console.log('[AUTH] ❌ Acesso negado: token inválido')
    return null
  }
  
  return decoded
}
