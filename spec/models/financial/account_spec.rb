require 'spec_helper'

module Financial
  describe Account do
    let(:product) { Product.make! }
    let(:account) { Revenue.make!(product: product, name: 'Sales') }

    before { account.save! }

    subject { account.reload }

    its(:name) { should == 'Sales' }
  end
end
