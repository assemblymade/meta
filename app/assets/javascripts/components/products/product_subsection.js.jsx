'use strict';

const EditingProductSubsection = require('./editing_product_subsection.js.jsx');
const Icon = require('../ui/icon.js.jsx');
const Immutable = require('immutable');
const ProductStore = require('../../stores/product_store');
const ProductSubsectionsActions = require('../../actions/product_subsections_actions');
const ProductSubsectionsStore = require('../../stores/product_subsections_store');
const UserStore = require('../../stores/user_store');

let ProductSubsection = React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
    body: React.PropTypes.string.isRequired
  },

  componentDidMount() {
    ProductSubsectionsStore.addChangeListener(this.onSubsectionsChange);
  },

  componentWillUnmount() {
    ProductSubsectionsStore.removeChangeListener(this.onSubsectionsChange);
  },

  getInitialState() {
    return {
      editing: false
    };
  },

  handleEditClick(e) {
    e.preventDefault();

    ProductSubsectionsActions.editSubsection(this.props.title);
  },

  handleRemoveClick(e) {
    e.preventDefault();

    let subsections = Immutable.Map(
      ProductSubsectionsStore.getSubsections()
    ).delete(this.props.title).toJS();

    ProductSubsectionsActions.submitSubsections(
      ProductStore.getSlug(),
      subsections
    );
  },

  onSubsectionsChange() {
    if (this.isMounted()) {
      this.setState({
        editing: ProductSubsectionsStore.isEditing(this.props.title)
      });
    }
  },

  render() {
    let {
      title,
      body
    } = this.props;

    if (this.state.editing) {
      return <EditingProductSubsection
        initialBody={this.props.body}
        initialTitle={this.props.title} />;
    }

    return (
      <div className="hover-toggle-wrapper">
        <div className="clearfix">
          <div className="right">
            <div className="clearfix">
              <div className="left mr2">
                {this.renderRemoveButton()}
              </div>

              <div className="right">
                {this.renderEditButton()}
              </div>
            </div>
          </div>

          <div className="left">
            <h5 className="mt0 mb0">{title}</h5>
          </div>
        </div>
        <Markdown content={body} normalized={true} />
      </div>
    );
  },


  renderEditButton() {
    if (ProductStore.isCoreTeam(UserStore.getUser())) {
      return (
        <a className="gray-1 hover-toggle-target" href="javascript:void(0);" onClick={this.handleEditClick}>
          <Icon icon="pencil" />
        </a>
      );
    }
  },

  renderRemoveButton() {
    if (ProductStore.isCoreTeam(UserStore.getUser())) {
      return (
        <a className="gray-1 hover-toggle-target right" href="javascript:void(0);" onClick={this.handleRemoveClick}>
          <Icon icon="close" />
        </a>
      );
    }
  }
});

module.exports = ProductSubsection;
