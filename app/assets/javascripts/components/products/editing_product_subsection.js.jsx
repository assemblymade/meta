'use strict';

const Button = require('../ui/button.js.jsx');
const CharacterLimiter = require('../character_limiter.js.jsx');
const FormGroup = require('../form_group.js.jsx');
const Immutable = require('immutable');
const ProductStore = require('../../stores/product_store');
const ProductSubsectionsActions = require('../../actions/product_subsections_actions');
const ProductSubsectionsStore = require('../../stores/product_subsections_store');

let EditingProductSubsection = React.createClass({
  propTypes: {
    initialBody: React.PropTypes.string,
    initialTitle: React.PropTypes.string
  },

  componentDidMount() {
    ProductSubsectionsStore.addChangeListener(this.onSubsectionChange);
  },

  componentWillUnmount() {
    ProductSubsectionsStore.removeChangeListener(this.onSubsectionChange);
  },

  getDefaultProps() {
    return {
      initialBody: '',
      initialTitle: ''
    };
  },

  getInitialState() {
    return {
      body: this.props.initialBody,
      error: null,
      product: ProductStore.getProduct(),
      title: this.props.initialTitle
    };
  },

  handleCancelClick(e) {
    e.preventDefault();

    this.setState({
      body: '',
      title: ''
    });

    ProductSubsectionsActions.editSubsection(null);
  },

  handleInputChange(prop, limit) {
    return function(e) {
      let value = e.target.value;

      if (value && value.length >= limit) {
        return;
      }

      let tempState = {};

      tempState[prop] = value;

      this.setState(tempState);
    }.bind(this);
  },

  handleSubsectionSubmit() {
    let {
      body,
      title
    } = this.state;

    if ((title && title.length > 0) && (body && body.length > 0)) {
      let subsections = Immutable.Map(
        ProductSubsectionsStore.getSubsections()
      ).set(title, body);

      if (this.props.initialTitle && this.props.initialTitle !== title) {
        subsections = subsections.delete(this.props.initialTitle);
      }

      ProductSubsectionsActions.submitSubsections(
        ProductStore.getSlug(),
        subsections.toJS()
      );
    }
  },

  onSubsectionChange() {
    // just save the current stuff if the user starts editing another
    // subsection
    this.handleSubsectionSubmit();
  },

  render() {
    return (
      <div className="clearfix">
        <div className="col col-6">
          <FormGroup error={this.state.error}>
            {this.renderTitle()}
            {this.renderBody()}
          </FormGroup>

          <div className="clearfix">
            <div className="left">
              <Button type="default" action={this.handleSubsectionSubmit}>
                Save
              </Button>
            </div>

            <div className="right">
              <a href="javascript:void(0);" onClick={this.handleCancelClick}>Cancel</a>
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderBody() {
    let limit = 300;
    let input = (
      <textarea type="text"
        className="form-control py1"
        placeholder="Description"
        value={this.state.body}
        onChange={this.handleInputChange('body', limit)} />
    );

    return <CharacterLimiter control={input} limit={limit} />;
  },

  renderTitle() {
    let limit = 60;
    let input = (
      <input type="text"
        className="form-control"
        placeholder="Title"
        value={this.state.title}
        onChange={this.handleInputChange('title', limit)} />
    );

    return <CharacterLimiter control={input} limit={limit} />;
  }
});

module.exports = EditingProductSubsection;
