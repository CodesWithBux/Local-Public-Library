export const TYPES = [
  { id: 'course', label: 'Courses', singular: 'Course' },
  { id: 'room', label: 'Rooms', singular: 'Room' },
  { id: 'archive', label: 'Digital archive', singular: 'Archive' },
  { id: 'event', label: 'Events', singular: 'Event' },
];

export const FORMATS = [
  { id: 'in-person', label: 'In person' },
  { id: 'online', label: 'Online' },
];

export const ACCESS_FEATURES = [
  { id: 'wheelchair', label: 'Wheelchair accessible' },
  { id: 'loop', label: 'Hearing loop' },
  { id: 'sign', label: 'Sign language (SASL)' },
  { id: 'captions', label: 'Captions' },
  { id: 'screen-reader', label: 'Screen-reader friendly' },
  { id: 'large-print', label: 'Large print' },
];

export const AUDIENCES = ['All ages', 'Adults', 'Teens', 'Children'];

export const RESOURCES = [
  {
    id: 'digital-skills', type: 'course', format: 'in-person', audience: 'Adults', color: '#2D4B73',
    title: 'Digital Skills for Beginners',
    summary: 'Six friendly sessions on email, safe browsing and filling in online forms.',
    description: 'Start from zero and leave able to send email, search safely and complete online applications. Small groups, patient tutors and printed large-print notes.',
    location: 'Learning Centre, first floor (lift available)',
    access: ['wheelchair', 'loop', 'large-print'],
    sessions: [
      { id: 's1', label: 'Mon 12 Oct, 10:00–12:00', places: 6 },
      { id: 's2', label: 'Thu 15 Oct, 14:00–16:00', places: 2 },
    ],
  },
  {
    id: 'spreadsheets', type: 'course', format: 'online', audience: 'Adults', color: '#0E7C66',
    title: 'Intro to Spreadsheets',
    summary: 'Formulas, budgets and charts in free spreadsheet software — keyboard-friendly.',
    description: 'Learn cell references, SUM and AVERAGE, simple budgets and charts. Every technique is taught with keyboard shortcuts as well as the mouse, and the tutor uses a screen reader to check each exercise.',
    location: 'Online (accessible video room, link emailed)',
    access: ['captions', 'screen-reader'],
    sessions: [
      { id: 's1', label: 'Tue 13 Oct, 18:00–19:30', places: 12 },
      { id: 's2', label: 'Tue 20 Oct, 18:00–19:30', places: 9 },
    ],
  },
  {
    id: 'nvda-basics', type: 'course', format: 'in-person', audience: 'All ages', color: '#43306B',
    title: 'Screen Reader Basics with NVDA',
    summary: 'Hands-on introduction to the free NVDA screen reader for new users and carers.',
    description: 'Install NVDA, learn the essential keys, read web pages by headings and landmarks, and fill in forms with confidence. Run in the Assistive Technology Suite by a blind trainer.',
    location: 'Assistive Technology Suite, ground floor',
    access: ['wheelchair', 'loop', 'screen-reader'],
    sessions: [
      { id: 's1', label: 'Tue 20 Oct, 14:00–16:00', places: 3 },
      { id: 's2', label: 'Tue 27 Oct, 14:00–16:00', places: 4 },
    ],
  },
  {
    id: 'cv-writing', type: 'course', format: 'in-person', audience: 'Teens', color: '#7A3B2E',
    title: 'CV Writing & Job Applications',
    summary: 'Write a strong CV and practise interviews with a careers adviser.',
    description: 'For school leavers and young job-seekers. Bring a draft or start fresh; leave with a printed and an accessible digital CV.',
    location: 'Meeting Room 2, first floor (lift available)',
    access: ['wheelchair', 'loop'],
    sessions: [
      { id: 's1', label: 'Sat 17 Oct, 09:00–11:00', places: 8 },
    ],
  },
  {
    id: 'coding-js', type: 'course', format: 'online', audience: 'Teens', color: '#16213E',
    title: 'Coding for Beginners: JavaScript',
    summary: 'Build a small accessible web page and make it interactive.',
    description: 'Write your first HTML, CSS and JavaScript in the browser. We teach semantic HTML first, so everything you build works with a keyboard and screen reader from day one.',
    location: 'Online (accessible video room, link emailed)',
    access: ['captions', 'screen-reader'],
    sessions: [
      { id: 's1', label: 'Wed 14 Oct, 16:00–17:30', places: 15 },
      { id: 's2', label: 'Wed 21 Oct, 16:00–17:30', places: 15 },
    ],
  },

  {
    id: 'at-suite', type: 'room', format: 'in-person', audience: 'All ages', color: '#43306B',
    title: 'Assistive Technology Suite',
    summary: 'Private room with NVDA, JAWS, ZoomText and a 40-cell braille display.',
    description: 'A step-free private room with a height-adjustable desk, NVDA and JAWS screen readers, ZoomText magnification, a 40-cell braille display and a braille embosser. Staff can help you get started.',
    location: 'Ground floor, next to the main entrance',
    access: ['wheelchair', 'loop', 'screen-reader', 'large-print'],
    capacity: 3,
  },
  {
    id: 'quiet-room-1', type: 'room', format: 'in-person', audience: 'Adults', color: '#1F4E46',
    title: 'Quiet Study Room 1',
    summary: 'Silent single-person study room with natural light and a power point.',
    description: 'A silent room for focused study. Desk, ergonomic chair, power point and Wi-Fi. Ideal for exams and online interviews.',
    location: 'Second floor (lift available)',
    access: ['wheelchair'],
    capacity: 1,
  },
  {
    id: 'group-room-3', type: 'room', format: 'in-person', audience: 'All ages', color: '#2D4B73',
    title: 'Group Study Room 3',
    summary: 'Room for up to 8 people with a large screen and whiteboard.',
    description: 'A bookable room for group work, with a 65-inch screen (HDMI and wireless casting), whiteboard and hearing loop.',
    location: 'First floor (lift available)',
    access: ['wheelchair', 'loop'],
    capacity: 8,
  },
  {
    id: 'maker-space', type: 'room', format: 'in-person', audience: 'Teens', color: '#6B2737',
    title: 'Maker Space',
    summary: '3D printer, laptops and craft tools for creative projects.',
    description: 'Open-plan workshop with a 3D printer, laptops, a vinyl cutter and craft tools. Under-16s need an adult present.',
    location: 'Basement level (lift available)',
    access: ['wheelchair'],
    capacity: 6,
  },

  {
    id: 'daisy-classics', type: 'archive', format: 'online', audience: 'All ages', color: '#16213E',
    title: 'Audiobook Classics (DAISY)',
    summary: 'Navigable DAISY audiobooks of public-domain classics.',
    description: 'Jump by chapter, heading or page in Pride and Prejudice, Frankenstein, Jane Eyre, Dracula and more. Works with DAISY players and free apps.',
    location: 'Online collection',
    access: ['screen-reader'],
    formats: ['DAISY audio', 'MP3 audio'],
  },
  {
    id: 'large-print-classics', type: 'archive', format: 'online', audience: 'Adults', color: '#7A3B2E',
    title: 'Large-Print Classics eBooks',
    summary: 'Reflowable eBooks with adjustable font, spacing and contrast.',
    description: 'EPUB editions of Moby-Dick, The Count of Monte Cristo, Great Expectations and more, tested for reflow at 400% zoom.',
    location: 'Online collection',
    access: ['large-print', 'screen-reader'],
    formats: ['EPUB (reflowable)', 'Large-print PDF', 'Braille-ready file (BRF)'],
  },
  {
    id: 'local-history', type: 'archive', format: 'online', audience: 'All ages', color: '#1F4E46',
    title: 'Local History Photograph Collection',
    summary: '2,400 photographs of the city since 1890, each with a written description.',
    description: 'Every photograph has a written description and full transcription of any visible text, so the collection can be explored by screen reader.',
    location: 'Online collection',
    access: ['screen-reader'],
    formats: ['Described image set (HTML)', 'Plain-text descriptions'],
  },
  {
    id: 'council-minutes', type: 'archive', format: 'online', audience: 'Adults', color: '#334155',
    title: 'Council Minutes Archive 1950–1999',
    summary: 'Searchable transcriptions of council meeting minutes.',
    description: 'Fifty years of council minutes, transcribed from scans into searchable, tagged text.',
    location: 'Online collection',
    access: ['screen-reader', 'large-print'],
    formats: ['Tagged PDF', 'Plain text'],
  },

  {
    id: 'storytime', type: 'event', format: 'in-person', audience: 'Children', color: '#C2410C',
    title: 'Accessible Storytime',
    summary: 'Picture-book stories with a South African Sign Language interpreter.',
    description: 'A relaxed storytime for children aged 3–7 and their grown-ups, with SASL interpretation, tactile books and a quiet corner.',
    location: 'Children’s Library, ground floor',
    access: ['wheelchair', 'sign', 'loop'],
    sessions: [
      { id: 's1', label: 'Sat 17 Oct, 10:00–10:45', places: 10 },
      { id: 's2', label: 'Sat 24 Oct, 10:00–10:45', places: 14 },
    ],
  },
  {
    id: 'author-talk', type: 'event', format: 'in-person', audience: 'Adults', color: '#6B2737',
    title: 'Author Talk: Writing Local History',
    summary: 'A local historian on turning archive photographs into stories.',
    description: 'Hear how the Local History Photograph Collection became a book, followed by questions. Live captions on the main screen.',
    location: 'Main Hall, ground floor',
    access: ['wheelchair', 'loop', 'captions'],
    sessions: [
      { id: 's1', label: 'Thu 22 Oct, 18:30–19:30', places: 40 },
    ],
  },
  {
    id: 'book-club', type: 'event', format: 'online', audience: 'Adults', color: '#3A2E5C',
    title: 'Book Club: Frankenstein',
    summary: 'Monthly discussion with captions and large-print copies.',
    description: 'This month: Mary Shelley’s Frankenstein. Large-print, DAISY and braille copies can be collected from the front desk.',
    location: 'Online (accessible video room, link emailed)',
    access: ['captions', 'large-print', 'screen-reader'],
    sessions: [
      { id: 's1', label: 'Wed 28 Oct, 18:00–19:00', places: 20 },
    ],
  },
  {
    id: 'tech-help', type: 'event', format: 'in-person', audience: 'All ages', color: '#0E7C66',
    title: 'Tech Help Drop-in',
    summary: 'Bring your phone or laptop for one-to-one help with a volunteer.',
    description: 'Twenty-minute one-to-one slots for help with phones, tablets, accessibility settings and online services.',
    location: 'Learning Centre, first floor (lift available)',
    access: ['wheelchair', 'loop'],
    sessions: [
      { id: 's1', label: 'Fri 16 Oct, 10:00', places: 1 },
      { id: 's2', label: 'Fri 16 Oct, 10:20', places: 1 },
      { id: 's3', label: 'Fri 16 Oct, 10:40', places: 0 },
    ],
  },
];

export const getResource = (id) => RESOURCES.find((r) => r.id === id);
export const typeLabel = (id) => TYPES.find((t) => t.id === id)?.singular ?? id;
export const featureLabel = (id) => ACCESS_FEATURES.find((f) => f.id === id)?.label ?? id;
export const formatLabel = (id) => FORMATS.find((f) => f.id === id)?.label ?? id;

export const ROOM_TIMES = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
