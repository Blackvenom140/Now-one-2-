// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "fir-d42e6.firebaseapp.com",
  databaseURL: "https://fir-d42e6-default-rtdb.firebaseio.com",
  projectId: "fir-d42e6",
  storageBucket: "fir-d42e6.appspot.com",
  messagingSenderId: "290511340171",
  appId: "1:290511340171:web:a0e2859c5a05937fc80a8e",
  measurementId: "G-2SX12MNVS3"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// AI Memory (Win/Loss Tracking & Predictions)
let aiMemory = {
  pastPredictions: [],
  winLossHistory: [],
  patternHint: null
};

// Convert number to Big/Small
function convertToBigSmall(num) {
  return num < 5 ? "Small" : "Big";
}

// Fetch API Data
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

// **Improved AI Prediction Logic**
function analyzePatterns(results) {
  const sequence = results.map(r => convertToBigSmall(r.number));
  const last6 = sequence.slice(-6);

  let bigCount = sequence.filter(x => x === "Big").length;
  let smallCount = sequence.filter(x => x === "Small").length;

  if (bigCount > smallCount + 2) return "Small";
  if (smallCount > bigCount + 2) return "Big";

  let last = sequence[sequence.length - 1];
  let streak = 1;
  for (let i = sequence.length - 2; i >= 0; i--) {
    if (sequence[i] === last) streak++;
    else break;
  }

  if (streak >= 3) return last === "Big" ? "Small" : "Big";

  return bigCount > smallCount ? "Big" : "Small";
}

// AI Decision Making
function decisionMaker(results) {
  if (results.length < 10) return null;
  let basePrediction = analyzePatterns(results);
  let hint = aiMemory.patternHint;

  if (!hint) return basePrediction;

  switch (hint) {
    case "streak_Big": return "Small";
    case "streak_Small": return "Big";
    case "big_dominant": return "Big";
    case "small_dominant": return "Small";
    default: return basePrediction;
  }
}

// **Better AI Adaptation**
function dynamicAdjustmentAI(results, predictedCategory) {
  let last10 = aiMemory.winLossHistory.slice(-10);
  let last3Predictions = aiMemory.pastPredictions.slice(-3);

  let last10Accuracy = last10.filter((res, i) => res === aiMemory.pastPredictions[i]).length / 10;
  let repeatedSame = last3Predictions.every(p => p === predictedCategory);

  if (last10Accuracy < 0.4 || repeatedSame) {
    predictedCategory = predictedCategory === "Big" ? "Small" : "Big";
  }

  return predictedCategory;
}

// **Neural AI Pattern Detection from Firebase**
async function neuralPatternAI() {
  return new Promise((resolve) => {
    const resultsRef = ref(database, 'results');
    onValue(resultsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return resolve();

      const history = Object.values(data).slice(-100).map(entry => entry.bigSmall);
      let patternHint = null;

      let bigs = history.filter(x => x === "Big").length;
      let ratio = bigs / history.length;
      if (ratio >= 0.7) patternHint = "big_dominant";
      if (ratio <= 0.3) patternHint = "small_dominant";

      let last = history[history.length - 1];
      let streakCount = history.reverse().findIndex(x => x !== last);
      if (streakCount >= 4) patternHint = `streak_${last}`;

      aiMemory.patternHint = patternHint;
      resolve();
    }, { onlyOnce: true });
  });
}

// **Master AI Prediction**
function advancedPredictNextResult(results) {
  if (results.length < 10) return null;
  let prediction = decisionMaker(results);
  prediction = dynamicAdjustmentAI(results, prediction);
  return prediction;
}

// **Update UI Results**
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

// **Fetch, Analyze & Update**
async function fetchResultsAndUpdate() {
  await neuralPatternAI();
  const resultList = await fetchResults();
  if (resultList) {
    updateResults(resultList);
  }
}

// **Start Loop**
fetchResultsAndUpdate();
setInterval(fetchResultsAndUpdate, 60000);
