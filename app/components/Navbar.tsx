export default function Navbar() {
  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-6">
      <div className="max-w-6xl mx-auto">
        <nav className="flex items-center justify-between px-6 py-3 bg-white border border-border rounded-2xl shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-black tracking-tight text-foreground">
              Helios
            </span>
            <span className="text-lg font-black tracking-tight text-blue">
              AI Studio
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
            <a href="#" className="hover:text-foreground transition-colors">
              Platform
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Developers
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Pricing
            </a>
          </div>

          <button className="flex items-center gap-1.5 bg-foreground text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-black/80 transition-colors">
            Sign in
            <span aria-hidden>→</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
