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

export default function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [showResendButton, setShowResendButton] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setSuccess("✅ E-mail verificado com sucesso! Você já pode fazer login.")
    }

    const errorParam = searchParams.get("error")
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

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
      setError("Digite seu e-mail para reenviar a verificação")
      return
    }

    setResendingEmail(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erro ao reenviar e-mail")
        return
      }

      setSuccess("✅ E-mail reenviado com sucesso!")
      setShowResendButton(false)
      setResendCooldown(60)
    } catch {
      setError("Erro ao conectar com o servidor")
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

        if (data.error?.includes("verificado")) {
          setShowResendButton(true)
        }

        setLoading(false)
        return
      }

      router.push("/dashboard")
    } catch {
      setError("Erro ao conectar com o servidor")
    } finally {
      setLoading(false)
    }
  }

return (
  <div className="min-h-screen bg-gradient-to-br from-[#2266FF]/5 via-white to-[#4488FF]/5 flex items-center justify-center p-4">
    <div className="w-full max-w-md">

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
              <Button
                type="button"
                variant="outline"
                onClick={handleResendVerification}
                disabled={resendingEmail || resendCooldown > 0}
                className="w-full"
              >
                {resendingEmail ? "Reenviando..." : "Reenviar e-mail"}
              </Button>
            )}

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label>Senha</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Ent
