// Serviço de envio de e-mails
import nodemailer from 'nodemailer'

// Validar variáveis de ambiente obrigatórias
function validateEmailConfig() {
  const required = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    EMAIL_FROM: process.env.EMAIL_FROM
  }

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    console.error('❌ [EMAIL CONFIG] VARIÁVEIS AUSENTES:', missing.join(', '))
    return false
  }

  console.log('✅ [EMAIL CONFIG] Todas as variáveis estão configuradas')
  return true
}

// Configurar transporter do nodemailer com controle total sobre TLS
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true para porta 465, false para outras
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    // Não falhar em certificados inválidos (útil para desenvolvimento)
    rejectUnauthorized: false,
    // Forçar TLS 1.2+
    minVersion: 'TLSv1.2'
  },
  // Timeout de 10 segundos
  connectionTimeout: 10000,
  // Log de debug (descomente para ver detalhes)
  // debug: true,
  // logger: true
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
}

// Enviar e-mail genérico
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    console.log('========================================')
    console.log('🔵 [EMAIL] INICIANDO ENVIO DE E-MAIL')
    console.log('========================================')
    console.log('📧 Destinatário:', options.to)
    console.log('📝 Assunto:', options.subject)
    console.log('🔧 Configurações SMTP:')
    console.log('   - Host:', process.env.SMTP_HOST)
    console.log('   - Port:', process.env.SMTP_PORT)
    console.log('   - User:', process.env.SMTP_USER)
    console.log('   - Pass configurado:', process.env.SMTP_PASS ? '✅ SIM (***' + process.env.SMTP_PASS.slice(-4) + ')' : '❌ NÃO')
    console.log('   - From:', process.env.EMAIL_FROM)
    console.log('   - TLS ativo:', process.env.SMTP_PORT === '587' ? '✅ SIM (porta 587)' : process.env.SMTP_PORT === '465' ? '✅ SIM (porta 465 SSL)' : '⚠️ PORTA INCOMUM')
    console.log('   - Secure (SSL):', process.env.SMTP_PORT === '465' ? 'true' : 'false')
    console.log('========================================')
    
    // Verificar conexão antes de enviar
    console.log('🔍 [EMAIL] Verificando conexão SMTP...')
    await transporter.verify()
    console.log('✅ [EMAIL] Conexão SMTP verificada com sucesso!')
    console.log('========================================')
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html
    })
    
    console.log('========================================')
    console.log('✅ [EMAIL] E-MAIL ENVIADO COM SUCESSO!')
    console.log('========================================')
    console.log('📬 Message ID:', info.messageId)
    console.log('📨 Response:', info.response)
    console.log('✉️ Accepted:', info.accepted)
    console.log('🚫 Rejected:', info.rejected)
    console.log('========================================')
    
    return true
  } catch (error: any) {
    console.log('========================================')
    console.error('❌ [EMAIL] ERRO CRÍTICO AO ENVIAR E-MAIL')
    console.log('========================================')
    console.error('🔴 Tipo do erro:', error.name)
    console.error('🔴 Mensagem:', error.message)
    console.error('🔴 Código:', error.code)
    console.error('🔴 Command:', error.command)
    console.error('🔴 Response:', error.response)
    console.error('🔴 ResponseCode:', error.responseCode)
    console.log('========================================')
    console.error('🔍 DETALHES COMPLETOS DO ERRO:')
    console.error(JSON.stringify(error, null, 2))
    console.log('========================================')
    console.error('📋 Stack trace completo:')
    console.error(error.stack)
    console.log('========================================')
    
    // Diagnósticos específicos
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      console.error('⚠️ DIAGNÓSTICO: Falha de autenticação SMTP')
      console.error('   ❌ SMTP_USER ou SMTP_PASS incorretos')
      console.error('   ❌ Para Gmail: use senha de app, não senha normal')
      console.error('   ❌ Acesse: https://myaccount.google.com/apppasswords')
      console.error('   ❌ Verifique se a verificação em 2 etapas está ativa')
      console.error('   ❌ Gmail pode ter bloqueado o acesso - verifique: https://myaccount.google.com/notifications')
    } else if (error.code === 'ECONNECTION' || error.code === 'ECONNREFUSED') {
      console.error('⚠️ DIAGNÓSTICO: Falha de conexão')
      console.error('   ❌ SMTP_HOST ou SMTP_PORT incorretos')
      console.error('   ❌ Firewall bloqueando a porta', process.env.SMTP_PORT)
      console.error('   ❌ Verifique sua conexão com a internet')
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⚠️ DIAGNÓSTICO: Timeout de conexão')
      console.error('   ❌ O servidor SMTP não respondeu a tempo')
      console.error('   ❌ Porta', process.env.SMTP_PORT, 'pode estar bloqueada')
      console.error('   ❌ Tente porta 465 (SSL) em vez de 587 (TLS)')
    } else if (error.code === 'ESOCKET') {
      console.error('⚠️ DIAGNÓSTICO: Erro de socket/TLS')
      console.error('   ❌ Problema com TLS/SSL')
      console.error('   ❌ Porta 587 requer STARTTLS')
      console.error('   ❌ Porta 465 requer SSL direto')
    } else if (error.message?.includes('self signed certificate')) {
      console.error('⚠️ DIAGNÓSTICO: Certificado SSL inválido')
      console.error('   ❌ Problema com certificado do servidor SMTP')
    }
    
    console.log('========================================')
    console.error('🔧 AÇÕES RECOMENDADAS:')
    console.error('   1. Verifique se SMTP_USER e SMTP_PASS estão corretos')
    console.error('   2. Para Gmail: gere uma senha de app em https://myaccount.google.com/apppasswords')
    console.error('   3. Verifique se a porta', process.env.SMTP_PORT, 'não está bloqueada')
    console.error('   4. Teste com porta 465 (SSL) se 587 (TLS) não funcionar')
    console.error('   5. Verifique notificações de segurança do Gmail')
    console.log('========================================')
    
    return false
  }
}

