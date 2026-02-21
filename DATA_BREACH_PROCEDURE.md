# Data Breach Notification Procedure

**Internal Document — K&R Accountants Ltd**
**Last Updated:** February 2026

---

## 1. Context

Invease stores all user data locally in the browser (localStorage/sessionStorage). No personal data is transmitted to or stored on our servers. The risk of a data breach from our infrastructure is minimal.

However, potential breach scenarios include:

- Compromise of the Companies House API proxy (exposing API keys)
- XSS vulnerability allowing data exfiltration from localStorage
- Malicious dependency in the supply chain (npm packages)
- Compromise of the Vercel hosting account

---

## 2. Breach Detection

### Indicators

- Sentry alerts showing unexpected errors or injection patterns
- Unusual API usage patterns (rate limit spikes)
- User reports of unexpected behaviour
- Dependency vulnerability alerts from GitHub/npm

### Monitoring

- Sentry error tracking (production errors)
- Vercel Analytics (traffic anomalies)
- GitHub Dependabot (dependency vulnerabilities)

---

## 3. Response Steps

### Step 1: Contain (Within 1 hour)

- [ ] Identify the scope of the breach
- [ ] Take affected services offline if necessary (Vercel deployment pause)
- [ ] Rotate any compromised API keys (Companies House, Sentry DSN)
- [ ] Document initial findings

### Step 2: Assess (Within 24 hours)

- [ ] Determine what data was potentially affected
- [ ] Assess whether personal data was involved
- [ ] Determine the number of potentially affected users
- [ ] Assess the likely impact on individuals

### Step 3: Notify (Within 72 hours)

If personal data was involved:

#### ICO Notification (if required)

- Report via: https://ico.org.uk/make-a-complaint/data-protection-complaints/data-protection-complaints/
- Required if there is a risk to individuals' rights and freedoms
- Must be within 72 hours of becoming aware

#### User Notification

- Post a notice on the Invease website
- If email addresses are known, send direct notification
- Include:
  - Nature of the breach
  - Data potentially affected
  - Steps we have taken
  - Steps users should take (e.g., clear browser data)
  - Contact details for questions

### Step 4: Remediate

- [ ] Fix the vulnerability that caused the breach
- [ ] Deploy the fix
- [ ] Verify the fix is effective
- [ ] Update security measures to prevent recurrence

### Step 5: Review (Within 2 weeks)

- [ ] Document lessons learned
- [ ] Update this procedure if needed
- [ ] Review security headers and CSP
- [ ] Consider additional security measures

---

## 4. Key Contacts

| Role            | Contact                              |
| --------------- | ------------------------------------ |
| Data Controller | K&R Accountants Ltd                  |
| Technical Lead  | info@kraccountants.com               |
| ICO Helpline    | 0303 123 1113                        |
| ICO Report      | https://ico.org.uk/make-a-complaint/ |

---

## 5. Record Keeping

All breach incidents (including near-misses) should be logged with:

- Date and time of discovery
- Nature of the incident
- Data affected
- Actions taken
- Outcome

Even if no breach occurs, this log demonstrates compliance with UK GDPR Article 33(5).
