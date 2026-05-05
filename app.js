const currentYear = new Date().getFullYear();

const form = document.querySelector("#riskForm");
const sampleButton = document.querySelector("#sampleButton");
const resetButton = document.querySelector("#resetButton");
const copyReportButton = document.querySelector("#copyReportButton");
const resultPanel = document.querySelector(".result-panel");

const fields = {
  listingText: document.querySelector("#listingText"),
  brand: document.querySelector("#brand"),
  model: document.querySelector("#model"),
  variant: document.querySelector("#variant"),
  year: document.querySelector("#year"),
  km: document.querySelector("#km"),
  price: document.querySelector("#price"),
  city: document.querySelector("#city"),
  sellerType: document.querySelector("#sellerType"),
  damageAmount: document.querySelector("#damageAmount"),
  paintedPanels: document.querySelector("#paintedPanels"),
  changedPanels: document.querySelector("#changedPanels"),
  comparablePrices: document.querySelector("#comparablePrices")
};

const output = {
  reportTitle: document.querySelector("#reportTitle"),
  riskScore: document.querySelector("#riskScore"),
  riskNeedle: document.querySelector("#riskNeedle"),
  riskLabel: document.querySelector("#riskLabel"),
  riskSummary: document.querySelector("#riskSummary"),
  priceVerdict: document.querySelector("#priceVerdict"),
  kmVerdict: document.querySelector("#kmVerdict"),
  textVerdict: document.querySelector("#textVerdict"),
  contradictionVerdict: document.querySelector("#contradictionVerdict"),
  riskList: document.querySelector("#riskList"),
  negotiationList: document.querySelector("#negotiationList"),
  questionList: document.querySelector("#questionList"),
  decisionText: document.querySelector("#decisionText"),
  sourceText: document.querySelector("#sourceText"),
  sourceList: document.querySelector("#sourceList")
};

