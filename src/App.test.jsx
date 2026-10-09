import '@testing-library/jest-dom/vitest';
import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import axe from 'axe-core';
import App, { BookingsProvider } from './App.jsx';
import { LiveAnnouncerProvider } from './accessibility.jsx';
import { filterResources } from './ResourcesPage.jsx';
import { RESOURCES } from './data.js';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  document.title = '';
});

function renderApp(route = '/', { bookings } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <LiveAnnouncerProvider>
        <BookingsProvider initial={bookings}>
          <App />
        </BookingsProvider>
      </LiveAnnouncerProvider>
    </MemoryRouter>
  );
}

async function axeViolations(node = document.body) {
  const results = await axe.run(node, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
    rules: { 'color-contrast': { enabled: false } },
  });
  return results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

const results = () => within(screen.getByRole('region', { name: 'Results' })).queryAllByRole('article');

describe('Filterable resource listing — ARIA state management', () => {
  it('filter accordion headers are buttons whose aria-expanded follows state (click, Enter, Space)', async () => {
    const user = userEvent.setup();
    renderApp('/resources');
    const format = screen.getByRole('button', { name: /^format/i });
    expect(format).toHaveAttribute('aria-expanded', 'false');
    const panel = document.getElementById(format.getAttribute('aria-controls'));
    expect(panel).not.toBeVisible();

    await user.click(format);
    expect(format).toHaveAttribute('aria-expanded', 'true');
    expect(panel).toBeVisible();

    format.focus();
    await user.keyboard('{Enter}');
    expect(format).toHaveAttribute('aria-expanded', 'false');
    await user.keyboard(' ');
    expect(format).toHaveAttribute('aria-expanded', 'true');
  });

  it('type chips are toggle buttons whose aria-pressed updates and filters the list', async () => {
    const user = userEvent.setup();
    renderApp('/resources');
    expect(results()).toHaveLength(RESOURCES.length);

    const rooms = screen.getByRole('button', { name: /rooms/i });
    expect(rooms).toHaveAttribute('aria-pressed', 'false');
    rooms.focus();
    await user.keyboard('{Enter}');
    expect(rooms).toHaveAttribute('aria-pressed', 'true');
    expect(results()).toHaveLength(4);

    await user.keyboard(' ');
    expect(rooms).toHaveAttribute('aria-pressed', 'false');
    expect(results()).toHaveLength(RESOURCES.length);
  });

  it('announces the new result count in the polite live region', async () => {
    const user = userEvent.setup();
    renderApp('/resources');
    await user.click(screen.getByRole('button', { name: /events/i }));
    const polite = screen.getByTestId('live-polite');
    expect(polite).toHaveAttribute('aria-live', 'polite');
    await waitFor(() => expect(polite).toHaveTextContent(`Showing 4 of ${RESOURCES.length} resources.`), { timeout: 2000 });
  });

  it('keyword search and accessibility-feature checkboxes combine', async () => {
    const user = userEvent.setup();
    renderApp('/resources');
    await user.type(screen.getByLabelText('Search by keyword'), 'braille');
    expect(results().length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: /accessibility features/i }));
    await user.click(screen.getByLabelText('Hearing loop'));
    results().forEach((card) => expect(card).toHaveTextContent('Hearing loop'));
  });

  it('shows an empty state with a working "Clear all filters" button that returns focus to search', async () => {
    const user = userEvent.setup();
    renderApp('/resources?q=zzzz');
    expect(screen.getByText('No resources match these filters.', { selector: 'p' })).toBeInTheDocument();
    const clears = screen.getAllByRole('button', { name: /clear all filters/i });
    await user.click(clears[clears.length - 1]);
    expect(results()).toHaveLength(RESOURCES.length);
    expect(screen.getByLabelText('Search by keyword')).toHaveFocus();
  });

  it('filterResources is a pure function (unit)', () => {
    const out = filterResources(RESOURCES, { q: '', types: ['archive'], format: '', access: ['large-print'], audience: '' });
    expect(out.map((r) => r.id).sort()).toEqual(['council-minutes', 'large-print-classics']);
  });
});

async function fillValid(user, { card = 'EL123456' } = {}) {
  await user.click(screen.getByLabelText(/Mon 12 Oct/));
  await user.type(screen.getByLabelText('Full name'), 'Thandiwe Mokoena');
  await user.type(screen.getByLabelText('Email address'), 'thandiwe@example.com');
  await user.type(screen.getByLabelText('Library card number'), card);
  await user.click(screen.getByLabelText(/I agree/));
}

