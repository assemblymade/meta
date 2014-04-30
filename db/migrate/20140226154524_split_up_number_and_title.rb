class SplitUpNumberAndTitle < ActiveRecord::Migration
  def change
    Activity.all.each do |activity|
      parameters = activity.parameters
      if parameters.key?('target_title')
        number, title = parameters['target_title'].split(' ', 2)
        parameters['target_title'] = title
        parameters['target_number'] = number.slice(1).to_i
        activity.parameters = parameters.merge(
          'taret_title' => title,
          'target_number' => number.slice(1).to_i
        )
        activity.save!
      end
    end
  end
end
