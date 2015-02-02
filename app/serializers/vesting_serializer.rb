class VestingSerializer < ApplicationSerializer

  attributes :user, :product, :vesting_date_formatted, :coins, :proposal

  def proposal
    ProposalSerializer.new(self.proposal)
  end

  def user
    UserSerializer.new(object.user)
  end

  def product
    ProductSerializer.new(object.product)
  end

  def vesting_date_formatted
    object.expiration_date.strftime("%b %e, %Y")
  end

end
