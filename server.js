import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve static files from the root directory
app.use(express.static(__dirname));

// Live In-Memory "Database"
const db = {
  loans: [
    {
      id: "loan-1",
      farmerName: "Grace Mwale",
      village: "Chiza, Kasungu",
      amount: 150000,
      purpose: "DAP Fertilizer and Maize Seeds",
      repaymentPeriod: 6,
      status: "Approved",
      bankName: "FDH Bank",
      dateSubmitted: "2026-05-12",
      remarks: "Excellent repayment history from previous season. Application matches agricultural inputs criteria."
    },
    {
      id: "loan-2",
      farmerName: "Chipo Banda",
      village: "Mponela, Dowa",
      amount: 300000,
      purpose: "Solar Water Pump for Irrigation",
      repaymentPeriod: 12,
      status: "Pending",
      bankName: "NBS Bank",
      dateSubmitted: "2026-07-02",
      remarks: "Under review. Waiting for verified land plot map coordinates from extension officer."
    },
    {
      id: "loan-3",
      farmerName: "Falesi Tembo",
      village: "Bembeke, Dedza",
      amount: 80000,
      purpose: "Groundnut Shelling Machine",
      repaymentPeriod: 4,
      status: "Pending",
      bankName: "Opportunity Bank Malawi",
      dateSubmitted: "2026-07-10",
      remarks: "Application received. Forwarded to local credit officer."
    }
  ],
  landPlots: [
    {
      id: "plot-1",
      farmerName: "Grace Mwale",
      district: "Kasungu",
      size: 2.5,
      cropType: "Maize",
      village: "Chiza",
      status: "Verified",
      coordinates: "-13.0333, 33.4833",
      dateRegistered: "2026-04-10",
      verifiedBy: "Samuel Chimwendo"
    },
    {
      id: "plot-2",
      farmerName: "Chipo Banda",
      district: "Dowa",
      size: 4.0,
      cropType: "Soybeans",
      village: "Mponela",
      status: "Pending",
      coordinates: "-13.5333, 33.8833",
      dateRegistered: "2026-06-25",
      verifiedBy: null
    }
  ],
  marketPrices: [
    { id: "p-1", crop: "Maize", district: "Kasungu", price: 420, change: "+5%", date: "2026-07-13", source: "Ahimsa Market Feed" },
    { id: "p-2", crop: "Maize", district: "Dowa", price: 410, change: "+2%", date: "2026-07-13", source: "Ministry of Agriculture" },
    { id: "p-3", crop: "Maize", district: "Dedza", price: 430, change: "0%", date: "2026-07-13", source: "Local Market Survey" },
    { id: "p-4", crop: "Groundnuts", district: "Kasungu", price: 950, change: "-1%", date: "2026-07-13", source: "Ahimsa Market Feed" },
    { id: "p-5", crop: "Groundnuts", district: "Dowa", price: 980, change: "+4%", date: "2026-07-13", source: "Ministry of Agriculture" },
    { id: "p-6", crop: "Soybeans", district: "Kasungu", price: 750, change: "+10%", date: "2026-07-13", source: "Ahimsa Market Feed" },
    { id: "p-7", crop: "Soybeans", district: "Dowa", price: 720, change: "+8%", date: "2026-07-13", source: "Ministry of Agriculture" },
    { id: "p-8", crop: "Cassava", district: "Dedza", price: 310, change: "-2%", date: "2026-07-13", source: "Local Market Survey" }
  ],
  listings: [
    {
      id: "list-1",
      farmerName: "Grace Mwale",
      phone: "+265 888 12 34 56",
      crop: "Maize",
      quantity: 50, // bags (50kg each)
      price: 21000, // MWK per bag
      district: "Kasungu",
      village: "Chiza",
      dateListed: "2026-07-10",
      status: "Active"
    },
    {
      id: "list-2",
      farmerName: "Chipo Banda",
      phone: "+265 999 98 76 54",
      crop: "Soybeans",
      quantity: 35,
      price: 36000,
      district: "Dowa",
      village: "Mponela",
      dateListed: "2026-07-11",
      status: "Active"
    },
    {
      id: "list-3",
      farmerName: "Esme Phiri",
      phone: "+265 881 44 55 66",
      crop: "Groundnuts",
      quantity: 20,
      price: 47500,
      district: "Kasungu",
      village: "Lisasadzi",
      dateListed: "2026-07-12",
      status: "Active"
    }
  ],
  messages: [
    {
      id: "msg-1",
      fromName: "Bakhita Agro Buyers (Limbe)",
      toName: "Grace Mwale",
      toPhone: "+265 888 12 34 56",
      text: "Muli bwanji Mai Mwale, I saw your Maize listing of 50 bags. I can buy at 20,000 MWK per bag and pick it up tomorrow in Kasungu. Let me know.",
      date: "2026-07-12 14:30"
    }
  ]
};