const vehicleCatalog = {
  Abarth: ["500", "595", "695"],
  "Alfa Romeo": ["Giulietta", "Giulia", "Stelvio", "Tonale"],
  Audi: ["A1", "A3", "A4", "A5", "A6", "A7", "Q2", "Q3", "Q5", "Q7"],
  BMW: ["1 Serisi", "2 Serisi", "3 Serisi", "4 Serisi", "5 Serisi", "7 Serisi", "X1", "X2", "X3", "X4", "X5", "X6"],
  Chery: ["Omoda 5", "Tiggo 7 Pro", "Tiggo 8 Pro"],
  Chevrolet: ["Aveo", "Captiva", "Cruze", "Kalos", "Spark"],
  Citroen: ["Berlingo", "C3", "C3 Aircross", "C4", "C4 X", "C5 Aircross", "C-Elysee"],
  Dacia: ["Duster", "Jogger", "Logan", "Sandero", "Spring"],
  DS: ["DS 3", "DS 4", "DS 7"],
  Fiat: ["500", "Doblo", "Egea", "Fiorino", "Linea", "Panda", "Punto"],
  Ford: ["B-Max", "Courier", "Fiesta", "Focus", "Kuga", "Mondeo", "Puma", "Ranger", "Tourneo Custom"],
  Honda: ["Accord", "City", "Civic", "CR-V", "HR-V", "Jazz"],
  Hyundai: ["Accent", "Bayon", "Elantra", "i10", "i20", "i30", "Kona", "Santa Fe", "Tucson"],
  Jeep: ["Compass", "Renegade", "Wrangler"],
  Kia: ["Ceed", "Cerato", "Picanto", "Rio", "Sorento", "Sportage", "Stonic", "XCeed"],
  "Land Rover": ["Defender", "Discovery Sport", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar"],
  Mazda: ["2", "3", "6", "CX-3", "CX-30", "CX-5"],
  "Mercedes-Benz": ["A Serisi", "B Serisi", "C Serisi", "CLA", "CLS", "E Serisi", "GLA", "GLB", "GLC", "GLE", "S Serisi", "Vito"],
  Mini: ["Cooper", "Countryman", "Clubman"],
  Mitsubishi: ["ASX", "Colt", "Eclipse Cross", "L200", "Outlander"],
  Nissan: ["Juke", "Micra", "Navara", "Qashqai", "X-Trail"],
  Opel: ["Astra", "Corsa", "Crossland", "Grandland", "Insignia", "Mokka"],
  Peugeot: ["2008", "208", "3008", "301", "308", "5008", "Partner", "Rifter"],
  Porsche: ["911", "Cayenne", "Macan", "Panamera", "Taycan"],
  Renault: ["Austral", "Captur", "Clio", "Fluence", "Kadjar", "Megane", "Symbol", "Taliant"],
  Seat: ["Arona", "Ateca", "Ibiza", "Leon", "Tarraco"],
  Skoda: ["Fabia", "Kamiq", "Karoq", "Kodiaq", "Octavia", "Scala", "Superb"],
  Subaru: ["Forester", "Impreza", "XV"],
  Suzuki: ["Jimny", "S-Cross", "Swift", "Vitara"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y"],
  Togg: ["T10X"],
  Toyota: ["Auris", "C-HR", "Corolla", "Corolla Cross", "Hilux", "Proace City", "RAV4", "Yaris"],
  Volkswagen: ["Caddy", "Golf", "Jetta", "Passat", "Polo", "T-Cross", "T-Roc", "Tiguan", "Transporter"],
  Volvo: ["S60", "S90", "V40", "XC40", "XC60", "XC90"]
};

const fallbackVariants = ["Versiyon belirtilmedi", "Benzin", "Dizel", "Hybrid", "Elektrik", "LPG"];

const variantCatalog = {
  "Audi|A3": ["1.0 TFSI", "1.4 TFSI", "1.5 TFSI", "1.6 TDI", "2.0 TDI", "S3"],
  "Audi|A4": ["1.4 TFSI", "1.8 TFSI", "2.0 TFSI", "2.0 TDI", "quattro"],
  "Audi|Q3": ["1.4 TFSI", "1.5 TFSI", "2.0 TDI", "35 TFSI", "Sportback"],
  "BMW|1 Serisi": ["116i", "118i", "118d", "120i", "120d", "M135i"],
  "BMW|2 Serisi": ["216d", "218i", "218d", "220i", "220d", "M235i"],
  "BMW|3 Serisi": ["316i", "318i", "318d", "320i", "320i ED", "320d", "330i", "330e", "M340i"],
  "BMW|4 Serisi": ["418i", "420i", "420d", "430i", "430d", "M440i"],
  "BMW|5 Serisi": ["520i", "520d", "525d", "528i", "530i", "530e", "530d", "540i"],
  "BMW|7 Serisi": ["730d", "740i", "740d", "745e", "750i"],
  "BMW|X1": ["sDrive16d", "sDrive18i", "sDrive18d", "sDrive20i", "xDrive20d"],
  "BMW|X3": ["20i", "20d", "30i", "30d", "M40i"],
  "BMW|X5": ["30d", "40i", "45e", "50e", "M50d"],
  "Citroen|C4": ["1.2 PureTech", "1.5 BlueHDi", "e-C4"],
  "Citroen|C4 X": ["1.2 PureTech", "1.5 BlueHDi", "e-C4 X"],
  "Dacia|Duster": ["1.0 Eco-G", "1.3 TCe", "1.5 dCi", "4x2", "4x4"],
  "Fiat|Egea": ["1.4 Fire", "1.3 Multijet", "1.5 T4 Hybrid", "1.6 E-Torq", "1.6 Multijet", "Cross"],
  "Fiat|Doblo": ["1.3 Multijet", "1.6 Multijet", "Combi", "Cargo"],
  "Ford|Fiesta": ["1.0 EcoBoost", "1.25", "1.4 TDCi", "1.5 TDCi", "ST-Line"],
  "Ford|Focus": ["1.0 EcoBoost", "1.5 EcoBoost", "1.5 TDCi", "1.6 TDCi", "Trend X", "Titanium"],
  "Ford|Kuga": ["1.5 EcoBoost", "1.5 TDCi", "2.0 TDCi", "PHEV"],
  "Honda|Civic": ["1.5 VTEC Turbo", "1.6 i-VTEC", "1.6 i-DTEC", "Eco", "RS"],
  "Honda|City": ["1.5 i-VTEC", "Executive", "Elegance"],
  "Hyundai|Bayon": ["1.0 T-GDI", "1.4 MPI", "Jump", "Style", "Elite"],
  "Hyundai|i20": ["1.0 T-GDI", "1.2 MPI", "1.4 MPI", "Jump", "Style", "Elite"],
  "Hyundai|Tucson": ["1.6 T-GDI", "1.6 CRDi", "Hybrid", "Prime", "Elite", "N Line"],
  "Kia|Sportage": ["1.6 T-GDI", "1.6 CRDi", "Hybrid", "Cool", "Elegance", "Prestige"],
  "Mercedes-Benz|A Serisi": ["A 180", "A 200", "A 200 d", "A 250", "AMG A 35"],
  "Mercedes-Benz|C Serisi": ["C 180", "C 200", "C 200 d", "C 220 d", "C 300", "AMG C 43"],
  "Mercedes-Benz|E Serisi": ["E 180", "E 200", "E 220 d", "E 300", "E 350 d"],
  "Mercedes-Benz|GLA": ["GLA 180", "GLA 200", "GLA 200 d", "GLA 250"],
  "Mercedes-Benz|GLC": ["GLC 180", "GLC 200", "GLC 220 d", "GLC 300", "Coupe"],
  "Nissan|Qashqai": ["1.2 DIG-T", "1.3 DIG-T", "1.5 dCi", "e-Power", "Skypack", "Tekna"],
  "Opel|Astra": ["1.2 Turbo", "1.3 CDTI", "1.4 Turbo", "1.5 Diesel", "1.6 CDTI"],
  "Opel|Corsa": ["1.2", "1.2 Turbo", "1.3 CDTI", "1.4", "Electric"],
  "Peugeot|2008": ["1.2 PureTech", "1.5 BlueHDi", "e-2008", "Active", "Allure", "GT"],
  "Peugeot|3008": ["1.2 PureTech", "1.5 BlueHDi", "1.6 THP", "Allure", "GT"],
  "Renault|Clio": ["0.9 TCe", "1.0 TCe", "1.2", "1.3 TCe", "1.5 dCi", "Joy", "Icon"],
  "Renault|Megane": ["1.3 TCe", "1.5 dCi", "1.6", "Joy", "Touch", "Icon", "RS Line"],
  "Renault|Taliant": ["1.0 Sce", "1.0 Turbo X-Tronic", "Joy", "Touch"],
  "Seat|Leon": ["1.0 TSI", "1.2 TSI", "1.4 TSI", "1.5 TSI", "1.6 TDI", "FR"],
  "Skoda|Octavia": ["1.0 TSI", "1.2 TSI", "1.4 TSI", "1.5 TSI", "1.6 TDI", "2.0 TDI"],
  "Skoda|Superb": ["1.4 TSI", "1.5 TSI", "1.6 TDI", "2.0 TDI", "Prestige"],
  "Tesla|Model 3": ["Standard Range", "Long Range", "Performance"],
  "Tesla|Model Y": ["Rear-Wheel Drive", "Long Range", "Performance"],
  "Togg|T10X": ["V1 RWD", "V2 RWD", "Uzun Menzil"],
  "Toyota|Corolla": ["1.33", "1.4 D-4D", "1.5 Vision", "1.6", "1.8 Hybrid", "Dream", "Flame"],
  "Toyota|C-HR": ["1.2 Turbo", "1.8 Hybrid", "Passion", "Diamond"],
  "Volkswagen|Golf": ["1.0 TSI", "1.2 TSI", "1.4 TSI", "1.5 TSI", "1.6 TDI", "2.0 TDI", "GTI"],
  "Volkswagen|Passat": ["1.4 TSI", "1.5 TSI", "1.6 TDI", "2.0 TDI", "Comfortline", "Highline"],
  "Volkswagen|Polo": ["1.0", "1.0 TSI", "1.2 TSI", "1.4 TDI", "1.6 TDI"],
  "Volkswagen|Tiguan": ["1.4 TSI", "1.5 TSI", "2.0 TDI", "Life", "Elegance", "R-Line"],
  "Volvo|XC40": ["T3", "T4", "T5", "B4", "Recharge"],
  "Volvo|XC60": ["D4", "D5", "B4", "B5", "T8 Recharge"]
};

const turkeyCities = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin",
  "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa",
  "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum",
  "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir",
  "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir",
  "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Şanlıurfa", "Şırnak",
  "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
].sort((a, b) => a.localeCompare(b, "tr"));

const riskySignals = [
  { words: ["kapora", "opsiyonlamak", "rezerve"], weight: 18, text: "Kapora veya opsiyon vurgusu var. Aracı görmeden para gönderme." },
  { words: ["ağır hasar", "agir hasar", "pert", "çekme belgeli"], weight: 22, text: "Ağır hasar / pert / çekme belgeli ihtimali geçiyor. Şasi ve güvenlik ekipmanları özellikle kontrol edilmeli." },
  { words: ["şasi", "sasi", "podye", "direk", "airbag", "hava yastığı"], weight: 18, text: "Şasi, podye, direk veya airbag tarafına işaret eden kelimeler var. Bu kırmızı bayrak sayılır." },
  { words: ["motor yapıldı", "motor işlemli", "sandık motor", "turbo değişti"], weight: 12, text: "Motor veya turbo müdahalesi geçiyor. Fatura ve usta raporu görülmeli." },
  { words: ["km düşür", "kilometre düş", "muayene km", "orijinal km değil"], weight: 22, text: "Kilometre tutarsızlığı ihtimali var. Muayene, servis ve ekspertiz kayıtları karşılaştırılmalı." },
  { words: ["acil", "nakit ihtiyaç", "bugünlük", "son fiyat"], weight: 6, text: "Acil satış dili var. Pazarlık baskısı gerçek olabilir ama acele karar riski yaratır." },
  { words: ["plaka yok", "plaka paylaşmıyorum", "şasi paylaşmıyorum"], weight: 14, text: "Plaka veya şasi paylaşmama sinyali var. Resmi sorgu yapmadan ilerleme." }
];

const positiveSignals = [
  { words: ["servis bakımlı", "yetkili servis", "bakım kayıtlı"], weight: -8 },
  { words: ["ekspertiz", "eksper raporu"], weight: -5 },
  { words: ["değişensiz", "degisensiz", "boyasız", "boyasiz"], weight: -5 },
  { words: ["tramer yok", "hasar kaydı yok", "hasar kaydi yok"], weight: -5 },
  { words: ["ilk sahibinden", "tek elden"], weight: -4 }
];

const contradictionRules = [
  {
    test: (text, data) =>
      hasAny(text, ["boyasız", "boyasiz", "boya yok"]) &&
      (hasAny(text, ["lokal boya", "boyalı", "boyali", "işlem", "islem", "işlemli", "islemli"]) || data.paintedPanels > 0),
    text: "İlan 'boyasız' diyor ama boya/işlem sinyali de var. Bu ifade netleştirilmeden temiz araç gibi kabul edilmemeli."
  },
  {
    test: (text, data) =>
      hasAny(text, ["değişensiz", "degisensiz"]) &&
      (hasAny(text, ["değişen var", "degisen var", "değişen mevcut", "degisen mevcut", "parça değişti", "parca degisti"]) || data.changedPanels > 0),
    text: "İlan 'değişensiz' diyor ama değişen parça sinyali de var. Hangi parça olduğu yazılı ve ekspertizle doğrulanmalı."
  },
  {
    test: (text) => hasAny(text, ["ağır hasar kayıtsız", "agir hasar kayitsiz", "ağır hasar kaydı yok", "agir hasar kaydi yok"]),
    text: "'Ağır hasar kayıtsız' gibi ifade güven vermez; genelde algı yönetimi olabilir. Plaka/şasi sorgusu şart."
  },
  {
    test: (text, data) =>
      hasAny(text, ["tramer yok", "hasar kaydı yok", "hasar kaydi yok", "kazasız", "kazasiz"]) &&
      data.damageAmount > 0,
    text: "Metin hasarsız/tramersiz izlenimi veriyor ama hasar kaydı alanına tutar girilmiş. Satıcıdan resmi hasar dökümü istenmeli."
  },
  {
    test: (text) =>
      hasAny(text, ["orijinal", "orjinal"]) &&
      hasAny(text, ["motor yapıldı", "motor yapildi", "motor işlemli", "motor islemli", "sandık motor", "sandik motor", "turbo değişti", "turbo degisti"]),
    text: "'Orijinal' iddiası motor/turbo müdahalesiyle çelişebilir. Fatura ve usta raporu olmadan değer düşümü hesaba katılmalı."
  },
  {
    test: (text, data) => hasAny(text, ["ilk sahibinden", "tek elden"]) && data.sellerType === "dealer",
    text: "'İlk sahibinden/tek elden' dili var ama satıcı galeri seçilmiş. Aracın sahiplik geçmişi ayrıca sorgulanmalı."
  }
];

const baseQuestions = [
  "Plaka ve şasi numarasıyla SBM / Sigortam360 hasar sorgusu yapabilir miyim?",
  "Güncel ve bağımsız ekspertize girmeyi kabul ediyor musunuz?",
  "Son bakım faturaları ve muayene kilometreleri görülebilir mi?",
  "Boya, değişen, airbag, şasi ve podye işlemi var mı?",
  "Araç üzerinde rehin, haciz, vergi borcu veya ceza var mı?"
];

const sampleData = {
  listingText:
    "2020 model Renault Clio 1.5 dCi. 145.000 km. Tramer 18.500 TL, değişen yok, 2 parça lokal boya. Bakımları düzenli yapılmıştır. Acil nakit ihtiyacından satılık, ciddi alıcıya pazarlık vardır.",
  brand: "Renault",
  model: "Clio",
  variant: "1.5 dCi",
  year: "2020",
  km: "145.000",
  price: "950.000",
  city: "İstanbul",
  sellerType: "owner",
  damageAmount: "18.500",
  paintedPanels: "2",
  changedPanels: "0"
};

let lastReportText = "";

function addOptions(select, options, placeholder) {
  select.innerHTML = "";
  const first = document.createElement("option");
  first.value = "";
  first.textContent = placeholder;
  select.appendChild(first);

  options.forEach((option) => {
    const element = document.createElement("option");
    element.value = option;
    element.textContent = option;
    select.appendChild(element);
  });
}

function populateModels(brand, selectedModel = "") {
  const models = vehicleCatalog[brand] || [];
  addOptions(fields.model, models, brand ? "Model seç" : "Önce marka seç");
  fields.model.disabled = !brand;

  if (selectedModel && models.includes(selectedModel)) {
    fields.model.value = selectedModel;
  }
}

function populateVariants(brand, model, selectedVariant = "") {
  const variants = brand && model ? (variantCatalog[`${brand}|${model}`] || fallbackVariants) : [];
  addOptions(fields.variant, variants, model ? "Versiyon / motor seç" : "Önce model seç");
  fields.variant.disabled = !model;

  if (selectedVariant && variants.includes(selectedVariant)) {
    fields.variant.value = selectedVariant;
  }
}

function populateStaticSelects() {
  addOptions(fields.brand, Object.keys(vehicleCatalog).sort((a, b) => a.localeCompare(b, "tr")), "Marka seç");
  addOptions(fields.city, turkeyCities, "Şehir seç");

  const years = [];
  for (let year = currentYear + 1; year >= 1990; year -= 1) {
    years.push(String(year));
  }
  addOptions(fields.year, years, "Yıl seç");
  populateModels("");
  populateVariants("", "");
}

function numberFromInput(value) {
  const clean = String(value || "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number.parseFloat(clean);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseComparables(value) {
  return String(value || "")
    .split(/[\s,;]+/)
    .map(numberFromInput)
    .filter((price) => price > 0)
    .sort((a, b) => a - b);
}

function median(values) {
  if (!values.length) return 0;
  const middle = Math.floor(values.length / 2);
  return values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
}

function formatMoney(value) {
  if (!value) return "--";
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
  }).format(value);
}

