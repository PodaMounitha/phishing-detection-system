# Phishing Detection - VirusTotal Integration

## Setup Instructions

### 1. Get a VirusTotal API Key (Optional but Recommended)

The phishing detection works without VirusTotal, but adding it provides URL scanning capabilities for more accurate results.

1. Go to [VirusTotal](https://www.virustotal.com/gui/join-us)
2. Sign up for a free account
3. Navigate to your profile and copy your API key
4. The free tier provides:
   - 4 requests per minute
   - 500 requests per day

### 2. Configure the API Key

1. Create a `.env` file in the `server` directory:
   ```bash
   cd server
   cp .env.example .env
   ```

2. Edit the `.env` file and add your API key:
   ```
   VIRUSTOTAL_API_KEY=your_actual_api_key_here
   ```

3. Restart the server for changes to take effect

### 3. How It Works

The phishing detection uses multiple methods:

1. **Bayes Classifier** (25% weight)
   - Trained on 2000+ examples from the SpamAssassin dataset
   - Dynamically loads `server/SpamAssasin.csv` on startup
   - Uses natural language processing to classify content

2. **Keyword Indicators** (25% weight)
   - Scans for suspicious keywords in categories:
     - Urgency (urgent, immediately, now, etc.)
     - Security (verify, confirm, suspended, etc.)
     - Credentials (password, login, account, etc.)
     - Financial (bank, payment, credit card, etc.)
     - Action words (click, download, update, etc.)
     - Rewards (prize, winner, lottery, etc.)
     - Threats (close, delete, terminate, etc.)

3. **Pattern Matching** (20% weight)
   - Detects suspicious phrase patterns like:
     - "click here/now"
     - "verify your account"
     - "unusual activity"
     - "final notice"

4. **URL Analysis** (15% weight)
   - Checks for:
     - IP addresses instead of domain names
     - Suspicious TLDs (.tk, .ml, .ga, etc.)
     - Excessive subdomains
     - URL shorteners
     - Misleading characters

5. **VirusTotal Scan** (15% weight, if API key provided)
   - Scans URLs against 70+ antivirus engines
   - Provides malicious/suspicious/harmless ratings

### Detection Threshold

- **Confidence > 35%** = Flagged as potential phishing
- **Confidence ≤ 35%** = Appears safe

### Testing Examples

Try these examples to see the detection in action:

**Phishing Example:**
```
URGENT: Your account has been suspended due to unusual activity. 
Click here to verify your identity immediately: http://192.168.1.1/verify
If you don't act now, your account will be permanently deleted.
```

**Legitimate Example:**
```
Hi there,

Your order #12345 has been shipped and will arrive tomorrow.
You can track your package using the tracking number provided.

Thank you for your purchase!
```

### Without VirusTotal API Key

The system will still work effectively using the other 4 detection methods. The weights are automatically redistributed when no API key is provided.
