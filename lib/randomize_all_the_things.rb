module RandomizeAllTheThings
  extend ActiveSupport::Concern

  included do
    scope :random, -> { order("Random()") }
  end

  module ClassMethods
    def sample
      random.first
    end
  end
end
