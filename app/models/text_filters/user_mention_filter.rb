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

    def self.mentioned_usernames_in(text, wip = nil)
      text.gsub MentionPattern do |match|
        login = $1
        if $1.downcase == 'core' && !wip.nil?
          wip.product.core_team.each do |user|
            yield user, $1
          end
        else
          user = User.find_by('username ilike ?', login)
          yield user, $1
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
        html = mention_link_filter(content, context[:users_base_url])
        next if html == content
        node.replace(html)
      end
      doc
    end

    # Replace user @mentions in text with links to the mentioned user's
    # profile page.
    #
    # text      - String text to replace @mention usernames in.
    # base_url  - The base URL used to construct user profile URLs.
    #
    # Returns a string with @mentions replaced with links. All links have a
    # 'user-mention' class name attached for styling.
    def mention_link_filter(text, base_url='/')
      self.class.mentioned_usernames_in(text) do |user, unmatched|
        if user
          link_to_mentioned_user(user, unmatched)
        elsif unmatched == 'core'
          " <a href='/core-team' class='user-mention'>@core</a>"
        else
          " @#{unmatched}"
        end
      end
    end

    def link_to_mentioned_user(user, unmatched)
      result[:mentioned_usernames] |= [user.name]
      url = File.join(context[:users_base_url], user.to_param)
      " <a href='#{url}' class='user-mention'>" +
        "@#{user.username}" +
      ["</a>"].join(' ')
    end
  end
end
