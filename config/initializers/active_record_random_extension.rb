ActiveRecord::Base.class_eval do
  def self.inherited(child)
    child.class_eval do
      include RandomizeAllTheThings
    end
    super child
  end
end