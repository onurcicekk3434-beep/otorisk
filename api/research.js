export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.TAVILY_API_KEY;
  const apifyToken = process.env.APIFY_TOKEN;
  const apifyActorId = process.env.APIFY_ACTOR_ID;

  if (apifyToken && apifyActorId) {
    await runDetailedScraper({ request, response, apifyToken, apifyActorId });
    return;
  }
  if (!apiKey) {
    response.status(501).json({
      error: "Research API is not configured",
      message: "TAVILY_API_KEY ortam değişkeni yok."
    });
    return;
  }

  response.status(501).json({
    error: "Detailed scraper is not configured",
    mode: "search_snippet_disabled",
    message: "Güvenilir fiyat karşılaştırması için ilan detay sayfalarını okuyan Apify/Playwright scraper gerekir. Arama sonucu snippet fiyatları emsal kabul edilmiyor."
  });
  return;

  const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
  const brand = clean(body.brand);
  const model = clean(body.model);
  const variant = clean(body.variant);
  const year = clean(body.year);
  const km = Number(body.km || 0);
  const price = Number(body.price || 0);
  const city = clean(body.city);
  const damageAmount = Number(body.damageAmount || 0);
  const paintedPanels = Number(body.paintedPanels || 0);
  const changedPanels = Number(body.changedPanels || 0);

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

  const prices = extractPrices(results, { brand, model, variant, year, km, price, damageAmount, paintedPanels, changedPanels });
  const summary = summarizePrices(prices, { km, damageAmount, paintedPanels, changedPanels });

  response.status(200).json({
    query,
    prices,
    summary,
    comparables: prices.slice(0, 8)
  });
}

async function runDetailedScraper({ request, response, apifyToken, apifyActorId }) {
  const body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
  const target = {
    brand: clean(body.brand),
    model: clean(body.model),
    variant: clean(body.variant),
    year: clean(body.year),
    km: Number(body.km || 0),
    price: Number(body.price || 0),
    city: clean(body.city),
    damageAmount: Number(body.damageAmount || 0),
    paintedPanels: Number(body.paintedPanels || 0),
    changedPanels: Number(body.changedPanels || 0)
  };

  if (!target.brand || !target.model || !target.year) {
    response.status(400).json({ error: "brand, model and year are required" });
    return;
  }

  const query = [
    target.brand,
    target.model,
    target.variant,
    target.year,
    target.city,
    "ikinci el"
  ].filter(Boolean).join(" ");
  const searchUrl = `https://www.arabam.com/ikinci-el?searchText=${encodeURIComponent(query)}`;

  const actorUrl = `https://api.apify.com/v2/acts/${encodeURIComponent(apifyActorId)}/run-sync-get-dataset-items?token=${encodeURIComponent(apifyToken)}&timeout=120`;
  const actorResponse = await fetch(actorUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      startUrls: [searchUrl],
      maxItems: 12,
      query,
      brand: target.brand,
      model: target.model,
      variant: target.variant,
      year: target.year,
      city: target.city,
      km: target.km
    })
  });

  if (!actorResponse.ok) {
    const text = await actorResponse.text();
    response.status(actorResponse.status).json({ error: "Detailed scraper failed", detail: text });
    return;
  }

  const items = await actorResponse.json();
  const comparables = normalizeScraperItems(Array.isArray(items) ? items : [], target);
  const summary = summarizePrices(comparables, target);

  response.status(200).json({
    query,
    prices: comparables,
    comparables: comparables.slice(0, 8),
    summary
  });
}

