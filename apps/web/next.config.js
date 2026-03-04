/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@geokit/db"],
  experimental: {
    serverComponentsExternalPackages: ["bcryptjs", "geoip-lite", "@geokit/geoip"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("geoip-lite");
    }
    return config;
  },
};

module.exports = nextConfig;
