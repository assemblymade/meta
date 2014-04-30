module TextFilters
  class ShortcutFilter  < HTML::Pipeline::Filter

    def self.shortcuts_in(text)
      text.gsub Pattern do |match|
        yield match, $1.to_i
      end
    end

    Pattern = /
      \#(\d+)          # number
      (?=
        [^0-9a-zA-Z_]| # non-word character except dot
        $              # end of line
      )
    /ix

    IGNORE_PARENTS = %w(pre code a).to_set

    def call
      result[:shortcuts] ||= []

      doc.search('text()').each do |node|
        content = node.to_html
        next if !content.include?('#')
        next if has_ancestor?(node, IGNORE_PARENTS)
        html = shortcut_filter(content)
        next if html == content
        node.replace(html)
      end

      doc
    end

    def shortcut_filter(text)
      self.class.shortcuts_in(text) do |match, number|
        link_to_shortcut(number)
      end
    end

    def link_to_shortcut(number)
      result[:shortcuts] |= [number]
      url = File.join(context[:product_url], number.to_s)
      %{<a href="#{url}" class="shortcut">##{wip}</a>}
    end
  end

end
