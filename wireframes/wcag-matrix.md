# WCAG 2.1 AA Mapping Matrix

Enlighten Learning & Resource Hub

## What WCAG is

**WCAG** (Web Content Accessibility Guidelines) is the international standard for making websites usable by people with disabilities. It is published by the W3C, the organisation that sets web standards such as HTML and CSS. This project follows version 2.1.

WCAG is made up of **success criteria**: specific, testable rules, each with a number and a name, such as *1.4.3 Contrast (Minimum)* or *2.1.1 Keyboard*. They are grouped under four principles, often remembered as **POUR**:

- **Perceivable:** people can see or hear the content (for example, enough colour contrast).
- **Operable:** people can use it (for example, everything works with a keyboard).
- **Understandable:** it is clear (for example, labels and helpful error messages).
- **Robust:** it works with assistive technology such as screen readers.

Each rule has a level: **A** (the minimum), **AA** (the standard most laws and public organisations require) and **AAA** (the strictest). The hub aims for **WCAG 2.1 AA**, meaning every A and AA rule.

In this project, WCAG is the checklist the design is measured against. The matrix below picks eight of its rules and shows how the hub meets each one.

## Tools used for accessibility checking

- **axe-core** is a free automated accessibility checker. It scans a web page and flags problems against the WCAG rules, such as missing form labels, low colour contrast, buttons without a name or headings in the wrong order. It is built into the project's tests and is also what powers the Accessibility score in Chrome's Lighthouse tool. It catches many common problems, but not all of them, so it is used together with a screen reader.
- **Lighthouse** is a free auditing tool built into Google Chrome (DevTools → Lighthouse tab). It scores a page out of 100, and its Accessibility score uses axe-core's checks to list what passes and what needs fixing. A saved report is in `evidence/lighthouse-report.html`.
- **NVDA** (NonVisual Desktop Access) is a free screen reader for Windows. It reads the screen aloud, or sends it to a braille display, so blind and low-vision people can use a computer. It is used to check how the hub actually sounds to someone like the persona, Thandiwe. Useful keys: **Tab** moves between controls, **H** jumps to the next heading, **D** jumps to the next landmark and **F** jumps to the next form field.

## The matrix

| (a) Criterion | (b) Where it applies | (c) How it was built | (d) How to check it |
|---|---|---|---|
| **1.3.1 Info and Relationships** (A) | Every page layout and the booking form | Real landmarks (header, nav, main, aside, footer), headings in order, and a label on every form field. | Run axe-core to check landmarks, headings and labels. In NVDA, press D for landmarks and H for headings. |
| **1.4.3 Contrast (Minimum)** (AA) | All text in the app and wireframes | Colours chosen by measuring contrast. The lowest body text is 6.49:1 (minimum is 4.5:1). Values are in the CSS comments. | Run Lighthouse or axe-core to check colour contrast. |
| **2.1.1 Keyboard** and **2.1.2 No Keyboard Trap** (A) | Every control, and the confirmation dialog | Only real buttons, links and inputs are used, so Tab, Enter and Space all work. Escape always closes the dialog. | Book a room with the mouse unplugged and confirm Escape closes the dialog. See `evidence/keyboard-sequence.txt`. |
| **2.4.3 Focus Order** (A) | Page changes, form errors, the dialog | Focus moves to the new page's heading, to the error list after a failed submit, and back to the button after the dialog closes. | The automated tests check where focus lands. In NVDA, listen for the heading, error list or button after each action. |
| **2.4.7 Focus Visible** (AA) | Everything you can Tab to | A 3px blue outline shows where focus is (yellow in the dark footer). | Tab through each page and check the outline is always visible. |
| **3.3.1 Error Identification** (A) | The booking form | Wrong fields are marked invalid, with a red message saying how to fix it, and a summary of all errors at the top. Errors use text, not just colour. | Submit the empty form and check the error summary gets focus. In NVDA, tab into each field and listen for its error. |
| **4.1.2 Name, Role, Value** (A) | Filter accordions, type buttons, the dialog | Accordions say "expanded" or "collapsed", type buttons say "pressed", and the dialog is announced with its title. | The automated tests check the states change. In NVDA, press an accordion and listen for "collapsed", then "expanded". |
| **4.1.3 Status Messages** (AA) | Search results, form feedback, booking and cancelling | Hidden live regions announce messages such as "Showing 4 of 17 resources" without moving focus. | The automated tests read the messages. In NVDA, filter the list and listen for the count. |
