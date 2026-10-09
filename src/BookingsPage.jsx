import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useBookings } from './App.jsx';
import { useAnnouncer, usePageFocus } from './accessibility.jsx';
import { typeLabel } from './data.js';

export default function BookingsPage() {
  const headingRef = usePageFocus('My bookings');
  const { bookings, cancelBooking } = useBookings();
  const { announce } = useAnnouncer();
  const buttonRefs = useRef({});

  const cancel = (index) => {
    const b = bookings[index];
    const neighbour = bookings[index + 1] ?? bookings[index - 1];
    cancelBooking(b.reference);
    announce(`Booking ${b.reference} for ${b.resourceTitle} cancelled.`);
    requestAnimationFrame(() => {
      (neighbour ? buttonRefs.current[neighbour.reference] : headingRef.current)?.focus();
    });
  };

  const when = (b) =>
    b.slotLabel ??
    (b.date ? `${b.date} at ${b.startTime}, ${b.duration} ${b.duration === '1' ? 'hour' : 'hours'}` : `Format: ${b.deliveryFormat}`);

  return (
    <>
      <h1 ref={headingRef} tabIndex={-1}>My bookings</h1>
      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>You have no bookings yet.</p>
          <Link className="btn btn-primary" to="/resources">Find something to book</Link>
        </div>
      ) : (
        <>
          <p className="lede">
            You have {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}.
          </p>
          <ul className="booking-list">
            {bookings.map((b, i) => (
              <li key={b.reference} className="booking-item">
                <article aria-labelledby={`bk-${b.reference}`}>
                  <h2 id={`bk-${b.reference}`} className="booking-title">
                    <Link to={`/resources/${b.resourceId}`}>{b.resourceTitle}</Link>
                  </h2>
                  <dl className="facts">
                    <dt>Type</dt><dd>{typeLabel(b.type)}</dd>
                    <dt>When</dt><dd>{when(b)}</dd>
                    <dt>Reference</dt><dd className="reference">{b.reference}</dd>
                  </dl>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    ref={(el) => (buttonRefs.current[b.reference] = el)}
                    onClick={() => cancel(i)}
                  >
                    Cancel{' '}<span className="visually-hidden">booking for {b.resourceTitle}</span>
                  </button>
                </article>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
