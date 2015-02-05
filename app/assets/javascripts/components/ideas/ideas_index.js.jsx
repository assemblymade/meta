var App = require('../app.js.jsx')
var Button = require('../ui/button.js.jsx');
var DropdownMenu = require('../ui/dropdown_menu.js.jsx')
var IdeaTile = require('./idea_tile.js.jsx');
var IdeaAdminStore = require('../../stores/idea_admin_store');
var IdeasStore = require('../../stores/ideas_store');
var IdeaTile = require('./idea_tile.js.jsx');
var Nav = require('../ui/nav.js.jsx')
var NewIdeaModal = require('./new_idea_modal.js.jsx');
var Pagination = require('../pagination/pagination.js.jsx');
var UserStore = require('../../stores/user_store');
var Jumbotron = require('../ui/jumbotron.js.jsx')


var Sumo = {"id":"bc7e0ee3-b776-4a6b-97ac-327b726b7388","type":"product","created_at":"2014-11-06T00:36:30Z","updated_at":"2015-01-29T01:49:35Z","url":"/signupsumo","name":"Signup Sumo","pitch":"Instantly know when influential people use your product.","slug":"signupsumo","logo_url":"https://d1015h9unskp4y.cloudfront.net/attachments/4a3ca4ca-7855-4979-978c-de08921a9527/signupsumo.png","try_url":null}

var Giraff = {"id":"1096fde9-95ee-4450-b645-69432c85176c","type":"product","created_at":"2014-11-17T08:58:34Z","updated_at":"2015-01-29T00:01:56Z","url":"/giraff","name":"Giraff","pitch":"Tinder for GIFs ","slug":"giraff","logo_url":"https://d1015h9unskp4y.cloudfront.net/attachments/8fed45b9-b456-4ee7-a548-f7cd4afad6ec/girafflogo.png"}

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
    document.title = 'Ideas';

    IdeasStore.addChangeListener(this.getIdeas);
  },

  componentWillUnmount() {
    IdeasStore.removeChangeListener(this.getIdeas);
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

    var topicsDropdownMenu = this.renderTopics()

    return (
      <main role="main  bg-white">

        <Jumbotron>
          <h1 className="mt0 mb0 center white">Fast-track your ideas into reality</h1>
        </Jumbotron>

        <div className="container" style={{marginTop: '-2rem'}}>


          <div className="clearfix p2 bg-white rounded shadow">
            <div className="col col-4 py2 px3">
              <h4 className="mt3 mb2">Each week the Assembly community fast-tracks the idea they love the most into a live product. Vote on the idea that you think would be a good candidate to fast-track.</h4>
              <p className="gray-2">Do you have an idea that you'd like fast-tracked? <a href="/ideas/new">Submit it today</a>.</p>
            </div>

            <div className="col col-4 p2">
              <h6 className="gray-2 center caps mt0 mb1">This week's product</h6>
              <App app={Giraff} />
            </div>

            <div className="col col-4 p2" style={{opacity:0.4}}>
              <h6 className="gray-2 center caps mt0 mb1">Last week's product</h6>
              <App app={Sumo} />
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
                  <Nav.Divider />
                  {this.renderMyIdeas()}
                </Nav>
              </div>

              <div className="main" key="main-ideas">
                {this.renderIdeas()}
              </div>
            </div>

            <div className="center">
              <Pagination actionCall={navigate} />
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
            <Button type="primary" action={this.props.navigate.bind(null, '/ideas/new')}>Add your product idea</Button>

        </div>
      </Jumbotron>
    );
  },

  renderIdeas() {
    var ideas = this.state.ideas;

    if (ideas.length) {
      return ideas.map((idea) => {
        return <div className="mb2" key={idea.id}>
          <IdeaTile idea={idea} />
        </div>
      });
    }
  },

  renderMyIdeas() {
    var navigate = this.props.navigate;
    var user = UserStore.getUser()
    var username = user && user.username;

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
