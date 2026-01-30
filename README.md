# Links Dashboard (Public + Superadmin)

- Chiunque può vedere i link attivi.
- Solo SUPERADMIN può:
  - vedere anche i link inattivi (`GET /api/links?all=1`)
  - creare (`POST /api/links`)
  - modificare (`PUT /api/links/:id`)
  - eliminare (`DELETE /api/links/:id`)

## Setup Cloudflare Pages + D1

1) Crea un database D1 e importa lo schema:
- usa `schema.sql`

2) Imposta la variabile d'ambiente:
- `SUPERADMIN_KEY` = una stringa lunga e casuale (consigliato 32+ caratteri)

3) Binding D1 in Pages:
- nome binding: `DB`

4) Deploy
- `public/index.html` è la UI
- `functions/api/*` sono le Pages Functions

## API
- Pubblico: `GET /api/links`
- Superadmin (header `x-superadmin-key`):
  - `GET /api/links?all=1`
  - `POST /api/links`
  - `PUT /api/links/<id>`
  - `DELETE /api/links/<id>`

## Sicurezza
La key non finisce in URL. La UI la invia come header:
- `x-superadmin-key: <SUPERADMIN_KEY>`
