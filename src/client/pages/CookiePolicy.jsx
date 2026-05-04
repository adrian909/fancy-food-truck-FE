import { useEffect } from "react";
import { Cookie, ChevronRight, Shield, BarChart2, Settings, XCircle } from "lucide-react";
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

const CARD_ICONS  = [Shield, Settings, BarChart2, XCircle];
const CARD_COLORS = ["border-green-500", "border-blue-500", "border-purple-500", "border-red-500"];
const CARD_REJECT = [false, true, true, true];

const CookieCard = ({ icon: Icon, color, category, canReject, description, examples }) => (
  <div className={`rounded-xl p-5 border-l-4 border-${color} bg-white dark:bg-gray-900 border dark:border-gray-800 shadow-sm`}>
    <div className="flex items-center gap-3 mb-3">
      <Icon size={22} className={`text-${color}`} />
      <div>
        <p className="font-black text-gray-900 dark:text-white">{category}</p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${canReject ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"}`}>
          {canReject ? (examples._consentLabel) : (examples._alwaysLabel)}
        </span>
      </div>
    </div>
    <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">{description}</p>
    <div className="text-xs space-y-1">
      {examples.items.map((ex) => (
        <div key={ex.name} className="flex items-start gap-2">
          <span className="text-fastfood-orange mt-0.5">›</span>
          <span className="text-gray-700 dark:text-neutral-300"><B>{ex.name}:</B> {ex.desc}</span>
        </div>
      ))}
    </div>
  </div>
);

const CONTENT = {
  ro: {
    docTitle: "Politica de Cookie-uri – FancyTruck",
    title: "Politica de Cookie-uri",
    updated: "Ultima actualizare: 4 mai 2026",
    intro: ["Această pagină explică ce sunt cookie-urile, ce tipuri folosim pe ", "fancytruck.ro", " și cum poți controla utilizarea lor, conform ", "Directivei ePrivacy 2002/58/CE", " și ", "GDPR", "."],
    s1title: "1. Ce sunt cookie-urile?",
    s1p1: "Cookie-urile sunt fișiere text de mici dimensiuni plasate pe dispozitivul tău când vizitezi un website. Ele permit site-ului să memoreze acțiunile și preferințele tale pe o anumită perioadă, astfel încât să nu trebuiască să le reintroduci la fiecare vizită.",
    s1p2: ["Pe lângă cookie-uri, folosim și ", "localStorage", " și ", "sessionStorage", " (tehnologii similare stocate în browser) pentru funcționarea aplicației."],
    s2title: "2. Categorii de cookie-uri și tehnologii similare",
    consentLabel: "Necesită consimțământ",
    alwaysLabel: "Întotdeauna active",
    cards: [
      {
        category: "Cookie-uri strict necesare",
        description: "Esențiale pentru funcționarea site-ului. Nu pot fi dezactivate fără a afecta funcționalitatea de bază.",
        items: [
          { name: "csrf_token (sessionStorage)", desc: "Token de securitate anti-CSRF; șters la închiderea browserului" },
          { name: "jwt_token (localStorage)", desc: "Token de autentificare; expiră în 24 ore" },
          { name: "currentUser (localStorage)", desc: "Date profil pentru sesiunea curentă" },
          { name: "theme (localStorage)", desc: "Preferința temă (întunecat/luminos)" },
        ],
      },
      {
        category: "Cookie-uri funcționale",
        description: "Permit funcții avansate și personalizare. Dezactivarea lor poate limita anumite funcționalități.",
        items: [
          { name: "Google Maps API", desc: "Hărți interactive, geocodificare adrese, sugestii stradă; Google poate plasa cookie-uri proprii" },
          { name: "Tawk.to", desc: "Chat live cu echipa noastră; Tawk.to setează cookie-uri pentru identificarea sesiunii de chat" },
        ],
      },
      {
        category: "Cookie-uri de analiză / performanță",
        description: "Ne ajută să înțelegem cum este utilizat site-ul, pentru a-l îmbunătăți. Datele sunt anonimizate sau pseudonimizate.",
        items: [
          { name: "Analize interne", desc: "Statistici de utilizare procesate pe serverele noastre; nu utilizăm momentan Google Analytics sau similar" },
        ],
      },
      {
        category: "Cookie-uri de marketing / publicitate",
        description: "Folosite pentru publicitate personalizată. La momentul actual, NU utilizăm cookie-uri de marketing pe acest site.",
        items: [
          { name: "Pixeli publicitari", desc: "Nu sunt utilizați în prezent" },
        ],
      },
    ],
    s3title: "3. Cookie-uri ale terților",
    s3p: "Terții de mai jos pot plasa cookie-uri proprii pe dispozitivul tău. Nu avem control asupra cookie-urilor acestora. Consultă politicile lor de confidențialitate:",
    s3headers: ["Serviciu", "Scop", "Politică"],
    s3rows: [
      ["Google Maps", "Hărți, geocodificare", "https://policies.google.com/privacy"],
      ["Google Fonts", "Fonturi web", "https://policies.google.com/privacy"],
      ["Tawk.to", "Chat live", "https://www.tawk.to/privacy-policy/"],
      ["Firebase", "Stocare imagini", "https://firebase.google.com/support/privacy"],
    ],
    s3policy: "Politică",
    s4title: "4. Durata stocării",
    s4list: [
      ["Cookie-uri de sesiune:", " șterse automat când închizi browserul (ex: csrf_token)"],
      ["Cookie-uri persistente:", " rămân pe dispozitiv până la expirare sau ștergere manuală (ex: jwt_token – 24 ore)"],
      ["Cookie-uri terți:", " durata este stabilită de fiecare furnizor în parte"],
    ],
    s5title: "5. Cum poți controla cookie-urile",
    s5h1: "Prin bannerul nostru de consimțământ",
    s5p1: ["La prima vizită pe site, vei vedea un banner prin care poți accepta sau refuza categoriile de cookie-uri non-esențiale. Poți modifica preferințele oricând din linkul ", "„Setări cookie-uri\"", " din subsolul paginii."],
    s5h2: "Prin setările browserului",
    s5p2: "Poți șterge sau bloca cookie-urile direct din browserul tău:",
    s5browsers: [
      { label: "Google Chrome", url: "https://support.google.com/chrome/answer/95647" },
      { label: "Mozilla Firefox", url: "https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" },
      { label: "Safari", url: "https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" },
      { label: "Microsoft Edge", url: "https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" },
    ],
    s5note: "Atenție: dezactivarea cookie-urilor strict necesare poate împiedica funcționarea corectă a site-ului (autentificare, comenzi, securitate).",
    s6title: "6. Retragerea consimțământului",
    s6p: ["Poți retrage consimțământul acordat oricând, fără nicio penalizare, accesând ", "\„Setări cookie-uri\"", " din subsolul paginii sau trimițând un e-mail la ", "hello@fancytruck.ro", ". Retragerea consimțământului nu afectează legalitatea prelucrărilor efectuate înainte de retragere."],
    s7title: "7. Modificări ale politicii",
    s7p: "Putem actualiza această politică pe măsură ce adăugăm noi funcționalități sau parteneri. Data ultimei actualizări este afișată în antetul paginii. Modificările semnificative vor fi anunțate prin banner pe site.",
    footerQ: ["Întrebări despre cookie-uri? Scrie-ne la ", "hello@fancytruck.ro", ". Autoritatea de reglementare: ", "ANSPDCP", " – "],
  },
  en: {
    docTitle: "Cookie Policy – FancyTruck",
    title: "Cookie Policy",
    updated: "Last updated: 4 May 2026",
    intro: ["This page explains what cookies are, which types we use on ", "fancytruck.ro", ", and how you can control their use, in accordance with the ", "ePrivacy Directive 2002/58/EC", " and ", "GDPR", "."],
    s1title: "1. What are cookies?",
    s1p1: "Cookies are small text files placed on your device when you visit a website. They allow the site to remember your actions and preferences over a period of time, so you don't have to re-enter them on every visit.",
    s1p2: ["In addition to cookies, we also use ", "localStorage", " and ", "sessionStorage", " (similar browser-based storage technologies) for the application to function."],
    s2title: "2. Cookie categories and similar technologies",
    consentLabel: "Requires consent",
    alwaysLabel: "Always active",
    cards: [
      {
        category: "Strictly necessary cookies",
        description: "Essential for the site to function. They cannot be disabled without affecting core functionality.",
        items: [
          { name: "csrf_token (sessionStorage)", desc: "Anti-CSRF security token; deleted when the browser is closed" },
          { name: "jwt_token (localStorage)", desc: "Authentication token; expires in 24 hours" },
          { name: "currentUser (localStorage)", desc: "Profile data for the current session" },
          { name: "theme (localStorage)", desc: "Theme preference (dark/light)" },
        ],
      },
      {
        category: "Functional cookies",
        description: "Enable advanced features and personalisation. Disabling them may limit certain features.",
        items: [
          { name: "Google Maps API", desc: "Interactive maps, address geocoding, street suggestions; Google may set its own cookies" },
          { name: "Tawk.to", desc: "Live chat with our team; Tawk.to sets cookies to identify the chat session" },
        ],
      },
      {
        category: "Analytics / performance cookies",
        description: "Help us understand how the site is used so we can improve it. Data is anonymised or pseudonymised.",
        items: [
          { name: "Internal analytics", desc: "Usage statistics processed on our servers; we do not currently use Google Analytics or similar" },
        ],
      },
      {
        category: "Marketing / advertising cookies",
        description: "Used for personalised advertising. We currently do NOT use marketing cookies on this site.",
        items: [
          { name: "Advertising pixels", desc: "Not currently in use" },
        ],
      },
    ],
    s3title: "3. Third-party cookies",
    s3p: "The third parties below may place their own cookies on your device. We have no control over these cookies. Please consult their privacy policies:",
    s3headers: ["Service", "Purpose", "Policy"],
    s3rows: [
      ["Google Maps", "Maps, geocoding", "https://policies.google.com/privacy"],
      ["Google Fonts", "Web fonts", "https://policies.google.com/privacy"],
      ["Tawk.to", "Live chat", "https://www.tawk.to/privacy-policy/"],
      ["Firebase", "Image storage", "https://firebase.google.com/support/privacy"],
    ],
    s3policy: "Policy",
    s4title: "4. Storage duration",
    s4list: [
      ["Session cookies:", " automatically deleted when you close the browser (e.g. csrf_token)"],
      ["Persistent cookies:", " remain on your device until they expire or are manually deleted (e.g. jwt_token – 24 hours)"],
      ["Third-party cookies:", " duration is set by each provider individually"],
    ],
    s5title: "5. How to control cookies",
    s5h1: "Via our consent banner",
    s5p1: ["On your first visit, you will see a banner allowing you to accept or reject non-essential cookie categories. You can change your preferences at any time via the ", "\"Cookie settings\"", " link in the page footer."],
    s5h2: "Via your browser settings",
    s5p2: "You can delete or block cookies directly in your browser:",
    s5browsers: [
      { label: "Google Chrome", url: "https://support.google.com/chrome/answer/95647" },
      { label: "Mozilla Firefox", url: "https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" },
      { label: "Safari", url: "https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" },
      { label: "Microsoft Edge", url: "https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" },
    ],
    s5note: "Note: disabling strictly necessary cookies may prevent the site from working correctly (login, orders, security).",
    s6title: "6. Withdrawing consent",
    s6p: ["You can withdraw your consent at any time, without penalty, by accessing ", "\"Cookie settings\"", " in the page footer or by emailing ", "hello@fancytruck.ro", ". Withdrawal of consent does not affect the lawfulness of processing carried out before withdrawal."],
    s7title: "7. Policy changes",
    s7p: "We may update this policy as we add new features or partners. The date of the last update is shown in the page header. Significant changes will be announced via a banner on the site.",
    footerQ: ["Questions about cookies? Email us at ", "hello@fancytruck.ro", ". Supervisory authority: ", "ANSPDCP", " – "],
  },
};

const Mix = ({ p }) => p.map((part, i) => i % 2 === 1 ? <B key={i}>{part}</B> : part);

export default function CookiePolicy({ dark }) {
  const { language } = useLanguage();
  const c = CONTENT[language] || CONTENT.ro;

  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.title = c.docTitle;
  }, [c.docTitle]);

  return (
    <div className={`min-h-screen ${dark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="bg-gradient-to-r from-fastfood-orange to-yellow-400 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <Cookie size={48} className="mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl sm:text-4xl font-black mb-3">{c.title}</h1>
          <p className="opacity-80 text-sm">{c.updated}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className={`rounded-xl p-5 mb-10 border-l-4 border-fastfood-orange ${dark ? "bg-gray-900" : "bg-orange-50"}`}>
          <P><Mix p={c.intro} /></P>
        </div>

        <Section id="what-are-cookies" title={c.s1title}>
          <P>{c.s1p1}</P>
          <P><Mix p={c.s1p2} /></P>
        </Section>

        <Section id="categories" title={c.s2title}>
          <div className="space-y-4">
            {c.cards.map((card, i) => (
              <CookieCard
                key={i}
                icon={CARD_ICONS[i]}
                color={CARD_COLORS[i]}
                canReject={CARD_REJECT[i]}
                category={card.category}
                description={card.description}
                examples={{ items: card.items, _consentLabel: c.consentLabel, _alwaysLabel: c.alwaysLabel }}
              />
            ))}
          </div>
        </Section>

        <Section id="third-party-cookies" title={c.s3title}>
          <P>{c.s3p}</P>
          <div className={`rounded-lg overflow-hidden border mt-3 ${dark ? "border-gray-800" : "border-gray-200"}`}>
            <table className="w-full text-sm">
              <thead className={dark ? "bg-gray-800" : "bg-gray-100"}>
                <tr>
                  {c.s3headers.map((h) => <th key={h} className="text-left p-3 font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody className={`divide-y ${dark ? "divide-gray-800 text-neutral-300" : "divide-gray-200 text-gray-700"}`}>
                {c.s3rows.map(([serv, scop, link]) => (
                  <tr key={serv}>
                    <td className="p-3 font-semibold">{serv}</td>
                    <td className="p-3">{scop}</td>
                    <td className="p-3">
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-fastfood-orange underline break-all">{c.s3policy}</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="duration" title={c.s4title}>
          <Ul>
            {c.s4list.map(([bold, text], i) => <Li key={i}><B>{bold}</B>{text}</Li>)}
          </Ul>
        </Section>

        <Section id="control" title={c.s5title}>
          <P><B>{c.s5h1}</B></P>
          <P><Mix p={c.s5p1} /></P>
          <P className="pt-2"><B>{c.s5h2}</B></P>
          <P>{c.s5p2}</P>
          <Ul>
            {c.s5browsers.map(({ label, url }) => (
              <Li key={label}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-fastfood-orange underline">{label}</a>
              </Li>
            ))}
          </Ul>
          <P className="pt-2 italic text-xs text-gray-500 dark:text-neutral-500">{c.s5note}</P>
        </Section>

        <Section id="consent" title={c.s6title}>
          <P><Mix p={c.s6p} /></P>
        </Section>

        <Section id="changes" title={c.s7title}>
          <P>{c.s7p}</P>
        </Section>

        <div className={`rounded-xl p-5 border ${dark ? "bg-gray-900 border-fastfood-orange/30" : "bg-orange-50 border-fastfood-orange/40"} text-sm`}>
          <P>
            <Mix p={c.footerQ} />
            <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer" className="text-fastfood-orange underline">www.dataprotection.ro</a>
          </P>
        </div>
      </div>
    </div>
  );
}
