// server.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const axios = require("axios");
const https = require("https");


// -------------------------
// Express Setup
// -------------------------

const PORT = 3000
const app = express();
app.listen(PORT,()=>{
  console.log(`Listening at http://localhost:${PORT}`)
})
app.use(express.json());

// -------------------------
// WHO Certificates
// -------------------------
const caCert = fs.readFileSync(path.join(__dirname, "certs/who_chain.crt"), "utf-8");
const httpsAgent = new https.Agent({ ca: caCert });

// -------------------------
// Helpers
// -------------------------
function stripHtmlTags(s = "") {
  return s.replace(/<[^>]*>/g, "").trim();
}

function extractICD11Code(entity) {
  if (entity.theCode) return entity.theCode;  // direct code field
  return null;
}

// cache the tokens
let _cachedIcdToken = null;
let _cachedIcdTokenExpiry = 0;

async function getICD11Token() {
  // return cached token if still valid (5s leeway)
  if (_cachedIcdToken && Date.now() < _cachedIcdTokenExpiry - 5000) {
    return _cachedIcdToken;
  }

  const resp = await axios.post(
    "https://icdaccessmanagement.who.int/connect/token",
    new URLSearchParams({
      client_id: process.env.ICD11_CLIENT_ID,
      client_secret: process.env.ICD11_CLIENT_SECRET,
      scope: "icdapi_access",
      grant_type: "client_credentials",
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  if (!resp.data || !resp.data.access_token) {
    throw new Error("Invalid token response from WHO");
  }

  _cachedIcdToken = resp.data.access_token;
  const expiresIn = Number(resp.data.expires_in) || 3600;
  _cachedIcdTokenExpiry = Date.now() + expiresIn * 1000;
  return _cachedIcdToken;
}

function parseEntities(data) {
  let entities = [];
  if (Array.isArray(data)) entities = data;
  else if (Array.isArray(data.results)) entities = data.results;
  else if (Array.isArray(data.entities)) entities = data.entities;
  else if (Array.isArray(data.destinationEntities)) entities = data.destinationEntities;
  else if (Array.isArray(data.hits)) entities = data.hits;
  else {
    const arr = Object.values(data).find((v) => Array.isArray(v));
    if (arr) entities = arr;
  }
  return entities;
}

// -------------------------
// ICD-11 Search Endpoint
// -------------------------


app.get("/fhir/icd11/search", async (req, res) => {
  try {
    const q = (req.query.name || "").trim();
    if (!q) return res.status(400).json({ error: "Missing 'name' query param" });

    const token = await getICD11Token();
    console.log(`✅ [DEBUG] Got ICD-11 token, searching MMS for '${q}'`);

    // 🔹 Use MMS search instead of foundation search
    const icdResp = await axios.get(
      "https://id.who.int/icd/release/11/2024-01/mms/search",
      {
        httpsAgent,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Accept-Language": "en",
          "API-Version": "v2",
        },
        params: { q },
      }
    );

    const entities = parseEntities(icdResp.data) || [];
    console.log(`✅ [DEBUG] Got ${entities.length} MMS entities`);

    if (!entities.length) return res.json({ query: q, count: 0, results: [] });

    // unwrap title helper
    const unwrapTitle = (t) => {
      if (!t) return null;
      if (typeof t === "string") return stripHtmlTags(t);
      if (t["@value"]) return t["@value"];
      if (t.en?.["@value"]) return t.en["@value"];
      if (t.en) return t.en;
      return JSON.stringify(t);
    };

    const results = entities.slice(0, 10).map((e) => {
      return {
        id: e.id?.split("/").pop() || null,
        icd11Code: e.theCode || null,
        title: unwrapTitle(e.title),
        score: e.score ?? null,
        synonyms:
          (e.synonyms || e.matchingPVs || [])
            .slice(0, 5)
            .map((s) =>
              typeof s === "string"
                ? s
                : s.label?.["@value"] || s.label || null
            )
            .filter(Boolean) || [],
      };
    });

    res.json({ query: q, count: entities.length, results });
  } catch (err) {
    console.error(
      "❌ ICD-11 MMS Search Error:",
      err.response?.data || err.message
    );
    res
      .status(500)
      .json({ error: "ICD-11 MMS search failed", details: err.message });
  }
});



