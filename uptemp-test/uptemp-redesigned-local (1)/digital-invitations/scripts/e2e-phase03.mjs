#!/usr/bin/env node
/**
 * PHASE 03 – Template engine E2E verification.
 *
 * Verifies the full path: template definition JSON -> database -> public API
 * -> server built RenderModel -> TemplateRenderer -> rendered HTML, for the
 * public link, the personalised (guest) link, guest event filtering, RSVP,
 * content editing and the minimal/floral variants.
 *
 * Usage:  npm run test:e2e
 * Env:    API_URL (default http://localhost:4000)
 *         WEB_URL (default http://localhost:3000)
 */

const API = (process.env.API_URL || 'http://localhost:4000').replace(/\/$/, '');
const WEB = (process.env.WEB_URL || 'http://localhost:3000').replace(/\/$/, '');

const PUBLIC_SLUG = 'akshat-wedding';
const PERSONAL_SLUG = 'e2e-test-invitation';
const PERSONAL_TOKEN = 'nFzAv1TOHB'; // Rahul Test -> assigned to "Ceremony" only
const CONTENT_INVITATION_ID = '514f463f-e09d-421d-a90c-9527849831a9';
const DEMO_USER = { email: 'demo@invitations.com', password: 'Customer@123' };

const results = [];
let apiCalls = 0;
let token = null;

/* ----------------------------- helpers ---------------------------------- */

function record(name, ok, detail = '') {
  results.push({ name, ok: Boolean(ok), detail: String(detail || '') });
  const mark = ok ? 'PASS' : 'FAIL';
  console.log(`  [${mark}] ${name}${detail ? ` — ${detail}` : ''}`);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function api(path, { method = 'GET', body, auth = true, quiet = false } = {}) {
  apiCalls += 1;
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!response.ok && !quiet) {
    const message = json?.error || json?.message || text.slice(0, 200);
    throw new Error(`${method} ${path} -> ${response.status} ${message}`);
  }

  return { status: response.status, json, text };
}

async function page(path) {
  const response = await fetch(`${WEB}${path}`);
  const html = await response.text();
  return { status: response.status, html };
}

function count(html, needle) {
  return html.split(needle).length - 1;
}

