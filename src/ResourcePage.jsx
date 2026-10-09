import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ROOM_TIMES, featureLabel, formatLabel, getResource, typeLabel } from './data.js';
import { useAnnouncer, useFormValidation, usePageFocus } from './accessibility.jsx';
import { useBookings } from './App.jsx';
import Modal from './Modal.jsx';

export default function ResourcePage({ notFound }) {
  const { id } = useParams();
  const resource = getResource(id);
  if (!resource) return notFound;
  return <Detail key={resource.id} resource={resource} />;
}

function Detail({ resource }) {
  const [hasErrors, setHasErrors] = useState(false);
  const headingRef = usePageFocus(`${hasErrors ? 'Error: ' : ''}${resource.title}`);
  const onErrorStateChange = useCallback((v) => setHasErrors(v), []);

  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/resources">Find resources</Link></li>
          <li><span aria-current="page">{resource.title}</span></li>
        </ol>
      </nav>

      <div className="detail">
        <article aria-labelledby="resource-title" className="detail-main">
          <p className="card-kicker">
            <span className="tag">{typeLabel(resource.type)}</span> · {formatLabel(resource.format)} · {resource.audience}
          </p>
          <h1 id="resource-title" ref={headingRef} tabIndex={-1}>{resource.title}</h1>
          <div className="cover cover-lg" style={{ background: resource.color }} aria-hidden="true">
            <span className="cover-type">{typeLabel(resource.type)}</span>
            <span className="cover-title">{resource.title}</span>
          </div>
          <p className="lede">{resource.description}</p>

          <h2>At a glance</h2>
          <dl className="facts">
            <dt>Where</dt>
            <dd>{resource.location}</dd>
            <dt>Who for</dt>
            <dd>{resource.audience}</dd>
            {resource.capacity ? (<><dt>Capacity</dt><dd>Up to {resource.capacity} {resource.capacity === 1 ? 'person' : 'people'}</dd></>) : null}
            {resource.sessions ? (<><dt>Sessions</dt><dd>{resource.sessions.length} upcoming</dd></>) : null}
            {resource.formats ? (<><dt>Formats</dt><dd>{resource.formats.join(', ')}</dd></>) : null}
          </dl>

          <h2>Accessibility</h2>
          <ul className="feature-list">
            {resource.access.map((a) => (
              <li key={a}>{featureLabel(a)}</li>
            ))}
          </ul>
        </article>

        <BookingForm resource={resource} onErrorStateChange={onErrorStateChange} />
      </div>
    </>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CARD_RE = /^[A-Za-z]{2}\d{6}$/;

const isoDate = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export function modeFor(resource) {
  if (resource.type === 'room') return 'room';
  if (resource.type === 'archive') return 'archive';
  return 'session';
}

function BookingForm({ resource, onErrorStateChange, today = new Date() }) {
  const mode = modeFor(resource);
  const { announce } = useAnnouncer();
  const { addBooking, bookings, placesTaken } = useBookings();
  const minDate = isoDate(today);
  const maxDate = isoDate(addDays(today, 30));

  const sessionsWithPlaces = useMemo(
    () =>
      (resource.sessions ?? []).map((s) => ({
        ...s,
        left: Math.max(0, s.places - placesTaken(resource.id, s.id)),
      })),
    [resource, placesTaken]
  );

  const fields = useMemo(() => {
    const personal = {
      fullName: {
        label: 'Full name',
        validate: (v) => (v.trim().length < 2 ? 'Enter your full name' : ''),
      },
      email: {
        label: 'Email address',
        validate: (v) =>
          !v.trim() ? 'Enter your email address' : !EMAIL_RE.test(v.trim()) ? 'Enter an email address in the format name@example.com' : '',
      },
      card: {
        label: 'Library card number',
        validate: (v) =>
          !v.trim() ? 'Enter your library card number' : !CARD_RE.test(v.trim()) ? 'Enter your library card number, for example EL123456' : '',
      },
    };
    const agree = {
      agree: {
        label: 'Guidelines agreement',
        validate: (v) => (v ? '' : 'Confirm that you agree to the library guidelines'),
      },
    };
    if (mode === 'room') {
      return {
        date: {
          label: 'Date',
          validate: (v) =>
            !v ? 'Enter a date' : v < minDate || v > maxDate ? 'Choose a date between today and 30 days from now' : '',
        },
        startTime: { label: 'Start time', validate: (v) => (v ? '' : 'Choose a start time') },
        people: {
          label: 'Number of people',
          validate: (v) => {
            const n = Number(v);
            return !Number.isInteger(n) || n < 1 || n > resource.capacity
              ? `Enter a number from 1 to ${resource.capacity}`
              : '';
          },
        },
        ...personal,
        ...agree,
      };
    }
    if (mode === 'session') {
      return {
        slot: { label: 'Session', validate: (v) => (v ? '' : 'Choose a session') },
        people: {
          label: 'Number of places',
          validate: (v, all) => {
            const n = Number(v);
            const left = sessionsWithPlaces.find((s) => s.id === all.slot)?.left ?? 4;
            const max = Math.min(4, left || 4);
            return !Number.isInteger(n) || n < 1 || n > max ? `Enter a number from 1 to ${max}` : '';
          },
        },
        ...personal,
        ...agree,
      };
    }
    return {
      deliveryFormat: { label: 'Format', validate: (v) => (v ? '' : 'Choose the format you need') },
      ...personal,
      ...agree,
    };
  }, [mode, minDate, maxDate, resource.capacity, sessionsWithPlaces]);

  const initial = {
    fullName: '', email: '', card: '', needs: '', agree: false,
    date: '', startTime: '', duration: '1', people: '1', slot: '', deliveryFormat: '',
  };
  const { values, errors, touched, handleChange, handleBlur, validateForSubmit, reset } =
    useFormValidation(initial, fields);

  const [submitCount, setSubmitCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const summaryRef = useRef(null);
  const submitRef = useRef(null);

  const visibleErrors = Object.fromEntries(Object.entries(errors).filter(([k]) => touched[k]));
  const errorKeys = Object.keys(fields).filter((k) => visibleErrors[k]);
  const showSummary = submitCount > 0 && errorKeys.length > 0;

  useEffect(() => onErrorStateChange?.(showSummary), [showSummary, onErrorStateChange]);

  const [focusSummary, setFocusSummary] = useState(0);
  useEffect(() => {
    if (focusSummary) summaryRef.current?.focus();
  }, [focusSummary]);

  const ids = (name) => ({
    hint: `${name}-hint`,
    error: `${name}-error`,
  });
  const describedBy = (name, hasHint = true) =>
    [hasHint ? ids(name).hint : null, visibleErrors[name] ? ids(name).error : null].filter(Boolean).join(' ') || undefined;
  const fieldProps = (name, hasHint = true) => ({
    id: name,
    name,
    onChange: handleChange,
    onBlur: handleBlur,
    'aria-invalid': visibleErrors[name] ? 'true' : undefined,
    'aria-describedby': describedBy(name, hasHint),
  });
  const ErrorText = ({ name }) =>
    visibleErrors[name] ? (
      <p className="error-text" id={ids(name).error}>
        <span className="visually-hidden">Error:</span>{' '}
        <span aria-hidden="true">⚠</span>{' '}
        {visibleErrors[name]}
      </p>
    ) : null;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const all = validateForSubmit();
    setSubmitCount((c) => c + 1);
    if (Object.keys(all).length) {
      setFocusSummary((n) => n + 1);
      return;
    }

    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));

    const duplicate = bookings.some(
      (b) =>
        b.resourceId === resource.id &&
        b.card.toUpperCase() === values.card.trim().toUpperCase() &&
        (mode === 'room' ? b.date === values.date && b.startTime === values.startTime : mode === 'session' ? b.slot === values.slot : b.deliveryFormat === values.deliveryFormat)
    );
    setBusy(false);
    if (duplicate) {
      announce('Booking not sent. You already have a booking for this time with this library card.', 'assertive');
      return;
    }

    const session = sessionsWithPlaces.find((s) => s.id === values.slot);
    const booking = addBooking({
      resourceId: resource.id,
      resourceTitle: resource.title,
      type: resource.type,
      name: values.fullName.trim(),
      email: values.email.trim(),
      card: values.card.trim().toUpperCase(),
      needs: values.needs.trim(),
      ...(mode === 'room' && { date: values.date, startTime: values.startTime, duration: values.duration, people: values.people }),
      ...(mode === 'session' && { slot: values.slot, slotLabel: session?.label, people: values.people }),
      ...(mode === 'archive' && { deliveryFormat: values.deliveryFormat }),
    });
    setConfirmed(booking);
    reset();
    setSubmitCount(0);
  };

  const heading = mode === 'room' ? 'Reserve this room' : mode === 'session' ? 'Register for a session' : 'Request an accessible copy';
  const submitLabel = mode === 'room' ? 'Reserve room' : mode === 'session' ? 'Register' : 'Send request';

  return (
    <section className="booking-panel" aria-labelledby="booking-heading">
      <h2 id="booking-heading">{heading}</h2>

      {showSummary && (
        <section className="error-summary" ref={summaryRef} tabIndex={-1} aria-labelledby="error-summary-title">
          <h3 id="error-summary-title">
            There {errorKeys.length === 1 ? 'is 1 problem' : `are ${errorKeys.length} problems`} with your {mode === 'archive' ? 'request' : 'booking'}
          </h3>
          <ul>
            {errorKeys.map((k) => (
              <li key={k}>
                <a
                  href={`#${k === 'slot' ? `slot-${sessionsWithPlaces.find((s) => s.left > 0)?.id ?? 's1'}` : k}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const target =
                      k === 'slot'
                        ? document.querySelector('input[name="slot"]:not([disabled])')
                        : document.getElementById(k);
                    target?.focus();
                  }}
                >
                  {visibleErrors[k]}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <form noValidate onSubmit={onSubmit} aria-busy={busy}>
        <p className="hint">All fields are required unless marked optional.</p>

        {mode === 'session' && (
          <fieldset
            className={`field ${visibleErrors.slot ? 'field--error' : ''}`}
            aria-describedby={describedBy('slot')}
          >
            <legend className="label">Choose a session</legend>
            <p className="hint" id="slot-hint">Sessions with no places left cannot be selected.</p>
            <ErrorText name="slot" />
            {sessionsWithPlaces.map((s) => (
              <div className="check" key={s.id}>
                <input
                  type="radio"
                  id={`slot-${s.id}`}
                  name="slot"
                  value={s.id}
                  checked={values.slot === s.id}
                  disabled={s.left === 0}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={visibleErrors.slot ? 'true' : undefined}
                />
                <label htmlFor={`slot-${s.id}`}>
                  {s.label} — {s.left === 0 ? 'full' : `${s.left} ${s.left === 1 ? 'place' : 'places'} left`}
                </label>
              </div>
            ))}
          </fieldset>
        )}

        {mode === 'room' && (
          <>
            <div className={`field ${visibleErrors.date ? 'field--error' : ''}`}>
              <label htmlFor="date">Date</label>
              <p className="hint" id="date-hint">Rooms can be booked from today up to 30 days ahead.</p>
              <ErrorText name="date" />
              <input type="date" min={minDate} max={maxDate} value={values.date} {...fieldProps('date')} />
            </div>

            <div className={`field ${visibleErrors.startTime ? 'field--error' : ''}`}>
              <label htmlFor="startTime">Start time</label>
              <p className="hint" id="startTime-hint">Opening hours are 09:00 to 17:00.</p>
              <ErrorText name="startTime" />
              <select value={values.startTime} {...fieldProps('startTime')}>
                <option value="">Select a time</option>
                {ROOM_TIMES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <fieldset className="field">
              <legend className="label">How long do you need it?</legend>
              {['1', '2'].map((d) => (
                <div className="check" key={d}>
                  <input type="radio" id={`duration-${d}`} name="duration" value={d} checked={values.duration === d} onChange={handleChange} />
                  <label htmlFor={`duration-${d}`}>{d} {d === '1' ? 'hour' : 'hours'}</label>
                </div>
              ))}
            </fieldset>
          </>
        )}

        {mode !== 'archive' && (
          <div className={`field ${visibleErrors.people ? 'field--error' : ''}`}>
            <label htmlFor="people">{mode === 'room' ? 'Number of people' : 'Number of places'}</label>
            <p className="hint" id="people-hint">
              {mode === 'room' ? `This room holds up to ${resource.capacity}.` : 'You can book up to 4 places at once.'}
            </p>
            <ErrorText name="people" />
            <input type="number" inputMode="numeric" min="1" className="input-short" value={values.people} {...fieldProps('people')} />
          </div>
        )}

        {mode === 'archive' && (
          <div className={`field ${visibleErrors.deliveryFormat ? 'field--error' : ''}`}>
            <label htmlFor="deliveryFormat">Format</label>
            <p className="hint" id="deliveryFormat-hint">We will email a download link within one working day.</p>
            <ErrorText name="deliveryFormat" />
            <select value={values.deliveryFormat} {...fieldProps('deliveryFormat')}>
              <option value="">Select a format</option>
              {resource.formats.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        )}

        <div className={`field ${visibleErrors.fullName ? 'field--error' : ''}`}>
          <label htmlFor="fullName">Full name</label>
          <ErrorText name="fullName" />
          <input type="text" autoComplete="name" value={values.fullName} {...fieldProps('fullName', false)} />
        </div>

        <div className={`field ${visibleErrors.email ? 'field--error' : ''}`}>
          <label htmlFor="email">Email address</label>
          <p className="hint" id="email-hint">We’ll send your confirmation here.</p>
          <ErrorText name="email" />
          <input type="email" autoComplete="email" spellCheck={false} value={values.email} {...fieldProps('email')} />
        </div>

        <div className={`field ${visibleErrors.card ? 'field--error' : ''}`}>
          <label htmlFor="card">Library card number</label>
          <p className="hint" id="card-hint">2 letters then 6 numbers, printed on the back of your card. For example EL123456.</p>
          <ErrorText name="card" />
          <input type="text" autoComplete="off" spellCheck={false} autoCapitalize="characters" className="input-medium" value={values.card} {...fieldProps('card')} />
        </div>

        <div className="field">
          <label htmlFor="needs">Access needs (optional)</label>
          <p className="hint" id="needs-hint">Anything that would help, for example “please set up JAWS” or “I use a wheelchair”.</p>
          <textarea id="needs" name="needs" rows={3} value={values.needs} onChange={handleChange} aria-describedby="needs-hint" />
        </div>

        <div className={`field ${visibleErrors.agree ? 'field--error' : ''}`}>
          <ErrorText name="agree" />
          <div className="check">
            <input type="checkbox" checked={values.agree} {...fieldProps('agree', false)} />
            <label htmlFor="agree">I agree to the library’s room and resource guidelines</label>
          </div>
        </div>

        <button ref={submitRef} type="submit" className="btn btn-primary" aria-disabled={busy || undefined}>
          {busy ? 'Sending…' : submitLabel}
        </button>
      </form>

      {confirmed && (
        <Modal
          title={mode === 'archive' ? 'Request sent' : 'Booking confirmed'}
          onClose={() => setConfirmed(null)}
          returnFocusRef={submitRef}
          actions={
            <Link className="btn btn-primary" to="/bookings">
              View my bookings
            </Link>
          }
        >
          <p>
            <strong>{confirmed.resourceTitle}</strong>
            {confirmed.slotLabel ? ` — ${confirmed.slotLabel}` : ''}
            {confirmed.date ? ` — ${confirmed.date} at ${confirmed.startTime} for ${confirmed.duration} ${confirmed.duration === '1' ? 'hour' : 'hours'}` : ''}
            {confirmed.deliveryFormat ? ` — ${confirmed.deliveryFormat}` : ''}
          </p>
          <p>
            Your reference is <strong className="reference">{confirmed.reference}</strong>. A confirmation has been sent to {confirmed.email}.
          </p>
        </Modal>
      )}
    </section>
  );
}
