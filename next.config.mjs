import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export is for production deploys only. With `output: "export"`, Next requires every
  // visited /[locale]/.../[id] to be listed in generateStaticParams — so real UUIDs break `next dev`.
  ...(process.env.NODE_ENV === "production" ? { output: "export" } : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default withNextIntl(nextConfig)
