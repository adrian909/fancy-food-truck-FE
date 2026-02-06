# 🔒 Ghid de Securitate - Fancy Food Truck

## Implementări de Securitate

### 1. ✅ Content Security Policy (CSP)

**Locație:** `index.html`

CSP-ul previne atacurile XSS prin restricționarea surselor de resurse:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://backend.trifadrian.ro https://maps.googleapis.com;
">
```

**Ce face:**
- Permite scripturi doar de la domeniul propriu și Google Maps
- Permite stiluri de la domeniul propriu și Google Fonts
- Permite imagini de oriunde (pentru product images)
- Permite conexiuni API doar la backend-ul tău și Google Maps

### 2. ✅ Token Refresh System

**Locație:** `src/shared/utils/auth.js`

Sistem complet de autentificare cu token refresh:

**Funcții principale:**
- `storeTokens(token, refreshToken, expiresIn)` - Salvează token-urile
- `ensureValidToken()` - Verifică și reînprospătează token-ul automat
- `refreshAccessToken()` - Reînprospătează access token-ul
- `setupTokenRefresh(apiUrl, onExpired)` - Configurează refresh automat
- `logout()` - Logout complet și curățare date

**Cum funcționează:**
```javascript
// 1. La login, salvezi token-urile
storeTokens(accessToken, refreshToken, 3600);

// 2. Înainte de orice API call, verifici token-ul
await ensureValidToken();

// 3. Token-ul se reînprospătează automat când:
//    - Este expirat
//    - Mai sunt 5 minute până la expirare (preventiv)

// 4. Setup automatic refresh în App.jsx
setupTokenRefresh('https://backend.trifadrian.ro', () => {
  // Logout dacă token-ul nu se poate reîmprospăta
  logout();
  alert("Sesiunea ta a expirat");
});
```

### 3. ✅ CSRF Protection

**Locație:** `src/shared/utils/security.js` și `src/client/api/apiClient.js`

Protecție împotriva atacurilor Cross-Site Request Forgery:

**Funcții:**
- `generateCSRFToken()` - Generează token aleatoriu
- `storeCSRFToken(token)` - Salvează în sessionStorage
- `getCSRFToken()` - Recuperează token-ul
- `validateCSRFToken(token)` - Validează token-ul

**Implementare:**
```javascript
// 1. Token CSRF se generează automat la încărcarea aplicației
if (!getCSRFToken()) {
  storeCSRFToken(generateCSRFToken());
}

// 2. Token-ul se trimite cu fiecare request
const response = await fetch(url, {
  headers: {
    "X-CSRF-Token": csrfToken,
    ...otherHeaders
  }
});

// 3. Backend-ul trebuie să valideze token-ul
```

### 4. ✅ Input Sanitization

**Locație:** `src/shared/utils/security.js`

Funcții complete de sanitizare a input-urilor:

#### Funcții disponibile:

**sanitizeHTML(input)**
- Previne XSS prin escapare caractere speciale
- Convertește `<`, `>`, `&`, `"`, `'`, `/` în entități HTML

**sanitizeEmail(email)**
- Validează format email
- Returnează null dacă invalid
- Convertește la lowercase

**sanitizePhone(phone)**
- Permite doar cifre și caractere telefonice (`+`, `-`, `(`, `)`)
- Elimină caractere periculoase

**sanitizeAddress(address)**
- Elimină tag-uri `<script>`
- Elimină `javascript:` și event handlers
- Previne injection în adrese

**sanitizeText(input, maxLength)**
- Sanitizează text general
- Limitează lungimea
- Combină sanitizeHTML + truncate

**sanitizeNumber(input, min, max)**
- Validează și limitează numere
- Returnează null dacă invalid

**Exemple de utilizare:**

```javascript
import { sanitizeEmail, sanitizeText, sanitizeAddress } from '../shared/utils/security';

// În formulare
const handleSubmit = (data) => {
  const cleanEmail = sanitizeEmail(data.email);
  if (!cleanEmail) {
    alert("Email invalid");
    return;
  }
  
  const cleanName = sanitizeText(data.name, 100);
  const cleanAddress = sanitizeAddress(data.address);
  
  // Trimite date curate la backend
  submitData({ email: cleanEmail, name: cleanName, address: cleanAddress });
};
```

### 5. ✅ Rate Limiting

**Locație:** `src/shared/utils/security.js`

Limitare request-uri pentru a preveni abuse:

