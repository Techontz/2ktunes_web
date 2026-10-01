import { useCallback, useRef, useState } from "react";
import { fieldErrorsOf, useErrorMessage } from "@/lib/api/errors";

/**
 * useAction — state for one mutation (submit a form, press a button).
 *
 *   const save = useAction(async (input: Input) => updateArtist(id, input));
 *   const res = await save.run(values);   // { ok: true, value } | { ok: false }
 *   if (res.ok) toast(…);
 *   <Field error={save.fieldErrors.name}>…
 *   {save.error && <FormAlert>{save.error}</FormAlert>}
 *   <Button loading={save.pending}>
 *
 * `run` never throws: it resolves to `{ ok: true, value }` or `{ ok: false }`
 * (the failure is then in `error` / `fieldErrors` / `errorObj`). A second call
 * while one is in flight resolves `{ ok: false, ignored: true }`.
 */
// Every key exists on both variants so property access type-checks even
// where the (non-strict) compiler doesn't narrow on `ok`.
export type ActionResult<R> =
  | { ok: true; value: R; ignored?: undefined; error?: undefined }
  | { ok: false; value?: undefined; ignored?: boolean; error?: unknown };

export function useAction<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorObj, setErrorObj] = useState<unknown>(null);
  const inflight = useRef(false);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const toMessage = useErrorMessage();

  const run = useCallback(
    async (...args: A): Promise<ActionResult<R>> => {
      if (inflight.current) return { ok: false, ignored: true };
      inflight.current = true;
      setPending(true);
      setError(null);
      setFieldErrors({});
      setErrorObj(null);
      try {
        return { ok: true, value: await fnRef.current(...args) };
      } catch (err) {
        setErrorObj(err);
        setFieldErrors(fieldErrorsOf(err));
        setError(toMessage(err));
        return { ok: false, error: err };
      } finally {
        inflight.current = false;
        setPending(false);
      }
    },
    [toMessage],
  );

  const reset = useCallback(() => {
    setError(null);
    setFieldErrors({});
    setErrorObj(null);
  }, []);

  return { run, pending, error, fieldErrors, errorObj, reset };
}
