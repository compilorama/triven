# Triven
> A multi-language markdown-based blog generator.

[![CircleCI](https://circleci.com/gh/compilorama/triven/tree/master.svg?style=svg)](https://circleci.com/gh/compilorama/triven/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/compilorama/triven/badge.svg?branch=master)](https://coveralls.io/github/compilorama/triven?branch=master)

## Installation

```
npm install -D @compilorama/triven
```

## Usage

To get started with Triven, you need to run the following command at the root directory of your project:

```
npx triven build
```

After running this command, a directory called `triven` and a demo post will be created.

### Setup

You don't need to setup anything to see Triven in action. By default, Triven will look for markdown files in the project directory (and sub-directories) and will generate a blog - ready to be published - inside a directory called *triven*.

However, you can override the default configuration values used to build your blog creating a file called `triven.config.js` in the root directory of your project containing the following options:

``` javascript
// triven.config.js

module.exports = {
  title: 'Your Blog Title',
  // [Required] Used as browser window title on homepage.
  // Default: Triven.
  url: 'https://rafaelcamargo.com/blog',
  // [Required ]Production URL where the blog will be deployed to.
  // Used to build absolute URLs on RSS Feeds.
  sourceDirectory: './posts',
  // Directory where triven will look for markdown files.
  // Default: Root directory of your project ('./').
  outputDirectory: './dist',
  // Directory where the final files will be saved.
  // Default: './triven'.
  lang: 'pt-BR',
  // Used as default language for articles and homepage.
  // Default: en-US.
  homepagePostIntroType: 'description',
  // Content to be used as post introduction on homepage.
  // Options:
  // 1. Post Excerpt: 'excerpt'
  // 2. Post Description: 'description'
  // Default: 'excerpt'.
  // Note: Excerpts are automatically generated using
  // the first 340 characters of the post body.
  articleVars: {
    // You can optionally set variables in your articles
    // to be replaced with custom values in build time:
    someCustomHtml: '<div class="my-custom-element">Hello!</div>',
    // If a variable depends on the page language,
    // you can set a function as value to handle any custom logic:
    customButtonText: lang => lang == 'pt-BR' ? 'Enviar' : 'Send'
  },
  templates: {
    article: './some/path/to/article/template.html',
    // You can optionally set an HTML file as template for articles
    homepage: './some/path/to/homepage/template.html',
    // You can optionally set an HTML file as template for homepage
    vars: {
      // You can optionally set variables in your templates
      // to be replaced with custom values in build time:
      someVar: 'someValue',
      // If a variable depends on the page language,
      // you can set a function as value to handle any custom logic:
      greet: lang => lang == 'pt-BR' ? 'Olá' : 'Hello!'
    }
  },
  // You can optionally set custom translations for labels used by Triven:
  translations: {
    'en-US': {
      availableRSSFeeds: 'RSS Feed options',      // Default: 'Available RSS Feeds'
      availableLanguages: 'Language options',     // Default: 'Available languages'
      currentLanguage: 'Selected language',       // Default: 'Current language'
      multiLanguage: 'All languages',             // Default: 'Multi-language'
      newer: 'Previous page',                     // Default: 'Newer'
      older: 'Next page',                         // Default: 'Older'
      readMore: 'Keep reading',                   // Default: 'Read more'
      rssFeed: 'Feed',                            // Default: 'RSS Feed'
      rssFeeds: 'Feeds',                          // Default: 'RSS Feeds'
      seeAllPosts: 'All publications'             // Default: 'See all posts'
    },
    // You can add specific-language dictionaries if you have a multi-language blog:
    'pt-BR': {
      // Portuguese translations
    }
  },
  formatters: {
    // You can optionally set a custom date formatter.
    // Formatter will receive the date string and the language set on the
    // respective post markdown file.
    // By default, date format will be month/day/year for US English posts and
    // day/month/year for any other language.
    date: (isoDateString, lang) => {
      const [year, month, day] = isoDateString.split('-');
      const date = new Date(parseInt(year), parseInt(month)-1, parseInt(day), 0);
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      return Intl.DateTimeFormat(lang, options).format(date);
    }
  }
}
```

### Markdown Articles

You can prefix your Markdown articles with a header containing some metadata:

| Name | Description | Default Value |
|------|-------------|---------------|
| title | Title for your post | Untitled |
| lang | Language which your article is written in | language set on `triven.config.js` or en-US |
| date | Date expressed according to ISO 8601 (YYYY-MM-DD) | None |
| description | A brief description of your post (used in HTML meta tags) | None |
| keywords | Keywords for your post (used in HTML meta tags) | None |
| image | Relative path to an image to be used on social media | None |
| imageAlt | Description for the image to be used on social media | None |
| unlisted | Set as `true` to keep the post out of homepages | None |
| externalUrl | URL for a post published in an external website | None |
| excerpt | An optional text representing the first paragraphs of your post | First 340 chars of your post |

**Important:** Do not forget to separate your article from its metadata with three dashes.

#### Markdown Example

```
// hello-world.md

title: Hello World!
date: 2021-08-20
description: Saying hello to the world.
keywords: hello, world
image: ./greeting.png
imageAlt: A person waving hands

---

It's very easy to get started with Triven.
```

### Custom Templates

You can define your own HTML to be used as template for homepage and article. Just make sure that your HTML contain at least the following markup:

#### Homepage

``` html
<!DOCTYPE html>
<html>
  <head></head>
  <body>
    {{ triven:posts }}
    {{ triven:settings }}
  </body>
</html>
```

- `triven:posts`: List of posts.
- `triven:settings`: Language and RSS selectors (for multi-language blogs).

#### Article

``` html
<!DOCTYPE html>
<html>
  <head></head>
  <body>
    {{ triven:article }}
    {{ triven:footer }}
  </body>
</html>
```

- `triven:article`: Post content.
- `triven:footer`: Container for the "See all posts" link.

You can optionally set variables in your templates to be replaced in build time. To do so, you need define them as key/value pairs in your `triven.config.js`, and reference them in your template HTML file as follow:

``` javascript
// triven.config.js

const date = new Date();

module.exports = {
  templates: {
    vars: {
      copywrite: `©${date.getFullYear()} Triven`
    }
  }
}
```

``` html
<!DOCTYPE html>
<html>
  <head></head>
  <body>
    {{ triven:posts }}
    {{ triven:settings }}
    <footer>
      {{ copywrite }}
    </footer>
  </body>
</html>
```

**Note:** Variables in templates are *space insensitive*. You can write them as `{{copywrite}}` or `{{ copywrite }}`.

## Contributing

If you want to contribute to this project, follow [these instructions](CONTRIBUTING.md).
