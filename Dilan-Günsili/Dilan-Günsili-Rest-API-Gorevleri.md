# Dilan Günsili'nin REST API Metotları

**API Test Videosu:** [VideoLink](https://youtu.be/E1DHQ14ZKjQ?si=_FaVOW9ZlWSp_HTj)

## 1. Sepete Ürün Ekleme
- **Endpoint:** `POST /cart/items`
- **Request Body:** 
  ```json
  {
    "productId": "string",
    "quantity": 2
  }
  ```
- **Response:** `201 Created` - Ürün başarıyla sepete eklendi

## 2. Sepet Listeleme
- **Endpoint:** `GET /cart`
- **Response:** `200 OK` - Sepetteki ürünlerin listesi başarıyla getirildi

## 3. Sepet Güncelleme
- **Endpoint:** `PUT /cart/items/{itemId}`
- **Path Parameters:** 
  - `itemId` (string, required) - Sepetteki öğenin benzersiz ID'si
- **Request Body:** 
  ```json
  {
    "quantity": 5
  }
  ```
- **Response:** `200 OK` - Ürün miktarı başarıyla güncellendi

## 4. Sepetten Ürün Silme
- **Endpoint:** `DELETE /cart/items/{itemId}`
- **Path Parameters:** 
  - `itemId` (string, required) - Silinecek öğenin ID'si
- **Response:** `204 No Content` - Ürün sepetten başarıyla silindi

## 5. Yorum Listeleme
- **Endpoint:** `GET /products/{productId}/reviews`
- **Path Parameters:** 
  - `productId` (string, required) - Ürün ID'si
- **Response:** `200 OK` - Ürüne ait tüm yorumlar başarıyla listelendi

## 6. Yorum Güncelleme
- **Endpoint:** `PUT /products/{productId}/reviews/{reviewId}`
- **Path Parameters:** 
  - `productId` (string, required) - Ürün ID'si
  - `reviewId` (string, required) - Güncellenecek yorumun ID'si
- **Request Body:** 
  ```json
  {
    "rating": 4,
    "comment": "Ürün çok güzel ama biraz küçük geldi bana. Yine de tercih ederim.",
    "title": "Güzel Ürün - Küçük Boy"
  }
  ```
- **Response:** `200 OK` - Yorum başarıyla güncellendi