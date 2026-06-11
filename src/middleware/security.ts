import compression from 'compression';
import cors from 'cors';
import express, { Application } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100000,
});

export const loginLimiter = rateLimit({
  windowMs: 20 * 60 * 1000,
  max: 100000,
});

// CORS options
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  credentials: true,
};
export const applySecurity = (app: Application) => {
  app.use(globalLimiter);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: true,
    }),
  );
  app.use(helmet.frameguard({ action: 'deny' }));
  app.use(helmet.noSniff());

  app.use(cors(corsOptions));

  //! When you want to allow specific query parameters to be duplicated in the query string, you can use the whitelist option.
  app.use(
    hpp({
      whitelist: [],
    }),
  );
  app.use(compression());

  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
};
