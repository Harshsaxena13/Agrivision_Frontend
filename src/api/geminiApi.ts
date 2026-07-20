import { ScanAnalysis, WeatherData, Crop, CommunityPost } from '../navigation/types';

// ─── Mock Plant Disease Database ───────────────────────────────────────────────
export const DISEASE_DATABASE = [
  // ── Wheat Diseases (matched by deployed wheat-disease-api-eiv4 model) ──
  {
    id: 'w1',
    name: 'Brown Rust',
    scientificName: 'Puccinia triticina',
    plantType: 'Wheat',
    severity: 'High' as const,
    confidence: 90,
    symptoms: ['Orange-brown pustules on leaf surface', 'Circular or oval uredia', 'Yellowing around lesions', 'Premature leaf death'],
    affectedParts: ['Leaves', 'Leaf sheaths'],
    organicTreatment: ['Remove heavily infected leaves', 'Apply neem oil spray (5 ml/L)', 'Ensure crop spacing for air circulation', 'Use resistant wheat varieties'],
    chemicalTreatment: [
      { product: 'Propiconazole 25% EC', dosage: '1 ml/L water' },
      { product: 'Tebuconazole 25.9% EC', dosage: '1 ml/L water' },
    ],
    prevention: ['Sow rust-resistant varieties', 'Avoid late sowing', 'Monitor field from tillering stage', 'Crop rotation with non-cereal crops'],
    emoji: '🌾',
    color: '#C05621',
  },
  {
    id: 'w2',
    name: 'Yellow Rust',
    scientificName: 'Puccinia striiformis f. sp. tritici',
    plantType: 'Wheat',
    severity: 'High' as const,
    confidence: 88,
    symptoms: ['Bright yellow-orange stripe pustules along veins', 'Parallel rows of uredinia on leaves', 'White dusty appearance late season', 'Stunted plant growth'],
    affectedParts: ['Leaves', 'Glumes', 'Awns'],
    organicTreatment: ['Remove infected plant debris', 'Apply sulfur-based fungicide at early signs', 'Improve field drainage', 'Intercrop with resistant varieties'],
    chemicalTreatment: [
      { product: 'Propiconazole 25% EC', dosage: '1 ml/L water' },
      { product: 'Mancozeb 75% WP', dosage: '2 g/L water' },
    ],
    prevention: ['Plant in optimal sowing window', 'Use certified rust-resistant seed', 'Scout fields weekly during cool moist weather', 'Avoid dense crop stands'],
    emoji: '🌾',
    color: '#D69E2E',
  },
  {
    id: 'w3',
    name: 'Black Rust',
    scientificName: 'Puccinia graminis f. sp. tritici',
    plantType: 'Wheat',
    severity: 'Critical' as const,
    confidence: 92,
    symptoms: ['Dark reddish-brown elongated pustules on stems', 'Brick-red masses of urediniospores', 'Shredded epidermis around pustules', 'Severe lodging and grain shrivelling'],
    affectedParts: ['Stems', 'Leaves', 'Grain'],
    organicTreatment: ['Destroy crop debris after harvest', 'Apply copper-based sprays at early infection', 'Scout barberry shrubs nearby (alternate host)', 'Use biocontrol agents (Bacillus subtilis)'],
    chemicalTreatment: [
      { product: 'Hexaconazole 5% SC', dosage: '2 ml/L water' },
      { product: 'Tebuconazole 50% WG', dosage: '1 g/L water' },
    ],
    prevention: ['Plant stem-rust-resistant varieties', 'Eradicate alternate hosts (barberry)', 'Avoid nitrogen over-fertilization', 'Early harvest when possible'],
    emoji: '🌾',
    color: '#822727',
  },
  {
    id: 'w4',
    name: 'Powdery Mildew',
    scientificName: 'Blumeria graminis f. sp. tritici',
    plantType: 'Wheat',
    severity: 'Medium' as const,
    confidence: 85,
    symptoms: ['White powdery patches on upper leaf surface', 'Yellowing beneath white patches', 'Reduced photosynthesis', 'Early leaf senescence'],
    affectedParts: ['Leaves', 'Leaf sheaths', 'Spikes'],
    organicTreatment: ['Spray baking soda solution (1 tbsp/L)', 'Apply potassium bicarbonate', 'Remove heavily infected tillers', 'Neem oil spray (5 ml/L)'],
    chemicalTreatment: [
      { product: 'Sulfur 80% WP', dosage: '3 g/L water' },
      { product: 'Triadimefon 25% WP', dosage: '1 g/L water' },
    ],
    prevention: ['Plant in full sunlight with good spacing', 'Avoid excess nitrogen fertilizer', 'Use mildew-resistant varieties', 'Water at soil level not overhead'],
    emoji: '🌾',
    color: '#F6AD55',
  },
  {
    id: 'w5',
    name: 'Septoria Leaf Blotch',
    scientificName: 'Zymoseptoria tritici',
    plantType: 'Wheat',
    severity: 'High' as const,
    confidence: 87,
    symptoms: ['Tan or brown lesions with yellow margins', 'Black pycnidia visible in lesion centers', 'Lesions restricted by leaf veins', 'Rapid disease spread in wet weather'],
    affectedParts: ['Leaves', 'Glumes'],
    organicTreatment: ['Remove infected lower leaves', 'Avoid splashing water on leaves', 'Apply Bordeaux mixture', 'Improve air circulation in canopy'],
    chemicalTreatment: [
      { product: 'Azoxystrobin 23% SC', dosage: '1 ml/L water' },
      { product: 'Epoxiconazole 125 g/L', dosage: '1.5 ml/L water' },
    ],
    prevention: ['Crop rotation with non-cereal crops', 'Deep plough to bury stubble', 'Use resistant varieties', 'Apply fungicide at flag leaf stage'],
    emoji: '🌾',
    color: '#B7791F',
  },
  {
    id: 'w6',
    name: 'Fusarium Head Blight',
    scientificName: 'Fusarium graminearum',
    plantType: 'Wheat',
    severity: 'Critical' as const,
    confidence: 91,
    symptoms: ['Premature bleaching of spikelets', 'Pink/salmon fungal growth on glumes', 'Shrivelled grain (tombstone kernels)', 'Mycotoxin contamination of grain'],
    affectedParts: ['Spikes (heads)', 'Grain', 'Glumes'],
    organicTreatment: ['Remove and destroy infected heads', 'Apply Trichoderma biocontrol agents', 'Avoid harvesting in wet conditions', 'Dry grain immediately after harvest'],
    chemicalTreatment: [
      { product: 'Tebuconazole 25% EW', dosage: '1.5 ml/L water (at flowering)' },
      { product: 'Metconazole 90 g/L', dosage: '1 ml/L water' },
    ],
    prevention: ['Plant resistant/tolerant varieties', 'Avoid maize–wheat rotation', 'Time flowering to avoid wet periods', 'Test grain for mycotoxins before storage'],
    emoji: '🌾',
    color: '#9B2C2C',
  },
  {
    id: 'w7',
    name: 'Wheat Blast',
    scientificName: 'Magnaporthe oryzae Triticum pathotype',
    plantType: 'Wheat',
    severity: 'Critical' as const,
    confidence: 89,
    symptoms: ['Bleached spikes with empty grains', 'Dark brown lesions at base of spike', 'Velvety gray fungal growth on affected spikes', 'Complete yield loss in severe cases'],
    affectedParts: ['Spikes', 'Rachis', 'Grain'],
    organicTreatment: ['Remove and burn infected spikes immediately', 'Improve field drainage', 'Avoid overhead irrigation during heading', 'Apply silicon-based nutrients to boost resistance'],
    chemicalTreatment: [
      { product: 'Trifloxystrobin + Tebuconazole', dosage: '0.75 ml/L water' },
      { product: 'Azoxystrobin 23% SC', dosage: '1 ml/L water' },
    ],
    prevention: ['Use blast-resistant varieties', 'Avoid nitrogen excess during heading', 'Plant in areas with good air movement', 'Report outbreaks to agricultural authorities immediately'],
    emoji: '🌾',
    color: '#744210',
  },
  {
    id: 'w8',
    name: 'Aphid',
    scientificName: 'Rhopalosiphum padi / Sitobion avenae',
    plantType: 'Wheat',
    severity: 'Medium' as const,
    confidence: 83,
    symptoms: ['Dense colonies of small insects on leaves and stems', 'Honeydew deposits causing sooty mold', 'Curled and yellowing leaves', 'Stunted plant growth and reduced grain fill'],
    affectedParts: ['Leaves', 'Stems', 'Spikes'],
    organicTreatment: ['Release ladybird beetles (biocontrol)', 'Spray with soap solution (5 ml/L)', 'Apply neem oil spray', 'Encourage natural predators in field'],
    chemicalTreatment: [
      { product: 'Imidacloprid 17.8% SL', dosage: '0.5 ml/L water' },
      { product: 'Thiamethoxam 25% WG', dosage: '0.5 g/L water' },
    ],
    prevention: ['Monitor crops from tillering stage', 'Avoid excess nitrogen fertilizer', 'Maintain field borders with flowering plants for predators', 'Treat seed with systemic insecticide'],
    emoji: '🐛',
    color: '#276749',
  },
  {
    id: 'w9',
    name: 'Loose Smut',
    scientificName: 'Ustilago tritici',
    plantType: 'Wheat',
    severity: 'High' as const,
    confidence: 86,
    symptoms: ['Entire spike replaced by black smut mass', 'Black powdery spores released at heading', 'Stunted plants shorter than healthy ones', 'Scattered affected plants across field'],
    affectedParts: ['Entire spike', 'Grain'],
    organicTreatment: ['Uproot and bag infected plants before spore dispersal', 'Use certified smut-free seed', 'Hot water seed treatment (52°C for 10 minutes)', 'Thiram dust seed treatment'],
    chemicalTreatment: [
      { product: 'Carboxin 75% WP (seed treatment)', dosage: '2.5 g/kg seed' },
      { product: 'Tebuconazole 2% DS (seed treatment)', dosage: '1.25 g/kg seed' },
    ],
    prevention: ['Use certified disease-free seed', 'Avoid saving seed from infected crops', 'Treat seed before sowing', 'Plant resistant varieties'],
    emoji: '🌾',
    color: '#1A202C',
  },
  // ── Other Crop Diseases ──────────────────────────────────────────────────────
  {
    id: 'd1',
    name: 'Leaf Blight',
    scientificName: 'Alternaria solani',
    plantType: 'Tomato',
    severity: 'High' as const,
    confidence: 92,
    symptoms: ['Brown lesions on leaves', 'Yellow halos around spots', 'Leaf drop', 'Stem cankers'],
    affectedParts: ['Leaves', 'Stems', 'Fruits'],
    organicTreatment: ['Apply neem oil spray (5ml/L water)', 'Remove and destroy infected leaves', 'Improve air circulation', 'Use copper-based Bordeaux mixture'],
    chemicalTreatment: [
      { product: 'Mancozeb 75% WP', dosage: '2.5 g/L water' },
      { product: 'Chlorothalonil', dosage: '2 g/L water' },
    ],
    prevention: ['Use disease-resistant varieties', 'Avoid overhead irrigation', 'Maintain proper spacing', 'Crop rotation every 2-3 years'],
    emoji: '🍅',
    color: '#E53E3E',
  },
  {
    id: 'd3',
    name: 'Root Rot',
    scientificName: 'Phytophthora cinnamomi',
    plantType: 'General',
    severity: 'Critical' as const,
    confidence: 85,
    symptoms: ['Wilting despite water', 'Brown/black roots', 'Yellow lower leaves', 'Foul odor from soil'],
    affectedParts: ['Roots', 'Crown', 'Stems'],
    organicTreatment: ['Improve drainage immediately', 'Apply Trichoderma viride', 'Reduce irrigation', 'Add perlite to soil mix'],
    chemicalTreatment: [
      { product: 'Metalaxyl', dosage: '2 g/L water (soil drench)' },
      { product: 'Fosetyl-Al', dosage: '2.5 g/L water' },
    ],
    prevention: ['Ensure proper drainage', 'Avoid overwatering', 'Sterilize soil before planting', 'Use raised beds'],
    emoji: '🌱',
    color: '#9B2C2C',
  },
  {
    id: 'd4',
    name: 'Bacterial Wilt',
    scientificName: 'Ralstonia solanacearum',
    plantType: 'Brinjal / Potato',
    severity: 'High' as const,
    confidence: 79,
    symptoms: ['Sudden wilting', 'Vascular browning', 'Sticky bacterial ooze', 'Plant death'],
    affectedParts: ['Vascular system', 'Stems', 'Roots'],
    organicTreatment: ['Remove infected plants immediately', 'Solarize soil', 'Apply lime to soil', 'Biocontrol with Bacillus subtilis'],
    chemicalTreatment: [
      { product: 'Streptomycin sulfate', dosage: '500 ppm solution' },
      { product: 'Copper hydroxide', dosage: '2 g/L water' },
    ],
    prevention: ['Use certified disease-free seeds', 'Avoid water-logged soil', 'Disinfect farm tools', 'Practice crop rotation'],
    emoji: '🥔',
    color: '#D69E2E',
  },
  {
    id: 'd5',
    name: 'Anthracnose',
    scientificName: 'Colletotrichum gloeosporioides',
    plantType: 'Mango / Chilli',
    severity: 'Medium' as const,
    confidence: 91,
    symptoms: ['Dark sunken lesions on fruits', 'Pink spore masses', 'Post-harvest decay', 'Twig dieback'],
    affectedParts: ['Fruits', 'Leaves', 'Twigs'],
    organicTreatment: ['Apply neem oil + garlic spray', 'Hot water treatment (52°C for 5 min)', 'Trichoderma harzianum application', 'Remove mummified fruits'],
    chemicalTreatment: [
      { product: 'Carbendazim 50% WP', dosage: '1 g/L water' },
      { product: 'Propiconazole', dosage: '1 ml/L water' },
    ],
    prevention: ['Harvest at proper maturity', 'Avoid fruit injuries', 'Improve canopy ventilation', 'Regular sanitation of orchard'],
    emoji: '🥭',
    color: '#ED8936',
  },
];

