import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { usePageFocus } from './accessibility.jsx';
import HomePage from './HomePage.jsx';
import ResourcesPage from './ResourcesPage.jsx';
import ResourcePage from './ResourcePage.jsx';
import BookingsPage from './BookingsPage.jsx';

const KEY = 'enlighten-hub-bookings';
const BookingsContext = createContext(null);

function loadBookings() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function BookingsProvider({ children, initial }) {
  const [bookings, setBookings] = useState(() => initial ?? loadBookings());

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(bookings));
    } catch {
    }
  }, [bookings]);

  const addBooking = useCallback((booking) => {
    const reference = `EH-${Math.floor(100000 + Math.random() * 900000)}`;
    const saved = { ...booking, reference };
    setBookings((b) => [...b, saved]);
    return saved;
  }, []);

  const cancelBooking = useCallback((reference) => {
    setBookings((b) => b.filter((x) => x.reference !== reference));
  }, []);

  const placesTaken = useCallback(
    (resourceId, sessionId) =>
      bookings
        .filter((b) => b.resourceId === resourceId && b.slot === sessionId)
        .reduce((sum, b) => sum + Number(b.people || 1), 0),
    [bookings]
  );

  const value = useMemo(
    () => ({ bookings, addBooking, cancelBooking, placesTaken }),
    [bookings, addBooking, cancelBooking, placesTaken]
  );
  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export const useBookings = () => useContext(BookingsContext);

function Layout() {
  const { bookings } = useBookings();
  const count = bookings.length;

  const skipToMain = (e) => {
    e.preventDefault();
    document.getElementById('main')?.focus();
  };

  return (
    <div id="app-shell">
      <a className="skip-link" href="#main" onClick={skipToMain}>
        Skip to main content
      </a>

      <header className="site-header">
        <div className="container header-inner">
          <NavLink to="/" className="logo">
            Enlighten <span className="logo-sub">Learning &amp; Resource Hub</span>
          </NavLink>
          <nav aria-label="Primary">
            <ul className="primary-nav">
              <li><NavLink to="/" end>Home</NavLink></li>
              <li><NavLink to="/resources">Find resources</NavLink></li>
              <li>
                <NavLink to="/bookings">
                  My bookings{' '}
                  <span className="count-badge" aria-hidden="true">{count}</span>{' '}
                  <span className="visually-hidden">({count} {count === 1 ? 'booking' : 'bookings'})</span>
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="container site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <h2 className="footer-heading">Contact the library</h2>
          <address>
            <ul className="footer-links">
              <li><a href="tel:+27510000000">Call 051 000 0000</a></li>
              <li><a href="mailto:info@enlightenlibrary.co.za">Email info@enlightenlibrary.co.za</a></li>
            </ul>
          </address>
          <p className="footer-legal">© Enlighten Public Library · A council community service</p>
        </div>
      </footer>
    </div>
  );
}

function NotFoundPage() {
  const headingRef = usePageFocus('Page not found');
  return (
    <>
      <h1 ref={headingRef} tabIndex={-1}>Page not found</h1>
      <p>We couldn’t find that page or resource.</p>
      <p><Link to="/resources">Browse all resources</Link></p>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="resources" element={<ResourcesPage />} />
        <Route path="resources/:id" element={<ResourcePage notFound={<NotFoundPage />} />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
