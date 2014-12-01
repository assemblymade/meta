class SuggestionMailerPreview < ActionMailer::Preview

  def create
    user = User.find_by(username: "chrislloyd")
    if user
      SuggestionMailer.create(user.id)
    end
  end

end
