# CareSlot — Project Instructions for AI Coding Agent

## 1. Project Overview

Build and deploy **CareSlot**, a clinic appointment booking application consisting of a REST API and a simple web frontend.

The application allows patients to:
- View available appointment slots.
- Book an available appointment.
- Retrieve booking details and confirmation.
- Cancel an existing booking (Level 3).
- View paginated booking history (Level 4).

The application must satisfy the five assessment levels progressively. Each level must be properly implemented and tested before moving to the next.

### Primary objective

Follow the official technical specification strictly:

https://koyaacademy.com/assessment-api

This document defines the implementation approach, architecture, technologies, engineering practices, and development workflow.

**The official technical specification takes precedence over any assumptions in this document.** Do not invent or modify API endpoint paths, request fields, response formats, authentication headers, error codes, or status codes.

---

## 2. Technology Stack

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- Neon PostgreSQL
- Zod for request validation
- pnpm
- Vitest and Supertest for testing

### Frontend

- Astro
- TypeScript
- Tailwind CSS
- shadcn/ui
- pnpm

Initialize shadcn using this exact command:

```bash
pnpm dlx shadcn@latest init --preset b1YnRHRdQ --template astro --pointer
```

Use Astro components for the frontend. Do not introduce React or Next.js.

Use client-side JavaScript only where interactivity requires it. Keep the frontend lightweight.

### Infrastructure

- Database: Neon PostgreSQL (free tier).
- Backend hosting: Render or another suitable free Node.js hosting provider.
- Frontend hosting: Vercel or Netlify.
- Version control: Git and GitHub.

The backend and frontend should be independently deployable.

---

## 3. Monorepo Architecture

Use pnpm workspaces.

Expected initial structure:

```text
careslot/
├── apps/
│   ├── api/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── middleware/
│   │   │   ├── modules/
│   │   │   │   ├── slots/
│   │   │   │   └── bookings/
│   │   │   ├── routes/
│   │   │   ├── utils/
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   ├── tests/
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/
│       ├── public/
│       ├── src/
│       │   ├── components/
│       │   ├── layouts/
│       │   ├── pages/
│       │   ├── lib/
│       │   └── styles/
│       ├── package.json
│       └── astro.config.mjs
│
├── packages/
│   └── config/              # Shared configurations if needed
│
├── package.json
├── pnpm-workspace.yaml
├── .gitignore
└── README.md
```

Keep the backend and frontend logically separated. Avoid unnecessary abstractions or packages.

Shared types and validation schemas may be introduced if they provide genuine value, but do not create complexity just for the sake of sharing code.

---

## 4. Mandatory Development Rules

The following instructions must be followed throughout development.

1. Use TypeScript throughout the backend and frontend.
2. Use pnpm for all package installations and scripts.
3. Use Prisma for database access. Do not introduce another ORM.
4. Never store booking data in application memory, local files, or frontend storage as the source of truth.
5. PostgreSQL must remain the source of truth for all bookings.
6. Validate all incoming request data on the backend.
7. Handle errors consistently and return the exact error formats required by the technical specification.
8. Keep secrets in environment variables. Never commit `.env` files.
9. Do not expose the API key or database connection string to the frontend.
10. Write meaningful tests for every important business operation.
11. Avoid unnecessary dependencies.
12. Do not silently skip a requirement or implement a temporary workaround without reporting it.

### Important: Incremental execution and approval

This is a strict requirement.

Work through the implementation in small, clearly defined steps.

**After completing each step:**

1. Explain what was implemented.
2. List the important files created or modified.
3. Explain the technical decisions made.
4. Run the relevant checks and tests.
5. Report the test results.
6. Identify anything that requires my attention.
7. Stop and wait for my explicit approval before proceeding.

Do not automatically start the next step.

A response such as "continue", "proceed", or "approved" is authorization to start the next step.

If a step encounters a blocker, report it and wait for instructions instead of silently making assumptions.

Do not combine multiple steps simply because they appear straightforward.

---

# 5. Implementation Roadmap

