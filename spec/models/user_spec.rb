require 'spec_helper'

describe User do
  let(:user) { User.make! }
  let(:product) { Product.make! }

  it 'defaults to immediate email' do
    expect(user.mail_preference).to eq(User::MAIL_IMMEDIATE)
  end

  it 'indicates if the user has already voted' do
    expect {
      product.votes.create user: user, ip: '127.0.0.1'
    }.to change { user.has_voted_for?(product) }.from(false).to(true)
  end

  it 'should get a list of a users contributions' do
    event = Event::Comment.make!
    user = event.user
    user.wips_contributed_to.should include(event.wip)
  end

  describe '#ensure_stripe_customer!' do
    it 'saves stripe customer id' do
      expect(Stripe::Customer).to receive(:create).with(email: user.email, card: 't_1234') { FakeStripeCustomer.new('cus_1234') }
      user.ensure_stripe_customer!('t_1234')
      user.reload.customer_id.should == 'cus_1234'
    end
  end

  it 'indicates when users are using paypal' do
    user = User.make!(payment_option: PaymentOption::PAYPAL, paypal_email: Faker::Internet.email)
    user.should be_paid_via_paypal
    user.should_not be_paid_via_ach
    user.should_not be_missing_payment_information
  end

  it 'indicates when users are using ach' do
    user = User.make!(payment_option: PaymentOption::ACH,
      bank_account_id: rand(1000),
      bank_name:     'US BANK',
      bank_last4:    rand(9999).to_s.rjust(4, '0'),
      address_line1: Faker::Address.street_address,
      address_city:  Faker::Address.city,
      address_zip:   Faker::AddressUS.zip_code)
    user.should be_paid_via_ach
    user.should_not be_paid_via_paypal
    user.should_not be_missing_payment_information
  end

  it 'indicates when users are missing payment information' do
    user = User.make!
    user.should be_missing_payment_information
    user.should_not be_paid_via_paypal
    user.should_not be_paid_via_ach
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

     User.awaiting_personal_email.should include(user)
     UserMailer.follow_up(user.id)
     User.awaiting_personal_email.should_not include(user)
  end
end