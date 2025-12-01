import { NextRequest, NextResponse } from 'next/server'
import { testSMTPConnection, sendEmail } from '@/lib/email'

// Rota para testar configuração SMTP isoladamente
export async function GET(request: NextRequest) {
  try {
    console.log('========================================')
    console.log('🧪 [API TEST-EMAIL] Iniciando teste SMTP')
    console.log('========================================')
    
    // Testar conexão primeiro
    const connectionTest = await testSMTPConnection()
    
    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        message: 'Falha no teste de conexão SMTP',
        error: connectionTest.message,
        details: connectionTest.details
      }, { status: 500 })
    }
    
    // Se conexão OK, tentar enviar e-mail de teste
    const testEmail = request.nextUrl.searchParams.get('email') || process.env.SMTP_USER
    
    if (!testEmail) {
      return NextResponse.json({
        success: false,
        message: 'E-mail de destino não especificado. Use ?email=seu@email.com'
      }, { status: 400 })
    }
    
    console.log('📧 [API TEST-EMAIL] Enviando e-mail de teste para:', testEmail)
    
    const emailSent = await sendEmail({
      to: testEmail,
      subject: '🧪 Teste SMTP - ReembolsAí',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Teste SMTP</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 40px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #2266FF; margin-bottom: 20px;">✅ Teste SMTP Bem-Sucedido!</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Parabéns! Seu servidor SMTP está configurado corretamente e funcionando perfeitamente.
            </p>
            <div style="background-color: #F0F7FF; padding: 20px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #1A1A1A; font-weight: bold;">📋 Detalhes da configuração:</p>
              <ul style="color: #4A4A4A; margin: 10px 0;">
                <li><strong>Host:</strong> ${process.env.SMTP_HOST}</li>
                <li><strong>Porta:</strong> ${process.env.SMTP_PORT}</li>
                <li><strong>Usuário:</strong> ${process.env.SMTP_USER}</li>
                <li><strong>TLS/SSL:</strong> ${process.env.SMTP_PORT === '587' ? 'TLS (STARTTLS)' : process.env.SMTP_PORT === '465' ? 'SSL direto' : 'Customizado'}</li>
              </ul>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Este é um e-mail de teste automático gerado pelo sistema ReembolsAí.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #E5E5E5;">
              Data/Hora: ${new Date().toLocaleString('pt-BR')}
            </p>
          </div>
        </body>
        </html>
      `
    })
    
    if (emailSent) {
      console.log('========================================')
      console.log('✅ [API TEST-EMAIL] E-mail de teste enviado com sucesso!')
      console.log('========================================')
      
      return NextResponse.json({
        success: true,
        message: 'E-mail de teste enviado com sucesso! Verifique sua caixa de entrada (e spam).',
        details: {
          ...connectionTest.details,
          testEmailSent: testEmail,
          timestamp: new Date().toISOString()
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Conexão SMTP OK, mas falha ao enviar e-mail. Verifique os logs do servidor.',
        details: connectionTest.details
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('========================================')
    console.error('❌ [API TEST-EMAIL] Erro no teste SMTP')
    console.error('========================================')
    console.error('Erro:', error.message)
    console.error('Stack:', error.stack)
    console.error('========================================')
    
    return NextResponse.json({
      success: false,
      message: 'Erro ao testar SMTP',
      error: error.message
    }, { status: 500 })
  }
}
