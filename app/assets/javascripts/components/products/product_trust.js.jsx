'use strict'

import Button from '../ui/button.js.jsx';
import Tile from '../ui/tile.js.jsx';
import Icon from '../ui/icon.js.jsx';
import ProductHeader from './product_header.js.jsx';
import ProductStore from '../../stores/product_store';

const Report = React.createClass({
  render() {
    const {label, status, description} = this.props
    let icon = null

    if (status) {
      icon = <span className="green">
        <Icon icon="check-circle" fw={true} />
      </span>
    } else {
      icon = <span className="gray-5">
        <Icon icon="question-circle" fw={true} />
      </span>
    }

    return <div className="border-bottom clearfix py3">
      <div className="left h1 mr2">
        {icon}
      </div>
      <div className="overflow-hidden">
        <h5 className="mt0 mb0">{label}</h5>
        {description}
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
            {this.renderDataReport(product)}
            {this.renderFinancesReport(product)}
            {this.renderIOSReport(product)}
            {this.renderAndroidReport(product)}
          </div>
        </Tile>
      </div>
    </div>
  },

  renderDomainReport(product) {
    const status = product.trust.domain
    let description = <div>
        <p>No one partner can change or update the domain name. It's held by Assembly for the community to help ensure that your ownership continues to be valuable.</p>
        <a href="/guides/domains#domains">Learn more</a>
      </div>

    return <Report label="Domain" status={product.trust.domain} description={description} />
  },

  renderIpReport(product) {
    const status = product.trust.ip
    let description = <div>
        <p>For the community to share intellectual property, all code should be commited with an AGPL license. This prevents any one person from laying claim to the organization's intellectual property.</p>
        <a href="/guides/domains#domains">Learn more</a>
      </div>

    return <Report label="Intellectual property" status={status} description={description} />
  },

  renderHostingReport(product) {
    const status = product.trust.ip
    let description = <div>
        <p>For hosting to be held for the community, Assembly can manage the hosting using Heroku. The core team can get access to their Heroku instance to manage their own app.</p>
        <a href="/guides/domains#domains">Learn more</a>
      </div>
    return <Report label="Hosting" status={status} description={description} />
  },

  renderDataReport(product) {
    const status = product.trust.data
    let description = <div>
        <p>Customer data (databases) should be held by the community so that no one person can either corrupt or exploit the data.</p>
        <a href="/guides/domains#domains">Learn more</a>
      </div>
    return <Report label="Data" status={status} description={description} />
  },

  renderFinancesReport(product) {
    const status = product.trust.financials
    let description = <div>
        <p>For organizations that pay royalties, accurately reporting and collecting revenue is important to establishing monetary value to ownership. Assembly can manage collect revenue on behalf of the community.</p>
        <a href="/guides/accepting-payments">Learn more</a>
      </div>
    return <Report label="Finances" status={status} description={description} />
  },

  renderIOSReport(product) {
    const status = product.trust.ios
    let description = <div>
        <p>For organizations with iOS apps, having community access to the iOS App Store account is important. Assembly can manage access to the iOS account so that no one person can pull an app from the store and so revenue is correctly reported.</p>
        <a href="/guides/starting-ios">Learn more</a>
      </div>
    return <Report label="iOS app" status={status} description={description} />
  },

  renderAndroidReport(product) {
    const status = product.trust.android
    let description = <div>
        <p>For organizations with Android apps, having community access to the Google Play Store account is important. Assembly can manage access to the Play Store account so that no one person can pull an app from the store and so revenue is correctly reported.</p>
        <a href="/guides/starting-android">Learn more</a>
      </div>
    return <Report label="Android app" status={status} description={description} />
  },

})

export default ProductTrust
