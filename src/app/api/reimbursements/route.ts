import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getUserById, createReimbursement, getReimbursementsByUserId, updateUser } from '@/lib/database'
import { canCreateReimbursement } from '@/lib/plans'

// Forçar Node.js runtime (necessário para fs, path, process)
export const runtime = "nodejs"

// GET - Listar reembolsos do usuário autenticado
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const token = request.cookies.get('auth_token')?.value
    const auth = requireAuth(token)
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Buscar usuário
    const user = getUserById(auth.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Buscar APENAS reembolsos deste usuário (isolamento de dados)
    const reimbursements = getReimbursementsByUserId(user.id)

    return NextResponse.json({
      success: true,
      reimbursements,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        reimbursementsThisMonth: user.reimbursementsThisMonth
      }
    })
  } catch (error) {
    console.error('Erro ao buscar reembolsos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar reembolsos' },
      { status: 500 }
    )
  }
}

// POST - Criar novo reembolso
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const token = request.cookies.get('auth_token')?.value
    const auth = requireAuth(token)
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Buscar usuário
    const user = getUserById(auth.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // VERIFICAR LIMITE DO PLANO (controle técnico real)
    const canCreate = canCreateReimbursement(user)
    if (!canCreate.allowed) {
      return NextResponse.json(
        { 
          error: canCreate.reason,
          requiresUpgrade: true,
          currentPlan: user.plan
        },
        { status: 403 }
      )
    }

    // Validar dados
    const body = await request.json()
    const { tipo, profissional, valor, valorReembolso, data, operadora } = body

    if (!tipo || !profissional || !valor || !valorReembolso || !data || !operadora) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (valor <= 0 || valorReembolso <= 0) {
      return NextResponse.json(
        { error: 'Valores devem ser maiores que zero' },
        { status: 400 }
      )
    }

    if (valorReembolso > valor) {
      return NextResponse.json(
        { error: 'Valor de reembolso não pode ser maior que o valor total' },
        { status: 400 }
      )
    }

    // Criar reembolso vinculado ao usuário
    const reimbursement = createReimbursement({
      userId: user.id, // ISOLAMENTO: vincula ao usuário específico
      tipo,
      profissional,
      valor: parseFloat(valor),
      valorReembolso: parseFloat(valorReembolso),
      data,
      operadora,
      protocolo: `REIMB-${Date.now()}`
    })

    // Incrementar contador mensal do usuário
    updateUser(user.id, {
      reimbursementsThisMonth: user.reimbursementsThisMonth + 1
    })

    return NextResponse.json({
      success: true,
      message: 'Reembolso criado com sucesso',
      reimbursement
    })
  } catch (error) {
    console.error('Erro ao criar reembolso:', error)
    return NextResponse.json(
      { error: 'Erro ao criar reembolso' },
      { status: 500 }
    )
  }
}
