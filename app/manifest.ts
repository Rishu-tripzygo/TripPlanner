import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wandrly",
    short_name: "Wandrly",
    description: "AI-powered travel planning, trip workspaces, and travel memories.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf9f7",
    theme_color: "#024785",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
