require 'forwardable'

class IdeaLeaderboard
  extend Forwardable

  attr_accessor :leaderboard

  def_delegator :leaderboard, :size

  def initialize(leaderboard)
    @leaderboard = leaderboard
  end

  def add(product)
    @leaderboard.add(product.id, product.score)
    product.touch
  end

  def remove(product)
    @leaderboard.remove(product.id)
  end

  def range(start, fin)
    members = @leaderboard.range(start, fin)
    ids = members.map {|member| member[0]}
    Product.approved.where(id: ids).sort_by{|product| ids.index(product.id) }
  end

  def idea_at(rank)
    range(rank, rank).first
  end

  def top(n)
    range(0, n - 1)
  end

  def top_score
    @leaderboard.score_at(0)
  end

  def rank_for(product)
    @leaderboard.rank_for(product.id)
  end

  alias_method :index, :rank_for

  def score_for(product)
    @leaderboard.score_for(product.id)
  end

  def leader?(product)
    rank_for(product).zero?
  end

  def next_score_for(product)
    idea_rank = rank_for(product)
    if idea_rank && idea_rank > 0
      @leaderboard.score_at(idea_rank - 1)
    else
      Float::INFINITY
    end
  end

  def rebuild!
    @leaderboard.clear
    Product.approved.validating.find_each {|product| add(product) }
  end

  def size
    @leaderboard.size
  end

end
