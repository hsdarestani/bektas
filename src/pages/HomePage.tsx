import { ArrowDown, ArrowRight, ArrowUpRight, Check, MapPin, MoveRight, Phone } from "lucide-react";
import ContactForm from "../components/ContactForm";
import SiteHeader from "../components/SiteHeader";
import ValuationForm from "../components/ValuationForm";
import { contact, faqs, listings, services, team } from "../data/content";

function SectionTitle({ index, kicker, children }: { index: string; kicker: string; children: React.ReactNode }) {
  return <div className="section-title"><div className="section-kicker"><span>{index}</span>{kicker}</div><h2>{children}</h2></div>;
}

export default function HomePage() {
  const schema = {
    "@context": "https://schema.org", "@type": "RealEstateAgent", name: "Bektas Immobilien", url: "https://bektas.pages.dev/",
    telephone: contact.phone, email: contact.email, address: { "@type": "PostalAddress", streetAddress: "Zur Schleifmühle 136", postalCode: "65205", addressLocality: "Wiesbaden", addressCountry: "DE" },
    areaServed: { "@type": "City", name: "Wiesbaden" },
  };

  return <div className="normal-site">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <SiteHeader />

    <main>
      <section className="hero" id="start" aria-labelledby="hero-title">
        <div className="hero-image"><img src="/images/hero-residence.webp" alt="Zeitgenössische Wohnarchitektur am Abend" fetchPriority="high" /></div>
        <div className="hero-shade" />
        <div className="hero-copy">
          <p className="hero-eyebrow"><i /> Ihr Immobilienmakler in Wiesbaden</p>
          <h1 id="hero-title">Immobilien.<br /><em>Persönlich</em> gedacht.</h1>
          <div className="hero-bottom"><p>Vertrauen, Kompetenz und ein klarer Blick für den regionalen Markt — vom ersten Gespräch bis zum erfolgreichen Abschluss.</p><a href="#bewertung">Immobilie bewerten <ArrowUpRight /></a></div>
        </div>
        <a className="scroll-cue" href="#immobilien" aria-label="Zu den Immobilien"><span>Entdecken</span><ArrowDown /></a>
        <div className="hero-index">01 <span>/</span> 05</div>
      </section>

      <section className="intro wrap">
        <p className="intro-small">Bektas Immobilien verbindet regionale Marktkenntnis mit einer persönlichen, transparenten Beratung.</p>
        <p className="intro-large">Ein Zuhause ist kein Produkt.<br />Und eine Entscheidung dieser Größe<br />braucht mehr als <em>nur einen Makler.</em></p>
      </section>

      <section className="properties wrap" id="immobilien">
        <SectionTitle index="01" kicker="Ausgewählte Immobilien">Räume mit <em>Perspektive.</em></SectionTitle>
        <div className="listing-grid">
          {listings.map((listing, i) => <article className={`listing-card listing-${i + 1}`} key={listing.title}>
            <div className="listing-image"><img loading="lazy" src={listing.image} alt={listing.alt} /><span>{listing.status}</span><a href="#kontakt" aria-label={`${listing.title} anfragen`}><ArrowUpRight /></a></div>
            <p className="listing-eyebrow">{listing.eyebrow}</p><h3>{listing.title}</h3>
            <div className="listing-facts">{listing.meta.map(item => <span key={item}>{item}</span>)}</div><strong className="listing-price">{listing.price}</strong>
          </article>)}
          <div className="listing-note"><span>Objekt 02 / 02</span><p>Sie suchen etwas Bestimmtes?</p><a href="#kontakt">Suchprofil anlegen <MoveRight /></a></div>
        </div>
      </section>

      <section className="two-paths" id="leistungen">
        <article className="path-panel path-sell"><img loading="lazy" src="/images/urban-residence.webp" alt="Renovierte Wiesbadener Wohnarchitektur" /><div className="path-overlay"/><div className="path-content"><span>Für Eigentümer</span><h2>Verkaufen &<br />vermieten</h2><p>Marktgerechte Positionierung, hochwertige Präsentation und persönliche Begleitung.</p><a href="#kontakt">Immobilie anbieten <ArrowUpRight /></a></div></article>
        <article className="path-panel path-buy"><img loading="lazy" src="/images/interior-detail.webp" alt="Hochwertiger Wohnraum mit Naturmaterialien" /><div className="path-overlay"/><div className="path-content"><span>Für Suchende</span><h2>Kaufen &<br />mieten</h2><p>Das passende Objekt finden — mit lokaler Erfahrung und einem klaren Blick für Ihre Wünsche.</p><a href="#immobilien">Immobilien entdecken <ArrowUpRight /></a></div></article>
      </section>

      <section className="valuation" id="bewertung">
        <div className="valuation-copy"><span className="giant-number">WERT</span><p className="section-kicker"><span>02</span>Immobilienbewertung</p><h2>Was ist Ihre<br />Immobilie <em>wert?</em></h2><p>Eine fundierte Einschätzung beginnt mit wenigen Eckdaten. Danach nehmen wir uns persönlich Zeit für Ihre Immobilie und Ihren Markt.</p><ul><li><Check /> Präzise Marktanalyse</li><li><Check /> Lokale Expertise</li><li><Check /> Unverbindliche Erstberatung</li></ul></div>
        <ValuationForm />
      </section>

      <section className="about wrap" id="team">
        <div className="about-grid">
          <SectionTitle index="03" kicker="Bektas Immobilien">Nah am Markt.<br /><em>Näher am Menschen.</em></SectionTitle>
          <div className="about-copy"><p>Als Immobilienmakler-Ehepaar aus Wiesbaden begleiten Fulya und Fatih Bektas Eigentümer und Suchende mit persönlichem Engagement, Transparenz und fundierter regionaler Marktkenntnis.</p><p>Von der Wertermittlung über die Präsentation bis zum Abschluss entsteht ein Service, der nicht nach Standardschablone arbeitet, sondern nach Ihren Zielen.</p><a href="#kontakt">Persönlich kennenlernen <ArrowRight /></a></div>
          <figure className="about-image"><img loading="lazy" src="/images/team-bektas.webp" alt="Fulya und Fatih Bektas" /><figcaption><span>Gemeinsam für Ihre Immobilie</span><em>Wiesbaden · Rhein-Main</em></figcaption></figure>
          <blockquote>„Wir nehmen uns die Zeit, Ihre Wünsche und Ziele wirklich zu verstehen.“</blockquote>
        </div>
        <div className="team-grid">{team.map(member => <article key={member.name}><img loading="lazy" src={member.image} alt={`${member.name}, ${member.role}`} /><div><h3>{member.name}</h3><p>{member.role}</p><a href={`tel:${member.phone.replace(/\s/g, "")}`}>{member.phone} <ArrowUpRight /></a></div></article>)}</div>
      </section>

      <section className="service-list wrap">
        <SectionTitle index="04" kicker="Rundum-Service">Für einen Prozess,<br />der sich <em>leicht anfühlt.</em></SectionTitle>
        <div className="service-rows">{services.map(([index, title, copy]) => <article key={title}><span>{index}</span><h3>{title}</h3><p>{copy}</p><ArrowUpRight /></article>)}</div>
      </section>

      <section className="wiesbaden">
        <div className="wiesbaden-map" aria-hidden="true"><span>50.0782° N</span><i></i><b>WIESBADEN</b><em>8.2398° E</em></div>
        <div className="wiesbaden-copy"><p className="section-kicker"><span>05</span>Lokale Expertise</p><h2>In Wiesbaden<br /><em>zu Hause.</em></h2><p>Wer Immobilien erfolgreich vermittelt, muss mehr kennen als Quadratmeterpreise. Wir kennen die Lagen, die Nachfrage und die Besonderheiten des regionalen Marktes.</p><div className="districts"><span>Nordost</span><span>Sonnenberg</span><span>Biebrich</span><span>Rheingauviertel</span><span>Erbenheim</span><span>Rhein-Main</span></div></div>
      </section>

      <section className="faq wrap" id="faq">
        <SectionTitle index="06" kicker="Gut zu wissen">Fragen, die wir Ihnen<br /><em>schon abnehmen können.</em></SectionTitle>
        <div className="faq-list">{faqs.map(([question, answer], i) => <details key={question} open={i === 0}><summary><span>0{i + 1}</span>{question}<i>+</i></summary><p>{answer}</p></details>)}</div>
      </section>

      <section className="experience-invite"><div><p>Eine andere Perspektive</p><h2>Immobilien<br /><em>neu erleben.</em></h2><a href="/experience">3D Experience starten <ArrowUpRight /></a></div><span className="exp-orbit" aria-hidden="true"><i></i></span></section>

      <section className="contact" id="kontakt">
        <div className="contact-details"><p className="section-kicker"><span>07</span>Kontakt</p><h2>Was dürfen wir<br />für Sie <em>bewegen?</em></h2><p>Ob Verkauf, Vermietung, Suche oder Bewertung — erzählen Sie uns von Ihrem Vorhaben.</p><a href={`tel:${contact.phoneHref}`}><Phone /> {contact.phone}</a><a href={`mailto:${contact.email}`}>{contact.email}</a><address><MapPin /> {contact.address}</address></div>
        <ContactForm />
      </section>
    </main>

    <footer><div className="footer-top"><div className="wordmark footer-mark"><strong>BEKTAS</strong><span>IMMOBILIEN · WIESBADEN</span></div><p>Ihr Immobilienmakler im Raum Wiesbaden.<br />Persönlich. Verlässlich. Kompetent.</p></div><div className="footer-bottom"><span>© 2026 Bektas Immobilien Wiesbaden</span><nav><a href="https://bektas-immobilien-wiesbaden.de/impressum/">Impressum</a><a href="https://bektas-immobilien-wiesbaden.de/datenschutzerklaerung/">Datenschutz</a><a href="/experience">3D Experience</a></nav><a href="#start">Nach oben ↑</a></div></footer>
  </div>;
}
