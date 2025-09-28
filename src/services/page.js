const { EXCERPT, DESCRIPTION } = require('../constants/postIntroTypes');
const configService = require('./config');
const articleDateService = require('./article-date');
const domService = require('./dom');
const markdownService = require('./markdown');
const settingsService = require('./settings');
const templateService = require('./template');
const translationService = require('./translation');

const _public = {};

_public.build = (posts, { page, total, hrefPrefixes = {}, lang, availableLanguages }) => {
  const body = buildPageBody(posts, page, total, hrefPrefixes.post, lang);
  const settings = settingsService.build(availableLanguages, { selectedLanguage: lang, hrefPrefix: hrefPrefixes.post });
  const html = templateService.replaceVar(buildPage(body, hrefPrefixes.asset, lang), 'triven:settings', settings);
  return domService.minifyHTML(html);
};

function buildPageBody(posts, page, total, postHrefPrefix, lang){
  return `
    <main class="tn-main">
      ${buildPostList(posts, page, postHrefPrefix, lang)}
      ${handleFooter(page, total, translationService.get(lang))}
    </main>
  `;
}

function buildPostList(posts, page, postHrefPrefix = '', lang){
  const language = lang || configService.get().lang;
  const items = posts.map(post => {
    const translations = translationService.get(post.lang);
    const href = buildPostHref(post.url, postHrefPrefix);
    return `
      <li>
        <article itemscope itemtype="http://schema.org/BlogPosting" ${handleSectionLangAttribute(language, post.lang)}>
          <header class="tn-header">
            <h2 class="tn-post-title">
              <a href="${href}" ${handleLinkAttrs(post)}>${post.title}</a>
            </h2>
            ${articleDateService.buildMarkup(post.date, post.lang)}
          </header>
          <p>${buildPostIntroduction(post)}</p>
          <footer class="tn-footer">
            <a href="${href}" ${handleLinkAttrs(post)} class="tn-read-more-link">
              ${translations.readMore}<span class="tn-screen-reader-only">: ${post.title}</span>
            </a>
          </footer>
        </article>
      </li>
    `;
  }).join('');
  return `<ul class="tn-post-list">${items}</ul>`;
}

function handleSectionLangAttribute(language, postLang){
  return language !== postLang ? `lang="${postLang}"` : '';
}

function buildPostIntroduction(post){
  const type = configService.get().homepagePostIntroType;
  const content = type == DESCRIPTION ? post[DESCRIPTION] : post[EXCERPT];
  return removeEmbracingParagraphTags(markdownService.convert(content).trim());
}

function removeEmbracingParagraphTags(htmlString){
  return htmlString.replace(/^<p>/, '').replace(/<\/p>$/, '');
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

function buildPage(body, assetsDirPrefix, customLang){
  const template = templateService.getHomepageTemplate({ assetsDirPrefix, customLang });
  return templateService.replaceVar(template, 'triven:posts', body);
}

module.exports = _public;
