class SuggestionMailerPreview < ActionMailer::Preview

  def create
    user = User.find_by(username: "barisser")
    if user
      SuggestionMailer.create(user.id)
    end
  end

end
