# API Tasarımı 

**API Tasarım Dosyası:** [openapi.yaml](openapi.yaml)

Bu doküman, DekoHome by Meyran projesi için geliştirilen REST API’nin OpenAPI Specification (OAS) 3.0 standardına göre hazırlanmış tasarımını içermektedir.


## Tasarım:

```yaml
openapi: 3.0.3

info:
  title: DekoHome by Meyran - REST API
  version: 1.0.0
  description: >
    DekoHome by Meyran; modern mobilya ve ev dekorasyonu ürünlerini web ve mobil platformlarda
    kullanıcılarla buluşturan bir e-ticaret uygulamasıdır. Kullanıcılar ürün kataloğunu inceleyebilir,
    kategorilere göre filtreleme yapabilir, ürünleri sepetlerine ekleyebilir, sipariş oluşturabilir ve
    satın aldıkları ürünler için yorum bırakabilir.

    Bu OpenAPI dokümanı; kimlik doğrulama (JWT), kullanıcı profili, kategori yönetimi,
    ürün yönetimi, sepet işlemleri, sipariş süreçleri ve ürün yorumlarını kapsar.
    API; güvenli erişim için JWT tabanlı kimlik doğrulama ile korunur ve yetki gerektiren
    işlemler (ör. admin güncellemeleri) bu kapsamda değerlendirilir.
  contact:
    name: Meyran Proje Ekibi
    email: proje@example.com

servers:
  - url: http://localhost:3000/v1
    description: Yerel geliştirme sunucusu
  - url: https://api.yazmuh.com/v1
    description: Üretim sunucusu
  - url: https://staging-api.yazmuh.com/v1
    description: Test (staging) sunucusu

tags:
  - name: Kimlik Doğrulama
    description: Kullanıcı kayıt ve giriş işlemleri
  - name: Kullanıcılar
    description: Kullanıcı profili işlemleri
  - name: Kategoriler
    description: Kategori listeleme ve güncelleme işlemleri
  - name: Ürünler
    description: Ürün listeleme, ekleme, güncelleme ve silme işlemleri
  - name: Sepet
    description: Sepet görüntüleme ve sepet kalemi işlemleri
  - name: Siparişler
    description: Sipariş oluşturma, listeleme, güncelleme ve iptal işlemleri
  - name: Yorumlar
    description: Ürün yorumları listeleme, ekleme, güncelleme ve silme işlemleri

security:
  - BearerAuth: []

paths:

  # KİMLİK DOĞRULAMA
  /auth/register:
    post:
      tags: [Kimlik Doğrulama]
      summary: Üye Olma
      operationId: registerUser
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterInput'
      responses:
        "201":
          description: Kullanıcı oluşturuldu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /auth/login:
    post:
      tags: [Kimlik Doğrulama]
      summary: Giriş Yapma
      operationId: loginUser
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginInput'
      responses:
        "200":
          description: Giriş başarılı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        "401":
          description: E-posta veya şifre hatalı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  # KULLANICI PROFİLİ
  /users/{userId}:
    parameters:
      - name: userId
        in: path
        required: true
        description: Kullanıcı ID değeri
        schema:
          type: integer
        example: 101

    get:
      tags: [Kullanıcılar]
      summary: Profil Görüntüleme
      operationId: getUserProfile
      responses:
        "200":
          description: Profil bilgileri
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Kullanıcı bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    put:
      tags: [Kullanıcılar]
      summary: Profil Güncelleme
      operationId: updateUserProfile
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserUpdateInput'
      responses:
        "200":
          description: Güncellendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Kullanıcı bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    delete:
      tags: [Kullanıcılar]
      summary: Hesap Silme
      operationId: deleteUserAccount
      responses:
        "204":
          description: Hesap silindi
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Kullanıcı bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  # KATEGORİLER
  /categories:
    get:
      tags: [Kategoriler]
      summary: Kategori Listeleme
      operationId: listCategories
      responses:
        "200":
          description: Liste getirildi
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Category'

  /categories/{categoryId}:
    parameters:
      - name: categoryId
        in: path
        required: true
        description: Kategori ID değeri
        schema:
          type: integer
        example: 10

    put:
      tags: [Kategoriler]
      summary: Kategori Güncelleme (Admin)
      operationId: updateCategory
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CategoryUpdateInput'
      responses:
        "200":
          description: Güncellendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Category'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "403":
          description: Yetkisiz işlem (Admin gerekir)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Kategori bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  # KULLANICI KATEGORİ TERCİHLERİ
  /users/{userId}/preferences/categories:
    parameters:
      - name: userId
        in: path
        required: true
        description: Kullanıcı ID değeri
        schema:
          type: integer
        example: 101

    post:
      tags: [Kategoriler]
      summary: Kategori Seçme
      operationId: addUserCategoryPreference
      description: Kullanıcı ilgi duyduğu kategoriyi seçer.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserCategoryPreferenceInput'
      responses:
        "200":
          description: Kategori eklendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserCategoryPreference'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /users/{userId}/preferences/categories/{categoryId}:
    parameters:
      - name: userId
        in: path
        required: true
        schema:
          type: integer
        example: 101
      - name: categoryId
        in: path
        required: true
        schema:
          type: integer
        example: 10

    delete:
      tags: [Kategoriler]
      summary: Kategori Silme
      operationId: removeUserCategoryPreference
      description: Kullanıcı seçtiği kategoriyi kaldırır.
      responses:
        "204":
          description: Kategori kaldırıldı
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Kayıt bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  # ÜRÜNLER
  /products:
    post:
      tags: [Ürünler]
      summary: Ürün Ekleme (Admin)
      operationId: createProduct
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProductInput'
      responses:
        "201":
          description: Ürün eklendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "403":
          description: Yetkisiz işlem (Admin gerekir)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    get:
      tags: [Ürünler]
      summary: Ürün Listeleme
      operationId: listProducts
      parameters:
        - name: q
          in: query
          required: false
          description: İsim/açıklama araması
          schema:
            type: string
          example: "koltuk"
        - name: categoryId
          in: query
          required: false
          description: Kategori filtresi
          schema:
            type: integer
          example: 10
        - name: minPrice
          in: query
          required: false
          description: Minimum fiyat
          schema:
            type: number
            format: float
          example: 199.99
        - name: maxPrice
          in: query
          required: false
          description: Maksimum fiyat
          schema:
            type: number
            format: float
          example: 1999.99
      responses:
        "200":
          description: Ürün listesi
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Product'

  /products/{productId}:
    parameters:
      - name: productId
        in: path
        required: true
        description: Ürün ID değeri
        schema:
          type: integer
        example: 501

    put:
      tags: [Ürünler]
      summary: Ürün Güncelleme (Admin)
      operationId: updateProduct
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ProductUpdateInput'
      responses:
        "200":
          description: Güncellendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "403":
          description: Yetkisiz işlem (Admin gerekir)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Ürün bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    delete:
      tags: [Ürünler]
      summary: Ürün Silme (Admin)
      operationId: deleteProduct
      responses:
        "204":
          description: Silindi
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "403":
          description: Yetkisiz işlem (Admin gerekir)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Ürün bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  # SEPET
  /cart:
    get:
      tags: [Sepet]
      summary: Sepet Listeleme
      operationId: getCart
      responses:
        "200":
          description: Sepet listelendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Cart'
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /cart/items:
    post:
      tags: [Sepet]
      summary: Sepete Ürün Ekleme
      operationId: addCartItem
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CartItemAddInput'
      responses:
        "201":
          description: Ürün sepete eklendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Cart'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Ürün bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /cart/items/{itemId}:
    parameters:
      - name: itemId
        in: path
        required: true
        description: Sepet kalemi ID değeri
        schema:
          type: integer
        example: 9001

    put:
      tags: [Sepet]
      summary: Sepet Güncelleme
      operationId: updateCartItem
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CartItemUpdateInput'
      responses:
        "200":
          description: Güncellendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Cart'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Sepet kalemi bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    delete:
      tags: [Sepet]
      summary: Sepetten Ürün Silme
      operationId: removeCartItem
      responses:
        "204":
          description: Silindi
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Sepet kalemi bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  # SİPARİŞLER
  /orders:
    post:
      tags: [Siparişler]
      summary: Sipariş Oluşturma
      operationId: createOrder
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OrderCreateInput'
      responses:
        "201":
          description: Sipariş oluşturuldu
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    get:
      tags: [Siparişler]
      summary: Sipariş Listeleme
      operationId: listOrders
      responses:
        "200":
          description: Sipariş listesi
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Order'
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /orders/{orderId}:
    parameters:
      - name: orderId
        in: path
        required: true
        description: Sipariş ID değeri
        schema:
          type: integer
        example: 7001

    put:
      tags: [Siparişler]
      summary: Sipariş Güncelleme
      operationId: updateOrder
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OrderUpdateInput'
      responses:
        "200":
          description: Güncellendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Sipariş bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    delete:
      tags: [Siparişler]
      summary: Sipariş İptali
      operationId: cancelOrder
      responses:
        "204":
          description: İptal edildi
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Sipariş bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  # YORUMLAR
  /products/{productId}/reviews:
    parameters:
      - name: productId
        in: path
        required: true
        description: Ürün ID değeri
        schema:
          type: integer
        example: 501

    get:
      tags: [Yorumlar]
      summary: Yorum Listeleme
      operationId: listProductReviews
      responses:
        "200":
          description: Yorumlar listelendi
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Review'
        "404":
          description: Ürün bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    post:
      tags: [Yorumlar]
      summary: Yorum Ekleme
      operationId: addProductReview
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ReviewInput'
      responses:
        "201":
          description: Yorum eklendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Review'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Ürün bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /products/{productId}/reviews/{reviewId}:
    parameters:
      - name: productId
        in: path
        required: true
        schema:
          type: integer
        example: 501
      - name: reviewId
        in: path
        required: true
        schema:
          type: integer
        example: 3001

    put:
      tags: [Yorumlar]
      summary: Yorum Güncelleme
      operationId: updateProductReview
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ReviewUpdateInput'
      responses:
        "200":
          description: Güncellendi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Review'
        "400":
          description: Geçersiz istek verisi
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Yorum bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    delete:
      tags: [Yorumlar]
      summary: Yorum Silme
      operationId: deleteProductReview
      responses:
        "204":
          description: Silindi
        "401":
          description: Kimlik doğrulama başarısız
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        "404":
          description: Yorum bulunamadı
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

components:
  securitySchemes:
    BearerAuth:
      type: apiKey
      in: header
      name: Authorization
      description: 'JWT tabanlı kimlik doğrulama. "Authorization: Bearer <token>" başlığı eklenmelidir.'

  schemas:
    Error:
      type: object
      properties:
        message:
          type: string
          example: "Geçersiz istek"
      required: [message]

    AuthResponse:
      type: object
      properties:
        token:
          type: string
          example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      required: [token]

    RegisterInput:
      type: object
      required: [email, password]
      properties:
        email:
          type: string
          example: "user@example.com"
        password:
          type: string
          example: "StrongPass123!"
        ad:
          type: string
          example: "Ebrar"
        soyad:
          type: string
          example: "Karakoç"

    LoginInput:
      type: object
      required: [email, password]
      properties:
        email:
          type: string
          example: "user@example.com"
        password:
          type: string
          example: "StrongPass123!"

    User:
      type: object
      properties:
        id:
          type: integer
          example: 101
        email:
          type: string
          example: "user@example.com"
        ad:
          type: string
          example: "Ebrar"
        soyad:
          type: string
          example: "Karakoç"

    UserUpdateInput:
      type: object
      properties:
        ad:
          type: string
          example: "Ebrar"
        soyad:
          type: string
          example: "Karakoç"

    Category:
      type: object
      properties:
        id:
          type: integer
          example: 10
        name:
          type: string
          example: "Oturma Odası"
        description:
          type: string
          example: "Koltuk, kanepe, sehpa vb."
        parentCategoryId:
          type: integer
          nullable: true
          example: null

    CategoryUpdateInput:
      type: object
      properties:
        name:
          type: string
          example: "Oturma Odası"
        description:
          type: string
          example: "Koltuk, kanepe, sehpa vb."
        parentCategoryId:
          type: integer
          nullable: true
          example: null

    UserCategoryPreferenceInput:
      type: object
      required: [categoryId]
      properties:
        categoryId:
          type: integer
          example: 10

    UserCategoryPreference:
      type: object
      properties:
        userId:
          type: integer
          example: 101
        categoryId:
          type: integer
          example: 10

    Product:
      type: object
      properties:
        id:
          type: integer
          example: 501
        name:
          type: string
          example: "3'lü Koltuk"
        description:
          type: string
          example: "Modern tasarım, kumaş döşeme."
        price:
          type: number
          format: float
          example: 12999.99
        stock:
          type: integer
          example: 12
        categoryId:
          type: integer
          example: 10
        imageUrl:
          type: string
          example: "https://cdn.example.com/products/501.jpg"

    ProductInput:
      type: object
      required: [name, price, stock, categoryId]
      properties:
        name:
          type: string
          example: "3'lü Koltuk"
        description:
          type: string
          example: "Modern tasarım, kumaş döşeme."
        price:
          type: number
          format: float
          example: 12999.99
        stock:
          type: integer
          example: 12
        categoryId:
          type: integer
          example: 10
        imageUrl:
          type: string
          example: "https://cdn.example.com/products/501.jpg"

    ProductUpdateInput:
      type: object
      properties:
        name:
          type: string
          example: "3'lü Koltuk"
        description:
          type: string
          example: "Modern tasarım, kumaş döşeme."
        price:
          type: number
          format: float
          example: 11999.99
        stock:
          type: integer
          example: 10
        categoryId:
          type: integer
          example: 10
        imageUrl:
          type: string
          example: "https://cdn.example.com/products/501.jpg"

    CartItem:
      type: object
      properties:
        itemId:
          type: integer
          example: 9001
        productId:
          type: integer
          example: 501
        quantity:
          type: integer
          example: 2
        unitPrice:
          type: number
          format: float
          example: 12999.99

    Cart:
      type: object
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/CartItem'
        total:
          type: number
          format: float
          example: 25999.98

    CartItemAddInput:
      type: object
      required: [productId, quantity]
      properties:
        productId:
          type: integer
          example: 501
        quantity:
          type: integer
          example: 1

    CartItemUpdateInput:
      type: object
      required: [quantity]
      properties:
        quantity:
          type: integer
          example: 3

    Order:
      type: object
      properties:
        id:
          type: integer
          example: 7001
        status:
          type: string
          example: "Hazırlanıyor"
        total:
          type: number
          format: float
          example: 25999.98
        createdAt:
          type: string
          format: date-time
          example: "2026-03-04T10:30:00Z"
        items:
          type: array
          items:
            $ref: '#/components/schemas/CartItem'

    OrderCreateInput:
      type: object
      description: Sipariş oluşturmak için sepet içerikleri baz alınır (opsiyonel alanlar projeye göre düzenlenebilir).
      properties:
        address:
          type: string
          example: "İstanbul, Kadıköy..."
        note:
          type: string
          example: "Kapıya bırakın."

    OrderUpdateInput:
      type: object
      properties:
        status:
          type: string
          example: "Kargoya Verildi"

    Review:
      type: object
      properties:
        id:
          type: integer
          example: 3001
        productId:
          type: integer
          example: 501
        rating:
          type: integer
          minimum: 1
          maximum: 5
          example: 5
        comment:
          type: string
          example: "Çok kaliteli ve rahat."
        createdAt:
          type: string
          format: date-time
          example: "2026-03-04T10:40:00Z"

    ReviewInput:
      type: object
      required: [rating, comment]
      properties:
        rating:
          type: integer
          minimum: 1
          maximum: 5
          example: 5
        comment:
          type: string
          example: "Çok kaliteli ve rahat."

    ReviewUpdateInput:
      type: object
      properties:
        rating:
          type: integer
          minimum: 1
          maximum: 5
          example: 4
        comment:
          type: string
          example: "Güncel yorum: teslimat hızlıydı."