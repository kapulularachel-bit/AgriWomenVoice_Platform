# Software Requirements Specification (SRS)

Project: AgriWomen Voice Platform

Version: 0.1

Date: 2025-11-14

Prepared by: Project Team

---

## 1. Purpose

This SRS describes the functional and non-functional requirements for the AgriWomen Voice Platform — a digital system aimed at empowering female smallholder farmers in Malawi by providing access to loans, land registration, real-time market prices, weather forecasts, education content, and direct communication channels to buyers, NGOs and extension officers. The document is intended for stakeholders, developers, testers, and deployment teams.

## 2. Scope

The system will provide:
- A multilingual voice-first mobile/USSD/web-accessible platform for farmers with low literacy and limited smartphone penetration.
- User roles: Farmer (primary), Extension Officer, NGO/Administrator, Buyer, System Administrator.
- Core services: loan application and tracking, land registration linkage, market price feeds, weather forecasts, educational content (voice & SMS), direct messaging and marketplace listing.

The platform will be deployed initially in selected districts in Malawi (Kasungu, Dowa, Dedza) with plans to scale.

## 3. Definitions, Acronyms and Abbreviations

- USSD: Unstructured Supplementary Service Data
- IVR: Interactive Voice Response
- OTP: One-Time Password
- NGO: Non-Governmental Organization
- API: Application Programming Interface

## 4. Overall Description

### 4.1 Product perspective
The AgriWomen Voice Platform integrates with external services (weather API, market price feeds, mobile money providers, SMS/IVR gateways) and includes a web admin portal for NGOs/extension officers.

### 4.2 User characteristics
- Farmers: Low-to-medium digital literacy. Some have feature phones only.
- Extension officers / NGOs: Moderate digital literacy; use web portal and mobile app.
- Buyers: Use a web or lightweight mobile interface to browse listings and contact farmers.

### 4.3 Constraints
- Intermittent internet in rural areas — must support offline/low-bandwidth modes and USSD/IVR.
- Limited device capabilities — support feature phones via USSD/IVR and smartphones via web/Next.js front-end.
- Data privacy and consent required for personal and land records.

## 5. System Features (high level)

1. Farmer Registration & Profile
   - Register via USSD/IVR/SMS or web; verify identity via OTP or local verification.
   - Capture: name, village, contact number, farm location (GPS or manual), crop types, land documents (scans/photos where possible).

2. Loan Application & Tracking
   - Farmers submit loan requests; system evaluates using configurable eligibility rules and forwards to partner lenders.
   - Status updates via voice, SMS and portal.

3. Land Registration Interface
   - Farmers submit metadata about land plots; integration points to local land registries or manual verification flows with extension officers.

4. Weather Forecasting
   - Daily and weekly localized weather updates (text and voice). Alerts for severe weather.

5. Market Price Feed
   - Real-time/near real-time market prices for key crops; push notifications and voice summaries.

6. Education & Knowledge Base
   - Audio-first micro-lessons (IVR), SMS tips, and downloadable content for smartphones.

7. Marketplace & Buyer Connect
   - Farmers can list produce (voice-assisted), buyers can search and contact farmers; negotiation and messaging channel.

8. Messaging & Notifications
   - SMS, IVR/voice notifications and push notifications for smartphone users.

9. Admin Portal
   - NGO/extension/administrator dashboards, analytics, user management and content management.

## 6. Functional Requirements (selected, numbered)

FR-1: User Registration
- FR-1.1: The system SHALL allow farmers to register via USSD, IVR, SMS, or web form.
- FR-1.2: The system SHALL verify phone numbers via OTP or voice confirmation.

FR-2: Loan Requests
- FR-2.1: The system SHALL accept loan details (amount, purpose, repayment period) and store an application record.
- FR-2.2: The system SHALL forward applications to configured lenders and record responses.
- FR-2.3: The system SHALL provide status updates via voice/SMS.

FR-3: Weather Service
- FR-3.1: The system SHALL fetch localized weather data daily from a configured weather API.
- FR-3.2: The system SHALL allow users to subscribe to daily or event-based voice/SMS weather alerts.

