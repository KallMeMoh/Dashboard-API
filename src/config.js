module.exports = {
  port: process.env["PORT"],
  mongoose: {
    URI: `mongodb+srv://koolmoh:${process.env.DB_PASSWORD}@test-cluster.wdeytlr.mongodb.net/?retryWrites=true&w=majority&appName=Test-Cluster`,
  },
  jwt: {
    accessSecret: process.env["JWT_ACCESS_SECRET"],
    refreshSecret: process.env["JWT_REFRESH_SECRET"],
    accessTokenExpiry: "30m",
    refreshTokenExpiry: "7d",
  },
};
