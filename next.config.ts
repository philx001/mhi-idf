import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/mot-de-passe-oubli%C3%A9", destination: "/mot-de-passe-oublie", permanent: true },
      { source: "/mot-de-passe-oublié", destination: "/mot-de-passe-oublie", permanent: true },
    ];
  },
};

export default nextConfig;
