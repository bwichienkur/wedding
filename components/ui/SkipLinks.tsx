import {
  mainContentId,
  weddingDetailsHref,
} from "@/data/navigation";

export function SkipLinks() {
  return (
    <div className="skip-links">
      <a href={`#${mainContentId}`} className="skip-link">
        Skip to content
      </a>
      <a href={weddingDetailsHref} className="skip-link">
        Skip to wedding details
      </a>
    </div>
  );
}
