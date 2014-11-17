module Karma
  class Kwesting

    FIRST_BOUNTY_KARMA = 25

    def do_first_bounty(user_id)

      title = "First Bounty"

      bounty_deeds = Deed.where(user_id: user_id).where(karma_event_type: "Wip")
      bounty_values = bounty_deeds.uniq.pluck(:karma_value)

      found_kwests = Kwest.where(user_id: user_id).where(title: title)

      if bounty_values.include?(Karma::Kalkulate.new.BOUNTY_KARMA_VALUE) and found_kwests.count == 0
        the_kwest = Kwest.create!({title: title, user_id: user_id})
        chronicle_id = Karma::Kalkulate.new.get_chronicle_id(user_id)
        Deed.create!({karma_value: FIRST_BOUNTY_KARMA, karma_event: the_kwest, user_id: user_id, chronicle_id: chronicle_id})
      end
    end

  end
end
