require 'spec_helper'

describe User do
  let(:user) { User.make! }
  let(:product) { Product.make! }

  it 'sets default mail preference' do
    expect(user.mail_preference).to eq(User::MAIL_DAILY)
  end

  it 'should return wips a user is working on' do
    user = User.make!
    task = Task.make!
    user.wips_working_on.should be_empty
    task.start_work!(user)
    user.wips_working_on.should include(task)
  end

  it 'should not return wips completed that a user has worked on' do
    user = User.make!
    task = Task.make!
    task.start_work!(user)
    task.review_me!(user)
    user.wips_working_on.should_not include(task)
  end

  it 'should get wips user has allocated by product' do
    user = User.make!
    task = Task.make!
    task.start_work!(user)
    product = task.product

    other_products_task = Task.make!
    other_products_task.start_work!(user)
    other_product = other_products_task.product

    user.wips_working_on.by_product(product).should include(task)
    user.wips_working_on.by_product(other_product).should_not include(task)
  end

  it 'should receive a personal follow up email 3 days after they stop using the site' do
     user = Timecop.freeze(10.days.ago) do
       User.make!
     end

     Timecop.freeze(8.days.ago) do
       User.awaiting_personal_email.should be_empty
     end

     Timecop.freeze(7.days.ago) do
       user.touch(:last_request_at)
       User.awaiting_personal_email.should be_empty
     end

     expect(User.awaiting_personal_email).to include(user)
     UserMailer.follow_up(user.id).deliver_now
     expect(User.awaiting_personal_email).to_not include(user)
  end
end
