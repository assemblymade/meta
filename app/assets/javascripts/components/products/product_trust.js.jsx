'use strict'

const Button = require('../ui/button.js.jsx');
const Tile = require('../ui/tile.js.jsx');
const Icon = require('../ui/icon.js.jsx');
const ProductHeader = require('./product_header.js.jsx');
const ProductStore = require('../../stores/product_store');
const UserStore = require('../../stores/user_store');

const Report = React.createClass({
  render() {
    const {label, status, children} = this.props
    let icon = null

    if (status) {
      icon = <span className="green">
        <Icon icon="check-circle" fw={true} />
      </span>
    } else {
      icon = <span className="gray-5">
        <Icon icon="times-circle" fw={true} />
      </span>
    }

    return <div className="border-bottom clearfix py3">
      <div className="left h1 mr2">
        {icon}
      </div>
      <div className="overflow-hidden">
        <h5 className="mt0 mb0">{label}</h5>
        {children}
      </div>
    </div>
  }
})

const ProductTrust = React.createClass({
  render() {
    const product = ProductStore.getProduct()

    return <div>
      <div className="mb3">
        <ProductHeader />
      </div>
      <div className="container">
        <Tile>
          <div className="px4 py2">
            {this.renderDomainReport(product)}
            {this.renderIpReport(product)}
            {this.renderHostingReport(product)}
            {this.renderFinancesReport(product)}
            {this.renderMobileReport(product)}
          </div>
        </Tile>
      </div>
    </div>
  },

  renderDomainReport(product) {
    const status = product.trust.domain
    let action = null
    if (UserStore.isSignedIn() && !status && ProductStore.isCoreTeam(UserStore.getUser())) {
      action = <Button action="mailto:assembly@helpful.io?subject=Domains">Buy or transfer an existing domain</Button>
    } else {
      action = <a href="/guides/domains#domains">Learn more</a>
    }
    return <Report label="Domains" status={product.trust.domain}>
      <p>An organization's domain name is one of it's most important assets. If somebody runs away with a domain it could be catistrophic. Domains should be community owned so that no one partner can change or update the domain name.</p>
      {action}
    </Report>
  },

  renderIpReport(product) {
    const status = product.trust.ip
    let action = null
    if (UserStore.isSignedIn() && !status && ProductStore.isCoreTeam(UserStore.getUser())) {
      action = <Button action={`/${product.slug}/repositories`}>Setup repos</Button>
    } else {
      action = <a href="/guides/domains#domains">Learn more</a>
    }
    return <Report label="Intellectual property" status={status}>
      <p>For the community to share intellectual property, all code should be open and commited with an AGPL license. This prevents any one person from laying claim to the organization's intellectual property.</p>
      {action}
    </Report>
  },

  renderHostingReport(product) {
    const status = product.trust.hosting
    let action = null
    if (UserStore.isSignedIn() && !status && ProductStore.isCoreTeam(UserStore.getUser())) {
      action = <Button action="mailto:support@assembly.com?subject=Hosting">Setup hosting</Button>
    } else {
      action = <a href="/guides/domains#hosting">Learn more</a>
    }
    return <Report label="Hosting &amp; customer data" status={status}>
      <p>For hosting to be held for the community, Assembly can manage the hosting using Heroku. The core team can get access to their Heroku instance to manage their own app.</p>
      {action}
    </Report>
  },

  renderFinancesReport(product) {
    const status = product.trust.financials
    let action = null
    if (UserStore.isSignedIn() && !status && ProductStore.isCoreTeam(UserStore.getUser())) {
      action = <Button action="/guides/accepting-payments">Setup payments</Button>
    } else {
      action = <a href="/guides/accepting-payments">Learn more</a>
    }
    return <Report label="Finances" status={status}>
      <p>For organizations that pay royalties, accurately reporting and collecting revenue is important to establishing monetary value to ownership. Assembly can manage collect revenue on behalf of the community.</p>
      {action}
    </Report>
  },

  renderMobileReport(product) {
    const status = product.trust.mobile
    let action = null
    if (UserStore.isSignedIn() && !status && ProductStore.isCoreTeam(UserStore.getUser())) {
      action = <Button action="mailto:assembly@helpful.io?subject=Mobile">Submit app for iOS or Android stores</Button>
    } else {
      action = <a href="/guides/starting-ios">Learn more</a>
    }
    return <Report label="Mobile apps" status={status}>
      <p>For organizations with iOS apps, having community access to the iOS App Store account is important. Assembly can manage access to the iOS account so that no one person can pull an app from the store and so revenue is correctly reported.</p>
      {action}
    </Report>
  }
})

module.exports = ProductTrust
