'use strict';

const {List, Map} = require('immutable');
const Avatar = require('../ui/avatar.js.jsx');
const BountyCard = require('../bounty_card.js.jsx');
const Button = require('../ui/button.js.jsx');
const Icon = require('../ui/icon.js.jsx');
const IntroductionForm = require('./introduction_form.js.jsx');
const MetricsBadge = require('./metrics_badge.js.jsx');
const page = require('page');
const Partner = require('../partner.js.jsx');
const ProductHeader = require('./product_header.js.jsx');
const ProductImportantLinks = require('./product_important_links.js.jsx');
const ProductScreenshotPlaceholder = require('./product_screenshot_placeholder.js.jsx');
const ProductStore = require('../../stores/product_store');
const ProductSubsections = require('./product_subsections.js.jsx');
const Routes = require('../../routes');
const Screenshots = require('./screenshots.js.jsx');
const Tile = require('../ui/tile.js.jsx');
const User = require('../user.js.jsx')
const UserStore = require('../../stores/user_store');
const ProductProgressWidget = require('../product_progress_widget.js.jsx');
const ChecklistStore = require('../../stores/checklist_store');

import Reveal from '../ui/reveal.js.jsx'
import OverflowFade from '../ui/overflow_fade.js.jsx'

let ProductShow = React.createClass({
  propTypes: {
    params: React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.object
    ]),
    query: React.PropTypes.object
  },

  componentDidMount() {
    document.title = this.state.product && this.state.product.name;
    window.TrackEngagement.track('product')

    ProductStore.addChangeListener(this.onProductChange);

    // This splendor is @chrislloyd. I'm sorry future maintainers!
    $.getJSON(`/api/products/${this.state.product.slug}/updates/paged.json?per=1`, function(data) {
      this.setState({
        updates: data.posts,
        updateCount: data.meta.count
      })
    }.bind(this))
    $.getJSON(Routes.api_org_bounties_path({params: {org_id: this.state.product.slug}, data: {limit: 3}}), function(data) {
      this.setState({
        bounties: data
      })
    }.bind(this))
  },

  componentWillUnmount() {
    ProductStore.removeChangeListener(this.onProductChange);
  },

  getInitialState() {
    return {
      product: this.getProductStateFromStore(),
      updates: [],
      bounties: [],
      partners: [],
      description: false
    }
  },

  getProductStateFromStore() {
    return ProductStore.getProduct()
  },

  onProductChange() {
    this.setState({
      product: this.getProductStateFromStore()
    })
  },

  render() {
    let product = this.state.product;
    let slug = product.slug;
    let user = UserStore.getUser();
    let perks = null,
        trust = null

    if (UserStore.isStaff()) {
      perks = <div className="mb3">
        <Accordion title="Partner perks">
          <div className="mxn3">
            <Tile>
              <div className="p3 border-bottom">
                <h5 className="mt0 mb0">Royalties</h5>
                <div className="gray-2">
                  On the 1st of every month partners are paid 10% of the previous month's accrued profit. The profit is split depending on the partner's current ownership.
                </div>
              </div>

              <div className="p3 border-bottom">
                <h5 className="mt0 mb0">Voting</h5>
                <div className="gray-2">
                  Your partnership means you get one vote in any decisions that are put towards the partners.
                </div>
              </div>

              <div className="p3">
                <h5 className="mt0 mb0">Updates</h5>
                <div className="gray-2">
                  Get access to parter-only updates about the product. Financials etc.
                </div>
              </div>
            </Tile>
          </div>
        </Accordion>
      </div>
    }

    if (product && _.some(_.values(product.trust))) {

      const renderTrustCol = function(field, label) {
        let icon = null
        if(product.trust[field]) {
          icon = <span className="green"><Icon icon="check-circle" fw={true} /></span>
        } else {
          icon = <span className="gray-5"><Icon icon="question-circle" fw={true} /></span>
        }
        return <div className="sm-col sm-col-6 lg-col-4 px2 mb2 clearfix">
          <div className="left mr1">
            {icon}
          </div>
          <div className="overflow-hidden">
            {label}
          </div>
        </div>
      }

      trust = <div className="py3">
                <div className="clearfix py2">
                  <h6 className="left gray-2 caps mt0 mb0">
                    Community Ownership
                  </h6>
                  <a className="right h6" href={`${product.url}/trust`}>
                    View more
                  </a>
                </div>

                <div className="clearfix mxn2">
                  {renderTrustCol('domain', 'Community held domains')}
                  {renderTrustCol('ip', 'Shared intellectual property')}
                  {renderTrustCol('hosting', 'Community held hosting')}
                  {renderTrustCol('data', 'Community held data')}
                  {renderTrustCol('finances', 'Community held finances')}
                  {renderTrustCol('ios', 'Community held iOS App account')}
                  {renderTrustCol('android', 'Community held Android App account')}
                </div>

              </div>
    }



    var team = List()

    if (product) {
      let coreTeam = List(product.core_team).map(u => [u.id, u])
      let partners = List(product.partners).map(u => [u.id, u])

      team = Map(coreTeam).merge(partners).valueSeq()
        .sortBy(u => !ProductStore.isCoreTeam(u))
    }

    return (
      <div>
        <ProductHeader />

        <div className="container mt3">
          <div className="clearfix mxn3">
            <div className="sm-col sm-col-8 px3 mb2 sm-mb0">
              <Tile>
                <Screenshots key="product-screenshots" />

                <div className="p3 sm-p4">

                  <div className="mb3">
                    <Reveal>
                      <Markdown color="black" content={product.lead + "\n" + product.description_html} normalized={true} lead={true} ref="description" />
                    </Reveal>

                    {this.renderEditButton()}
                  </div>

                  <div className="py3">
                    <div className="clearfix py2">
                      <a href={`/${product.slug}/activity`} className="right h6">View all</a>
                      <h6 className="gray-2 caps mt0 mb0">Updates ({this.state.updateCount})
                      </h6>
                    </div>
                    {this.renderUpdates()}
                  </div>

                  <div className="py3">
                    <div className="clearfix py2">
                      <h6 className="left gray-2 caps mt0 mb0">
                        Important links
                      </h6>
                    </div>

                    <ProductImportantLinks product={product} />
                  </div>

                  <div className="py3">
                    <div className="clearfix py2">
                      <h6 className="left gray-2 caps mt0 mb0">
                        Partners ({product.partners_count})
                      </h6>

                      <a className="right h6" href={`${product.url}/partners`}>View all</a>
                    </div>
                    <div className="clearfix mxn1">
                      {team.take(20).map(function(user) {
                        return <a className="left p1" key={user.id} href={user.url}>
                          <Partner user={user} product={product} size={36} />
                        </a>
                      }).toJS()}
                    </div>
                  </div>

                  {trust}

                </div>
              </Tile>
            </div>

            <div className="sm-col sm-col-4 px3">
              {this.renderProductProgressWidget()}

              <div className="mb3">
                <Accordion title="Get started">
                  <div className="mxn3">
                    <Tile>
                      {_.sortBy(this.state.bounties, (b) => b.priority).map((bounty) => {
                        return <a className="block px3 py2 clearfix border-bottom" href={bounty.url}>
                          <div className="right blue ml2">
                            <Icon icon="angle-right" />
                          </div>
                          <BountyCard bounty={bounty} key={bounty.id} />
                        </a>
                      })}
                    </Tile>
                    <a className="h6 block px3 py2 gray-2" href={`${product.url}/bounties`}>View more</a>
                  </div>
                </Accordion>
              </div>

              {perks}

              <div className="mb3">
                <MetricsBadge product={product} />
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  },

  renderProductProgressWidget() {
    var coreTeamIds = _.pluck(this.state.product.core_team, 'id')
    var isCoreTeam = _.contains(coreTeamIds, UserStore.getId())

    if (UserStore.isSignedIn() && isCoreTeam && this.state.product.state === 'stealth') {
      return (
        <div className="mb3">
          <ProductProgressWidget product={this.state.product} />
        </div>
      )
    } else {
      return null
    }
  },

  renderEditButton() {
    if (ProductStore.isCoreTeam(UserStore.getUser())) {
      let slug = this.state.product.slug;

      return (
        <div className="py1">
          <a href={Routes.edit_product_path({ id: slug })}
              className="gray-2">
            <Icon icon="pencil" /> Edit product details
          </a>
        </div>
      );
    }
  },

  renderIntroductionForm() {
    let product = this.state.product;
    let user = UserStore.getUser();

    if (user && !product.is_member) {
      return (
        <div className="mt2">
          <IntroductionForm product={product} />
        </div>
      );
    }

    return this.renderProductLead();
  },

  renderMostActiveUsers() {
    let product = this.state.product;
    let contributors = product.most_active_contributors;
    let renderedContributors = contributors.map((contributor) => {
      return (
        <span className="left mr1" key={contributor.id}>
          <a href={contributor.url}>
            <Avatar user={contributor} />
          </a>
        </span>
      );
    });

    return (
      <div className="px3 py2 border-top">
        <h5 className="mt0 mb2">Most active members</h5>
        <div className="clearfix">
          {renderedContributors}
        </div>
        <div className="gray-3 mt2">
          <a href={Routes.product_people_path({ product_id: product.slug })}
              className="gray-3 underline">
            <small>View all partners</small>
          </a>
        </div>
      </div>
    );
  },

  renderProductLead() {
    let product = this.state.product;

    return (
      <div className="h6">
        <Markdown content={product.lead} normalize={true} />
      </div>
    );
  },

  renderUpdates() {
    let product = this.state.product
    return _.first(this.state.updates, 1).map(function(update) {
      if (update.body) {
        return <a className="block clearfix py2 rounded" href={update.url} key={update.id}>
          <div className="left mr3">
            <Partner user={update.user} product={product} size={30} />
          </div>
          <div className="overflow-hidden">
            <h5 className="black mt0 mb0">{update.title}</h5>
            <p className="gray-2 mb0">{truncate(update.body.text, 120)}</p>
          </div>
        </a>
      }
    });
  },

  handleToggleDescription(e) {
    e.preventDefault()
    this.setState({
      description: !this.state.description
    })
  },

  handleMakeIdea(e) {
    $.post(this.state.product.url + '/make_idea', (data) => {
      page(data.url)
    })
  }
});

module.exports = ProductShow;