// Lazy initialization of Gemini Client
let aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// Ensure requests to root serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- API ENDPOINTS ---

// Market Prices
app.get('/api/market-prices', (req, res) => {
  res.json(db.marketPrices);
});

app.post('/api/market-prices', (req, res) => {
  const { crop, district, price, change, source } = req.body;
  if (!crop || !district || !price) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const newPrice = {
    id: `p-${Date.now()}`,
    crop,
    district,
    price: Number(price),
    change: change || "0%",
    date: new Date().toISOString().split('T')[0],
    source: source || "Admin Entry"
  };
  db.marketPrices.push(newPrice);
  res.status(201).json(newPrice);
});

// Loans
app.get('/api/loans', (req, res) => {
  res.json(db.loans);
});

app.post('/api/loans', (req, res) => {
  const { farmerName, village, amount, purpose, repaymentPeriod, bankName } = req.body;
  if (!farmerName || !amount || !purpose || !repaymentPeriod) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const newLoan = {
    id: `loan-${Date.now()}`,
    farmerName,
    village: village || "Unknown Village",
    amount: Number(amount),
    purpose,
    repaymentPeriod: Number(repaymentPeriod),
    status: "Pending",
    bankName: bankName || "FDH Bank",
    dateSubmitted: new Date().toISOString().split('T')[0],
    remarks: "Pending credit evaluation and land registration verification."
  };
  db.loans.push(newLoan);
  res.status(201).json(newLoan);
});

app.post('/api/loans/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  const loan = db.loans.find(l => l.id === id);
  if (!loan) {
    return res.status(404).json({ error: "Loan not found" });
  }
  if (status) loan.status = status;
  if (remarks) loan.remarks = remarks;
  res.json(loan);
});

// Land Plots
app.get('/api/land-plots', (req, res) => {
  res.json(db.landPlots);
});

app.post('/api/land-plots', (req, res) => {
  const { farmerName, district, size, cropType, village, coordinates } = req.body;
  if (!farmerName || !district || !size || !cropType) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const newPlot = {
    id: `plot-${Date.now()}`,
    farmerName,
    district,
    size: Number(size),
    cropType,
    village: village || "General",
    status: "Pending",
    coordinates: coordinates || "-13.5000, 33.7000",
    dateRegistered: new Date().toISOString().split('T')[0],
    verifiedBy: null
  };
  db.landPlots.push(newPlot);
  res.status(201).json(newPlot);
});

app.post('/api/land-plots/:id/verify', (req, res) => {
  const { id } = req.params;
  const { verifiedBy, status } = req.body;
  const plot = db.landPlots.find(p => p.id === id);
  if (!plot) {
    return res.status(404).json({ error: "Land plot not found" });
  }
  plot.status = status || "Verified";
  plot.verifiedBy = verifiedBy || "System Admin";
  res.json(plot);
});

// Produce Listings
app.get('/api/listings', (req, res) => {
  res.json(db.listings);
});

