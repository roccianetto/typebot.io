const { withSentryConfig } = require('@sentry/nextjs')
const path = require('path')

const landingPagePaths = [
  '/',
  '/pricing',
  '/privacy-policies',
  '/terms-of-service',
  '/about',
  '/oss-friends',
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@typebot.io/lib',
    '@typebot.io/schemas',
    '@typebot.io/emails',
  ],
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  async rewrites() {
    return {
      beforeFiles: (process.env.LANDING_PAGE_URL
        ? landingPagePaths
            .map((path) => ({
              source: '/_next/static/:static*',
              destination: `${process.env.LANDING_PAGE_URL}/_next/static/:static*`,
              has: [
                {
                  type: 'header',
                  key: 'referer',
                  value: `https://typebot.io${path}`,
                },
              ],
            }))
            .concat(
              landingPagePaths.map((path) => ({
                source: '/typebots/:typebot*',
                destination: `${process.env.LANDING_PAGE_URL}/typebots/:typebot*`,
                has: [
                  {
                    type: 'header',
                    key: 'referer',
                    value: `https://typebot.io${path}`,
                  },
                ],
              }))
            )
            .concat(
              landingPagePaths.map((path) => ({
                source: '/styles/:style*',
                destination: `${process.env.LANDING_PAGE_URL}/styles/:style*`,
                has: [
                  {
                    type: 'header',
                    key: 'referer',
                    value: `https://typebot.io${path}`,
                  },
                ],
              }))
            )
            .concat(
              landingPagePaths.map((path) => ({
                source: path,
                destination: `${process.env.LANDING_PAGE_URL}${path}`,
                has: [
                  {
                    type: 'host',
                    value: 'typebot.io',
                  },
                ],
              }))
            )
        : []
      )
        .concat([
          {
            source:
              '/api/typebots/:typebotId/blocks/:blockId/storage/upload-url',
            destination:
              '/api/v1/typebots/:typebotId/blocks/:blockId/storage/upload-url',
          },
        ])
        .concat(
          process.env.NEXTAUTH_URL
            ? [
                {
                  source:
                    '/api/typebots/:typebotId/blocks/:blockId/steps/:stepId/sampleResult',
                  destination: `${process.env.NEXTAUTH_URL}/api/v1/typebots/:typebotId/webhookBlocks/:blockId/getResultExample`,
                },
                {
                  source:
                    '/api/typebots/:typebotId/blocks/:blockId/sampleResult',
                  destination: `${process.env.NEXTAUTH_URL}/api/v1/typebots/:typebotId/webhookBlocks/:blockId/getResultExample`,
                },
                {
                  source:
                    '/api/typebots/:typebotId/blocks/:blockId/steps/:stepId/unsubscribeWebhook',
                  destination: `${process.env.NEXTAUTH_URL}/api/v1/typebots/:typebotId/webhookBlocks/:blockId/unsubscribe`,
                },
                {
                  source:
                    '/api/typebots/:typebotId/blocks/:blockId/unsubscribeWebhook',
                  destination: `${process.env.NEXTAUTH_URL}/api/v1/typebots/:typebotId/webhookBlocks/:blockId/unsubscribe`,
                },
                {
                  source:
                    '/api/typebots/:typebotId/blocks/:blockId/steps/:stepId/subscribeWebhook',
                  destination: `${process.env.NEXTAUTH_URL}/api/v1/typebots/:typebotId/webhookBlocks/:blockId/subscribe`,
                },
                {
                  source:
                    '/api/typebots/:typebotId/blocks/:blockId/subscribeWebhook',
                  destination: `${process.env.NEXTAUTH_URL}/api/v1/typebots/:typebotId/webhookBlocks/:blockId/subscribe`,
                },
              ]
            : []
        ),
    }
  },
}

const sentryWebpackPluginOptions = {
  silent: true,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA + '-viewer',
}


module.exports = {
  ...nextConfig,
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
    ];
  },
};
