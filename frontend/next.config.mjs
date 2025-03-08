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
};

export default nextConfig;