// Testar configuração SMTP (função isolada para debug)
export async function testSMTPConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    console.log('========================================')
    console.log('🧪 [TESTE SMTP] INICIANDO TESTE DE CONEXÃO')
    console.log('========================================')
    
    // Validar variáveis primeiro
    if (!validateEmailConfig()) {
      return {
        success: false,
        message: 'Variáveis de ambiente SMTP não configuradas corretamente'
      }
    }
    
    console.log('🔍 [TESTE SMTP] Configurações detectadas:')
    console.log('   - SMTP_HOST:', process.env.SMTP_HOST)
    console.log('   - SMTP_PORT:', process.env.SMTP_PORT)
    console.log('   - SMTP_USER:', process.env.SMTP_USER)
    console.log('   - SMTP_PASS:', '***' + (process.env.SMTP_PASS?.slice(-4) || ''))
    console.log('   - EMAIL_FROM:', process.env.EMAIL_FROM)
    console.log('   - TLS/SSL:', process.env.SMTP_PORT === '587' ? 'TLS (STARTTLS)' : process.env.SMTP_PORT === '465' ? 'SSL direto' : 'Porta customizada')
    console.log('========================================')
    
    console.log('🔌 [TESTE SMTP] Tentando conectar ao servidor SMTP...')
    await transporter.verify()
    
    console.log('========================================')
    console.log('✅ [TESTE SMTP] CONEXÃO SMTP BEM-SUCEDIDA!')
    console.log('========================================')
    console.log('🎉 O servidor SMTP está acessível e as credenciais estão corretas!')
    console.log('🎉 TLS/SSL está funcionando corretamente!')
    console.log('🎉 Sistema pronto para enviar e-mails!')
    console.log('========================================')
    
    return {
      success: true,
      message: 'Conexão SMTP bem-sucedida! Sistema pronto para enviar e-mails.',
      details: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        tlsActive: process.env.SMTP_PORT === '587' || process.env.SMTP_PORT === '465'
      }
    }
  } catch (error: any) {
    console.log('========================================')
    console.error('❌ [TESTE SMTP] FALHA NA CONEXÃO!')
    console.log('========================================')
    console.error('🔴 Erro:', error.message)
    console.error('🔴 Código:', error.code)
    console.error('🔴 Response:', error.response)
    console.log('========================================')
    
    let diagnosis = 'Erro desconhecido ao conectar ao servidor SMTP'
    
    if (error.code === 'EAUTH' || error.responseCode === 535) {
      diagnosis = '❌ AUTENTICAÇÃO FALHOU: SMTP_USER ou SMTP_PASS incorretos. Para Gmail, use senha de app!'
    } else if (error.code === 'ECONNECTION' || error.code === 'ECONNREFUSED') {
      diagnosis = '❌ CONEXÃO RECUSADA: SMTP_HOST ou SMTP_PORT incorretos, ou firewall bloqueando'
    } else if (error.code === 'ETIMEDOUT') {
      diagnosis = '❌ TIMEOUT: Porta ' + process.env.SMTP_PORT + ' pode estar bloqueada pelo firewall'
    } else if (error.code === 'ESOCKET') {
      diagnosis = '❌ ERRO TLS/SSL: Problema com criptografia na porta ' + process.env.SMTP_PORT
    }
    
    console.error('📋 DIAGNÓSTICO:', diagnosis)
    console.log('========================================')
    
    return {
      success: false,
      message: diagnosis,
      details: {
        errorCode: error.code,
        errorMessage: error.message,
        responseCode: error.responseCode
      }
    }
  }
}

