class WipContracts
  attr_reader :product, :task

  def initialize(task)
    @task = task
    @product = task.product
  end

  def total_cents
    @total_cents ||= task.value
  end

  def earnable_cents
    total_cents - tip_cents
  end

  def tip_contracts
    ([author_contract] + auto_tip_contracts).compact
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
    @tip_cents ||= tip_contracts.map{|c| c.percentage * total_cents }.reduce(:+)
  end

  def tip_percentage
    @tip_percentage ||= tip_contracts.map{|c| c.percentage }.reduce(:+)
  end

  def core_team_contracts
    @core_team_contracts ||= auto_tip_contracts.select{|c| product.core_team.include? c.user }
  end
end
