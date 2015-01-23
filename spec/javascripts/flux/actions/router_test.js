'use strict';

jest.dontMock(appFile('actions/router'));
jest.dontMock('url');

const Router = require(appFile('actions/router'));

describe('Router', () => {
  it('instantiates a Router', () => {
    let router = new Router('actionType', []);

    expect(router instanceof Router).toBe(true);
  });
});