function normalizeScraperItems(items, target) {
  return items
    .map((item) => {
      const title = clean(item.title || item.name || item.heading);
      const description = clean(item.description || item.explanation || item.details || item.fullDescription || item.text);
      const joinedText = `${title} ${description} ${JSON.stringify(item)}`;
      const price = numberFromAny(item.price || item.priceText || item.amount) || firstNumber(normalize(joinedText), /(?:tl|try)?\s*(\d{1,3}(?:[.\s]\d{3}){1,3}|\d{6,8})\s*(?:tl|try)?/);
      if (!price || !isPlausiblePrice(price, target.price)) return null;
      if (!isRelevantResult(joinedText, target)) return null;

      const details = extractListingDetails(joinedText);
      details.km = numberFromAny(item.km || item.mileage || item.kilometer || item.kilometre) || details.km;
      details.damageAmount = numberFromAny(item.damageAmount || item.tramer || item.damageRecord) || details.damageAmount;
      details.paintedPanels = numberFromAny(item.paintedPanels || item.paintCount) || details.paintedPanels;
      details.changedPanels = numberFromAny(item.changedPanels || item.changedPartsCount) || details.changedPanels;

      const comparison = compareDetails(details, target);
      return {
        price,
        title,
        km: details.km,
        damageAmount: details.damageAmount,
        paintedPanels: details.paintedPanels,
        changedPanels: details.changedPanels,
        cleanClaim: details.cleanClaim,
        categoryPage: false,
        detailScore: comparison.detailScore,
        conditionMatch: comparison.conditionMatch,
        notes: comparison.notes
      };
    })
    .filter(Boolean);
}

function numberFromAny(value) {
  if (typeof value === "number") return value;
  const match = String(value || "").match(/(\d{1,3}(?:[.\s]\d{3}){1,3}|\d{1,8})/);
  return match ? Number(match[1].replace(/[^\d]/g, "")) : 0;
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
      const afterMatch = normalize(text.slice((match.index || 0) + match[0].length, (match.index || 0) + match[0].length + 16));
      if (/^\s*(km|kilometre)\b/.test(afterMatch)) continue;

      const price = Number(String(match[1]).replace(/[^\d]/g, ""));
      if (price >= 150000 && price <= 20000000 && isPlausiblePrice(price, target.price)) {
        const details = extractListingDetails(text);
        details.categoryPage = isCategoryResult(result);
        const comparison = compareDetails(details, target);
        found.push({
          price,
          title: result.title,
          km: details.km,
          damageAmount: details.damageAmount,
          paintedPanels: details.paintedPanels,
          changedPanels: details.changedPanels,
          cleanClaim: details.cleanClaim,
          categoryPage: details.categoryPage,
          detailScore: comparison.detailScore,
          conditionMatch: comparison.conditionMatch,
          notes: comparison.notes
        });
      }
    }
  }

  return dedupePrices(found).slice(0, 16);
}

function extractListingDetails(text) {
  const normalized = normalize(text);
  const km = firstNumber(normalized, /(\d{1,3}(?:[.\s]\d{3}){1,2}|\d{4,6})\s*(?:km|kilometre)\b/);
  const damageAmount = firstNumber(normalized, /(?:tramer|hasar kaydi|hasar)\D{0,40}(\d{1,3}(?:[.\s]\d{3}){1,2}|\d{4,8})\s*(?:tl|try)?/);
  const paintedPanels = firstNumber(normalized, /(\d{1,2})\s*(?:parca|adet)?\s*(?:lokal\s*)?(?:boya|boyali)/);
  const changedPanels = firstNumber(normalized, /(\d{1,2})\s*(?:parca|adet)?\s*(?:degisen|degisik)/);
  const cleanClaim = hasAny(normalized, ["degisensiz", "boyasiz", "tramersiz", "hasar kaydi yok", "hatasiz"]);

  return {
    km,
    damageAmount,
    paintedPanels,
    changedPanels,
    cleanClaim
  };
}

