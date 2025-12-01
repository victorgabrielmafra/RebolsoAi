"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, Crown, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

export default function PlansPage() {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const plans = [
    {
      id: "free",
      name: "Gratuito",
      price: "R$ 0",
      period: "/mês",
      description: "Perfeito para começar",
      icon: Sparkles,
      color: "from-gray-400 to-gray-600",
      features: [
        "1 reembolso por mês",
        "Análise automática de notas",
        "Cálculo de reembolso",
        "Suporte por e-mail",
        "Protocolo de solicitação"
      ],
      limitations: [
        "Limite de 1 reembolso/mês",
        "Sem envio automático",
        "Sem geração de PDF"
      ],
      cta: "Plano Atual",
      disabled: true
    },
    {
      id: "pro",
      name: "Mensal",
      price: "R$ 29,90",
      period: "/mês",
      description: "Para uso regular",
      icon: Zap,
      color: "from-[#2266FF] to-[#4488FF]",
      popular: true,
      features: [
        "5 reembolsos por mês",
        "Análise automática de notas",
        "Cálculo de reembolso",
        "Geração de PDF profissional",
        "Envio automático para operadora",
        "Suporte prioritário",
        "Histórico completo",
        "Notificações por e-mail"
      ],
      limitations: [],
      cta: "Assinar Agora",
      disabled: false
    },
    {
      id: "premium",
      name: "Premium",
      price: "R$ 79,90",
      period: "/mês",
      description: "Uso ilimitado",
      icon: Crown,
      color: "from-yellow-500 to-orange-500",
      features: [
        "Reembolsos ilimitados",
        "Análise automática de notas",
        "Cálculo de reembolso",
        "Geração de PDF profissional",
        "Envio automático para operadora",
        "Suporte VIP 24/7",
        "Histórico completo",
        "Notificações por e-mail e SMS",
        "Relatórios mensais",
        "API de integração",
        "Gerente de conta dedicado"
      ],
      limitations: [],
      cta: "Assinar Premium",
      disabled: false
    }
  ]

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
    // Aqui você implementaria a integração com gateway de pagamento
    alert(`Plano ${planId} selecionado! Em breve você será redirecionado para o pagamento.`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2266FF]/5 via-white to-[#4488FF]/5">
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
            {user && (
              <Link href="/dashboard">
                <Button variant="outline">
                  Ir para Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
            Escolha o Plano Ideal para Você
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comece gratuitamente e faça upgrade quando precisar de mais recursos
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isCurrentPlan = user?.plan === plan.id

            return (
              <Card 
                key={plan.id}
                className={`relative border-2 hover:shadow-2xl transition-all ${
                  plan.popular ? 'border-[#2266FF] shadow-xl scale-105' : ''
                } ${isCurrentPlan ? 'border-green-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#2266FF] text-white px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-green-500 text-white px-4 py-1">
                      Plano Atual
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-[#1A1A1A]">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div className="border-t pt-4 mb-6">
                      <p className="text-xs font-medium text-gray-500 mb-2">Limitações:</p>
                      <div className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-500">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  <Button
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-[#2266FF] to-[#4488FF] hover:opacity-90' 
                        : plan.id === 'premium'
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:opacity-90'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    disabled={plan.disabled || isCurrentPlan}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {isCurrentPlan ? (
                      'Plano Atual'
                    ) : (
                      <>
                        {plan.cta}
                        {!plan.disabled && <ArrowRight className="w-4 h-4 ml-2" />}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Perguntas Frequentes</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Posso cancelar a qualquer momento?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sim! Você pode cancelar sua assinatura a qualquer momento sem multas ou taxas adicionais.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Como funciona o período de teste?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  O plano gratuito não tem limite de tempo. Você pode usar para sempre com 1 reembolso por mês.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Posso fazer upgrade depois?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sim! Você pode fazer upgrade para qualquer plano a qualquer momento e pagar apenas a diferença proporcional.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
