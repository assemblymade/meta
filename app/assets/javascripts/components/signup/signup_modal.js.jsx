'use strict';

const Modal = require('../ui/modal.js.jsx');
const SignupActions = require('../../actions/signup_actions');
const SignupForm = require('./signup_form.js.jsx');
const SignupModalStore = require('../../stores/signup_modal_store');

const SignupModal = React.createClass({
  componentDidMount() {
    SignupModalStore.addChangeListener(this.updateModalState);
  },

  componentWillUnmount() {
    SignupModalStore.removeChangeListener(this.updateModalState);
  },

  getInitialState() {
    return {
      isModalOpen: SignupModalStore.isModalOpen(),
    };
  },

  handleModalDismissed(e) {
    e.stopPropagation();

    SignupActions.hideModal();
  },

  render() {
    let style = {
      div: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        position: 'absolute',
        margin: 'auto',
        height: '95%',
        overflow: 'auto'
      }
    };
    return (
      <Modal fullBleed={true}
          isOpen={this.state.isModalOpen}
          onDismiss={this.handleModalDismissed}
          size="big">
        <div style={style.div} className="container">
          <SignupForm />
        </div>
      </Modal>
    );
  },

  updateModalState() {
    this.setState({
      isModalOpen: SignupModalStore.isModalOpen(),
    });
  }
});

module.exports = window.SignupModal = SignupModal;
