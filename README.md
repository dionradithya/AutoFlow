## Tim Kami

| Nama                     | NIM              | GitHub                           |
|--------------------------|------------------|----------------------------------|
| Muhammad Dion Radithya  | 235150707111039  | [dionradithya](https://github.com/dionradithya) |
| Febrian Faiq Putra      | 235150707111039  | [FebrianFaiq](https://github.com/FebrianFaiq)   |
| Alva Shaquilla Rayhan   | 235150707111033  | [Vlaaming0](https://github.com/Vlaaming0)       |

# AutoFlow: Aplikasi Manajemen Transaksi Otomotif Berbasis Mikroservis

![GitHub top language](https://img.shields.io/github/languages/top/dionradithya/AutoFlow)
![GitHub language count](https://img.shields.io/github/languages/count/dionradithya/AutoFlow)
![GitHub repo size](https://img.shields.io/github/repo-size/dionradithya/AutoFlow)

AutoFlow adalah sebuah aplikasi berbasis mikroservis yang dirancang untuk manajemen transaksi otomotif, cocok untuk platform jual beli mobil. Proyek ini mengintegrasikan beberapa service terpisah (otentikasi, mobil, transaksi) yang dihubungkan melalui API Gateway, dengan antarmuka pengguna berbasis React. AutoFlow bertujuan untuk mendemonstrasikan arsitektur modern terdistribusi.

## Fitur Utama

* **User Authentication (JWT)**: Pengguna dapat mendaftar dan login dengan aman. 
* **CRUD Data Mobil**: Pengelolaan data mobil (tambah, lihat, ubah, hapus). 
* **Pemrosesan Pembayaran**: Integrasi dengan Midtrans sebagai penyedia payment gateway. 
* **Riwayat Transaksi**: Pengguna dapat melihat riwayat transaksi mereka. 


## Arsitektur Sistem

![Diagram Arsitektur AutoFlow](https://drive.google.com/uc?export=download&id=1iAHVGuCAhhNplXquPFd4AO7Eu9MlScpK)

AutoFlow mengimplementasikan pola arsitektur mikroservis client-server. Komponen utamanya meliputi: 

1.  **Front-end React (SPA)**: Aplikasi Single Page Application (SPA) yang berjalan di browser, berkomunikasi dengan API Gateway via HTTP/JSON. 
2.  **API Gateway**: Sebagai *entry point* semua request dari front-end, memvalidasi header (misalnya token JWT), dan meneruskan permintaan ke service terkait. 
3.  **Mikroservis Independen**:
    * **Auth-service**: Menangani registrasi, login, dan verifikasi token JWT. 
    * **Car-service**: Mengelola data mobil (CRUD). 
    * **Transaction-service**: Memproses transaksi pembelian dan berinteraksi dengan Midtrans. 
4.  **Database**: Setiap service backend terhubung ke basis data MySQL.

## Database

![Database AutoFlow](https://drive.google.com/uc?export=view&id=1kc9Bv9Y6HR134RPM40ioeqp5CYVDUMgq)

### Interaksi Antar service

* **Registrasi/Login**: Front-end memanggil API Gateway, yang meneruskan ke Auth-service. Auth-service mengembalikan token JWT untuk otorisasi. 
* **Permintaan Data Mobil**: Front-end meminta data mobil melalui Gateway, yang meneruskan ke Car-service. 
* **Transaksi Pembelian**: Front-end memanggil Gateway dengan header JWT. Gateway mengirim data ke Transaction-service, yang menginisiasi pembayaran dengan Midtrans. [cite_start]Midtrans kemudian memanggil *notification endpoint* di Gateway yang diteruskan ke Transaction-service untuk memperbarui status transaksi. 
* **Riwayat Transaksi**: Front-end meminta riwayat transaksi melalui Gateway, yang diteruskan ke Transaction-service. 

## Teknologi yang Digunakan

* **Backend (Mikroservis)**: PHP (Laravel Lumen) - Ringan dan cepat untuk service RESTful. 
* **Database**: MySQL/MariaDB - Untuk menyimpan data pengguna, mobil, dan transaksi. 
* **Autentikasi**: JSON Web Token (JWT) - Digunakan Auth-service untuk otorisasi tanpa sesi. 
* **API Gateway**: PHP (Lumen) dengan Guzzle HTTP - Bertindak sebagai reverse proxy dan meneruskan header otentikasi. 
* **Payment Gateway**: Midtrans - Penyedia service pembayaran (khusus pasar Indonesia) dengan mekanisme callback notifikasi. 
* **Front-end**: React.js (v18-19) - Membangun UI dinamis, menggunakan `axios`, `react-router-dom`, `bootstrap`, dan `react-toastify`. 
* **Lain-lain**: Guzzle HTTP Client (PHP), Composer (dependency manager PHP), Node.js/npm (package manager JS). 

## Struktur Proyek

Proyek ini memiliki struktur folder yang jelas untuk setiap service: 

* `Api-gateway/`
* `Auth-service/`
* `Car-service/`
* `Transaction-service/`
* `autoflow-react/` (Front-end)

## Panduan Instalasi dan Penggunaan

### Prasyarat

Pastikan Anda telah menginstal: 

* PHP 8.x (dengan Composer)
* MySQL
* Node.js (v14+)

### Langkah-langkah Instalasi

1.  **Kloning Repositori**: 
    ```bash
    git clone [https://github.com/dionradithya/AutoFlow.git](https://github.com/dionradithya/AutoFlow.git)
    cd AutoFlow
    ```

2.  **Konfigurasi Database**: 
    * Buat database MySQL terpisah untuk setiap service (misalnya `autoflow_auth`, `autoflow_car`, `autoflow_transaksi`).
    * Buat file `.env` di setiap folder service PHP (`Api-gateway`, `Auth-service`, `Car-service`, `Transaction-service`).
    * Sesuaikan pengaturan database (`DB_HOST`, `DB_NAME`, dll.) dan kunci rahasia JWT (`JWT_SECRET`) di setiap file `.env`. 

3.  **Install Backend Dependencies**: 
    Untuk setiap folder service PHP (misalnya `Api-gateway`, `Auth-service`, `Car-service`, `Transaction-service`), jalankan:
    ```bash
    composer install
    ```
    
4.  **Konfigurasi Midtrans**: 
    * **Dapatkan Kunci Midtrans:** Anda perlu mendaftar dan masuk ke dashboard Midtrans untuk mendapatkan 'Server Key' dan 'Client Key' Anda.
    * **Konfigurasi di** '.env' **(Transaction-service)**: Buka file '.env' di direktori 'Transaction-service/' dan tambahkan variabel lingkungan untuk kunci-kunci Midtrans Anda, contohnya:
    ```bash
    MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR_SERVER_KEY
    MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_CLIENT_KEY
    MIDTRANS_IS_PRODUCTION=false # Set to true for production environment
    ```

5.  **Migrasi Database**: 
    Untuk setiap direktori service PHP, jalankan migrasi untuk membuat tabel:
    ```bash
    php artisan migrate
    ```

6.  **Jalankan Server Backend**: 
    Buka terminal terpisah untuk setiap service dan jalankan server lokal:
    * **Auth-service**: `php -S localhost:8001 -t public`
    * **Car-service**: `php -S localhost:8002 -t public`
    * **Transaction-service**: `php -S localhost:8003 -t public`
    * **API Gateway**: `php -S localhost:8000 -t public`
    Pastikan port tidak bentrok dan `APP_URL` di `.env` sesuai. 

7.  **Front-end React**: 
    Masuk ke direktori `autoflow-react`:
    ```bash
    cd autoflow-react
    npm install
    npm start
    ```
    Aplikasi React akan berjalan (biasanya di `http://localhost:3000`).
    
### Pengujian Aplikasi

1.  Buka browser Anda dan akses `http://localhost:3000`. 
2.  Daftar akun baru melalui halaman Register, lalu login. 
3.  Coba tambahkan mobil baru.
4.  Lakukan transaksi pembelian. Aplikasi akan mengarahkan ke proses pembayaran Midtrans (sandbox). 
5.  Setelah pembayaran selesai, transaksi akan tercatat dan Anda dapat melihat riwayat transaksi di halaman yang tersedia. 
