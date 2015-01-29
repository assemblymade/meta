var DashboardIndex = require('./dashboard_index.js.jsx');
var Router = require('../../actions/router');
var DashboardRoutesStore = require('../../stores/dashboard_routes_store');
var url = require('url');

var DashboardApp = React.createClass({
  componentDidMount() {
    DashboardRoutesStore.addChangeListener(this.getComponentAndContext);
    Router.initialize();
  },

  componentWillUnmount() {
    DashboardRoutesStore.removeChangeListener(this.getComponentAndContext);
    Router.stop();
  },

  getComponentAndContext() {
    var Component = DashboardRoutesStore.getComponent();
    var context = DashboardRoutesStore.getContext();

    this.replaceState({
      component: <Component params={context.params}
          query={context.query}
          navigate={Router.navigate} />
    });
  },

  getInitialState() {
    return {
      component: null
    };
  },

  render() {
    return this.state.component;
  }
});

module.exports = window.DashboardApp = DashboardApp;
