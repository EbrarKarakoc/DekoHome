## Sipariş Oluşturma
* API Metodu: `POST /orders`
* Açıklama: Kullanıcının aktif sepetinde bulunan ürünleri onaylayarak yeni bir sipariş oluşturmasını sağlar. Bu işlem sırasında teslimat adresi, ödeme yöntemi, sipariş kalemleri (ürün, adet, birim fiyat), toplam tutar ve sipariş tarihi veritabanına kaydedilir. Sipariş başarıyla oluşturulduğunda ilgili ürünlerin stok miktarı otomatik olarak düşürülür. Stok yetersizliği durumunda işlem gerçekleştirilmez ve uygun hata mesajı döndürülür. Güvenlik amacıyla yalnızca giriş yapmış kullanıcılar sipariş oluşturabilir.

---

## Sipariş İptali
* API Metodu: `DELETE /orders/{orderId}`
* Açıklama: Kullanıcının mevcut bir siparişini iptal etmesini sağlar. İptal işlemi yalnızca sipariş durumu “onaylandı” veya “hazırlanıyor” aşamasındaysa gerçekleştirilebilir. Kargoya verilmiş veya teslim edilmiş siparişler iptal edilemez. İptal edilen siparişe ait ürünlerin stok miktarı sistem tarafından otomatik olarak geri artırılır. İşlem yalnızca siparişi oluşturan kullanıcı veya yönetici tarafından yapılabilir.

---

## Sipariş Güncelleme
* API Metodu: `PUT /orders/{orderId}`
* Açıklama: Mevcut bir siparişe ait belirli bilgilerin güncellenmesini sağlar. Kullanıcılar yalnızca sipariş kargoya verilmeden önce teslimat adresini güncelleyebilir. Yöneticiler ise sipariş durumunu (onaylandı, hazırlanıyor, kargoya verildi, teslim edildi, iptal edildi) değiştirebilir. Güncelleme işlemi sırasında siparişin mevcut durumu kontrol edilir ve yetki doğrulaması yapılır.

---

## Sipariş Listeleme
* API Metodu: `GET /orders`
* Açıklama: Kullanıcının geçmiş ve aktif siparişlerini listelemesini sağlar. Her sipariş için sipariş numarası, ürün detayları, toplam tutar, sipariş tarihi ve güncel durum bilgisi görüntülenir. Varsayılan olarak kullanıcı yalnızca kendi siparişlerini görebilir. Yönetici rolüne sahip kullanıcılar ise tüm kullanıcıların siparişlerini listeleyebilir. Güvenlik için kimlik doğrulaması gereklidir.

---

## Sepete Ürün Ekleme
* API Metodu: `POST /cart`
* Açıklama: Kullanıcının belirli bir ürünü seçilen adet bilgisi ile aktif sepetine eklemesini sağlar. Eğer ürün zaten sepette mevcutsa adet bilgisi güncellenir. Ürün stokta değilse veya istenen adet stok miktarını aşıyorsa işlem gerçekleştirilmez ve hata mesajı döndürülür. Sepet işlemleri yalnızca giriş yapmış kullanıcılar için geçerlidir.

---

## Sepetten Ürün Silme
* API Metodu: `DELETE /cart/{productId}`
* Açıklama: Kullanıcının aktif sepetinde bulunan belirli bir ürünü kaldırmasını sağlar. Ürün sepetten silindiğinde sepet toplam tutarı otomatik olarak yeniden hesaplanır. Eğer sepet boş kalırsa sistem sepete ait toplam tutarı sıfırlar. İşlem yalnızca giriş yapmış kullanıcı tarafından gerçekleştirilebilir.