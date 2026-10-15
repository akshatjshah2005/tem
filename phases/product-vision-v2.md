# Product Vision V2 — Cinematic Digital Invitation Platform

**Status:** Product direction approved for implementation  
**Repository:** `akshatjshah2005/tem`  
**Primary goal:** Build an original, mobile-first cinematic invitation product with editable animated scenes and secure guest personalization.

This document supersedes the earlier statement that the invitation should not be video-oriented. The product must feel like an animated invitation film while preserving the useful features of an interactive invitation website.

## 1. Product definition

Create an invitation once, customize it visually, assign events to guests, and share a personal link for every guest.

The primary output is a **cinematic interactive web invitation**: a mobile-first URL with animated scenes, guest-specific information, event details, maps, gallery and RSVP when enabled.

A downloadable **MP4 video export** is a required product capability, but it should be implemented after the reusable scene system, editing model, and personalization behavior are stable. A static MP4 cannot change its guest name or event visibility after it has been rendered; personalized web links remain the source of truth for guest-specific content.

## 2. Design rule: feature inspiration, original product

Study general capabilities offered by invitation video makers and design tools—ready-made themes, editable text, images and video, audio, scene ordering, animation, preview, export and sharing. Do not copy another company's exact template artwork, layout, wording, animation choreography, or brand.

The product must have a distinctive interface based around **scenes, a live invitation stage, contextual editing and guest distribution**, rather than a generic gallery of static cards.

## 3. Core customer journey

1. Sign up or sign in.
2. Create a project and name the celebration.
3. Choose an occasion category.
4. Browse and play a cinematic preview of a template.
5. Use the theme to create an invitation.
6. Edit content and scene-level design controls while previewing changes.
7. Add, customize and order traditional or custom events.
8. Upload photos, video clips and optional background audio.
9. Preview desktop/mobile and test a guest-personalized preview.
10. Save, publish, and generate a public invitation URL.
11. Add guests manually or through an Excel/CSV import.
12. Assign events, generate secure unique guest links and prepare WhatsApp messages.
13. Track RSVP responses; optionally export an MP4 after that workflow is stable.

## 4. Editor experience

### Desktop layout

- **Top toolbar:** project name, undo/redo, autosave status, Preview, Publish/Share and later Export MP4.
- **Left rail:** scenes/sections, media library, event manager, guests and template settings.
- **Center stage:** interactive 9:16 invitation canvas with Play/Pause, restart, fullscreen, and preview width controls. Provide a wider desktop preview too.
- **Right contextual panel:** controls for the currently selected text, image, video, decorative element or section.
- **Bottom scene strip:** ordered scene thumbnails, scene duration and transition controls when the timeline feature is implemented.

On smaller screens, use a simplified single-panel editor and an easily accessible live-preview toggle; do not squeeze the complete desktop workspace onto a phone.

### Editing controls

- Text: content, font, size, weight, color, alignment, letter spacing and basic position.
- Media: upload/replace/crop images, choose video, fit mode, focal point and accessible alt text.
- Style: theme palette, background, overlays, decorative motifs and section visibility.
- Motion: reusable presets such as fade, reveal, drift, zoom, parallax and ornament/mandala reveal; control the timing and intensity within safe performance limits.
- Scenes: add/remove, duplicate, reorder, rename, hide/show and choose a supported transition.
- Audio: optional music upload/selection, play/pause and volume. Do not force autoplay with sound; let guests control playback.
- History: undo/redo and autosave status.
- Preview: current invitation, full-screen, mobile, desktop and guest-personalized preview.

For V1, use a dependable structured editor and a set of polished animation presets. Freeform element placement, multi-track editing and fine-grained keyframes can follow later.

## 5. Template system

Every template should be defined through reusable configuration and assets, not by duplicating application pages. Configuration must describe:

- stable ID, slug, name, description, category, version, thumbnail and preview assets;
- supported capabilities and editable fields;
- scene order, section types, design tokens, duration, transition and animation preset;
- variable definitions and safe defaults;
- template-level media and font requirements.

The renderer must separate template design from invitation content, event data and guest personalization. Updating a template must not silently overwrite a user's saved content.

### Initial 10 distinct theme directions

1. **Royal Mandala:** deep maroon, antique gold, mandala/diya reveal and palace-inspired motion.
2. **Gujarati Shubh Vivah:** toran, bandhani-inspired motifs, auspicious colors and Gujarati text support.
3. **Jain Sacred & Serene:** refined ivory/champagne palette, understated mandala and family/religious ceremony sections.
4. **Temple & Kolam:** temple-arch compositions, kolam drawing effect and South Indian ceremony presets.
5. **Phulkari Celebration:** joyful embroidered-pattern motifs and festive ceremony scenes.
6. **Floral Romance:** blooming floral transitions, soft rose palette and script typography.
7. **Cinematic Love Story:** couple photos/videos, cinematic title reveal and story-like scenes.
8. **Haldi & Mehendi Fiesta:** marigold, bright color transitions, playful decorative details and pre-wedding events.
9. **Modern Editorial:** contemporary typography, restrained movement, high contrast and generous negative space.
10. **Universal Celebration:** flexible event names, neutral theme system and presets for engagement, birthday, anniversary, baby shower, housewarming and custom functions.

