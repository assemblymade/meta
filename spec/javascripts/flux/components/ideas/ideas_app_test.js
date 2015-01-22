jest.dontMock(appFile('components/ideas/ideas_app.js.jsx'));
jest.dontMock('url');

describe('IdeasApp', function() {
  beforeEach(function() {
    Dispatcher = require(pathToFile('dispatcher'));
  });

  it("renders null by default", function() {
    var IdeasApp = require(appFile('components/ideas/ideas_app.js.jsx'));
    var ideasApp = TestUtils.renderIntoDocument(
      <IdeasApp />
    );

    expect(ideasApp.render()).toEqual(null);
  });

  it("renders the component that it's passed", function() {
    var IdeasApp = require(appFile('components/ideas/ideas_app.js.jsx'));
    var ideasApp = TestUtils.renderIntoDocument(
      <IdeasApp />
    );
    var fakeComponent = <main className="mock-component" />;

    ideasApp.setState({
      component: fakeComponent
    });

    var app = TestUtils.findRenderedDOMComponentWithClass(
      ideasApp,
      'mock-component'
    );

    expect(app).toBeDefined();
    expect(ideasApp.render()).toEqual(fakeComponent);
  });
});
