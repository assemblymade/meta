class WorkContracts
  attr_reader :product, :work

  def initialize(work)
    @work = work
    @product = work.product
  end

  # def total_cents
  #   @total_cents ||= product.decorate.current_exchange_rate * task.score * 100
  # end
  #
  # def earnable_cents
  #   total_cents - tip_cents
  # end
  #
  def tip_contracts
    auto_tip_contracts
  end
  #
  # def author_contract
  #   TipContract.new(percentage: task.author_tip, user: task.user) if task.author_tip > 0
  # end
  #
  def auto_tip_contracts
    @auto_tip_contracts ||= product.auto_tip_contracts.active
  end
  #
  # def product_contracts
  #   @product_contracts ||= (tip_contracts - core_team_contracts)
  # end
  #
  # def tip_cents
  #   @tip_cents ||= auto_tip_contracts.map{|c| c.amount * total_cents }.reduce(:+)
  # end
  #
  # def tip_percentage
  #   @tip_percentage ||= tip_contracts.map{|c| c.percentage }.reduce(:+)
  # end
  #
  # def core_team_contracts
  #   @core_team_contracts ||= auto_tip_contracts.select{|c| product.core_team.include? c.user }
  # end
end