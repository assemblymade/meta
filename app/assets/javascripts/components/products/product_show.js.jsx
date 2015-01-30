var Avatar = require('../ui/avatar.js.jsx');
var Button = require('../ui/button.js.jsx');
var Carousel = require('../ui/carousel.js.jsx');
var Icon = require('../ui/icon.js.jsx');
var ProductHeader = require('./product_header.js.jsx');
var ProductStore = require('../../stores/product_store');
var Tile = require('../ui/tile.js.jsx');
var UserStore = require('../../stores/user_store');

var ProductShow = React.createClass({
  propTypes: {
    navigate: React.PropTypes.func.isRequired,
    params: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    query: React.PropTypes.object
  },

  getInitialState() {
    return {
      product: ProductStore.getProduct()
    }
  },

  render() {
    var product = this.state.product;
    var user = UserStore.getUser();
    var leftColumnClasses = React.addons.classSet({
      col: true,
      'col-9': true,
      'mx-auto': true,
      'px4': true
    });

    var rightColumnClasses = React.addons.classSet({
      'col': true,
      'col-3': true,
      'px2': true
    });

    var style = {
      importantLinks: {
        borderColor: '#dbdee3'
      }
    };

    return (
      <div>
        <ProductHeader product={product} />

        <div className="clearfix px4">
          <div className={leftColumnClasses}>
            <div className="left mb2">
              <a href="#" className="gray-2"><Icon icon="pencil" /> Edit product details</a>
            </div>
          </div>
        </div>

        <div className="clearfix px4">
          <div className={leftColumnClasses}>
            <Tile>
              <Carousel images={['http://placekitten.com/900/500', 'http://www.fillmurray.com/200/300', 'http://www.fillmurray.com/200/300']} />

              <div className="clearfix p4">
                <h5 className="mt0 mb2" style={{ fontSize: 16 }}>
                  Vestibulum id ligula porta felis euismod semper. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.
                </h5>

                <p className="gray-1" style={{ fontSize: 16, lineHeight: '2.3rem' }}>
                  Donec ullamcorper nulla non metus auctor fringilla. Nullam id dolor id nibh ultricies vehicula ut id elit. Donec ullamcorper nulla non metus auctor fringilla. Donec sed odio dui. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.
                </p>

                <div className="clearfix py1">
                  <div className="col col-6" style={{ paddingRight: '4rem' }}>
                    <h6 className="mt0 mb0">Goals</h6>
                    <p className="gray-1">
                      Aenean eu leo quam. Pellentesque ornare sem lacinia quam
                      venenatis vestibulum. Vestibulum id ligula porta felis
                      euismod semper. Lorem ipsum dolor sit amet, consectetur
                      adipiscing elit.
                    </p>
                  </div>

                  <div className="col col-6" style={{ paddingRight: '4rem' }}>
                    <h6 className="mt0 mb0">Competing Products</h6>
                    <p className="gray-1">
                      Aenean eu leo quam. Pellentesque ornare sem lacinia quam
                      venenatis vestibulum. Vestibulum id ligula porta felis
                      euismod semper. Lorem ipsum dolor sit amet, consectetur
                      adipiscing elit.
                    </p>
                  </div>
                </div>

                <div className="clearfix py1">
                  <div className="col col-6" style={{ paddingRight: '4rem' }}>
                    <h6 className="mt0 mb0">Key Features</h6>
                    <p className="gray-1">
                      Aenean eu leo quam. Pellentesque ornare sem lacinia quam
                      venenatis vestibulum. Vestibulum id ligula porta felis
                      euismod semper. Lorem ipsum dolor sit amet, consectetur
                      adipiscing elit.
                    </p>
                  </div>

                  <div className="col col-6" style={{ paddingRight: '4rem' }}>
                    <h6 className="mt0 mb0">Competitive Advantage</h6>
                    <p className="gray-1">
                      Aenean eu leo quam. Pellentesque ornare sem lacinia quam
                      venenatis vestibulum. Vestibulum id ligula porta felis
                      euismod semper. Lorem ipsum dolor sit amet, consectetur
                      adipiscing elit.
                    </p>
                  </div>
                </div>

                <div className="clearfix py1">
                  <div className="col col-6" style={{ paddingRight: '4rem' }}>
                    <h6 className="mt0 mb0">Target Audience</h6>
                    <p className="gray-1">
                      Aenean eu leo quam. Pellentesque ornare sem lacinia quam
                      venenatis vestibulum. Vestibulum id ligula porta felis
                      euismod semper. Lorem ipsum dolor sit amet, consectetur
                      adipiscing elit.
                    </p>
                  </div>

                  <div className="col col-6" style={{ paddingRight: '4rem' }}>
                    <h6 className="mt0 mb0">Monetization Strategy</h6>
                    <p className="gray-1">
                      Aenean eu leo quam. Pellentesque ornare sem lacinia quam
                      venenatis vestibulum. Vestibulum id ligula porta felis
                      euismod semper. Lorem ipsum dolor sit amet, consectetur
                      adipiscing elit.
                    </p>
                  </div>
                </div>
              </div>
            </Tile>
          </div>

          <div className={rightColumnClasses}>
            <Tile>
              {this.renderCommunityBuiltNotice()}
              <div className="border-bottom">
                <div className="px3 py2">
                  <h5 className="mt0 mb1">Build Kitten Mittens® with us!</h5>
                  <span className="gray-1">
                    Vivamus sagittis lacus vel augue laoreet rutrum faucibus
                    dolor auctor. Maecenas faucibus mollis interdum. Cras mattis
                    consectetur purus sit amet fermentum.
                  </span>
                </div>
              </div>

              {this.renderMostActiveUsers()}

              <div className="bg-gray-6">
                <div className="p3 center">
                  <a href="#" className="block">
                    <Button type="default" action={function() {}}>
                      Build with us
                    </Button>
                  </a>

                  <div className="gray-2 py1">
                    or <a href="#">See how Assembly works</a>
                  </div>
                </div>
              </div>
            </Tile>

            <div className="border-bottom mt3" style={style.importantLinks}>
              <h5>Important links</h5>
            </div>

            <div className="border-bottom py2" style={style.importantLinks}>
              <span className="mr2 gray-2">
                <Icon icon="file" />
              </span>
              <a href="#" className="bold">Release 2.0 Milestone</a>
            </div>

            <div className="border-bottom py2" style={style.importantLinks}>
              <span className="mr2 gray-2">
                {/* there's a .user override in the Icon class */}
                <span className="fa fa-user" />
              </span>
              <a href="#" className="bold">Latest community activity</a>
            </div>

            <div className="border-bottom py2" style={style.importantLinks}>
              <span className="mr2 gray-2">
                <Icon icon="comment" />
              </span>
              <a href="#" className="bold">Say hi in chat</a>
            </div>

            <div className="border-bottom py2" style={style.importantLinks}>
              <span className="mr2 gray-2">
                <Icon icon="warning" />
              </span>
              <a href="#" className="bold">File a bug</a>
            </div>

            <div className="border-bottom py2" style={style.importantLinks}>
              <span className="mr2 gray-2">
                <Icon icon="question-circle" />
              </span>
              <a href="#" className="bold">Ask a question</a>
            </div>

            <div className="py2">
              <span className="mr1 gray-2">
                <Icon icon="code" />
              </span>
              <a href="#" className="bold">Source code</a>
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderCommunityBuiltNotice() {
    var product = this.state.product;

    if (product.community_built) {
      return (
        <div className="border-bottom">
          <div className="px3 py2">
            <span className="gray-1">Verified community-built</span>
          </div>
        </div>
      );
    }
  },

  renderMostActiveUsers() {
    var user = UserStore.getUser();

    return (
      <div className="border-bottom">
        <div className="px3 py2">
          <h6 className="mt0 mb1">Most active members</h6>
          <div className="clearfix">
            <span className="left mr2">
              <Avatar user={user} />
            </span>
            <span className="left mr2">
              <Avatar user={user} />
            </span>
            <span className="left mr2">
              <Avatar user={user} />
            </span>
            <span className="left mr2">
              <Avatar user={user} />
            </span>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = ProductShow;
