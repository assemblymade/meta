class WorkContracts
  attr_reader :product, :work

  def initialize(work)
    @work = work
    @product = work.product
  end

  def tip_contracts
    auto_tip_contracts
  end

  def auto_tip_contracts
    @auto_tip_contracts ||= product.auto_tip_contracts.active
  end
end
