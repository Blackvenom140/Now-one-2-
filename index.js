const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();
const db = admin.database();

// 🔥 Fetch API and Save Results to Firebase
exports.updateResults = functions.pubsub.schedule('every 1 minutes').onRun(async (context) => {
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
            if (data.code === 0) {
                data.data.list.forEach(result => {
                    const { issueNumber, colour, number } = result;
                    const resultRef = db.ref('results/' + issueNumber);
                    resultRef.set({ issueNumber, colour, number });
                });

                console.log('✅ Results updated in Firebase');
            } else {
                console.error('❌ API Error:', data.msg);
            }
        } else {
            console.error('❌ HTTP Error:', response.statusText);
        }
    } catch (error) {
        console.error('❌ Network Error:', error.message);
    }
});

// 🔥 AI Prediction Function (Works with script.js)
exports.generatePrediction = functions.database.ref('/results/{issueNumber}').onWrite(async (change, context) => {
    const snapshot = await db.ref('results').once('value');
    if (!snapshot.exists()) return;

    const history = Object.values(snapshot.val()).map(data => ({
        issueNumber: data.issueNumber,
        number: data.number
    }));

    // Convert number to Big/Small
    const convertToBigSmall = num => (num <= 4 ? "Small" : "Big");

    // Analyze past data
    let bigCount = 0, smallCount = 0;
    history.forEach(data => {
        const category = convertToBigSmall(data.number);
        category === "Big" ? bigCount++ : smallCount++;
    });

    // AI Rule Modification for Prediction
    const predictedCategory = bigCount > smallCount ? "Small" : "Big";

    // Save Prediction in Firebase
    const predictionRef = db.ref('predictions/' + Date.now());
    await predictionRef.set({
        predictedCategory,
        timestamp: new Date().toISOString()
    });

    console.log(`🔥 AI Prediction: Next number is likely "${predictedCategory}"`);
});


