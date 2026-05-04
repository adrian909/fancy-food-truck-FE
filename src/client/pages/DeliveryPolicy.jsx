import { useEffect } from "react";
import { Truck, ChevronRight, AlertTriangle, Clock, MapPin } from "lucide-react";
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

const InfoCard = ({ icon: Icon, title, children }) => (
  <div className="rounded-xl p-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
    <div className="flex items-center gap-2 mb-3">
      <Icon size={20} className="text-fastfood-orange" />
      <p className="font-black text-gray-900 dark:text-white">{title}</p>
    </div>
    <div className="space-y-1.5 text-sm text-gray-700 dark:text-neutral-300">{children}</div>
  </div>
);

// Alternating plain/bold text: even indices = plain, odd indices = bold
const Mix = ({ p }) => p.map((part, i) => i % 2 === 1 ? <B key={i}>{part}</B> : part);

const CONTENT = {
  ro: {
    docTitle: "Politica de Livrare – FancyTruck",
    title: "Politica de Livrare",
    updated: "Ultima actualizare: 4 mai 2026",
    intro: ["Această politică descrie condițiile de livrare și ridicare a comenzilor de la ", "FancyTruck", ", conform ", "OUG nr. 34/2014", " privind drepturile consumatorilor în contractele la distanță și Legea nr. 365/2002 privind comerțul electronic."],
    c1title: "Timp de livrare", c1val: "25–45 minute estimat", c1sub: "Depinde de distanță și volum",
    c2title: "Zonă de livrare",   c2val: "Sebeș + împrejurimi",      c2sub: "Max. 10 km de food truck",
    c3title: "Taxă de livrare",   c3val: "15 RON (standard)",         c3sub: "Afișată înainte de plată",
    s1title: "1. Zona de livrare",
    s1p1: ["Livrăm comenzi în ", "municipiul Sebeș", " și localitățile limitrofe în raza de ", "maximum 10 kilometri", " față de locația curentă a food truck-ului."],
    s1p2: "Zona exactă de livrare este vizibilă pe harta din aplicație la momentul plasării comenzii. Dacă adresa ta nu se află în zona de livrare, vei fi notificat înainte de finalizarea comenzii, iar comanda nu va fi procesată.",
    s1p3: "FancyTruck este un food truck mobil. Locația se poate schimba zilnic. Verifică locația curentă pe platformă sau pe paginile noastre de social media.",
    s2title: "2. Programul și timpii de livrare",
    s2list: [
      ["Program comenzi:", " Luni–Vineri 10:00–20:00, Sâmbătă 11:00–21:00, Duminică 12:00–19:00"],
      ["Timp estimat de livrare:", " 25–45 minute de la confirmarea comenzii"],
      ["Timp estimat ridicare:", " 10–20 minute de la confirmare"],
    ],
    s2note: "Timpii de livrare sunt estimativi și pot fi afectați de: volum mare de comenzi, condiții meteo, trafic sau alte cauze independente de voința noastră.",
    s3title: "3. Taxa de livrare și comandă minimă",
    s3list: [
      ["Taxă de livrare standard:", " 15 RON (inclusă în totalul afișat la checkout)"],
      ["Comandă minimă pentru livrare:", " 30 RON (produse, fără taxă de livrare)"],
      ["Livrare gratuită", " pentru comenzi de peste 120 RON"],
      ["Ridicare personală", " de la food truck: fără taxă de livrare, fără comandă minimă"],
    ],
    s3p: "Taxa de livrare și valoarea minimă a comenzii sunt afișate transparent în coș și la finalizarea comenzii, înainte de orice plată.",
    s4title: "4. Procesul de livrare",
    s4h1: "4.1 Livrare la domiciliu",
    s4list1: [
      "Introduci adresa completă (stradă, număr, apartament, interfon dacă e cazul)",
      "Curierul te va contacta telefonic cu 5 minute înainte de sosire",
      "Produsele sunt livrate în ambalaje sigilate, cu respectarea normelor de igienă",
      "Livrarea se face la ușă; nu lăsăm comenzi nesupravegheate fără acceptul tău explicit",
    ],
    s4h2: "4.2 Ridicare personală",
    s4list2: [
      "Selectezi opțiunea „Ridicare de la food truck\" la checkout",
      "Vei fi notificat când comanda este gata (estimat 10–20 minute)",
      "Locația exactă a food truck-ului este afișată pe platformă",
    ],
    s5title: "5. Cazuri în care livrarea poate fi refuzată",
    s5list: [
      "Adresa de livrare se află în afara zonei de acoperire",
      "Clientul nu poate fi contactat telefonic la momentul sosirii curierului (2 tentative)",
      "Adresa furnizată este incompletă sau incorectă",
      "Stocuri epuizate după confirmarea comenzii (caz în care sunăm imediat)",
    ],
    s5p: "În cazul livrărilor eșuate din vina noastră, vom relivra gratuit sau vom rambursa integral. Livrările eșuate din cauza informațiilor incorecte furnizate de client nu sunt rambursate.",
    s6title: "6. Calitatea produselor la livrare",
    s6list: [
      "Produsele sunt pregătite proaspăt și livrate în condiții optime de temperatură",
      "Utilizăm ambalaje care mențin temperatura pe durata livrării",
      "Recomandăm consumul produselor imediat după livrare",
    ],
    s6bold: "Nu garantăm calitatea produselor recongelate sau reîncălzite acasă",
    s7title: "7. Politica de returnare – produse alimentare",
    s7warn: ["IMPORTANT:", " Conform ", "art. 16 lit. d) din OUG 34/2014", ", dreptul de retragere de 14 zile ", "NU se aplică", " produselor alimentare care se deteriorează rapid sau expiră rapid. Produsele alimentare comandate nu pot fi returnate după livrare."],
    s7excTitle: "Excepții – înlocuim sau rambursăm în caz de:",
    s7list: [
      "Produs lipsă din comandă – sesizare în maxim 2 ore de la livrare",
      "Produs vizibil deteriorat la livrare (ambalaj spart, produs vărsat)",
      "Produs care nu corespunde cu descrierea (alergeni nedeclarați prezenți)",
      "Produs cu gust/aspect evident necorespunzător (fotografie obligatorie)",
      "Comandă nelivrată din vina noastră",
    ],
    s7contact: ["Sesizările se fac la ", "hello@fancytruck.ro", " sau ", "+40 (123) 456-7890", " în maxim 2 ore de la livrare. Rambursările se procesează în 5–10 zile lucrătoare, pe aceeași metodă de plată."],
    s8title: "8. Forță majoră",
    s8p: "FancyTruck nu răspunde pentru întârzieri cauzate de: condiții meteo extreme, calamități naturale, restricții impuse de autorități, pandemii, trafic excepțional sau alte evenimente independente de voința noastră. În astfel de situații, te vom contacta pentru a reprograma sau anula comanda cu rambursare integrală.",
    s9title: "9. Contact livrare",
    s9list: [
      ["Telefon:", " +40 (123) 456-7890 (disponibil în programul de comenzi)"],
      ["Email:", " hello@fancytruck.ro (răspuns în 24 ore lucrătoare)"],
    ],
    s9anpc: "ANPC:",
    s9sol: "SOL UE:",
  },
  en: {
    docTitle: "Delivery Policy – FancyTruck",
    title: "Delivery Policy",
    updated: "Last updated: 4 May 2026",
    intro: ["This policy describes the conditions for delivery and pickup of orders from ", "FancyTruck", ", in accordance with ", "Government Emergency Ordinance no. 34/2014", " on consumer rights in distance contracts and Law no. 365/2002 on electronic commerce."],
    c1title: "Delivery time",  c1val: "25–45 minutes (estimated)", c1sub: "Depends on distance and volume",
    c2title: "Delivery zone",  c2val: "Sebeș + surroundings",       c2sub: "Max. 10 km from food truck",
    c3title: "Delivery fee",   c3val: "15 RON (standard)",           c3sub: "Shown before payment",
    s1title: "1. Delivery Zone",
    s1p1: ["We deliver orders in ", "the city of Sebeș", " and surrounding localities within a maximum of ", "10 kilometres", " from the food truck's current location."],
    s1p2: "The exact delivery zone is shown on the map in the app when placing your order. If your address is outside the delivery zone, you will be notified before checkout and the order will not be processed.",
    s1p3: "FancyTruck is a mobile food truck. Location may change daily. Check the current location on our platform or social media pages.",
    s2title: "2. Schedule & Delivery Times",
    s2list: [
      ["Order hours:", " Mon–Fri 10:00–20:00, Sat 11:00–21:00, Sun 12:00–19:00"],
      ["Estimated delivery time:", " 25–45 minutes from order confirmation"],
      ["Estimated pickup time:", " 10–20 minutes from confirmation"],
    ],
    s2note: "Delivery times are estimates and may be affected by: high order volume, weather conditions, traffic, or other factors beyond our control.",
    s3title: "3. Delivery Fee & Minimum Order",
    s3list: [
      ["Standard delivery fee:", " 15 RON (included in the total shown at checkout)"],
      ["Minimum order for delivery:", " 30 RON (products only, excluding delivery fee)"],
      ["Free delivery", " on orders over 120 RON"],
      ["Personal pickup", " at the food truck: no delivery fee, no minimum order"],
    ],
    s3p: "The delivery fee and minimum order value are displayed transparently in the cart and at checkout, before any payment.",
    s4title: "4. Delivery Process",
    s4h1: "4.1 Home Delivery",
    s4list1: [
      "Enter your full address (street, number, apartment, intercom if applicable)",
      "Our courier will call you 5 minutes before arrival",
      "Products are delivered in sealed packaging, in compliance with hygiene standards",
      "Delivery is to the door; we do not leave orders unattended without your explicit consent",
    ],
    s4h2: "4.2 Personal Pickup",
    s4list2: [
      "Select 'Pickup from food truck' at checkout",
      "You will be notified when your order is ready (estimated 10–20 minutes)",
      "The exact location of the food truck is shown on the platform",
    ],
    s5title: "5. When Delivery May Be Refused",
    s5list: [
      "The delivery address is outside the coverage area",
      "The customer cannot be reached by phone at the time of courier arrival (2 attempts)",
      "The address provided is incomplete or incorrect",
      "Stock depleted after order confirmation (in which case we will call immediately)",
    ],
    s5p: "In case of failed deliveries due to our fault, we will re-deliver free of charge or issue a full refund. Failed deliveries due to incorrect information provided by the customer are not refunded.",
    s6title: "6. Product Quality on Delivery",
    s6list: [
      "Products are freshly prepared and delivered under optimal temperature conditions",
      "We use packaging that maintains temperature during delivery",
      "We recommend consuming products immediately after delivery",
    ],
    s6bold: "We do not guarantee the quality of products refrozen or reheated at home",
    s7title: "7. Returns Policy – Food Products",
    s7warn: ["IMPORTANT:", " Pursuant to ", "art. 16(d) of OUG 34/2014", ", the 14-day right of withdrawal ", "DOES NOT APPLY", " to food products that deteriorate or expire quickly. Food products ordered cannot be returned after delivery."],
    s7excTitle: "Exceptions – we replace or refund in case of:",
    s7list: [
      "Missing product from order – report within 2 hours of delivery",
      "Product visibly damaged upon delivery (broken packaging, spilled product)",
      "Product that does not match the description (undeclared allergens present)",
      "Product with clearly unacceptable taste/appearance (photo required)",
      "Order not delivered due to our fault",
    ],
    s7contact: ["Contact us at ", "hello@fancytruck.ro", " or ", "+40 (123) 456-7890", " within 2 hours of delivery. Refunds are processed within 5–10 business days, to the same payment method."],
    s8title: "8. Force Majeure",
    s8p: "FancyTruck is not liable for delays caused by: extreme weather conditions, natural disasters, restrictions imposed by authorities, pandemics, exceptional traffic, or other events beyond our control. In such situations, we will contact you to reschedule or cancel your order with a full refund.",
    s9title: "9. Delivery Contact",
    s9list: [
      ["Phone:", " +40 (123) 456-7890 (available during order hours)"],
      ["Email:", " hello@fancytruck.ro (response within 24 working hours)"],
    ],
    s9anpc: "ANPC:",
    s9sol: "EU ODR:",
  },
};

