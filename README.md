# Internlytic Cyber Awareness Training Portal

**Live Demo Website:** https://umar5813.github.io/internlytic-cyber-awareness-portal/  
**GitHub Repository:** https://github.com/umar5813/internlytic-cyber-awareness-portal  
**Program:** Internlytic Technologies – Phase 3 Cyber Security & Secure Coding Internship

---

## 1. Project Overview
The **Internlytic Cyber Awareness Training Portal** is an interactive educational web application designed to help users recognize common cyber threats and practice safer digital and coding habits.

### Key Features Implemented:
1. **Core Cyber Awareness Modules (`index.html`):** Short, interactive learning cards covering Phishing, Password Safety, and Suspicious Links with real-world attack examples and progress tracking.
2. **Threat Identification Quiz (`quiz.html`):** A 10-scenario interactive quiz asking users to identify safe and unsafe example messages, displaying real-time scores, detailed explanations, and a final scoreboard.
3. **Suspicious Link Inspector (`link-inspector.html`):** A local URL analyzer that checks fictional links for typosquatting, unencrypted HTTP, `@` redirection tricks, raw IP addresses, and deceptive subdomains.
4. **Local Password-Strength Meter (`password-meter.html`):** Evaluates password length, character diversity, and entropy bits locally using demo inputs only.
5. **Developer Secure-Coding Checklist (`secure-coding.html`):** An interactive audit checklist covering input validation, password hashing, and safe error handling alongside vulnerable vs. secure code examples.

---

## 2. Security Concepts Explained

* **Phishing & Social Engineering:** Attackers use artificial urgency, spoofed sender addresses, and look-alike domains (typosquatting) to trick users into revealing sensitive credentials or executing malicious attachments.
* **Password Safety & Hashing:** Longer passphrases with mixed character sets exponentially increase resistance against brute-force attacks. On the backend, passwords must never be stored in plain text—developers should use slow, salted adaptive hashing algorithms such as **Argon2id** or **bcrypt**.
* **Suspicious Links & URL Anatomy:** Attackers often place trusted brand names as subdomains (e.g., `login.brand.com.attacker.xyz`) to hide the true root domain. Inspecting the domain immediately before the first single `/` helps verify link legitimacy.
* **Input Validation & Safe Error Handling:** Server-side allow-list validation and parameterized SQL queries prevent SQL Injection and Cross-Site Scripting (XSS). Returning generic error messages to end users prevents leaking stack traces or database internals.

---

## 3. Safe Testing Boundaries & Ethical Compliance

* **Fictional Examples Only:** All emails, SMS messages, domains, and URLs used across the learning modules, quiz, and link inspector are 100% fictional and created solely for educational awareness.
* **Zero Credential Storage or Transmission:** The password-strength meter runs entirely in local browser memory (`JavaScript`). No real passwords are requested, stored in databases/cookies/`localStorage`, or transmitted over any network.
* **No Active Scanning or Exploitation:** The Link Inspector performs static local string analysis and never sends network requests, scans external systems, or interacts with live websites.
