'use strict';

const App = require('../app.js.jsx')
const Button = require('../ui/button.js.jsx');
const DropdownMenu = require('../ui/dropdown_menu.js.jsx')
const IdeaAdminStore = require('../../stores/idea_admin_store');
const IdeasStore = require('../../stores/ideas_store');
const IdeaTile = require('./idea_tile.js.jsx');
const Jumbotron = require('../ui/jumbotron.js.jsx');
const Nav = require('../ui/nav.js.jsx');
const page = require('page');
const Pagination = require('../pagination/pagination.js.jsx');
const UserStore = require('../../stores/user_store');

let IdeasIndex = React.createClass({
  displayName: 'IdeasIndex',

  propTypes: {
    navigate: React.PropTypes.func,
    params: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    query: React.PropTypes.object
  },

  componentDidMount() {
    document.title = 'Ideas';

    IdeasStore.addChangeListener(this.getIdeas);
  },

  componentWillUnmount() {
    IdeasStore.removeChangeListener(this.getIdeas);
  },

  getIdeas() {
    this.setState({
      ideas: IdeasStore.getIdeas()
    })
  },

  getInitialState() {
    return {
      ideas: IdeasStore.getIdeas(),
    }
  },

  render() {
    let currentApp, lastApp

    let topicsDropdownMenu = this.renderTopics()

    if (this.state.currentProduct) {
      currentApp = <App app={this.state.currentProduct} />
    }

    if (this.state.lastProduct) {
      lastApp = <App app={this.state.lastProduct} />
    }

    return (
      <main role="main  bg-white">
        <div className="subnav bg-white py3 md-show lg-show mb3">
          <div className="container clearfix">
            <div className="left">
              <h3 className="mt2 mb2">
                What inspires you?
              </h3>
              <h4 className="gray-2">The ideas with the most hearts will be built by the community.</h4>
            </div>
            <div className="center right py1">
              <Button type="primary" action={function() { page('/ideas/new'); }}>
                Start your product idea
              </Button>
            </div>
          </div>
        </div>

        <section className="tile-grid tile-grid-ideas" key="ideas-grid">
          <div className="container">
            <div className="header">

              <div className="py3">
                <Nav>
                  <Nav.Item label="Trending" href="/ideas?sort=trending" />
                  <Nav.Item label="New" href="/ideas?sort=newness" />
                  {this.renderMyIdeas()}
                </Nav>
              </div>

              <div className="main" key="main-ideas">
                {this.renderIdeas()}
              </div>
            </div>

            <div className="center">
              <Pagination actionCall={page} />
            </div>
          </div>
        </section>
      </main>
    );
  },

  renderProgress() {
    return (
      <ul className="list list-steps hidden-xs hidden-sm">
        <li className="overlay"></li>
        <li>
          <div className="step active">1</div>
          <div className="body">
            <a href="/create"><strong>Idea</strong></a>
            <div className="gray-2">Every great company begins as an Idea.</div>
          </div>
        </li>
        <li>
          <div className="step">2</div>
          <div className="body">
            <strong>Recruit</strong>
            <div className="gray-2">Find the partners who can help make it real.</div>
          </div>
        </li>
        <li>
        <div className="step">3</div>
        <div className="body">
          <strong>Get Started</strong>
          <div className="gray-2">Lay the groundwork for a thriving project.</div>
        </div>
      </li>
      <li>
        <div className="step">4</div>
        <div className="body">
          <strong>Build an MVP</strong>
          <div className="gray-2">Build a minimum viable product.  Create something beautiful.</div>
        </div>
      </li>
      <li>
        <div className="step">5</div>
        <div className="body">
          <strong>Launch</strong>
          <div className="gray-2">Tell the world about what you've built.</div>
        </div>
      </li>
      <li>
        <div className="step">6</div>
        <div className="body">
          <strong>Grow</strong>
          <div className="gray-2">Take your product to the next level.  Iterate, improve, and grow.  The world is your oyster</div>
        </div>
      </li>
      <li className="overlay"></li>
    </ul>

    )
  },

  renderHeader() {
    return (
      <Jumbotron>
        <div className="container center white">
            <h1 className="mt0 mb0">
              The best product ideas &mdash; built by all of us.
            </h1>
            <Button type="primary" action={page.bind(page, '/ideas/new')}>Add your product idea</Button>

        </div>
      </Jumbotron>
    );
  },

  renderIdeas() {
    let ideas = this.state.ideas;

    if (ideas.length) {
      return ideas.map((idea) => {
        return <div className="mb2" key={idea.id}>
          <IdeaTile idea={idea} />
        </div>
      });
    }
  },

  renderMyIdeas() {
    let user = UserStore.getUser()
    let username = user && user.username;

    if (username) {
      let url = "/ideas?user=" + username
      return [
        <Nav.Divider key="nav-divider" />,
        <Nav.Item label="My ideas" href={url} onClick={function() { page(url) }} key={url} />
      ]
    }
  },

  renderTopics() {
    let availableTopics = IdeaAdminStore.getAvailableTopics();

    if ((availableTopics || []).length > 0) {
      let topics = availableTopics.map((topic) => {
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
