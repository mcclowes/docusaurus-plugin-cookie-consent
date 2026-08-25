# Accessibility Features

This document outlines the accessibility features implemented in the cookie consent modal to ensure WCAG 2.1 AA compliance.

## Implemented Features

### 1. ARIA Attributes

The modal dialog includes proper ARIA attributes for screen readers:

- **`role="dialog"`**: Identifies the element as a dialog
- **`aria-modal="true"`**: Indicates this is a modal dialog
- **`aria-labelledby="cookie-consent-title"`**: Links to the dialog title
- **`aria-describedby="cookie-consent-description"`**: Links to the dialog description
- **`aria-hidden="true"`**: Applied to the backdrop to hide it from screen readers

**Location**: `src/client/Modal/Modal.tsx`

### 2. Focus Management

Proper focus handling ensures keyboard users can navigate effectively:

- **Auto-focus on open**: When the modal opens, focus is automatically moved to the first button
- **Body scroll prevention**: The page body scrolling is disabled while the modal is open

**Location**: `src/client/Modal/Modal.tsx`

### 3. Keyboard Navigation

Keyboard support for interactions:

- **ESC key**: Pressing Escape rejects optional cookies and closes the modal
- **Tab/Shift+Tab**: Full focus trap - cycles within modal (doesn't escape to page content)
- **Enter/Space**: Activate buttons (native browser behavior)

**Location**: `src/client/Modal/Modal.tsx`

### 4. Screen Reader Announcements

Links that open in new tabs include appropriate warnings for screen reader users:

- **Visual hidden text**: `" (opens in new tab)"` text is included but visually hidden
- **aria-label**: Enhanced labels like `"Privacy Policy (opens in new tab)"`
- **Applies to**: Both markdown-style links in descriptions and configured link arrays

**Location**: `src/client/Modal/Modal.tsx`

### 5. Semantic HTML

Proper heading hierarchy and semantic elements:

- **`<h2>` heading**: Dialog title uses proper heading level with `id` for ARIA reference
- **Descriptive IDs**: All referenced elements have clear, semantic IDs

**Location**: `src/client/Modal/Modal.tsx`

### 6. Backdrop Interaction Prevention

The modal backdrop properly blocks interaction with page content:

- **Click prevention**: Clicks on the backdrop are prevented from reaching underlying content
- **`aria-hidden`**: Backdrop is hidden from assistive technologies

**Location**: `src/client/Modal/Modal.tsx`

## Testing Accessibility

### Manual Testing

To manually test accessibility features:

1. **Keyboard Navigation**:
   - Use Tab to navigate through all interactive elements
   - Verify focus is visible on all elements
   - Ensure ESC key closes the modal

2. **Screen Reader Testing**:
   - Test with NVDA (Windows), JAWS (Windows), or VoiceOver (macOS)
   - Verify dialog is announced with title and description
   - Confirm all links announce "opens in new tab"
   - Check that backdrop content is not read

### Automated Testing Tools

Recommended tools for automated accessibility testing:

- **axe DevTools**: Browser extension for accessibility auditing
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Includes accessibility audits (built into Chrome DevTools)

## WCAG 2.1 support

The implementation includes behavior relevant to the following WCAG 2.1 criteria. Test the finished site with its own theme, content, and browser support before making a compliance claim.

- **1.3.1 Info and Relationships (Level A)**: Proper semantic structure and ARIA attributes
- **2.1.1 Keyboard (Level A)**: All functionality available via keyboard
- **2.1.2 No Keyboard Trap (Level A)**: Keyboard focus can move away from modal (ESC key)
- **2.4.3 Focus Order (Level A)**: Logical focus order maintained
- **2.4.7 Focus Visible (Level AA)**: Focus indicators visible (browser default)
- **4.1.2 Name, Role, Value (Level A)**: All UI components have accessible names
- **4.1.3 Status Messages (Level AA)**: Modal properly announces itself to screen readers

## Browser Support

Accessibility features are supported in:

- **Chrome/Edge**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Screen Readers**: NVDA, JAWS, VoiceOver, TalkBack

## Future Enhancements

Potential improvements for even better accessibility:

1. ~~**Focus trapping**: Full Tab/Shift+Tab cycling within the modal~~ ✅ Implemented
2. **Focus restoration**: Return focus to previous element after closing
3. **Live region announcements**: Announce consent status changes
4. **Reduced motion support**: Respect `prefers-reduced-motion` media query
5. **High contrast mode**: Enhanced support for Windows High Contrast Mode
6. **Custom focus indicators**: More prominent focus styles for better visibility