function formatPercent(value) {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 0
  }).format(value);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function includesAny(text, words) {
  return words.some((word) => text.includes(word));
}

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

function addListItems(list, items) {
  list.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}

function collectInput() {
  const vehicleName = [fields.brand.value, fields.model.value, fields.variant.value].filter(Boolean).join(" ");

  return {
    listingText: fields.listingText.value.trim(),
    brand: fields.brand.value,
    model: fields.model.value,
    variant: fields.variant.value,
    vehicleName,
    year: numberFromInput(fields.year.value),
    km: numberFromInput(fields.km.value),
    price: numberFromInput(fields.price.value),
    city: fields.city.value,
    sellerType: fields.sellerType.value,
    damageAmount: numberFromInput(fields.damageAmount.value),
    paintedPanels: numberFromInput(fields.paintedPanels.value),
    changedPanels: numberFromInput(fields.changedPanels.value),
    comparablePrices: []
  };
}

function analyze(data) {
  let risk = 8;
  const risks = [];
  const questions = [...baseQuestions];
  const normalizedText = data.listingText.toLocaleLowerCase("tr-TR");

  if (!data.listingText) {
    risk += 12;
    risks.push("İlan açıklaması boş. Satıcıdan tüm boya, değişen, hasar ve bakım bilgisini yazılı iste.");
  }

  const contradictions = detectContradictions(normalizedText, data);
  if (contradictions.length) {
    risk += Math.min(contradictions.length * 12, 30);
    risks.push(...contradictions.slice(0, 3));
    questions.push("İlandaki çelişkili ifadeleri tek tek yazılı açıklar mısınız?");
  }

  riskySignals.forEach((signal) => {
    if (includesAny(normalizedText, signal.words)) {
      risk += signal.weight;
      risks.push(signal.text);
    }
  });

  positiveSignals.forEach((signal) => {
    if (includesAny(normalizedText, signal.words)) {
      risk += signal.weight;
    }
  });

  const age = data.year ? Math.max(currentYear - data.year, 0) : 0;
  let kmPerYear = 0;
  let kmVerdict = "Bilgi eksik";
  if (data.km && data.year) {
    kmPerYear = data.km / Math.max(age, 1);
    if (kmPerYear > 35000) {
      risk += 16;
      kmVerdict = "Çok yüksek";
      risks.push("Kilometre, aracın yaşına göre çok yüksek görünüyor. Mekanik yorgunluk ve bakım geçmişi kritik.");
    } else if (kmPerYear > 25000) {
      risk += 10;
      kmVerdict = "Yüksek";
      risks.push("Kilometre, yıllık ortalamanın üzerinde. Bakım kayıtları net görülmeli.");
    } else if (age >= 7 && kmPerYear < 5000) {
      risk += 8;
      kmVerdict = "Şüpheli düşük";
      risks.push("Yaşa göre kilometre çok düşük. Muayene kayıtlarıyla kilometre akışı doğrulanmalı.");
    } else {
      risk -= 4;
      kmVerdict = "Makul";
    }
  }

  if (data.damageAmount > 0) {
    const damageRatio = data.price ? data.damageAmount / data.price : 0;
    if (damageAmountIsHigh(data.damageAmount, damageRatio)) {
      risk += 14;
      risks.push("Hasar kaydı tutarı yüksek olabilir. Hangi parçaya işlem yapıldığı mutlaka sorulmalı.");
    } else {
      risk += 5;
      risks.push("Hasar kaydı var. Tutar küçük olsa bile hasarın nereden kaynaklandığı öğrenilmeli.");
    }
    questions.push("Hasar kaydının kaza tarihi, nedeni ve tutarı nedir?");
  }

  if (data.paintedPanels >= 5) {
    risk += 10;
    risks.push("Boyalı parça sayısı fazla. Tavan, direk ve şasi tarafı özellikle kontrol edilmeli.");
  } else if (data.paintedPanels > 0) {
    risk += 4;
    risks.push("Boyalı parça bilgisi var. Lokal boya mı, işlemli parça mı netleştir.");
  }

  if (data.changedPanels > 0) {
    risk += data.changedPanels >= 2 ? 16 : 9;
    risks.push("Değişen parça var. Parçanın konumu fiyat ve güvenlik için önemli.");
    questions.push("Değişen parçalar hangileri ve fotoğraflı eski ekspertiz var mı?");
  }

  if (data.sellerType === "dealer") {
    risk += 3;
    questions.push("Satış galeriden ise yetki belgesi, fatura ve cayma koşulları nedir?");
  } else if (data.sellerType === "owner") {
    risk -= 2;
  }

  const market = evaluatePrice(data.price, data.comparablePrices);
  risk += market.riskDelta;
  if (market.note) risks.push(market.note);

  if (!data.price) {
    risk += 10;
    risks.push("İlan fiyatı girilmediği için piyasa yorumu zayıf kalır.");
  }

  if (!risks.length) {
    risks.push("Açık kırmızı bayrak görünmüyor. Yine de ekspertiz ve resmi sorgu olmadan kapora gönderme.");
  }

  const boundedRisk = Math.round(clamp(risk, 5, 96));
  const label = riskLabel(boundedRisk);
  const textVerdict = textSignalLabel(normalizedText);
  const decision = decisionText(boundedRisk, market.verdict);
  const negotiation = buildNegotiationTips(data, boundedRisk, contradictions, kmVerdict, market);

  return {
    score: boundedRisk,
    label,
    market,
    kmPerYear,
    kmVerdict,
    textVerdict,
    contradictionVerdict: contradictionLabel(contradictions.length),
    contradictions,
    negotiation,
    risks: risks.slice(0, 7),
    questions: questions.slice(0, 7),
    decision
  };
}

