import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { analyzeEmail } from '../services/phishingService.js';

async function runTest() {
    const csvPath = path.resolve('server/SpamAssasin.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true
    });

    console.log(`Loaded ${records.length} records from SpamAssasin.csv`);

    let correct = 0;
    let falsePositives = 0;
    let falseNegatives = 0;
    let truePositives = 0;
    let trueNegatives = 0;
    let totalTested = 0;

    // Select test records that don't overlap with the first 500 used for training
    const spamRecords = records.filter(r => r.Label === '1' && r.Body && r.Body !== 'empty');
    const hamRecords = records.filter(r => r.Label === '0' && r.Body && r.Body !== 'empty');

    const testSpam = spamRecords.slice(500, 550);
    const testHam = hamRecords.slice(500, 550);
    const testRecords = [...testSpam, ...testHam];

    console.log(`Testing on ${testRecords.length} balanced samples...`);

    for (const record of testRecords) {
        const content = record.Body;
        const actualLabel = parseInt(record.Label); // 1 for phishing/spam, 0 for legitimate

        if (!content || content === 'empty') continue;

        const result = await analyzeEmail(content);
        const predictedLabel = result.isPhishing ? 1 : 0;

        totalTested++;

        if (predictedLabel === actualLabel) {
            correct++;
            if (predictedLabel === 1) truePositives++;
            else trueNegatives++;
        } else {
            if (predictedLabel === 1) falsePositives++;
            else falseNegatives++;
        }

        if (totalTested % 50 === 0) {
            console.log(`Progress: ${totalTested}/${testRecords.length}`);
        }
    }

    const accuracy = (correct / totalTested) * 100;
    const precision = (truePositives / (truePositives + falsePositives)) * 100 || 0;
    const recall = (truePositives / (truePositives + falseNegatives)) * 100 || 0;
    const f1 = (2 * precision * recall) / (precision + recall) || 0;

    console.log('\n--- Test Results ---');
    console.log(`Total Tested: ${totalTested}`);
    console.log(`Accuracy: ${accuracy.toFixed(2)}%`);
    console.log(`Precision: ${precision.toFixed(2)}%`);
    console.log(`Recall: ${recall.toFixed(2)}%`);
    console.log(`F1 Score: ${f1.toFixed(2)}%`);
    console.log(`True Positives: ${truePositives}`);
    console.log(`True Negatives: ${trueNegatives}`);
    console.log(`False Positives: ${falsePositives}`);
    console.log(`False Negatives: ${falseNegatives}`);
}

runTest().catch(console.error);
