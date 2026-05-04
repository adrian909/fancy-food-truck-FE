import { useEffect } from "react";
import { FileText, ChevronRight, AlertTriangle } from "lucide-react";
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
const Warn = ({ children }) => (
  <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
    <span>{children}</span>
  </div>
);

const Mix = ({ p }) => p.map((part, i) => i % 2 === 1 ? <B key={i}>{part}</B> : part);

const CONTENT = {
  ro: {
    docTitle: "Termeni și Condiții – FancyTruck",
    title: "Termeni și Condiții",
    updated: "Ultima actualizare: 4 mai 2026 · Versiunea 1.0",
    intro: "Prin utilizarea platformei fancytruck.ro și plasarea comenzilor, ești de acord cu acești Termeni și Condiții. Te rugăm să îi citești cu atenție. Dacă nu ești de acord, te rugăm să nu utilizezi serviciile noastre.",
    s1title: "1. Părțile contractante",
    s1provider: "Furnizor de servicii:",
    s1providerList: [
      ["Denumire:", " FancyTruck S.R.L."],
      ["Sediu:", " Sebeș, județul Alba, România"],
      ["CUI:", " [DE COMPLETAT]"],
      ["Nr. Reg. Comerțului:", " [DE COMPLETAT]"],
      ["Email:", " hello@fancytruck.ro"],
      ["Telefon:", " +40 (123) 456-7890"],
    ],
    s1client: ["Client/Utilizator:", " orice persoană fizică cu vârsta de minimum 16 ani sau persoană juridică care accesează platforma și/sau plasează comenzi."],
    s2title: "2. Obiectul contractului",
    s2p1: ["FancyTruck pune la dispoziție o platformă online pentru comandarea produselor alimentare (sandvișuri, gustări, băuturi și alte preparate) cu livrare la domiciliu sau ridicare de la food truck, în zona orașului ", "Sebeș, județul Alba", "."],
    s2p2: ["Acești termeni guvernează relația contractuală conform ", "Legii nr. 365/2002", " privind comerțul electronic și ", "OUG nr. 34/2014", " privind drepturile consumatorilor în contractele la distanță."],
    s3title: "3. Contul de utilizator",
    s3list: [
      "Crearea unui cont necesită furnizarea de date reale și actualizate (nume, e-mail, parolă)",
      "Ești responsabil pentru securitatea parolei. Nu o divulga terților",
      "Un cont este personal și netransmisibil",
      "FancyTruck poate suspenda sau șterge conturile care încalcă acești termeni",
      "Poți solicita ștergerea contului tău oricând, la hello@fancytruck.ro",
    ],
    s4title: "4. Plasarea comenzilor",
    s4h1: "4.1 Procesul de comandă",
    s4list1: [
      "Selectezi produsele dorite din meniu și le adaugi în coș",
      "Completezi datele de livrare (nume, telefon, adresă)",
      "Alegi metoda de plată (card online / numerar la livrare)",
      'Confirmi comanda prin apăsarea butonului „Finalizează comanda”',
      "Primești o confirmare prin e-mail și notificare pe platformă",
    ],
    s4h2: "4.2 Confirmare și contract",
    s4p2: ["Comanda devine ", "contract obligatoriu", " la momentul confirmării noastre prin e-mail. Avem dreptul să refuzăm o comandă în caz de: stocuri epuizate, zonă de livrare indisponibilă, date de contact incorecte sau suspiciune de fraudă."],
    s4h3: "4.3 Modificarea comenzii",
    s4p3: ["Comenzile pot fi modificate sau anulate în primele ", "5 minute", " de la plasare, contactând telefonic la +40 (123) 456-7890. După începerea preparării, anularea nu mai este posibilă."],
    s5title: "5. Prețuri și plată",
    s5list: [
      ["", "Prețurile afișate includ TVA și sunt exprimate în ", "RON (lei românești)", ""],
      ["", "Ne rezervăm dreptul de a modifica prețurile fără preaviz; prețul aplicabil este cel de la momentul confirmării comenzii", "", ""],
      ["Plata cu cardul", " se procesează prin furnizori securizați de plăți (PCI-DSS complianți). Nu stocăm date de card pe platformă"],
      ["Plata numerar", " se efectuează la livrare, exact suma afișată la plasarea comenzii"],
      ["", "Taxa de livrare este afișată transparent înainte de finalizarea comenzii", "", ""],
    ],
    s5list2: [
      "Prețurile afișate includ TVA și sunt exprimate în RON (lei românești)",
      "Ne rezervăm dreptul de a modifica prețurile fără preaviz; prețul aplicabil este cel de la momentul confirmării comenzii",
      "Taxa de livrare este afișată transparent înainte de finalizarea comenzii",
    ],
    s5listBold: [
      ["Plata cu cardul", " se procesează prin furnizori securizați de plăți (PCI-DSS complianți). Nu stocăm date de card pe platformă"],
      ["Plata numerar", " se efectuează la livrare, exact suma afișată la plasarea comenzii"],
    ],
    s6title: "6. Livrare",
    s6link: "Politica de Livrare",
    s6p: "Detaliile complete privind livrarea sunt disponibile în",
    s6list: [
      ["", "Livrăm exclusiv în ", "zona orașului Sebeș", " și împrejurimi (conform hărții disponibile pe platformă)"],
      ["", "Termenul estimat de livrare este afișat la confirmarea comenzii (de regulă ", "25–45 minute", ")"],
      "Termenele de livrare sunt orientative; nu garantăm un termen exact în caz de forță majoră",
    ],
    s7title: "7. Dreptul de retragere (OUG 34/2014)",
    s7warn: ["Conform art. 16 lit. d) din OUG 34/2014, ", "dreptul de retragere NU se aplică", " contractelor privind bunuri care se deteriorează rapid sau care expiră repede – categorie în care intră produsele alimentare comandate de la FancyTruck. Odată preparate, comenzile nu pot fi returnate sau rambursate, cu excepția cazurilor prevăzute la art. 8."],
    s8title: "8. Reclamații și rambursări",
    s8p: "Ne angajăm să rezolvăm orice problemă cu promptitudine. Dacă ai o reclamație:",
    s8list: [
      ["", "Contactează-ne la ", "hello@fancytruck.ro", " sau ", "+40 (123) 456-7890", " în termen de ", "2 ore", " de la livrare"],
      "Descrie problema și, dacă este posibil, atașează o fotografie",
      ["", "Răspundem în maxim ", "24 ore", " în zilele lucrătoare"],
    ],
    s8refundTitle: "Rambursăm sau înlocuim produse în caz de:",
    s8refundList: [
      "Produse lipsă din comandă",
      "Produse neconforme cu descrierea (alergeni declarați lipsă)",
      "Calitate evident necorespunzătoare (documentat foto)",
      "Eroare de procesare a plății cu cardul",
    ],
    s8anpc: ["Plângerile nesoluționate pot fi adresate ", "ANPC", " (Autoritatea Națională pentru Protecția Consumatorilor): "],
    s8odr: " sau platformei europene de soluționare online a litigiilor: ",
    s9title: "9. Alergeni și informații nutriționale",
    s9warn: ["Produsele noastre pot conține sau pot veni în contact cu alergenii declarați în descrierile din meniu. Dacă ai alergii sau intoleranțe alimentare, contactează-ne înainte de comandă la ", "+40 (123) 456-7890", ". ", "FancyTruck nu poate garanta un mediu complet lipsit de alergeni.", ""],
    s9p: "Informațiile nutriționale sunt orientative și pot varia în funcție de ingrediente disponibile.",
    s10title: "10. Proprietate intelectuală",
    s10p: "Toate elementele platformei (logo, design, fotografii, texte, cod sursă) sunt proprietatea exclusivă a FancyTruck sau sunt utilizate cu licență. Este interzisă reproducerea, distribuirea sau utilizarea comercială fără acordul scris al FancyTruck.",
    s11title: "11. Limitarea răspunderii",
    s11list: [
      "FancyTruck nu răspunde pentru daune indirecte sau pierderi de profit cauzate de întârzieri în livrare",
      ["", "Nu garantăm disponibilitatea neîntreruptă a platformei; menținem minimum ", "99% uptime lunar", ""],
      "Răspunderea totală nu poate depăși valoarea comenzii care a generat reclamația",
      "Nu răspundem pentru daune cauzate de forță majoră (vreme extremă, calamități, pandemii, acte ale autorităților)",
    ],
    s12title: "12. Utilizarea platformei – interdicții",
    s12p: "Este strict interzisă:",
    s12list: [
      "Plasarea de comenzi false sau frauduloase",
      "Tentative de acces neautorizat la sistem (hacking, scraping)",
      "Utilizarea platformei în scopuri ilegale",
      "Crearea de conturi multiple pentru a evita restricții",
    ],
    s12p2: "Încălcarea acestor prevederi poate duce la suspendarea contului și urmărire juridică.",
    s13title: "13. Legea aplicabilă și jurisdicție",
    s13p1: ["Acești termeni sunt guvernați de legea română. Orice litigiu va fi soluționat pe cale amiabilă sau, în lipsa unui acord, prin instanțele judecătorești competente din ", "Alba Iulia, România", "."],
    s13p2: "Legislație aplicabilă principală: Codul Civil, Legea nr. 365/2002, OUG nr. 34/2014, Legea nr. 296/2004 (Codul Consumului), GDPR.",
    s14title: "14. Modificarea termenilor",
    s14p: ["Ne rezervăm dreptul de a modifica acești termeni. Modificările vor fi afișate pe platformă cu cel puțin ", "14 zile calendaristice", " înainte de intrarea în vigoare. Continuarea utilizării platformei după această perioadă constituie acceptul modificărilor."],
    footerDate: ["Data intrării în vigoare: ", "4 mai 2026", ". Contact: ", "hello@fancytruck.ro", " · ", "+40 (123) 456-7890", ""],
  },
  en: {
    docTitle: "Terms & Conditions – FancyTruck",
    title: "Terms & Conditions",
    updated: "Last updated: 4 May 2026 · Version 1.0",
    intro: "By using the fancytruck.ro platform and placing orders, you agree to these Terms & Conditions. Please read them carefully. If you do not agree, please do not use our services.",
    s1title: "1. Contracting Parties",
    s1provider: "Service provider:",
    s1providerList: [
      ["Name:", " FancyTruck S.R.L."],
      ["Registered address:", " Sebeș, Alba County, Romania"],
      ["Tax ID (CUI):", " [TO BE FILLED IN]"],
      ["Trade Register No.:", " [TO BE FILLED IN]"],
      ["Email:", " hello@fancytruck.ro"],
      ["Phone:", " +40 (123) 456-7890"],
    ],
    s1client: ["Customer/User:", " any natural person aged at least 16 years or any legal entity accessing the platform and/or placing orders."],
    s2title: "2. Subject Matter",
    s2p1: ["FancyTruck provides an online platform for ordering food products (sandwiches, snacks, drinks and other dishes) with home delivery or pickup from the food truck, in the area of ", "Sebeș, Alba County", "."],
    s2p2: ["These terms govern the contractual relationship pursuant to ", "Law no. 365/2002", " on electronic commerce and ", "Government Emergency Ordinance no. 34/2014", " on consumer rights in distance contracts."],
    s3title: "3. User Account",
    s3list: [
      "Creating an account requires providing accurate and up-to-date information (name, email, password)",
      "You are responsible for the security of your password. Do not disclose it to third parties",
      "An account is personal and non-transferable",
      "FancyTruck may suspend or delete accounts that violate these terms",
      "You may request account deletion at any time at hello@fancytruck.ro",
    ],
    s4title: "4. Placing Orders",
    s4h1: "4.1 Order Process",
    s4list1: [
      "Select the desired products from the menu and add them to your cart",
      "Enter your delivery details (name, phone number, address)",
      "Choose your payment method (online card / cash on delivery)",
      "Confirm your order by clicking the 'Place Order' button",
      "You will receive a confirmation by email and a notification on the platform",
    ],
    s4h2: "4.2 Confirmation & Contract",
    s4p2: ["The order becomes a ", "binding contract", " upon our email confirmation. We reserve the right to refuse an order in the event of: out-of-stock products, delivery area unavailable, incorrect contact details, or suspected fraud."],
    s4h3: "4.3 Order Modification",
    s4p3: ["Orders may be modified or cancelled within the first ", "5 minutes", " of placement by calling +40 (123) 456-7890. Once preparation has begun, cancellation is no longer possible."],
    s5title: "5. Prices & Payment",
    s5list2: [
      "Displayed prices include VAT and are expressed in RON (Romanian leu)",
      "We reserve the right to change prices without prior notice; the applicable price is that at the time of order confirmation",
      "The delivery fee is displayed transparently before checkout is completed",
    ],
    s5listBold: [
      ["Card payment", " is processed by secure payment providers (PCI-DSS compliant). We do not store card data on the platform"],
      ["Cash payment", " is made upon delivery, exactly the amount shown when placing the order"],
    ],
    s6title: "6. Delivery",
    s6link: "Delivery Policy",
    s6p: "Full details regarding delivery are available in our",
    s6list: [
      ["", "We deliver exclusively to ", "the city of Sebeș", " and surroundings (as shown on the map available on the platform)"],
      ["", "The estimated delivery time is shown at order confirmation (typically ", "25–45 minutes", ")"],
      "Delivery times are indicative; we cannot guarantee an exact time in case of force majeure",
    ],
    s7title: "7. Right of Withdrawal (OUG 34/2014)",
    s7warn: ["Pursuant to art. 16(d) of OUG 34/2014, the ", "right of withdrawal DOES NOT APPLY", " to contracts for goods that deteriorate rapidly or expire quickly — a category that includes food products ordered from FancyTruck. Once prepared, orders cannot be returned or refunded, except as provided in art. 8."],
    s8title: "8. Complaints & Refunds",
    s8p: "We are committed to resolving any issue promptly. If you have a complaint:",
    s8list: [
      ["", "Contact us at ", "hello@fancytruck.ro", " or ", "+40 (123) 456-7890", " within ", "2 hours", " of delivery"],
      "Describe the issue and, if possible, attach a photograph",
      ["", "We respond within a maximum of ", "24 hours", " on working days"],
    ],
    s8refundTitle: "We refund or replace products in case of:",
    s8refundList: [
      "Missing products from the order",
      "Products not matching the description (declared allergens absent)",
      "Clearly unacceptable quality (documented with photo)",
      "Card payment processing error",
    ],
    s8anpc: ["Unresolved complaints may be referred to ", "ANPC", " (National Authority for Consumer Protection): "],
    s8odr: " or the European Online Dispute Resolution platform: ",
    s9title: "9. Allergens & Nutritional Information",
    s9warn: ["Our products may contain or come into contact with the allergens declared in the menu descriptions. If you have food allergies or intolerances, please contact us before ordering at ", "+40 (123) 456-7890", ". ", "FancyTruck cannot guarantee a completely allergen-free environment.", ""],
    s9p: "Nutritional information is indicative and may vary depending on available ingredients.",
    s10title: "10. Intellectual Property",
    s10p: "All elements of the platform (logo, design, photographs, texts, source code) are the exclusive property of FancyTruck or are used under licence. Reproduction, distribution or commercial use without the written consent of FancyTruck is prohibited.",
    s11title: "11. Limitation of Liability",
    s11list: [
      "FancyTruck is not liable for indirect damages or loss of profit caused by delivery delays",
      ["", "We do not guarantee uninterrupted platform availability; we maintain a minimum of ", "99% monthly uptime", ""],
      "Total liability may not exceed the value of the order that gave rise to the complaint",
      "We are not liable for damages caused by force majeure (extreme weather, disasters, pandemics, acts of authorities)",
    ],
    s12title: "12. Prohibited Platform Use",
    s12p: "The following are strictly prohibited:",
    s12list: [
      "Placing false or fraudulent orders",
      "Attempts at unauthorised system access (hacking, scraping)",
      "Using the platform for illegal purposes",
      "Creating multiple accounts to circumvent restrictions",
    ],
    s12p2: "Breach of these provisions may result in account suspension and legal action.",
    s13title: "13. Applicable Law & Jurisdiction",
    s13p1: ["These terms are governed by Romanian law. Any dispute shall be resolved amicably or, failing agreement, by the competent courts of ", "Alba Iulia, Romania", "."],
    s13p2: "Principal applicable legislation: Civil Code, Law no. 365/2002, OUG no. 34/2014, Law no. 296/2004 (Consumer Code), GDPR.",
    s14title: "14. Modification of Terms",
    s14p: ["We reserve the right to modify these terms. Changes will be posted on the platform at least ", "14 calendar days", " before taking effect. Continued use of the platform after this period constitutes acceptance of the changes."],
    footerDate: ["Effective date: ", "4 May 2026", ". Contact: ", "hello@fancytruck.ro", " · ", "+40 (123) 456-7890", ""],
  },
};

