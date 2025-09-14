/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
          "images.unsplash.com", 
          "i.pravatar.cc", 
          "source.unsplash.com", 
          "randomuser.me", 
          "unsplash.it",
          "picsum.photos",
          "lh3.googleusercontent.com",
          "api.goonchan.org",
          "img.youtube.com",
          "i.ytimg.com",
          "localhost",
          "proofly.siddz.com"
        ],
        remotePatterns: [
          {
            protocol: 'https',
            hostname: '*.cloudflarestream.com',
            port: '',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'imagedelivery.net',
            port: '',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: '**.cloudflare.com',
            port: '',
            pathname: '/**',
          },
        ],
        unoptimized: false,
        dangerouslyAllowSVG: true,
      },
      eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
      },
};

export default nextConfig;
