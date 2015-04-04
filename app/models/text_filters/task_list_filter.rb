module TextFilters
  class TaskListFilter < HTML::Pipeline::Filter
    MATCH_PATTERN = /<li>\s*\[(x| )\](.*)<\/li>/m

    def call
      @index = 0
      doc.search("li").each do |el|
        replace_with_component(el)
      end
      doc
    end

    def replace_with_component(el)
      if el.to_html =~ MATCH_PATTERN
        node = Nokogiri::XML::Node.new('div',doc)
        node['data-react-class'] = 'TaskListItem'
        node['data-react-props'] = JSON.generate({
          body: $2.strip,
          checked: $1 == 'x',
          index: @index
        })

        @index += 1

        el.content = ''
        el.add_child node
        el['class'] = 'with-checkbox'
      end
    end
  end
end