FR-4: Market Prices
- FR-4.1: The system SHALL ingest market price feeds (partner APIs or manual admin entry) and present prices by crop and market.
- FR-4.2: The system SHALL allow push of top-of-day summary to subscribed farmers.

FR-5: Voice-driven Content
- FR-5.1: The system SHALL support IVR menus for core actions (register, hear market, hear weather, list product, request loan).
- FR-5.2: The system SHALL provide recorded micro-lessons that can be accessed via IVR.

FR-6: Messaging and Marketplace
- FR-6.1: Farmers SHALL be able to create product listings via guided IVR or via web form.
- FR-6.2: Buyers SHALL be able to view listings and initiate contact.

FR-7: Admin & Reporting
- FR-7.1: Admins SHALL be able to manage content, view usage analytics, and export reports (CSV/PDF).

## 7. Non-functional Requirements

NFR-1: Availability
- The system SHALL be available 99% monthly for core services (excluding scheduled maintenance).

NFR-2: Performance
- API responses for core endpoints SHALL be under 2 seconds under normal load.
- IVR menu response and call handling SHALL have minimal latency (< 1s where possible).

NFR-3: Scalability
- System SHALL support horizontal scaling of web/API and messaging components to handle region-wide adoption.

NFR-4: Security & Privacy
- Personal data SHALL be stored encrypted at rest. Communication SHALL use TLS.
- Role-based access control (RBAC) for admin and NGO users.
- Comply with local data protection laws and obtain user consent for data capture.

NFR-5: Usability
- Voice/IVR flows SHALL be available in local languages; messages SHALL be short and clear.
- Mobile/web UI SHALL follow accessibility best practices (WCAG basics).

NFR-6: Maintainability
- Codebase SHALL be version-controlled (git) with CI/CD pipelines and automated tests for core flows.

## 8. System Architecture (overview)

- Frontend: Next.js + Tailwind for web/smartphone. Lightweight JS client for offline caching.
- Voice/USSD Layer: IVR gateway provider (e.g., Twilio/ local telco aggregator) and USSD gateway.
- Backend: RESTful API (Laravel or Node.js) connecting to MySQL/Postgres.
- External integrations: Weather API, Market feed API, Mobile money APIs, SMS gateway.
- Data store: Relational DB for accounts, listings, transactions; object store for media.
- Analytics: Lightweight event pipeline (e.g., server-side events -> queue -> BI exports).

(Diagram: recommended to create a system context diagram and component diagram in design phase.)

## 9. Data Model (summary)

Primary entities:
- User (farmer, extension, admin)
- Farm / Plot (location, size, documents)
- LoanApplication (applicant_id, amount, status, lender_response)
- Listing (farmer_id, crop, quantity, price, status)
- WeatherSubscription
- MarketPrice (crop, market, price, date)

## 10. Use Cases (sample)

UC-01: Farmer registers by phone via IVR
UC-02: Farmer lists produce using IVR-guided prompts
UC-03: Farmer subscribes to daily weather via SMS
UC-04: Buyer searches listings and contacts farmer
UC-05: NGO admin pushes training module and views engagement metrics

Each use case should be expanded into flow steps and test cases during design.

## 11. Acceptance Criteria

- Registration: 90% of test farmers successfully register via IVR using a test script.
- Weather feed: Localized forecast delivered within 24 hours of provider update.
- Market feed: Admin can create or import price for 50 crops and push summary to subscribers.
- Loan workflow: End-to-end submission and lender response recorded in 95% of tests.

## 12. Risks & Mitigations

- Poor network connectivity -> Use USSD/IVR and retry/queue mechanisms.
- Low literacy -> Voice-first design and local language content.
- Data privacy -> Minimize PII, encrypt data, and obtain consent.

## 13. Next Steps

- Stakeholder review and sign-off of SRS.
- Create detailed design: wireframes, DFD, ERD, sequence diagrams.
- Prototype IVR flows and run small field pilot with ~200 farmers.

---

Appendix: References and external APIs should be documented during detailed design.
