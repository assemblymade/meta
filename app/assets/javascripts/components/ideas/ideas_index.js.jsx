var Button = require('../ui/button.js.jsx');
var DropdownMenu = require('../ui/dropdown_menu.js.jsx')
var Footer = require('../ui/footer.js.jsx');
var IdeaTile = require('./idea_tile.js.jsx');
var IdeaAdminStore = require('../../stores/idea_admin_store');
var IdeasStore = require('../../stores/ideas_store');
var IdeaTile = require('./idea_tile.js.jsx');
var Nav = require('../ui/nav.js.jsx')
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

    var topicsDropdownMenu = this.renderTopics()

    return (
      <main role="main">
        {this.renderHeader()}

        <section className="tile-grid tile-grid-ideas" key="ideas-grid">
          <div className="container">
            <div className="header">

              <div className="py4">
                <Nav>
                  {this.renderMyIdeas()}
                  <Nav.Item label="Trending" href="/ideas?sort=trending" />
                  <Nav.Item label="Popular" href="/ideas?sort=hearts" />
                  <Nav.Item label="New" href="/ideas?sort=newness" />
                  <Nav.Item label="Greenlit" href="/ideas?filter=greenlit" />
                  <Nav.Divider />
                  <Nav.Item label="Topics" dropdownMenu={topicsDropdownMenu} />
                </Nav>
              </div>

              <div className="main" key="main-ideas">
                <div className="clearfix mxn2" style={ideasGridStyle}>
                  {this.renderIdeas()}
                </div>
              </div>
            </div>

            <Footer>
              <div className="center">
                <Pagination actionCall={navigate} />
              </div>
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
      var url = "/ideas?user=" + username
      return (
        <Nav.Item label="My ideas" href={url} onClick={navigate.bind(null, url)} />
      )
    }
  },

  renderTopics() {
    var availableTopics = IdeaAdminStore.getAvailableTopics();

    if ((availableTopics || []).length > 0) {
      var topics = availableTopics.map((topic) => {
        return (
          <DropdownMenu.Item label={topic.name} key={topic.slug} action={'/ideas?topic=' + topic.slug} />
        );
      });

      return (
        <DropdownMenu>
            {topics}
        </DropdownMenu>
      );
    }
  }
});

module.exports = IdeasIndex;
