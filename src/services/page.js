const configService = require('./config');
const dateService = require('./date');
const domService = require('./dom');
const settingsService = require('./settings');
const templateService = require('./template');
const translationService = require('./translation');

const _public = {};

_public.build = (posts, { page, total, hrefPrefixes = {}, lang, availableLanguages }) => {
  const body = buildPageBody(posts, page, total, hrefPrefixes.post, lang, availableLanguages);
  return domService.minifyHTML(buildPage(body, hrefPrefixes.asset, lang));
};

function buildPageBody(posts, page, total, postHrefPrefix, lang, availableLanguages){
  return `
    <main class="tn-main">
      ${buildPostList(posts, page, postHrefPrefix, lang)}
      ${handleFooter(page, total, translationService.get(lang))}
    </main>
    ${settingsService.build(availableLanguages, { selectedLanguage: lang, hrefPrefix: postHrefPrefix })}
  `;
}

function buildPostList(posts, page, postHrefPrefix = '', lang){
  const language = lang || configService.get().lang;
  const items = posts.map(post => {
    const translations = translationService.get(post.lang);
    const href = buildPostHref(post.url, postHrefPrefix);
    return `
      <li>
        <section ${handleSectionLangAttribute(language, post.lang)}>
          <header class="tn-header">
            <h2 class="tn-post-title">
              <a href="${href}" ${handleLinkAttrs(post)}>${post.title}</a>
            </h2>
            <p class="tn-date">${dateService.format(post.date, post.lang)}</p>
          </header>
          <p>${post.excerpt}</p>
          <footer class="tn-footer">
            <a href="${href}" ${handleLinkAttrs(post)} class="tn-read-more-link">
              ${translations.readMore}
            </a>
          </footer>
        </section>
      </li>
    `;
  }).join('');
  return `<ul class="tn-post-list">${items}</ul>`;
}

function handleSectionLangAttribute(language, postLang){
  return language !== postLang ? `lang="${postLang}"` : '';
}

function handleFooter(page, total, translations){
  const prevLink = buildPreviousPageLink(page, translations);
  const nextLink = buildNextPageLink(page, total, translations);
  return prevLink || nextLink ? buildFooter(prevLink, nextLink) : '';
}

function buildFooter(prevLink, nextLink){
  return `<footer class="tn-footer"><nav>${prevLink}${nextLink}</nav></footer>`;
}

function buildPreviousPageLink(page, { newer }){
  return page > 1 ? `<a href="${buildPreviousPageLinkHref(page)}" class="tn-newer-link">${newer}</a>` : '';
}

function buildPreviousPageLinkHref(page){
  return page === 2 ? '../../' : `../${page - 1}`;
}

function buildNextPageLink(page, total, { older }){
  return page !== total ? `<a href="${buildNextPageLinkHref(page)}" class="tn-older-link">${older}</a>` : '';
}

function buildNextPageLinkHref(page){
  const nextPageNumber = page + 1;
  return page === 1 ? `p/${nextPageNumber}` : `../${nextPageNumber}`;
}

function handleLinkAttrs({ external }){
  return external ? 'rel="noopener noreferrer" target="_blank"' : '';
}

function buildPostHref(href, postHrefPrefix){
  const prefix = !href.includes('http') ? postHrefPrefix : '';
  return `${prefix}${href.replace('.html', '')}`;
}

function buildPage(body, assetsDirPrefix, language){
  const template = templateService.getHomepageTemplate({ assetsDirPrefix, language });
  return templateService.replaceVar(template, 'triven:posts', body);
}

module.exports = _public;