describe('Accessible booking form with live validation', () => {
  it('every input has an associated label and helper text via aria-describedby', () => {
    renderApp('/resources/digital-skills');
    const email = screen.getByLabelText('Email address');
    expect(email).toHaveAttribute('id', 'email');
    expect(email).toHaveAccessibleDescription('We’ll send your confirmation here.');
    expect(email).not.toHaveAttribute('aria-invalid');
    expect(screen.getByLabelText('Library card number')).toHaveAccessibleDescription(/2 letters then 6 numbers/);
    expect(screen.getByLabelText('Full name')).toHaveAttribute('autocomplete', 'name');
    expect(email).toHaveAttribute('autocomplete', 'email');
  });

  it('validates on blur: sets aria-invalid, links the error, and announces it politely', async () => {
    const user = userEvent.setup();
    renderApp('/resources/digital-skills');
    const email = screen.getByLabelText('Email address');
    await user.type(email, 'thandiwe@');
    expect(email).not.toHaveAttribute('aria-invalid');
    await user.tab();

    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email.getAttribute('aria-describedby')).toBe('email-hint email-error');
    expect(email).toHaveAccessibleDescription(/We’ll send your confirmation here\. Error: Enter an email address in the format name@example\.com/);
    await waitFor(() =>
      expect(screen.getByTestId('live-polite')).toHaveTextContent('Email address: Enter an email address in the format name@example.com')
    );

    await user.type(email, 'example.com');
    expect(email).not.toHaveAttribute('aria-invalid');
    await user.tab();
    await waitFor(() => expect(screen.getByTestId('live-polite')).toHaveTextContent('Email address is now valid.'));
  });

  it('failed submit: error summary receives focus, lists every error as a link, title gets "Error:"', async () => {
    const user = userEvent.setup();
    renderApp('/resources/digital-skills');
    await user.click(screen.getByRole('button', { name: 'Register' }));

    const summary = await screen.findByRole('region', { name: /there are 5 problems with your booking/i });
    await waitFor(() => expect(summary).toHaveFocus());
    const links = within(summary).getAllByRole('link');
    expect(links.map((l) => l.textContent)).toEqual([
      'Choose a session',
      'Enter your full name',
      'Enter your email address',
      'Enter your library card number',
      'Confirm that you agree to the library guidelines',
    ]);
    expect(screen.getByLabelText('Full name')).toHaveAttribute('aria-invalid', 'true');
    expect(document.title).toMatch(/^Error: Digital Skills for Beginners/);

    await user.click(links[3]);
    expect(screen.getByLabelText('Library card number')).toHaveFocus();
  });

  it('successful submit: dialog opens with focus inside, Tab is contained, Escape closes and returns focus', async () => {
    const user = userEvent.setup();
    renderApp('/resources/digital-skills');
    await fillValid(user);
    const submit = screen.getByRole('button', { name: 'Register' });
    await user.click(submit);

    const dialog = await screen.findByRole('dialog', { name: 'Booking confirmed' }, { timeout: 2000 });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(within(dialog).getByRole('heading', { name: 'Booking confirmed' })).toHaveFocus();
    expect(dialog).toHaveTextContent(/EH-\d{6}/);
    expect(document.getElementById('app-shell')).toHaveAttribute('inert');

    await user.tab();
    expect(within(dialog).getByRole('link', { name: 'View my bookings' })).toHaveFocus();
    await user.tab();
    expect(within(dialog).getByRole('button', { name: 'Close' })).toHaveFocus();
    await user.tab();
    expect(within(dialog).getByRole('link', { name: 'View my bookings' })).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.getElementById('app-shell')).not.toHaveAttribute('inert');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Register' })).toHaveFocus());

    expect(screen.getByLabelText(/Mon 12 Oct/)).toHaveAccessibleName(/5 places left/);
  });

  it('form is aria-busy while sending, and a duplicate booking is announced assertively', async () => {
    const user = userEvent.setup();
    renderApp('/resources/digital-skills', {
      bookings: [{ resourceId: 'digital-skills', resourceTitle: 'Digital Skills for Beginners', type: 'course', card: 'EL123456', slot: 's1', people: '1', reference: 'EH-111111' }],
    });
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'Register' }));
    expect(document.querySelector('form')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Sending…' })).toHaveAttribute('aria-disabled', 'true');

    const alert = screen.getByTestId('live-assertive');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    await waitFor(() => expect(alert).toHaveTextContent(/already have a booking/), { timeout: 2000 });
    expect(document.querySelector('form')).toHaveAttribute('aria-busy', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('room mode validates people against capacity', async () => {
    const user = userEvent.setup();
    renderApp('/resources/quiet-room-1');
    const people = screen.getByLabelText('Number of people');
    await user.clear(people);
    await user.type(people, '3');
    await user.tab();
    expect(people).toHaveAttribute('aria-invalid', 'true');
    expect(people).toHaveAccessibleDescription(/Enter a number from 1 to 1/);
  });

  it('full sessions are disabled so they cannot be chosen', () => {
    renderApp('/resources/tech-help');
    expect(screen.getByLabelText(/10:40 — full/)).toBeDisabled();
  });
});

