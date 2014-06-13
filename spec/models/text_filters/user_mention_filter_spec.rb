require 'spec_helper'

describe TextFilters::UserMentionFilter do
  def filter(html, users_base_url='/users', people_base_url='/people')
    TextFilters::UserMentionFilter.call(
      html,
      users_base_url: users_base_url,
      people_base_url: people_base_url,
      product: product
    )
  end

  let!(:product) { Product.make! }
  let!(:pinged) { User.make! name: 'Matt Deiters', username: 'mattd' }
  let!(:interest) { Interest.make! slug: 'design' }

  context 'user exists' do
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

  context "@mentioned an interest" do
    it 'replaces interest with link' do
      body = "<p>Check this out @design</p>"
      res  = filter(body)

      link = "<a href=\"/people?filter=design\" class=\"user-mention\">@design</a>"
      expect(res.to_html).to eq("<p>Check this out #{link}</p>")
    end
  end

  context "@mentioned @core" do
    it 'replaces @core with link' do
      body = "<p>Check this out @core</p>"
      res  = filter(body)

      link = "<a href=\"/people?filter=core\" class=\"user-mention\">@core</a>"
      expect(res.to_html).to eq("<p>Check this out #{link}</p>")
    end
  end
end