function detectContradictions(text, data) {
  const found = contradictionRules
    .filter((rule) => rule.test(text, data))
    .map((rule) => rule.text);
  return [...new Set(found)];
}

function contradictionLabel(count) {
  if (count >= 3) return "Ciddi";
  if (count >= 1) return "Var";
  return "Yok";
}

function buildNegotiationTips(data, score, contradictions, kmVerdict, market) {
  const tips = [];

  if (contradictions.length) {
    tips.push("Pazarlığa fiyatla değil çelişkiyle gir: 'Bu ifadeler netleşmeden temiz araç fiyatı konuşamam' de.");
  }

  if (data.damageAmount > 0) {
    tips.push("Hasar kaydı için kaza tarihi, parça listesi ve fotoğraflı ekspertiz iste; belge yoksa fiyatı aşağı çekmek için güçlü gerekçe var.");
  }

  if (data.paintedPanels > 0 || data.changedPanels > 0) {
    tips.push("Boya/değişen bilgisini parça parça yazdır. Tavan, direk, podye veya airbag tarafı çıkarsa görüşmeyi kes.");
  }

  if (kmVerdict === "Yüksek" || kmVerdict === "Çok yüksek") {
    tips.push("Kilometre yüksekse ağır bakım, lastik, triger/şanzıman bakımı ve servis faturalarını pazarlık konusu yap.");
  }

  if (market.verdict.includes("pahal") || market.verdict.includes("yüksek")) {
    tips.push("Piyasa sinyali yüksekse önce emsal ilan ekran görüntüsüyle konuş; direkt düşük teklif yerine gerekçeli teklif ver.");
  }

  if (score >= 70) {
    tips.push("Bu skorda kapora yok. Satıcı ekspertize gelmiyorsa pazarlık değil, uzaklaşma hamlesi daha doğru.");
  }

  if (!tips.length) {
    tips.push("Temiz görünüyorsa bile ekspertiz sonrası küçük kusurları tek listede toplayıp son fiyatı oradan konuş.");
    if (data.price) tips.push("İlk teklif için makul bant: ilanın yaklaşık %3-6 altı. Sert düşmek yerine ekspertiz sonucunu beklet.");
  }

  return tips.slice(0, 5);
}

