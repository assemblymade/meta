module StreamEvents
  #THIS IS FOR GITHUB COMMITS
  class WorkWork < StreamEvent

    def work
      subject
    end

    def work?
      true
    end

    def comment
      subject.metadata['message']
    end

    def commit_reference
      subject.url.split(/\//).last[0...7]
    end

    def title_html
      html =<<-HTML
        pushed a new commit
        <a href="#{h(subject.url)}">#{commit_reference}</a>
      HTML
      if comment.present?
        html << "<div class='commit-message'>#{h(comment)}</div>"
      end
      html
    end

    def icon_class
      "blue border-blue icon-document"
    end
  end
end
