const path = require('path');
const assetsService = require('./assets');
const articleDateService = require('./article-date');
const configService = require('./config');
const domService = require('./dom');
const excerptService = require('./excerpt');
const markdownService = require('./markdown');
const templateService = require('./template');
const translationService = require('./translation');
const variableService = require('./variable');

const ARTICLE_VAR_NAME = 'triven:article';
const FOOTER_VAR_NAME = 'triven:footer';

const _public = {};

_public.build = ({ filepath, summary, markdownText }, languages = []) => {
  const article = assetsService.handleRelativeAssets(
    markdownService.convert(
      variableService.replaceVars(
        markdownText,
        configService.getArticleVars(),
        summary.lang
      )
    ),
    { baseDir: path.dirname(filepath), assetsDirPrefix: '../' }
  );
  return {
    summary: { ...summary, excerpt: excerptService.extract(article, summary) },
    article: fillTemplate(
      templateService.getArticleTemplate({ lang: summary.lang }),
      article,
      summary,
      languages,
    ),
    filepath
  };
};

function fillTemplate(template, article, summary, languages){
  const htmlString = replaceTemplateVars(template, article, summary, languages);
  const $ = parseHTMLString(htmlString);
  $('html').attr('lang', summary.lang);
  $('head').append(`<title>${summary.title}</title>`).append(buildMetaTags(summary));
  return $.html();
}

function replaceTemplateVars(template, article, summary, languages){
  const htmlString = templateService.replaceVar(template, ARTICLE_VAR_NAME, wrapArticle(summary, article));
  const footerHtmlString = buildFooter(languages, summary.lang);
  return template.includes(FOOTER_VAR_NAME) ?
    templateService.replaceVar(htmlString, FOOTER_VAR_NAME, footerHtmlString) :
    htmlString.replace('</article>', `${footerHtmlString}</article>`);
}

function wrapArticle({ title, date, lang }, article){
  return `
    <main class="tn-main">
      <article class="tn-article" itemscope itemtype="http://schema.org/BlogPosting">
        <header class="tn-header">
          <h1 class="tn-post-title">${title}</h1>
          ${articleDateService.buildMarkup(date, lang)}
        </header>
        ${article}
      </article>
    </main>
  `;
}

function buildFooter(languages, lang){
  return `
    <footer class="tn-footer">
      ${buildSeeAllPostsLink(languages, lang)}
    </footer>
  `;
}

function buildSeeAllPostsLink(languages, lang){
  const { seeAllPosts } = translationService.get(lang);
  const href = languages.length > 1 ? `../l/${lang}` : '../';
  return `<a href=${href}>${seeAllPosts}</a>`;
}

function buildMetaTags({ unlisted, ...rest }){
  const baseMetaTags = buildBaseMetaTags(rest);
  return unlisted ? `${baseMetaTags} ${buildRobotsMetaTags()}` : baseMetaTags;
}

function buildBaseMetaTags({ title, description = '', keywords = '', image, imageAlt }){
  const tags = `
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    <meta name="twitter:card" content="summary">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">`;
  return image ? appendImageMetaTags(tags, image, imageAlt) : tags;
}

function appendImageMetaTags(tags, imageUrl, imageAlt){
  const baseImageTag = `
    ${tags}
    <meta name="twitter:image" content="${imageUrl}" />
    <meta property="og:image" content="${imageUrl}" />`;
  return imageAlt ? `${baseImageTag} <meta property="og:image:alt" content="${imageAlt}" />` : baseImageTag;
}

function buildRobotsMetaTags(){
  return `
    <meta name="robots" content="noindex, nofollow">
  `;
}

function parseHTMLString(htmlString){
  return domService.parseHTMLString(htmlString);
}

module.exports = _public;