function damageAmountIsHigh(amount, ratio) {
  return amount >= 100000 || ratio >= 0.12;
}

function evaluatePrice(price, comparables) {
  if (!price || comparables.length === 0) {
    return {
      verdict: "Canlı araştırma bekleniyor",
      detail: "Fiyat yorumu, yayın sürümünde arama API'sinden gelen web kaynaklarıyla güncellenir.",
      riskDelta: 0,
      note: ""
    };
  }

  if (comparables.length === 1) {
    const base = comparables[0];
    const diff = (price - base) / base;
    return {
      verdict: diff > 0.12 ? "Emsale göre yüksek" : diff < -0.12 ? "Emsale göre ucuz" : "Tek emsale yakın",
      detail: `Tek emsal: ${formatMoney(base)}. Bu yorum zayıf; 2-3 fiyatla daha iyi çalışır.`,
      riskDelta: Math.abs(diff) > 0.18 ? 8 : 2,
      note: "Sadece 1 emsal fiyat var. Daha sağlıklı karar için aynı araçtan 2-3 ilan fiyatı daha ekle."
    };
  }

  const base = median(comparables);
  const diff = (price - base) / base;
  if (diff <= -0.15) {
    return {
      verdict: "Ucuz ama şüpheli",
      detail: `Benzer ortalama: ${formatMoney(base)}. İlan yaklaşık %${Math.abs(diff * 100).toFixed(0)} daha ucuz.`,
      riskDelta: 14,
      note: "Fiyat benzerlere göre belirgin ucuz. Kapora dolandırıcılığı, ağır hasar veya gizli masraf ihtimalini kontrol et."
    };
  }
  if (diff >= 0.16) {
    return {
      verdict: "Pahalı",
      detail: `Benzer ortalama: ${formatMoney(base)}. İlan yaklaşık %${(diff * 100).toFixed(0)} daha pahalı.`,
      riskDelta: 7,
      note: "Fiyat benzerlere göre yüksek. Pazarlık ve donanım farkı netleşmeden acele etme."
    };
  }
  if (Math.abs(diff) <= 0.07) {
    return {
      verdict: "Piyasaya yakın",
      detail: `Benzer ortalama: ${formatMoney(base)}. Fiyat makul bantta.`,
      riskDelta: -5,
      note: ""
    };
  }
  return {
    verdict: diff > 0 ? "Biraz yüksek" : "Biraz uygun",
    detail: `Benzer ortalama: ${formatMoney(base)}.`,
    riskDelta: diff > 0 ? 3 : 1,
    note: diff > 0
      ? "Fiyat biraz yüksek görünüyor. Donanım, bakım ve lastik durumuyla gerekçesini sor."
      : "Fiyat biraz uygun. Ucuzluğun nedeni hasar, bakım veya acil satış mı öğren."
  };
}

