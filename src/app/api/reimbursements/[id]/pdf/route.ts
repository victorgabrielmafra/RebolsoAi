import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getUserById, getReimbursementById } from '@/lib/database'
import { canGeneratePDF } from '@/lib/plans'
import { generateReimbursementPDF } from '@/lib/pdf-generator'

// Forçar Node.js runtime (necessário para fs, path, process)
export const runtime = "nodejs"

export async function GET(
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
    const canGenerate = canGeneratePDF(user)
    if (!canGenerate.allowed) {
      return NextResponse.json(
        { 
          error: canGenerate.reason,
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

    // Gerar PDF
    const pdfBuffer = await generateReimbursementPDF(reimbursement, user)

    // Retornar PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reembolso-${reimbursement.protocolo}.pdf"`
      }
    })
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar PDF' },
      { status: 500 }
    )
  }
}
