"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, AlertCircle, Loader2, CheckCircle2, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  // Validações em tempo real
  const passwordValidations = {
    minLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    passwordsMatch: formData.password === formData.confirmPassword && formData.confirmPassword !== ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validar confirmação de senha
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erro ao criar conta")
        setLoading(false)
        return
      }

      // Cadastro bem-sucedido
      setSuccess("✅ Conta criada com sucesso! Verifique seu e-mail para ativar sua conta.")
      
      // Aguardar 2 segundos para usuário ler mensagem, depois redirecionar
      setTimeout(() => {
        router.push("/login?registered=true")
      }, 2000)
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
            <CardTitle className="text-2xl font-bold text-center">Criar sua conta</CardTitle>
            <CardDescription className="text-center">
              Preencha os dados abaixo para começar
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
                  <AlertDescription className="text-green-800">
                    <div className="flex items-start gap-2">
                      <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium mb-1">{success}</p>
                        <p className="text-sm">Redirecionando para o login...</p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading || !!success}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading || !!success}
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
                  disabled={loading || !!success}
                />
                
                {/* Validações visuais da senha */}
                {formData.password && (
                  <div className="space-y-1 text-xs mt-2">
                    <div className={`flex items-center gap-1 ${passwordValidations.minLength ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordValidations.minLength ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                      <span>Mínimo 8 caracteres</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidations.hasUpperCase ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordValidations.hasUpperCase ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                      <span>Uma letra maiúscula</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidations.hasLowerCase ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordValidations.hasLowerCase ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                      <span>Uma letra minúscula</span>
                    </div>
                    <div className={`flex items-center gap-1 ${passwordValidations.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordValidations.hasNumber ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-current" />}
                      <span>Um número</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  disabled={loading || !!success}
                />
                
                {/* Validação de confirmação */}
                {formData.confirmPassword && (
                  <div className={`flex items-center gap-1 text-xs mt-2 ${passwordValidations.passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordValidations.passwordsMatch ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    <span>{passwordValidations.passwordsMatch ? 'Senhas coincidem' : 'As senhas não coincidem'}</span>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#2266FF] hover:bg-[#1a52cc] text-white"
                disabled={loading || !!success}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando conta...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Conta criada!
                  </>
                ) : (
                  "Criar Conta Grátis"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Já tem uma conta? </span>
              <Link href="/login" className="text-[#2266FF] hover:underline font-medium">
                Fazer login
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          Ao criar uma conta, você concorda com nossos Termos de Uso e Política de Privacidade
        </p>
      </div>
    </div>
  )
}
