# REST API Adresi

https://dekohome-api.onrender.com
**REST API Test Videosu:** [https://youtu.be/DV2jWF2q54k](https://youtu.be/DV2jWF2q54k) (Video)

---

## API Endpoints

### 1. Kullanıcı Kaydı (Register)
- **Metot:** `POST`
- **Yol:** `/v1/auth/register`
- **Request Body (JSON):**
```json
{
  "email": "gullnihal@test.com",
  "password": "Test1234",
  "ad": "Gülnihal",
  "soyad": "Köse"
}
```

---

### 2. Kullanıcı Girişi (Login)
- **Metot:** `POST`
- **Yol:** `/v1/auth/login`
- **Request Body (JSON):**
```json
{
  "email": "gulnihal@test.com",
  "password": "Test1234"
}
```

---

### 3. Kullanıcı Bilgilerini Getirme
- **Metot:** `GET`
- **Yol:** `/v1/users/:id`
- **Auth:** Bearer Token
- **Request Body:** Yok

---

### 4. Kullanıcı Bilgilerini Güncelleme
- **Metot:** `PUT`
- **Yol:** `/v1/users/:id`
- **Auth:** Bearer Token
- **Request Body (JSON):**
```json
{
  "ad": "Gülnihal Yeni",
  "soyad": "Köse Güncellendi"
}
```

---

### 5. Kullanıcı Tercih Kategorisi Ekleme
- **Metot:** `POST`
- **Yol:** `/v1/users/:id/preferences/categories`
- **Auth:** Bearer Token
- **Request Body (JSON):**
```json
{
  "categoryId": "69c681a153fa902e2054855a"
}
```

---

### 6. Kullanıcı Tercih Kategorisi Silme
- **Metot:** `DELETE`
- **Yol:** `/v1/users/:id/preferences/categories/:categoryId`
- **Auth:** Bearer Token
- **Request Body:** Yok

---

### 7. Kullanıcı Hesabını Silme
- **Metot:** `DELETE`
- **Yol:** `/v1/users/:id`
- **Auth:** Bearer Token
- **Request Body:** Yok