// E-mail de verificação de conta
export async function sendVerificationEmail(
  email: string, 
  name: string, 
  verificationToken: string
): Promise<boolean> {
  // Usar NEXT_PUBLIC_APP_URL ou APP_URL (fallback para localhost apenas em dev)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000'
  const verificationUrl = `${appUrl}/api/auth/verify?token=${verificationToken}`
  
  console.log('🔵 [VERIFICAÇÃO] Preparando e-mail de verificação')
  console.log('   - Email:', email)
  console.log('   - Nome:', name)
  console.log('   - Token:', verificationToken)
  console.log('   - URL:', verificationUrl)
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verifique seu e-mail - ReembolsAí</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #2266FF 0%, #4488FF 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                    ✨ ReembolsAí
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #1A1A1A; font-size: 24px; font-weight: bold;">
                    Olá, ${name}! 👋
                  </h2>
                  
                  <p style="margin: 0 0 20px 0; color: #4A4A4A; font-size: 16px; line-height: 1.6;">
                    Bem-vindo ao <strong>ReembolsAí</strong>! Estamos muito felizes em ter você conosco.
                  </p>
                  
                  <p style="margin: 0 0 30px 0; color: #4A4A4A; font-size: 16px; line-height: 1.6;">
                    Para começar a usar sua conta e aproveitar todos os benefícios, você precisa verificar seu e-mail. 
                    É rápido e fácil - basta clicar no botão abaixo:
                  </p>
                  
                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #2266FF 0%, #4488FF 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 12px rgba(34, 102, 255, 0.3);">
                          ✅ Verificar Minha Conta
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 30px 0 0 0; color: #6B6B6B; font-size: 14px; line-height: 1.6;">
                    Se o botão não funcionar, copie e cole este link no seu navegador:
                  </p>
                  <p style="margin: 10px 0 0 0; color: #2266FF; font-size: 14px; word-break: break-all;">
                    ${verificationUrl}
                  </p>
                  
                  <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #E5E5E5;">
                    <p style="margin: 0 0 10px 0; color: #6B6B6B; font-size: 14px; line-height: 1.6;">
                      <strong>Por que verificar?</strong>
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #6B6B6B; font-size: 14px; line-height: 1.8;">
                      <li>Garantir a segurança da sua conta</li>
                      <li>Receber notificações importantes</li>
                      <li>Acessar todos os recursos do ReembolsAí</li>
                    </ul>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #F9F9F9; padding: 30px; text-align: center; border-top: 1px solid #E5E5E5;">
                  <p style="margin: 0 0 10px 0; color: #6B6B6B; font-size: 14px;">
                    Este e-mail foi enviado por <strong>ReembolsAí</strong>
                  </p>
                  <p style="margin: 0 0 10px 0; color: #6B6B6B; font-size: 14px;">
                    Se você não criou uma conta, pode ignorar este e-mail.
                  </p>
                  <p style="margin: 0 0 10px 0; color: #6B6B6B; font-size: 14px;">
                    Precisa de ajuda? <a href="mailto:reembolsai.help@gmail.com" style="color: #2266FF; text-decoration: none;">reembolsai.help@gmail.com</a>
                  </p>
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    © ${new Date().getFullYear()} ReembolsAí. Todos os direitos reservados.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
  
  return sendEmail({
    to: email,
    subject: '✨ Verifique seu e-mail - ReembolsAí',
    html
  })
}

// E-mail de boas-vindas após verificação
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  console.log('🔵 [BOAS-VINDAS] Preparando e-mail de boas-vindas')
  console.log('   - Email:', email)
  console.log('   - Nome:', name)
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bem-vindo ao ReembolsAí!</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              <tr>
                <td style="background: linear-gradient(135deg, #2266FF 0%, #4488FF 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                    🎉 Conta Ativada!
                  </h1>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #1A1A1A; font-size: 24px; font-weight: bold;">
                    Parabéns, ${name}! 🎊
                  </h2>
                  
                  <p style="margin: 0 0 20px 0; color: #4A4A4A; font-size: 16px; line-height: 1.6;">
                    Sua conta foi verificada com sucesso! Agora você tem acesso completo ao <strong>ReembolsAí</strong>.
                  </p>
                  
                  <div style="background-color: #F0F7FF; border-left: 4px solid #2266FF; padding: 20px; margin: 30px 0; border-radius: 4px;">
                    <p style="margin: 0 0 15px 0; color: #1A1A1A; font-size: 16px; font-weight: bold;">
                      🚀 Próximos passos:
                    </p>
                    <ol style="margin: 0; padding-left: 20px; color: #4A4A4A; font-size: 15px; line-height: 1.8;">
                      <li>Faça login na sua conta</li>
                      <li>Explore os planos disponíveis</li>
                      <li>Comece a solicitar seus reembolsos</li>
                    </ol>
                  </div>
                  
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000'}/login" style="display: inline-block; background: linear-gradient(135deg, #2266FF 0%, #4488FF 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 12px rgba(34, 102, 255, 0.3);">
                          🔐 Fazer Login
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 30px 0 0 0; color: #6B6B6B; font-size: 14px; line-height: 1.6;">
                    Precisa de ajuda? Entre em contato conosco em <a href="mailto:reembolsai.help@gmail.com" style="color: #2266FF; text-decoration: none;">reembolsai.help@gmail.com</a>
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #F9F9F9; padding: 30px; text-align: center; border-top: 1px solid #E5E5E5;">
                  <p style="margin: 0; color: #999999; font-size: 12px;">
                    © ${new Date().getFullYear()} ReembolsAí. Todos os direitos reservados.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
  
  return sendEmail({
    to: email,
    subject: '🎉 Bem-vindo ao ReembolsAí!',
    html
  })
}
