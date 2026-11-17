# Shamal El-Hejaz (shamalelhejaz)

A full-stack web application built with Next.js App Router, Prisma, and Supabase, featuring Stitch-designed UI screens and automated tests.

## Executive Summary & Purpose
shamalelhejaz powers the Shamal El-Hejaz digital platform, combining a modern React/Next.js frontend with Prisma ORM and Supabase backend services.

## Architecture & Tech Stack
- **Framework**: Next.js (App Router) & TypeScript
- **Database & ORM**: Prisma (prisma/) & Supabase (supabase/)
- **Testing**: __tests__/

## Project Structure
``text
├── app/              # Next.js App Router pages & API routes
├── components/       # Reusable UI components
├── context/          # React context providers
├── lib/              # Shared utilities & database clients
├── prisma/           # Prisma schema & migrations
├── supabase/         # Supabase configuration
├── stitch_screens/   # UI screen designs
└── __tests__/        # Automated test suite
``

## Getting Started
``bash
git clone https://github.com/islamsamyy/shamalelhejaz.git
cd shamalelhejaz
npm install
npm run dev
``