Implement the following stages in order.

## Phase 0 — Understand the technical specification

Before writing application code, thoroughly inspect:

https://koyaacademy.com/assessment-api

Extract and document:

- All required endpoints.
- HTTP methods and endpoint paths.
- Required headers.
- Authentication requirements.
- Request body structures.
- Query parameters.
- Successful response structures.
- Error response structures.
- HTTP status codes.
- Booking cancellation requirements.
- Idempotency requirements.
- Pagination requirements.
- Rate-limiting requirements.

Create a temporary API contract reference in your working notes.

Map every endpoint to its corresponding assessment level.

Do not guess missing information. If the specification cannot be accessed, report this and request the specification from me.

**Deliverable:** A clear implementation checklist based on the actual technical specification.

Stop and wait for approval.

## Phase 1 — Project initialization

Set up the pnpm monorepo.

Tasks:

1. Initialize the root package.
2. Configure `pnpm-workspace.yaml`.
3. Create the `apps/api` directory.
4. Initialize Express with TypeScript.
5. Install and configure the backend dependencies.
6. Create the `apps/web` directory.
7. Initialize Astro with TypeScript.
8. Run the specified shadcn installation command.
9. Verify that both applications can start independently.
10. Add root-level development scripts where appropriate.

Suggested root scripts:

- `pnpm dev` — start both applications.
- `pnpm build` — build both applications.
- `pnpm test` — execute available tests.

Use an appropriate tool such as concurrently to run both applications during development.

**Deliverable:** A working monorepo with an independently running Express API and Astro frontend.

Stop and wait for approval.

## Phase 2 — Database configuration

Set up Neon PostgreSQL and connect Prisma.

Tasks:

1. Create a Neon PostgreSQL database.
2. Configure the database connection string.
3. Initialize Prisma in `apps/api`.
4. Configure Prisma to use PostgreSQL.
5. Add the appropriate environment variables.
6. Configure the Prisma client.
7. Test the database connection.

Use Neon’s pooled connection string for normal application queries where appropriate, and its direct connection string for migrations when required by the deployment configuration.

Never commit database credentials.

**Deliverable:** A working Prisma-to-Neon connection.

Stop and wait for approval.

## Phase 3 — Database schema design

Design the database schema based on the actual assessment requirements.

At minimum, consider the following entities:

### Slot

Represents an appointment slot.

Potential fields:

- id
- startTime
- endTime
- status
- createdAt
- updatedAt

### Booking

Represents a patient's appointment booking.

Potential fields:

- id
- slotId
- patient information required by the specification
- status
- createdAt
- updatedAt

### IdempotencyRecord

Required for Level 4.

Potential fields:

- id
- idempotencyKey
- requestHash
- response data or booking reference
- createdAt

Additional entities may be introduced if the technical specification requires them.

Important considerations:

- Use appropriate PostgreSQL types.
- Add primary keys and foreign keys.
- Add unique constraints and indexes.
- Prevent duplicate active bookings for the same slot.
- Ensure cancelled bookings do not permanently occupy slots.
- Choose appropriate deletion and update behavior.
- Use database-level constraints wherever possible.

Do not blindly copy the conceptual fields above. Finalize the schema based on the actual API contract.

Run the initial Prisma migration and verify that the database schema is correct.

**Deliverable:** A migrated, working database schema.

Stop and wait for approval.

---

# 6. Progressive API Implementation

Implement each assessment level independently and test it before proceeding.

## Level 1 — Basic booking functionality

Required functionality:

1. List available appointment slots.
2. Book an available slot.
3. Retrieve an existing booking.

Implementation tasks:

- Implement the slot module.
- Implement the booking module.
- Create the required Express routes.
- Connect routes to service functions.
- Implement Prisma database queries.
- Return the exact response formats specified by Koya.
- Ensure bookings persist between requests.

Create sample appointment slots in the database using a seed script or another suitable approach.

Do not hardcode available slots in the API response.

### Testing

Verify that:

