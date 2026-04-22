export function TrustStrip() {
  const logos = [
    { name: 'Acme' },
    { name: 'Capbase' },
    { name: 'Spherule' },
    { name: 'Gridlex' },
    { name: 'Layers' },
  ];

  return (
    <section className="py-12 border-y border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted-foreground">
          Trusted by 10,000+ teams worldwide
        </p>
        <div className="flex items-center justify-center gap-8 sm:gap-12 mt-6 flex-wrap opacity-60">
          {logos.map((logo) => (
            <span
              key={logo.name}
              className="text-base font-semibold text-muted-foreground tracking-wide select-none"
            >
              {logo.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
