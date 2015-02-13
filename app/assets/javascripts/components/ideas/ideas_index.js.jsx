'use strict';

const App = require('../app.js.jsx')
const Button = require('../ui/button.js.jsx');
const DropdownMenu = require('../ui/dropdown_menu.js.jsx')
const IdeaAdminStore = require('../../stores/idea_admin_store');
const IdeasStore = require('../../stores/ideas_store');
const IdeaTile = require('./idea_tile.js.jsx');
const Jumbotron = require('../ui/jumbotron.js.jsx');
const Nav = require('../ui/nav.js.jsx');
const NewIdeaModal = require('./new_idea_modal.js.jsx');
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
      ideas: IdeasStore.getIdeas(),
      lastProduct: IdeasStore.getLastProduct(),
      currentProduct: IdeasStore.getCurrentProduct()
    });
  },

  getInitialState() {
    return {
      ideas: IdeasStore.getIdeas(),
      lastProduct: IdeasStore.getLastProduct(),
      currentProduct: IdeasStore.getCurrentProduct()
    };
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

        <Jumbotron>
          <h1 className="mt0 mb0 center white">The fast lane for bringing ideas to life</h1>
        </Jumbotron>

        <div className="container" style={{marginTop: '-2rem'}}>


          <div className="clearfix p2 bg-white rounded shadow">
            <div className="col col-4 py2 px3">
              <h4 className="mt3 mb3">Each week the Assembly community fast-tracks the idea they love the most into a live product. Vote on the idea that you think would be a good candidate to fast-track.</h4>
              <p className="gray-2 mb2">Do you have an idea that you'd like fast-tracked?</p>
              <Button action="/ideas/new" block={true}>Submit your idea</Button>
            </div>

            <div className="col col-4 p2">
              <h6 className="gray-2 center caps mt0 mb1">This week's product</h6>
              {currentApp}
            </div>

            <div className="col col-4 p2">
              <h6 className="gray-2 center caps mt0 mb1">Last week's product</h6>
              {lastApp}
            </div>
          </div>

        </div>


        <section className="tile-grid tile-grid-ideas" key="ideas-grid">
          <div className="container">
            <div className="header">

              <div className="py4">
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
