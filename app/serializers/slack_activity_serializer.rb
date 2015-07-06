class SlackActivitySerializer < ApplicationSerializer
  attributes :body, :action

  def cta_link
    if object.type == "Activities::Chat"
      "<#{url}|Greet me in #{object.target.slug.titleize} chat.>"
    else
      "<#{url}|See what's up.>"
    end
  end

  def body
    if content = object.subject.try(:body)
      content.truncate(160)
    end
  end

  def action
    if object.type == "Activities::Chat"
      "posted my first chat message."
    else
      "created my first #{object.verb}."
    end
  end
end
