require 'spec_helper'

describe 'showing bounty' do
  let!(:user) { User.make! }
  let!(:product) { Product.make! }
  let!(:chat_room) { ChatRoom.make!(slug: product.slug, product: product) }

  before { login_as(user, scope: :user) }

  it 'shows bounty', js: true do
    task = Task.make!(title: 'Design a new logo', product: product)
    NewsFeedItem.create_with_target(task)

    visit product_wip_path(product, task)

    expect(page).to have_text('Design a new logo')
    expect(page).to have_text('Assign to me')
  end
end
