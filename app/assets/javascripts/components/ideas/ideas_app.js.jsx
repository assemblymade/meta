var IdeasIndex = require('./ideas_index.js.jsx');
var IdeasRouter = require('./ideas_router');
var IdeasRoutesStore = require('../../stores/ideas_routes_store');

var IdeasApp = React.createClass({
  componentDidMount() {
    IdeasRoutesStore.addChangeListener(this.getComponentAndContext);

    // The router will have fired before the component mounted, so we need
    // to call `navigate` after mounting
    IdeasRouter.navigate(window.location.pathname);
  },

  componentWillUnmount() {
    IdeasRoutesStore.removeChangeListener(this.getComponentAndContext);
    IdeasRouter.stop();
  },

  getComponentAndContext() {
    var Component = IdeasRoutesStore.getComponent();
    var context = IdeasRoutesStore.getContext();

    this.replaceState({
      component: <Component params={context.params}
          query={context.query}
          navigate={IdeasRouter.navigate} />
    });
  },

  getInitialState() {
    return {
      component: null
    }
  },

  render() {
    return this.state.component;
  }
});

module.exports = window.IdeasApp = IdeasApp;
