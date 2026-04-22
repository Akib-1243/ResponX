# ResponX 🚨
### Real-Time Crisis & Disaster Resource Coordination Platform

> A MERN stack web application designed to address the coordination failures that worsen disaster response outcomes — built for flood and cyclone-prone regions like Bangladesh.

---

## 📌 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [User Roles](#user-roles)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Pages & Routes](#pages--routes)
- [Getting Started](#getting-started)
- [Carbon Footprint](#carbon-footprint)
- [Societal Impact](#societal-impact)
- [Future Roadmap](#future-roadmap)
- [Team](#team)

---

## About the Project

During floods, cyclones, or sudden natural disasters in Bangladesh and similar developing nations, communication and resource distribution become critically chaotic. Existing infrastructure fails precisely when it is needed most.

**ResponX** solves this by providing a single, centralized, real-time web platform that connects:
- 🆘 **Displaced victims** seeking shelter, food, and medical aid
- 🙋 **Volunteers** who need to know where they are needed most
- 🏢 **NGO coordinators** who require real-time data for resource allocation
- 🛡️ **Admins** who verify information and prevent misinformation

---

## Features

- **Real-Time Shelter Tracking** — Live occupancy data with colour-coded capacity bars (green / orange / red)
- **Aid Request System** — Structured request submission with urgency levels and volunteer assignment
- **Volunteer Hub** — Task management with Available / My Tasks / All views and one-click acceptance
- **Missing Persons Registry** — Centralised registry with photo upload, vulnerability tagging, and Mark Found action
- **Role-Based Access Control** — Separate permissions for Requesters, Volunteers, and Admins
- **Admin Panel** — Full user management, shelter creation, and system oversight
- **Carbon Report** — Built-in environmental impact analysis using the Sustainable Web Design model
- **Live Stats Ticker** — Real-time statistics on the public landing page

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT (JSON Web Tokens) |
| Real-Time Updates | Polling / Socket.io |

---

## System Architecture

```
Client (React.js)
       │
       │  REST API (JSON)
       ▼
Server (Node.js + Express.js)
       │
       │  Mongoose ODM
       ▼
Database (MongoDB)
```

- **Frontend** handles UI rendering, client-side routing, and state management
- **Backend** exposes a RESTful API, enforces business logic, and manages authentication
- **Database** persists all application data with Mongoose schema validation
- **JWT** provides stateless, secure session management with a 7-day token expiry

---

## User Roles

| Role | Key Capabilities |
|---|---|
| **Requester** | Submit aid requests, view shelters, report missing persons |
| **Volunteer** | View & accept aid tasks, manage own tasks, mark persons as found |
| **Admin** | All above + manage users, create shelters, delete records |

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create a new user account |
| POST | `/api/auth/login` | Public | Authenticate and receive JWT |

### Shelters
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/shelters` | Authenticated | List all shelters with occupancy |
| POST | `/api/shelters` | Admin | Create a new shelter |
| PATCH | `/api/shelters/:id` | Admin | Update shelter capacity/status |

### Aid Requests
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/aid-requests` | Authenticated | Get all aid requests (filterable) |
| POST | `/api/aid-requests` | Requester | Submit a new aid request |
| PATCH | `/api/aid-requests/:id/accept` | Volunteer | Accept a task |
| PATCH | `/api/aid-requests/:id/resolve` | Volunteer/Admin | Mark resolved |

### Missing Persons
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/missing-persons` | Authenticated | List all missing person reports |
| POST | `/api/missing-persons` | Authenticated | Submit a new report |
| PATCH | `/api/missing-persons/:id/found` | Volunteer/Admin | Mark person as found |

### Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/users` | Admin | Get all users |
| DELETE | `/api/admin/users/:id` | Admin | Remove a user |

---

## Database Schema

<details>
<summary><strong>User</strong></summary>

| Field | Type | Description |
|---|---|---|
| fullName | String | User's full name |
| email | String (unique) | Login credential |
| password | String | bcrypt hashed (salt rounds: 10) |
| role | Enum | `requester` / `volunteer` / `admin` |
| isVerified | Boolean | Admin-granted trusted status |
| createdAt | Date | Account creation timestamp |

</details>

<details>
<summary><strong>AidRequest</strong></summary>

| Field | Type | Description |
|---|---|---|
| requestType | String | Medical Supplies / Food / Rescue / etc. |
| urgency | Enum | `critical` / `high` / `normal` |
| description | String | Detailed description of need |
| location | String | Geographic location |
| peopleAffected | Number | Estimated affected population |
| status | Enum | `open` / `in-progress` / `resolved` |
| submittedBy | ObjectId | Requesting user |
| assignedVolunteer | ObjectId | Volunteer who accepted the task |

</details>

<details>
<summary><strong>Shelter</strong></summary>

| Field | Type | Description |
|---|---|---|
| name | String | Shelter name |
| location | String | Physical address or area |
| capacity | Number | Maximum occupancy |
| currentOccupancy | Number | Current number of occupants |
| status | Enum | `open` / `closed` / `full` |
| createdBy | ObjectId | Admin who created the record |

</details>

<details>
<summary><strong>MissingPerson</strong></summary>

| Field | Type | Description |
|---|---|---|
| fullName | String | Name of missing person |
| age | Number | Age |
| gender | Enum | `male` / `female` / `other` |
| vulnerability | Enum | `none` / `child` / `elderly` / `medical` |
| lastLocation | String | Last known location |
| description | String | Physical description / clothing |
| contactNumber | String | Reporter contact |
| urgency | Enum | `critical` / `high` / `normal` |
| status | Enum | `missing` / `found` |
| reportedBy | ObjectId | Who filed the report |

</details>

---

## Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Landing Page | Public marketing page with live stats ticker |
| `/login` | Login | JWT-based user authentication |
| `/register` | Register | New account creation with role selector |
| `/admin-login` | Admin Login | Restricted admin authentication |
| `/dashboard` | Overview | 6 stat cards, shelter status, missing persons summary |
| `/aid-request` | Request Aid | Aid request form with urgency toggle |
| `/volunteer` | Volunteer Hub | Task management with Available / My Tasks tabs |
| `/shelters` | Shelters | Shelter directory with capacity bars and status badges |
| `/missing-persons` | Missing Persons | Registry with photo cards and report form |
| `/admin` | Admin Panel | User table, recent requests, stat cards |
| `/carbon-report` | Carbon Report | CO2 emissions analysis and optimisation strategies |

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/responx.git
cd responx

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Environment Variables

Create a `.env` file in the `/server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Running the App

```bash
# Start the backend server
cd server
npm run dev

# Start the frontend (in a new terminal)
cd client
npm start
```

The app will be available at `http://localhost:3000`

---

## Carbon Footprint

ResponX includes a built-in carbon analysis using the **Sustainable Web Design (SWD)** model.

**Formula:**
```
CO2 (g) = Data Transfer (GB) × Energy Intensity (kWh/GB) × Carbon Intensity (gCO2/kWh) × 1000
```

| Page | Est. Transfer | Est. CO2/Visit |
|---|---|---|
| Landing Page | 320 KB | ~0.26 mg |
| Dashboard | 580 KB | ~0.47 mg |
| Volunteer Hub | 210 KB | ~0.17 mg |
| Missing Persons | 260 KB | ~0.21 mg |
| Aid Request Form | 95 KB | ~0.08 mg |

**Average session (3 pages): ~0.9–1.2 mg CO2** — below the industry average of 1.76 g per page view.

Planned optimisations (WebP images, lazy loading, code splitting, service workers) are projected to reduce footprint by **30–50%**.

---

## Societal Impact

ResponX is designed specifically for disaster-prone regions like Bangladesh, where floods and cyclones displace hundreds of thousands annually.

- 🏠 **Victims** find available shelters with real-time capacity data
- 🚫 **Volunteers** avoid duplicate effort via smart task assignment
- ✅ **NGOs** gain live resource gap visibility without manual coordination
- 👪 **Families** use the Missing Persons Registry to locate separated members
- 🌍 **Environment** benefits from reduced unnecessary vehicle travel during relief ops

---

## Future Roadmap

- [ ] Interactive map integration (Leaflet.js)
- [ ] Push notifications for critical alerts
- [ ] Offline PWA support for disaster-zone connectivity
- [ ] Two-factor authentication for the Admin portal
- [ ] SMS-based aid request submission for feature phones

---

## Team

| Name | Student ID |
|---|---|
| Md Akib | 20230204118 |
| Meftahul Jannat Rachi | 20230204080 |
| Tarannum Tasnim | 20230204100 |

**Course:** CSE 2200 — Web Application Development, Spring 2025
**Institution:** Ahsanullah University of Science and Technology (AUST)
**Submitted to:** Atiqur Rahman & Mr. Ashek Seum

---

> *"ResponX demonstrates that a well-architected web application can deliver meaningful real-world impact in high-stakes environments."*
