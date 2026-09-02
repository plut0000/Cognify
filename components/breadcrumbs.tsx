import Link from "next/link";
import JsonLd from "@/components/json-ld";
import { absoluteUrl } from "@/lib/site-config";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const structuredItems = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.label,
    ...(item.href ? { item: absoluteUrl(item.href) } : {}),
  }));

  return (
    <>
      <nav className="page-breadcrumbs" aria-label="Breadcrumb">
        <ol>
          {items.map((item, index) => (
            <li key={`${item.label}-${index}`}>
              {item.href && index < items.length - 1 ? (
                <Link href={item.href}>{item.label}</Link>
              ) : (
                <span aria-current={index === items.length - 1 ? "page" : undefined}>{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: structuredItems,
        }}
      />
    </>
  );
}
