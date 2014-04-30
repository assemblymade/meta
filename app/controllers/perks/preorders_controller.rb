class Perks::PreordersController < ApplicationController

  before_action :authenticate_user!

  def new
    @perk = Perk.find(params.fetch(:perk_id))
  end

  def create
    perk = Perk.find(params.fetch(:perk_id))
    variation = params.fetch(:variation)

    current_user.ensure_stripe_customer!(params.fetch(:stripeToken))

    @preorder = Preorder.new(
      user:     current_user,
      perk:     perk,
      card_id:  current_user.stripe_customer.default_card,
      ip:       request.remote_ip,
      variation: variation,
    )
    @preorder.save!

    perk.product.votes.create(user: current_user, ip: request.remote_ip)

    flash[:notice] = "Thanks for pre-ordering and supporting #{perk.product.name}! We will let you know when the app is green lit for development. We wont charge charge your card until then."

    redirect_to product_path(perk.product)
  end

end
