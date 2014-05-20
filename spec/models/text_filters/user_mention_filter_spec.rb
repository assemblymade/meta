require 'spec_helper'

describe TextFilters::UserMentionFilter do
  def filter(html, base_url='/')
    TextFilters::UserMentionFilter.call(html, users_base_url: base_url)
  end

  let(:pinged) { User.make! name: 'Matt Deiters', username: 'mattd' }

  context 'user exists' do
    before { pinged }

    it 'replaces mention with link' do
      body = "<p>Hey @mattd check dis</p>"
      res  = filter(body, '/users')

      link = "<a href=\"/users/#{pinged.username}\" class=\"user-mention\">@mattd</a>"

      res.to_html.should == "<p>Hey #{link} check dis</p>"
    end
  end

  context "user doesn't exist" do
    it 'replaces mention with link' do
      body = "<p>Hey @someguy check dis</p>"
      res  = filter(body, '/users')
      res.to_html.should == "<p>Hey @someguy check dis</p>"
    end
  end
end
