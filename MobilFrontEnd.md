# Mobil Frontend Görev Dağılımı

Bu dokümanda, mobil uygulamanın kullanıcı arayüzü (UI) ve kullanıcı deneyimi (UX) görevleri listelenmektedir. Her grup üyesi, kendisine atanan ekranların tasarımı, implementasyonu ve kullanıcı etkileşimlerinden sorumludur.

---

## Grup Üyelerinin Mobil Frontend Görevleri

1. [Dilan Günsili'nin Mobil Frontend Görevleri](Dilan-Günsili/Dilan-Günsili-Mobil-Frontend-Gorevleri.md)
2. [Gülnihal Köse'nin Mobil Frontend Görevleri](Gülnihal-Köse/Gülnihal-Köse-Mobil-Frontend-Gorevleri.md)
3. [Ebrar Karakoç'un Mobil Frontend Görevleri](Ebrar-Karakoc/Ebrar-Karakoc-Mobil-Frontend-Gorevleri.md)
4. [Şerife Nur Yılmaz'ın Mobil Frontend Görevleri](Şerife-Nur-Yılmaz/Şerife-Nur-Yılmaz-Mobil-Frontend-Gorevleri.md)

---

## Genel Mobil Frontend Prensipleri

### 1. Tasarım Sistemi
- **Renk Paleti:** Renk paleti merkezi olarak tanımlıdır ve ekranlarda bu semantik renkler kullanılır: primary, background, surface, border, text, success, error, warning.
- **Tipografi:** Tipografi çoğunlukla ekran bazlı style objeleriyle yönetilir; global typography token sistemi henüz sınırlıdır.
- **Spacing:** Spacing yaklaşımı tutarlı kart ve form aralıklarıyla uygulanır (özellikle 8, 10, 12, 14, 16, 24 ölçeği).
- **Iconography:** Icon set olarak Ionicons kullanılır.

### 2. Responsive Tasarım
- Ekranlar flex tabanlı responsive düzenle oluşturulmuştur.
- Ürün detayında ekran genişliğine göre dinamik görsel alanı kullanılır.
- Safe area yönetimi uygulama genelinde aktiftir.
- Uygulama portrait-first yapıdadır; tablet ve landscape için özel layout varyantları sınırlıdır.

### 3. Kullanıcı Deneyimi (UX)
- **Loading States:** Skeleton screens, Activity indicators
- **Error Handling:** Retry destekli hata bileşeni
- **Empty States:** Empty state için ortak boş durum bileşeni kullanılır
- **Feedback:** Kullanıcı aksiyonlarına anında geri bildirim (toast, snackbar)

### 4. Erişilebilirlik (Accessibility)
- Temel buton boyutları ve kontrastlı renk kullanımıyla kullanılabilirlik korunur.
- Screen reader odaklı accessibilityLabel ve benzeri etiketler proje genelinde henüz sistematik değildir.
- Font scaling ve yüksek kontrast modu için açık bir global politika tanımlı değildir.

### 5. Performans
- Server state yönetimi TanStack Query ile yapılır; cache, staleTime ve retry politikaları aktiftir.
- Liste performansı için FlatList ve sonsuz listeleme yaklaşımı kullanılır.
- Görsellerde Expo Image kullanılır.
- Anlamlı ve sınırlı animasyonlar uygulanır (örnek: sepet badge animasyonu, ekran geçiş animasyonu).

### 6. Navigasyon
- Navigasyon mimarisi Expo Router tabanlıdır.
- Alt sekmeler ve üst seviye stack birlikte kullanılır.
- Auth ve uygulama akışı route bazlı yönlendirme ile ayrıştırılmıştır.
- Dinamik route yapıları aktiftir (ürün, kategori, sipariş detay).
- Deep linking altyapısı paket seviyesinde mevcut, fakat özel senaryolar için kapsam sınırlıdır.

### 7. Form Yönetimi
- Formlar React Hook Form + Zod ile doğrulanır.
- Alan bazlı hata mesajları UI’da gösterilir.
- Gönderim sırasında buton disable ve loading davranışı uygulanır.
- Klavye yönetimi temel seviyededir; global keyboard avoidance standardı sınırlıdır.
- Form state persistence varsayılan olarak uygulanmamıştır.

### 8. Platform Özellikleri
- Expo ekosistemi ile Android, iOS ve Web hedeflenir.
- Platformlar arası tutarlı görünüm için ortak component ve renk sistemi kullanılır.
- Native hissi artırmak için haptik geri bildirim ve geçiş animasyonları kullanılır.