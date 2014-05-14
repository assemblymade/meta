require 'spec_helper'

describe Ideas::VotesController do
  it 'congratulates user on new sign up' do
    Sidekiq::Testing.inline!
    sign_in(new_user = User.make!)

    product  = Product.make!
    product.upvote! product.user, '0.0.0.0'

    post :create, id: product.id

    last_email.should_not be_nil
    last_email.subject.should == "#{product.name} just got its first signup!"
  end
end
