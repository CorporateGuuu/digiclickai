/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://digiclickai.com',
  generateRobotsTxt: true,
  exclude: ['/test'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
}