- Available slots can be retrieved.
- A valid booking can be created.
- The booking can be retrieved.
- Booked slots no longer appear as available.
- Booking information persists after restarting the API.

**Level 1 must be fully working before moving on.**

Report the results and wait for approval.

## Level 2 — API authentication and validation

Implement API key authentication.

### API key authentication

- Read the expected API key from an environment variable.
- Validate incoming requests against the required authentication header from the technical specification.
- Implement authentication middleware.
- Reject missing API keys.
- Reject incorrect API keys.
- Ensure protected endpoints cannot be accessed without valid authentication.
- Never expose the API key to the frontend.

### Request validation

Use Zod to validate incoming requests.

Validate all required fields, including:

- Patient details.
- Slot identifiers.
- Required strings.
- Email and other specified formats.
- Any other fields defined in the technical specification.

Reject missing, malformed, or invalid values.

Return the exact validation error structure and status codes specified by Koya.

### Testing

Test:

- Missing API key.
- Invalid API key.
- Valid API key.
- Missing request fields.
- Invalid field formats.
- Invalid slot identifiers.
- Valid requests.

**Level 2 must be fully working before moving on.**

Report the results and wait for approval.

## Level 3 — Concurrency protection and cancellation

This level is particularly important.

Two patients must never successfully book the same appointment slot, even if both requests arrive at precisely the same time.

### Preventing double bookings

Do not rely on checking whether a slot is available before inserting a booking.

That approach is insufficient because two simultaneous requests can both pass the availability check.

Use PostgreSQL transactions and atomic database operations.

A recommended approach is:

1. Start a Prisma transaction.
2. Atomically update the requested slot only if it is still available.
3. Check the number of affected rows.
4. If no row was updated, reject the booking because the slot has already been taken.
5. If successful, create the booking within the same transaction.
6. Commit the transaction.

The slot claim and booking creation must succeed or fail together.

Use an appropriate conditional `updateMany` operation or another PostgreSQL-safe concurrency strategy.

Add database constraints as a second layer of protection where appropriate.

### Booking cancellation

Implement the cancellation endpoint exactly as specified.

Cancellation must:

- Identify the requested booking.
- Verify that it exists.
- Verify that it can be cancelled.
- Update its status appropriately.
- Release the associated slot.
- Persist the changes.

Cancellation must be transactional.

Do not delete the booking record simply to make the slot available. Preserve the booking history.

### Testing

Test:

- Two simultaneous booking requests for one slot.
- Only one request succeeds.
- The other request receives the appropriate conflict response.
- A cancelled booking releases its slot.
- A cancelled booking remains retrievable.
- A slot can be booked again after cancellation, if permitted by the specification.

Use concurrent requests in the tests, not just sequential requests.

**Level 3 must be fully working before moving on.**

Report the results and wait for approval.

## Level 4 — Idempotency and booking pagination

### Idempotency

Implement retry-safe booking requests.

The purpose is to prevent duplicate bookings when a client retries a request because of a timeout, lost response, or network failure.

Use the idempotency header or request field defined in the official specification.

Recommended implementation:

1. Receive the idempotency key.
2. Calculate a deterministic hash of the validated request payload.
3. Check whether the key already exists.
4. If the key exists and the request hash matches, return the original booking result.
5. If the key exists but the request hash differs, return the appropriate conflict response.
6. If the key does not exist, process the booking.
7. Persist the idempotency record and booking atomically.

### Important concurrency consideration

Two identical requests using the same idempotency key may arrive simultaneously.

The implementation must prevent both from creating separate bookings.

Use a unique database constraint on the idempotency key and handle concurrent insert conflicts safely.

The idempotency record and booking creation must be coordinated transactionally.

Do not implement idempotency using an in-memory JavaScript Map or object.

Do not accidentally return an unrelated previous booking simply because a key was reused.

Ensure failed booking attempts do not leave misleading successful idempotency records.

### Booking pagination

Implement the booking listing endpoint with pagination according to the technical specification.

Requirements:

