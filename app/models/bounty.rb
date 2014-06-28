class Bounty
  attr_reader :product, :task

  def initialize(task)
    @task = task
    @product = task.product
  end

  def total_cents
    @total_cents ||= product.decorate.current_exchange_rate * task.score * 100
  end

  def earnable_cents
    total_cents - tip_cents
  end

  def core_team_contracts
    @core_team_contracts ||= tip_contracts.select{|c| product.core_team.include? c.user }
  end

  def product_contracts
    @product_contracts ||= (tip_contracts - core_team_contracts)
  end

  def tip_contracts
    @tip_contracts ||= product.auto_tip_contracts.active
  end

  def tip_cents
    @tip_cents ||= tip_contracts.map{|c| c.amount * total_cents }.reduce(:+)
  end
end