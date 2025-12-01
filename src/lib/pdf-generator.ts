// Gerador de PDF para reembolsos
import PDFDocument from 'pdfkit'
import { Reimbursement, User } from './database'

export async function generateReimbursementPDF(
  reimbursement: Reimbursement,
  user: User
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 })
      const chunks: Buffer[] = []

      // Coletar chunks do PDF
      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Cabeçalho
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('PEDIDO DE REEMBOLSO', { align: 'center' })
        .moveDown()

      // Linha separadora
      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke()
        .moveDown()

      // Informações do protocolo
      if (reimbursement.protocolo) {
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`Protocolo: ${reimbursement.protocolo}`, { align: 'right' })
          .moveDown(0.5)
      }

      doc
        .fontSize(10)
        .text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, { align: 'right' })
        .moveDown(2)

      // Dados do Beneficiário
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('DADOS DO BENEFICIÁRIO')
        .moveDown(0.5)

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Nome: ${user.name}`)
        .text(`E-mail: ${user.email}`)
        .text(`Plano: ${user.plan.toUpperCase()}`)
        .moveDown(1.5)

      // Dados do Procedimento
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('DADOS DO PROCEDIMENTO')
        .moveDown(0.5)

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Tipo de Procedimento: ${reimbursement.tipo}`)
        .text(`Profissional/Estabelecimento: ${reimbursement.profissional}`)
        .text(`Data do Procedimento: ${new Date(reimbursement.data).toLocaleDateString('pt-BR')}`)
        .text(`Operadora: ${reimbursement.operadora}`)
        .moveDown(1.5)

      // Valores
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('VALORES')
        .moveDown(0.5)

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Valor Total Pago: R$ ${reimbursement.valor.toFixed(2)}`)
        .text(`Valor do Reembolso: R$ ${reimbursement.valorReembolso.toFixed(2)}`)
        .text(
          `Percentual de Reembolso: ${((reimbursement.valorReembolso / reimbursement.valor) * 100).toFixed(0)}%`
        )
        .moveDown(1.5)

      // Status
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('STATUS DO PEDIDO')
        .moveDown(0.5)

      const statusMap: Record<string, string> = {
        pendente: 'PENDENTE',
        em_analise: 'EM ANÁLISE',
        aprovado: 'APROVADO',
        recusado: 'RECUSADO',
        enviado: 'ENVIADO PARA OPERADORA'
      }

      doc
        .fontSize(11)
        .font('Helvetica')
        .text(`Status Atual: ${statusMap[reimbursement.status] || reimbursement.status.toUpperCase()}`)
        .moveDown(1.5)

      // Informações adicionais
      if (reimbursement.sentToOperatorAt) {
        doc
          .text(
            `Data de Envio para Operadora: ${new Date(reimbursement.sentToOperatorAt).toLocaleDateString('pt-BR')}`
          )
          .moveDown(1)
      }

      // Rodapé
      doc
        .moveDown(3)
        .fontSize(9)
        .font('Helvetica')
        .text(
          'Este documento foi gerado automaticamente pelo sistema ReembolsAí.',
          { align: 'center' }
        )
        .moveDown(0.5)
        .text(
          'Para mais informações, acesse: www.reembolsai.com.br',
          { align: 'center' }
        )

      // Finalizar PDF
      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
