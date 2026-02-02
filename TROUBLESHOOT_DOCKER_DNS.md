# Panduan Fix Docker Network/DNS Error

Error `lookup auth.docker.io on ... i/o timeout` berarti server production Anda gagal connect ke internet/DNS saat mau download base image.

Berikut solusi dari yang termudah sampai advanced. Silakan coba satu persatu di **TERMINAL SERVER PRODUCTION** (bukan di laptop ini).

## 1. Restart Docker (Paling Sering Berhasil)
Kadang service docker hanya perlu di-refresh.
```bash
sudo systemctl restart docker
```
Coba jalankan build lagi:
```bash
sudo docker compose up -d --build
```

## 2. Cek Koneksi Internet Server
Pastikan server connect ke internet.
```bash
ping -c 3 google.com
```
Jika gagal ping, berarti masalah ada di koneksi internet server, bukan Docker.

## 3. Paksa Docker Pakai DNS Google (Recommended)
Jika internet lancar tapi Docker masih error, kita paksa Docker pakai DNS 8.8.8.8.

1. Edit/Buat file konfigurasi daemon:
   ```bash
   sudo nano /etc/docker/daemon.json
   ```

2. Masukkan konten berikut (jika file kosong):
   ```json
   {
       "dns": ["8.8.8.8", "8.8.4.4"]
   }
   ```
   *Jika file sudah ada isinya, tambahkan bagian `"dns": [...]` saja, jangan lupa koma di baris sebelumnya.*

3. Simpan (Ctrl+O, Enter, Ctrl+X) dan Restart Docker:
   ```bash
   sudo systemctl restart docker
   ```

4. Coba build lagi.

## 4. Reset Network
Jika masih bandel, kadang network interface docker nyangkut.
```bash
sudo docker network prune -f
sudo systemctl restart docker
```

---
**Penyebab:** Biasanya terjadi karena DNS server lokal (127.0.0.53) di Linux (Ubuntu server) sedang bermasalah atau terblokir firewall saat diakses oleh Docker container/builder.
