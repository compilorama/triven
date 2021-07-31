const postsMock = require('../mocks/posts');
const { fileService } = require('./file');
const pageService = require('./page');
const homepageService = require('./homepage');

describe('Homepage Service', () => {
  function stubPageBuild(){
    const html = '<p>some content</p>';
    pageService.build = jest.fn(() => html);
    return { html };
  }

  function buildFakeOutputDirectoryFilepath(){
    return 'some/output/dir';
  }

  beforeEach(() => {
    fileService.write = jest.fn();
    fileService.copySync = jest.fn();
    pageService.build = jest.fn();
  });

  it('should build pages ordered by descending date', () => {
    const [first, second, third] = postsMock;
    const orderedPosts = [second, third, first];
    homepageService.build(postsMock, '');
    expect(pageService.build).toHaveBeenCalledWith(orderedPosts, { page: 1, total: 1, assetsDirPrefix: '' });
  });

  it('should save home page files according to their page numbers', () => {
    const outputDirectory = buildFakeOutputDirectoryFilepath();
    const postsMock = new Array(25);
    const { html } = stubPageBuild();
    homepageService.build(postsMock.fill({ some: 'postSummary' }), outputDirectory);
    expect(pageService.build).toHaveBeenCalledWith(expect.any(Array), { page: 1, total: 3, assetsDirPrefix: '' });
    expect(fileService.write).toHaveBeenCalledWith(`${outputDirectory}/index.html`, html);
    expect(pageService.build).toHaveBeenCalledWith(expect.any(Array), { page: 2, total: 3, assetsDirPrefix: '../../' });
    expect(fileService.write).toHaveBeenCalledWith(`${outputDirectory}/p/2/index.html`, html);
    expect(pageService.build).toHaveBeenCalledWith(expect.any(Array), { page: 3, total: 3, assetsDirPrefix: '../../' });
    expect(fileService.write).toHaveBeenCalledWith(`${outputDirectory}/p/3/index.html`, html);
  });

  it('should write a home page file for each language', () => {
    const outputDirectory = buildFakeOutputDirectoryFilepath();
    const { html } = stubPageBuild();
    homepageService.build(postsMock, outputDirectory);
    expect(fileService.write).toHaveBeenCalledWith(`${outputDirectory}/l/en-US/index.html`, html);
    expect(fileService.write).toHaveBeenCalledWith(`${outputDirectory}/l/pt-BR/index.html`, html);
  });

  it('should save language-specific home page files according to their page numbers', () => {
    const outputDirectory = buildFakeOutputDirectoryFilepath();
    const englishPostsMock = new Array(12);
    const portuguesePostsMock = new Array(12);
    const allPostsMock = [...englishPostsMock.fill({ lang: 'en-US' }), ...portuguesePostsMock.fill({ lang: 'pt-BR' })];
    const { html } = stubPageBuild();
    homepageService.build(allPostsMock, outputDirectory);
    expect(pageService.build).toHaveBeenCalledWith(expect.any(Array), { page: 1, total: 2, assetsDirPrefix: '../../', customLang: 'en-US' });
    expect(fileService.write).toHaveBeenCalledWith(`${outputDirectory}/l/en-US/index.html`, html);
    expect(pageService.build).toHaveBeenCalledWith(expect.any(Array), { page: 2, total: 2, assetsDirPrefix: '../../../../', customLang: 'en-US' });
    expect(fileService.write).toHaveBeenCalledWith(`${outputDirectory}/l/en-US/p/2/index.html`, html);
    expect(pageService.build).toHaveBeenCalledWith(expect.any(Array), { page: 1, total: 2, assetsDirPrefix: '../../', customLang: 'pt-BR' });
    expect(fileService.write).toHaveBeenCalledWith(`${outputDirectory}/l/pt-BR/index.html`, html);
    expect(pageService.build).toHaveBeenCalledWith(expect.any(Array), { page: 2, total: 2, assetsDirPrefix: '../../../../', customLang: 'pt-BR' });
    expect(fileService.write).toHaveBeenCalledWith(`${outputDirectory}/l/pt-BR/p/2/index.html`, html);
  });
});
