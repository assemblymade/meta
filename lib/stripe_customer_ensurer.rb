require 'stripe'

class StripeCustomerEnsurer

  attr_reader :created_stripe_customer

  def initialize(user, card_token)
    @user = user
    @card_token = card_token
  end

  def customer?
    @user.customer_id?
  end

  def customer
    @customer ||= Stripe::Customer.retrieve(@user.customer_id)
  end

  def ensure!
    if not customer?
      create!
    else
      update!
    end
  end

  def create!
    @customer = Stripe::Customer.create(
      email: @user.email,
      card:  @card_token
    )

    @user.customer_id = @customer.id
    @user.save!
  end

  def update!
    customer.card = @card_token
    customer.save
  end

end
