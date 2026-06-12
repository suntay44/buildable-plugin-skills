"use client";

import { useState } from "react";
import { allTags, projects } from "@/lib/sample-projects";
import type { Project } from "@/types/project";

function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="grid content-start gap-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="font-semibold text-ink">{project.title}</h3>
        <span className="shrink-0 text-xs text-slate-500">{project.year}</span>
      </header>
      <p className="text-sm leading-relaxed text-slate-600">{project.summary}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{project.role}</p>
      <ul className="flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <li key={tag} className="rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-slate-600">
            {tag}
          </li>
        ))}
      </ul>

      {project.caseStudy ? (
        <div>
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((current) => !current)}
            className="text-sm font-semibold text-meadow hover:underline"
          >
            {expanded ? "Hide case study" : "Read case study preview"}
          </button>
          {expanded ? (
            <dl className="mt-3 grid gap-2 rounded-md bg-[#f7f8fb] p-4 text-sm">
              <div>
                <dt className="font-semibold text-ink">Problem</dt>
                <dd className="text-slate-600">{project.caseStudy.problem}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Approach</dt>
                <dd className="text-slate-600">{project.caseStudy.approach}</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Outcome</dt>
                <dd className="text-slate-600">{project.caseStudy.outcome}</dd>
              </div>
            </dl>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function ProjectGrid() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const visible = activeTag ? projects.filter((project) => project.tags.includes(activeTag)) : projects;

  return (
    <section aria-label="Project grid" className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter projects by tag">
        <button
          type="button"
          onClick={() => setActiveTag(null)}
          aria-pressed={activeTag === null}
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            activeTag === null ? "bg-ink text-white" : "border border-slate-300 text-slate-600 hover:bg-mist"
          }`}
        >
          All projects
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setActiveTag(tag)}
            aria-pressed={activeTag === tag}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              activeTag === tag ? "bg-ink text-white" : "border border-slate-300 text-slate-600 hover:bg-mist"
            }`}
          >
            {tag}
          </button>
        ))}
        <span className="ml-auto text-sm text-slate-500">
          {visible.length} project{visible.length === 1 ? "" : "s"}
        </span>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No projects match this tag yet. Clear the filter to see all work.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}
