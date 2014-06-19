class Milestone < ActiveRecord::Base
  belongs_to :product
  belongs_to :user
  belongs_to :wip

  has_many :milestone_tasks
  has_many :milestone_images
  has_many :tasks, through: :milestone_tasks

  accepts_nested_attributes_for :tasks, :milestone_images

  after_commit :set_number_from_wip, on: :create

  scope :open, -> { joins(:wip).where('wips.closed_at is null') }
  scope :closed, -> { joins(:wip).where('wips.closed_at is not null') }
  scope :with_images, -> { where('milestone_images_count > 0') }
  scope :without_images, -> { where('milestone_images_count = 0') }
  scope :with_open_tasks, -> {
    joins(milestone_tasks: 'task').where('tasks_milestone_tasks.closed_at is null').group('milestones.id').having('count(tasks_milestone_tasks.*) > 0')
  }

  delegate :title, to: :wip

  def feature_image
    milestone_images.order(:created_at).last
  end

  def progress
    return 0 if milestone_tasks.count == 0

    tasks.closed.count / (milestone_tasks.count).to_f
  end

  def multiplier
    urgency.try(:multiplier) || 0
  end

  def urgency
    if task = tasks.open.order(multiplier: :desc).first
      task.urgency
    end
  end

  def to_param
    number || id
  end

  # private

  def set_number_from_wip
    update_column :number, wip.number
  end
end