function riskLabel(score) {
  if (score >= 70) return "Yüksek risk";
  if (score >= 40) return "Dikkatli ilerle";
  return "Düşük risk";
}

function textSignalLabel(text) {
  const riskyHits = riskySignals.filter((signal) => includesAny(text, signal.words)).length;
  const positiveHits = positiveSignals.filter((signal) => includesAny(text, signal.words)).length;
  if (riskyHits >= 2) return "Riskli";
  if (riskyHits === 1) return "Dikkat";
  if (positiveHits >= 2) return "Olumlu";
  return "Nötr";
}

function decisionText(score, priceVerdict) {
  if (score >= 70) {
    return "Bu ilana kapora gönderme. Önce plaka/şasi sorgusu, bağımsız ekspertiz ve satıcı kimlik doğrulaması yap.";
  }
  if (score >= 40) {
    return "Görüşmeye değer olabilir ama pazarlık, ekspertiz ve resmi sorgu bitmeden karar verme.";
  }
  if (priceVerdict === "Ucuz ama şüpheli") {
    return "Fiyat iyi görünse bile ucuzluğun sebebini kanıtla. Temizse fırsat olabilir.";
  }
  return "İlk bakışta büyük kırmızı bayrak az. Yine de ekspertizsiz ve resmi sorgusuz alım yapma.";
}

