const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
  // Create a new MongoDB Memory Server instance
  const mongoServer = await MongoMemoryServer.create();
  
  // Get the connection string for the in-memory MongoDB server
  const uri = mongoServer.getUri();
  
  // Set connection options
  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  // Connect to the in-memory MongoDB server
  await mongoose.connect(uri, mongooseOpts);

  console.log('Connected to in-memory MongoDB server');
  
  // Return the MongoDB instance and mongoose connection
  return {
    mongoServer,
    mongoose
  };
};

/**
 * Drop database, close the connection and stop MongoDB Memory Server.
 */
module.exports.closeDatabase = async (mongoServer) => {
  if (mongoose.connection.readyState) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('In-memory MongoDB server stopped');
  }
};

/**
 * Clear all data in the database
 */
module.exports.clearDatabase = async () => {
  if (mongoose.connection.readyState) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    console.log('In-memory MongoDB data cleared');
  }
};
