/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
        return [
          {
            source: '/',
            destination: '/trade/TATA_INR',
            permanent: true,
          },
        ];
      },
      output: 'standalone',
};

export default nextConfig;
