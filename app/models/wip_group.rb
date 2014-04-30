class WipGroup
  # Groups wip entities into products => wips => comments. Useful for
  # contstructing newsletters from an array of Wips and Comments

  attr_reader :products, :watchers

  def initialize(entities)
    @entities = entities

    @products = {}
    @watchers = []

    entities.each do |o|
      case o
      when Task, Discussion
        @products[o.product] ||= {}
        @products[o.product][o] ||= []
        @watchers += o.watchers
      when Event::Comment
        @products[o.wip.product] ||= {}
        @products[o.wip.product][o.wip] ||= []
        @products[o.wip.product][o.wip] << o
        @watchers += o.wip.watchers
      end
    end

    @watchers = @watchers.uniq
  end

  def count
    @entities.count
  end

  def product_names
    products.keys.map(&:name)
  end
end