require 'spec_helper'

describe 'creating a chat room comment' do
  let!(:user) { User.make! }
  let!(:product) { Product.make! }
  let!(:chat_room) { ChatRoom.make!(slug: product.slug, product: product) }

  before { login_as(user, scope: user) }

  it 'creates a comment and pushes the message into the feed', js: true do
    visit chat_room_path(chat_room)

    page.driver.debug

    page.find('#comment textarea').set('Good morning everyone!')
    page.find('#comment textarea').native.send_keys(:return)

    expect(page).to have_text('Good morning everyone!')
  end
end
