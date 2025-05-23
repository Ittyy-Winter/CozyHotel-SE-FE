/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "drive.google.com",
      "img5.pic.in.th",
      "img2.pic.in.th",
      "example.com",
      "drive.usercontent.google.com"
    ],
  },
  async headers() {
    return [
      {
        source: "/venue/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
