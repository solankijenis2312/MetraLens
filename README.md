# MetraLens

**AI-assisted Legal Metrology Label Compliance Checker**
Built for **Smart India Hackathon 2026 — Problem Statement SIH26034**

> Sponsoring organization: Ministry of Consumer Affairs, Food & Public Distribution, Department of Consumer Affairs

---

## Problem Statement

Under the **Legal Metrology (Packaged Commodities) Rules, 2011**, every packaged product sold in India must legibly declare certain mandatory information on its label — manufacturer details, net quantity, MRP, manufacturing/expiry dates, and consumer care information. Checking whether a product's label actually follows these rules is currently done **manually** by inspectors, which is slow, inconsistent, and doesn't scale.

**MetraLens automates this check** — an inspector uploads or captures a photo of a product label, and the system reads the label, checks it against the mandatory declarations, and returns a compliance score with a detailed breakdown of what's missing or non-compliant.

---

## How It Works

1. **Officer signs in** with a role (Enforcement officer / Senior inspector / Field inspector / Administrator)
2. **Upload or capture label images** — front, back, and side panels of the product
3. **OCR extraction** — [Tesseract.js](https://github.com/naptha/tesseract.js) runs entirely in the browser to read text from the images
4. **Field extraction & rule matching** — extracted text is parsed to pull out manufacturer, net quantity, MRP, dates, etc., and checked against the Packaged Commodities Rules, 2011
5. **Compliance score & findings** — a score out of 100 is generated along with a list of every missing or non-compliant declaration
6. **Backend storage** — the result is sent to a Spring Boot REST API and saved in MySQL
7. **Reports & history** — inspectors can view past inspections on a dashboard and export a PDF report ([jsPDF](https://github.com/parallax/jsPDF)) as evidence

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| OCR (client-side) | Tesseract.js |
| PDF report generation | jsPDF |
| Backend | Spring Boot (Spring Web, Spring Data JPA, Spring Security) |
| Authentication | JWT (JSON Web Tokens) |
| Database | MySQL |

---

## User Roles

| Role | Responsibility |
|---|---|
| **Enforcement officer** | Full access — scans products, reviews results, generates reports |
| **Senior inspector** | Reviews and approves scans submitted by field staff, especially flagged/priority cases |
| **Field inspector** | Scans product labels on the ground and submits them for review |
| **Administrator** | Manages the inspection team and monitors overall analytics; does not perform scans |

---

## Project Structure

```
MetraLens/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── backend/
    ├── src/main/java/com/metralens/backend/
    │   ├── entity/          # User.java, etc.
    │   ├── repository/      # UserRepository.java, etc.
    │   ├── controller/      # AuthController.java, etc.
    │   ├── dto/             # RegisterRequest, LoginRequest, AuthResponse
    │   ├── security/        # JwtUtil.java, SecurityConfig.java
    │   └── BackendApplication.java
    └── src/main/resources/
        └── application.properties
```

---

## Getting Started

### Prerequisites
- Java 17+
- MySQL 8+
- A modern browser (Chrome/Edge/Firefox) — HTTPS or localhost recommended for camera access

### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/solankijenis2312/MetraLens.git
   cd MetraLens/backend
   ```

2. Create the database
   ```sql
   CREATE DATABASE metralens;
   ```

3. Configure `src/main/resources/application.properties`
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/metralens
   spring.datasource.username=root
   spring.datasource.password=yourpassword
   spring.jpa.hibernate.ddl-auto=update
   jwt.secret=replace_this_with_a_long_random_string_at_least_32_chars
   jwt.expiration=86400000
   ```

4. Run the application
   ```bash
   ./mvnw spring-boot:run
   ```
   The API will start on `http://localhost:8080`

### Frontend Setup

1. Open the `frontend/` folder
2. Serve it with a static server (e.g., VS Code Live Server extension) — avoid opening `index.html` directly via `file://`, since camera access and API calls need a proper origin
3. Make sure the API base URL in `script.js` matches your backend (`http://localhost:8080`)

---

## API Endpoints (current)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new officer account |
| POST | `/api/auth/login` | Log in and receive a JWT token |

*(More endpoints — scans, dashboard stats, team management — are in progress.)*

---

## Roadmap

- [x] Officer registration & login with JWT
- [ ] Save scan results to database
- [ ] Real inspection history & dashboard stats
- [ ] Team management CRUD
- [ ] Role-based access control on backend endpoints

---

## Disclaimer

This is a prototype built for the **SIH 2026 college-level round** and is a work in progress. OCR results are assistive only — an authorized officer must verify the physical label before taking any enforcement action.

---

## License

This project is submitted for Smart India Hackathon 2026 evaluation purposes.
