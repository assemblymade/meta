jest.dontMock(appFile('components/ui/carousel.js.jsx'));

describe('Carousel', function() {
  var findImageWithSrc = function(images, src) {
    for (var i = 0; i < images.length; i++) {
      if (images[i].props.src === src) {
        return images[i];
      }
    }

    return false;
  };

  global.Dispatcher = require(appFile('dispatcher'));

  it('does not render thumbnails if passed only one image src', function() {
    var Carousel = require(appFile('components/ui/carousel.js.jsx'));
    var carousel = TestUtils.renderIntoDocument(
      <Carousel images={['billy-bigelow.png']} />
    );

    var img = TestUtils.findRenderedDOMComponentWithTag(
      carousel,
      'img'
    );

    expect(img.props.src).toEqual('billy-bigelow.png');
  });

  it('renders thumbnails if passed more than one image src', function() {
    var Carousel = require(appFile('components/ui/carousel.js.jsx'));
    var carousel = TestUtils.renderIntoDocument(
      <Carousel images={['billy-bigelow.png', 'julie-jordan.png']} />
    );

    var imgs = TestUtils.scryRenderedDOMComponentsWithTag(
      carousel,
      'img'
    );

    var billy = findImageWithSrc(imgs, 'billy-bigelow.png');
    var julie = findImageWithSrc(imgs, 'julie-jordan.png');

    expect(billy).toBeTruthy();
    expect(julie).toBeTruthy();
    expect(julie.props.style.maxWidth).toEqual(100);
  });

  it('changes the focus image when a thumbnail is clicked', function() {
    var Carousel = require(appFile('components/ui/carousel.js.jsx'));
    var carousel = TestUtils.renderIntoDocument(
      <Carousel images={['billy-bigelow.png', 'julie-jordan.png']} />
    );

    var links = TestUtils.scryRenderedDOMComponentsWithTag(
      carousel,
      'a'
    );

    TestUtils.Simulate.click(links[1]);

    expect(carousel.state.currentFocusIndex).toEqual(1);

    var imgs = TestUtils.scryRenderedDOMComponentsWithTag(
      carousel,
      'img'
    );

    var billy = findImageWithSrc(imgs, 'billy-bigelow.png');
    var julie = findImageWithSrc(imgs, 'julie-jordan.png');

    expect(billy).toBeTruthy();
    expect(julie).toBeTruthy();
    expect(billy.props.style.maxWidth).toEqual(100);
    expect(julie.props.style.width).toEqual('100%');
  });
});
