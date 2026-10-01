import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { useCopy } from "@/lib/useCopy";
import { COPY } from "../copy";

/** Back / Next row at the bottom of every wizard step. */
export function StepFooter({
  onBack,
  onNext,
  nextLabel,
  pending,
  nextDisabled,
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  pending?: boolean;
  nextDisabled?: boolean;
}) {
  const c = useCopy(COPY);
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-border-subtle pt-5 sm:flex-row sm:items-center sm:justify-between">
      {onBack ? (
        <Button variant="ghost" leftIcon={<ArrowLeft />} onClick={onBack}>
          {c.back}
        </Button>
      ) : (
        <span />
      )}
      {onNext && (
        <Button rightIcon={<ArrowRight />} onClick={onNext} loading={pending} disabled={nextDisabled}>
          {nextLabel ?? c.next}
        </Button>
      )}
    </div>
  );
}
