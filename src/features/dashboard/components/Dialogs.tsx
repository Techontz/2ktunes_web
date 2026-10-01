import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button, Dialog, Field, PasswordInput, Textarea } from "@/components/ui";
import { errorCodeOf, fieldErrorsOf, useErrorMessage } from "@/lib/api/errors";
import { useLanguage } from "@/lib/LanguageContext";

/**
 * PasswordConfirmDialog — asks for the current password, then runs
 * `onConfirm(password)`. If that throws an ApiError with
 * `code: password_incorrect` (or a `current_password` field error) the message
 * is shown under the field and the dialog stays open; any other error is shown
 * above the actions. Resolving closes the dialog.
 */
export function PasswordConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  danger,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  title?: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  children?: ReactNode;
}) {
  const { t } = useLanguage();
  const toMessage = useErrorMessage();
  const [password, setPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPassword("");
      setFieldError(null);
      setFormError(null);
    }
  }, [open]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) {
      setFieldError(t("pw.required"));
      return;
    }
    setPending(true);
    setFieldError(null);
    setFormError(null);
    try {
      await onConfirm(password);
      onClose();
    } catch (err) {
      const fe = fieldErrorsOf(err);
      if (errorCodeOf(err) === "password_incorrect" || fe.current_password) {
        setFieldError(fe.current_password ?? t("pw.incorrect"));
        inputRef.current?.focus();
      } else {
        setFormError(toMessage(err));
      }
    } finally {
      setPending(false);
    }
  };

  const formId = "pw-confirm-form";
  return (
    <Dialog
      open={open}
      onClose={pending ? () => {} : onClose}
      dismissible={!pending}
      title={title ?? t("pw.title")}
      description={description ?? t("pw.body")}
      closeLabel={t("common.close")}
      initialFocusRef={inputRef}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            {t("act.cancel")}
          </Button>
          <Button type="submit" form={formId} loading={pending} variant={danger ? "danger" : "primary"}>
            {confirmLabel ?? t("act.confirm")}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} className="space-y-4" noValidate>
        {children}
        <Field label={t("pw.label")} error={fieldError}>
          <PasswordInput
            ref={inputRef}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showLabel={t("auth.show_pw")}
            hideLabel={t("auth.hide_pw")}
          />
        </Field>
        {formError && (
          <p role="alert" className="text-body-sm font-medium text-danger">
            {formError}
          </p>
        )}
      </form>
    </Dialog>
  );
}

/**
 * ConfirmDialog — a yes/no confirmation, optionally collecting a required
 * reason (takedown, decline, revision…). `onConfirm` may throw; its message
 * is shown and the dialog stays open.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  danger,
  reason,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  /** Collect a free-text reason. `minLength` is enforced client-side. */
  reason?: { label: string; hint?: string; minLength?: number; required?: boolean };
  children?: ReactNode;
}) {
  const { t } = useLanguage();
  const toMessage = useErrorMessage();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (open) {
      setText("");
      setError(null);
    }
  }, [open]);

  const tooShort = reason && (reason.required ?? true) && text.trim().length < (reason.minLength ?? 1);

  const confirm = async () => {
    if (tooShort) {
      setError(reason?.hint ?? reason?.label ?? t("err.fix_fields"));
      return;
    }
    setPending(true);
    setError(null);
    try {
      await onConfirm(text.trim());
      onClose();
    } catch (err) {
      const fe = fieldErrorsOf(err);
      setError(Object.values(fe)[0] ?? toMessage(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={pending ? () => {} : onClose}
      dismissible={!pending}
      role="alertdialog"
      title={title}
      description={description}
      closeLabel={t("common.close")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pending}>
            {t("act.cancel")}
          </Button>
          <Button onClick={confirm} loading={pending} variant={danger ? "danger" : "primary"}>
            {confirmLabel ?? t("act.confirm")}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {children}
        {reason && (
          <Field label={reason.label} hint={reason.hint} error={reason ? error : null}>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} />
          </Field>
        )}
        {!reason && error && (
          <p role="alert" className="text-body-sm font-medium text-danger">
            {error}
          </p>
        )}
      </div>
    </Dialog>
  );
}
