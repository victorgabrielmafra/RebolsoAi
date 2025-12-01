import { Suspense } from "react"
import LoginClient from "./LoginClient"

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", marginTop: 80 }}>Carregando login...</div>}>
      <LoginClient />
    </Suspense>
  )
}
