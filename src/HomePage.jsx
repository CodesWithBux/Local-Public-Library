import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RESOURCES, TYPES } from './data.js';
import { usePageFocus } from './accessibility.jsx';
import { ResourceCard } from './ResourcesPage.jsx';

const FEATURED = ['storytime', 'nvda-basics', 'book-club'];

export default function HomePage() {
  const headingRef = usePageFocus('Home');
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  return (
    <>
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-body">
          <p className="kicker">Your public library</p>
          <h1 id="hero-heading" ref={headingRef} tabIndex={-1}>Learn, meet and explore at your library</h1>
          <p className="lede">
            Free courses, study rooms, digital archives and events — every one bookable by keyboard and screen reader.
          </p>
          <form
            role="search"
            aria-label="Search the hub"
            className="search-form"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(q.trim() ? `/resources?q=${encodeURIComponent(q.trim())}` : '/resources');
            }}
          >
            <label htmlFor="home-search">Search courses, rooms, archives and events</label>
            <span className="hint" id="home-search-hint">For example: “spreadsheets”, “quiet room” or “local history”.</span>
            <div className="search-row">
              <input id="home-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} aria-describedby="home-search-hint" autoComplete="off" />
              <button className="btn btn-primary" type="submit">Search</button>
            </div>
          </form>
        </div>
      </section>

      <section className="section" aria-labelledby="browse-heading">
        <h2 id="browse-heading">Browse by type</h2>
        <ul className="type-grid">
          {TYPES.map((t) => {
            const n = RESOURCES.filter((r) => r.type === t.id).length;
            return (
              <li key={t.id}>
                <Link className="type-tile" to={`/resources?type=${t.id}`}>
                  <span className="type-name">{t.label}</span>
                  <span className="type-count">{n} available</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="section" aria-labelledby="featured-heading">
        <div className="section-head">
          <h2 id="featured-heading">Happening this month</h2>
          <Link to="/resources?type=event">See all events</Link>
        </div>
        <ul className="grid">
          {FEATURED.map((id) => (
            <li key={id}>
              <ResourceCard resource={RESOURCES.find((r) => r.id === id)} />
            </li>
          ))}
        </ul>
      </section>

      <aside className="help-panel" aria-labelledby="help-heading">
        <h2 id="help-heading">Need help using the hub?</h2>
        <p>
          The <Link to="/resources/at-suite">Assistive Technology Suite</Link> has NVDA, JAWS, ZoomText and a braille
          display. Library staff can also book a room or course for you by phone on{' '}
          <a href="tel:+27510000000">051 000 0000</a>.
        </p>
      </aside>
    </>
  );
}
