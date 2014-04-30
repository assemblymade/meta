class ProductLeaderboard
  include Enumerable
  include ActiveModel::SerializerSupport

  attr_reader :start_time, :items

  def initialize(product, start_time)
    @product = product
    @start_time = start_time
  end

  def items
    @items ||= @product.wips.won_after(start_time).group_by(&:winner).map do |user, wips|
      sum_wip_scores = wips.inject(0) {|sum, wip| sum + wip.score }
      LeaderboardItem.new(self, user, sum_wip_scores)
    end.sort_by {|item| - item.value }
  end

  def each
    items.each do |item|
      yield(item)
    end
  end

  def sum_values
    items.inject(0) {|sum, item| sum + item.value }
  end

  def rank_for(leaderboard_item)
    items.index(leaderboard_item)
  end

end
