/** @jsx React.DOM */

(function() {
  var BountyList = React.createClass({
    // TODO: Pagination
    renderBounties: function() {
      if(!this.props.bounties.length) {
        return
      }

      return (
        <ol className="list-group list-group-breakout list-group-padded" id="wips-view-el">
          {this.renderBountyListItems()}
        </ol>
      )
    },

    renderBountyListItems: function() {
      var product = this.props.product

      return this.props.bounties.map(function(bounty) {
        return (
          <li className="list-group-item">
            <BountyListItem bounty={bounty} product={product} />
          </li>
        )
      })
    },

    // TODO
    renderEmptyState: function() {
    },

    render: function() {
      return (
        <div className="row">
          <div className="col-xs-12">
            {this.renderBounties()}
            {this.renderEmptyState()}
          </div>
        </div>
      )
    }
  });

  if (typeof module !== 'undefined') {
    module.exports = BountyList
  }

  window.BountyList = BountyList
})();

/*
<div class="row">
  <% if @product.tasks.any? %>
    <div class="col-xs-12">
      <% if @wips.any? %>
        <ol class="list-group list-group-breakout list-group-padded" id="wips-view-el">
          <% @wips.each do |task| %>
            <li class="list-group-item"><%= render 'bounties/chip', bounty: task %></li>
          <% end %>
        </ol>

        <% if @wips.total_pages > 1 %>
          <hr>

          <%= paginate @wips, theme: 'twitter-bootstrap-3' %>
        <% end %>
      <% end %>
    </div>
  <% else %>
    <div class="col-md-6 col-md-offset-3">
      <div class="well well-lg omega">
        <h3 class="alpha"><strong>Create the first bounty</strong></h3>
        <p class="text-muted">
          Get started by breaking down a new idea into bite-sized chunks
          that can valued and prioritized. Writing a great description will
          make it super easy for anyone to jump in and get to work.
        </p>

        <div data-react-class="CreateBountyButton" data-react-props="<%= {
          product: { name: @product.name },
          url: product_wips_path(@product),
          maxOffer: (6 * @product.average_bounty).round(-4),
          averageBounty: @product.average_bounty,
          coinsMinted: @product.coins_minted,
          profitLastMonth: @product.profit_last_month,
          steps: BountyGuidance::Valuations.suggestions(@product)
        }.to_json %>" class="omega text-center"></div>
      </div>
    </div>
  <% end %>
</div>
*/
