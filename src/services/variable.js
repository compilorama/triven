const _public = {};

_public.replaceVars = (text, vars, lang) => {
  if(!vars) return text;
  return Object.entries(vars).reduce((result, [key, value]) => {
    return replaceVar(result, key, value, lang);
  }, text);
};

function replaceVar(text, key, value, lang){
  const regex = new RegExp(`\\{\\{(\\s+)?${key}(\\s+)?\\}\\}`, 'g');
  const content = typeof value === 'function' ? value(lang) : value;
  return text.replace(regex, content);
}

module.exports = _public;
