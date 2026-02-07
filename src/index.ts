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
import { handlerCreateChirp, getAllChirps, getSingleChirpById } from "./api/chirps.js"
import { createNewUser } from "./api/users.js";
import { handlerLogin } from "./api/login.js";
import { handlerRefresh, handlerRevoke} from "./api/token.js";

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
app.post("/api/chirps", errorWrapper(handlerCreateChirp));
app.get("/api/chirps", errorWrapper(getAllChirps));
app.get("/api/chirps/:chirpId", errorWrapper(getSingleChirpById));
app.post("/api/login", errorWrapper(handlerLogin));
app.post("/api/refresh", errorWrapper(handlerRefresh));
app.post("/api/revoke", errorWrapper(handlerRevoke));

app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
});