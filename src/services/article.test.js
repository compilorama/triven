const path = require('path');
const configService = require('./config');
const { fileService } = require('./file');
const postsService = require('./posts');
const { mockTrivenConfig } = require('./testing');
const articleService = require('./article');

describe('Articles Service', () => {
  beforeEach(() => {
    fileService.write = jest.fn();
    fileService.copySync = jest.fn();
    console.log = jest.fn();
  });

  it('should copy relative images to assets directory and update its source in markup', () => {
    const filepaths = [path.join(__dirname, '../mocks/images.md')];
    const { outputDirectory } = configService.get();
    const [postData] = postsService.buildData(filepaths);
    const { article } = articleService.build(postData);
    const expectedFilename = 'varejao-a8774002d2f7fef27b27f665c7e7227c.jpeg';
    expect(article).toContain(`<img src="../a/${expectedFilename}" alt="Adriana Varejão Gallery">`);
    expect(fileService.copySync).toHaveBeenCalledWith(
      `${path.join(__dirname, '../mocks/varejao.jpeg')}`,
      `${outputDirectory}/a/${expectedFilename}`
    );
  });

  it('should copy relative videos to assets directory and update its source in markup', () => {
    const filepaths = [path.join(__dirname, '../mocks/videos.md')];
    const { outputDirectory } = configService.get();
    const [postData] = postsService.buildData(filepaths);
    const { article } = articleService.build(postData);
    const expectedFilename1 = 'commit-drop_720-09a0ccc709a17980d75d18010411d100.mp4';
    const expectedFilename2 = 'commit-rename_720-4b4c472f211eefbafeb0d04ad0314476.mp4';
    expect(article).toContain(`<source src="../a/${expectedFilename1}" type="video/mp4">`);
    expect(article).toContain(`<video src="../a/${expectedFilename2}" width="720" height="498">`);
    expect(fileService.copySync).toHaveBeenCalledWith(
      `${path.join(__dirname, '../mocks/commit-drop_720.mp4')}`,
      `${outputDirectory}/a/${expectedFilename1}`
    );
    expect(fileService.copySync).toHaveBeenCalledWith(
      `${path.join(__dirname, '../mocks/commit-rename_720.mp4')}`,
      `${outputDirectory}/a/${expectedFilename2}`
    );
  });

  it('should copy relative webp images to assets directory and update its source in markup', () => {
    const filepaths = [path.join(__dirname, '../mocks/webp.md')];
    const { outputDirectory } = configService.get();
    const [postData] = postsService.buildData(filepaths);
    const { article } = articleService.build(postData);
    const expectedFilename1 = 'recherchez-085e95e66df37411335e9f1cc8b74ed3.webp';
    const expectedFilename2 = 'recherchez-ca5536576fd5b8542f84af0a32ad8821.png';
    expect(article).toContain(`<source srcset="../a/${expectedFilename1}" type="image/webp">`);
    expect(article).toContain(`<source srcset="../a/${expectedFilename2}" type="image/png">`);
    expect(article).toContain(`<img alt="alt" src="../a/${expectedFilename2}">`);
    expect(fileService.copySync).toHaveBeenCalledWith(
      `${path.join(__dirname, '../mocks/recherchez.webp')}`,
      `${outputDirectory}/a/${expectedFilename1}`
    );
    expect(fileService.copySync).toHaveBeenCalledWith(
      `${path.join(__dirname, '../mocks/recherchez.png')}`,
      `${outputDirectory}/a/${expectedFilename2}`
    );
  });

  it('should See All Posts link point to root if blog contains just one language', () => {
    const filepaths = [path.join(__dirname, '../mocks/images.md')];
    const [postData] = postsService.buildData(filepaths);
    const { article } = articleService.build(postData, ['en-US']);
    expect(article).toContain('<a href="../">See all posts</a>');
  });

  it('should See All Posts link point to language-specif homepage if blog contains more than one language', () => {
    const filepaths = [path.join(__dirname, '../mocks/images.md')];
    const [postData] = postsService.buildData(filepaths);
    const { article } = articleService.build(postData, ['en-US', 'pt-BR']);
    expect(article).toContain('<a href="../l/en-US">See all posts</a>');
  });

  it('should optionally use custom translation for labels', () => {
    mockTrivenConfig({ translations: { 'pt-BR': { seeAllPosts: 'Todas as publicações' } } });
    const filepaths = [path.join(__dirname, '../mocks/portuguese.md')];
    const [postData] = postsService.buildData(filepaths);
    const { article } = articleService.build(postData, ['en-US', 'pt-BR']);
    expect(article).toContain('<a href="../l/pt-BR">Todas as publicações</a>');
  });

  it('should optionally use custom date formatter', () => {
    mockTrivenConfig({ formatters: { date: (isoDateString, lang) => `${isoDateString} ${lang}` } });
    const filepaths = [path.join(__dirname, '../mocks/new-year.md')];
    const [postData] = postsService.buildData(filepaths);
    const { article } = articleService.build(postData, ['en-US']);
    expect(article).toContain([
      '<time class="tn-date" itemprop="dateCreated pubdate datePublished" datetime="2022-01-01">',
      '2022-01-01 en-US',
      '</time>'
    ].join(''));
  });

  it('should add meta tags to avoid indexation and link-following for unlisted posts', () => {
    const filepaths = [path.join(__dirname, '../mocks/unlisted.md')];
    const [postData] = postsService.buildData(filepaths);
    const { article } = articleService.build(postData, ['en-US']);
    expect(article).toContain('<meta name="robots" content="noindex, nofollow">');
  });

  it('should replace custom article variables', () => {
    mockTrivenConfig({
      articleVars: {
        regularVar: '<p>123</p>',
        extraSpacedVar: lang => `<p>${lang}</p>`,
        noSpaceVar: '<div>456</div>'
      }
    });
    const filepaths = [path.join(__dirname, '../mocks/article-vars.md')];
    const [postData] = postsService.buildData(filepaths);
    const { article } = articleService.build(postData, ['en-US']);
    expect(article).toContain('<p>123</p>');
    expect(article).toContain('<p>en-US</p>');
    expect(article).toContain('<div>456</div>');
  });
});
