import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import { registry } from "@/data/registry";
import { cn } from "@/lib/cn";

export function RegistrySection() {
  return (
    <Section
      id="registry"
      eyebrow="Registry"
      title="Gifts"
      description="Kept intentionally understated. Your presence matters most."
      className="bg-parchment/40"
    >
      <p
        className={cn(
          "max-w-prose text-base leading-relaxed text-charcoal",
          registry.noteIsPlaceholder && "placeholder-copy text-ink-muted",
        )}
      >
        {registry.note}
      </p>
      <p
        className={cn(
          "mt-4 max-w-prose text-base text-ink-muted",
          registry.presenceIsPlaceholder && "placeholder-copy",
        )}
      >
        {registry.presenceMessage}
      </p>

      <ul className="mt-10 space-y-4">
        {registry.links.map((link) => (
          <li key={link.id} className="flex flex-wrap items-center gap-3">
            {link.urlIsPlaceholder ? (
              <p className="placeholder-copy text-sm text-ink-muted">
                {link.label} — add the registry URL when ready.
              </p>
            ) : (
              <ButtonLink
                href={link.url}
                variant="secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </ButtonLink>
            )}
            {link.description ? (
              <span className="text-sm text-ink-muted">{link.description}</span>
            ) : null}
          </li>
        ))}
        {registry.honeymoonFund ? (
          <li className="pt-2">
            {registry.honeymoonFund.urlIsPlaceholder ? (
              <p className="placeholder-copy text-sm text-ink-muted">
                {registry.honeymoonFund.label} — add the fund link if desired.
              </p>
            ) : (
              <ButtonLink
                href={registry.honeymoonFund.url}
                variant="ghost"
                target="_blank"
                rel="noopener noreferrer"
              >
                {registry.honeymoonFund.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </ButtonLink>
            )}
          </li>
        ) : null}
      </ul>
    </Section>
  );
}
