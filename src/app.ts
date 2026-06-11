import cookieParser from "cookie-parser";
import express, { Application } from "express";
import globalErrorHandler from "./middleware/globalErrorHandler";
import notFound from "./middleware/notFound";

import { applySecurity } from "./middleware/security";
import router from "./router";
import { RetellWebhookRoutes } from "./webhooks/retell.router";

const app: Application = express();

app.use(express.static("public"));

app.use(express.json());
app.use(cookieParser());

applySecurity(app);

// Webhooks (external services) - no /api/v1 prefix
app.use("/webhooks/retell", RetellWebhookRoutes);

app.use("/api/v1", router);

app.get("/", (_req, res) => {
  res.send("Hey there! Welcome to our API.");
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;