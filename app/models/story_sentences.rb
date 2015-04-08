class StorySentences
  attr_reader :story

  def initialize(story)
    @story = story
  end

  def verb
    story.verb.downcase
  end

  def subject
    if story.target.is_a? Product
      story.subject
    else
      story.target
    end
  end

  def target_type
    subject.class.name.underscore.downcase
  end

  def display_verb
    t("verbs.#{verb}.singular")
  end

  def display_subject
    t("subjects.long.#{target_type}.other", subject.attributes.symbolize_keys)
  end

  def as_json
    owner = [
      display_verb,
      '<b>' + t("subjects.short.#{target_type}.owner", subject.attributes.symbolize_keys) + '</b>'
    ]
    other = [
      display_verb,
      '<b>' + t("subjects.short.#{target_type}.other", subject.attributes.symbolize_keys) + '</b>'
    ]

    if product = story.subject.try(:product)
      owner << "in #{product.name}"
      other << "in #{product.name}"
    end

    {
      owner: owner.join(' '),
      other: other.join(' ')
    }
  end

  # private

  def t(key, attributes={})
    I18n.t("stories.#{key}", attributes)
  end
end
