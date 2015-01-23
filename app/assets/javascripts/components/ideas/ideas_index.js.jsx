var Button = require('../ui/button.js.jsx');
var Footer = require('../ui/footer.js.jsx');
var IdeaTile = require('./idea_tile.js.jsx');
var IdeaAdminStore = require('../../stores/idea_admin_store');
var IdeasStore = require('../../stores/ideas_store');
var NewIdeaModal = require('./new_idea_modal.js.jsx');
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

  componentDidMount() {
    IdeasStore.addChangeListener(this.getIdeas);
  },

  componentWillUnmount() {
    IdeasStore.removeChangeListener(this.getIdeas);
  },

  getDefaultProps() {
    return {
      currentUser: UserStore.getUser() || {}
    };
  },

  getIdeas() {
    this.setState({
      ideas: IdeasStore.getIdeas()
    });
  },

  getInitialState() {
    return {
      ideas: IdeasStore.getIdeas()
    };
  },

  render() {
    var navigate = this.props.navigate;

    var ideasGridStyle = {};

    if (this.state.ideas.length === 1) {
      ideasGridStyle.textAlign = 'left !important';
    }

    return (
      <main role="main">
        {this.renderHeader()}

        <section className="tile-grid tile-grid-ideas" key="ideas-grid">
          <div className="container">
            <div className="header">
              <nav className="tile-grid-nav">
                <div className="item">
                  <ul className="nav nav-pills">
                    {this.renderMyIdeas()}

                    <li key="filter-trending">
                      <a href="/ideas?filter=trending"
                        onClick={navigate.bind(null, '/ideas?filter=trending')}>
                        Trending
                      </a>
                    </li>

                    <li key="filter-newness">
                      <a href="/ideas?sort=newness"
                        onClick={navigate.bind(null, '/ideas?sort=newness')}>
                        New
                      </a>
                    </li>

                    <li key="filter-greenlit">
                      <a href="/ideas?filter=greenlit"
                        onClick={navigate.bind(null, '/ideas?filter=greenlit')}>
                        Greenlit
                      </a>
                    </li>

                    {this.renderTopics()}
                  </ul>
                </div>
              </nav>
              <div className="main" key="main-ideas">
                <div className="clearfix mxn2" style={ideasGridStyle}>
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

  renderHeader() {
    return (
      <section className="_hero hero-ideas" key="ideas-header">
        <div className="container">
          <div className="header" key="hero-header">
            <img src="../assets/ideas/ideas-header-morse.png" />
          </div>
          <div className="main" key="hero-main">
            <h1>
              The best product ideas &mdash; built by all of us.
            </h1>
            <Button type="primary" action={this.props.navigate.bind(null, '/ideas/new')}>Add your product idea</Button>
          </div>
          <div className="footer" key="hero-footer">
            <p>
              Get feedback on your ideas, as they gain momentum and popularity we'll greenlight the idea &mdash; ready to be built on Assembly.
            </p>
            <div className="text-3">
              <a href="/help/basics">Learn more</a>
            </div>
          </div>
        </div>
      </section>
    );
  },

  renderIdeas() {
    var ideas = this.state.ideas;

    if (ideas.length) {
      return ideas.map((idea) => {
        return <div className="sm-col sm-col-4 p2" key={idea.id}>
          <IdeaTile idea={idea} />
        </div>
      });
    }
  },

  renderMyIdeas() {
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
  },

  renderTopics() {
    var availableTopics = IdeaAdminStore.getAvailableTopics();

    if ((availableTopics || []).length > 0) {
      var topics = availableTopics.map((topic) => {
        return (
          <li key={topic.slug}>
            <a href={'/ideas?topic=' + topic.slug}>
              {topic.name}
            </a>
          </li>
        );
      });

      return (
        <li className="dropdown" key="filter-dropdown">
          <a className="dropdown-toggle" data-toggle="dropdown" href="#" role="button" aria-expanded="false">
            Topics <span className="caret"></span>
          </a>
          <ul className="dropdown-menu" role="menu">
            {topics}
          </ul>
        </li>
      );
    }
  }
});

module.exports = IdeasIndex;
