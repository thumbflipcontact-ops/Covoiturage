/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔹 Required for Capacitor / mobile builds
  output: "export",

  // 🔹 Required when using static export + Next Image
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
