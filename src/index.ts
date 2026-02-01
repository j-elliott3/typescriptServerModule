import express, { Request, Response, NextFunction } from "express";

import { handlerReadiness } from "./api/readiness.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import {
  middlewareLogResponse,
  middlewareMetricsInc,
  errorMiddleware,
  errorWrapper,
} from "./api/middleware.js";
import { handlerValidateChirp } from "./api/chirps.js"
import { createNewUser } from "./api/users.js";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));
app.use(middlewareLogResponse);

app.get("/api/healthz", errorWrapper(handlerReadiness));
app.get("/admin/metrics", errorWrapper(handlerMetrics));
app.post("/api/users", errorWrapper(createNewUser))
app.post("/admin/reset", errorWrapper(handlerReset));
app.post("/api/validate_chirp", errorWrapper(handlerValidateChirp));

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
});