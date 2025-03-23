// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC0mQJnIQvJg9BbPOxLZaBRXJiA7OTa6JM",
  authDomain: "fir-d42e6.firebaseapp.com",
  databaseURL: "https://fir-d42e6-default-rtdb.firebaseio.com",
  projectId: "fir-d42e6",
  storageBucket: "fir-d42e6.firebasestorage.app",
  messagingSenderId: "290511340171",
  appId: "1:290511340171:web:a0e2859c5a05937fc80a8e",
  measurementId: "G-2SX12MNVS3"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Convert number to Big/Small
function convertToBigSmall(num) {
  return num < 5 ? "Small" : "Big";
}

// AI Memory
let aiMemory = {
  pastPredictions: [],
  winLossHistory: [],
  learningData: {},
  patternHint: null
};

// AI-1: Data Collector
async function fetchResults() {
  const apiUrl = 'https://api.bdg88zf.com/api/webapi/GetNoaverageEmerdList';
  const requestData = {
    "pageSize": 10,
    "pageNo": 1,
    "typeId": 1,
    "language": 0,
    "random": "c2505d9138da4e3780b2c2b34f2fb789",
    "signature": "7D637E060DA35C0C6E28DC6D23D71BED",
    "timestamp": Math.floor(Date.now() / 1000),
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify(requestData),
    });

    if (response.ok) {
      const data = await response.json();
      return data.code === 0 ? data.data.list : null;
    } else {
      console.error('HTTP Error:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Network Error:', error.message);
    return null;
  }
}

// AI-2: Advanced Pattern Analyzer
function analyzePatterns(results) {
  const sequence = results.map(r => convertToBigSmall(r.number));
  const last6 = sequence.slice(-6);

  let bigCount = sequence.filter(x => x === "Big").length;
  let smallCount = sequence.filter(x => x === "Small").length;

  let last = sequence[sequence.length - 1];
  let streak = 1;
  for (let i = sequence.length - 2; i >= 0; i--) {
    if (sequence[i] === last) streak++;
    else break;
  }
  if (streak >= 3) return last === "Big" ? "Small" : "Big";

  let isZigZag = true;
  for (let i = 2; i < last6.length; i++) {
    if (last6[i] !== last6[i - 2]) {
      isZigZag = false;
      break;
    }
  }
  if (isZigZag) return last6[last6.length - 2];

  return bigCount > smallCount ? "Big" : "Small";
}

// AI-3: Decision Maker (uses AI-7)
function decisionMaker(results) {
  if (results.length < 10) return null;

  const basePrediction = analyzePatterns(results);
  const hint = aiMemory.patternHint;

  if (!hint) return basePrediction;

  switch (hint) {
    case "zigzag":
    case "deep_mirror":
      return basePrediction === "Big" ? "Small" : "Big";
    case "streak_Big":
    case "strong_streak_Big":
      return "Small";
    case "streak_Small":
    case "strong_streak_Small":
      return "Big";
    case "custom_loop_BSSBSS":
    case "deep_wave":
    case "loop_repeat":
      return "Big";
    case "big_dominant":
      return "Big";
    case "small_dominant":
      return "Small";
    default:
      return basePrediction;
  }
}

// AI-4: Risk Manager

// AI-4: Risk Manager (Upgraded with Dynamic Risk Score & Past Failure Analysis)
function riskManager(results, predictedCategory) {
  let riskScore = 0;

  const last10 = results.slice(-10).map(r => convertToBigSmall(r.number));
  const bigCount = last10.filter(x => x === "Big").length;
  const smallCount = last10.filter(x => x === "Small").length;

  // Calculate Risk Score based on Streaks
  if (bigCount >= 7 || smallCount >= 7) {
    riskScore += 3; // High dominance of one side, increase risk
  }

  // Consider Past Prediction Failures
  const lossCount = aiMemory.winLossHistory.slice(-10).filter(x => x === "Loss").length;
  riskScore += lossCount * 0.5; // Each past loss adds 0.5 to risk

  // Adjust Prediction if Risk is High
  if (riskScore >= 3) {
    return predictedCategory === "Big" ? "Small" : "Big"; // Flip prediction in high-risk situations
  }

  return predictedCategory; // Keep original prediction if risk is low
}
// AI-5: Human-Like Thinking AI (Upgraded)
function humanLikeThinkingAI(predictedCategory) {
  const history = aiMemory.winLossHistory;
  const predictions = aiMemory.pastPredictions;

  const recent = Math.min(history.length, predictions.length);
  let correct = 0;
  for (let i = 0; i < recent; i++) {
    if (history[i] === predictions[i]) correct++;
  }

  const accuracy = recent > 0 ? correct / recent : 1;

  const lastPrediction = predictions[predictions.length - 1];
  const lastResult = history[history.length - 1];
  const repeatFailed = lastPrediction && lastResult && lastPrediction !== lastResult;

  if (accuracy < 0.4 || repeatFailed) {
    predictedCategory = predictedCategory === "Big" ? "Small" : "Big";
  }

  aiMemory.pastPredictions.push(predictedCategory);
  return predictedCategory;
}

