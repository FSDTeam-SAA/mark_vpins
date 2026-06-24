import http from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './config';
import logger from './logger';

async function main() {
  try {
    await mongoose.connect(config.mongodbUrl as string);
    logger.info('MongoDB connected successfully');
    const httpServer = http.createServer(app);

    httpServer.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  } catch (error: any) {
    logger.error('Server failed to start:', error);
  }
}

main();
