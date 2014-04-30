class ProductMission < Missions::Base
  attr_reader :product, :mission_definition

  def self.next_mission_for_product(product)
    if mission_id = remaining_missions(completed_mission_ids(product)).first
      new(ProductMissionDefinitions.find(mission_id), product)
    end
  end

  def self.mission_after(completed_mission_ids, product)
    if mission_id = remaining_missions(completed_mission_ids).first
      find(mission_id, product)
    end
  end

  def self.completed_mission_ids(product)
    product.completed_missions.pluck(:mission_id).map(&:to_sym)
  end

  def self.remaining_missions(completed_mission_ids)
    mission_definition_ids - completed_mission_ids
  end

  def self.mission_definition_ids
    ProductMissionDefinitions.missions.map(&:id)
  end

  def self.find(mission_id, product)
    new(ProductMissionDefinitions.find(mission_id.to_sym), product)
  end

  def initialize(mission_definition, product)
    super(mission_definition)
    @product = product
  end

  def id
    mission_definition.id
  end

  def next_if_complete!(completor)
    complete!(completor) if complete?
  end

  def complete!(completor)
    completed_mission = Product.transaction do
      completed
      product.completed_missions.create!(
        mission_id: mission_definition.id,
        completor: completor
      )
    end

    StreamEvent.add_mission_completed_event!(actor: completor, subject: completed_mission, target: product)
  end

  def next?
    !self.next.nil?
  end

  def next
    ProductMission.mission_after(
      ProductMission.completed_mission_ids(product) + [id],
      product
    )
  end

  def previous
    if mission_id = ProductMission.completed_mission_ids(product).last
      ProductMission.find(mission_id, product)
    end
  end

  def previous?
    !self.previous.nil?
  end
end
