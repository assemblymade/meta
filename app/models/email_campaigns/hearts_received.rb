module EmailCampaigns
  class HeartsReceived

    # marks hearts as sent and returns params for emails
    def process!
      recent_hearts = Heart.includes(:heartable).where('created_at > ?', 12.hours.ago)

      by_user = recent_hearts.select(&:heartable).each_with_object({}) do |heart, o|
        author_id = heart.heartable.author_id
        o[author_id] ||= []
        o[author_id] << heart unless author_id == heart.user_id
      end

      send = {}
      by_user.each do |user_id, hearts|
        last_sent_at = hearts.map(&:sent_at).compact.sort.last

        if last_sent_at.nil? || last_sent_at < 3.hours.ago
          unsent_hearts = hearts.select{|h| h.sent_at.nil? }
          oldest_unsent_heart = unsent_hearts.map(&:created_at).sort.first

          if oldest_unsent_heart.nil? || oldest_unsent_heart < 30.minutes.ago

            send[user_id] = unsent_hearts.map(&:id) if unsent_hearts.any?
            unsent_hearts.each{|h| h.update! sent_at: Time.now }
          end
        end
      end
      send
    end
  end
end
