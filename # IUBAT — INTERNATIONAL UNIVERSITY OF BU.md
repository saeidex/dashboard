# IUBAT — INTERNATIONAL UNIVERSITY OF BUSINESS AGRICULTURE AND TECHNOLOGY
*Founded 1991 by Md. Alimullah Miyan*

## Complex Engineering Problem (CEP) and Complex Engineering Activities (CEA) Report

**Course Code and Title:** CSC 387 – System Analysis and Design  
**Semester:** Summer 2025  
**Course Instructor Name:** Md Saidur Rahman

---

### Student Information
| Field | Details |
| :--- | :--- |
| **Student Name** | [Enter Your Name Here] |
| **Student ID** | [Enter Your ID Here] |

---

### Part 1: Complex Engineering Problem (CEP) Attributes
*Which P’s are addressed? (Requirement: P1 is mandatory, plus some or all of P2 to P7)*

#### P1: Depth of Knowledge
*(Required: Depth of knowledge supported by one or more from K3, K4, K5, K6, or K8)*

**Knowledge Profiles Addressed (Check applicable):**
- [ ] **K2** (Math/Science Principles)
- [x] **K3** (Engineering Fundamentals)
- [x] **K4** (Specialist Knowledge)
- [x] **K5** (Engineering Design/Tools)

**Explanation of how P1 is addressed:**
> **K3 (Fundamentals):** Applied fundamental principles of software architecture and database design. We implemented a **RESTful API** standard using strict type validation ensuring data integrity across the system. We adhered to database normalization rules when designing the schema for entities like Users, Products, and Orders using **LibSQL (SQL-based)**.
>
> **K4 (Specialist Knowledge):** Utilized advanced modern web technologies including a **Monorepo Architecture** (PNPM Workspaces) to share logic between the backend (`apps/api`) and frontend (`apps/web`). We implemented strict type-safety across the network boundary using **Typescript**, **Zod**, and **Drizzle ORM** for Object-Relational Mapping.
>
> **K5 (Tools):** Leveraged **Docker** for containerization to ensure consistent deployment environments, **Vite** for optimized frontend build tooling, and **OpenAPI** specifications for automated documentation.

#### P2: Conflicting Requirements
**Explanation of how P2 is addressed:**
> We addressed the conflict between **strict security** and **user experience (UX)**. The system requires robust Role-Based Access Control (RBAC) to secure sensitive API endpoints (e.g., administrative customer data), which can often complicate the user interface. We resolved this by implementing **Better-Auth** for secure session management and middleware to validate permissions transparently, while the frontend (`apps/web`) uses **TanStack Query** to optimistically update the UI, providing a snappy experience even while security checks are performed in the background.

#### P3: Depth of Analysis
**Explanation of how P3 is addressed:**
> The project required deep analysis of data structures and API contracts. We modeled complex relationships between `Customers`, `Employees`, `Expenses`, and `Orders` using **Drizzle Schema definitions**. We analyzed the API requirements to generate automated **OpenAPI/Swagger documentation** from our Zod validators, ensuring that the implementation strictly matched the analyzed design specifications. We also broke down the application into modular domains (routes/controllers/services) to manage the complexity of the business logic.

---

### Part 2: Complex Engineering Activities (CEA) Attributes
*Which A’s are addressed? (Requirement: Some or all A1 to A5) [Only Relates to PO(j)]*

#### A1: Range of Resources
**Explanation of how A1 is addressed:**
> We utilized a wide range of professional engineering resources:
> *   **Software & Libraries:** Hono (Web Framework), React (UI), TanStack Router & Query (State Management), Radix UI (Accessible Components), and Drizzle (Database Toolkit).
> *   **Tools:** VS Code for development, Docker for container orchestration, and Git for version control.
> *   **Standards:** JSON Schema references for validation and OpenAPI standards for API documentation.

#### A2: Level of Interaction
**Explanation of how A2 is addressed:**
> The project involved a high level of interaction between different system components and architectural layers. We designed a shared `packages/api-client` to facilitate typed communication between the backend API and the frontend web application. This "contract-first" approach required resolving interactions between server-side validation logic and client-side form handling (using `react-hook-form`), ensuring seamless feedback loops for the end-user.

---

### Instructor Comments
*To be filled by the instructor*

___________________________________________________________________________
___________________________________________________________________________