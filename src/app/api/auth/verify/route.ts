import { NextRequest, NextResponse } from 'next/server'
import { verifyUserEmail } from '@/lib/auth'

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=token_missing', request.url))
    }

    const result = await verifyUserEmail(token)

    if (!result.success) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(result.message)}`, request.url))
    }

    // Redirecionar para login com mensagem de sucesso
    return NextResponse.redirect(new URL('/login?verified=true', request.url))
  } catch (error) {
    console.error('Erro na rota de verificação:', error)
    return NextResponse.redirect(new URL('/login?error=verification_failed', request.url))
  }
}
