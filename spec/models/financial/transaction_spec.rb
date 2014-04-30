require 'spec_helper'

module Financial
  describe Transaction do
    let(:product) { Product.make! }
    let(:accounts_receivable) { Asset.make!(product: product, name: 'Accounts Receivable') }
    let(:sales_revenue) { Revenue.make!(product: product, name: 'Sales Revenue') }
    let(:sales_tax_payable) { Liability.make!(product: product, name: 'Sales Tax Payable') }

    subject do
      transaction = Transaction.new(
        product: product,
        details: {
          type: 'subscription',
          customer_id: '12345',
        },
        debits: [{
          account: accounts_receivable, amount: 3995,
        }],
        credits: [{
          account: sales_revenue, amount: 3193,
        }, {
          account: sales_tax_payable, amount: 802,
        }]
      )
      transaction.save!
      transaction.reload
    end

    its(:details) { should == { 'type' => 'subscription', 'customer_id' => '12345'} }

    it 'has credits' do
      subject.credit_accounts.should =~ [sales_revenue, sales_tax_payable]
    end

    it 'has debits' do
      subject.debit_accounts.should =~ [accounts_receivable]
    end
  end
end
