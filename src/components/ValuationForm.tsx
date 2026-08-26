import { ArrowRight, Check } from "lucide-react";
import { FormEvent, useState } from "react";

export default function ValuationForm() {
  const [sent, setSent] = useState(false);
  const [type, setType] = useState("Wohnung");
  const submit = (event: FormEvent) => { event.preventDefault(); setSent(true); };
  if (sent) return <div className="valuation-success" role="status"><Check /><div><strong>Der erste Schritt ist gemacht.</strong><p>In der finalen Website wird Ihre Anfrage direkt an Bektas Immobilien übermittelt.</p></div></div>;
  return <form className="valuation-form" onSubmit={submit}>
    <fieldset><legend>01 · Immobilienart</legend><div className="type-options">{["Wohnung", "Haus", "Grundstück", "Gewerbe"].map(item => <button type="button" className={type === item ? "active" : ""} onClick={() => setType(item)} key={item}>{item}</button>)}</div></fieldset>
    <label><span>02 · Postleitzahl</span><input required inputMode="numeric" pattern="[0-9]{5}" placeholder="z. B. 65185" aria-label="Postleitzahl" /></label>
    <label><span>03 · Fläche ca.</span><div className="input-unit"><input required type="number" min="10" placeholder="120" aria-label="Ungefähre Fläche" /><em>m²</em></div></label>
    <button className="valuation-submit" type="submit">Bewertung starten <ArrowRight /></button><small>Kostenfrei · unverbindlich · persönlich</small>
  </form>;
}
