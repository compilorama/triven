const hljs = require('highlight.js');
const marked = require('marked');

const _public = {};

_public.convert = htmlString => {
  return marked(htmlString, { headerIds: false, highlight });
};

function highlight(code, lang){
  const language = hljs.getLanguage(lang) ? lang : 'plaintext';
  return hljs.highlight(code, { language }).value;
}

module.exports = _public;
