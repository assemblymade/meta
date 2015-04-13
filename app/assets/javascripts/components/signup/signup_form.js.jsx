'use strict';

const Button = require('../ui/button.js.jsx');
const Icon = require('../ui/icon.js.jsx');
const SignupActions = require('../../actions/signup_actions');
const SignupFormStore = require('../../stores/signup_form_store');
const Spinner = require('../spinner.js.jsx');

const ENTER_KEY = 13;

const SignupForm = React.createClass({
  componentDidMount() {
    SignupFormStore.addChangeListener(this.updateFormState);
  },

  componentWillUnmount() {
    SignupFormStore.removeChangeListener(this.updateFormState);
  },

  getInitialState() {
    return {
      errors: SignupFormStore.getErrors(),
      hasAccount: false,
      isSigningUp: false,
      showSignupForm: false,
      pendingAward: SignupFormStore.getPendingAward()
    };
  },

  handleChange(property) {
    let handler = (e) => {
      let state = {};
      state[property] = e.target.value;
      this.setState(state);
    };

    return handler;
  },

  handleKeyPress(e) {
    if (e.which === ENTER_KEY) {
      e.preventDefault();
      this.signUp();
    }
  },

  logIn(e) {
    this.setState({
      isSigningUp: true
    });

    let {
      username,
      password
    } = this.state;

    SignupActions.logIn({
      username: username,
      password: password
    });
  },

  render() {
    let award = this.state.pendingAward
    return (
      <div className="row">
        <div className="col-sm-6 col-sm-offset-3">
          <div className="center">
            <img className="py4" src="/assets/logo.min.png" />
            {award ?
              <p>
                Sign up and instantly receive {award.coins} coins for completing
                <b> {award.bounty.title}</b> on <b> {award.bounty.product.name}</b>

              </p> :
              <p className="gray-2">
                Sign in to Assembly or create an account below.
              </p>
            }
          </div>

          <div className="center py2">
            <Button type="facebook" action="/users/auth/facebook" block={true}>
              <span className="mr1">
                <Icon icon="facebook" />
              </span> Use Facebook
            </Button>
          </div>

          <div className="center py2">
            <Button type="default" action={this.showSignupForm} block={true}>
              <span className="mr1">
                <Icon icon="envelope-o" />
              </span> Use email
            </Button>
          </div>

          <div className="center py2">
            <a href="/login">
              Already have an account?
            </a>
          </div>


          {this.renderForm()}

          <p className="center small gray-2">
            <br />
            By signing up, you agree to Assembly&#39;s <a href="/terms">Terms of Service</a>.
          </p>
        </div>
      </div>
    );
  },

  renderError(property) {
    if (this.state.errors[property]) {
      return (
        <div className="bg-red center bold white rounded">
          {property[0].toUpperCase() + property.substr(1) + ' ' + this.state.errors[property]}
        </div>
      );
    }
  },

  renderForm() {
    if (this.state.isSigningUp) {
      return <Spinner />;
    }

    if (this.state.hasAccount) {
      return (
        <div>

          {this._usernameInput('Username or email')}
          {this._passwordInput()}

          <div className="center">
            <Button type="primary" block action={this.logIn}>Join Assembly</Button>
          </div>
        </div>
      );
    }

    if (this.state.showSignupForm) {
      return (
        <div>
          {this._usernameInput('Username')}
          {this._emailInput()}
          {this._passwordInput()}

          <div className="center">
            <Button type="primary" block action={this.signUp}>Join Assembly</Button>
          </div>
        </div>
      );
    }
  },

  showLoginForm(e) {
    e.preventDefault();

    this.setState({
      hasAccount: !this.state.hasAccount
    });
  },

  showSignupForm(e) {
    e.preventDefault();

    this.setState({
      hasAccount: false,
      showSignupForm: true
    });
  },

  signUp(e) {
    this.setState({
      isSigningUp: true
    });

    let {
      username,
      email,
      password
    } = this.state;

    SignupActions.signup({
      username: username,
      email: email,
      password: password
    });
  },

  updateFormState() {
    this.setState({
      errors: SignupFormStore.getErrors(),
      isSigningUp: false,
      pendingAward: SignupFormStore.getPendingAward()
    });
  },

  _emailInput() {
    let { email } = this.state;

    return (
      <div className="form-group">
        {this.renderError('email')}
        <label className="control-label">Email</label>
        <input type="text"
            className="form-control input-lg mr1"
            placeholder="jane@example.com"
            name="email"
            onKeyPress={this.handleKeyPress}
            value={email}
            onChange={this.handleChange('email')} />
      </div>
    );
  },

  _passwordInput() {
    let { password } = this.state;

    return (
      <div className="form-group">
        {this.renderError('password')}
        <label className="control-label">Password</label>
        <input type="password"
            autoComplete={false}
            className="form-control input-lg mr1"
            name="password"
            onKeyPress={this.handleKeyPress}
            value={password}
            onChange={this.handleChange('password')} />
        <p className="help-block">
          8 characters minimum.
        </p>
      </div>
    );
  },

  _usernameInput(label) {
    let { username } = this.state;

    return (
      <div className="form-group">
        {this.renderError('username')}
        <label className="control-label">{label}</label>
        <input type="text"
            className="form-control input-lg mr1"
            placeholder="jane"
            name="username"
            onKeyPress={this.handleKeyPress}
            value={username}
            onChange={this.handleChange('username')} />
      </div>
    );
  }
});

module.exports = SignupForm;
