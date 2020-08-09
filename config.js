module.exports = {
  PORT: process.env.PORT || 8000,
	DB_HOST: process.env.DB_HOST,
	DB_USER: process.env.DB_USER,
	DB_PASSWORD: process.env.DB_PASSWORD,
	DB_DATABASE: process.env.DB_DATABASE,
	JWT_SECRET: process.env.JWT_SECRET,
	APP_SECRET: process.env.APP_SECRET,
	CRYPTO_SECRET: process.env.CRYPTO_SECRET
};