function sourceText(data) {
  return "Bu sürüm önce ilan metnindeki çelişki, manipülasyon ve ekspertiz risklerini okur. Yayın sürümünde /api/research endpoint'i emsal ilan fiyatlarını arayıp kaynaklı piyasa bandı çıkarır.";
}

function renderReport(data, report) {
  const title = data.vehicleName
    ? `${data.vehicleName} için risk kontrolü`
    : "Araç ilanı risk kontrolü";

  output.reportTitle.textContent = title;
  output.riskScore.textContent = report.score;
  updateGauge(report.score);
  output.riskLabel.textContent = report.label;
  output.riskSummary.textContent = report.market.detail;
  output.priceVerdict.textContent = report.market.verdict;
  output.kmVerdict.textContent = report.kmPerYear
    ? `${report.kmVerdict} (${Math.round(report.kmPerYear).toLocaleString("tr-TR")} km/yıl)`
    : report.kmVerdict;
  output.textVerdict.textContent = report.textVerdict;
  output.contradictionVerdict.textContent = report.contradictionVerdict;
  output.decisionText.textContent = report.decision;
  output.sourceText.textContent = sourceText(data);
  addListItems(output.sourceList, ["Yayın sürümünde bulunan emsal ilan fiyatları burada listelenir."]);

  resultPanel.classList.remove("risk-low", "risk-mid", "risk-high");
  resultPanel.classList.add(report.score >= 70 ? "risk-high" : report.score >= 40 ? "risk-mid" : "risk-low");

  addListItems(output.riskList, report.risks);
  addListItems(output.negotiationList, report.negotiation);
  addListItems(output.questionList, report.questions);

  lastReportText = buildReportText(data, report);
  copyReportButton.disabled = false;
}

function buildReportText(data, report) {
  const lines = [
    "OtoRisk İlan Raporu",
    data.vehicleName ? `Araç: ${data.vehicleName}` : "",
    data.price ? `Fiyat: ${formatMoney(data.price)}` : "",
    `Risk skoru: ${report.score}/100 - ${report.label}`,
    `Piyasa sinyali: ${report.market.verdict}`,
    `KM yorumu: ${output.kmVerdict.textContent}`,
    `Çelişki: ${report.contradictionVerdict}`,
    "",
    "Riskler:",
    ...report.risks.map((item) => `- ${item}`),
    "",
    "Pazarlık hamlesi:",
    ...report.negotiation.map((item) => `- ${item}`),
    "",
    "Satıcıya sorular:",
    ...report.questions.map((item) => `- ${item}`),
    "",
    `Son karar: ${report.decision}`
  ];
  return lines.filter(Boolean).join("\n");
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = collectInput();
  const report = analyze(data);
  renderReport(data, report);
  enrichWithResearch(data, report);
});

async function enrichWithResearch(data, report) {
  if (!data.brand || !data.model || !data.year || !data.price) {
    output.sourceText.textContent = "Canlı araştırma için marka, model, yıl ve ilan fiyatı gerekir.";
    addListItems(output.sourceList, ["Eksik alanlar tamamlanınca kaynaklı fiyat araştırması denenir."]);
    return;
  }

  try {
    const response = await fetch("/api/research", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        brand: data.brand,
        model: data.model,
        variant: data.variant,
        year: data.year,
        km: data.km,
        city: data.city
      })
    });

    if (!response.ok) {
      throw new Error(`Research unavailable: ${response.status}`);
    }

    const research = await response.json();
    applyResearch(data, report, research);
  } catch (error) {
    output.sourceText.textContent = "Canlı araştırma bu ortamda bağlı değil. Site yayınlanınca Tavily/Google Search API anahtarıyla gerçek web sonuçları kullanılacak.";
    addListItems(output.sourceList, ["Şimdilik rapor yalnızca girdiğin ilan bilgileriyle kural tabanlı çalışıyor."]);
  }
}

