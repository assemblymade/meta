class WipContracts
  attr_reader :product, :task

  def initialize(task, auto_tip_contracts=nil)
    @task = task
    @product = task.product
    @auto_tip_contracts = auto_tip_contracts
  end

  def total_cents
    @total_cents ||= (task.value || 0)
  end

  def earnable_cents
    total_cents - tip_cents
  end

  def tip_contracts
    auto_tip_contracts
  end

  def author_contract
    TipContract.new(percentage: task.author_tip, user: task.user) if task.author_tip > 0
  end

  def auto_tip_contracts
    @auto_tip_contracts ||= product.auto_tip_contracts.active
  end

  def product_contracts
    @product_contracts ||= (auto_tip_contracts - core_team_contracts)
  end

  def tip_cents
    return 0 if tip_contracts.empty?
    @tip_cents ||= tip_contracts.map{|c| c.percentage * total_cents }.reduce(:+).round.to_i
  end

  def tip_percentage
    return 0 if tip_contracts.empty?
    @tip_percentage ||= tip_contracts.map{|c| c.percentage }.reduce(:+)
  end

  def core_team_contracts
    @core_team_contracts ||= auto_tip_contracts.select{|c| product.core_team.include? c.user }
  end

  # (pletcher) FIXME: Serializers call this method with an argument; it was failing
  def as_json(arg=nil)
    h = {
      total: total_cents,
      earnable: earnable_cents,
      core_team: {
        percentage: core_team_contracts.map(&:amount).sum.to_f
      },
      others: product_contracts.map{|c| {
        username: c.user.username,
        percentage: c.percentage.to_f
      }}
    }

    if task.author_tip > 0
      h[:author] = {
        username: task.user.username,
        percentage: task.author_tip.to_f
      }
    end
    h
  end
end
