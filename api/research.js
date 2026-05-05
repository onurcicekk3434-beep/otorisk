export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    response.status(501).json({
      error: "Research API is not configured",
      message: "TAVILY_API_KEY ortam değişkeni yok."
    });
    return;
  }

  const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
  const brand = clean(body.brand);
  const model = clean(body.model);
  const variant = clean(body.variant);
  const year = clean(body.year);
  const km = Number(body.km || 0);
  const city = clean(body.city);

  if (!brand || !model || !year) {
    response.status(400).json({ error: "brand, model and year are required" });
    return;
  }

  const kmBand = km ? `${Math.max(0, Math.round((km - 25000) / 10000) * 10000)} ${Math.round((km + 25000) / 10000) * 10000} km` : "";
  const vehicleQuery = `${brand} ${model} ${variant} ${year}`.replace(/\s+/g, " ").trim();
  const query = [
    vehicleQuery,
    kmBand,
    city,
    "ikinci el satilik fiyat",
    "sahibinden arabam otomobil ilan",
    "Türkiye"
  ].filter(Boolean).join(" ");

  const tavilyResponse = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      query,
      search_depth: "basic",
      max_results: 12,
      include_answer: false,
      include_raw_content: false
    })
  });

  if (!tavilyResponse.ok) {
    const text = await tavilyResponse.text();
    response.status(tavilyResponse.status).json({ error: "Search failed", detail: text });
    return;
  }

  const data = await tavilyResponse.json();
  const results = (data.results || []).map((item) => ({
    title: item.title || "",
    url: item.url || "",
    content: item.content || "",
    score: item.score || 0
  }));

  const prices = extractPrices(results, { brand, model, year });
  const summary = summarizePrices(prices);

  response.status(200).json({
    query,
    prices,
    summary,
    sources: results.slice(0, 6)
  });
}

function clean(value) {
  return String(value || "").trim();
}

function extractPrices(results, target) {
  const found = [];
  const pricePattern = /(?:TL|TRY)?\s*([1-9]\d{2,3}(?:[.\s]\d{3}){1,3}|[1-9]\d{5,8})\s*(?:TL|TRY)?/gi;

  for (const result of results) {
    const text = `${result.title} ${result.content}`;
    if (!isRelevantResult(text, target)) continue;

    const matches = text.matchAll(pricePattern);
    for (const match of matches) {
      const price = Number(String(match[1]).replace(/[^\d]/g, ""));
      if (price >= 150000 && price <= 20000000) {
        found.push({
          price,
          source: result.url,
          title: result.title
        });
      }
    }
  }

  return dedupePrices(found).slice(0, 16);
}

function isRelevantResult(text, target) {
  const normalized = normalize(text);
  const brand = normalize(target.brand);
  const model = normalize(target.model);
  const year = String(target.year || "");

  return normalized.includes(brand) && normalized.includes(model) && (!year || normalized.includes(year));
}

function dedupePrices(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.price}-${item.source}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function summarizePrices(items) {
  const prices = trimOutliers(items.map((item) => item.price).sort((a, b) => a - b));
  if (prices.length < 2) {
    return {
      count: prices.length,
      median: 0,
      low: 0,
      high: 0,
      confidence: "low"
    };
  }

  const median = medianNumber(prices);
  return {
    count: prices.length,
    median,
    low: prices[0],
    high: prices[prices.length - 1],
    confidence: prices.length >= 6 ? "medium" : "low"
  };
}

function trimOutliers(prices) {
  if (prices.length < 4) return prices;
  const base = medianNumber(prices);
  return prices.filter((price) => price >= base * 0.55 && price <= base * 1.8);
}

function medianNumber(values) {
  const middle = Math.floor(values.length / 2);
  return values.length % 2 ? values[middle] : Math.round((values[middle - 1] + values[middle]) / 2);
}

function normalize(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}
