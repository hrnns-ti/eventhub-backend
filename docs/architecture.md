## ARCHITECTURE.md

### 1. Overview

EventHub Backend adalah sistem manajemen *ticketing* dan kompetisi berbasis *event*. Sistem ini menggunakan arsitektur **Controller-Route-Service** (yang saat ini disederhanakan melalui *Controller-Route* yang langsung memanggil Prisma Client) untuk memastikan pemisahan tanggung jawab yang jelas.

### 2. Entity Relationship Diagram (ERD) Ringkas

Sistem ini berpusat pada tiga pilar utama: **User**, **Event**, dan **Transaction**.

* **User**: Entitas utama yang bisa berperan sebagai `PARTICIPANT`, `ORGANIZER`, atau `SUPERADMIN`.
* **Event**: Dibuat oleh `ORGANIZER`, menjadi pusat dari segala aktivitas (transaksi, tiket, dan tim).
* **Transaction**: Menghubungkan User dengan Event. Hanya transaksi yang berstatus `PAID` yang akan men-trigger penerbitan `Ticket`.
* **Team & TeamMember**: Struktur *many-to-many* yang memungkinkan user bergabung dalam satu tim untuk satu event tertentu.

### 3. Alur Logika Bisnis (Workflow)

#### A. Lifecycle Tiket (Checkout hingga Refund)

1. **Checkout**: User membuat `Transaction` (status `PENDING`). Kuota `Event` tidak berkurang (hanya di-*reserve*).
2. **Payment**: Saat status berubah ke `PAID`, sistem secara otomatis membuat `Ticket` dengan ID unik.
3. **Refund/Cancel**: Sistem akan menghancurkan data `Ticket` dan mengembalikan kuota `Event` secara atomik menggunakan Prisma Transaction untuk mencegah *race condition*.

#### B. Otorisasi (RBAC)

Sistem menggunakan `verifyToken` (JWT) untuk identifikasi user, dan *middleware* tambahan (`isOrganizer`) untuk membatasi akses pada *endpoint* sensitif seperti:

* `POST /api/events` (Create Event)
* `PUT /api/upgrade-role` (Upgrade Participant to Organizer)

### 4. Keamanan Data & Privasi

* **Password**: Menggunakan `bcrypt` dengan *salting* untuk enkripsi satu arah.
* **Data Masking**: *Endpoint* `GET /api/users/:id` sengaja memfilter kolom sensitif seperti `email` dan `phone_number` untuk melindungi privasi peserta.
* **Atomic Operations**: Penggunaan `prisma.$transaction` memastikan bahwa jika proses pembuatan tiket gagal, kuota event tidak akan berkurang secara tidak sengaja.

---

#### Tips Pengembangan:

* Jika ingin menambahkan fitur baru, selalu pastikan relasi database tidak merusak integritas data `Transaction` yang sudah ada.
* Hindari mengubah `enum` secara drastis tanpa melakukan migrasi yang terencana karena akan berdampak pada *database* di *production*.
