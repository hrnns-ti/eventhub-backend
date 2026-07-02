
## API_ENDPOINTS.md

### Base URL & Headers

* **Development:** `http://localhost:5000`
* **Header Wajib (Untuk Route Privat):** ```http
Authorization: Bearer <your_jwt_token_here>

---

### 1. Authentication & Users (`/api/users`)

#### Register User

* **Method / URL:** `POST /api/users/register`
* **Akses:** Publik
* **Body (JSON):**
```json
{
  "full_name": "Tangerang Selatan Tech Bro",
  "email": "dev@eventhub.com",
  "password": "password123"
}

```


* **Response (201 Created):**
```json
{
  "status": "success",
  "message": "User berhasil terdaftar!"
}

```



#### Login User

* **Method / URL:** `POST /api/users/login`
* **Akses:** Publik
* **Body (JSON):**
```json
{
  "email": "dev@eventhub.com",
  "password": "password123"
}

```


* **Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login berhasil!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

```



#### Get My Profile

* **Method / URL:** `GET /api/users/me`
* **Akses:** Privat (User Token)
* **Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "id": "39404659-597b-4973-83f0-2661b2be569c",
    "full_name": "Tangerang Selatan Tech Bro",
    "email": "dev@eventhub.com",
    "role": "PARTICIPANT",
    "phone_number": "081234567890",
    "institution": "UIN Jakarta",
    "bio": "Backend Engineer enthusiast.",
    "skills": ["Node.js", "Prisma"]
  }
}

```



#### Get Public Profile by ID

* **Method / URL:** `GET /api/users/:id`
* **Akses:** Privat (User Token)
* **Response (200 OK):** *(🚨 Email & nomor telepon disembunyikan untuk privasi)*
```json
{
  "status": "success",
  "data": {
    "id": "39404659-597b-4973-83f0-2661b2be569c",
    "full_name": "Tangerang Selatan Tech Bro",
    "institution": "UIN Jakarta",
    "bio": "Backend Engineer enthusiast.",
    "skills": ["Node.js", "Prisma"]
  }
}

```



---

### 2. Event Management (`/api/events`)

#### Get All Events (With Filters & Pagination)

* **Method / URL:** `GET /api/events`
* **Query Params (Opsional):** `?search=hackathon&status=active&type=competition&page=1&limit=10`
* **Akses:** Publik
* **Response (200 OK):**
```json
{
  "status": "success",
  "meta": {
    "current_page": 1,
    "limit": 10,
    "total_data": 1,
    "total_pages": 1
  },
  "data": [
    {
      "id": "37ca63b8-b679-428e-b90c-13cd3b1bbc64",
      "title": "HIMTI Hackathon 2026",
      "quota": 49,
      "price": "50000.00",
      "registration_deadline": "2026-08-01T00:00:00.000Z",
      "event_type": "COMPETITION",
      "organizer": {
        "full_name": "HIMTI UIN Jakarta",
        "institution": "UIN Syarif Hidayatullah"
      }
    }
  ]
}

```



#### Create Event

* **Method / URL:** `POST /api/events`
* **Akses:** Privat (Role `ORGANIZER` atau `SUPERADMIN`)
* **Body (JSON):**
```json
{
  "title": "HIMTI Hackathon 2026",
  "description": "Kompetisi ngoding 48 jam nonstop.",
  "quota": 50,
  "price": 50000,
  "registration_deadline": "2026-08-01T00:00:00Z",
  "event_type": "COMPETITION"
}

```



---

### 3. Transactions & Tickets (`/api/transactions`)

#### Checkout Ticket

* **Method / URL:** `POST /api/transactions/checkout`
* **Body (JSON):** `{ "event_id": "37ca63b8..." }`
* **Response (201 Created):** Status otomatis `PENDING`.

#### Confirm Payment (Simulation Callback)

* **Method / URL:** `POST /api/transactions/payment-callback`
* **Body (JSON):** `{ "transaction_id": "uuid-trx" }`
* **Response (200 OK):** Status trx menjadi `PAID` dan tiket terbit otomatis.

#### Refund Transaction

* **Method / URL:** `POST /api/transactions/refund`
* **Body (JSON):** `{ "transaction_id": "uuid-trx" }`
* **Response (200 OK):** Menghapus tiket, mengembalikan kuota, status trx menjadi `CANCELLED`.

---

### 4. Teams & Collaboration (`/api/teams`)

#### Create Team

* **Method / URL:** `POST /api/teams`
* **Body (JSON):**
```json
{
  "event_id": "37ca63b8-b679-428e-b90c-13cd3b1bbc64",
  "team_name": "Tangerang Selatan Cyber Corp"
}

```



#### Join Team

* **Method / URL:** `POST /api/teams/join`
* **Body (JSON):** `{ "team_id": "f9ea11ee..." }`