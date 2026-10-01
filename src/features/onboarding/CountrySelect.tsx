import { Select } from "@/components/ui";
import { useCopy } from "@/lib/useCopy";
import { useLanguage } from "@/lib/LanguageContext";
import { countryGroups } from "./countries";
import { COUNTRY_COPY as COPY } from "./copy";


/**
 * ISO-2 country picker (African markets first). Use inside a <Field>, which
 * supplies the label and error wiring.
 */
export function CountrySelect({
  value,
  onChange,
  name,
  allowEmpty = true,
}: {
  value: string;
  onChange: (code: string) => void;
  name?: string;
  /** Show an empty "Choose a country" option that can be re-selected. */
  allowEmpty?: boolean;
}) {
  const c = useCopy(COPY);
  const { locale } = useLanguage();
  const { africa, others, extra } = countryGroups(locale, value);
  return (
    <Select name={name} value={value} onChange={(e) => onChange(e.target.value)} autoComplete="country">
      <option value="" disabled={!allowEmpty}>
        {c.choose}
      </option>
      {extra && <option value={extra}>{extra}</option>}
      <optgroup label={c.africa}>
        {africa.map((o) => (
          <option key={o.code} value={o.code}>
            {o.name}
          </option>
        ))}
      </optgroup>
      <optgroup label={c.others}>
        {others.map((o) => (
          <option key={o.code} value={o.code}>
            {o.name}
          </option>
        ))}
      </optgroup>
    </Select>
  );
}
