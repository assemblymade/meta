require 'spec_helper'

describe ExpenseClaimsController do
  let(:user) { User.make! }
  let(:product) { Product.make! }
  let(:attachments) { [Attachment.make!, Attachment.make!] }

  context '#create' do
    before {
      sign_in user

      post :create, product_id: product.slug, expense_claim: {
        total_dollars: "49.95",
        description: 'hosting',
        attachment_ids: attachments.map(&:id)
      }
    }

    it 'creates a valid expense claim' do
      expect(assigns(:expense_claim)).to be_persisted
      expect(assigns(:expense_claim).errors).to be_empty
    end

    it 'converts total to cents' do
      expect(
        assigns(:expense_claim).total
      ).to eq(4995)
    end

    it 'has attachments' do
      expect(
        assigns(:expense_claim).attachments.map(&:id)
      ).to eq(attachments.map(&:id))
    end
  end
end