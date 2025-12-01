"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, AlertCircle, Loader2, CheckCircle2, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [showResendButton, setShowResendButton] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    // Verificar se há mensagem de verificação bem-sucedida
    if (searchParams.get('verified') === 'true') {
      setSuccess('✅ E-mail verificado com sucesso! Você já pode fazer login.')
    }
    
    // Verificar se há erro de verificação
    const errorParam = searchParams.get('error')
    if (errorParam) {
      if (errorParam === 'token_missing') {
        setError('Token de verificação ausente')
      } else if (errorParam === 'verification_failed') {
        setError('Falha ao verificar e-mail')
      } else {
        setError(decodeURIComponent(errorParam))
      }
    }
  }, [searchParams])

  // Countdown do cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleResendVerification = async () => {
    if (!formData.email) {
      setError('Digite seu e-mail para reenviar a verificação')
      return
    }

    if (resendCooldown > 0) {
      setError(`Aguarde ${resendCooldown} segundos antes de reenviar novamente`)
      return
    }

    setResendingEmail(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit atingido
          const match = data.error.match(/(\d+) segundos/)
          if (match) {
            setResendCooldown(parseInt(match[1]))
          }
        }
        setError(data.error || 'Erro ao reenviar e-mail')
        return
      }

      setSuccess('✅ E-mail de verificação reenviado! Confira sua caixa de entrada e spam.')
      setShowResendButton(false)
      setResendCooldown(60) // 60 segundos de cooldown após sucesso
    } catch (err) {
      setError('Erro ao conectar com o servidor')
    } finally {
      setResendingEmail(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setShowResendButton(false)
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erro ao fazer login")
        
        // Se erro for de e-mail não verificado, mostrar botão de reenvio
        if (data.error && (
          data.error.includes('Verifique seu e-mail') || 
          data.error.includes('não foi verificado') ||
          data.error.includes('verificação')
        )) {
          setShowResendButton(true)
        }
        
        setLoading(false)
        return
      }

      // Login bem-sucedido, redirecionar para dashboard
      router.push("/dashboard")
    } catch (err) {
      setError("Erro ao conectar com o servidor")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2266FF]/5 via-white to-[#4488FF]/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2266FF] to-[#4488FF] flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <span className="text-3xl font-bold text-[#1A1A1A]">ReembolsAí</span>
        </Link>

        <Card className="border-2 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Entrar na sua conta</CardTitle>
            <CardDescription className="text-center">
              Digite seu e-mail e senha para acessar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              {showResendButton && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <Mail className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="space-y-3">
                    <p className="text-yellow-800 font-medium">
                      Seu e-mail ainda não foi verificado.
                    </p>
                    <p className="text-yellow-700 text-sm">
                      Não recebeu o e-mail? Verifique sua caixa de spam ou clique no botão abaixo para reenviar.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendVerification}
                      disabled={resendingEmail || resendCooldown > 0}
                      className="w-full border-yellow-300 hover:bg-yellow-100"
                    >
                      {resendingEmail ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Reenviando...
                        </>
                      ) : resendCooldown > 0 ? (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Aguarde {resendCooldown}s
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Reenviar E-mail de Verificação
                        </>
                      )}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#2266FF] hover:bg-[#1a52cc] text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Não tem uma conta? </span>
              <Link href="/register" className="text-[#2266FF] hover:underline font-medium">
                Criar conta grátis
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          Ao entrar, você concorda com nossos Termos de Uso e Política de Privacidade
        </p>
      </div>
    </div>
  )
}
