const mongoose = require('mongoose');

async function connectToDatabase() {
	const baseUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
	const dbName = process.env.MONGODB_DB_NAME || 'SimpleQuiz';
	// Allow either full URI with db embedded, or base + db name
	const connectionUri = baseUri.includes('mongodb://') || baseUri.includes('mongodb+srv://')
		? (baseUri.match(/\/(\w|%2F)+$/) ? baseUri : `${baseUri}/${dbName}`)
		: `mongodb://localhost:27017/${dbName}`;

	await mongoose.connect(connectionUri, {
		autoIndex: true,
	});

	mongoose.connection.on('connected', () => {
		// eslint-disable-next-line no-console
		console.log('MongoDB connected:', connectionUri);
	});

	mongoose.connection.on('error', (err) => {
		// eslint-disable-next-line no-console
		console.error('MongoDB connection error:', err);
	});
}

module.exports = { connectToDatabase };
