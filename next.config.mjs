const isExport = process.env.EXPORT_STATIC === "true";

const nextConfig = {
  reactStrictMode: true,
  ...(isExport
    ? {
        output: "export",
        basePath: "/hospital-kitchen-inventory",
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
