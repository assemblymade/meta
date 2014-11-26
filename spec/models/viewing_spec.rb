require 'spec_helper'

describe Viewing do
  user = User.sample
  product = Product.sample
  viewing  = Viewing.new({user: user, viewable: product})
  viewing.user == user && viewing.viewable == product
end
