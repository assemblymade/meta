class AddStateToWips < ActiveRecord::Migration
  def change
    add_column :wips, :state, :string

    Wip.includes(:wip_workers, :taggings => :tag).find_each(readonly: false) do |wip|
      state = case
      when wip.closed_at?
        :resolved
      when wip.tags.map(&:name).include?('review')
        :reviewing
      when wip.wip_workers.any?
        :allocated
      else
        :open
      end

      puts "#{wip.id} #{state}"

      wip.update_attributes state: state
    end
  end
end
