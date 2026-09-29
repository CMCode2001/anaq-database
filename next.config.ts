import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    // Le build ne doit pas échouer sur une règle de style.
    ignoreDuringBuilds: false,
  },
  experimental: {
    // Limite par défaut (1 Mo) trop basse pour un CV en PDF ; alignée sur
    // src/lib/storage/cv.ts (MAX_SIZE_BYTES).
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async redirects() {
    return [
      // Application interne sans vitrine publique : on tombe directement
      // sur la connexion plutôt que sur une page d'accueil.
      { source: "/", destination: "/admin/login", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
