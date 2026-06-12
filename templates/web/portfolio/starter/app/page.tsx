import { ProjectGrid } from "@/components/project-grid";
import { profile } from "@/lib/sample-projects";

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-[#f7f8fb] text-ink">
      <header className="border-b border-slate-200 bg-white">
        <nav aria-label="Main" className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <a href="#hero" className="font-semibold">
            {profile.name}
          </a>
          <div className="flex items-center gap-5 text-sm font-medium text-slate-600">
            <a href="#work" className="hover:text-ink">
              Work
            </a>
            <a href="#about" className="hover:text-ink">
              About
            </a>
            <a
              href={`mailto:${profile.contactEmail}`}
              className="rounded-md bg-ink px-4 py-2 text-white hover:bg-ink/90"
            >
              Contact
            </a>
          </div>
        </nav>
      </header>

      <main>
        <section id="hero" aria-label="Introduction" className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-sm font-semibold uppercase tracking-wide text-meadow">Product designer</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">{profile.tagline}</h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#work" className="rounded-md bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-ink/90">
              See the work
            </a>
            <a
              href={`mailto:${profile.contactEmail}`}
              className="rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-ink hover:bg-mist"
            >
              Get in touch
            </a>
          </div>
        </section>

        <section id="work" aria-label="Featured work" className="border-y border-slate-200 bg-white">
          <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
            <h2 className="text-2xl font-bold">Selected work</h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Every project lists the outcome it moved. Filter by the kind of problem you are hiring for.
            </p>
            <div className="mt-8">
              <ProjectGrid />
            </div>
          </div>
        </section>

        <section id="about" aria-label="About section" className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div>
              <h2 className="text-2xl font-bold">About</h2>
              <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">{profile.bio}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Skills</h3>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                {profile.skills.map((skill) => (
                  <li key={skill} className="rounded-md bg-white px-3 py-2 shadow-sm">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="contact" aria-label="Contact call to action" className="bg-ink">
          <div className="mx-auto w-full max-w-5xl px-4 py-16 text-center sm:px-6">
            <h2 className="text-3xl font-bold text-white">Have a project in mind?</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-300">
              I take on one new engagement per quarter. Tell me about the outcome you need to move.
            </p>
            <a
              href={`mailto:${profile.contactEmail}`}
              className="mt-8 inline-block rounded-md bg-meadow px-8 py-3 text-sm font-semibold text-white hover:bg-meadow/90"
            >
              {profile.contactEmail}
            </a>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm text-slate-500 sm:px-6">
        <span>© 2026 {profile.name}</span>
        <nav aria-label="Social links" className="flex gap-4">
          {profile.socialLinks.map((link) => (
            <a key={link.label} href={link.href} className="hover:text-ink">
              {link.label}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
}
