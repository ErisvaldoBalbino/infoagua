export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  openWeather: {
    apiKey: process.env.OPENWEATHER_API_KEY ?? '',
  },
  storage: {
    endpoint: process.env.STORAGE_ENDPOINT ?? '',
    publicEndpoint: process.env.STORAGE_PUBLIC_ENDPOINT ?? '',
    accessKey: process.env.STORAGE_ACCESS_KEY ?? '',
    secretKey: process.env.STORAGE_SECRET_KEY ?? '',
    bucket: process.env.STORAGE_BUCKET ?? '',
    region: process.env.STORAGE_REGION ?? 'us-east-1',
  },
});
