class WipGroup
  # Groups wip entities into products => wips => comments. Useful for
  # contstructing newsletters from an array of Wips and Comments

  attr_reader :products, :watchers

  def initialize(entities)
    @entities = entities

    @products = {}
    @watchers = {}

    entities.each do |o|
      case o
      when Task, Discussion
        product = o.product
        @products[product] ||= {}
        @products[product][o] ||= []
        @watchers[product.id] ||= o.watcher_ids
      when Event::Comment
        wip = o.wip
        product = wip.product
        @products[product] ||= {}
        @products[product][wip] ||= []
        @products[product][wip] << o
        @watchers[wip.id] ||= wip.watcher_ids
      end
    end

    @watchers = User.find(@watchers.values.flatten.uniq)
  end

  def count
    @entities.count
  end

  def product_names
    products.keys.map(&:name)
  end
end