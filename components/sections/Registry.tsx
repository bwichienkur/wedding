import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import { registry } from "@/data/registry";

export function RegistrySection({
  eyebrow = "Registry",
  title = "Registry",
  description = "Your presence means the world to us. If you wish to give a gift, our registry is on Zola.",
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
} = {}) {
  const link = registry.links[0];

  return (
    <Section
      id="registry"
      eyebrow={eyebrow}
      title={title}
      description={description}
    >
      {link && !link.urlIsPlaceholder ? (
        <div className="flex justify-center pt-2">
          <ButtonLink
            href={link.url}
            variant="gold"
            size="lg"
            target="_blank"
            rel="noopener noreferrer"
            className="invite-outline-button min-w-[14rem]"
          >
            {link.label}
            <span className="sr-only"> (opens in a new tab)</span>
          </ButtonLink>
        </div>
      ) : null}
    </Section>
  );
}