// AI-6: Dynamic Adjustment AI (ðŸ”¥ Upgraded)
function dynamicAdjustmentAI(results, predictedCategory) {
  const history = aiMemory.winLossHistory;
  const predictions = aiMemory.pastPredictions;
  if (history.length < 10 || predictions.length < 10) return predictedCategory;

  const last10Accuracy = history.slice(-10).filter((res, i) => res === predictions[i]).length / 10;
  const last3Predictions = predictions.slice(-3);
  const repeatedSame = last3Predictions.every(p => p === predictedCategory);

  if (last10Accuracy < 0.4 || repeatedSame) {
    predictedCategory = predictedCategory === "Big" ? "Small" : "Big";
  }

  return predictedCategory;
}

// AI-7: Deep Pattern AI (ðŸ”¥ Intelligent Pattern Recognition)
async function neuralPatternAI() {
  return new Promise((resolve) => {
    const resultsRef = ref(database, 'results');
    onValue(resultsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return resolve();

      const history = Object.values(data)
        .sort((a, b) => b.issueNumber - a.issueNumber)
        .slice(0, 100)
        .reverse()
        .map(entry => entry.bigSmall);

      let patternHint = null;

      // Deep Mirror (BSBSBS or SBSBSB)
      let mirror = true;
      for (let i = 2; i < history.length; i++) {
        if (history[i] !== history[i - 2]) {
          mirror = false;
          break;
        }
      }
      if (mirror) patternHint = "deep_mirror";

      // Deep Wave (Big x3 â†’ Small x3 â†’ Big x3)
      const last9 = history.slice(-9);
      if (
        last9.slice(0, 3).every(x => x === "Big") &&
        last9.slice(3, 6).every(x => x === "Small") &&
        last9.slice(6, 9).every(x => x === "Big")
      ) {
        patternHint = "deep_wave";
      }

      // Ratio Drift (70% Big or Small)
      const bigs = history.filter(x => x === "Big").length;
      const ratio = bigs / history.length;
      if (ratio >= 0.7) patternHint = "big_dominant";
      if (ratio <= 0.3) patternHint = "small_dominant";

      // Strong Streak
      let last = history[history.length - 1];
      let streakCount = 1;
      for (let i = history.length - 2; i >= 0; i--) {
        if (history[i] === last) streakCount++;
        else break;
      }
      if (streakCount >= 5) patternHint = "strong_streak_" + last;

      // Repeating Pattern
      const recent6 = history.slice(-6).join(',');
      const previous6 = history.slice(-12, -6).join(',');
      if (recent6 === previous6) patternHint = "loop_repeat";

      // Save to AI memory
      aiMemory.patternHint = patternHint;
      resolve();
    }, { onlyOnce: true });
  });
}

// Save result to Firebase
async function saveResultToFirebase(issueNumber, colour, number) {
  const bigSmall = convertToBigSmall(number);
  const resultsRef = ref(database, 'results/' + issueNumber);
  set(resultsRef, { issueNumber, colour, number, bigSmall });
  aiMemory.winLossHistory.push(bigSmall);
}

// Check if result exists
function doesResultExist(issueNumber) {
  return new Promise((resolve) => {
    const resultsRef = ref(database, 'results/' + issueNumber);
    onValue(resultsRef, (snapshot) => {
      resolve(snapshot.exists());
    }, { onlyOnce: true });
  });
}
// Process and Save All Results
async function processResults(resultList) {
  for (const result of resultList) {
    const { issueNumber, colour, number } = result;
    if (!(await doesResultExist(issueNumber))) {
      await saveResultToFirebase(issueNumber, colour, number);
    }
  }
}

// Master AI Function
function advancedPredictNextResult(results) {
  if (results.length < 10) return null;
  let prediction = decisionMaker(results);                // AI-3
  prediction = riskManager(results, prediction);          // AI-4
  prediction = dynamicAdjustmentAI(results, prediction);  // AI-6
  return humanLikeThinkingAI(prediction);                 // AI-5
}

// Update UI with Results
function updateResults(resultList) {
  const historyTable = document.getElementById('recentResults');
  historyTable.innerHTML = '';

  const predictedNextCategory = advancedPredictNextResult(resultList);
  document.getElementById('predictedNumber').textContent =
    predictedNextCategory !== null ? predictedNextCategory : 'Not enough data';

  resultList.forEach(result => {
    const { issueNumber, number, colour } = result;
    const bigSmall = convertToBigSmall(number);
    const row = document.createElement('tr');

    row.innerHTML = `
      <td class="px-4 py-2">${issueNumber}</td>
      <td class="px-4 py-2">${colour}</td>
      <td class="px-4 py-2">${bigSmall} (${number})</td>
    `;

    historyTable.appendChild(row);
  });
}

// Fetch, Analyze, and Update
async function fetchResultsAndUpdate() {
  await neuralPatternAI(); // Run AI-7 (pattern detection)
  const resultList = await fetchResults();
  if (resultList) {
    await processResults(resultList);
    updateResults(resultList);
  } else {
    console.error("Failed to fetch or update results.");
  }
}

// Start Fetch Loop
fetchResultsAndUpdate();
setInterval(fetchResultsAndUpdate, 60000); // Every 60 seconds
