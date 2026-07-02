## EventHub Backend API

EventHub adalah *platform backend* manajemen *event* dan *ticketing* berskala *enterprise* yang dirancang untuk mendukung sistem registrasi, transaksi atomik, dan kolaborasi tim (*Hackathon-ready*). Ditulis menggunakan Node.js, Express, dan Prisma ORM dengan basis data PostgreSQL.

---

### Tech Stack & Arsitektur
* **Runtime:** Node.js (v18+)
* **Framework:** Express.js (ES Modules)
* **ORM:** Prisma Client
* **Database:** PostgreSQL v15 (Running via Docker)
* **Security:** JSON Web Token (JWT) & Bcrypt Password Hashing

Proyek ini menerapkan arsitektur **Controller-Route** dengan pemisahan akses berbasis peran (*Role-Based Access Control*) dan transaksi data atomik (`prisma.$transaction`) untuk menjamin konsistensi kuota tiket dari ancaman *race condition*.

---

### Struktur Folder Proyek
```text
eventhub-backend/
├── docs/
│   ├── ARCHITECTURE.md     # Penjelasan alur sistem & alur bisnis
│   └── API_ENDPOINTS.md    # Detail struktur request & response API
├── prisma/
│   ├── migrations/         # Riwayat skema SQL database
│   └── schema.prisma       # Definisi model & enum data Prisma
├── src/
│   ├── config/             # Inisialisasi Prisma Client
│   ├── controllers/        # Logika bisnis utama per entitas
│   ├── middlewares/        # Satpam otorisasi token & validasi role
│   ├── routes/             # Pemetaan endpoint URL Express
│   └── index.js            # Entry point aplikasi (Running Port: 5000)
├── .env                    # Variabel lingkungan (Sensitif)
└── README.md               # Panduan utama proyek

```

---

### Panduan Instalasi & Menjalankan Sistem

#### 1. Prasyarat (Prerequisites)

Pastikan kamu sudah menginstal **Node.js**, **NPM**, dan **Docker** di perangkatmu.

#### 2. Clone & Install Dependencies

```bash
git clone <url-repository-anda>
cd eventhub-backend
npm install

```

#### 3. Konfigurasi Environment File

Buat file bernama `.env` di direktori utama (*root*) proyek, lalu sesuaikan isinya:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eventhub_db?schema=public"
JWT_SECRET="ganti_dengan_kode_rahasia_super_aman_kamu"

```

#### 4. Nyalakan Database (Docker)

Jika menggunakan Docker untuk PostgreSQL, jalankan container dengan perintah berikut:

```bash
docker run --name eventhub-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=eventhub_db -p 5432:5432 -d postgres:15-alpine

```

#### 5. Sinkronisasi & Migrasi Database

Jalankan perintah ini agar Prisma membuat tabel-tabel yang diperlukan di dalam database:

```bash
npx prisma migrate dev --name init_project

```

#### 6. Jalankan Server Development

```bash
npm run dev

```

Server backend akan berjalan aktif di alamat: `http://localhost:5000`

---

### Alur Peran Pengguna (Role Flow)

Aplikasi ini mendukung tiga peran (*enum*) utama dengan batasan akses yang jelas:

1. **PARTICIPANT**: Dapat memperbarui profil publik, melakukan checkout tiket, membayar, dan bergabung/membuat tim (*Many-to-Many*).
2. **ORGANIZER**: Memiliki semua hak akses peserta ditambah kemampuan untuk **Menciptakan, Memperbarui, dan Menghapus Event milik mereka sendiri**, serta mengupgrade peserta lain menjadi *Organizer*.
3. **SUPERADMIN**: Memiliki kendali penuh (*hak veto*) terhadap seluruh ekosistem data.

---

### Dokumentasi Lanjutan

Untuk detail teknis yang lebih mendalam, silakan merujuk pada berkas dokumentasi internal berikut:

* **[Alur Arsitektur & Relasi Database](./docs/architecture.md)**
* **[Spesifikasi Lengkap Endpoint API](./docs/api-endpoint.md)**