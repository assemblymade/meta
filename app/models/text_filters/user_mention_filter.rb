require 'set'

module TextFilters
  class UserMentionFilter < HTML::Pipeline::MentionFilter
    MentionPattern = /
        (?:^|\W)                   # beginning of string or non-word char
        @((?>[a-z0-9][a-z0-9-]*))  # @username
        (?!\/)                     # without a trailing slash
        (?=
          \.+[ \t\W]|              # dots followed by space or non-word character
          \.+$|                    # dots at end of line
          [^0-9a-zA-Z_.]|          # non-word character except dot
          $                        # end of line
        )
      /ix

    def self.mentioned_usernames_in(text, product = nil)
      text.gsub MentionPattern do |match|
        mention = $1.downcase

        if mention == 'core'
          if product
            yield $1, product.core_team, Interest.new(slug: 'core')
          end

        elsif user = User.find_by('lower(username) = ?', mention)
          yield $1, user

        elsif interest = Interest.find_by(slug: mention)
          yield $1, nil, interest

        else
          yield $1

        end
      end
    end

    # Don't look for mentions in text nodes that are children of these elements
    IGNORE_USER_PARENTS = %w(pre code a).to_set

    def call
      result[:mentioned_usernames] ||= []

      doc.search('text()').each do |node|
        content = node.to_html
        next if !content.include?('@')
        next if has_ancestor?(node, IGNORE_USER_PARENTS)
        html = mention_link_filter(content, context[:users_base_url], context[:people_base_url])
        next if html == content
        node.swap(Nokogiri::XML::DocumentFragment.new(doc, html))
      end
      doc
    end

    # Replace user @mentions in text with links to the mentioned user's
    # profile page.
    #
    # text            - String text to replace @mention usernames in.
    # users_base_url  - The base URL used to construct user profile URLs.
    # people_base_url - The base URL used to construct people URLs.
    #
    # Returns a string with @mentions replaced with links. All links have a
    # 'user-mention' class name attached for styling.
    def mention_link_filter(text, users_base_url='/', people_base_url='/')
      self.class.mentioned_usernames_in(text, context[:product]) do |unmatched, user, interest|
        if user && user.class == User
          link_to_mention(
            File.join(context[:users_base_url], user.to_param),
            user.username
          )

        elsif interest
          link_to_mention(
            "#{context[:people_base_url]}?filter=#{interest.slug}",
            interest.slug
          )

        else
          " @#{unmatched}"
        end
      end
    end

    def link_to_mention(url, label)
      " <a href='#{url}' class='user-mention'>@#{label}</a>"
    end
  end
end
