# EVOCOM

CCTV supply and installation site for Montalban, Rizal. Customers build a quote list and request an installation. The office prices it, records the 70% down payment, schedules the work, and starts a one-year warranty when the project is complete.

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | React, TypeScript, Tailwind CSS |
| Backend | Laravel, PHP |
| Database | PostgreSQL |
| API | REST, JSON |
| Version control | Git and GitHub |

## How the code matches the system

`frontend/` is the presentation layer.

- Public pages: home, about, product catalog, contact.
- Quote list kept in the browser, then a request form.
- Ocular requests store customer details only. Non-ocular requests also upload a JPG, PNG, or MP4.
- Admin desk: request table, status changes, media viewer, notes, technician calendar, catalog manager.

`backend/` is the application layer.

- `QuoteIntakeController` and `QuoteRequestService` accept a new request.
- `FileHandlingService` stores layout images in `layout_plans` and videos in `site_videos`.
- `StatusStateEngine` allows pending and active to switch, then quoted, awaiting the 70% down payment, scheduled, installing, and completed.
- `WarrantyLogicEngine` opens a one-year warranty when a project is completed.
- `NoteController` appends notes. `ScheduleController` assigns a technician and a time.

`database/migrations` is the storage layer: products, technicians, quote requests, line items, media, notes, warranties, schedules, and status history.

## Run it

Requirements: PHP 8.3 or newer (with `pdo_pgsql`, `bcmath`, `mbstring`, `openssl`, `tokenizer`, `xml`, `curl`, `zip`), Composer, Node.js, and PostgreSQL 16.

```bash
docker compose up -d
```

That starts PostgreSQL with database `evocom`, user `evocom`, password `evocom`.

```bash
cd backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

```bash
cd frontend
npm install
npm run dev
```

The site is at http://127.0.0.1:5173 and the API at http://127.0.0.1:8000.

Local admin sign-in, from the seeder:

- Email: `admin@evocom.local`
- Password: `password`

Change that password before this is used outside your machine.

Phone, email, Facebook, and Viber on the public site are placeholders in `frontend/src/config.ts`.

## Quotation path

1. A visitor adds cameras to the quote list. Catalog prices are approximate.
2. They choose an ocular visit or a non-ocular layout upload, then send their name, phone, email, and site location.
3. The request lands as **pending**.
4. Admin marks it **active** for the inspection or layout review.
5. Final line prices move it to **quoted**.
6. When the client agrees, status becomes **awaiting the 70% down payment**.
7. After that payment is recorded, installation gets a start date and a promised completion date.
8. **Installing**, then **completed**. Completion starts the one-year warranty.