app.post('/api/listings', (req, res) => {
  const { farmerName, phone, crop, quantity, price, district, village } = req.body;
  if (!farmerName || !crop || !quantity || !price || !district) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const newListing = {
    id: `list-${Date.now()}`,
    farmerName,
    phone: phone || "+265 888 12 34 56",
    crop,
    quantity: Number(quantity),
    price: Number(price),
    district,
    village: village || "Main",
    dateListed: new Date().toISOString().split('T')[0],
    status: "Active"
  };
  db.listings.push(newListing);
  res.status(201).json(newListing);
});

// Messaging
app.get('/api/messages', (req, res) => {
  res.json(db.messages);
});

app.post('/api/messages', (req, res) => {
  const { fromName, toName, toPhone, text } = req.body;
  if (!fromName || !toName || !text) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const newMsg = {
    id: `msg-${Date.now()}`,
    fromName,
    toName,
    toPhone: toPhone || "",
    text,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };
  db.messages.push(newMsg);
  res.status(201).json(newMsg);
});

// --- GEMINI SERVICE INTEGRATION ---

// 1. AI Voice Advisor / Chatbot endpoint
app.post('/api/gemini/advisor', async (req, res) => {
  const { prompt, language } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const userLang = language === 'chi' ? 'Chichewa' : 'English';
  const systemPrompt = `You are the AgriWomen voice-first virtual advisor. You assist female smallholder farmers in Malawi (Kasungu, Dowa, Dedza). 
Your task is to provide expert, practical, agricultural or financial advice.
CRITICAL constraints:
- Keep the response extremely brief, engaging, and clear (maximum of 2-3 short, simple sentences). 
- Speak directly in the requested language: ${userLang}. If Chichewa, translate advice naturally using local terminologies (e.g., madzi, manyowa, chimanga, nthaka).
- Keep it friendly, positive, and practical for rural farmers. Avoid complex scientific jargon.`;

  try {
    const client = getGeminiClient();
    if (client) {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7
        }
      });
      const text = response.text || "Sindikutha kupeza zambiri pakali pano. Mutha kuyesanso.";
      return res.json({ response: text });
    } else {
      // Graceful fallback for offline / missing API Key
      console.log("No Gemini API key found, running fallback advisor response");
      const fallbackMsg = getAdvisorFallback(prompt, language);
      return res.json({ response: fallbackMsg });
    }
  } catch (error) {
    console.error("Gemini advisor error:", error);
    const fallbackMsg = getAdvisorFallback(prompt, language);
    return res.json({ response: fallbackMsg });
  }
});

// 2. AI Credit Evaluation and risk check
app.post('/api/gemini/evaluate-loan', async (req, res) => {
  const { farmerName, amount, purpose, repaymentPeriod, farmSize, cropType, village } = req.body;

  const systemPrompt = `You are an expert AI Credit Officer for AgriWomen Platform and Malawian partner banks. 
Given details of a farmer's loan application, run a smart risk analysis.
Determine if the loan is viable, provide a realistic scoring (0-100), suggest a status (Approved, Referred, or Denied), calculate a recommended interest rate (typical MWK bank rates: 18% - 28% annual, adjust based on size/purpose), and write a customized recommendation of 2 sentences maximum.
Respond in JSON format only matching this schema:
{
  "score": number,
  "status": "Approved" | "Referred" | "Denied",
  "interestRate": string,
  "remarks": string,
  "advice": string
}`;

  const userContent = `Farmer: ${farmerName || "Applicant"}
Village: ${village || "Kasungu"}
Loan Amount: MK ${amount}
Purpose: ${purpose}
Repayment Period: ${repaymentPeriod} months
Farm Size: ${farmSize || 2} acres
Crop Type: ${cropType || "Maize"}`;

  try {
    const client = getGeminiClient();
    if (client) {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userContent,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });
      const result = JSON.parse(response.text || "{}");
      return res.json(result);
    } else {
      console.log("No Gemini API key found, running fallback loan evaluation");
      const result = getLoanFallback(amount, purpose, repaymentPeriod, farmSize, cropType);
      return res.json(result);
    }
  } catch (error) {
    console.error("Gemini loan evaluation error:", error);
    const result = getLoanFallback(amount, purpose, repaymentPeriod, farmSize, cropType);
    return res.json(result);
  }
});

