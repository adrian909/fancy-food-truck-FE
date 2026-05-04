import { useEffect } from "react";
import { Shield, Mail, Phone, MapPin, ChevronRight } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";

const Section = ({ id, title, children }) => (
  <section id={id} className="mb-10">
    <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-fastfood-orange">
      <ChevronRight size={20} />
      {title}
    </h2>
    <div className="space-y-3 text-sm leading-relaxed">{children}</div>
  </section>
);

const P = ({ children, className = "" }) => <p className={`text-gray-700 dark:text-neutral-300 ${className}`}>{children}</p>;
const B = ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>;
const Li = ({ children }) => (
  <li className="flex items-start gap-2 text-gray-700 dark:text-neutral-300">
    <span className="text-fastfood-orange mt-0.5">•</span>
    <span>{children}</span>
  </li>
);
const Ul = ({ children }) => <ul className="space-y-1.5 ml-2">{children}</ul>;

const Mix = ({ p }) => p.map((part, i) => i % 2 === 1 ? <B key={i}>{part}</B> : part);

const CONTENT = {
  ro: {
    docTitle: "Politica de Confidențialitate – FancyTruck",
    title: "Politica de Confidențialitate",
    updated: "Ultima actualizare: 4 mai 2026",
    intro: ["FancyTruck", " respectă confidențialitatea datelor tale. Această politică explică ce date colectăm, de ce, cum le protejăm și ce drepturi ai conform ", "Regulamentului (UE) 2016/679 (GDPR)", " și legislației române aplicabile."],
    s1title: "1. Operatorul de date",
    s1fields: [
      ["Denumire:", " FancyTruck S.R.L. (sau persoana fizică autorizată)"],
      ["Sediu:", " Sebeș, județul Alba, România"],
      ["Email:", " hello@fancytruck.ro"],
      ["Telefon:", " +40 (123) 456-7890"],
      ["CUI/CIF:", " [DE COMPLETAT]"],
    ],
    s1p: "Suntem responsabili pentru prelucrarea datelor tale cu caracter personal în conformitate cu legislația aplicabilă, inclusiv GDPR și Legea nr. 190/2018.",
    s2title: "2. Ce date colectăm",
    s2h1: "2.1 Date de înregistrare a contului",
    s2list1: ["Nume complet", "Adresă de e-mail", "Parolă (stocată exclusiv criptat, hash bcrypt – nu avem acces la parola ta)"],
    s2h2: "2.2 Date pentru livrare și comenzi",
    s2list2: ["Număr de telefon", "Adresă de livrare (stradă, număr, apartament, oraș)", "Conținutul comenzii (produse, cantități)", "Metoda de plată aleasă (card / numerar – nu stocăm date de card)", "Istoricul comenzilor"],
    s2h3: "2.3 Date tehnice",
    s2list3: ["Token de autentificare JWT (stocat local în browser, expiră în 24 ore)", "Token CSRF de securitate (stocat în sesiune, șters la închiderea browserului)", "Preferință temă (întunecată / luminoasă)", "Adresă IP (procesată de serverul backend pentru securitate)"],
    s2h4: "2.4 Date de localizare (opțional)",
    s2list4: ["Coordonate GPS – numai dacă apeși butonul Localizare în formular; nu stocăm coordonatele permanent"],
    s3title: "3. Scopurile și temeiurile prelucrării",
    s3headers: ["Scop", "Temei juridic (GDPR)"],
    s3rows: [
      ["Crearea și gestionarea contului de utilizator", "Art. 6(1)(b) – executarea unui contract"],
      ["Procesarea și livrarea comenzilor", "Art. 6(1)(b) – executarea unui contract"],
      ["Contactarea ta privind comanda (telefon, e-mail)", "Art. 6(1)(b) – executarea unui contract"],
      ["Îmbunătățirea serviciilor și analize interne", "Art. 6(1)(f) – interes legitim"],
      ["Conformitate legală (facturare, fiscal)", "Art. 6(1)(c) – obligație legală"],
      ["Marketing direct (newslettere)", "Art. 6(1)(a) – consimțământ explicit"],
      ["Chat live Tawk.to (asistență clienți)", "Art. 6(1)(a) – consimțământ explicit"],
    ],
    s4title: "4. Cât timp păstrăm datele",
    s4list: [
      ["Date de cont:", " pe durata existenței contului + 3 ani după închidere (obligații fiscale)"],
      ["Date comenzi:", " 5 ani de la data comenzii (Legea nr. 82/1991 – contabilitate)"],
      ["Date de marketing:", " până la retragerea consimțământului"],
      ["Token-uri tehnice:", " JWT – 24 ore; CSRF – durata sesiunii"],
      ["Localizare GPS:", " nu se stochează pe termen lung"],
    ],
    s5title: "5. Terțe părți care primesc datele tale",
    s5p: ["Colaborăm cu furnizorii de mai jos. ", "Nu vindem niciodată datele tale.", ""],
    s5providers: [
      { name: "Google Maps / Places API", country: "SUA (protecție adecvată – Data Privacy Framework UE-SUA)", purpose: "Geocodificare adrese, sugestii stradă, hartă interactivă", legal: "Consimțământ (cookie-uri funcționale)", link: "https://policies.google.com/privacy" },
      { name: "Google Fonts", country: "SUA (Data Privacy Framework UE-SUA)", purpose: "Furnizare fonturi web (Poppins, Inter)", legal: "Interes legitim – funcționalitate site", link: "https://policies.google.com/privacy" },
      { name: "Tawk.to", country: "SUA / servere globale", purpose: "Chat live cu clienții; primește nume și e-mail dacă ești autentificat", legal: "Consimțământ explicit", link: "https://www.tawk.to/privacy-policy/" },
      { name: "Firebase (Google)", country: "UE / SUA (Data Privacy Framework)", purpose: "Stocarea imaginilor produselor", legal: "Interes legitim – funcționalitate site", link: "https://firebase.google.com/support/privacy" },
      { name: "Unsplash", country: "Canada / CDN global", purpose: "Imagini decorative site (hero, produse demo)", legal: "Interes legitim", link: "https://unsplash.com/privacy" },
    ],
    s5labels: { purpose: "Scop:", country: "Locație:", legal: "Temei:", policy: "Politică:" },
    s6title: "6. Drepturile tale (GDPR, art. 15-22)",
    s6p: "Ai dreptul să:",
    s6list: [
      ["Accesezi", " datele pe care le deținem despre tine (art. 15)"],
      ["Corectezi", " datele inexacte (art. 16) – direct din profilul tău"],
      ["Ștergi", " contul și datele asociate (\"dreptul de a fi uitat\", art. 17)"],
      ["Restricționezi", " prelucrarea în anumite situații (art. 18)"],
      ["Portabilității datelor", " – exportul datelor în format JSON (art. 20)"],
      ["Te opui", " prelucrării bazate pe interes legitim (art. 21)"],
      ["Retragi consimțământul", " oricând, fără efecte retroactive (art. 7)"],
    ],
    s6contact: ["Pentru a exercita aceste drepturi, trimite un e-mail la \", \"hello@fancytruck.ro\", \" cu subiectul „Solicitare GDPR\". Răspundem în maxim ", "30 de zile calendaristice", "."],
    s6anspdcp: ["Dacă consideri că drepturile tale nu sunt respectate, poți depune o plângere la: ", "Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)", ", B-dul G-ral. Gheorghe Magheru 28-30, sector 1, București, "],
    s7title: "7. Securitatea datelor",
    s7list: [
      "Transmiterea datelor se face exclusiv prin conexiuni criptate HTTPS/TLS",
      "Parolele sunt hash-uite (bcrypt) – nu le cunoaștem în clar",
      "Autentificarea folosește token-uri JWT cu expirare la 24 ore și protecție CSRF",
      "Accesul la date personale este restricționat personalului autorizat",
      "Infrastructura backend este găzduită pe servere securizate în UE/EEA",
    ],
    s8title: "8. Date privind minorii",
    s8p: "Serviciile noastre nu sunt destinate persoanelor sub 16 ani. Nu colectăm intenționat date de la minori. Dacă identificăm astfel de date, le vom șterge imediat.",
    s9title: "9. Cookie-uri",
    s9p: "Folosim cookie-uri și tehnologii similare. Detalii complete în",
    s9link: "Politica de Cookie-uri",
    s10title: "10. Modificări ale politicii",
    s10p: "Putem actualiza această politică. Te vom notifica prin e-mail sau un anunț vizibil pe site cu cel puțin 14 zile înainte de intrarea în vigoare a modificărilor semnificative. Data ultimei actualizări este afișată în antetul acestei pagini.",
    contactTitle: "Contact privind datele personale",
  },
  en: {
    docTitle: "Privacy Policy – FancyTruck",
    title: "Privacy Policy",
    updated: "Last updated: 4 May 2026",
    intro: ["FancyTruck", " respects the privacy of your data. This policy explains what data we collect, why, how we protect it, and what rights you have under the ", "EU Regulation 2016/679 (GDPR)", " and applicable Romanian legislation."],
    s1title: "1. Data Controller",
    s1fields: [
      ["Name:", " FancyTruck S.R.L. (or sole trader)"],
      ["Registered address:", " Sebeș, Alba County, Romania"],
      ["Email:", " hello@fancytruck.ro"],
      ["Phone:", " +40 (123) 456-7890"],
      ["Tax ID:", " [TO BE FILLED IN]"],
    ],
    s1p: "We are responsible for the processing of your personal data in accordance with applicable legislation, including GDPR and Law no. 190/2018.",
    s2title: "2. Data We Collect",
    s2h1: "2.1 Account registration data",
    s2list1: ["Full name", "Email address", "Password (stored exclusively encrypted, bcrypt hash — we have no access to your password)"],
    s2h2: "2.2 Delivery and order data",
    s2list2: ["Phone number", "Delivery address (street, number, apartment, city)", "Order contents (products, quantities)", "Chosen payment method (card / cash — we do not store card data)", "Order history"],
    s2h3: "2.3 Technical data",
    s2list3: ["JWT authentication token (stored locally in the browser, expires in 24 hours)", "CSRF security token (stored in session, deleted when the browser is closed)", "Theme preference (dark / light)", "IP address (processed by the backend server for security purposes)"],
    s2h4: "2.4 Location data (optional)",
    s2list4: ["GPS coordinates — only if you press the 'Locate me' button in the form; coordinates are not stored permanently"],
    s3title: "3. Purposes & Legal Bases for Processing",
    s3headers: ["Purpose", "Legal basis (GDPR)"],
    s3rows: [
      ["Creating and managing the user account", "Art. 6(1)(b) – performance of a contract"],
      ["Processing and delivering orders", "Art. 6(1)(b) – performance of a contract"],
      ["Contacting you about your order (phone, email)", "Art. 6(1)(b) – performance of a contract"],
      ["Service improvement and internal analytics", "Art. 6(1)(f) – legitimate interest"],
      ["Legal compliance (invoicing, tax)", "Art. 6(1)(c) – legal obligation"],
      ["Direct marketing (newsletters)", "Art. 6(1)(a) – explicit consent"],
      ["Tawk.to live chat (customer support)", "Art. 6(1)(a) – explicit consent"],
    ],
    s4title: "4. How Long We Retain Data",
    s4list: [
      ["Account data:", " for the lifetime of the account + 3 years after closure (fiscal obligations)"],
      ["Order data:", " 5 years from the order date (Law no. 82/1991 – accounting)"],
      ["Marketing data:", " until consent is withdrawn"],
      ["Technical tokens:", " JWT – 24 hours; CSRF – session duration"],
      ["GPS location:", " not stored long-term"],
    ],
    s5title: "5. Third Parties Receiving Your Data",
    s5p: ["We work with the providers below. ", "We never sell your data.", ""],
    s5providers: [
      { name: "Google Maps / Places API", country: "USA (adequate protection – EU-US Data Privacy Framework)", purpose: "Address geocoding, street suggestions, interactive map", legal: "Consent (functional cookies)", link: "https://policies.google.com/privacy" },
      { name: "Google Fonts", country: "USA (EU-US Data Privacy Framework)", purpose: "Web font delivery (Poppins, Inter)", legal: "Legitimate interest – site functionality", link: "https://policies.google.com/privacy" },
      { name: "Tawk.to", country: "USA / global servers", purpose: "Live chat with customers; receives name and email if you are logged in", legal: "Explicit consent", link: "https://www.tawk.to/privacy-policy/" },
      { name: "Firebase (Google)", country: "EU / USA (Data Privacy Framework)", purpose: "Product image storage", legal: "Legitimate interest – site functionality", link: "https://firebase.google.com/support/privacy" },
      { name: "Unsplash", country: "Canada / global CDN", purpose: "Decorative site images (hero, demo products)", legal: "Legitimate interest", link: "https://unsplash.com/privacy" },
    ],
    s5labels: { purpose: "Purpose:", country: "Location:", legal: "Legal basis:", policy: "Policy:" },
    s6title: "6. Your Rights (GDPR, art. 15-22)",
    s6p: "You have the right to:",
    s6list: [
      ["Access", " the data we hold about you (art. 15)"],
      ["Rectify", " inaccurate data (art. 16) – directly from your profile"],
      ["Erase", " your account and associated data ('right to be forgotten', art. 17)"],
      ["Restrict", " processing in certain situations (art. 18)"],
      ["Data portability", " – export your data in JSON format (art. 20)"],
      ["Object", " to processing based on legitimate interest (art. 21)"],
      ["Withdraw consent", " at any time, without retroactive effect (art. 7)"],
    ],
    s6contact: ["To exercise these rights, send an email to ", "hello@fancytruck.ro", " with the subject 'GDPR Request'. We respond within a maximum of ", "30 calendar days", "."],
    s6anspdcp: ["If you believe your rights are not being respected, you may lodge a complaint with: ", "The National Supervisory Authority for Personal Data Processing (ANSPDCP)", ", B-dul G-ral. Gheorghe Magheru 28-30, sector 1, Bucharest, "],
    s7title: "7. Data Security",
    s7list: [
      "Data is transmitted exclusively over encrypted HTTPS/TLS connections",
      "Passwords are hashed (bcrypt) — we do not know them in plain text",
      "Authentication uses JWT tokens expiring in 24 hours with CSRF protection",
      "Access to personal data is restricted to authorised personnel",
      "Backend infrastructure is hosted on secure servers in the EU/EEA",
    ],
    s8title: "8. Data Relating to Minors",
    s8p: "Our services are not intended for persons under 16 years of age. We do not intentionally collect data from minors. If we identify such data, we will delete it immediately.",
    s9title: "9. Cookies",
    s9p: "We use cookies and similar technologies. Full details in our",
    s9link: "Cookie Policy",
    s10title: "10. Policy Changes",
    s10p: "We may update this policy. We will notify you by email or a prominent notice on the site at least 14 days before significant changes take effect. The date of the last update is shown in the header of this page.",
    contactTitle: "Personal data contact",
  },
};

