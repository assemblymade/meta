require 'spec_helper'

describe Work do
  let(:product) { Product.make! }
  subject {
    Work.make!(
      product: product,
      url: 'https://github.com/helpful/web/commit/ca201959a7e87794c8d30edd3cbeaf8a341adc46',
      metadata: {
        author: {
          name: "Dave Newman",
          email: "dave@assembly.com",
          username: "whatupdave"
        }
      }
    )
  }

  its(:url) { should == 'https://github.com/helpful/web/commit/ca201959a7e87794c8d30edd3cbeaf8a341adc46' }
  its(:metadata) { should == {
      'author' => {
        'name'     => "Dave Newman",
        'email'    => "dave@assembly.com",
        'username' => "whatupdave"
      }
    }
  }

end
