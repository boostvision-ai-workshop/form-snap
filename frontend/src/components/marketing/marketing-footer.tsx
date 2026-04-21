export function MarketingFooter() {
  return (
    <footer className="border-t py-6 text-center text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        © {new Date().getFullYear()} Micro SaaS Agent. All rights reserved.
      </div>
    </footer>
  );
}
