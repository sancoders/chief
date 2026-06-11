"use client";

// Página de error global explícita. Además de ser buena práctica, evita un
// bug de Turbopack en dev ("Could not find the module ... global-error.js
// in the React Client Manifest") cuando intenta resolver la versión builtin.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "#faf6f0",
          color: "#292524",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          textAlign: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>
            Algo salió mal
          </h1>
          <p style={{ marginTop: "0.5rem", color: "#57534e" }}>
            Perdón, tuvimos un problema. Probá de nuevo.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: "1.5rem",
              borderRadius: "0.75rem",
              background: "#047857",
              color: "white",
              padding: "0.75rem 1.5rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
