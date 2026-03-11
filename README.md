# ADMIN PORTAL ADJIL

A standalone, enterprise-grade administration platform for the ADJIL BNPL (Buy Now Pay Later) system. Built with Next.js 18+, TypeScript, Tailwind CSS, and Supabase.

## 🎯 Overview

**ADMIN PORTAL ADJIL** is a centralized management platform specifically designed for ADJIL administrators to:

- Monitor and manage customer and merchant accounts
- Process and review transactions
- Handle dispute resolution
- Manage audit logs and compliance
- Control system access with RBAC (Role-Based Access Control)
- Ensure data security with masking and encryption features

## ✨ Key Features

### 1. **Authentication & Authorization**
- Secure login with Supabase authentication
- Role-Based Access Control (RBAC) with 3 levels:
  - **Admin**: Full system access
  - **Partner**: Bank partner access to merchant data
  - **Support**: Customer support team with limited access
- Session management and automatic logout on timeout

### 2. **Data Management**
- Real-time data synchronization with Supabase
- Support for:
  - Users & Accounts
  - Customers (with document verification)
  - Merchants (with KYC validation)
  - Transactions & Payments
  - Subscriptions
  - Disputes & Resolutions
- IndexedDB caching for offline support

### 3. **Security & Compliance**
- **Data Masking**: Automatic masking of sensitive information
  - Credit card numbers (show first 6 & last 4 digits)
  - Email addresses
  - Phone numbers
  - Document IDs
- **Audit Logs**: Complete tracking of admin actions
- **Screenshot Prevention**: Restrict sensitive data copying
- **Service Role Keys**: Admin-only database access via server-side operations

### 4. **User Interface**
- **Glassmorphism Design**: Modern, transparent UI with backdrop blur
- **Responsive Layout**: Mobile-friendly dashboard and navigation
- **Dark/Light Mode**: Theme switching support
- **RTL Support**: Full Arabic language support with right-to-left text direction

### 5. **Internationalization (i18n)**
- Multi-language support:
  - English (en)
  - العربية (ar)
  - Français (fr)
- Language detection and persistent selection
- Full RTL support for Arabic

## 🛠️ Technology Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 18+** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first CSS styling |
| **Supabase** | Backend-as-a-Service (BaaS) & PostgreSQL |
| **Zustand** | State management |
| **React Hook Form** | Form validation |
| **Zod** | Schema validation |
| **i18next** | Internationalization |
| **Lucide React** | Icon library |
| **Bun** | Fast JavaScript runtime & package manager |

## 📁 Project Structure

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** or **Bun 1.0+**
- **Supabase** account and project

### Installation

1. **Navigate to the project directory**
   ```bash
   cd adjil-admin-portal
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or with npm
   npm install
   ```

3. **Setup environment variables**

   Create `.env.local` in the project root:

   ```bash
   # Supabase Configuration (from your Supabase project settings)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

   # Server-side only (for admin operations)
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # App Configuration
   NEXT_PUBLIC_APP_NAME=ADMIN PORTAL ADJIL
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

4. **Start the development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

   The application will be available at: `http://localhost:3000`

## 📚 Database Setup (Supabase)

### Required Tables

Create the following tables in your Supabase PostgreSQL database.

## 🔐 Security Implementation

### Data Masking

Sensitive data is automatically masked using utilities in `src/utils/masking.ts`.

### Audit Logging

All admin actions are logged for compliance tracking.

## 🌐 Internationalization (i18n)

Switch languages in the UI. Current support:

- **English (en)**: Default
- **العربية (ar)**: Right-to-left text direction
- **Français (fr)**: European French

## 📦 Available Scripts

```bash
# Development
bun run dev         # Start dev server on http://localhost:3000

# Production
bun run build       # Build for production
bun run start       # Start production server

# Debugging & Testing
bun run lint        # Run ESLint
```

## 🚨 Common Issues

### "Invalid key" Error in IndexedDB

**Solution**:
1. Clear browser storage: DevTools > Application > Clear Storage
2. Verify data schema matches between projects

### React Key Warnings

**Ensure all lists use unique keys**:
```typescript
// ✅ Correct
{items.map((item) => <Component key={item.id} />)}
```

## 📝 Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📄 License

© 2026 ADJIL. All rights reserved.

---

**Last Updated**: March 6, 2026  
**Version**: 1.0.0  
**Status**: Production Ready
