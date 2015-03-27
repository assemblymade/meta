require 'spec_helper'

describe TextFilters::TaskListFilter do
  def filter(html)
    @result = {}
    TextFilters::TaskListFilter.call(html, {}, @result)
  end

  context 'task list items' do
    it 'replaces with react components' do
      body = %Q{
        <ul>
          <li>[ ] a task list item</li>
          <li>[x] completed</li>
        </ul>
      }
      expect(filter(body).to_html).to eq(%Q{
        <ul>
          <li class="with-checkbox"><div data-react-class="TaskListItem" data-react-props='{"body":"a task list item","checked":false,"index":0}'></div></li>
          <li class="with-checkbox"><div data-react-class="TaskListItem" data-react-props='{"body":"completed","checked":true,"index":1}'></div></li>
        </ul>
      })
    end
  end
end
