import express, { Request, Response, NextFunction } from "express";
import { config } from "./config.js";

const app = express();
const PORT = 8080;



async function handlerReadiness(req: Request, res: Response) {
    res
    .set("Content-Type", "text/plain; charset=utf-8")
    .send("OK");
};

async function handlerMetrics(req: Request, res: Response) {
    res.send(`Hits: ${config.fileserverHits}`);
};

async function handlerReset(req: Request, res: Response) {
    config.fileserverHits = 0;
    res.sendStatus(200);
};

function middlwareLogResponses(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
        if (res.statusCode >= 400) {
            console.log(`[NON-OK] ${req.method} ${req.path} - Status: ${res.statusCode}`);
        }
    })
    next();
};

function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.fileserverHits += 1;
    next();
};

app.use("/app", middlewareMetricsInc);
app.use("/app", express.static("./src/app"));
app.use(middlwareLogResponses);

app.get("/healthz", handlerReadiness);
app.get("/metrics", handlerMetrics);
app.get("/reset", handlerReset);


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
});