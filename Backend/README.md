# GrowKM Backend

This directory contains the source code for the GrowKM Backend.

---

## 🚀 Backend Setup & Installation

The GrowKM Backend is built using **Hono** (TypeScript), **Bun**, **Supabase** (PostgreSQL + pgvector), and **Azure OpenAI**.

### 1. Prerequisites
Ensure you have the following tools installed on your local machine:
- [Bun](https://bun.sh/) (used as both the package manager and runtime)
- Supabase Project (for Database, Auth, and Vector Store)

### 2. Installation
Open your terminal, navigate to the `Backend` directory, and install all dependencies:
```bash
cd Backend
bun install
```

### 3. Environment Variables
Duplicate the `.env.example` file to create your local `.env` file, then fill in the values:
```bash
cp .env.example .env
```
*(Ensure that your API Keys for Supabase, Gemini, and Azure OpenAI are correctly filled in)*

### 4. Running the Development Server
To start the local development server with hot-reload enabled:
```bash
bun run dev
```
The server will be available at `http://localhost:3000`.

---

## 📚 API Documentation (Scalar UI)

The GrowKM Backend utilizes **Scalar** (a modern API client) which is auto-generated from Zod OpenAPI schemas.

After starting the development server, you can access the interactive API documentation at:

👉 **[http://localhost:3000/reference](http://localhost:3000/reference)**

### How to Test Authenticated (Protected) APIs in Scalar:
1. Open the Scalar UI, locate the **"Auth"** category, and click on the **`Login (Proxy to Supabase)`** endpoint.
2. Enter the email and password of a test user, then click **Send**.
3. In the Response tab, locate and copy the value of the `"access_token"`.
4. In the top-left corner of the Scalar interface, click the **Authorize** button (the Padlock icon).
5. Paste the copied token into the Bearer Token field.
6. Done! You can now execute protected endpoints (like the Users module) without needing to manually input the token again.
