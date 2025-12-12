# Christmas Dinner Registration Form - Design Guidelines

## Design Approach

**Reference-Based Festive Design**: Drawing inspiration from modern holiday event platforms like Eventbrite's seasonal templates, Paperless Post's celebration designs, and premium e-commerce holiday campaigns. The design balances festive celebration with form functionality, creating an inviting registration experience that matches the warmth and excitement of the event poster.

## Layout System

**Tailwind Spacing Units**: Use 4, 6, 8, 12, and 16 as primary spacing units throughout (p-4, mb-8, gap-6, etc.)

**Page Structure**:
- Hero Section (50vh): Feature the event visual prominently - use a warm, festive background image showing Christmas decorations, dinner settings, or ornamental designs that echo the poster aesthetic
- Event Details Card: Floating card overlaying the hero bottom with key information (date, time, location, dress code)
- Registration Form Section: Centered, max-w-2xl container with generous padding (py-16)
- Footer: Compact with event organizer info and contact

## Typography Hierarchy

**Font Selection**: 
- Headings: Playfair Display or Merriweather (elegant serif for festive titles)
- Body: Inter or Open Sans (clean sans-serif for readability)

**Type Scale**:
- Page Title: text-5xl md:text-6xl font-bold (Hero overlay)
- Section Headers: text-3xl md:text-4xl font-semibold
- Form Labels: text-sm font-medium uppercase tracking-wide
- Body Text: text-base leading-relaxed
- Helper Text: text-sm

## Component Library

### Hero Section
- Background image: Festive Christmas dinner table setting with ornamental decorations, candles, and holiday elements
- Overlay gradient for text readability
- Centered title: "Christmas Dinner 2024 - Gift Exchange"
- Event details card positioned at bottom with backdrop blur effect
- CTA scroll indicator or subtle animation

### Event Details Card
- Backdrop blur with subtle border
- Icon-text pairs for information (calendar icon + date/time, location pin + venue, gift icon + exchange info)
- Dress code color swatches displayed inline
- Compact grid layout (grid-cols-2 md:grid-cols-4)

### Registration Form
- Single column layout with clear visual grouping
- Input fields: Rounded corners (rounded-lg), consistent height (h-12), clear focus states
- Text inputs: Full width with subtle border, increased padding (px-4)
- Checkbox: Custom styled with festive accent, larger touch target (w-5 h-5)
- Conditional dropdown: Smooth slide-down animation when checkbox is checked, same styling as text inputs
- Image upload: Drag-and-drop zone with dashed border, preview thumbnail grid below upload area
- Submit button: Large (h-14), full width on mobile, centered with max-width on desktop, prominent with shadow

### Form Field Specifics
**Name Field**: Single input, placeholder "Full Name"
**Email Field**: Email validation, placeholder "your.email@example.com"
**Connect Group Checkbox**: "I have joined a Connect Group community" with custom checkmark
**CG Dropdown**: Appears only when checkbox checked, list of 7 groups with clear labels
**Transfer Proof Upload**: Accept image formats, show preview with remove option, max file size indicator

### Visual Elements
- Decorative snowflakes or stars scattered in hero (CSS decorative elements, not images)
- Subtle ornamental dividers between sections
- Gift box icon near exchange information
- Success confirmation modal with festive animation

## Images

**Required Images**:
1. **Hero Background**: Full-width festive image showing elegant Christmas dinner setting with ornamental decorations, warm lighting, and holiday ambiance (50vh height, object-cover)
2. **Optional decorative elements**: Small ornamental graphics for section breaks

## Interaction Patterns

- Smooth scroll from hero to form
- Real-time form validation with inline error messages
- Image upload with immediate preview and loading state
- Conditional reveal animation for Connect Group dropdown (slide-down with fade)
- Success state: Confetti animation or festive celebration micro-interaction
- Form submission: Loading state on button with spinner

## Accessibility & Validation

- All form fields with associated labels (visible labels, not just placeholders)
- Required field indicators
- Clear error states with descriptive messages
- Keyboard navigation support throughout
- Focus visible states for all interactive elements
- Proper ARIA labels for custom components

## Responsive Behavior

- Hero: Full height on desktop (50vh), reduced on mobile (40vh)
- Form: Single column throughout, max-w-2xl centered
- Event details card: Stacks vertically on mobile
- Typography scales down appropriately (text-4xl → text-3xl on mobile)
- Spacing reduces proportionally (py-16 → py-8 on mobile)