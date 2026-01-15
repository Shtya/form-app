const nextConfig = {
  // التكوينات الخاصة بـ Next.js
  env: {
    NEST_PUBLIC_BASE_URL_2: `${process.env.NEST_PUBLIC_BASE_URL_2}`,
    TOKENJWT_SECRET: `${process.env.TOKENJWT_SECRET}`,
  },
};

module.exports = nextConfig;
