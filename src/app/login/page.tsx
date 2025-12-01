"use client"

import { Suspense } from "react"
import LoginClient from "./LoginClient"

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Carregando...
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  )
}
