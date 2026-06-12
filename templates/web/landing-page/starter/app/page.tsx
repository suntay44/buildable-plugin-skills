import { PricingTiers } from "@/components/pricing-tiers";
import { SiteNav } from "@/components/site-nav";
import { faqs, features, navLinks, sections, testimonials } from "@/lib/sample-content";

const sectionById = (id: string) => sections.find((section) => section.id === id)!;

export default function LandingPage() {
  const hero = sectionById("hero");
  const featuresSection = sectionById("features");
  const socialProof = sectionById("social-proof");
  const pricing = sectionById("pricing");
  const faq = sectionById("faq");
  const closingCta = sectionById("cta");

  return (
    <div className="min-h-screen bg-[#f7f8fb] text-ink">
      <SiteNav />

      <main>
        <section id="hero" aria-label="Hero" className="mx-auto w-full max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-block rounded-full bg-meadow/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-meadow">
              Feedback → roadmap, responsive on every screen
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">{hero.title}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">{hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href={hero.ctaHref}
                className="rounded-md bg-meadow px-6 py-3 text-sm font-semibold text-white hover:bg-meadow/90"
              >
                {hero.ctaLabel}
              </a>
              <a
                href="#features"
                className="rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-ink hover:bg-mist"
              >
                See how it works
              </a>
            </div>
            <p className="mt-4 text-xs text-slate-500">Free 14-day trial · No credit card required</p>
          </div>
        </section>

        <section id="features" aria-label="Features" className="border-y border-slate-200 bg-white">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold">{featuresSection.title}</h2>
              <p className="mt-3 text-slate-600">{featuresSection.subtitle}</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.id} className="rounded-lg border border-slate-200 bg-[#f7f8fb] p-6">
                  <h3 className="font-semibold text-ink">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="social-proof" aria-label="Social proof" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-3xl font-bold">{socialProof.title}</h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure key={testimonial.id} className="grid content-between gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <blockquote className="text-sm leading-relaxed text-slate-700">“{testimonial.quote}”</blockquote>
                <figcaption className="text-sm">
                  <span className="font-semibold text-ink">{testimonial.author}</span>
                  <span className="block text-slate-500">{testimonial.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="pricing" aria-label="Pricing" className="border-y border-slate-200 bg-white">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold">{pricing.title}</h2>
              <p className="mt-3 text-slate-600">{pricing.subtitle}</p>
            </div>
            <div className="mt-12">
              <PricingTiers />
            </div>
          </div>
        </section>

        <section id="faq" aria-label="Frequently asked questions" className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="text-center text-3xl font-bold">{faq.title}</h2>
          <div className="mt-10 grid gap-3">
            {faqs.map((item) => (
              <details key={item.id} className="group rounded-lg border border-slate-200 bg-white p-5">
                <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="cta" aria-label="Closing call to action" className="bg-ink">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 text-center sm:px-6">
            <h2 className="text-3xl font-bold text-white">{closingCta.title}</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-300">{closingCta.subtitle}</p>
            <a
              href="#pricing"
              className="mt-8 inline-block rounded-md bg-meadow px-8 py-3 text-sm font-semibold text-white hover:bg-meadow/90"
            >
              {closingCta.ctaLabel}
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="text-lg font-semibold text-ink">Clarity</p>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Customer feedback that writes the roadmap. Built as a local-first Buildable prototype.
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-slate-600 hover:text-ink">
                {link.label}
              </a>
            ))}
            <a href="#hero" className="text-slate-600 hover:text-ink">
              Back to top
            </a>
          </nav>
        </div>
        <p className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
          © 2026 Clarity. A Buildable golden template.
        </p>
      </footer>
    </div>
  );
}
