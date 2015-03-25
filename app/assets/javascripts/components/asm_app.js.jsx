var Router = require('../actions/router');
var RoutesStore = require('../stores/routes_store');
var url = require('url');

var AsmApp = React.createClass({
  componentDidMount() {
    RoutesStore.addChangeListener(this.getComponentAndContext);
    Router.initialize();
  },

  componentWillUnmount() {
    RoutesStore.removeChangeListener(this.getComponentAndContext);
    Router.stop();
  },

  getComponentAndContext() {
    var Component = RoutesStore.getComponent();
    var context = RoutesStore.getContext();

    this.setState({
      component: <Component params={context.params}
          query={context.query} />
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

module.exports = window.AsmApp = AsmApp;
