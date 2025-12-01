import { NextRequest, NextResponse } from 'next/server'
import { loginUser } from '@/lib/auth'

// Forçar Node.js runtime (necessário para fs, path, process)
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    const result = await loginUser(email, password)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 401 }
      )
    }

    // Criar resposta com cookie
    const response = NextResponse.json({
      success: true,
      message: result.message,
      user: result.user
    })

    // Definir cookie com token
    response.cookies.set('auth_token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 dias
    })

    return response
  } catch (error) {
    console.error('Erro na rota de login:', error)
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    )
  }
}
