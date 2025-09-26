import Fastify from "fastify";
import { z } from "zod";
import { getSymptomVocab, prettySymptom } from "./ml";
import { triage, getSymptomChips } from "./engine";

const app = Fastify({ logger: true });

// CORS (allow mobile direct calls in dev)
app.addHook("onRequest", async (req, reply) => {
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return reply.send();
});

const Schema = z.object({
    context: z.object({
        age: z.number().int().min(0).max(120),
        sex: z.enum(["male", "female", "unknown"])
    }),
    symptoms: z.array(z.object({
        id: z.string(),
        label: z.string(),
        durationDays: z.number().int().min(0).optional(),
        severity: z.enum(["mild", "moderate", "severe"]).optional(),
        onset: z.enum(["sudden", "gradual", "unknown"]).optional()
    })).min(1)
});

app.post("/triage/recommendations", async (req, reply) => {
    const parsed = Schema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    return reply.send(triage(parsed.data));
});

app.get("/healthz", async () => ({ ok: true }));

const PORT = Number(process.env.PORT || 4015);
app.listen({ port: PORT, host: "0.0.0.0" });

// app.get("/triage/vocab", async () => {
//     const vocab = getSymptomVocab();
//     return vocab.map(id => ({ id, label: prettySymptom(id) }));
// });

app.get("/triage/vocab", async () => getSymptomChips());