class TextMailerPreview < ActionMailer::Preview
  def pitch_week_intro
    User.where(id: Product.group(:user_id).count.keys).shuffle.each do |user|
      if product = user.most_interesting_product
        return TextMailer.pitch_week_intro(user.id, product.id)
      end
    end
  end
end
