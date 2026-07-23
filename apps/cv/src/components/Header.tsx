import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="header">
      <a href="/" className="header-logo">
        CV<span>Clair</span>
      </a>
      <nav className="header-nav">
        <a href="/app/quiz/">Créer un CV</a>
        <ThemeToggle />
      </nav>
    </header>
  );
}
