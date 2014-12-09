class StorySentences
  attr_reader :story

  def initialize(story)
    @story = story
  end

  def verb
    story.verb.downcase
  end

  def subject_type
    story.subject.class.name.underscore.downcase
  end

  def as_json
    {
      singular: [
          t("verbs.#{verb}.singular"),
          t("subjects.#{subject_type}.other", story.subject.attributes.symbolize_keys)
        ].join(' ')
    }
  end

  # private

  def t(key, attributes={})
    I18n.t("stories.#{key}", attributes)
  end
end