export default function PrivacyPolicy({ dark }) {
  const { language } = useLanguage();
  const c = CONTENT[language] || CONTENT.ro;

  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.title = c.docTitle;
  }, [c.docTitle]);

  return (
    <div className={`min-h-screen ${dark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="bg-gradient-to-r from-fastfood-red to-fastfood-orange py-16 px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <Shield size={48} className="mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl sm:text-4xl font-black mb-3">{c.title}</h1>
          <p className="opacity-80 text-sm">{c.updated}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className={`rounded-xl p-5 mb-10 border-l-4 border-fastfood-orange ${dark ? "bg-gray-900" : "bg-orange-50"}`}>
          <P><Mix p={c.intro} /></P>
        </div>

        <Section id="controller" title={c.s1title}>
          {c.s1fields.map(([bold, text], i) => <P key={i}><B>{bold}</B>{text}</P>)}
          <P>{c.s1p}</P>
        </Section>

        <Section id="data-collected" title={c.s2title}>
          <P><B>{c.s2h1}</B></P>
          <Ul>{c.s2list1.map((item, i) => <Li key={i}>{item}</Li>)}</Ul>
          <P className="pt-2"><B>{c.s2h2}</B></P>
          <Ul>{c.s2list2.map((item, i) => <Li key={i}>{item}</Li>)}</Ul>
          <P className="pt-2"><B>{c.s2h3}</B></P>
          <Ul>{c.s2list3.map((item, i) => <Li key={i}>{item}</Li>)}</Ul>
          <P className="pt-2"><B>{c.s2h4}</B></P>
          <Ul>{c.s2list4.map((item, i) => <Li key={i}>{item}</Li>)}</Ul>
        </Section>

        <Section id="purposes" title={c.s3title}>
          <div className={`rounded-lg overflow-hidden border ${dark ? "border-gray-800" : "border-gray-200"}`}>
            <table className="w-full text-sm">
              <thead className={dark ? "bg-gray-800" : "bg-gray-100"}>
                <tr>
                  {c.s3headers.map((h) => <th key={h} className="text-left p-3 font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody className={`divide-y ${dark ? "divide-gray-800" : "divide-gray-200"}`}>
                {c.s3rows.map(([purpose, basis]) => (
                  <tr key={purpose} className={dark ? "text-neutral-300" : "text-gray-700"}>
                    <td className="p-3">{purpose}</td>
                    <td className="p-3 text-fastfood-orange font-medium">{basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="retention" title={c.s4title}>
          <Ul>{c.s4list.map(([bold, text], i) => <Li key={i}><B>{bold}</B>{text}</Li>)}</Ul>
        </Section>

        <Section id="third-parties" title={c.s5title}>
          <P><Mix p={c.s5p} /></P>
          <div className="space-y-4 pt-2">
            {c.s5providers.map((p) => (
              <div key={p.name} className={`rounded-lg p-4 border ${dark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
                <p className="font-bold text-fastfood-orange mb-1">{p.name}</p>
                <Ul>
                  <Li><B>{c.s5labels.purpose}</B> {p.purpose}</Li>
                  <Li><B>{c.s5labels.country}</B> {p.country}</Li>
                  <Li><B>{c.s5labels.legal}</B> {p.legal}</Li>
                  <Li><B>{c.s5labels.policy}</B>{" "}<a href={p.link} target="_blank" rel="noopener noreferrer" className="text-fastfood-orange underline">{p.link}</a></Li>
                </Ul>
              </div>
            ))}
          </div>
        </Section>

        <Section id="rights" title={c.s6title}>
          <P>{c.s6p}</P>
          <Ul>{c.s6list.map(([bold, text], i) => <Li key={i}><B>{bold}</B>{text}</Li>)}</Ul>
          <P className="pt-2"><Mix p={c.s6contact} /></P>
          <P>
            <Mix p={c.s6anspdcp} />
            <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer" className="text-fastfood-orange underline">www.dataprotection.ro</a>.
          </P>
        </Section>

        <Section id="security" title={c.s7title}>
          <Ul>{c.s7list.map((item, i) => <Li key={i}>{item}</Li>)}</Ul>
        </Section>

        <Section id="minors" title={c.s8title}>
          <P>{c.s8p}</P>
        </Section>

        <Section id="cookies" title={c.s9title}>
          <P>{c.s9p}{" "}<a href="/cookie-policy" className="text-fastfood-orange underline font-semibold">{c.s9link}</a>.</P>
        </Section>

        <Section id="changes" title={c.s10title}>
          <P>{c.s10p}</P>
        </Section>

        <div className={`rounded-xl p-6 border ${dark ? "bg-gray-900 border-fastfood-orange/30" : "bg-orange-50 border-fastfood-orange/40"}`}>
          <h3 className="font-black text-lg mb-3 flex items-center gap-2">
            <Mail size={20} className="text-fastfood-orange" />
            {c.contactTitle}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><Mail size={16} className="text-fastfood-orange" /><span>hello@fancytruck.ro</span></div>
            <div className="flex items-center gap-2"><Phone size={16} className="text-fastfood-orange" /><span>+40 (123) 456-7890</span></div>
            <div className="flex items-center gap-2"><MapPin size={16} className="text-fastfood-orange" /><span>Sebeș, jud. Alba, România</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
