require 'uri'

module TextFilters
  class NoFollowLinksFilter < HTML::Pipeline::Filter

    SAFE_DOMAIN = 'assembly.com'.freeze

    def self.legit_url?(url)
      begin
        host = URI(url).host
        host.nil? || host.end_with?(SAFE_DOMAIN)
      rescue URI::InvalidURIError
        true
      end
    end

    def call
      doc.search("a").each do |a|
        next if a['href'].nil?

        href = a['href'].strip

        if !self.class.legit_url?(href)
          a['rel'] = 'nofollow'
        end
      end
      doc
    end

  end
end
