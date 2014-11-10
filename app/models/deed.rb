class Deed < ActiveRecord::Base
  belongs_to :user
  belongs_to :karma_event, polymorphic: true

  # def self.create(type, karma_value, user_id, event_id)
  #   self.update!(id: SecureRandom.uuid, type: type, karma_value: karma_value, created_at: DateTime.now, event_entry_id: event_id)
  # end

  def award_for_product_to_stealth(product)

    karma_value = 1.0
    user_id = product.user_id

    chronicle = Chronicle.find_by(user_id: user_id)
    if not chronicle.nil?
      chronicle_id = chronicle.id
    else
      chronicle = Chronicle.create!(user_id: user_id)
      chronicle_id = chronicle.id
    end

    Deed.create!({karma_value: karma_value, karma_event: product, user_id: user_id, chronicle_id: chronicle_id})

  end

end
