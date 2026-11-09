/** @type {import('next').NextConfig} */
const nextConfig = {
  // Helps Next detect deploy skew and force a full reload instead of
  // client-navigating into missing hashed chunks after a new deployment.
  deploymentId:
    process.env.VERCEL_DEPLOYMENT_ID ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GIT_SHA ||
    undefined,
  serverExternalPackages: ["@modelcontextprotocol/sdk"],
  experimental: {
    serverComponentsHmrCache: false, // defaults to true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io", // ✅ Allow UploadThing images
      },
    ],
  },
  async headers() {
    return [
      {
        // HTML / app routes must revalidate so clients don't keep old chunk hashes.
        source: "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
