module ActiveRecord
  module UUID
    def self.included(model)
      model.primary_key = :id

      model.before_create do
        self.id = SecureRandom.uuid
      end
    end
  end
end

class String
  def uuid?
    self =~ /^[a-f0-9\-]{18}/
  end
end
