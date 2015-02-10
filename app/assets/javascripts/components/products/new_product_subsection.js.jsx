'use strict';

const Button = require('../ui/button.js.jsx');
const EditingProductSubsection = require('./editing_product_subsection.js.jsx');
const ProductSubsectionsActions = require('../../actions/product_subsections_actions');
const ProductSubsectionsStore = require('../../stores/product_subsections_store');

let NewProductSubsection = React.createClass({
  componentDidMount() {
    ProductSubsectionsStore.addChangeListener(this.onSubsectionChange);
  },

  componentWillUnmount() {
    ProductSubsectionsStore.removeChangeListener(this.onSubsectionChange);
  },

  getDefaultProps() {
    return {
      subsectionTitle: 'new-subsection'
    };
  },

  getInitialState() {
    return {
      editing: false
    };
  },

  handleAddSubsectionClick(e) {
    ProductSubsectionsActions.editSubsection(this.props.subsectionTitle);
  },

  onSubsectionChange() {
    if (this.isMounted()) {
      this.setState({
        editing: ProductSubsectionsStore.isEditing(this.props.subsectionTitle)
      });
    }
  },

  render() {
    let newSubsection;

    if (this.state.editing) {
      newSubsection = <EditingProductSubsection />;
    } else {
      newSubsection = (
        <Button type="default" action={this.handleAddSubsectionClick}>
          Add feature
        </Button>
      );
    }

    return (
      <div className="py2">
        {newSubsection}
      </div>
    );
  }
});

module.exports = NewProductSubsection;
