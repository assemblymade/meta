json.users do
  json.array! @users do |user|
    json.id user.id
    json.username user.username
    json.avatar_url Avatar.new(User.find(user.id)).url.to_s
  end
end

# json.cache_collection! @stories do |story|
json.stories @stories do |story|
  json.cache! story do
    json.type story.class.name.underscore
    json.created story.created_at.try(:iso8601)
    json.updated story.try(:updated_at).try(:to_i)

    json.extract! story, :id, :verb, :subject_type

    json.actor_ids story.activities.map(&:actor_id)
    json.key "Story_#{story.id}"
    json.product_name story.activities.first.try(:target).try(:product).try(:name)
    json.url story_url(story)

    if first_subject = story.activities.first.try(:subject)
      if first_subject.try(:number) && first_subject.try(:title)
        json.subjects do
          json.array! story.activities.map(&:subject), :number, :title
        end
      end
    end

    if target = story.activities.first.try(:target)
      if target.try(:number) && target.try(:title)
        json.target do
          json.number target.try(:number)
          json.title target.try(:title)
        end
      end
    end

    if preview = story.body_preview
      json.body_preview preview.truncate(250).gsub(/\s+\r|\n\s+/, ' ').strip
    end
  end
end