function applyResearch(data, report, research) {
  const summary = research.summary || {};
  const medianPrice = Number(summary.median || 0);
  const lowPrice = Number(summary.low || 0);
  const highPrice = Number(summary.high || 0);
  const sourceCount = Number(summary.count || 0);

  if (!medianPrice || sourceCount < 2) {
    output.sourceText.textContent = "Emsal fiyat için yeterli ilan fiyatı bulunamadı. Bu durumda sistem fiyat uydurmaz; risk raporu ilan metni ve araç bilgileriyle sınırlı kalır.";
    const weakItems = (research.prices || []).slice(0, 4).map((item) => `${formatMoney(item.price)} - ${item.title || item.source || "Kaynak"}`);
    addListItems(output.sourceList, weakItems.length ? weakItems : (research.sources || []).slice(0, 4).map((source) => source.title || source.url || "Kaynak"));
    return;
  }

  const diff = (data.price - medianPrice) / medianPrice;
  const diffLabel = formatPercent(Math.abs(diff * 100));
  let verdict = "Piyasaya yakın";
  let adjustment = -3;
  if (diff > 0.16) {
    verdict = "Emsale göre pahalı";
    adjustment = 8;
  } else if (diff < -0.15) {
    verdict = "Emsale göre ucuz";
    adjustment = 12;
  } else if (diff > 0.07) {
    verdict = "Emsale göre biraz yüksek";
    adjustment = 4;
  } else if (diff < -0.07) {
    verdict = "Emsale göre biraz uygun";
    adjustment = 2;
  }

  const researchedScore = Math.round(clamp(report.score + adjustment, 5, 96));
  output.riskScore.textContent = researchedScore;
  updateGauge(researchedScore);
  output.riskLabel.textContent = riskLabel(researchedScore);
  output.priceVerdict.textContent = verdict;
  output.riskSummary.textContent = `Emsal fiyat bandı: ${formatMoney(lowPrice)} - ${formatMoney(highPrice)}. Medyan: ${formatMoney(medianPrice)}. Bu ilan medyana göre yaklaşık %${diffLabel} ${diff >= 0 ? "yüksek" : "düşük"}.`;
  output.sourceText.textContent = `Canlı emsal fiyat karşılaştırması kullanıldı. Bulunan fiyat sinyali: ${sourceCount}. Güven: ${summary.confidence === "medium" ? "orta" : "düşük"}. Sorgu: ${research.query}`;

  resultPanel.classList.remove("risk-low", "risk-mid", "risk-high");
  resultPanel.classList.add(researchedScore >= 70 ? "risk-high" : researchedScore >= 40 ? "risk-mid" : "risk-low");

  const sourceItems = (research.prices || [])
    .slice(0, 6)
    .map((item) => `${formatMoney(item.price)} - ${item.title || "Kaynak"} - ${item.source || ""}`);
  addListItems(output.sourceList, sourceItems.length ? sourceItems : ["Kaynak başlığı bulunamadı."]);

  const priceTip = diff > 0.07
    ? `Emsal medyan ${formatMoney(medianPrice)} görünüyor; satıcıya bu bandı gösterip fiyatı gerekçeli pazarlığa aç.`
    : diff < -0.12
      ? `Fiyat emsale göre ucuz görünüyor; ucuzluğun sebebini hasar, değişen, km ve resmi sorguyla kanıtlamadan kapora gönderme.`
      : "Fiyat emsal bandına yakın; pazarlığı daha çok ekspertiz kusurları ve bakım masrafı üzerinden kur.";
  addListItems(output.negotiationList, [priceTip, ...report.negotiation].slice(0, 5));
}

function updateGauge(score) {
  const normalized = clamp(Number(score) || 0, 0, 100);
  const degrees = -90 + (normalized * 1.8);
  output.riskNeedle.style.transform = `translateX(-50%) rotate(${degrees}deg)`;
}

sampleButton.addEventListener("click", () => {
  Object.entries(sampleData).forEach(([key, value]) => {
    if (key === "model" || key === "variant") return;
    fields[key].value = value;
  });
  populateModels(sampleData.brand, sampleData.model);
  populateVariants(sampleData.brand, sampleData.model, sampleData.variant);
});

resetButton.addEventListener("click", () => {
  form.reset();
  populateModels("");
  populateVariants("", "");
  copyReportButton.disabled = true;
  lastReportText = "";
});

fields.brand.addEventListener("change", () => {
  populateModels(fields.brand.value);
  populateVariants(fields.brand.value, "");
});

fields.model.addEventListener("change", () => {
  populateVariants(fields.brand.value, fields.model.value);
});

copyReportButton.addEventListener("click", async () => {
  if (!lastReportText) return;
  try {
    await navigator.clipboard.writeText(lastReportText);
    copyReportButton.querySelector("span:last-child").textContent = "Kopyalandı";
    setTimeout(() => {
      copyReportButton.querySelector("span:last-child").textContent = "Raporu Kopyala";
    }, 1800);
  } catch {
    window.prompt("Raporu kopyala:", lastReportText);
  }
});

populateStaticSelects();
