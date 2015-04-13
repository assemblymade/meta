class AwardSerializer < ApplicationSerializer
  attributes :bounty, :coins, :state

  def bounty
    {
      product: ProductShallowSerializer.new(object.wip.product),
      title: object.wip.title,
      url: url_for(object.wip.url_params)
    }
  end

  def coins
    object.cents
  end

  def state
    object.winner ? 'awarded' : 'pending'
  end

end
