# SEO Setup - Back Software

## ✅ Completato

### 1. robots.txt
- Posizione: `public/robots.txt`
- Permette crawling di tutto il sito
- Puntamento corretto a sitemap.xml

### 2. sitemap.xml
- Posizione: `public/sitemap.xml`
- Include: Home, Servizi, Progetti, Contatti, Cookie Policy
- `lastmod` aggiornato al 14 Gennaio 2025

### 3. Schema.org JSON-LD (layout.jsx)
Implementato `@graph` con 3 entità:

**LocalBusiness** (`#business`)
- Nome, descrizione, contatti
- Indirizzo completo con CAP 10015
- Coordinate geografiche (Ivrea)
- sameAs: Instagram, LinkedIn, Facebook
- serviceType: 5 servizi principali
- areaServed: raggio 50km da Ivrea
- priceRange: €€
- Orari di apertura
- Catalogo servizi dettagliato

**WebSite** (`#website`)
- Collegamento al publisher
- SearchAction per ricerca interna

**BreadcrumbList**
- Home → Servizi → Progetti → Contatti

### 4. Meta Tags Ottimizzati
- Title: template + default ottimizzato per keywords locali
- Description: 200 caratteri con focus su Ivrea/Torino
- Keywords: 11 termini target (local SEO)
- Open Graph: completo con riferimento immagine
- Twitter Cards: summary_large_image
- Canonical URL
- Category: business

---

## ⚠️ Da Completare

### 1. Google Search Console
Sostituire in `app/layout.jsx` riga 56:
```javascript
google: 'GOOGLE_SEARCH_CONSOLE_CODE_HERE',
```
Con il codice di verifica reale da Google Search Console.

**Istruzioni:**
1. Vai su https://search.google.com/search-console
2. Aggiungi proprietà: `https://backsoftware.it`
3. Scegli metodo "Tag HTML"
4. Copia il codice (es: `abc123def456`)
5. Incolla nel file layout.jsx

### 2. Immagine Open Graph
Creare `public/og-image.jpg` (1200x630 px)

**Requisiti:**
- Dimensioni: 1200×630 pixel
- Formato: JPG o PNG
- Peso: < 8MB
- Contenuto: Logo + tagline + servizi

### 3. Backlink & Indicizzazione
**Azioni consigliate:**
- [ ] Registrare su Google Business Profile
- [ ] Creare profilo LinkedIn Company
- [ ] Verificare pagina Facebook Business
- [ ] Aggiungere sito a PagineGialle.it
- [ ] Inviare sitemap a Google Search Console

---

## 📊 Monitoraggio SEO

### Strumenti Consigliati
1. **Google Search Console** - Monitorare crawling e keyword
2. **Google Analytics 4** - Traffico e comportamento utenti
3. **PageSpeed Insights** - Performance Core Web Vitals
4. **Screaming Frog** - Audit tecnico (gratuito 500 URL)

### Metriche da Tracciare
- Posizionamento per: "siti web Ivrea", "agenzia web Torino"
- Click-through rate (CTR) dai risultati di ricerca
- Core Web Vitals (LCP, FID, CLS)
- Backlinks acquisiti

---

## 🚀 Prossimi Passi Contenuto

Per migliorare il posizionamento organico:

1. **Blog/Articoli** - Creare sezione `/blog` con articoli su:
   - "Quanto costa un sito web nel 2025?"
   - "Meta Ads vs Google Ads: quale scegliere?"
   - "Guida gestionali su misura per PMI"

2. **Case Study** - Pagine dedicate per ogni progetto principale

3. **FAQ Page** - Schema.org FAQPage per rich snippets

4. **Testimonianze** - Recensioni clienti con Schema.org Review
