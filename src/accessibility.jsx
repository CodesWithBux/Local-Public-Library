import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const AnnouncerContext = createContext({ announce: () => {} });

export function LiveAnnouncerProvider({ children }) {
  const [polite, setPolite] = useState('');
  const [assertive, setAssertive] = useState('');
  const timers = useRef({});

  const announce = useCallback((message, politeness = 'polite') => {
    const set = politeness === 'assertive' ? setAssertive : setPolite;
    set('');
    clearTimeout(timers.current[politeness]);
    timers.current[politeness] = setTimeout(() => set(message), 50);
  }, []);

  return (
    <AnnouncerContext.Provider value={{ announce }}>
      {children}
      <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true" data-testid="live-polite">
        {polite}
      </div>
      <div className="visually-hidden" role="alert" aria-live="assertive" aria-atomic="true" data-testid="live-assertive">
        {assertive}
      </div>
    </AnnouncerContext.Provider>
  );
}

export const useAnnouncer = () => useContext(AnnouncerContext);

export function usePageFocus(title) {
  const headingRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    document.title = `${title} — Enlighten Hub`;
  }, [title]);

  useEffect(() => {
    if (location.key !== 'default') {
      headingRef.current?.focus();
    }
  }, [location.pathname]);

  return headingRef;
}

export function useFormValidation(initialValues, fields) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const lastAnnounced = useRef({});
  const { announce } = useAnnouncer();

  const validateField = useCallback(
    (name, vals) => (fields[name]?.validate ? fields[name].validate(vals[name], vals) : ''),
    [fields]
  );

  const validateAll = useCallback(
    (vals) => {
      const next = {};
      Object.keys(fields).forEach((name) => {
        const msg = validateField(name, vals);
        if (msg) next[name] = msg;
      });
      return next;
    },
    [fields, validateField]
  );

  const setFieldError = (name, msg) =>
    setErrors((prev) => {
      const next = { ...prev };
      if (msg) next[name] = msg;
      else delete next[name];
      return next;
    });

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    const nextValues = { ...values, [name]: type === 'checkbox' ? checked : value };
    setValues(nextValues);
    if (touched[name]) setFieldError(name, validateField(name, nextValues));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    if (!fields[name]) return;
    setTouched((t) => ({ ...t, [name]: true }));
    const msg = validateField(name, values);
    setFieldError(name, msg);

    const was = lastAnnounced.current[name];
    if (msg && was !== msg) {
      announce(`${fields[name].label}: ${msg}`);
    } else if (!msg && was) {
      announce(`${fields[name].label} is now valid.`);
    }
    lastAnnounced.current[name] = msg || '';
  };

    const validateForSubmit = () => {
    const all = validateAll(values);
    setErrors(all);
    setTouched(Object.fromEntries(Object.keys(fields).map((k) => [k, true])));
    Object.keys(fields).forEach((k) => (lastAnnounced.current[k] = all[k] || ''));
    return all;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    lastAnnounced.current = {};
  };

  return { values, errors, touched, handleChange, handleBlur, validateForSubmit, reset, setValues };
}
