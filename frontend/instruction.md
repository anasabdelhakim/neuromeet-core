# NeuroMeet Frontend Architecture Guidelines

This document outlines the strict architectural, coding, and styling standards for the NeuroMeet Next.js frontend. All code additions and refactoring must adhere to these rules.

## 1. Directory Structure (Feature-Based)
The frontend uses a strict feature-driven architecture. 
Code must be placed in `src/features/[feature-name]/`.

Inside a feature folder, you must **strictly** use the following subdirectories:
- `components/` (React components only)
- `actions/` (Next.js Server Actions only)
- `types/` (TypeScript interfaces and types)
- `constants/` (Static data, dummy data, configuration)
- `helpers/` (Utility functions specific to the feature)
- `wrappers/` (Layout or context providers)

**Rules:**
- **No Redundant Naming**: Do not nest features redundantly (e.g., `features/groups/actions/student-groups-actions.ts` is WRONG. Use `features/groups/actions/groups-actions.ts`).
- **No Direct Files in Feature Root**: All files must live in one of the categorized subdirectories above.

## 2. Data Flow & Server Actions (BFF Pattern)
The frontend acts as a Backend-For-Frontend (BFF) connecting to the NestJS API.
- **Never fetch directly from components** using `axios` or native `fetch` with raw URLs. Always use the `api-client.ts` wrapper.
- **No `onSubmit` Client Mutations**: Never use `onSubmit` with client-side API calls for form mutations.
- **Always use Server Actions**: Use `<form action={submitAction}>` paired with React 19's `useActionState` for all data mutations.

## 3. Types and Validations
- **No Inline Types**: Never put `interface` or `type` definitions directly in a component file unless it is a generic sub-type strictly local to that component's props. Export all shared domain types from the feature's `types/` directory.
- **Centralized Zod Schemas**: Form validation schemas must **never** be defined inline inside components or action files. All Zod schemas must be centralized in `src/validations/zod.ts`.

## 4. Styling and Tailwind Standards
- **Use Custom Tokens ONLY**: Never use arbitrary Tailwind values (e.g., `w-[800px]`, `text-[#FF0000]`).
- **No Arbitrary Opacities**: Never use fractional opacity classes (e.g., `bg-white/5`, `destructive/10`, `border-border/50`). 
- **Semantic Variables**: Always use the semantic CSS variables defined in `globals.css` (e.g., `bg-white-soft-deep`, `bg-destructive-soft`, `bg-black-soft-subtle`).
- **Inheritance & Reuse**: If a component is used across multiple dashboards (e.g., Instructor and Student), move it to `features/dashboard-shared/components` or `src/components/ui`. Do not duplicate code.

## 5. UI Components & Libraries
- **No Sonner**: Do not use `sonner` for toast notifications unless explicitly integrated via the global UI standard. Use the app's established error handling UI.
- **Shadcn UI**: Rely heavily on the `src/components/ui/` components. Inherit their variants rather than rewriting custom logic.
