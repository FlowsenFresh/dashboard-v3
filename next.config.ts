import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    serverActions: {
      // Fotos für die Laden-Seite. Der Browser verkleinert sie vorher auf unter 1,5 MB,
      // dazu etwas Platz für den Rest der Anfrage.
      bodySizeLimit: "2mb",
    },
  },
  images: {
    // Fotos aus unserem Bildspeicher (Vercel Blob) darf <Image> laden und verkleinern.
    // Bilder von anderen Seiten nicht.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/laeden/**" },
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
