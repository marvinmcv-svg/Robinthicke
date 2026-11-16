"""Generates the legal pages under /legal/. Edit LEGAL below, then run:  python3 scripts/build-legal.py

Anything wrapped in [[double brackets]] is a placeholder the site owner must fill in.
These are templates, not legal advice: have a lawyer review them before relying on them.
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEGAL = {
    'updated': 'November 16, 2026',
    'owner': '[[Legal name of the company that runs this site]]',
    'address': '[[Registered postal address]]',
    'privacy_email': '[[privacy@your-domain.com]]',
    'dmca_agent': '[[Name of DMCA designated agent, registered with the U.S. Copyright Office]]',
    'dmca_email': '[[copyright@your-domain.com]]',
    'law': 'the State of California, United States',
    'venue': 'Los Angeles County, California',
    'booking': 'RobinThickeInfo@rocnation.com',
}

def fill(s):
    for k, v in LEGAL.items():
        s = s.replace('{' + k + '}', v)
    while re.search(r'(\w+="[^"]*?)\[\[(.+?)\]\]', s):  # placeholders inside attributes: plain text
        s = re.sub(r'(\w+="[^"]*?)\[\[(.+?)\]\]', r'\1\2', s)
    return re.sub(r'\[\[(.+?)\]\]', r'<mark class="todo" title="Placeholder: fill this in">\1</mark>', s)

PAGES = {}

PAGES['terms'] = ('Terms of Use', 'The rules for using this website.', '''
<h2 id="agree">1. Agreement</h2>
<p>These Terms of Use ("Terms") apply to this website and everything on it (the "Site"). The Site is operated by {owner} ("we", "us"). By using the Site you agree to these Terms. If you don't agree, please don't use the Site.</p>

<h2 id="ip">2. Who owns what</h2>
<p>The music, recordings, artwork, photographs, videos, logos, text and design on the Site are owned by Robin Thicke, his record labels, photographers and other rights holders, or are used with permission or under licence. They are protected by copyright, trademark and other laws.</p>
<p>You may view the Site and share links to it for personal, non-commercial use. You may not copy, download, reproduce, modify, distribute, sell, or use any content from the Site (including for training machine-learning models) without written permission from the rights holder. The name "Robin Thicke", his likeness, signature and logos may not be used to suggest endorsement or for any commercial purpose without permission.</p>
<p>Third-party marks belong to their owners, including GRAMMY® (The Recording Academy), Billboard®, RIAA®, Spotify®, YouTube®, Instagram® and FOX®. Their use on the Site is descriptive and does not mean those companies endorse the Site. Photo credits and licences are listed on the <a href="/legal/credits/">Credits</a> page.</p>

<h2 id="third">3. Other companies' services</h2>
<p>The Site links to and embeds services run by other companies, including Spotify, YouTube, Instagram, ticket sellers, venues and the official store. Those services have their own terms and privacy policies, and we are not responsible for their content, availability or practices. Song previews are provided by Spotify; full songs are available on Spotify and other platforms.</p>

<h2 id="tickets">4. Tickets, merchandise and events</h2>
<p>We do not sell tickets or merchandise on the Site. Ticket and store links take you to independent sellers, and any purchase is a contract between you and that seller. Show dates, times, line-ups and venues can change; always check with the venue or ticket seller. We are not responsible for cancelled or rescheduled events, prices, fees, refunds or resale tickets. Buy only from the official seller linked for each show.</p>

<h2 id="marvin">5. Marvin, the AI receptionist</h2>
<p>"Marvin" is an automated assistant powered by artificial intelligence. Marvin is not Robin Thicke, is not a person and does not speak for Robin Thicke, his management, his labels or Roc Nation. Marvin's answers can be incomplete or wrong; check important information (such as show dates) with the official source.</p>
<p>Nothing Marvin says is an offer, a confirmation or a binding agreement. Marvin cannot book performances, quote fees or confirm appearances; bookings are handled only by Robin's team, in writing. Please don't share sensitive personal information (such as payment details, passwords or health information) with Marvin. See the <a href="/legal/privacy/">Privacy Policy</a> for how chat messages are handled.</p>

<h2 id="submissions">6. Messages and booking inquiries</h2>
<p>When you contact the team (for example by email, or with the draft Marvin prepares), you agree that what you send is accurate and that you have the right to send it. Unsolicited ideas, songs, lyrics or demos are not accepted through the Site; if you send them anyway, we have no obligation to keep them confidential or to compensate you.</p>

<h2 id="conduct">7. What you may not do</h2>
<ul>
  <li>Use the Site for anything unlawful, fraudulent or harmful.</li>
  <li>Try to gain unauthorised access to the Site, its servers or connected systems, or interfere with how it works.</li>
  <li>Scrape, crawl or harvest the Site or its content with automated tools, except search engines indexing it.</li>
  <li>Use Marvin to generate spam, impersonate anyone, or try to make it produce harmful or misleading content.</li>
  <li>Pretend to be Robin Thicke, his team, or an official representative.</li>
</ul>

<h2 id="dmca">8. Copyright complaints</h2>
<p>We respect intellectual property rights. If you believe something on the Site infringes your copyright, send a notice to our designated agent, {dmca_agent}, at <a href="mailto:{dmca_email}">{dmca_email}</a> or {address}. Under the U.S. Digital Millennium Copyright Act (17 U.S.C. § 512(c)(3)) your notice must include:</p>
<ol>
  <li>your physical or electronic signature;</li>
  <li>the copyrighted work you say is infringed;</li>
  <li>the material on the Site you say is infringing, with enough detail (such as the URL) for us to find it;</li>
  <li>your name, address, telephone number and email;</li>
  <li>a statement that you have a good-faith belief the use is not authorised by the copyright owner, its agent or the law; and</li>
  <li>a statement, under penalty of perjury, that the information in your notice is accurate and that you are the owner or authorised to act for the owner.</li>
</ol>
<p>We will remove or disable access to material that is the subject of a valid notice. We may share your notice with the person who provided the material.</p>

<h2 id="disclaimer">9. Disclaimers</h2>
<p>The Site is provided "as is" and "as available". To the fullest extent the law allows, we make no warranties of any kind, express or implied, including that the Site will be accurate, complete, uninterrupted, secure or free of errors or viruses, and including any implied warranties of merchantability, fitness for a particular purpose or non-infringement. Chart positions, certifications, dates and other facts are given in good faith from public sources and may change.</p>

<h2 id="liability">10. Limitation of liability</h2>
<p>To the fullest extent the law allows, we and Robin Thicke will not be liable for any indirect, incidental, special, consequential or punitive damages, or for any loss of profits, data or goodwill, arising from your use of (or inability to use) the Site, third-party services, events or Marvin. Our total liability for any claim relating to the Site is limited to one hundred U.S. dollars (US$100). Some places don't allow these limits, so they may not apply to you; nothing in these Terms limits liability that cannot be limited by law.</p>

<h2 id="indemnity">11. Indemnity</h2>
<p>If you break these Terms or the law while using the Site, you agree to cover the reasonable costs, losses and legal fees that result for us, Robin Thicke and his representatives.</p>

<h2 id="law">12. Governing law</h2>
<p>These Terms are governed by the laws of {law}, without regard to conflict-of-law rules. Disputes will be heard in the state or federal courts located in {venue}, and you consent to their jurisdiction. If you live in the EU or UK, you also keep the protection of the mandatory laws of your country and may bring a claim in your local courts.</p>

<h2 id="changes">13. Changes and general terms</h2>
<p>We may update these Terms. The date at the top shows the latest version, and continuing to use the Site after an update means you accept it. If any part of these Terms can't be enforced, the rest still applies. Our not enforcing a right is not a waiver of it.</p>

<h2 id="contact">14. Contact</h2>
<p>{owner}, {address}. Questions about these Terms: <a href="mailto:{privacy_email}">{privacy_email}</a>. Bookings and management: <a href="mailto:{booking}">{booking}</a>.</p>
''')

PAGES['privacy'] = ('Privacy Policy', 'What happens to your information when you use this website.', '''
<p class="legal__lead">Short version: we don't run accounts, ads or analytics, and we don't sell or share your personal information. Some features load services from other companies, and those companies can see your IP address. Marvin's chat messages are sent to an AI provider to generate replies.</p>

<h2 id="who">1. Who we are</h2>
<p>This website is run by {owner}, {address} ("we", "us"), the controller of personal information described here. Contact: <a href="mailto:{privacy_email}">{privacy_email}</a>.</p>

<h2 id="collect">2. What we collect, and why</h2>
<table class="legal__table">
  <thead><tr><th>Information</th><th>When</th><th>Why (legal basis)</th><th>Kept for</th></tr></thead>
  <tbody>
    <tr><td>Technical data: IP address, browser, device, pages requested, time</td><td>Every visit, in our host's server logs (Vercel)</td><td>To deliver and secure the Site (legitimate interests)</td><td>Per Vercel's log retention, typically a few days to a few weeks</td></tr>
    <tr><td>Your cookie choice</td><td>When you choose in the cookie banner</td><td>To remember your choice (legal obligation / legitimate interests)</td><td>Stored only in your browser until you clear it</td></tr>
    <tr><td>Messages you type to Marvin</td><td>When you use the chat</td><td>To answer your question (legitimate interests / your request)</td><td>Not stored by us; see section 3</td></tr>
    <tr><td>Name, email and event details in a booking inquiry</td><td>Only if you send the email draft from your own email account</td><td>To respond to your inquiry (steps before a contract)</td><td>As long as needed to handle the inquiry and any resulting booking</td></tr>
  </tbody>
</table>
<p>We don't use advertising, tracking pixels or analytics cookies, and we don't build profiles of visitors.</p>

<h2 id="marvin">3. Marvin, the AI receptionist</h2>
<p>Marvin runs in your browser. For simple questions it answers from information already on the Site, and nothing leaves your browser. When the AI service is switched on, the text of your recent messages is sent from our server to Anthropic, PBC, which provides the Claude AI model, to generate a reply. We don't attach your name or email to these requests and we don't keep chat transcripts; Anthropic processes them under its commercial terms and does not use them to train its models. Booking details you give Marvin stay in your browser and are only sent if you choose to send the email draft yourself. Please don't share sensitive information with Marvin.</p>

<h2 id="embeds">4. Other companies' services on the Site</h2>
<p>Some parts of the Site come from other companies' servers. When they load, your browser connects directly to that company, which receives your IP address and may set its own cookies:</p>
<ul>
  <li><b>Instagram</b> (Meta Platforms): the post previews, only if you allow embeds in the cookie banner.</li>
  <li><b>Spotify</b>: song previews and players, when you press play or open a player.</li>
  <li><b>YouTube</b> (Google): videos, only when you press play, using YouTube's privacy-enhanced mode.</li>
  <li><b>Wikimedia Commons</b>: some photos on the Story page.</li>
  <li><b>Google Fonts</b>: the typefaces used on the Site.</li>
  <li><b>Vercel</b>: hosting.</li>
</ul>
<p>Their own privacy policies apply to that data. Links to ticket sellers, the store and social networks take you to their sites, which have their own policies.</p>

<h2 id="share">5. Sharing and selling</h2>
<p>We don't sell your personal information or share it for cross-context behavioural advertising, as those terms are defined in the California Consumer Privacy Act (CCPA/CPRA). We share it only with the service providers above, as needed to run the Site, or if the law requires it.</p>

<h2 id="transfers">6. International transfers</h2>
<p>Our providers may process data in the United States and other countries. Where data from the EU, EEA, UK or Switzerland is transferred, the providers rely on safeguards such as the EU-U.S. Data Privacy Framework or Standard Contractual Clauses.</p>

<h2 id="rights">7. Your rights</h2>
<p>Depending on where you live, you can ask to access, correct, delete or receive a copy of your personal information, object to or restrict how we use it, and withdraw consent at any time (for example by changing your <button type="button" class="legal__inline" data-consent-open>cookie settings</button>). California residents can also ask what we collect and how it's used, and won't be discriminated against for using these rights. To make a request, email <a href="mailto:{privacy_email}">{privacy_email}</a>. You can also complain to your local data-protection authority.</p>

<h2 id="kids">8. Children</h2>
<p>The Site is not directed at children under 13 (or under 16 in the EU/UK), and we don't knowingly collect their personal information. If you think a child has given us personal information, contact us and we'll delete it.</p>

<h2 id="security">9. Security</h2>
<p>The Site is served over HTTPS and we keep the data we hold to a minimum. No system is completely secure, so we can't guarantee absolute security.</p>

<h2 id="changes">10. Changes</h2>
<p>We'll post any changes here and update the date at the top.</p>
''')

PAGES['cookies'] = ('Cookie Policy', 'Which cookies and storage this website uses, and how to control them.', '''
<p class="legal__lead">This Site sets no advertising or analytics cookies. The only thing we store is your cookie choice. Third-party players can set their own cookies when they load.</p>
<p><button type="button" class="btn btn--gold" data-consent-open><span>Change cookie settings</span><b>⚙</b></button></p>

<h2 id="ours">1. Storage set by this Site</h2>
<table class="legal__table">
  <thead><tr><th>Name</th><th>Type</th><th>Purpose</th><th>Expires</th></tr></thead>
  <tbody><tr><td><code>rt-consent</code></td><td>Local storage (strictly necessary)</td><td>Remembers whether you allowed third-party embeds</td><td>Until you clear your browser data</td></tr></tbody>
</table>

<h2 id="third">2. Cookies from embedded services</h2>
<table class="legal__table">
  <thead><tr><th>Service</th><th>When it loads</th><th>More information</th></tr></thead>
  <tbody>
    <tr><td>Instagram (Meta)</td><td>Only if you choose "Allow embeds"</td><td><a href="https://privacycenter.instagram.com/policies/cookies/" target="_blank" rel="noopener">Instagram cookie policy</a></td></tr>
    <tr><td>Spotify</td><td>When you press play or open a player</td><td><a href="https://www.spotify.com/legal/cookies-policy/" target="_blank" rel="noopener">Spotify cookie policy</a></td></tr>
    <tr><td>YouTube (Google)</td><td>When you press play on a video (privacy-enhanced mode)</td><td><a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener">Google cookie policy</a></td></tr>
  </tbody>
</table>
<p>Pressing play on a song or video counts as your choice to load that player. You can also block or delete cookies in your browser settings; the Site keeps working without them.</p>
''')

PAGES['accessibility'] = ('Accessibility', 'Our commitment to making this website usable by everyone.', '''
<p class="legal__lead">We want everyone to be able to use this Site, and we aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1, level AA.</p>
<h2 id="done">What we've done</h2>
<ul>
  <li>If your device is set to reduce motion, the Site turns off the 3D hero, smooth scrolling, looping animations and page transitions.</li>
  <li>Every control can be reached with a keyboard and shows a visible focus outline. Dialogs close with Escape.</li>
  <li>Images have text alternatives, and decorative images are hidden from screen readers.</li>
  <li>Text and controls are designed for strong contrast on the dark background.</li>
  <li>Song previews can be paused at any time, and nothing plays sound until you press play.</li>
</ul>
<h2 id="limits">Known limitations</h2>
<ul>
  <li>Players and posts embedded from Spotify, YouTube and Instagram are made by those companies, and we can't fully control their accessibility.</li>
  <li>Some decorative animations (the rotating discography and the countdown digits) are visual only. The same information is available as text on the Music and Tour pages.</li>
</ul>
<h2 id="feedback">Feedback</h2>
<p>If something on the Site doesn't work for you, tell us at <a href="mailto:{privacy_email}">{privacy_email}</a>, and include the page and what you were trying to do. We'll try to reply within five business days and to give you the information in another way in the meantime.</p>
''')

PAGES['credits'] = ('Credits & copyright', 'Who made the pictures, words and music on this website.', '''
<p class="legal__lead">Music, recordings and album artwork © Robin Thicke and his record labels (including Star Trak, Interscope, Geffen, Lucky Music / EMPIRE and NuAmerica). All rights reserved. Used here to promote the artist's work.</p>

<h2 id="photos">Photographs</h2>
<p>Press and promotional photographs come from the artist's official channels (robinthicke.com and Roc Nation) [[and are used with permission — confirm you have it]]. Portrait on the Story page: Matthew Takes.</p>
<p>These era photos on the <a href="/story/">Story</a> page are used under Creative Commons licences, without changes other than cropping on screen:</p>
<ul class="legal__credits" data-photo-credits></ul>

<h2 id="data">Facts and figures</h2>
<p>Chart positions, certifications and award nominations come from public sources including Billboard, the RIAA, the Recording Academy and Wikipedia. Tour dates come from the artist's site, venues and ticket listings. Instagram posts are embedded from <a href="https://www.instagram.com/robinthicke/" target="_blank" rel="noopener">@robinthicke</a>. Song previews are provided by Spotify.</p>

<h2 id="marks">Trademarks</h2>
<p>GRAMMY® is a registered trademark of The Recording Academy. Billboard®, RIAA®, Spotify®, YouTube®, Instagram®, FOX® and The Masked Singer™ belong to their respective owners. Their use here is descriptive and does not imply endorsement.</p>

<h2 id="report">Spotted a mistake or a rights issue?</h2>
<p>Email <a href="mailto:{dmca_email}">{dmca_email}</a>. For copyright complaints, see section 8 of the <a href="/legal/terms/">Terms of Use</a>.</p>
''')

ORDER = ['terms', 'privacy', 'cookies', 'accessibility', 'credits']

TPL = '''<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title} — Robin Thicke</title>
  <meta name="description" content="{desc}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://robin-thicke.vercel.app/legal/{slug}/" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <meta name="theme-color" content="#0b0a09" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Anton&family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/src/style.css" />
  <link rel="stylesheet" href="/src/site.css" />
  <link rel="stylesheet" href="/src/pages.css" />
</head>
<body class="page-legal">
  <main id="top">
    <header class="phead phead--legal">
      <div class="wrap">
        <p class="phead__crumb"><a href="/">Robin Thicke</a> / Legal</p>
        <h1 class="display">{title}</h1>
        <p class="phead__lede">{desc}</p>
        <p class="legal__updated">Last updated {updated}</p>
      </div>
    </header>
    <section class="section legal">
      <div class="wrap legal__grid">
        <nav class="legal__nav" aria-label="Legal pages">{nav}</nav>
        <article class="legal__body">{body}</article>
      </div>
    </section>
    <footer data-footer></footer>
  </main>
  <script type="module" src="/src/legal.js"></script>
</body>
</html>
'''

for slug in ORDER:
    title, desc, body = PAGES[slug]
    nav = ''.join(f'<a href="/legal/{s}/"{" aria-current=\"page\"" if s == slug else ""}>{PAGES[s][0]}</a>' for s in ORDER)
    html = TPL.format(title=title, desc=desc, slug=slug, nav=nav, body=fill(body), updated=LEGAL['updated'])
    os.makedirs(os.path.join(ROOT, 'legal', slug), exist_ok=True)
    open(os.path.join(ROOT, 'legal', slug, 'index.html'), 'w').write(html)
print('wrote', len(ORDER), 'legal pages')
