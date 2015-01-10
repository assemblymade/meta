var IdeasIndex = require('./ideas_index.js.jsx');
var IdeasRouter = require('./ideas_router');
var IdeasRoutesStore = require('../../stores/ideas_routes_store');

var IdeasApp = React.createClass({
  displayName: 'IdeasApp',

  componentDidMount: function() {
    IdeasRoutesStore.addChangeListener(this.getComponentAndContext);

    // The router will have fired before the component mounted, so we need
    // to call `navigate` after mounting
    IdeasRouter.navigate(window.location.pathname);
  },

  componentWillUnmount: function() {
    IdeasRoutesStore.removeChangeListener(this.getComponentAndContext);
    IdeasRouter.stop();
  },

  getComponentAndContext: function() {
    var Component = IdeasRoutesStore.getComponent();
    var context = IdeasRoutesStore.getContext();

    this.setState({
      component: <Component params={context.params} query={context.query} navigate={IdeasRouter.navigate} />
    });
  },

  getInitialState: function() {
    return {
      component: null
    }
  },

  render: function() {
    return this.state.component;
  }
});

window.IdeasApp = IdeasApp;
