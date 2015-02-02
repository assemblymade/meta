'use strict';

jest.dontMock(appFile('actions/router'));
jest.dontMock('url');

const url = require('url');

const routerPath = appFile('actions/router');
const mockParse = function _parse() {};

describe('Router', () => {
  global.Dispatcher = require(appFile('dispatcher'));
  let page;
  let router;

  beforeEach(() => {
    page = require('page');
    router = require(routerPath);
  });

  it('initializes `page`', () => {
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
