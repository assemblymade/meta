class CreateExpenseClaimAttachments < ActiveRecord::Migration
  def change
    create_table :expense_claim_attachments, id: :uuid do |t|
      t.uuid :expense_claim_id, null: false
      t.uuid :attachment_id,    null: false
      t.datetime :created_at,   null: false
    end
  end
end
