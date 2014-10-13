class Urgency
  attr_reader :label, :multiplier

  def self.find(multiplier)
    all.find{|u| u.multiplier == multiplier }
  end

  def initialize(options)
    @multiplier = options.fetch(:multiplier)
    @label = options.fetch(:label)
  end

  def slug
    label.downcase
  end

  def self.all
    [
      Urgency.new(multiplier: 2.00, label: 'Urgent'),
      Urgency.new(multiplier: 1.00, label: 'Now'),
      Urgency.new(multiplier: 0.75, label: 'Someday'),
    ]
  end

  def self.find_by_slug!(slug)
    all.find{|u| u.slug == slug }.tap{|u| raise ActiveRecord::RecordNotFound if u.nil? }
  end

  def self.multipliers
    all.map(&:multiplier)
  end
  
  def serializable_hash
    {
      label: label,
      multiplier: multiplier
    }
  end
end
