'use strict';

const Button = require('../ui/button.js.jsx');
const IntroductionActions = require('../../actions/introduction_actions');
const IntroductionStore = require('../../stores/introduction_store');
const TypeaheadUserTextArea = require('../typeahead_user_textarea.js.jsx');
const UserStore = require('../../stores/user_store');

let IntroductionForm = React.createClass({
  propTypes: {
    product: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      slug: React.PropTypes.string.isRequired
    }).isRequired
  },

  componentDidMount() {
    IntroductionStore.addChangeListener(this.onIntroductionChange);
  },

  componentWillUnmount() {
    IntroductionStore.removeChangeListener(this.onIntroductionChange);
  },

  getInitialState() {
    return {
      introduction: IntroductionStore.getIntroduction()
    };
  },

  handleIntroductionChange(e) {
    IntroductionActions.updateIntroduction(e.target.value);
  },

  handleIntroductionSubmit() {
    let introduction = IntroductionStore.getIntroduction();
    let product = this.props.product;
    let slug = product.slug;
    let userId = UserStore.getId();

    IntroductionActions.submitIntroduction(slug, userId, introduction)
  },

  onIntroductionChange() {
    this.setState({
      introduction: IntroductionStore.getIntroduction()
    });
  },

  render() {
    let productName = this.props.product.name;

    return (
      <div>
        <div className="gray-1 h6 markdown markdown-normalized py1 mb2">
          Ready to pitch in on {productName}? Introduce yourself.
        </div>

        <TypeaheadUserTextArea className="form-control mb2"
          onChange={this.handleIntroductionChange}
          placeholder={"What kinds of problems do you like to solve? What skills can you contribute to " +
            productName + "? Are you a coder, a designer, a marketer, or simply a doer?"}
          rows="2"
          value={this.state.introduction}
          style={{ fontSize: 13 }} />
        <div className="center">
          <Button type="default" action={this.handleIntroductionSubmit}>
            Introduce yourself!
          </Button>
        </div>
      </div>
    );
  }
});

module.exports = IntroductionForm;
