class TiltMailerPreview < ActionMailer::Preview

  def create
    user = User.find_by(username: "barisser")
    idea = Idea.find_by(name: "Mars Colonization Game, Done Right")
    if user
      TiltMailer.create(user.id, idea.id)
    end
  end

end
