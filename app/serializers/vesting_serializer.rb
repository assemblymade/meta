class VestingSerializer < ApplicationSerializer

  attributes :user, :vesting_date_formatted, :coins, :vote_status, :created_on

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

  def created_on
    object.created_at.strftime("%b %e, %Y")
  end

  def vote_status
    object.proposal.vote_ratio
  end


end