// --- LOCAL FALLBACK HELPER FUNCTIONS ---

function getAdvisorFallback(prompt, language) {
  const p = prompt.toLowerCase();
  const isChichewa = language === 'chi';

  if (p.includes('fertilizer') || p.includes('manyowa') || p.includes('feteleza')) {
    return isChichewa 
      ? "Ndi bwino kuika feteleza wa kanyera kapena manyowa a ziweto mbewu zanu zikafika m'maondo. Manyowa a m'khola amathandiza kuti nthaka ikhale yachonde kwa nthawi yayitali kuposa feteleza wogula."
      : "We recommend mixing organic compost manure with your chemical fertilizers. Applying manure before planting improves soil structure and retains soil moisture much better during dry spells.";
  }
  if (p.includes('planting') || p.includes('dzala') || p.includes('kubzala')) {
    return isChichewa
      ? "Kuti mudzale chimanga chabwino, bzalani nthawi imene mvula yoyamba yakhazikika ndipo dzenje lililonse mudzale mbewu imodzi yokha. Izi zimapangitsa kuti mbewu zisapikisane pazachonde m'nthaka."
      : "For best maize yield, plant immediately after the first effective rains of at least 25mm. Plant one seed per hole at a depth of 5cm to prevent birds from digging up the seeds.";
  }
  if (p.includes('pest') || p.includes('tizilombo') || p.includes('mphutsi')) {
    return isChichewa
      ? "Ngati mbewu zanu zili ndi mphutsi monga 'fall armyworm', funsani msanga kwa amishonale azaulimu kapena gwiritsani ntchito sopo wosungunula kapena phulusa losakaniza ndi madzi kuti muteteze chimanga chanu."
      : "If you detect Fall Armyworm, apply natural ash mixed with water in the maize whorl or consult your local extension officer immediately for bio-pesticides before spraying.";
  }
  if (p.includes('price') || p.includes('mtengo') || p.includes('malonda')) {
    return isChichewa
      ? "Mitengo ya chimanga pakali pano yakwera pafupifupi 5% m'maboma a Kasungu ndi Dowa. Yesetsani kusunga mbewu zanu zowuma bwino m'nkhokwe kuti mugulitse pamene mtengo ukukwera kwambiri."
      : "Maize prices are currently up by 5% in Kasungu and Dowa. Ensure your grains are dried to under 13.5% moisture content to command premium prices and prevent post-harvest spoilage.";
  }
  
  // General response
  return isChichewa
    ? "Muli bwanji! AgriWomen Voice ili pano kukuthandizani kupeza chidziwitso cha loans, mitengo yambewu, ndi nyengo. Lembani funso lina lililonse la zaulimi ndipo tikuthandizani."
    : "Hello and welcome to AgriWomen! We are here to help you secure financial assistance, real-time market prices, and localized weather forecasts. Feel free to ask any farming question.";
}

function getLoanFallback(amount, purpose, repaymentPeriod, farmSize, cropType) {
  const amt = Number(amount) || 100000;
  const period = Number(repaymentPeriod) || 6;
  const size = Number(farmSize) || 2;
  
  // Simple heuristic
  let status = "Approved";
  let score = 85;
  let interestRate = "21.5% annual";
  let remarks = "Application matches smallholder farming standard criteria. Verified crop history and plot size supports the capacity to repay.";
  
  if (amt > 500000) {
    status = "Referred";
    score = 65;
    interestRate = "24.0% annual";
    remarks = "Higher risk loan amount requested. Referral made to partner bank credit department for verification of assets and previous high-value yields.";
  } else if (size < 0.5) {
    status = "Referred";
    score = 55;
    interestRate = "26.0% annual";
    remarks = "Small plot size registered. Application referred to local Extension Officer to verify intensive farming yield projections before final decision.";
  }

  const advice = `MK ${amt.toLocaleString()} for ${purpose || 'farm inputs'} over ${period} months represents a standard agricultural micro-loan. Ensure to apply fertilizers at optimal times to guarantee high yield.`;

  return { score, status, interestRate, remarks, advice };
}

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
