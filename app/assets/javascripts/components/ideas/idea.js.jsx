var App = require('../app.js.jsx');
var AppIcon = require('../app_icon.js.jsx');
var Button = require('../ui/button.js.jsx');
var Drawer = require('../ui/drawer.js.jsx');
var Heart = require('../heart.js.jsx');
var IdeaLovers = require('../ideas/idea_lovers.js.jsx');
var IdeaProgressBar = require('../ideas/idea_progress_bar.js.jsx');
var IdeaSharePanel = require('../ideas/idea_share_panel.js.jsx');
var page = require('page');
var SvgIcon = require('../ui/svg_icon.js.jsx');
var TextPost = require('../ui/text_post.js.jsx');
var UserStore = require('../../stores/user_store');

var Idea = React.createClass({
  propTypes: {
    // (@chrislloyd) Sorry @pletcher!
    idea: React.PropTypes.object
  },

  render() {
    var idea = this.props.idea

    return (
      <div className="p4">
        <TextPost author={idea.user} title={idea.name} timestamp={idea.created_at} body={idea.body} />
        {this.renderAdminRow()}
        {this.renderProductRow()}
      </div>
    )
  },

  renderAdminRow() {
    var currentUser = UserStore.getUser();
    if (currentUser && currentUser.is_staff) {
      var idea = this.props.idea;

      return (
        <a className="bold inline-block mt3" href={idea.url + '/admin'}>Admin</a>
      )
    }
  },

  renderCreateProductRow() {
    var idea = this.props.idea;
    var ideaUser = idea.user;

    if (ideaUser.id === UserStore.getId()) {
      return (
        <div className="clearfix border-bottom py2">
          <div className="left mt1 px4">
            Are you ready to start building this idea?
          </div>

          <div className="right mr2">
            <Button type="primary" action={function() {
                page('/create?pitch=' + idea.name + '&idea_id=' + idea.id);
              }}>
              Create a product
            </Button>
          </div>
        </div>
      );
    }
  },

  renderProductRow() {
    var idea = this.props.idea;
    var product = idea.product;

    if (!_.isNull(product)) {
      return (
        <div className="mt4">
          <h6 className="mb2 center purple">Development of this idea has already started:</h6>
          <a className="block border rounded p2 mxn2 border-gray-5-hover shadow-hover" href={product.url}>
            <div className="left mr2">
              <AppIcon app={product} size={48} />
            </div>
            <div className="right p2 blue">
              <Icon icon="chevron-right" />
            </div>
            <div className="overflow-hidden">
              <h5 className="black mt0 mb0">{product.name}</h5>
              <p className="gray-2 mb0">{product.pitch}</p>
            </div>
          </a>
        </div>
      );
    }

    if (idea.user.id === UserStore.getId()) {
      return (
        <div className="mt4">
          <div className="p2 border rounded clearfix">
            <div  className="right">
              <Button action={function() {
                  page('/create?pitch=' + idea.name + '&idea_id=' + idea.id);
                }}>
                Create a product
              </Button>
            </div>
            <div className="overflow-hidden py1">
              Are you ready to start building this idea?
            </div>
          </div>
        </div>
      )
    }
  }
});

module.exports = Idea;
