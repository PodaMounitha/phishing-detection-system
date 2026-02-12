import natural from 'natural';

const classifier = new natural.BayesClassifier();
classifier.addDocument('urgent verify account now', 'phishing');
classifier.addDocument('meeting tomorrow at 2pm', 'legitimate');
classifier.train();

const testStr = 'urgent action required verify your account';
const classifications = classifier.getClassifications(testStr);
console.log('Classifications:', JSON.stringify(classifications, null, 2));
