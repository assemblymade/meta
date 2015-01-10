var Footer = require('../ui/footer.js.jsx');
var IdeaTile = require('./idea_tile.js.jsx');
var IdeasStore = require('../../stores/ideas_store');
var Pagination = require('../pagination/pagination.js.jsx');
var UserStore = require('../../stores/user_store');

var IdeasIndex = React.createClass({
  displayName: 'IdeasIndex',

  propTypes: {
    navigate: React.PropTypes.func.isRequired,
    params: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    query: React.PropTypes.object
  },

  componentDidMount: function() {
    IdeasStore.addChangeListener(this.getIdeas);
  },

  componentWillUnmount: function() {
    IdeasStore.removeChangeListener(this.getIdeas);
  },

  getDefaultProps: function() {
    return {
      currentUser: UserStore.getUser() || {}
    };
  },

  getIdeas: function() {
    this.setState({
      ideas: IdeasStore.getIdeas()
    });
  },

  getInitialState: function() {
    return {
      ideas: IdeasStore.getIdeas()
    }
  },

  render: function() {
    var navigate = this.props.navigate;

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
                      <a href="/ideas?filter=trending"
                        onClick={navigate.bind(null, '/ideas?filter=trending')}>
                        Trending
                      </a>
                    </li>

                    <li>
                      <a href="/ideas?sort=newness"
                        onClick={navigate.bind(null, '/ideas?sort=newness')}>
                        New
                      </a>
                    </li>

                    <li>
                      <a href="/ideas?filter=greenlit"
                        onClick={navigate.bind(null, '/ideas?filter=greenlit')}>
                        Greenlit
                      </a>
                    </li>

                    <li className="dropdown">
                      <a className="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-expanded="false">
                        Topics <span className="caret"></span>
                      </a>
                      <ul className="dropdown-menu" role="menu">
                        <li>
                          <a href="/ideas?mark=design"
                            onClick={navigate.bind(null, '/ideas?mark=design')}>
                            Design
                          </a>
                        </li>
                        <li>
                          <a href="/ideas?mark=saas"
                            onClick={navigate.bind(null, '/ideas?mark=saas')}>
                            SaaS
                          </a>
                        </li>
                        <li>
                          <a href="/ideas?mark=b2b"
                            onClick={navigate.bind(null, '/ideas?mark=b2b')}>
                            B2B
                          </a>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </nav>
              <div className="main">
                <div className="grid fixed-small">
                  {this.renderIdeas()}
                </div>
              </div>
            </div>

            <Footer>
              <nav>
                <Pagination actionCall={navigate} />
              </nav>
            </Footer>
          </div>
        </section>
      </main>
    );
  },

  renderIdeas: function() {
    var ideas = this.state.ideas;
    var IdeaFactory = React.createFactory(IdeaTile);

    if (ideas.length) {
      return ideas.map(function(idea) {
        return IdeaFactory({ idea: idea });
      });
    }
  },

  renderMyIdeas: function() {
    var navigate = this.props.navigate;
    var username = this.props.currentUser.username;

    if (username) {
      return (
        <li>
          <a href="javascript:void(0);"
            onClick={navigate.bind(null, '/ideas?user=' + username)}>
            My Ideas
          </a>
        </li>
      );
    }
  }
});

module.exports = IdeasIndex;
