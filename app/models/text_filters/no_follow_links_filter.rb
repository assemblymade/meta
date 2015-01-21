require 'uri'

module TextFilters
  class NoFollowLinksFilter < HTML::Pipeline::Filter

    SAFE_DOMAIN = 'assembly.com'.freeze

    def self.spammy_url?(url)
      !URI(url).host.end_with?(SAFE_DOMAIN)
    end

    def call
      doc.search("a").each do |a|
        next if a['href'].nil?

        href = a['href'].strip

        if self.class.spammy_url?(href)
          a['rel'] = 'nofollow'
        end
      end
      doc
    end

  end
end
