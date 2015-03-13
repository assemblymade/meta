'use strict';

const ActionTypes = require('../constants').ActionTypes;
const Dispatcher = require('../dispatcher');

module.exports = window.SignupActions = {
  hideModal() {
    Dispatcher.dispatch({
      type: ActionTypes.SIGNUP_MODAL_CHANGED,
      isModalOpen: false
    });
  },

  logIn(info) {
    request('/login', info, '/dashboard');
  },

  showModal() {
    Dispatcher.dispatch({
      type: ActionTypes.SIGNUP_MODAL_CHANGED,
      isModalOpen: true
    });
  },

  signup(info) {
    request('/signup', info, '/discover');
  }
};

function request(url, info, redirect) {
  $.ajax({
    url: url,
    method: 'POST',
    dataType: 'json',
    data: {
      user: info
    },
    success(response) {
      window.location = redirect;
    },
    error(jqXhr, error, message) {
      let errors = jqXhr.responseJSON.errors;

      Dispatcher.dispatch({
        type: ActionTypes.SIGNUP_ERRORS,
        errors: errors
      });
    }
  });
}
