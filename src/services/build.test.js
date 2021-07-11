const fs = require('fs');
const path = require('path');
const articleService = require('./article');
const { fileService } = require('./file');
const configService = require('./config');
const dateService = require('./date');
const domService = require('./dom');
const homepageService = require('./homepage');
const buildService = require('./build');

describe('Build Service', () => {
  function buildPathToMarkdownMock(){
    return path.join(__dirname, '../mocks/new-year.md');
  }

  beforeEach(() => {
    console.log = jest.fn();
    fileService.write = jest.fn((path, data, onSuccess) => onSuccess && onSuccess());
    fileService.copySync = jest.fn();
    homepageService.build = jest.fn();
  });

  it('should create a demo post if no markdown files have been found on source directory', done => {
    fileService.collect = jest.fn((pattern, onSuccess) => {
      const filepaths = fileService.collect.mock.calls.length === 1 ? [] : [buildPathToMarkdownMock()];
      onSuccess(filepaths);
    });
    const post = fs.readFileSync(path.join(__dirname, '../templates/introducing-triven.md'), 'utf-8');
    const date = dateService.buildTodayISODate();
    const { sourceDirectory } = configService.get();
    buildService.init(() => {
      expect(console.log).toHaveBeenCalledWith('Building files...');
      expect(fileService.collect).toHaveBeenCalledWith(`${sourceDirectory}/**/*.md`, expect.any(Function));
      expect(fileService.write).toHaveBeenCalledWith(`${sourceDirectory}/introducing-triven.md`, post.replace('{date}', date), expect.any(Function));
      expect(console.log).toHaveBeenCalledWith('Files successfully built!');
      done();
    });
  });

  it('should convert markdown files to html files if markdown files have been found on source directory', done => {
    fileService.collect = jest.fn((pattern, onSuccess) => onSuccess([buildPathToMarkdownMock()]));
    const data = domService.minifyHTML(`
<!DOCTYPE html>
<html dir="ltr" lang="en-US">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
    <link rel="stylesheet" href="assets/triven-09bc413584c654bbd435f02cf242839d.css">
    <title>New year!</title>
    <meta name="description" content="" />
    <meta name="keywords" content="" />
  </head>
  <body>
    <main class="tn-main">
      <article class="tn-article">
        <header class="tn-header">
          <h1 class="tn-post-title">New year!</h1>
          <p class="tn-date">1/1/2022</p>
        </header>
        <p>Happy new year!</p>
        <h2>What to do next</h2>
        <p>I don't know</p>
        <h3>Really?</h3>
        <p>Yes.</p>
        <footer class="tn-footer">
          <a href=".">See all posts</a>
        </footer>
      </article>
    </main>
  </body>
</html>
`.trim());
    const { sourceDirectory, outputDirectory } = configService.get();
    buildService.init(() => {
      expect(fileService.write).not.toHaveBeenCalledWith(`${sourceDirectory}/hello-world.md`, expect.any(String));
      expect(fileService.write).toHaveBeenCalledWith(`${outputDirectory}/new-year.html`, data);
      done();
    });
  });

  it('should convert markdown files to html files even if no metada has been found', done => {
    fileService.collect = jest.fn((pattern, onSuccess) => onSuccess([path.join(__dirname, '../mocks/no-metadata.md')]));
    const data = domService.minifyHTML(`
<!DOCTYPE html>
<html dir="ltr" lang="en-US">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
    <link rel="stylesheet" href="assets/triven-09bc413584c654bbd435f02cf242839d.css">
    <title>Untitled</title>
    <meta name="description" content="" />
    <meta name="keywords" content="" />
  </head>
  <body>
    <main class="tn-main">
      <article class="tn-article">
        <header class="tn-header">
          <h1 class="tn-post-title">Untitled</h1>
          <p class="tn-date"></p>
        </header>
        <p>This is a paragraph.</p>
        <footer class="tn-footer">
          <a href=".">See all posts</a>
        </footer>
      </article>
    </main>
  </body>
</html>
`.trim());
    const { outputDirectory } = configService.get();
    buildService.init(() => {
      expect(fileService.write).toHaveBeenCalledWith(`${outputDirectory}/no-metadata.html`, data);
      done();
    });
  });

  it('should not save an html file to article if it is an external article', done => {
    fileService.collect = jest.fn((pattern, onSuccess) => onSuccess([path.join(__dirname, '../mocks/external-article.md')]));
    const { outputDirectory } = configService.get();
    buildService.init(() => {
      expect(fileService.write).not.toHaveBeenCalledWith(`${outputDirectory}/external-article.html`, expect.any(String));
      done();
    });
  });

  it('should build homepage', done => {
    fileService.collect = jest.fn((pattern, onSuccess) => onSuccess([buildPathToMarkdownMock()]));
    const { outputDirectory } = configService.get();
    const { summary } = articleService.build(path.join(__dirname, '../mocks/new-year.md'));
    buildService.init(() => {
      expect(homepageService.build).toHaveBeenCalledWith([summary], outputDirectory);
      done();
    });
  });

  it('should save a JSON containing all post summaries', done => {
    fileService.collect = jest.fn((pattern, onSuccess) => onSuccess([buildPathToMarkdownMock()]));
    const { outputDirectory } = configService.get();
    const { summary } = articleService.build(path.join(__dirname, '../mocks/new-year.md'));
    buildService.init(() => {
      expect(fileService.write).toHaveBeenCalledWith(`${outputDirectory}/posts.json`, JSON.stringify([summary]));
      done();
    });
  });
});
