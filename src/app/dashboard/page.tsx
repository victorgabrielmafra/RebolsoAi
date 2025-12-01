"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Upload, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  DollarSign,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  Download,
  LogOut,
  Loader2,
  Crown
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

// Componente para formatar data de forma consistente
function FormattedDate({ date }: { date: string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <span className="text-xs text-gray-500">{date}</span>
  }

  return <span className="text-xs text-gray-500">{date.split('-').reverse().join('/')}</span>
}

export default function Dashboard() {
  const { user, loading, logout } = useAuth()
  const [selectedTab, setSelectedTab] = useState("overview")
  const [reimbursements, setReimbursements] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState("")

  // Buscar reembolsos do usuário
  useEffect(() => {
    if (user) {
      fetchReimbursements()
    }
  }, [user])

  const fetchReimbursements = async () => {
    try {
      setLoadingData(true)
      const response = await fetch('/api/reimbursements')
      
      if (response.ok) {
        const data = await response.json()
        setReimbursements(data.reimbursements || [])
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao carregar dados')
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoadingData(false)
    }
  }

  const handleGeneratePDF = async (id: string) => {
    try {
      const response = await fetch(`/api/reimbursements/${id}/pdf`)
      
      if (!response.ok) {
        const data = await response.json()
        if (data.requiresUpgrade) {
          alert(`${data.error}\n\nFaça upgrade para o plano ${data.requiredPlan === 'pro' ? 'Pro' : 'Premium'} para desbloquear esta funcionalidade.`)
        } else {
          alert(data.error || 'Erro ao gerar PDF')
        }
        return
      }

      // Download do PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reembolso-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      alert('Erro ao gerar PDF')
    }
  }

  const handleSendToOperator = async (id: string) => {
    if (!confirm('Deseja enviar este reembolso para a operadora?')) return

    try {
      const response = await fetch(`/api/reimbursements/${id}/send`, {
        method: 'POST'
      })
      
      const data = await response.json()

      if (!response.ok) {
        if (data.requiresUpgrade) {
          alert(`${data.error}\n\nFaça upgrade para o plano ${data.requiredPlan === 'pro' ? 'Pro' : 'Premium'} para desbloquear esta funcionalidade.`)
        } else {
          alert(data.error || 'Erro ao enviar')
        }
        return
      }

      alert(data.message)
      fetchReimbursements() // Atualizar lista
    } catch (err) {
      alert('Erro ao enviar para operadora')
    }
  }

  // Calcular estatísticas
  const stats = {
    totalRecuperado: reimbursements
      .filter(r => r.status === 'aprovado')
      .reduce((sum, r) => sum + r.valorReembolso, 0),
    totalPendente: reimbursements
      .filter(r => r.status === 'em_analise' || r.status === 'pendente')
      .reduce((sum, r) => sum + r.valorReembolso, 0),
    pedidosAprovados: reimbursements.filter(r => r.status === 'aprovado').length,
    pedidosEmAnalise: reimbursements.filter(r => r.status === 'em_analise').length
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "aprovado":
        return <Badge className="bg-green-500/10 text-green-700 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />Aprovado</Badge>
      case "em_analise":
        return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Em Análise</Badge>
      case "enviado":
        return <Badge className="bg-blue-500/10 text-blue-700 border-blue-200"><CheckCircle2 className="w-3 h-3 mr-1" />Enviado</Badge>
      case "recusado":
        return <Badge className="bg-red-500/10 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Recusado</Badge>
      default:
        return <Badge variant="secondary">Pendente</Badge>
    }
  }

  const getPlanBadge = (plan: string) => {
    switch(plan) {
      case 'premium':
        return <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0"><Crown className="w-3 h-3 mr-1" />Premium</Badge>
      case 'pro':
        return <Badge className="bg-[#2266FF] text-white border-0">Pro</Badge>
      default:
        return <Badge variant="outline">Gratuito</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2266FF]" />
      </div>
    )
  }

  if (!user) {
    return null // Middleware vai redirecionar
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2266FF] to-[#4488FF] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#1A1A1A]">ReembolsAí</span>
          </Link>
          <div className="flex items-center gap-4">
            {getPlanBadge(user.plan)}
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-2">
            Olá, {user.name}! 👋
          </h1>
          <p className="text-gray-600">
            Acompanhe seus reembolsos e envie novas solicitações
          </p>
        </div>

        {/* Alerta de limite do plano */}
        {user.plan === 'free' && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Plano Gratuito:</strong> Você pode criar apenas 1 reembolso por mês. 
              Você já usou {user.reimbursementsThisMonth} de 1 este mês.
              {user.reimbursementsThisMonth >= 1 && (
                <span className="block mt-1">
                  <strong>Limite atingido!</strong> Faça upgrade para continuar criando reembolsos.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>Total Recuperado</CardDescription>
              <CardTitle className="text-3xl text-green-600 flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                R$ {stats.totalRecuperado.toFixed(2)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span>{stats.pedidosAprovados} pedidos aprovados</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>Valor Pendente</CardDescription>
              <CardTitle className="text-3xl text-yellow-600 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                R$ {stats.totalPendente.toFixed(2)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span>{stats.pedidosEmAnalise} pedidos em análise</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription>Total de Pedidos</CardDescription>
              <CardTitle className="text-3xl text-[#2266FF] flex items-center gap-2">
                <FileText className="w-6 h-6" />
                {reimbursements.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span>{user.reimbursementsThisMonth} este mês</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-[#2266FF] to-[#4488FF] text-white">
            <CardHeader className="pb-3">
              <CardDescription className="text-white/80">Ação Rápida</CardDescription>
              <CardTitle className="text-2xl">Nova Solicitação</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/upload">
                <Button 
                  className="w-full bg-white text-[#2266FF] hover:bg-gray-100"
                  disabled={user.plan === 'free' && user.reimbursementsThisMonth >= 1}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {user.plan === 'free' && user.reimbursementsThisMonth >= 1 ? 'Limite Atingido' : 'Enviar Nota'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Seus Reembolsos</CardTitle>
                <CardDescription>
                  {loadingData ? 'Carregando...' : `${reimbursements.length} reembolso(s) encontrado(s)`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#2266FF]" />
              </div>
            ) : reimbursements.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">Você ainda não tem reembolsos cadastrados</p>
                <Link href="/dashboard/upload">
                  <Button className="bg-[#2266FF] hover:bg-[#1a52cc]">
                    <Upload className="w-4 h-4 mr-2" />
                    Criar Primeiro Reembolso
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {reimbursements.map((request) => (
                  <div key={request.id} className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-lg">{request.tipo}</p>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-gray-600">{request.profissional}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          <FormattedDate date={request.data} /> • {request.operadora}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Protocolo: {request.protocolo}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-[#2266FF]">R$ {request.valorReembolso.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">de R$ {request.valor.toFixed(2)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round((request.valorReembolso / request.valor) * 100)}% reembolsado
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleGeneratePDF(request.id)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Gerar PDF
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSendToOperator(request.id)}
                        disabled={request.status === 'enviado'}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        {request.status === 'enviado' ? 'Enviado' : 'Enviar'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
