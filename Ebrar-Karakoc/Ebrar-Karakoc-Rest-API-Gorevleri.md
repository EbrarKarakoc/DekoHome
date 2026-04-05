# Ebrar Karakoç'un REST API Metotları

**API Test Videosu:** [Link](https://youtu.be/bJPQqyBqfGs)

## 1. Sipariş Oluşturma
- **Endpoint:** `POST /orders`
- **Request Body:** 
  ```json
  {
    "address": "İstanbul, Kadıköy...",
    "note": "Kapıya bırakın."
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `201 Created` - Sipariş başarıyla oluşturuldu

## 2. Sipariş İptali
- **Endpoint:** `DELETE /orders/{orderId}`
- **Path Parameters:** 
  - `orderId` (integer, required) - Sipariş ID'si
- **Authentication:** Bearer Token gerekli (Siparişi oluşturan kullanıcı veya yönetici yetkisi)
- **Response:** `204 No Content` - Sipariş başarıyla iptal edildi

## 3. Sipariş Güncelleme
- **Endpoint:** `PUT /orders/{orderId}`
- **Path Parameters:** 
  - `orderId` (integer, required) - Sipariş ID'si
- **Request Body:** 
  ```json
  {
    "status": "Kargoya Verildi"
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Sipariş başarıyla güncellendi

## 4. Sipariş Listeleme
- **Endpoint:** `GET /orders`
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Sipariş listesi başarıyla getirildi

## 5. Yorum Ekleme
- **Endpoint:** `POST /products/{productId}/reviews`
- **Path Parameters:** 
  - `productId` (integer, required) - Ürün ID'si
- **Request Body:** 
  ```json
  {
    "rating": 5,
    "comment": "Çok kaliteli ve rahat."
  }
  ```
- **Authentication:** Bearer Token gerekli
- **Response:** `201 Created` - Yorum başarıyla eklendi

## 6. Yorum Silme
- **Endpoint:** `DELETE /products/{productId}/reviews/{reviewId}`
- **Path Parameters:** 
  - `productId` (integer, required) - Ürün ID'si
  - `reviewId` (integer, required) - Yorum ID'si
- **Authentication:** Bearer Token gerekli (Yorumu yazan kullanıcı veya yönetici yetkisi)
- **Response:** `204 No Content` - Yorum başarıyla silindi
