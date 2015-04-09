class Deed < ActiveRecord::Base
  belongs_to :user
  belongs_to :karma_event, polymorphic: true

  def parent_product
    if self.karma_event_type == "Product"
      Product.find(self.karma_event_id)
    elsif self.karma_event_type == "Wip"
      Product.find(Wip.find(self.karma_event_id).product_id)
    elsif self.karma_event_type == "Tip"
      Product.find(Tip.find(self.karma_event_id).product_id)
    elsif self.karma_event_type == "Invite"
      invite = Invite.find(self.karma_event_id)
      if invite.via_type == "Product"
        Product.find(invite.via_id)
      elsif invite.via_type == "Wip"
        Product.find(Wip.find(invite.via_id).product_id)
      end
    end
  end

end
