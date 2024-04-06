module.exports = {
  port: process.env['PORT'],
  mongooseURI: `mongodb+srv://koolmoh:${process.env.DB_PASSWORD}@cluster0.ecy96sv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
  jwt: {
    accessSecret: process.env['JWT_ACCESS_SECRET'],
    refreshSecret: process.env['JWT_REFRESH_SECRET'],
    accessTokenExpiry: '30m',
    refreshTokenExpiry: '7d',
  },
};
