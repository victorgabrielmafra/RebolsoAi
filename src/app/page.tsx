import Link from "next/link"

export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "20px"
    }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>
        RebolsoAI
      </h1>

      <p>Sistema de reembolso inteligente</p>

      <Link href="/login">
        Ir para Login →
      </Link>
    </main>
  )
}
