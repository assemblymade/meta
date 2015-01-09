var IdeasIndex = require('./ideas_index.js.jsx');
var IdeasRouter = require('./ideas_router');
var IdeasStore = require('../../stores/ideas_store');

var IdeasApp = React.createClass({
  displayName: 'IdeasApp',

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
      component: <Component params={context.params} query={context.query} navigate={IdeasRouter.navigate} />
    });
  },

  getInitialState: function() {
    return {
      component: <IdeasIndex params={{}} query={{}} navigate={IdeasRouter.navigate} />
    }
  },

  render: function() {
    return this.state.component;
  }
});

window.IdeasApp = IdeasApp;
