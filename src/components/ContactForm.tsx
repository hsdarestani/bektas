import { ArrowUpRight, Check } from "lucide-react";
import { FormEvent, useState } from "react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent) { event.preventDefault(); setSent(true); }
  if (sent) return <div className="contact-success"><Check /><h3>Vielen Dank.</h3><p>Diese Demo zeigt den vollständigen Anfrageablauf. Im Produktivbetrieb wird die Nachricht direkt zugestellt.</p></div>;
  return <form className="contact-form" onSubmit={submit}>
    <label><span>Name</span><input required placeholder="Ihr Name" /></label><label><span>E-Mail</span><input required type="email" placeholder="name@beispiel.de" /></label>
    <label className="full"><span>Worum geht es?</span><select defaultValue="Immobilie verkaufen"><option>Immobilie verkaufen</option><option>Immobilie bewerten</option><option>Immobilie suchen</option><option>Immobilie vermieten</option><option>Allgemeine Beratung</option></select></label>
    <label className="full"><span>Nachricht</span><textarea rows={3} placeholder="Erzählen Sie uns kurz von Ihrem Vorhaben." /></label>
    <button type="submit">Beratung anfragen <ArrowUpRight /></button><small>Mit dem Absenden akzeptieren Sie die Hinweise zum Datenschutz.</small>
  </form>;
}