async function run() {
  console.log('\n=== PHASE 03 · Template engine E2E ===\n');
  console.log(`API ${API}   WEB ${WEB}\n`);

  /* -------------------------- environment ------------------------------- */
  console.log('1. Environment');

  try {
    const health = await fetch(`${API}/health`);
    record('API is running (/health)', health.ok, `status ${health.status}`);
  } catch (error) {
    record('API is running (/health)', false, error.message);
    return finish();
  }

  let webUp = false;
  try {
    const home = await page('/');
    webUp = home.status === 200;
    record('Web app is running (/)', webUp, `status ${home.status}`);
  } catch (error) {
    record('Web app is running (/)', false, error.message);
    return finish();
  }

  if (!webUp) return finish();

  try {
    const loginPage = await page('/login');
    record('Existing routes still render (/login)', loginPage.status === 200, `status ${loginPage.status}`);
  } catch (error) {
    record('Existing routes still render (/login)', false, error.message);
  }

  /* ----------------------- template definitions ------------------------- */
  console.log('\n2. Template definitions (JSON -> database -> API)');

  let templates = [];
  try {
    const response = await api('/api/templates?limit=50');
    templates = Array.isArray(response.json?.data) ? response.json.data : [];
    record('GET /api/templates returns the catalogue', templates.length >= 3, `${templates.length} templates`);
  } catch (error) {
    record('GET /api/templates returns the catalogue', false, error.message);
    return finish();
  }

  const bySlug = Object.fromEntries(templates.map((t) => [t.slug, t]));
  const expected = [
    ['wedding-classic-gold', 'classic'],
    ['wedding-modern-minimal', 'minimal'],
    ['wedding-floral-romance', 'floral']
  ];

  for (const [slug, variant] of expected) {
    const template = bySlug[slug];
    const config = template?.config;
    const impl = config && typeof config === 'object' ? config.impl : undefined;
    const sections = config && typeof config === 'object' && Array.isArray(config.sections) ? config.sections : [];
    record(
      `Template "${slug}" is config driven`,
      Boolean(template) && impl === 'wedding' && sections.length >= 8,
      impl ? `impl=${impl} sections=${sections.length}` : 'missing'
    );
    record(
      `Template "${slug}" carries variant "${variant}"`,
      config && typeof config === 'object' && config.variant === variant,
      `variant=${config?.variant}`
    );
  }

  const classic = bySlug['wedding-classic-gold'];
  const features = classic?.features || {};
  record(
    'Wedding feature flags are present (guestEventFiltering, gallery, rsvp)',
    features.guestEventFiltering === true && features.gallery === true && features.rsvp === true,
    JSON.stringify({ guestEventFiltering: features.guestEventFiltering, gallery: features.gallery, rsvp: features.rsvp })
  );
  record(
    'Template exposes editable content fields for the editor',
    Boolean(classic?.editableFields?.bride_name?.label),
    `fields=${classic?.editableFields ? Object.keys(classic.editableFields).length : 0}`
  );

  /* --------------------- public API contract ---------------------------- */
  console.log('\n3. Public API returns the full template');

  let publicPayload = null;
  try {
    const response = await api(`/api/invitations/public/${PUBLIC_SLUG}`, { auth: false });
    publicPayload = response.json?.data;
    const template = publicPayload?.template;
    record(
      'Public invitation payload includes full template config',
      Boolean(template?.config?.impl === 'wedding' && template?.features && template?.editableFields),
      `impl=${template?.config?.impl}`
    );
    record(
      'Public invitation payload includes events + media',
      Array.isArray(publicPayload?.events) && Array.isArray(publicPayload?.media),
      `events=${publicPayload?.events?.length ?? 0} media=${publicPayload?.media?.length ?? 0}`
    );
  } catch (error) {
    record('Public invitation payload includes full template config', false, error.message);
  }

  let personalPayload = null;
  try {
    const response = await api(`/api/invitations/public/${PERSONAL_SLUG}/${PERSONAL_TOKEN}`, { auth: false });
    personalPayload = response.json?.data;
    record(
      'Personalised invitation payload includes guest with assignments',
      Boolean(personalPayload?.guest?.personalToken) && Array.isArray(personalPayload?.guest?.guestEvents),
      `guest=${personalPayload?.guest?.name} assignments=${personalPayload?.guest?.guestEvents?.length ?? 0}`
    );
  } catch (error) {
    record('Personalised invitation payload includes guest with assignments', false, error.message);
  }

  /* -------------------------- public rendering -------------------------- */
  console.log('\n4. Public invitation rendering (/i/[slug])');

  const publicPage = await page(`/i/${PUBLIC_SLUG}`);
  const html = publicPage.html;
  record('Public invitation responds with 200', publicPage.status === 200, `status ${publicPage.status}`);
  record('TemplateRenderer is mounted', html.includes('data-testid="template-root"'));
  record(
    'Wedding design implementation selected from config.impl',
    html.includes('data-template="wedding-classic-gold"') && html.includes('data-testid="template-wedding"'),
    'impl=wedding'
  );
  record('Variant attribute exposed for styling', html.includes('data-variant="classic"'));
  record(
    'Couple names rendered from invitation content',
    html.includes('Priya') && html.includes('Akshat')
  );
  record(
    'All event sections rendered (5 events)',
    count(html, 'data-testid="tpl-event"') === 5,
    `found ${count(html, 'data-testid="tpl-event"')}`
  );
  record(
    'Event data rendered (venue + date variables)',
    html.includes('Taj Palace') && html.includes('Grand Hyatt') && html.includes('December')
  );
  record('Countdown section rendered', html.includes('data-testid="tpl-countdown"'));
  record('Personalisation notice shown on public view', html.includes('data-testid="tpl-notice"'));
  record(
    'No unresolved template placeholders in the HTML',
    !/\{\{[a-zA-Z_][a-zA-Z0-9_]*\}\}/.test(html),
    'checked {{token}} patterns'
  );
  record(
    'Server rendered the invitation (SSR HTML, not a client shell)',
    html.includes('Celebrations') && html.includes('data-testid="tpl-hero"')
  );

  /* ------------------------ personalised rendering ---------------------- */
  console.log('\n5. Personalised invitation (/i/[slug]/[token])');

  const personalPage = await page(`/i/${PERSONAL_SLUG}/${PERSONAL_TOKEN}`);
  const personalHtml = personalPage.html;
  record('Personalised invitation responds with 200', personalPage.status === 200, `status ${personalPage.status}`);
  record('Same template implementation as the public view', personalHtml.includes('data-template="wedding-classic-gold"'));
  record('Guest name rendered in the template', personalHtml.includes('data-testid="guest-name"') && personalHtml.includes('Rahul Test'));
  record(
    'Only assigned events are rendered (1 of 2)',
    count(personalHtml, 'data-testid="tpl-event"') === 1,
    `found ${count(personalHtml, 'data-testid="tpl-event"')}`
  );
  record('Unassigned event is not rendered', !personalHtml.includes('Reception'));
  record('Personalisation notice hidden for a known guest', !personalHtml.includes('data-testid="tpl-notice"'));
  record('RSVP entry point available for the guest', personalHtml.includes('data-testid="rsvp-open"'));
  record(
    'Gallery rendered for this invitation',
    personalHtml.includes('data-testid="tpl-gallery"') && count(personalHtml, 'tpl-gallery__item') >= 2,
    `items=${count(personalHtml, 'tpl-gallery__item')}`
  );

  /* -------------------------------- RSVP --------------------------------- */
  console.log('\n6. RSVP submission through the template');

  try {
    const ceremonyId = personalPayload?.events?.find((event) => event.name === 'Ceremony')?.id;
    const response = await api(`/api/rsvp/${PERSONAL_TOKEN}`, {
      method: 'POST',
      auth: false,
      body: {
        response: 'ACCEPT',
        guestsCount: 2,
        message: 'E2E RSVP - see you at the ceremony!',
        eventIds: ceremonyId ? [ceremonyId] : undefined
      }
    });
    record('RSVP accepted by the API', response.status === 200 || response.status === 201, `status ${response.status}`);
  } catch (error) {
    record('RSVP accepted by the API', false, error.message);
  }

  const rsvpPage = await page(`/i/${PERSONAL_SLUG}/${PERSONAL_TOKEN}`);
  record(
    'RSVP status rendered back into the template',
    rsvpPage.html.includes('data-testid="rsvp-status"') && rsvpPage.html.includes('data-response="ACCEPTED"'),
    (rsvpPage.html.match(/data-response="([A-Z]+)"/) || [])[1] || 'not found'
  );
  record(
    'RSVP message rendered from the guest response',
    rsvpPage.html.includes('E2E RSVP')
  );

  /* --------------------------- content editing -------------------------- */
  console.log('\n7. Content editing drives the rendered output');

  try {
    const login = await api('/api/auth/login', { method: 'POST', auth: false, body: DEMO_USER });
    token = login.json?.token || login.json?.data?.token;
    record('Dashboard login (demo user)', Boolean(token));
  } catch (error) {
    record('Dashboard login (demo user)', false, error.message);
  }

  if (token) {
    let original = {};
    try {
      const current = await api(`/api/invitations/${CONTENT_INVITATION_ID}`);
      original = current.json?.data?.content || {};
    } catch {
      original = {};
    }

    try {
      await api(`/api/invitations/${CONTENT_INVITATION_ID}`, {
        method: 'PUT',
        body: {
          content: {
            bride_name: 'Zara',
            groom_name: 'Omar',
            invitation_message: 'We joyfully invite you to the E2E celebration.',
            family_name: 'Khan Family'
          }
        }
      });
      const updated = await page(`/i/${PERSONAL_SLUG}`);
      record(
        'Updated content is reflected on the next render',
        updated.html.includes('Zara') && updated.html.includes('Omar'),
        'couple names'
      );
      record(
        'Edited invitation message overrides the template copy',
        updated.html.includes('E2E celebration')
      );
    } catch (error) {
      record('Updated content is reflected on the next render', false, error.message);
    } finally {
      try {
        await api(`/api/invitations/${CONTENT_INVITATION_ID}`, { method: 'PUT', body: { content: original } });
      } catch {
        /* restoration is best effort */
      }
    }

    /* ----------------------- guest assignment API ----------------------- */
    try {
      const guests = await api(`/api/guests/invitation/${CONTENT_INVITATION_ID}`);
      const list = Array.isArray(guests.json?.data) ? guests.json.data : guests.json?.data?.guests;
      const first = Array.isArray(list) ? list[0] : null;
      record(
        'Guest + event assignment API contract intact',
        Array.isArray(list) && Boolean(first?.personalToken) && 'guestEvents' in (first || {}),
        `guests=${Array.isArray(list) ? list.length : 0}`
      );
    } catch (error) {
      record('Guest + event assignment API contract intact', false, error.message);
    }
  }

  /* ------------------------------ variants ------------------------------ */
  console.log('\n8. Minimal and floral variants render from configuration');

  const created = [];
  try {
    for (const [slug, variant, eventName] of [
      ['wedding-modern-minimal', 'minimal', 'Phase 03 Ceremony'],
      ['wedding-floral-romance', 'floral', 'Phase 03 Reception']
    ]) {
      const template = bySlug[slug];
      if (!template) {
        record(`Variant "${variant}" invitation can be created`, false, 'template missing');
        continue;
      }

      const name = `Phase 03 ${variant}`;
      const createdInvitation = await api('/api/invitations', {
        method: 'POST',
        body: { name, templateId: template.id, description: `Phase 03 ${variant} render check` }
      });
      const invitation = createdInvitation.json?.data;
      if (!invitation?.id) {
        record(`Variant "${variant}" invitation can be created`, false, 'no invitation id');
        continue;
      }
      created.push(invitation.id);

      await api(`/api/events/invitation/${invitation.id}`, {
        method: 'POST',
        body: { name: eventName, date: '2027-03-14', startTime: '17:00', venueName: 'Phase 03 Hall' }
      });
      await api(`/api/invitations/${invitation.id}/publish`, { method: 'PUT' });

      const rendered = await page(`/i/${slugify(name)}`);
      record(
        `Variant "${variant}" invitation publishes and renders`,
        rendered.status === 200 && rendered.html.includes(`data-template="${slug}"`),
        `status ${rendered.status}`
      );
      record(
        `Variant "${variant}" exposes its variant attribute`,
        rendered.html.includes(`data-variant="${variant}"`)
      );
      record(
        `Variant "${variant}" renders the configured event`,
        rendered.html.includes('Phase 03') && rendered.html.includes('Phase 03 Hall')
      );

      if (variant === 'minimal') {
        record(
          'Minimal variant disables the gallery via feature flags',
          !rendered.html.includes('data-testid="tpl-gallery"'),
          'gallery feature=false'
        );
        record(
          'Minimal variant uses the list layout for events',
          !rendered.html.includes('tpl-event--timeline'),
          'layout=list'
        );
      }
    }
  } catch (error) {
    record('Variant invitations render from configuration', false, error.message);
  } finally {
    for (const id of created) {
      try {
        await api(`/api/invitations/${id}`, { method: 'DELETE', quiet: true });
      } catch {
        /* cleanup is best effort */
      }
    }
  }

  return finish();
}

function finish() {
  const passed = results.filter((result) => result.ok).length;
  const failed = results.length - passed;

  console.log('\n=== Summary ===');
  console.log(`  checks : ${results.length}`);
  console.log(`  passed : ${passed}`);
  console.log(`  failed : ${failed}`);
  console.log(`  api calls: ${apiCalls} (rate limit budget: 100 / 15 min)`);
  console.log(`  result : ${failed === 0 ? 'PASS' : 'FAIL'}\n`);

  if (failed > 0) {
    console.log('Failed checks:');
    for (const result of results.filter((item) => !item.ok)) {
      console.log(`  - ${result.name}${result.detail ? ` (${result.detail})` : ''}`);
    }
    console.log('');
  }

  process.exit(failed === 0 ? 0 : 1);
}

run().catch((error) => {
  console.error('\nUnexpected E2E failure:', error);
  process.exit(1);
});
