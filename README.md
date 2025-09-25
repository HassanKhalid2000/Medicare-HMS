# MediCore HMS - Hospital Management System

A comprehensive, web-based Hospital Management System designed to digitize and streamline all hospital operations including patient management, appointments, billing, pharmacy, laboratory services, and administrative functions.

## 🏗️ Architecture

- **Frontend**: Next.js 14+ with TypeScript and App Router
- **Backend**: NestJS with TypeScript
- **Database**: MySQL 8.0+ with Prisma ORM
- **Cache**: Redis
- **UI**: shadcn/ui + Tailwind CSS
- **Authentication**: JWT + NextAuth.js

## 📁 Project Structure

```
├── frontend/          # Next.js application
├── backend/           # NestJS API server
├── shared/            # Shared types and utilities
├── docs/              # Documentation
└── docker/            # Docker configurations
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Redis
- Docker (optional)

### Development Setup

1. Clone the repository
2. Install dependencies in both frontend and backend
3. Set up environment variables
4. Run database migrations
5. Start development servers

## 📋 Features

- **👥 Patient Management**: Registration, medical records, search
- **👨‍⚕️ Doctor Management**: Profiles, specializations, schedules
- **📅 Appointment Scheduling**: Calendar views, time slots, notifications
- **💰 Billing System**: Invoice generation, payment tracking
- **🏥 Admission Management**: Inpatient care, ward assignments
- **💊 Pharmacy**: Inventory management, prescriptions
- **🔬 Laboratory**: Test management, results, reports
- **📊 Dashboard**: Real-time analytics and insights

## 🔐 Security

- JWT-based authentication
- Role-based access control (Admin, Doctor, Nurse, Receptionist)
- Data encryption and secure API endpoints
- Input validation and sanitization

## 📈 Performance

- Optimized for 100+ concurrent users
- Database indexing and query optimization
- Redis caching for improved response times
- Mobile-responsive design

## 🧪 Testing

- Unit tests with 80%+ coverage
- Integration tests for API endpoints
- E2E tests for critical user journeys

## 📄 License

© 2024 MediCore HMS. All rights reserved.