- Support the specified page or cursor parameters.
- Return the appropriate booking records.
- Include pagination metadata where required.
- Apply a sensible maximum page size if compatible with the specification.
- Use stable ordering.
- Add database indexes where useful.

Prefer cursor-based pagination if the specification permits it.

### Testing

Test:

- Repeating an identical request with the same key.
- Confirming that only one booking is created.
- Reusing a key with different request data.
- Simultaneous requests using the same key.
- Pagination across multiple pages.
- Empty results.
- Invalid pagination parameters.

**Level 4 must be fully working before moving on.**

Report the results and wait for approval.

## Level 5 — Rate limiting and spam protection

Implement rate limiting to prevent booking abuse.

Requirements:

- Apply rate limits to booking-related endpoints.
- Identify clients using a reliable IP-address strategy.
- Consider the API key and IP address when deciding how to limit requests.
- Configure sensible request limits and time windows.
- Return the appropriate HTTP status and response structure when a client exceeds the limit.
- Ensure legitimate users can still book appointments.

Use a persistent or shared rate-limiting store if the hosting architecture requires it.

Do not rely exclusively on in-memory rate limiting if the application will run across multiple instances or serverless functions.

Redis with a suitable free-tier provider, such as Upstash, is an option. A PostgreSQL-backed implementation is another option if it is appropriate for the assessment.

Also consider:

- Request body size limits.
- Basic security headers.
- CORS restrictions.
- Sensible request timeouts.

### Testing

Test:

- Requests below the configured limit.
- Requests exceeding the configured limit.
- Rate-limit reset behavior.
- Multiple clients.
- Correct error responses.

**Level 5 must be fully working before moving on.**

Report the results and wait for approval.

---

# 7. Frontend Implementation

Build a simple, clean, responsive clinic booking interface using Astro and shadcn/ui.

The frontend is primarily a demonstration interface for the API.

Do not over-engineer it.

### Required pages and functionality

#### Booking page

Display:

- CareSlot branding.
- A list of available appointment slots.
- Date and time information.
- A booking action for each available slot.

#### Booking form

Collect the patient information required by the official API specification.

Validate user input before submission, while retaining backend validation as the authoritative validation layer.

#### Booking confirmation

After a successful booking, display:

- Confirmation message.
- Booking reference or ID.
- Appointment date and time.
- Patient details returned by the API.
- Any other confirmation information required by the specification.

#### Booking lookup

Provide a simple way to retrieve an existing booking using the required booking identifier.

#### Cancellation

Include cancellation functionality if it is supported by the API and required for the demonstration.

### Frontend integration rules

- All booking operations must go through the deployed Express API.
- Never connect directly to Neon from the frontend.
- Never expose the API secret in browser code.
- Use an environment variable for the API base URL.
- Handle loading, success, empty, and error states.
- Refresh available slots after a successful booking or cancellation.
- Prevent accidental duplicate form submissions.
- Follow the API response contract exactly.

If the API key is required by the assessment, configure the public-facing integration carefully. A key embedded in browser JavaScript is not secret. Do not represent it as secure authentication against arbitrary third-party callers. If necessary, use an Astro server-side proxy to keep the key on the server, subject to the deployment architecture.

**Deliverable:** A working Astro frontend integrated with the API.

Stop and wait for approval.

---

# 8. Testing and Quality Assurance

Before deployment, perform a complete review of the application.

### Backend testing

Use Vitest and Supertest.

Cover:

- All required endpoints.
- Authentication.
- Request validation.
- Booking creation.
- Booking lookup.
- Cancellation.
- Concurrent booking attempts.
- Idempotency.
- Pagination.
- Rate limiting.

Include integration tests against PostgreSQL for database-dependent behavior.

Concurrency and idempotency tests must exercise real database constraints and transactions, not just mocked Prisma methods.

### API verification

Compare every endpoint against the official Koya specification.

Verify:

- Exact endpoint paths.
- HTTP methods.
- Required headers.
- Request payloads.
- Response payloads.
- HTTP status codes.
- Error formats.

Do not make the API merely functionally similar. It must be compatible with the official contract.

