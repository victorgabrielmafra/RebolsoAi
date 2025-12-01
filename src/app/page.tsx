"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Upload, FileCheck, Sparkles, TrendingUp, Clock, CheckCircle2, Shield, Zap, Mail } from "lucide-react"
import Link from "next/link"

export default function Home() {
  const [email, setEmail] = useState("")

  const scrollToComoFunciona = () => {
    const element = document.getElementById('como-funciona')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header/Navbar */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2266FF] to-[#4488FF] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#1A1A1A]">ReembolsAí</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#como-funciona" className="text-gray-600 hover:text-[#2266FF] transition-colors">Como funciona</a>
            <a href="#planos" className="text-gray-600 hover:text-[#2266FF] transition-colors">Planos</a>
            <a href="#faq" className="text-gray-600 hover:text-[#2266FF] transition-colors">FAQ</a>
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#2266FF] hover:bg-[#1a52cc]">Criar Conta Grátis</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge className="bg-[#2266FF]/10 text-[#2266FF] border-[#2266FF]/20 hover:bg-[#2266FF]/20">
            ✨ Recupere seu dinheiro em minutos
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-[#1A1A1A] leading-tight">
            Seu dinheiro de volta
            <span className="block text-[#2266FF]">sem burocracia</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            Envie a foto da nota fiscal e nossa IA faz todo o resto. Reembolso automático, rápido e sem complicação.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-[#2266FF] hover:bg-[#1a52cc] text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                Criar Conta Grátis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl"
              onClick={scrollToComoFunciona}
            >
              Ver Como Funciona
            </Button>
          </div>

          {/* Social Proof */}
          <div className="pt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Mais de R$ 2.5M recuperados</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>15 mil usuários ativos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>98% de aprovação</span>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="bg-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
              Como funciona?
            </h2>
            <p className="text-xl text-gray-600">
              Apenas 3 passos para recuperar seu dinheiro
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 hover:border-[#2266FF] transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2266FF] to-[#4488FF] flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">1. Envie a nota</CardTitle>
                <CardDescription className="text-base">
                  Tire uma foto da nota fiscal ou recibo e faça o upload
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-[#2266FF] transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2266FF] to-[#4488FF] flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">2. IA processa</CardTitle>
                <CardDescription className="text-base">
                  Nossa inteligência artificial extrai todos os dados e calcula seu reembolso
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-[#2266FF] transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2266FF] to-[#4488FF] flex items-center justify-center mb-4">
                  <FileCheck className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">3. Receba o dinheiro</CardTitle>
                <CardDescription className="text-base">
                  PDF gerado automaticamente. Envie com 1 clique para sua operadora
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Seção de Contato */}
          <div className="mt-16 text-center">
            <Card className="max-w-md mx-auto border-2 border-[#2266FF]/20 bg-gradient-to-br from-[#2266FF]/5 to-white">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2266FF] to-[#4488FF] flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">Precisa de ajuda?</CardTitle>
                <CardDescription className="text-base">
                  Entre em contato com nosso suporte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="mailto:reembolsaisuporte@gmail.com"
                  className="inline-flex items-center gap-2 text-[#2266FF] hover:text-[#1a52cc] font-medium transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  reembolsaisuporte@gmail.com
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
              Por que usar o ReembolsAí?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Zap className="w-12 h-12 text-[#2266FF] mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Rápido</h3>
                <p className="text-gray-600">Processo completo em menos de 2 minutos</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Sparkles className="w-12 h-12 text-[#2266FF] mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Automático</h3>
                <p className="text-gray-600">IA faz todo o trabalho por você</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <TrendingUp className="w-12 h-12 text-[#2266FF] mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Mais dinheiro</h3>
                <p className="text-gray-600">Maximize seus reembolsos</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Shield className="w-12 h-12 text-[#2266FF] mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Seguro</h3>
                <p className="text-gray-600">Dados protegidos e criptografados</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
              Escolha seu plano
            </h2>
            <p className="text-xl text-gray-600">
              Comece a recuperar seu dinheiro hoje mesmo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plano Básico */}
            <Card className="border-2 hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle className="text-2xl">Básico</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[#1A1A1A]">R$ 9,90</span>
                  <span className="text-gray-600">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Até 5 pedidos por mês</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>IA de extração automática</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>PDF automático</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Histórico básico</span>
                  </li>
                </ul>
                <Link href="/register">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 mt-6">
                    Começar Agora
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Plano Pro - Destaque */}
            <Card className="border-4 border-[#2266FF] hover:shadow-2xl transition-all relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2266FF] text-white">
                Mais Popular
              </Badge>
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[#2266FF]">R$ 19,90</span>
                  <span className="text-gray-600">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#2266FF] mt-0.5 flex-shrink-0" />
                    <span className="font-medium">Pedidos ilimitados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#2266FF] mt-0.5 flex-shrink-0" />
                    <span>Chat especialista com IA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#2266FF] mt-0.5 flex-shrink-0" />
                    <span>Análise prioritária</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#2266FF] mt-0.5 flex-shrink-0" />
                    <span>Histórico completo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#2266FF] mt-0.5 flex-shrink-0" />
                    <span>Suporte prioritário</span>
                  </li>
                </ul>
                <Link href="/register">
                  <Button className="w-full bg-[#2266FF] hover:bg-[#1a52cc] mt-6">
                    Começar Agora
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Plano Anual */}
            <Card className="border-2 hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle className="text-2xl">Anual</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-[#1A1A1A]">R$ 149,90</span>
                  <span className="text-gray-600">/ano</span>
                </div>
                <Badge variant="secondary" className="w-fit mt-2">
                  Economize 37%
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">Tudo do plano Pro</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Suporte premium</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Alertas de vencimento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Relatórios avançados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Acesso antecipado</span>
                  </li>
                </ul>
                <Link href="/register">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 mt-6">
                    Começar Agora
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Como funciona o reembolso?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Você envia a foto da nota fiscal, nossa IA extrai automaticamente todas as informações necessárias, 
                  calcula o valor do reembolso baseado nas regras da sua operadora e gera um PDF completo pronto para envio.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quanto tempo demora para receber?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  O processamento pelo ReembolsAí é instantâneo. O prazo de pagamento depende da sua operadora de saúde, 
                  geralmente entre 15 a 30 dias após o envio do pedido.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>É seguro?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sim! Todos os seus dados são criptografados e protegidos conforme a LGPD. Não compartilhamos suas 
                  informações com terceiros e você tem controle total sobre seus dados.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quais operadoras são aceitas?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Trabalhamos com as principais operadoras do Brasil: Unimed, Bradesco Saúde, SulAmérica, Amil, 
                  Porto Seguro, entre outras. Nossa IA conhece as regras de cada uma.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Posso cancelar a qualquer momento?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sim! Não há fidelidade. Você pode cancelar sua assinatura a qualquer momento e continuar usando 
                  até o fim do período pago.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-[#2266FF] to-[#1a52cc]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Pronto para recuperar seu dinheiro?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de pessoas que já recuperaram mais de R$ 2.5 milhões em reembolsos
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-[#2266FF] hover:bg-gray-100 text-lg px-8 py-6 rounded-xl shadow-xl">
              Começar Agora Grátis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2266FF] to-[#4488FF] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">ReembolsAí</span>
              </div>
              <p className="text-gray-400 text-sm">
                Seu dinheiro de volta sem burocracia
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a></li>
                <li><a href="#planos" className="hover:text-white transition-colors">Planos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Operadoras</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre nós</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="mailto:reembolsaisuporte@gmail.com" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LGPD</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p className="mb-2">
              © 2025 ReembolsAí. Todos os direitos reservados.
            </p>
            <p className="text-xs mb-3">
              Não somos operadora de saúde. Facilitamos o processo de reembolso. 
              O usuário é responsável pela veracidade dos dados fornecidos.
            </p>
            <p className="flex items-center justify-center gap-2 text-sm">
              <Mail className="w-4 h-4" />
              <a href="mailto:reembolsaisuporte@gmail.com" className="hover:text-white transition-colors">
                reembolsaisuporte@gmail.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
