module TextFilters
  class TaskListFilter < HTML::Pipeline::Filter
    MATCH_PATTERN = /^\[(x| )\](.*)$/

    def call
      @index = 0
      doc.search("li").each do |el|
        replace_with_component el
      end
      doc
    end

    def replace_with_component(el)
      if el.content =~ MATCH_PATTERN
        node = Nokogiri::XML::Node.new('div',doc)
        node['data-react-class'] = 'TaskListItem'
        node['data-react-props'] = {
          body: $2.strip,
          checked: $1 == 'x',
          index: @index
        }.to_json

        @index += 1

        el.content = ''
        el.add_child node
        el['class'] = 'with-checkbox'
      end
    end
  end
end
