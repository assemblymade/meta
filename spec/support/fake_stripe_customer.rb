class FakeStripeCustomer
  attr_reader :id

  def initialize(customer_id=nil)
    @id = customer_id
  end

  def default_card
    "4444"
  end
end

class FakeStripeCustomerEnsurer
  def ensure!
    @ensured = true
  end

  def customer
    raise 'Not ensured!' unless @ensured

    FakeStripeCustomer.new
  end
end