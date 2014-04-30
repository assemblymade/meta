require 'spec_helper'

describe ImportantTasksQuery do
  it 'finds important tasks' do
    unimportant_task = Task.make!(promoted_at: nil)
    unimportant_task.update_columns(trending_score: 0)

    important_task = Task.make!(promoted_at: nil)
    important_task.update_columns(trending_score: 50)

    super_important_task = Task.make!(promoted_at: Time.now)
    super_important_task.update_columns(trending_score: 50)

    expect(ImportantTasksQuery.call).to eq([
      super_important_task,
      important_task,
      unimportant_task
    ])
  end

  it 'only finds tasks for public products' do
    private_product = Product.make!(flagged_at: Time.now)

    private_task = Task.make!(product: private_product)
    public_task = Task.make!

    expect(ImportantTasksQuery.call).to eq([public_task])
  end
end