describe('Keyboard navigation and focus management', () => {
  it('skip link is the first Tab stop and moves focus to <main>', async () => {
    const user = userEvent.setup();
    renderApp('/');
    await user.tab();
    const skip = screen.getByRole('link', { name: 'Skip to main content' });
    expect(skip).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('main')).toHaveFocus();
  });

  it('first load does not steal focus; client-side navigation moves focus to the new <h1> and sets the title', async () => {
    const user = userEvent.setup();
    renderApp('/');
    expect(document.body).toHaveFocus();
    expect(document.title).toBe('Home — Enlighten Hub');

    await user.click(screen.getByRole('link', { name: 'Find resources' }));
    const h1 = screen.getByRole('heading', { level: 1, name: 'Find resources' });
    expect(h1).toHaveFocus();
    expect(document.title).toBe('Find resources — Enlighten Hub');
  });

  it('active nav link exposes aria-current="page"', () => {
    renderApp('/resources');
    const nav = within(screen.getByRole('navigation', { name: 'Primary' }));
    expect(nav.getByRole('link', { name: 'Find resources' })).toHaveAttribute('aria-current', 'page');
    expect(nav.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });

  it('logical tab order on the listing page: skip link → nav → filters → search → results', async () => {
    const user = userEvent.setup();
    renderApp('/resources');
    const order = [];
    for (let i = 0; i < 16; i++) {
      await user.tab();
      const el = document.activeElement;
      order.push(el.getAttribute('aria-label') || el.textContent.trim().replace(/\s+/g, ' ') || el.id);
    }
    expect(order.slice(0, 5)).toEqual([
      'Skip to main content',
      'Enlighten Learning & Resource Hub',
      'Home',
      'Find resources',
      'My bookings 0 (0 bookings)',
    ]);
    expect(order[5]).toBe('Home');
    expect(order.slice(6, 10)).toEqual(['Courses(5)', 'Rooms(4)', 'Digital archive(4)', 'Events(4)']);
    expect(order[10]).toBe('Skip to results (17)');
    expect(order.indexOf('Accessibility features')).toBeLessThan(order.indexOf('resource-search'));
  });

  it('skip to results link jumps past the filters to the result count', async () => {
    const user = userEvent.setup();
    renderApp('/resources');
    await user.click(screen.getByRole('button', { name: /^Courses/ }));
    const skip = screen.getByRole('link', { name: 'Skip to results (5)' });
    skip.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByText(/Showing/)).toHaveFocus();
    await user.tab();
    expect(document.activeElement).toHaveAccessibleName('Digital Skills for Beginners');
  });

  it('cancelling a booking moves focus to the next Cancel button and announces it', async () => {
    const user = userEvent.setup();
    const bookings = [
      { reference: 'EH-100001', resourceId: 'at-suite', resourceTitle: 'Assistive Technology Suite', type: 'room', date: '2026-10-20', startTime: '10:00', duration: '1', card: 'EL1', people: '1' },
      { reference: 'EH-100002', resourceId: 'storytime', resourceTitle: 'Accessible Storytime', type: 'event', slot: 's1', slotLabel: 'Sat 17 Oct, 10:00–10:45', card: 'EL1', people: '2' },
    ];
    renderApp('/bookings', { bookings });
    await user.click(screen.getByRole('button', { name: 'Cancel booking for Assistive Technology Suite' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cancel booking for Accessible Storytime' })).toHaveFocus());
    await waitFor(() => expect(screen.getByTestId('live-polite')).toHaveTextContent('Booking EH-100001 for Assistive Technology Suite cancelled.'));

    await user.click(screen.getByRole('button', { name: 'Cancel booking for Accessible Storytime' }));
    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'My bookings' })).toHaveFocus());
    expect(screen.getByText('You have no bookings yet.')).toBeInTheDocument();
  });
});

describe('axe-core (jsdom) — no WCAG 2.1 A/AA violations on any view', () => {
  const routes = ['/', '/resources', '/resources/at-suite', '/resources/digital-skills', '/resources/daisy-classics', '/bookings', '/nope'];
  it.each(routes)('%s', async (route) => {
    const { container } = renderApp(route);
    expect(await axeViolations(container)).toEqual([]);
  });

  it('booking form in its error state', async () => {
    const user = userEvent.setup();
    const { container } = renderApp('/resources/at-suite');
    await user.click(screen.getByRole('button', { name: 'Reserve room' }));
    await screen.findByRole('region', { name: /problems/ });
    expect(await axeViolations(container)).toEqual([]);
  });
});
