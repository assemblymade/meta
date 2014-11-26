class SuggestionMailerPreview < ActionMailer::Preview

  def suggestion
    user = User.where(username: "barisser").sample
    bounty_limit = 3
    SuggestionMailer.create(user.id, bounty_limit)
  end

end
