'use strict';

jest.dontMock(appFile('actions/router'));
jest.dontMock('url');

const url = require('url');

const routerPath = appFile('actions/router');
const mockParse = function _parse() {};

describe('Router', () => {
  let page;
  let router;

  beforeEach(() => {
    page = require('page');
    router = new (require(routerPath))('actionType', []);
  });

  it('instantiates a Router', () => {
    expect(router instanceof require(routerPath)).toBe(true);
  });

  it('initializes `page`', () => {
    router.navigate = jest.genMockFn();

    router.initialize();

    expect(page).toBeCalledWith('*', mockParse);
  });

  it('navigates using `page`', () => {
    router.navigate('/barf');

    expect(page).toBeCalledWith('/barf');
  });

  it('stops page when told', () => {
    router.stop();

    expect(page.stop).toBeCalled();
  });
});