export default function TermsAndConditions({ dark }) {
  const { language } = useLanguage();
  const c = CONTENT[language] || CONTENT.ro;

  useEffect(() => {
    window.scrollTo({ top: 0 });
    document.title = c.docTitle;
  }, [c.docTitle]);

  return (
    <div className={`min-h-screen ${dark ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}`}>
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <FileText size={48} className="mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl sm:text-4xl font-black mb-3">{c.title}</h1>
          <p className="opacity-80 text-sm">{c.updated}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className={`rounded-xl p-5 mb-10 border-l-4 border-fastfood-orange ${dark ? "bg-gray-900" : "bg-orange-50"}`}>
          <P>{c.intro}</P>
        </div>

        <Section id="parties" title={c.s1title}>
          <P><B>{c.s1provider}</B></P>
          <Ul>{c.s1providerList.map(([bold, text], i) => <Li key={i}><B>{bold}</B>{text}</Li>)}</Ul>
          <P className="pt-2"><B>{c.s1client[0]}</B>{c.s1client[1]}</P>
        </Section>

        <Section id="scope" title={c.s2title}>
          <P><Mix p={c.s2p1} /></P>
          <P><Mix p={c.s2p2} /></P>
        </Section>

        <Section id="account" title={c.s3title}>
          <Ul>{c.s3list.map((item, i) => <Li key={i}>{item}</Li>)}</Ul>
        </Section>

        <Section id="ordering" title={c.s4title}>
          <P><B>{c.s4h1}</B></P>
          <Ul>{c.s4list1.map((item, i) => <Li key={i}>{item}</Li>)}</Ul>
          <P className="pt-2"><B>{c.s4h2}</B></P>
          <P><Mix p={c.s4p2} /></P>
          <P className="pt-2"><B>{c.s4h3}</B></P>
          <P><Mix p={c.s4p3} /></P>
        </Section>

        <Section id="prices" title={c.s5title}>
          <Ul>
            {c.s5list2.map((item, i) => <Li key={i}>{item}</Li>)}
            {c.s5listBold.map(([bold, text], i) => <Li key={`b${i}`}><B>{bold}</B>{text}</Li>)}
          </Ul>
        </Section>

        <Section id="delivery" title={c.s6title}>
          <P>{c.s6p}{" "}<a href="/delivery-policy" className="text-fastfood-orange underline font-semibold">{c.s6link}</a>.</P>
          <Ul>
            {c.s6list.map((item, i) =>
              Array.isArray(item)
                ? <Li key={i}>{item[0]}<Mix p={item.slice(1)} /></Li>
                : <Li key={i}>{item}</Li>
            )}
          </Ul>
        </Section>

        <Section id="withdrawal" title={c.s7title}>
          <Warn><Mix p={c.s7warn} /></Warn>
        </Section>

        <Section id="complaints" title={c.s8title}>
          <P>{c.s8p}</P>
          <Ul>
            {c.s8list.map((item, i) =>
              Array.isArray(item)
                ? <Li key={i}><Mix p={item.filter(Boolean)} /></Li>
                : <Li key={i}>{item}</Li>
            )}
          </Ul>
          <P className="pt-2"><B>{c.s8refundTitle}</B></P>
          <Ul>{c.s8refundList.map((item, i) => <Li key={i}>{item}</Li>)}</Ul>
          <P className="pt-2">
            <Mix p={c.s8anpc} />
            <a href="https://www.anpc.ro" target="_blank" rel="noopener noreferrer" className="text-fastfood-orange underline">www.anpc.ro</a>
            {c.s8odr}
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-fastfood-orange underline">ec.europa.eu/consumers/odr</a>
          </P>
        </Section>

        <Section id="allergens" title={c.s9title}>
          <Warn><Mix p={c.s9warn} /></Warn>
          <P className="mt-2">{c.s9p}</P>
        </Section>

        <Section id="ip" title={c.s10title}>
          <P>{c.s10p}</P>
        </Section>

        <Section id="liability" title={c.s11title}>
          <Ul>
            {c.s11list.map((item, i) =>
              Array.isArray(item)
                ? <Li key={i}><Mix p={item.filter(Boolean)} /></Li>
                : <Li key={i}>{item}</Li>
            )}
          </Ul>
        </Section>

        <Section id="platform-use" title={c.s12title}>
          <P>{c.s12p}</P>
          <Ul>{c.s12list.map((item, i) => <Li key={i}>{item}</Li>)}</Ul>
          <P className="pt-2">{c.s12p2}</P>
        </Section>

        <Section id="applicable-law" title={c.s13title}>
          <P><Mix p={c.s13p1} /></P>
          <P>{c.s13p2}</P>
        </Section>

        <Section id="changes" title={c.s14title}>
          <P><Mix p={c.s14p} /></P>
        </Section>

        <div className={`rounded-xl p-5 border text-sm ${dark ? "bg-gray-900 border-fastfood-orange/30" : "bg-orange-50 border-fastfood-orange/40"}`}>
          <P><Mix p={c.footerDate} /></P>
        </div>
      </div>
    </div>
  );
}
