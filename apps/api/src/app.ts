import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { supabase } from "./supabase";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Health API
app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "polygonos360-api",
    timestamp: new Date().toISOString(),
  });
});

// Health Supabase
app.get("/health/supabase", async (_req, res) => {
  try {
    const { error } = await supabase.from("deal_stages").select("id").limit(1);

    if (error) {
      return res.status(500).json({
        ok: false,
        provider: "supabase",
        error: error.message,
      });
    }

    return res.status(200).json({
      ok: true,
      provider: "supabase",
      connected: true,
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      provider: "supabase",
      error: e?.message ?? "unknown error",
    });
  }
});

// GET /accounts -> listar empresas
app.get("/accounts", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        ok: false,
        error: error.message,
      });
    }

    return res.status(200).json({
      ok: true,
      count: data?.length ?? 0,
      data: data ?? [],
    });
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      error: e?.message ?? "unknown error",
    });
  }
});

// POST /accounts -> crear empresa
app.post("/accounts", async (req, res) => {
  try {
    const { name, industry, country, website } = req.body ?? {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        ok: false,
        error: "El campo 'name' es obligatorio",
      });
    }

    const payload = {
      name: name.trim(),
      industry: industry ?? null,
      country: country ?? null,
      website: website ?? null,
    };

    const { data, error } = await supabase
      .from("accounts")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return res.status(500).json({
        ok: false,
        error: error.message,
      });
    }

    return res.status(201).json({
      ok: true,
      data,
    });
  } catch (e: any) {
    return res.status(500).json({
      ok: false,
      error: e?.message ?? "unknown error",
    });
  }
});