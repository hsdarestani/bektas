import { Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { contact } from "../data/content";

export default function SiteHeader({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  const links = [["Immobilien", "/#immobilien"], ["Leistungen", "/#leistungen"], ["Bewertung", "/#bewertung"], ["Über uns", "/#team"]];
  return <header className={`site-header ${dark ? "is-dark" : ""}`}>
    <a className="wordmark" href="/" aria-label="Bektas Immobilien Startseite"><strong>BEKTAS</strong><span>IMMOBILIEN · WIESBADEN</span></a>
    <nav className="desktop-nav" aria-label="Hauptnavigation">
      {links.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
      <a className="experience-link" href="/experience"><span>3D</span> Experience</a>
    </nav>
    <a className="header-call" href={`tel:${contact.phoneHref}`}><Phone size={15} /> Beratung</a>
    <button className="menu-toggle" aria-label={open ? "Menü schließen" : "Menü öffnen"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    {open && <div className="mobile-menu"><p>Navigation</p>{links.map(([label, href], i) => <a key={label} href={href} onClick={() => setOpen(false)}><span>0{i + 1}</span>{label}</a>)}<a href="/experience" className="mobile-experience"><span>05</span>3D Experience</a><a className="mobile-phone" href={`tel:${contact.phoneHref}`}>{contact.phone}</a></div>}
  </header>;
}