export default function DeliveryPolicy({ dark }) {
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
          <Truck size={48} className="mx-auto mb-4 opacity-90" />
          <h1 className="text-3xl sm:text-4xl font-black mb-3">{c.title}</h1>
          <p className="opacity-80 text-sm">{c.updated}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className={`rounded-xl p-5 mb-10 border-l-4 border-fastfood-orange ${dark ? "bg-gray-900" : "bg-orange-50"}`}>
          <P><Mix p={c.intro} /></P>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <InfoCard icon={Clock} title={c.c1title}>
            <p>{c.c1val}</p>
            <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">{c.c1sub}</p>
          </InfoCard>
          <InfoCard icon={MapPin} title={c.c2title}>
            <p>{c.c2val}</p>
            <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">{c.c2sub}</p>
          </InfoCard>
          <InfoCard icon={Truck} title={c.c3title}>
            <p>{c.c3val}</p>
            <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">{c.c3sub}</p>
          </InfoCard>
        </div>

        <Section id="delivery-area" title={c.s1title}>
          <P><Mix p={c.s1p1} /></P>
          <P>{c.s1p2}</P>
          <P>{c.s1p3}</P>
        </Section>

        <Section id="delivery-times" title={c.s2title}>
          <Ul>
            {c.s2list.map(([bold, text], i) => <Li key={i}><B>{bold}</B>{text}</Li>)}
          </Ul>
          <P className="pt-2 italic text-xs text-gray-500 dark:text-neutral-500">{c.s2note}</P>
        </Section>

        <Section id="delivery-fee" title={c.s3title}>
          <Ul>
            {c.s3list.map(([bold, text], i) => <Li key={i}><B>{bold}</B>{text}</Li>)}
          </Ul>
          <P className="pt-2">{c.s3p}</P>
        </Section>

        <Section id="delivery-process" title={c.s4title}>
          <P><B>{c.s4h1}</B></P>
          <Ul>{c.s4list1.map((item, i) => <Li key={i}>{item}</Li>)}</Ul>
          <P className="pt-2"><B>{c.s4h2}</B></P>
          <Ul>{c.s4list2.map((item, i) => <Li key={i}>{item}</Li>)}</Ul>
        </Section>

        <Section id="non-delivery" title={c.s5title}>
          <Ul>{c.s5list.map((item, i) => <Li key={i}>{item}</Li>)}</Ul>
          <P className="pt-2">{c.s5p}</P>
        </Section>

        <Section id="food-quality" title={c.s6title}>
          <Ul>
            {c.s6list.map((item, i) => <Li key={i}>{item}</Li>)}
            <Li><B>{c.s6bold}</B></Li>
          </Ul>
        </Section>

        <Section id="no-returns" title={c.s7title}>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <span><Mix p={c.s7warn} /></span>
          </div>
          <P className="pt-3"><B>{c.s7excTitle}</B></P>
          <Ul>{c.s7list.map((item, i) => <Li key={i}>{item}</Li>)}</Ul>
          <P className="pt-2"><Mix p={c.s7contact} /></P>
        </Section>

        <Section id="force-majeure" title={c.s8title}>
          <P>{c.s8p}</P>
        </Section>

        <Section id="contact" title={c.s9title}>
          <Ul>
            {c.s9list.map(([bold, text], i) => <Li key={i}><B>{bold}</B>{text}</Li>)}
            <Li><B>{c.s9anpc}</B>{" "}<a href="https://www.anpc.ro" target="_blank" rel="noopener noreferrer" className="text-fastfood-orange underline">www.anpc.ro</a></Li>
            <Li><B>{c.s9sol}</B>{" "}<a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-fastfood-orange underline">ec.europa.eu/consumers/odr</a></Li>
          </Ul>
        </Section>
      </div>
    </div>
  );
}
