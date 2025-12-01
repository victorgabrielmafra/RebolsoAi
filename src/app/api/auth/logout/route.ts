import { NextResponse } from 'next/server'

// Forçar Node.js runtime (necessário para fs, path, process)
export const runtime = "nodejs"

export async function POST() {
  try {
    // Criar resposta
    const response = NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso'
    })

    // Remover cookie de autenticação
    response.cookies.delete('auth_token')

    console.log('[AUTH] Logout realizado')

    return response
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer logout' },
      { status: 500 }
    )
  }
}