**Clasa RateLimiter:**
```javascript
const apiRateLimiter = new RateLimiter(30, 60000); // 30 requests/minute

// Verificare automată în apiClient.js
if (!apiRateLimiter.isAllowed()) {
  throw new Error("Rate limit exceeded");
}
```

**Configurare:**
- Maxim 30 request-uri per minut
- Fereastră glisantă de 60 secunde
- Mesaj de eroare când limita e atinsă

### 6. ✅ Security Headers

**Locație:** `index.html`

Headere suplimentare de securitate:

```html
<!-- Previne MIME type sniffing -->
<meta http-equiv="X-Content-Type-Options" content="nosniff">

<!-- Previne clickjacking -->
<meta http-equiv="X-Frame-Options" content="SAMEORIGIN">

<!-- XSS Protection (legacy, dar util) -->
<meta http-equiv="X-XSS-Protection" content="1; mode=block">

<!-- Referrer policy -->
<meta name="referrer" content="strict-origin-when-cross-origin">
```

### 7. ✅ Safe URL Validation

**Locație:** `src/shared/utils/security.js`

Previne open redirect vulnerabilities:

```javascript
isSafeURL(url, ['fancytruck.ro', 'backend.trifadrian.ro'])
```

## 🛡️ Checklist Implementare

### Frontend ✅
- [x] Content Security Policy
- [x] Token refresh mechanism
- [x] CSRF token generation și trimitere
- [x] Input sanitization complet
- [x] Rate limiting
- [x] Security headers
- [x] Safe URL validation

### Backend ⚠️ (Trebuie implementat)
- [ ] Validare CSRF token
- [ ] Endpoint `/api/auth/refresh` pentru token refresh
- [ ] JWT token generation și validare
- [ ] Rate limiting server-side
- [ ] Input validation server-side
- [ ] Criptare parole (bcrypt/argon2)
- [ ] HTTPS obligatoriu
- [ ] Security headers (Helmet.js)

## 📚 Cum să folosești sistemul

### 1. Sanitizare formulare

```javascript
import { sanitizeEmail, sanitizeText } from '../shared/utils/security';

const handleLogin = (formData) => {
  const email = sanitizeEmail(formData.email);
  const password = sanitizeText(formData.password, 100);
  
  if (!email) {
    alert("Email invalid");
    return;
  }
  
  // Continuă cu autentificarea
  login(email, password);
};
```

### 2. API Calls securizate

```javascript
import { apiGet, apiPost } from './api/apiClient';

// Token și CSRF sunt adăugate automat
const data = await apiGet('/api/products');
const result = await apiPost('/api/orders', orderData);
```

### 3. Token refresh automat

```javascript
// În App.jsx - deja implementat
useEffect(() => {
  const intervalId = setupTokenRefresh('https://backend.trifadrian.ro', () => {
    // Logout când token expiră
    logout();
    setCurrentUser(null);
  });

  return () => clearInterval(intervalId);
}, []);
```

## 🔐 Recomandări Backend

Pentru a completa securitatea, backend-ul trebuie să implementeze:

### 1. Token Refresh Endpoint

```javascript
// POST /api/auth/refresh
{
  "refreshToken": "abc123..."
}

// Response
{
  "accessToken": "new_token",
  "refreshToken": "new_refresh_token",
  "expiresIn": 3600
}
```

### 2. CSRF Validation Middleware

```javascript
app.use((req, res, next) => {
  const token = req.headers['x-csrf-token'];
  const sessionToken = req.session.csrfToken;
  
  if (token !== sessionToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  next();
});
```

### 3. JWT Middleware

```javascript
const jwt = require('jsonwebtoken');

app.use((req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
```

## 🎯 Testare Securitate

### 1. Test XSS
```javascript
// Încearcă să introduci în formulare:
<script>alert('XSS')</script>
javascript:alert('XSS')

// Ar trebui să fie escapate automat
```

### 2. Test CSRF
```javascript
// Încearcă request fără token CSRF
fetch('https://backend.trifadrian.ro/api/products', {
  method: 'POST',
  // Fără X-CSRF-Token header
});

// Ar trebui să fie respins de backend (403)
```

### 3. Test Rate Limiting
```javascript
// Fă 31+ requests rapid
for (let i = 0; i < 35; i++) {
  await apiGet('/api/products');
}

// După 30, ar trebui să primești eroare
```

## 📖 Documentație Adițională

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **CSP Guide**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- **JWT Best Practices**: https://tools.ietf.org/html/rfc8725

---

**Autor:** Adrian
**Data ultimei actualizări:** Februarie 2026
