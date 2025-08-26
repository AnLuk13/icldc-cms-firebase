# ICLDC CMS

A modern Content Management System built with Next.js, TypeScript, and Tailwind CSS.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/anluk13s-projects/v0-no-content)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/QZF4oZkf6cX)

## Overview

This is a multilingual CMS application supporting Romanian, Russian, and English languages. It provides management interfaces for:

- Events
- News articles
- Partners
- Projects
- Home page content
- User authentication

## Environment Setup

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Update the environment variables in `.env.local`:

   ```env
   # API Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/icldc-cms

   # Authentication
   JWT_SECRET=your-secret-key-here-change-in-production

   # Environment
   NODE_ENV=development
   ```

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Set up environment variables (see Environment Setup above)

3. Run the development server:

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Default Login Credentials

- **Admin User**: admin@example.com / password123
- **Editor User**: editor@example.com / password123

## Features

- **Multilingual Support**: Full support for Romanian, Russian, and English
- **Authentication**: JWT-based authentication with role management
- **Content Management**: Manage events, news, partners, projects, and home content
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type Safety**: Full TypeScript support
- **API Integration**: Centralized API configuration with environment-based URLs

## API Configuration

The application uses `NEXT_PUBLIC_APP_URL` environment variable to configure API endpoints. This allows for:

- **Development**: Point to localhost (`http://localhost:3000`)
- **Staging**: Point to staging server
- **Production**: Point to production server

All API calls are centralized in `lib/api.ts` and automatically adapt to the configured API URL.

## Deployment

Your project is live at:

**[https://vercel.com/anluk13s-projects/v0-no-content](https://vercel.com/anluk13s-projects/v0-no-content)**

For deployment, make sure to set the environment variables in your hosting platform.

## Development

Continue building your app on:

**[https://v0.app/chat/projects/QZF4oZkf6cX](https://v0.app/chat/projects/QZF4oZkf6cX)**

## Project Structure

```
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── events/         # Events management
│   ├── news/           # News management
│   ├── partners/       # Partners management
│   ├── projects/       # Projects management
│   ├── home-content/   # Home page content
│   └── login/          # Authentication
├── components/         # Reusable components
├── lib/               # Utilities and configurations
├── hooks/             # Custom React hooks
└── public/            # Static assets
```
