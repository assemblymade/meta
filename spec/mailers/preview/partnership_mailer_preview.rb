class PartnershipMailerPreview < ActionMailer::Preview

  def create
    user = User.find_by(username: "billperegoy")
    product = Product.find_by(name: "Coderwall")
    idea = Idea.find_by(name: "Mars Colonization Game, Done Right")
    if user
      PartnershipMailer.create(user.id, product.id, idea.id)
    end
  end

end
