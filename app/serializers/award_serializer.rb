class AwardSerializer < ApplicationSerializer
  attributes :coins, :bounty

  def coins
    object.cents
  end

  def bounty
    {
      product: ProductShallowSerializer.new(object.wip.product),
      title: object.wip.title,
      url: url_for(object.wip.url_params)
    }
  end


end