These are visual directions, not ten recolors of one layout. Each theme must have an original visual identity, scene sequence and motion profile.

## 6. Traditional and custom event builder

An invitation can contain any number of events/functions. Offer optional presets, without forcing users to keep preset names.

Suggested presets include Ganesh Sthapna, Kankotri Lekhan, Mameru, Mehendi, Haldi/Pithi, Sangeet, Garba, Wedding/Muhurtham, Reception, Engagement, Birthday, Anniversary, Baby Shower, Jain/religious function, Housewarming and Custom Event.

Each event supports:
- name, subtitle and description;
- date, start/end time and display order;
- venue name, address and map URL;
- dress code and optional photo/video;
- visibility toggle and optional scene/theme accent;
- guest assignment.

Changing one event must not overwrite another event's information. Guests should only see the events assigned to them when guest event filtering is enabled.

## 7. Dynamic variables and guest personalization

Support variables such as `bride_name`, `groom_name`, `family_name`, `guest_name`, `event_name`, `event_date`, `event_time`, `venue_name`, `venue_address` and `invitation_message`.

The customer chooses whether guest personalization is enabled. When enabled:
- each guest gets a cryptographically random, unique token;
- the route uses a non-predictable token and does not put a guest's personal name in the URL;
- the invitation resolves the token server-side and applies the guest name and assigned event list;
- the common invitation route stays separate from personalized guest routes;
- personalized URLs should be noindex, and sensitive guest information must never be returned in public API responses;
- draft invitations and private previews must remain private until published.

Support manual guests and Excel/CSV import with a review/validation step before committing imported data. Include name, family/group, mobile/email where supplied, assigned events, link generation and sharing status.

## 8. Sharing and guest features

Core sharing capabilities:
- publish/unpublish and public URL;
- secure personalized URL per guest;
- WhatsApp share action with an editable message template and variable preview;
- QR code for common and personalized invitation links;
- RSVP form and host-facing response list;
- basic guest/link status, with deeper analytics later.

The WhatsApp action should use a share/deep link unless an authorized WhatsApp Business API integration is deliberately implemented. Do not claim automated bulk delivery when only a manual share link exists.

## 9. Media and export

- Validate permitted media formats and sizes.
- Keep uploaded assets in controlled storage and protect private uploads.
- Optimize and lazy-load non-critical imagery/video.
- Respect browser autoplay restrictions; provide a visible start/play control.
- Use responsive poster/fallback imagery and reduced-motion alternatives.
- Add MP4 export as a separate render pipeline after template scenes and timeline data are stable. Export must be explicit about whether it contains generic or guest-personalized content.

## 10. Implementation sequence

### Stage A — Reliable baseline
- Verify create, edit, save, publish/unpublish, private preview and public rendering.
- Fix editor persistence and ensure API errors are visible to the customer.
- Add tests around ownership/access and the core invitation lifecycle.

### Stage B — Cinematic scene renderer
- Define scene configuration and motion presets.
- Build a single high-quality reference template end-to-end, using original assets.
- Support phone-first preview and usable play/pause/fullscreen controls.
- Keep performance, loading and reduced-motion behavior in scope.

### Stage C — Editor
- Build structured text/media/design controls connected to the renderer.
- Add autosave, undo/redo, scene reorder and live preview.
- Ensure edits persist after reload and do not corrupt template defaults.

### Stage D — Event and media tools
- Implement event presets and custom-event CRUD/reordering.
- Add image/video upload and per-event content.
- Verify event information renders consistently on invitation pages.

### Stage E — Theme collection
- Complete ten original themes with distinct scene sequences and responsive previews.
- Keep shared component primitives, but not identical layouts or animation sequences.
- Allow template selection during creation and safely changing templates without discarding user content.

### Stage F — Guest personalization and distribution
- Confirm Excel/CSV preview/import, assignments, random tokens, personalized name, event filtering and WhatsApp share text.
- Test unauthorized access, draft links, unpublishing and invalid/expired tokens.

### Stage G — Export, polish and release
- Add MP4 export, QR codes, RSVP dashboard and deeper analytics by priority.
- Test slow mobile connections, long names, missing media, different screen sizes, reduced motion, and all publish states.
- Deploy to a public HTTPS domain only after end-to-end checks.

## 11. Definition of done

A feature is not complete because a page exists or a build passes. Mark it complete only when the behavior has been tested.

- A customer can create and reopen a project without losing data.
- Editing a supported field visibly updates the live invitation and survives reload.
- Scene controls work and never expose hidden or unsupported elements as editable.
- Every published template has a real mobile preview and a tested creation path.
- Events can be added, edited, deleted and reordered independently.
- Guest-specific links show the correct name and assigned events without exposing other guest data.
- Publishing, unpublishing, RSVP and WhatsApp sharing behave as their UI promises.
- Local build and automated checks pass, followed by browser testing of critical user journeys.

## 12. Development policy

Keep changes small and reversible. Commit coherent improvements directly to the repository. Before a broader editor rewrite, establish the data contract, scene schema and rendering lifecycle so that ten templates and user-created content can share one stable foundation.
