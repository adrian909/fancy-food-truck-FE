# 🍔 Fancy Food Truck - Frontend

O aplicație modernă de comandă online pentru food truck-uri, construită cu React, Vite și Tailwind CSS.

## ✨ Caracteristici

- 🎨 **Design modern și responsive** - interfață prietenoasă pe toate dispozitivele
- 🌍 **Multi-limbă** - suport pentru Română și Engleză
- 🛒 **Coș de cumpărături** - gestionare facilă a comenzilor
- 📍 **Integrare Google Maps** - selectare precisă a adresei de livrare
- 👤 **Autentificare utilizatori** - conturi personalizate pentru clienți
- 🔐 **PanouAdmin** - gestionare produse și comenzi
- 🎭 **Animații fluide** - experiență de utilizare premium cu Framer Motion
- 🌓 **Mod întunecat/luminos** - personalizare vizuală
- ⚡ **Optimizat pentru performanță** - încărcare rapidă și experiență optimizată

## 🚀 Tehnologii

- **React 19** - framework UI modern
- **Vite** - build tool ultra-rapid
- **Tailwind CSS** - styling utility-first
- **Framer Motion** - animații și tranziții
- **Google Maps API** - integrare hărți și geocoding
- **Firebase** - backend și autentificare
- **Lucide React** - iconuri moderne

## 📋 Cerințe

- Node.js 18+ 
- npm sau yarn
- Google Maps API Key
- Firebase project

## 🛠️ Instalare

1. **Clonează repository-ul**
```bash
git clone https://github.com/adrian909/fancy-food-truck-FE.git
cd fancy-food-truck-FE
```

2. **Instalează dependențele**
```bash
npm install
```

3. **Configurează variabilele de mediu**

Creează un fișier `.env` în rădăcina proiectului:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
```

4. **Pornește serverul de development**
```bash
npm run dev
```

Aplicația va fi disponibilă la `http://localhost:5173`

## 📦 Build pentru producție

```bash
npm run build
```

Fișierele optimizate vor fi generate în folderul `dist/`

## 🎯 Structura proiectului

```
fancy-food-truck/
├── src/
│   ├── client/
│   │   ├── components/     # Componente React
│   │   │   ├── About.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Menu.jsx
│   │   │   ├── Navigation.jsx
│   │   │   └── ...
│   │   ├── pages/          # Pagini principale
│   │   │   ├── Admin.jsx
│   │   │   └── Auth.jsx
│   │   ├── context/        # React Context
│   │   ├── hooks/          # Custom hooks
│   │   ├── constants/      # Constante și traduceri
│   │   └── styles/         # Fișiere CSS
│   ├── shared/
│   │   └── utils/          # Funcții utilitare
│   └── main.jsx            # Entry point
├── public/                 # Assets statice
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🔑 Funcționalități principale

### Pentru Clienți
- Vizualizare meniu cu filtrare pe categorii
- Personalizare produse (adăugare/eliminare ingrediente)
- Coș de cumpărături interactiv
- Opțiuni livrare/ridicare personală
- Tracking comenzi în timp real
- Profil utilizator cu istoric comenzi
- Selectare adresă cu Google Maps

### Pentru Administratori
- Panou de administrare dedicat
- Gestionare produse (CRUD complet)
- Upload imagini produse
- Gestionare comenzi
- Actualizare status comenzi
- Configurare locație zilnică

## 🌐 API Integration

Aplicația se conectează la un backend Firebase pentru:
- Autentificare utilizatori
- Gestionare produse
- Procesare comenzi
- Stocare date utilizatori

Backend URL: `https://backend.trifadrian.ro`

## 🎨 Personalizare

### Culori
Culorile principale pot fi modificate în `tailwind.config.js`:

```javascript
colors: {
  'fastfood-red': '#E63946',
  'fastfood-orange': '#F77F00',
  'fastfood-yellow': '#FCBF49',
  'fastfood-blue': '#06AED5',
}
```

### Traduceri
Traducerile se găsesc în `src/client/constants/translations.js`

## 📱 Responsive Design

Aplicația este complet responsive și optimizată pentru:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1280px+)

## 🔒 Securitate

- Validare formulare client-side
- Sanitizare input utilizatori
- Protecție rute admin
- Token-based authentication

## 🚧 Development

```bash
# Pornește dev server
npm run dev

# Linting
npm run lint

# Build pentru producție
npm run build

# Preview build
npm run preview
```

## 📄 Licență

MIT License - vezi fișierul LICENSE pentru detalii

## 👨‍💻 Autor

**Adrian**
- GitHub: [@adrian909](https://github.com/adrian909)

## 🤝 Contribuții

Contribuțiile sunt binevenite! Pentru schimbări majore, te rog deschide mai întâi un issue pentru a discuta ce ai dori să schimbi.

## 📞 Suport

Pentru întrebări sau probleme, deschide un issue pe GitHub.

---

Făcut cu ❤️ pentru pasionații de street food!