// ─── Mock Scan API ─────────────────────────────────────────────────────────────
export const analyzePlantImage = async (imageUri: string): Promise<ScanAnalysis> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Randomly pick a disease or healthy result for demo
  const random = Math.random();

  if (random > 0.3) {
    const randomDisease = DISEASE_DATABASE[Math.floor(Math.random() * DISEASE_DATABASE.length)];
    return {
      plantName: randomDisease.plantType,
      healthStatus: 'Diseased',
      disease: randomDisease,
      overallScore: Math.floor(Math.random() * 40) + 30,
      tips: [
        'Act immediately to prevent spread',
        'Isolate the affected plant from healthy ones',
        'Keep records of treatments applied',
        'Monitor progress every 3 days',
      ],
    };
  } else {
    return {
      plantName: 'Healthy Plant',
      healthStatus: 'Healthy',
      disease: null,
      overallScore: Math.floor(Math.random() * 15) + 85,
      tips: [
        'Your plant looks great! Keep maintaining good practices',
        'Ensure consistent watering schedule',
        'Add compost every 2 weeks for nutrition',
        'Monitor for early signs of pests',
      ],
    };
  }
};

// ─── REAL Gemini API (plug in your key) ────────────────────────────────────────
export const analyzeWithGemini = async (imageBase64: string, apiKey: string): Promise<ScanAnalysis> => {
  const prompt = `You are an expert agricultural scientist. Analyze this plant image carefully and provide a JSON response with:
{
  "plantName": "plant species name",
  "healthStatus": "Healthy | Diseased | At Risk",
  "overallScore": 0-100,
  "disease": null or {
    "id": "unique_id",
    "name": "disease common name",
    "scientificName": "latin name",
    "plantType": "affected plant",
    "severity": "Low | Medium | High | Critical",
    "confidence": 0-100,
    "symptoms": ["symptom1", "symptom2"],
    "affectedParts": ["part1", "part2"],
    "organicTreatment": ["step1", "step2"],
    "chemicalTreatment": [{"product": "name", "dosage": "amount"}],
    "prevention": ["tip1", "tip2"],
    "emoji": "relevant emoji",
    "color": "#hexcolor"
  },
  "tips": ["tip1", "tip2"]
}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } }
        ]
      }],
      generationConfig: { response_mime_type: 'application/json' }
    }),
  });

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(text) as ScanAnalysis;
};
