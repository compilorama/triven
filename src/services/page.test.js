const postsMock = require('../mocks/posts');
const domService = require('./dom');
const { fileService } = require('./file');
const pageService = require('./page');
const stylesService = require('./styles');
const { mockTrivenConfig, getExpectedTrivenStylesheetHash } = require('./testing');

describe('Page Service', () => {
  function buildPage(posts, { page, total, hrefPrefixes, lang, availableLanguages }, onBuild){
    stylesService.buildBaseStyle('', () => {
      const result = pageService.build(posts, { page, total, hrefPrefixes, lang, availableLanguages });
      onBuild(result);
    });
  }

  beforeEach(() => {
    fileService.write = jest.fn();
    fileService.copySync = jest.fn();
  });

  it('should build a page containing given posts', done => {
    const title = 'Test Blog';
    mockTrivenConfig({ title });
    const [first, second, third] = postsMock;
    buildPage([first, second, third], { page: 1, total: 1 }, page => {
      expect(page).toEqual(domService.minifyHTML(`
        <!DOCTYPE html>
        <html lang="en-US">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
            <link rel="stylesheet" href="a/triven-${getExpectedTrivenStylesheetHash()}.css">
            <title>${title}</title>
          </head>
          <body>
            <main class="tn-main">
              <ul class="tn-post-list">
                <li>
                  <article itemscope itemtype="http://schema.org/BlogPosting">
                    <header class="tn-header">
                      <h2 class="tn-post-title"><a href="new-year">New year!</a></h2>
                      <time class="tn-date" itemprop="dateCreated pubdate datePublished" datetime="2020-01-01">1/1/2020</time>
                    </header>
                    <p>This is an excerpt for the first post</p>
                    <footer class="tn-footer">
                      <a href="new-year" class="tn-read-more-link">
                        Read more<span class="tn-screen-reader-only">: New year!</span>
                      </a>
                    </footer>
                  </article>
                </li>
                <li>
                  <article itemscope itemtype="http://schema.org/BlogPosting">
                    <header class="tn-header">
                      <h2 class="tn-post-title">
                        <a href="https://rafaelcamargo.com/the-pearl-and-the-mussels" rel="noopener noreferrer" target="_blank">
                          The pearl and the mussels
                        </a>
                      </h2>
                      <time class="tn-date" itemprop="dateCreated pubdate datePublished" datetime="2021-06-21">6/21/2021</time>
                    </header>
                    <p>This is an excerpt for the second post</p>
                    <footer class="tn-footer">
                      <a href="https://rafaelcamargo.com/the-pearl-and-the-mussels" rel="noopener noreferrer" target="_blank" class="tn-read-more-link">
                        Read more<span class="tn-screen-reader-only">: The pearl and the mussels</span>
                      </a>
                    </footer>
                  </article>
                </li>
                <li>
                  <article itemscope itemtype="http://schema.org/BlogPosting" lang="pt-BR">
                    <header class="tn-header">
                      <h2 class="tn-post-title">
                        <a href="https://rafaelcamargo.com/incondicional-inhotim" rel="noopener noreferrer" target="_blank">
                          Incondicional Inhotim
                        </a>
                      </h2>
                      <time class="tn-date" itemprop="dateCreated pubdate datePublished" datetime="2020-06-28">28/06/2020</time>
                    </header>
                    <p>Esse é um excerto para o terceiro artigo.</p>
                    <footer class="tn-footer">
                      <a href="https://rafaelcamargo.com/incondicional-inhotim" rel="noopener noreferrer" target="_blank" class="tn-read-more-link">
                        Read more<span class="tn-screen-reader-only">: Incondicional Inhotim</span>
                      </a>
                    </footer>
                  </article>
                </li>
              </ul>
            </main>
            <div class="tn-settings">
              <div class="tn-settings-content">
                <div class="tn-settings-rss-feed">
                  <a href="./feed.atom">RSS Feed</a>
                </div>
              </div>
            </div>
          </body>
        </html>
      `));
      done();
    });
  });

  it('should optionally build a page using the description of the given posts', done => {
    const title = 'Test Blog';
    mockTrivenConfig({ title, homepagePostIntroType: 'description' });
    const postSumary = {
      title: 'Debouncing requests with React Query',
      date: '2023-02-24',
      url: 'https://rafaelcamargo.com/deboucing-requests-with-react-query',
      lang: 'en-US',
      description: 'Sooner or later, every application ends up needing to implement a debouncing strategy in some parts of its code to avoid noisy events. Learn how to prevent unnecessary requests with one of the most popular libraries of the React ecosystem.',
      excerpt: 'Unnecessary requests generate an overload that charges a high price from those who serve data as well as from those who consume them, since both parts waste resources transmitting data that won\'t be used. One of the most popular strategies to avoid unnecessary requests is called debouncing. According to the Wiktionary, the term joins de + bounce bounce and means: to discard events or signals that should not be processed because they occurred too close together.'
    };
    buildPage([postSumary], { page: 1, total: 1 }, page => {
      expect(page).toEqual(domService.minifyHTML(`
        <!DOCTYPE html>
        <html lang="en-US">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
            <link rel="stylesheet" href="a/triven-${getExpectedTrivenStylesheetHash()}.css">
            <title>${title}</title>
          </head>
          <body>
            <main class="tn-main">
              <ul class="tn-post-list">
                <li>
                  <article itemscope itemtype="http://schema.org/BlogPosting">
                    <header class="tn-header">
                      <h2 class="tn-post-title"><a href="https://rafaelcamargo.com/deboucing-requests-with-react-query">Debouncing requests with React Query</a></h2>
                      <time class="tn-date" itemprop="dateCreated pubdate datePublished" datetime="2023-02-24">2/24/2023</time>
                    </header>
                    <p>Sooner or later, every application ends up needing to implement a debouncing strategy in some parts of its code to avoid noisy events. Learn how to prevent unnecessary requests with one of the most popular libraries of the React ecosystem.</p>
                    <footer class="tn-footer">
                      <a href="https://rafaelcamargo.com/deboucing-requests-with-react-query" class="tn-read-more-link">
                        Read more<span class="tn-screen-reader-only">: Debouncing requests with React Query</span>
                      </a>
                    </footer>
                  </article>
                </li>
              </ul>
            </main>
            <div class="tn-settings">
              <div class="tn-settings-content">
                <div class="tn-settings-rss-feed">
                  <a href="./feed.atom">RSS Feed</a>
                </div>
              </div>
            </div>
          </body>
        </html>
      `));
      done();
    });
  });

  it('should handle page with excerpts containing html code', done => {
    const title = 'Test Blog';
    mockTrivenConfig({ title });
    const postSumary = {
      title: 'Debouncing requests with React Query',
      date: '2023-02-24',
      url: 'https://rafaelcamargo.com/deboucing-requests-with-react-query',
      lang: 'en-US',
      description: 'This description is free of html syntax.',
      excerpt: 'This excerpt uses `<Component />` in it.'
    };
    buildPage([postSumary], { page: 1, total: 1 }, page => {
      expect(page).toEqual(domService.minifyHTML(`
        <!DOCTYPE html>
        <html lang="en-US">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
            <link rel="stylesheet" href="a/triven-${getExpectedTrivenStylesheetHash()}.css">
            <title>${title}</title>
          </head>
          <body>
            <main class="tn-main">
              <ul class="tn-post-list">
                <li>
                  <article itemscope itemtype="http://schema.org/BlogPosting">
                    <header class="tn-header">
                      <h2 class="tn-post-title"><a href="https://rafaelcamargo.com/deboucing-requests-with-react-query">Debouncing requests with React Query</a></h2>
                      <time class="tn-date" itemprop="dateCreated pubdate datePublished" datetime="2023-02-24">2/24/2023</time>
                    </header>
                    <p>This excerpt uses <code>&lt;Component /&gt;</code> in it.</p>
                    <footer class="tn-footer">
                      <a href="https://rafaelcamargo.com/deboucing-requests-with-react-query" class="tn-read-more-link">
                        Read more<span class="tn-screen-reader-only">: Debouncing requests with React Query</span>
                      </a>
                    </footer>
                  </article>
                </li>
              </ul>
            </main>
            <div class="tn-settings">
              <div class="tn-settings-content">
                <div class="tn-settings-rss-feed">
                  <a href="./feed.atom">RSS Feed</a>
                </div>
              </div>
            </div>
          </body>
        </html>
      `));
      done();
    });
  });

  it('should optionally prefix assets href in the html', done => {
    const hrefPrefixes = { asset: '../../../../' };
    buildPage(postsMock, { page: 2, total: 2, hrefPrefixes }, page => {
      expect(page).toContain(domService.minifyHTML(`
        <link rel="stylesheet" href="../../../../a/triven-${getExpectedTrivenStylesheetHash()}.css">
      `));
      done();
    });
  });

  it('should optionally prefix post href in the html', done => {
    const hrefPrefixes = { post: '../../../../' };
    buildPage(postsMock, { page: 2, total: 2, hrefPrefixes }, page => {
      expect(page).toContain(domService.minifyHTML(`
        <h2 class="tn-post-title">
          <a href="../../../../new-year">New year!</a>
        </h2>
      `));
      expect(page).toContain(domService.minifyHTML(`
        <footer class="tn-footer">
          <a href="../../../../new-year" class="tn-read-more-link">
            Read more<span class="tn-screen-reader-only">: New year!</span>
          </a>
        </footer>
      `));
      done();
    });
  });

  it('should contain a link to index if current page is two', done => {
    const [first, second] = postsMock;
    buildPage([first, second], { page: 2, total: 2 }, page => {
      expect(page).toContain(domService.minifyHTML(`
        <footer class="tn-footer">
          <nav>
            <a href="../../" class="tn-newer-link">Newer</a>
          </nav>
        </footer>
      `));
      done();
    });
  });

  it('should contain a link to newer posts if page number given is greater than two', done => {
    const [first, second] = postsMock;
    buildPage([first, second], { page: 3, total: 3 }, page => {
      expect(page).toContain(domService.minifyHTML(`
        <footer class="tn-footer">
          <nav>
            <a href="../2" class="tn-newer-link">Newer</a>
          </nav>
        </footer>
      `));
      done();
    });
  });

  it('should contain a link to older posts if number of total pages is greater than current page', done => {
    const [first, second] = postsMock;
    buildPage([first, second], { page: 1, total: 2 }, page => {
      expect(page).toContain(domService.minifyHTML(`
        <footer class="tn-footer">
          <nav>
            <a href="p/2" class="tn-older-link">Older</a>
          </nav>
        </footer>
      `));
      done();
    });
  });

  it('should contain a link to newer and older posts if page is between the first and last one', done => {
    const [first, second] = postsMock;
    buildPage([first, second], { page: 3, total: 6 }, page => {
      expect(page).toContain('<a href="../2" class="tn-newer-link">Newer</a>');
      expect(page).toContain('<a href="../4" class="tn-older-link">Older</a>');
      done();
    });
  });

  it('should build apropriate external post href on pages other than the first one', done => {
    const second = postsMock[1];
    buildPage([second], { page: 2, total: 2 }, page => {
      expect(page).toContain(`<h2 class="tn-post-title"><a href="${second.url}" rel="noopener noreferrer" target="_blank">${second.title}</a></h2>`);
      expect(page).toContain([
        `<a href="${second.url}" rel="noopener noreferrer" target="_blank" class="tn-read-more-link">`,
        `Read more<span class="tn-screen-reader-only">: ${second.title}</span>`,
        '</a>'
      ].join(''));
      done();
    });
  });

  it('should set page language according to the language set on triven config file by default', done => {
    const lang = 'pt-BR';
    mockTrivenConfig({ lang });
    buildPage(postsMock, { page: 1, total: 1 }, page => {
      expect(page).toContain(`<html lang="${lang}">`);
      done();
    });
  });

  it('should optionally set language other than language set on triven config file', done => {
    const lang = 'pt-BR';
    const customLang = 'es-ES';
    mockTrivenConfig({ lang });
    buildPage(postsMock, { page: 1, total: 1, lang: customLang }, page => {
      expect(page).toContain(`<html lang="${customLang}">`);
      done();
    });
  });

  it('should optionally use custom translations for labels', done => {
    const lang = 'pt-BR';
    const newer = 'Posteriores';
    const older = 'Anteriores';
    mockTrivenConfig({ translations: { [lang]: { newer, older } } });
    buildPage(postsMock, { page: 3, total: 6, lang }, page => {
      expect(page).toContain(`<a href="../2" class="tn-newer-link">${newer}</a>`);
      expect(page).toContain(`<a href="../4" class="tn-older-link">${older}</a>`);
      done();
    });
  });

  it('should optionally use custom translations for "Read more" links', done => {
    mockTrivenConfig({ translations: { 'pt-BR': { readMore: 'Continue lendo' } } });
    buildPage(postsMock, { page: 1, total: 1 }, page => {
      expect(page).toContain(domService.minifyHTML(`
        <a href="new-year" class="tn-read-more-link">
          Read more<span class="tn-screen-reader-only">: New year!</span>
        </a>
      `));
      expect(page).toContain(domService.minifyHTML(`
        <a href="https://rafaelcamargo.com/incondicional-inhotim" rel="noopener noreferrer" target="_blank" class="tn-read-more-link">
          Continue lendo<span class="tn-screen-reader-only">: Incondicional Inhotim</span>
        </a>
      `));
      done();
    });
  });

  it('should optionally use custom date formatter', done => {
    mockTrivenConfig({ formatters: { date: (isoDateString, lang) => `${isoDateString} ${lang}` } });
    buildPage(postsMock, { page: 1, total: 1 }, page => {
      expect(page).toContain([
        '<time class="tn-date" itemprop="dateCreated pubdate datePublished" datetime="2020-01-01">',
        '2020-01-01 en-US',
        '</time>'
      ].join(''));
      done();
    });
  });

  it('should build language settings menu if more than one language is available', done => {
    const hrefPrefixes = { post: '../../../../' };
    const availableLanguages = ['en-US', 'es-ES'];
    buildPage(postsMock, { page: 2, total: 2, hrefPrefixes, availableLanguages }, page => {
      expect(page).toContain(domService.minifyHTML(`
        <div class="tn-settings">
          <div class="tn-settings-content">
            <nav class="tn-settings-language">
              <div class="tn-settings-list-wrapper">
                <div class="tn-settings-list-container" tabindex="0">
                  <span class="tn-screen-reader-only">Current language: Multi-language</span>
                  <span class="tn-settings-list-showing-trigger" aria-hidden="true">Multi-language</span>
                  <span class="tn-screen-reader-only">Available languages:</span>
                  <ul class="tn-settings-list">
                    <li>
                      <a href="../../../../">Multi-language</a>
                    </li>
                    <li>
                      <a href="../../../../l/en-US/">English US</a>
                    </li>
                    <li>
                      <a href="../../../../l/es-ES/">Español ES</a>
                    </li>
                  </ul>
                </div>
                <button class="tn-settings-list-hiding-trigger" aria-hidden="true" tabindex="0">Close</button>
              </div>
            </nav>
            <div class="tn-settings-rss-feed">
              <div class="tn-settings-list-wrapper">
                <div class="tn-settings-list-container" tabindex="0">
                  <span class="tn-settings-list-showing-trigger" aria-hidden="true">RSS Feeds</span>
                  <span class="tn-screen-reader-only">Available RSS Feeds:</span>
                  <ul class="tn-settings-list">
                    <li><a href="../../../../feed.atom">Multi-language</a></li>
                    <li><a href="../../../../l/en-US/feed.atom">English US</a></li>
                    <li><a href="../../../../l/es-ES/feed.atom">Español ES</a></li>
                  </ul>
                </div>
                <button class="tn-settings-list-hiding-trigger" aria-hidden="true" tabindex="0">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      `));
      done();
    });
  });
});
