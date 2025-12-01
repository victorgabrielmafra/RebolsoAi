import { NextRequest, NextResponse } from 'next/server'
import { resendVerificationEmail } from '@/lib/auth'

export const runtime = "nodejs"

// Rate limiting simples (em memória)
const rateLimitMap = new Map<string, number>()
const RATE_LIMIT_WINDOW = 60000 // 60 segundos

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'E-mail é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar rate limiting
    const now = Date.now()
    const lastRequest = rateLimitMap.get(email)
    
    if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW) {
      const remainingTime = Math.ceil((RATE_LIMIT_WINDOW - (now - lastRequest)) / 1000)
      return NextResponse.json(
        { error: `Aguarde ${remainingTime} segundos antes de reenviar novamente` },
        { status: 429 }
      )
    }

    // Atualizar rate limit
    rateLimitMap.set(email, now)

    // Limpar entradas antigas do rate limit (cleanup)
    for (const [key, value] of rateLimitMap.entries()) {
      if (now - value > RATE_LIMIT_WINDOW) {
        rateLimitMap.delete(key)
      }
    }

    // Reenviar e-mail
    const result = await resendVerificationEmail(email)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message
    })
  } catch (error) {
    console.error('Erro na rota de reenvio:', error)
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    )
  }
}
