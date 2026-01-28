import express, { Request, Response, NextFunction } from "express";

const app = express();
const PORT = 8080;



async function handlerReadiness(req: Request, res: Response) {
    res
    .set("Content-Type", "text/plain; charset=utf-8")
    .send("OK");
};

function middlwareLogResponses(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
        if (res.statusCode >= 400) {
            console.log(`[NON-OK] ${req.method} ${req.path} - Status: ${res.statusCode}`);
        }
    })
    next();
};

app.use("/app", express.static("./src/app"));
app.use(middlwareLogResponses);

app.get("/healthz", handlerReadiness);


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
});