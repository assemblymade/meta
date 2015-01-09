var CONSTANTS = window.CONSTANTS;
var ActionTypes = CONSTANTS.ActionTypes;

var Footer = require('../ui/footer.js.jsx');
var IdeasRouter = require('./ideas_router');
var IdeasStore = require('../../stores/ideas_store');
var Pagination = require('../pagination/pagination.js.jsx');
var UserStore = require('../../stores/user_store');

var Ideas = React.createClass({
  displayName: 'Ideas',

  componentDidMount: function() {
    IdeasStore.addChangeListener(this.getComponentAndContext);

    // The router will have fired before the component mounted, so we need
    // to call `navigate` after mounting
    IdeasRouter.navigate(window.location);
  },

  componentWillUnmount: function() {
    IdeasStore.removeChangeListener(this.getComponentAndContext);
    IdeasRouter.stop();
  },

  getComponentAndContext: function() {
    var Component = IdeasStore.getComponent();
    var context = IdeasStore.getContext();

    this.setState({
      component: <Component params={context.params} query={context.query} />
    });
  },

  getDefaultProps: function() {
    return {
      user: UserStore.getUser() || {}
    };
  },

  getInitialState: function() {
    return {
      component: <div />
    }
  },

  navigate: function(url) {
    IdeasRouter.navigate(url);
  },

  render: function() {
    return (
      <main role="main">
        <section className="_hero hero-ideas">
          <div className="container">
            <div className="header">
              <img src="../assets/ideas/ideas-header-morse.png" />
            </div>
            <div className="main">
              <h1>
                The best product ideas &mdash; built by all of us.
              </h1>
              <button type="button" className="_button pill theme-green shadow text-shadow border">
                <span className="title">Add your product idea</span>
              </button>
            </div>
            <div className="footer">
              <p>
                Get feedback on your ideas, as they gain momentum and popularity we'll greenlight the idea &mdash; ready to be built on Assembly.
              </p>
              <div className="text-3">
                <a href="#">Learn More</a>
              </div>
            </div>
          </div>
        </section>

        <section className="tile-grid tile-grid-ideas">
          <div className="container">
            <div className="header">
              <nav className="tile-grid-nav">
                <div className="item">
                  <ul className="nav nav-pills">
                    {this.renderMyIdeas()}

                    <li>
                      <a href="javascript:void(0);"
                          onClick={this.navigate.bind(null, '/ideas?filter=trending')}>
                        Trending
                      </a>
                    </li>

                    <li>
                      <a href="javascript:void(0);"
                          onClick={this.navigate.bind(null, '/ideas?sort=newness')}>
                        New
                      </a>
                    </li>

                    <li>
                      <a href="javascript:void(0);"
                          onClick={this.navigate.bind(null, '/ideas?filter=greenlit')}>
                        Greenlit
                      </a>
                    </li>

                    <li className="dropdown">
                      <a className="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-expanded="false">
                        Topics <span className="caret"></span>
                      </a>
                      <ul className="dropdown-menu" role="menu">
                        <li>
                          <a href="javascript:void(0);"
                              onClick={this.navigate.bind(null, '/ideas?mark=design')}>
                            Design
                          </a>
                        </li>
                        <li>
                          <a href="javascript:void(0);"
                              onClick={this.navigate.bind(null, '/ideas?mark=saas')}>
                            SaaS
                          </a>
                        </li>
                        <li>
                          <a href="javascript:void(0);"
                              onClick={this.navigate.bind(null, '/ideas?mark=b2b')}>
                            B2B
                          </a>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
            {this.state.component}
            <Footer>
              <nav>
                <Pagination actionCall={IdeasRouter.navigate} />
              </nav>
            </Footer>
          </div>
        </section>
      </main>
    );
  },

  renderMyIdeas: function() {
    var username = this.props.user.username;

    if (username) {
      return (
        <li>
          <a href="javascript:void(0);"
            onClick={this.navigate.bind(null, '/ideas?user=' + username)}>
            My Ideas
          </a>
        </li>
      );
    }
  }
});

window.Ideas = Ideas;
