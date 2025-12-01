import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getUserById, getReimbursementById, updateReimbursement } from '@/lib/database'
import { canSendToOperator } from '@/lib/plans'

// Forçar Node.js runtime (necessário para fs, path, process)
export const runtime = "nodejs"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // VERIFICAR PERMISSÃO DO PLANO (controle técnico real)
    const canSend = canSendToOperator(user)
    if (!canSend.allowed) {
      return NextResponse.json(
        { 
          error: canSend.reason,
          requiresUpgrade: true,
          currentPlan: user.plan,
          requiredPlan: 'pro'
        },
        { status: 403 }
      )
    }

    // Buscar reembolso
    const reimbursement = getReimbursementById(params.id)
    if (!reimbursement) {
      return NextResponse.json(
        { error: 'Reembolso não encontrado' },
        { status: 404 }
      )
    }

    // VERIFICAR SE O REEMBOLSO PERTENCE AO USUÁRIO (segurança)
    if (reimbursement.userId !== user.id) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Verificar se já foi enviado
    if (reimbursement.status === 'enviado') {
      return NextResponse.json(
        { error: 'Este reembolso já foi enviado para a operadora' },
        { status: 400 }
      )
    }

    // Simular envio para operadora (em produção, aqui seria integração real)
    // Por exemplo: enviar email, fazer requisição para API da operadora, etc.
    
    // Atualizar status do reembolso
    const updatedReimbursement = updateReimbursement(params.id, {
      status: 'enviado',
      sentToOperatorAt: new Date().toISOString()
    })

    // Log da ação (em produção, salvar em tabela de logs)
    console.log(`[ENVIO] Reembolso ${reimbursement.protocolo} enviado para ${reimbursement.operadora}`)
    console.log(`[ENVIO] Usuário: ${user.name} (${user.email})`)
    console.log(`[ENVIO] Valor: R$ ${reimbursement.valorReembolso}`)

    return NextResponse.json({
      success: true,
      message: `Reembolso enviado com sucesso para ${reimbursement.operadora}`,
      reimbursement: updatedReimbursement,
      sentAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erro ao enviar para operadora:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar para operadora' },
      { status: 500 }
    )
  }
}
