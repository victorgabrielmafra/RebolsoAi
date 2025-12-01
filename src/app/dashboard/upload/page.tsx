"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  FileText, 
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  FileUp
} from "lucide-react"
import Link from "next/link"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [extractedData, setExtractedData] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      
      // Criar preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.type.startsWith('image/') || droppedFile.type === 'application/pdf')) {
      setFile(droppedFile)
      
      if (droppedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(droppedFile)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const processFile = async () => {
    if (!file) return

    setUploading(true)
    setProgress(0)

    // Simular upload
    const uploadInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(uploadInterval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    setTimeout(() => {
      setUploading(false)
      setProcessing(true)

      // Simular processamento da IA
      setTimeout(() => {
        setExtractedData({
          cnpj: "12.345.678/0001-90",
          valor: 250.00,
          data: "15/01/2025",
          tipo: "Consulta Médica",
          profissional: "Dr. João Silva - CRM 12345",
          operadora: "Unimed",
          valorReembolso: 187.50,
          percentualReembolso: 75,
          elegibilidade: "Aprovado",
          observacoes: "Procedimento coberto pelo plano. Reembolso de 75% do valor."
        })
        setProcessing(false)
      }, 3000)
    }, 2000)
  }

  const resetUpload = () => {
    setFile(null)
    setPreview(null)
    setExtractedData(null)
    setProgress(0)
    setUploading(false)
    setProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2266FF] to-[#4488FF] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#1A1A1A]">ReembolsAí</span>
            </div>
          </Link>
          <Badge variant="outline">Plano Pro</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-2">
            Nova Solicitação de Reembolso
          </h1>
          <p className="text-gray-600">
            Envie a foto da nota fiscal e deixe nossa IA fazer o resto
          </p>
        </div>

        {!extractedData ? (
          <>
            {/* Upload Area */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#2266FF]" />
                  Upload da Nota Fiscal
                </CardTitle>
                <CardDescription>
                  Aceita imagens (JPG, PNG) ou PDF
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!file ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#2266FF] hover:bg-[#2266FF]/5 transition-all cursor-pointer"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-[#2266FF]/10 flex items-center justify-center">
                        <FileUp className="w-8 h-8 text-[#2266FF]" />
                      </div>
                      <div>
                        <p className="text-lg font-medium mb-1">
                          Clique para selecionar ou arraste o arquivo
                        </p>
                        <p className="text-sm text-gray-500">
                          Imagens JPG, PNG ou PDF até 10MB
                        </p>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Preview */}
                    {preview && (
                      <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
                        <img 
                          src={preview} 
                          alt="Preview" 
                          className="w-full h-auto max-h-96 object-contain bg-gray-100"
                        />
                      </div>
                    )}

                    {/* File Info */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#2266FF]/10 flex items-center justify-center">
                          {file.type.startsWith('image/') ? (
                            <ImageIcon className="w-5 h-5 text-[#2266FF]" />
                          ) : (
                            <FileText className="w-5 h-5 text-[#2266FF]" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={resetUpload}>
                        Remover
                      </Button>
                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Enviando arquivo...</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    {/* Processing */}
                    {processing && (
                      <div className="flex items-center justify-center gap-3 p-6 bg-[#2266FF]/5 rounded-lg border-2 border-[#2266FF]/20">
                        <Loader2 className="w-6 h-6 text-[#2266FF] animate-spin" />
                        <div>
                          <p className="font-medium text-[#2266FF]">IA processando sua nota...</p>
                          <p className="text-sm text-gray-600">Extraindo informações e calculando reembolso</p>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    {!uploading && !processing && (
                      <Button 
                        onClick={processFile}
                        className="w-full bg-[#2266FF] hover:bg-[#1a52cc] text-lg py-6"
                        size="lg"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Processar com IA
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="text-center p-4">
                <CardContent className="pt-4">
                  <div className="w-12 h-12 rounded-full bg-[#2266FF]/10 flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-[#2266FF]" />
                  </div>
                  <h3 className="font-bold mb-1">IA Inteligente</h3>
                  <p className="text-sm text-gray-600">Extração automática de dados</p>
                </CardContent>
              </Card>

              <Card className="text-center p-4">
                <CardContent className="pt-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold mb-1">Rápido</h3>
                  <p className="text-sm text-gray-600">Resultado em segundos</p>
                </CardContent>
              </Card>

              <Card className="text-center p-4">
                <CardContent className="pt-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold mb-1">PDF Automático</h3>
                  <p className="text-sm text-gray-600">Pronto para envio</p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            {/* Extracted Data */}
            <Card className="mb-6 border-2 border-green-200 bg-green-50/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                  <CardTitle className="text-green-900">Dados Extraídos com Sucesso!</CardTitle>
                </div>
                <CardDescription>
                  Nossa IA analisou sua nota e extraiu as seguintes informações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">CNPJ do Prestador</p>
                    <p className="font-bold text-lg">{extractedData.cnpj}</p>
                  </div>

                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Valor da Nota</p>
                    <p className="font-bold text-lg text-[#2266FF]">R$ {extractedData.valor.toFixed(2)}</p>
                  </div>

                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Data do Atendimento</p>
                    <p className="font-bold text-lg">{extractedData.data}</p>
                  </div>

                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-sm text-gray-600 mb-1">Tipo de Procedimento</p>
                    <p className="font-bold text-lg">{extractedData.tipo}</p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-lg border">
                  <p className="text-sm text-gray-600 mb-1">Profissional</p>
                  <p className="font-bold text-lg">{extractedData.profissional}</p>
                </div>
              </CardContent>
            </Card>

            {/* Reimbursement Calculation */}
            <Card className="mb-6 border-2 border-[#2266FF]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-[#2266FF]" />
                  Cálculo do Reembolso
                </CardTitle>
                <CardDescription>
                  Baseado nas regras da {extractedData.operadora}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-[#2266FF] to-[#4488FF] rounded-xl text-white">
                  <p className="text-sm opacity-90 mb-2">Valor Estimado do Reembolso</p>
                  <p className="text-5xl font-bold mb-2">R$ {extractedData.valorReembolso.toFixed(2)}</p>
                  <p className="text-sm opacity-90">
                    {extractedData.percentualReembolso}% do valor total
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Valor da Consulta</span>
                    <span className="font-bold">R$ {extractedData.valor.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Percentual de Cobertura</span>
                    <span className="font-bold text-[#2266FF]">{extractedData.percentualReembolso}%</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-green-900 font-medium">Você vai receber</span>
                    <span className="font-bold text-xl text-green-600">R$ {extractedData.valorReembolso.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-1">Elegibilidade</p>
                  <p className="text-sm text-blue-700">{extractedData.observacoes}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <Button 
                size="lg" 
                className="bg-[#2266FF] hover:bg-[#1a52cc] text-lg py-6"
              >
                <FileText className="w-5 h-5 mr-2" />
                Gerar PDF Completo
              </Button>

              <Button 
                size="lg" 
                variant="outline"
                className="text-lg py-6"
              >
                <Upload className="w-5 h-5 mr-2" />
                Enviar para Operadora
              </Button>
            </div>

            <div className="flex justify-center mt-6">
              <Button variant="ghost" onClick={resetUpload}>
                Enviar Outra Nota
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
