/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Bu satırı ekle kanka, sihir burada!
  images: {
    unoptimized: true, // Statik export için bu da lazım olabilir
  },
};

export default nextConfig;