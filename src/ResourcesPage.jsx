import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ACCESS_FEATURES, AUDIENCES, FORMATS, RESOURCES, TYPES, featureLabel, formatLabel, typeLabel } from './data.js';
import { useAnnouncer, usePageFocus } from './accessibility.jsx';

export function ResourceCard({ resource, headingLevel = 3 }) {
  const H = `h${headingLevel}`;
  return (
    <article className="card">
      <div className="cover" style={{ background: resource.color }} aria-hidden="true">
        <span className="cover-type">{typeLabel(resource.type)}</span>
      </div>
      <div className="card-body">
        <p className="card-kicker">
          <span className="visually-hidden">{typeLabel(resource.type)} · </span>
          {formatLabel(resource.format)} · {resource.audience}
        </p>
        <H className="card-title">
          <Link to={`/resources/${resource.id}`}>{resource.title}</Link>
        </H>
        <p className="card-summary">{resource.summary}</p>
        <p className="card-access">
          <span className="visually-hidden">Accessibility: </span>
          {resource.access.map(featureLabel).join(' · ')}
        </p>
      </div>
    </article>
  );
}

function Disclosure({ title, children, defaultOpen = false, headingLevel = 3, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const H = `h${headingLevel}`;

  return (
    <div className="disclosure">
      <H className="disclosure-heading">
        <button
          type="button"
          className="disclosure-button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
        >
          <span>{title}</span>
          {badge ? <span className="disclosure-badge">{badge}</span> : null}
          <svg className="chevron" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </H>
      <div id={panelId} className="disclosure-panel" hidden={!open}>
        {children}
      </div>
    </div>
  );
}

function ToggleChip({ pressed, onToggle, children, count }) {
  return (
    <button type="button" className="chip" aria-pressed={pressed} onClick={onToggle}>
      <span className="chip-check" aria-hidden="true">{pressed ? '✓' : ''}</span>
      {children}
      {typeof count === 'number' ? <span className="chip-count">({count})</span> : null}
    </button>
  );
}

export function filterResources(list, { q, types, format, access, audience }) {
  const needle = q.trim().toLowerCase();
  return list.filter((r) => {
    if (types.length && !types.includes(r.type)) return false;
    if (format && r.format !== format) return false;
    if (audience && r.audience !== audience) return false;
    if (access.length && !access.every((a) => r.access.includes(a))) return false;
    if (needle) {
      const hay = `${r.title} ${r.summary} ${r.description} ${r.location}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    return true;
  });
}

export default function ResourcesPage() {
  const headingRef = usePageFocus('Find resources');
  const [params, setParams] = useSearchParams();
  const { announce } = useAnnouncer();

  const filters = {
    q: params.get('q') ?? '',
    types: params.getAll('type'),
    format: params.get('format') ?? '',
    access: params.getAll('access'),
    audience: params.get('audience') ?? '',
  };
  const results = useMemo(() => filterResources(RESOURCES, filters), [params]);

  const [query, setQuery] = useState(filters.q);
  useEffect(() => setQuery(filters.q), [filters.q]);

  const update = (mutate) => {
    const next = new URLSearchParams(params);
    mutate(next);
    setParams(next, { replace: true });
  };

  const toggleMulti = (key, value) =>
    update((p) => {
      const current = p.getAll(key);
      p.delete(key);
      const nextVals = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      nextVals.forEach((v) => p.append(key, v));
    });

  const setSingle = (key, value) =>
    update((p) => (value ? p.set(key, value) : p.delete(key)));

  const activeCount =
    filters.types.length + filters.access.length + (filters.format ? 1 : 0) + (filters.audience ? 1 : 0) + (filters.q ? 1 : 0);

  const clearAll = () => {
    setQuery('');
    setParams(new URLSearchParams(), { replace: true });
    searchRef.current?.focus();
  };

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const t = setTimeout(() => {
      announce(
        results.length === 0
          ? 'No resources match these filters.'
          : `Showing ${results.length} of ${RESOURCES.length} resources.`
      );
    }, 500);
    return () => clearTimeout(t);
  }, [results.length, params, announce]);

  const searchRef = useRef(null);
  const countRef = useRef(null);
  const skipToResults = (e) => {
    e.preventDefault();
    countRef.current?.focus();
  };
  const typeCount = (id) => RESOURCES.filter((r) => r.type === id).length;

  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><Link to="/">Home</Link></li>
          <li><span aria-current="page">Find resources</span></li>
        </ol>
      </nav>

      <h1 ref={headingRef} tabIndex={-1}>Find resources</h1>
      <p className="lede">Search and filter free courses, rooms, digital collections and events.</p>

      <div className="listing">
        <aside className="filters" aria-labelledby="filters-heading">
          <div className="filters-head">
            <h2 id="filters-heading">Filter results</h2>
            {activeCount > 0 && (
              <button type="button" className="link-button" onClick={clearAll}>
                Clear all filters{' '}<span className="visually-hidden">({activeCount} active)</span>
              </button>
            )}
          </div>

          <div role="group" aria-labelledby="type-group-label" className="chip-group">
            <p id="type-group-label" className="group-label">Resource type</p>
            {TYPES.map((t) => (
              <ToggleChip
                key={t.id}
                pressed={filters.types.includes(t.id)}
                onToggle={() => toggleMulti('type', t.id)}
                count={typeCount(t.id)}
              >
                {t.label}
              </ToggleChip>
            ))}
          </div>

          <a href="#results-count" className="skip-results" onClick={skipToResults}>
            Skip to results ({results.length})
          </a>

          <Disclosure title="Format" badge={filters.format ? '1' : null}>
            <fieldset>
              <legend className="visually-hidden">Format</legend>
              {[{ id: '', label: 'Any format' }, ...FORMATS].map((f) => (
                <div className="check" key={f.id || 'any'}>
                  <input
                    type="radio"
                    id={`format-${f.id || 'any'}`}
                    name="format"
                    value={f.id}
                    checked={filters.format === f.id}
                    onChange={() => setSingle('format', f.id)}
                  />
                  <label htmlFor={`format-${f.id || 'any'}`}>{f.label}</label>
                </div>
              ))}
            </fieldset>
          </Disclosure>

          <Disclosure title="Accessibility features" badge={filters.access.length || null}>
            <p id="access-hint" className="hint">Shows only resources that have every feature you tick.</p>
            <fieldset aria-describedby="access-hint">
              <legend className="visually-hidden">Accessibility features</legend>
              {ACCESS_FEATURES.map((a) => (
                <div className="check" key={a.id}>
                  <input
                    type="checkbox"
                    id={`access-${a.id}`}
                    checked={filters.access.includes(a.id)}
                    onChange={() => toggleMulti('access', a.id)}
                  />
                  <label htmlFor={`access-${a.id}`}>{a.label}</label>
                </div>
              ))}
            </fieldset>
          </Disclosure>

          <Disclosure title="Audience" badge={filters.audience ? '1' : null}>
            <fieldset>
              <legend className="visually-hidden">Who is it for?</legend>
              {['', ...AUDIENCES].map((a) => {
                const id = `audience-${a ? a.toLowerCase().replace(/\s+/g, '-') : 'any'}`;
                return (
                  <div className="check" key={id}>
                    <input
                      type="radio"
                      id={id}
                      name="audience"
                      value={a}
                      checked={filters.audience === a}
                      onChange={() => setSingle('audience', a)}
                    />
                    <label htmlFor={id}>{a || 'Anyone'}</label>
                  </div>
                );
              })}
            </fieldset>
          </Disclosure>
        </aside>

        <section aria-labelledby="results-heading" className="results">
          <h2 id="results-heading" className="visually-hidden">Results</h2>

          <form
            role="search"
            aria-label="Search resources"
            className="search-form"
            onSubmit={(e) => {
              e.preventDefault();
              setSingle('q', query.trim());
            }}
          >
            <label htmlFor="resource-search">Search by keyword</label>
            <span id="search-hint" className="hint">Results update as you type.</span>
            <div className="search-row">
              <input
                ref={searchRef}
                id="resource-search"
                type="search"
                value={query}
                aria-describedby="search-hint"
                autoComplete="off"
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSingle('q', e.target.value);
                }}
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </div>
          </form>

          <p className="results-count" id="results-count" ref={countRef} tabIndex={-1}>
            Showing <strong>{results.length}</strong> of {RESOURCES.length} resources
          </p>

          {results.length > 0 ? (
            <ul className="grid" aria-describedby="results-count">
              {results.map((r) => (
                <li key={r.id}>
                  <ResourceCard resource={r} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <p>No resources match these filters.</p>
              <button type="button" className="btn btn-secondary" onClick={clearAll}>
                Clear all filters
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
