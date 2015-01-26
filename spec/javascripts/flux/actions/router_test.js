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

  it('initializes `page` and navigates to the current window.location', () => {
    router.navigate = jest.genMockFn();

    router.initialize();

    expect(page).toBeCalledWith('*', mockParse);
    expect(page.start).toBeCalled();
    expect(router.navigate).toBeCalledWith(
      url.parse(window.location.toString()).path
    );
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
