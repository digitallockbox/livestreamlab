import Link from "next/link";

const routes = [
  { href: "/dashboard/home", label: "Home" },
  { href: "/dashboard/analytics-overview", label: "Analytics Overview" },
  { href: "/dashboard/stream-health", label: "Stream Health" },
  { href: "/dashboard/go-live", label: "Go Live" },
  { href: "/dashboard/content", label: "Content" },
  { href: "/dashboard/monetization", label: "Monetization" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function IndexPage() {
  return (
    <main>
      <h1>LiveStreamLab Frontend</h1>
      <p>Dashboard routes are now wired and ready to run.</p>
      <div className="card">
        <nav>
          <ul>
            {routes.map((route) => (
              <li key={route.href}>
                <Link href={route.href}>{route.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