function compareDetails(details, target) {
  const notes = [];
  let detailScore = 0;
  let conditionMatch = true;

  if (details.categoryPage) {
    conditionMatch = false;
    notes.push("kategori/filtre sayfasi");
  }

  if (details.km) {
    detailScore += 1;
    if (target.km && Math.abs(details.km - target.km) > Math.max(35000, target.km * 0.35)) {
      conditionMatch = false;
      notes.push("km uzak");
    }
  }

  if (details.cleanClaim || details.damageAmount || details.paintedPanels || details.changedPanels) {
    detailScore += 1;
  }

  if (target.damageAmount === 0 && details.damageAmount > 0) {
    conditionMatch = false;
    notes.push("hasar durumu farkli");
  }
  if (target.changedPanels === 0 && details.changedPanels > 0) {
    conditionMatch = false;
    notes.push("degisen farkli");
  }
  if (target.paintedPanels === 0 && details.paintedPanels > 0) {
    conditionMatch = false;
    notes.push("boya farkli");
  }

  return { detailScore, conditionMatch, notes };
}

function isPlausiblePrice(foundPrice, targetPrice) {
  if (!targetPrice) return true;
  return foundPrice >= targetPrice * 0.58 && foundPrice <= targetPrice * 1.75;
}

function isCategoryResult(result) {
  const text = normalize(`${result.title || ""} ${result.url || ""}`);
  return hasAny(text, [
    "fiyatlari ve ilanlari",
    "modelleri sahibinden",
    "ikinci el fiyatlari",
    "arazi-suv-pick-up/renault",
    "otomobil/renault",
    "vasita/"
  ]);
}

function isRelevantResult(text, target) {
  const normalized = normalize(text);
  const brand = normalize(target.brand);
  const model = normalize(target.model);
  const variantTokens = variantSearchTokens(target.variant);
  const year = String(target.year || "");

  const baseMatches = normalized.includes(brand) && normalized.includes(model) && (!year || normalized.includes(year));
  if (!baseMatches) return false;

  if (!variantTokens.length) return true;
  return variantTokens.some((token) => normalized.includes(token));
}

function variantSearchTokens(variant) {
  const normalized = normalize(variant);
  if (!normalized || normalized.includes("belirtilmedi")) return [];

  const compact = normalized.replace(/\s+/g, "");
  const tokens = new Set([normalized, compact]);

  const engineMatch = normalized.match(/\b\d(?:[.,]\d)?\b/);
  const fuelMatch = normalized.match(/\b(tce|dci|tdi|tsi|tfsi|crdi|hdi|bluehdi|multijet|mpi|gdi|tgdi|ecoboost|hybrid|elektrik|electric|benzin|dizel|lpg)\b/);
  const codeMatch = normalized.match(/\b([a-z]?\d{2,3}[a-z]?)\b/);

  if (engineMatch && fuelMatch) {
    tokens.add(`${engineMatch[0]} ${fuelMatch[0]}`);
    tokens.add(`${engineMatch[0]}${fuelMatch[0]}`);
  }

  if (codeMatch) {
    tokens.add(codeMatch[1]);
  }

  return [...tokens].filter((token) => token.length >= 3);
}

function dedupePrices(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.price}-${item.title}-${item.km || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function summarizePrices(items) {
  const detailedItems = items.filter((item) => item.detailScore >= 2 && item.conditionMatch);
  const prices = trimOutliers(detailedItems.map((item) => item.price).sort((a, b) => a - b));
  if (prices.length < 2) {
    return {
      count: prices.length,
      rawCount: items.length,
      detailedCount: detailedItems.length,
      median: 0,
      low: 0,
      high: 0,
      confidence: "insufficient",
      reason: "Ayni motor, km ve kondisyon detayina sahip yeterli emsal bulunamadi."
    };
  }

  const median = medianNumber(prices);
  return {
    count: prices.length,
    rawCount: items.length,
    detailedCount: detailedItems.length,
    median,
    low: prices[0],
    high: prices[prices.length - 1],
    confidence: prices.length >= 5 ? "medium" : "low",
    reason: "Fiyat bandi sadece km/kondisyon sinyali okunabilen emsallerden hesaplandi."
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

function firstNumber(text, pattern) {
  const match = text.match(pattern);
  if (!match) return 0;
  return Number(String(match[1]).replace(/[^\d]/g, ""));
}

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

function normalize(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}