### Frontend verification

Verify:

- Available slots load correctly.
- Booking submissions work.
- Confirmation information displays correctly.
- Booking lookup works.
- Cancellation works where implemented.
- Error messages are understandable.
- The interface works on mobile and desktop.

### Final checks

Run:

- TypeScript checks.
- Linting.
- Production builds.
- Automated tests.

Fix all critical errors before proceeding.

Stop and wait for approval.

---

# 9. Deployment

Deploy the backend and frontend independently.

### Backend deployment

Use Render or another appropriate hosting provider.

Tasks:

1. Connect the GitHub repository.
2. Configure the backend root directory as `apps/api`.
3. Configure the build command.
4. Configure the production start command.
5. Add environment variables.
6. Configure the Neon PostgreSQL connection.
7. Run Prisma migrations.
8. Verify the deployed API using its HTTPS URL.

Ensure migrations run as a deployment/release operation rather than every time the application starts.

Suggested environment variables:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=
DIRECT_URL=
API_KEY=
FRONTEND_URL=
```

Add other variables only when required.

### Frontend deployment

Deploy Astro to Vercel or Netlify.

Tasks:

1. Connect the GitHub repository.
2. Configure the frontend root directory as `apps/web`.
3. Configure the build command.
4. Set the production API base URL.
5. Configure any required server-side environment variables.
6. Deploy.
7. Verify the deployed website.

### Post-deployment verification

Test the deployed application, not just the local environment.

Verify:

- HTTPS is working.
- The frontend can communicate with the backend.
- Database writes persist.
- Bookings remain available after subsequent requests.
- All required endpoints work.
- Authentication works.
- Concurrency protection works.
- Idempotency works.
- Pagination works.
- Rate limiting works.

**Deliverable:** A publicly accessible HTTPS frontend and API.

Stop and wait for approval.

---

# 10. Documentation and Submission

Create a comprehensive `README.md` containing:

1. Project overview.
2. Technology stack.
3. Architecture.
4. Monorepo structure.
5. Local installation instructions.
6. Environment variable documentation.
7. Database setup and migration instructions.
8. Development commands.
9. Testing instructions.
10. API endpoint reference matching the official specification.
11. Deployment URLs.
12. Implemented assessment levels.

Include example requests and responses where useful.

Clearly distinguish implemented features from features that were not completed.

Before submission, provide me with:

- GitHub repository URL.
- Deployed frontend URL.
- Deployed API URL.
- Test results.
- Completed assessment levels.
- Any outstanding issues.

After submission, do not make further changes to the deployed application or repository unless I explicitly authorize them.

The assessment instructions require the application to remain running and unchanged until Koya contacts us.

---

# 11. Engineering Considerations

These are important implementation principles to remember throughout the project.

### Database is the source of truth

Never rely on frontend state or backend memory to determine whether a slot has been booked.

### Concurrency is a database problem

Checking availability and subsequently inserting a booking as separate unprotected operations is not sufficient.

Use atomic database operations and transactions.

### Idempotency is different from duplicate detection

Idempotency identifies repeated attempts at the same operation using the same key.

It must not prevent a patient from making a legitimate new booking using a different key.

### Cancellation must preserve history

Do not physically delete cancelled bookings unless the specification explicitly requires it.

### Deployment must preserve data

Use Neon PostgreSQL for persistent storage. Never depend on a local SQLite database or filesystem storage in the deployed backend.

### API compatibility matters

The assessment's API specification is the contract. Do not rename fields, introduce alternative response structures, or change endpoint paths for personal preference.

---

# 12. Final Instruction to the Agent

You are responsible for implementing CareSlot as a working, production-deployed application.

Work methodically.

Prioritize correctness, API compatibility, database integrity, and reliable booking behavior over visual complexity.

Do not rush through the five assessment levels.

**Most importantly, implement only ONE development step at a time.**

After every completed step, report your progress and wait for my explicit approval before continuing.

Start with **Phase 0: Understanding the official technical specification**. Do not write application code until this phase is complete and approved.