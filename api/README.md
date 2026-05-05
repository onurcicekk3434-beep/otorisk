# OtoRisk MVP

Tek sayfalık, maliyetsiz çalışan araç ilanı risk kontrol aracı.

## Nasıl açılır?

`index.html` dosyasını tarayıcıda aç.

## İlk sürüm ne yapar?

- İlan metninden risk kelimelerini yakalar.
- Marka, model, versiyon/motor, yıl ve şehir alanlarını listeden seçtirir.
- Yaşa göre kilometreyi yorumlar.
- Yayın ortamında arama API'si bağlıysa web sonuçlarından fiyat sinyali toplar.
- Hasar, boya ve değişen bilgisini risk skoruna katar.
- Satıcıya sorulacak kontrol sorularını üretir.

## Veri çekiyor mu?

Yerel `file://` açılışında hayır. Gerçek araştırma için siteyi Vercel gibi bir yerde yayınlayıp `TAVILY_API_KEY` ortam değişkeni eklemek gerekir. Böylece `/api/research` endpoint'i marka, model, versiyon/motor, yıl, kilometre ve şehirle canlı web araması yapar, fiyat sinyallerini çıkarır ve rapora kaynak listesi ekler.

Bu yaklaşım ilan sitelerini doğrudan kazımaya çalışmaz; arama API'sinden gelen herkese açık sonuçları kullanır. Daha sağlam piyasa verisi için ileride resmi/izinli veri sağlayıcı eklenmelidir.

## Neden tarayıcıdan direkt araştırmıyor?

API anahtarını tarayıcıya koymak güvenli değildir. Anahtar sunucuda kalmalı, tarayıcı sadece kendi backend endpoint'ine istek atmalıdır.

## Sonraki mantıklı adımlar

- PDF rapor çıktısı.
- Kullanıcı geçmişi.
- AdSense entegrasyonu.
- Ekspertiz firması yönlendirme alanı.
- İlan linkinden veri çekme yerine kullanıcıdan manuel metin alma akışını iyileştirme.
