'use strict';

const NewProductSubsection = require('./new_product_subsection.js.jsx');
const ProductStore = require('../../stores/product_store');
const ProductSubsection = require('./product_subsection.js.jsx');
const ProductSubsectionsStore = require('../../stores/product_subsections_store');
const UserStore = require('../../stores/user_store');

let ProductSubsections = React.createClass({
  componentDidMount() {
    ProductSubsectionsStore.addChangeListener(this.onSubsectionsChange);
  },

  componentWillUnmount() {
    ProductSubsectionsStore.removeChangeListener(this.onSubsectionsChange);
  },

  getInitialState() {
    return {
      subsections: ProductSubsectionsStore.getSubsections()
    };
  },

  onSubsectionsChange() {
    this.setState({
      subsections: ProductSubsectionsStore.getSubsections()
    });
  },

  render() {
    return (
      <div>
        {this.renderSubsections()}
      </div>
    );
  },

  renderSubsections() {
    let subsections = this.state.subsections;
    let headings = Object.keys(subsections);
    let renderedSubsections = [];

    if (headings.length) {
      for (let i = 0, l = headings.length; i < l; i += 2) {
        let leftHeading = headings[i];
        let rightHeading = headings[i + 1];
        let leftBody = subsections[leftHeading];
        let rightBody = subsections[rightHeading];

        let renderedLeft = <ProductSubsection title={leftHeading}
            body={leftBody}
            key={leftHeading + '-' + i} />;

        let renderedRight;
        if (rightHeading) {
          renderedRight = <ProductSubsection title={rightHeading}
              body={rightBody}
              key={rightHeading + '-' + i} />;
        }

        renderedSubsections.push(
          <div className="clearfix py1" key={leftHeading + '-' + i}>
            {renderedLeft}
            {renderedRight}
          </div>
        );
      }
    }

    if (ProductStore.isCoreTeam(UserStore.getUser()) && headings.length < 6) {
      renderedSubsections.push(<NewProductSubsection key="new-section" />);
    }

    return renderedSubsections;
  }
});

module.exports = ProductSubsections;
