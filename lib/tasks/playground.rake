namespace :playground do

  desc "add all activity types to asm/1 for testing"
  task :activities => :environment do
    author = User.find_by!(username: 'whatupdave')
    worker = User.find_by!(username: 'chrislloyd')

    product = Product.find_by!(slug: 'asm')
    wip = product.wips.find_or_create_by!(user_id: author.id, number: -1, title: 'Playground wip')

    wip.activities.destroy_all
    wip.events.destroy_all


    comment = Activities::Comment.create!(
      actor: author,
      subject: Event::Comment.create(wip: wip, user_id: author.id, body: SAMPLE_COMMENT),
      target: wip
    )

    Activities::Assign.create!(
      actor: author,
      subject: Event::Allocation.create!(wip: wip, user_id: worker.id),
      target: wip
    )
    Activities::Award.create!(
      actor: author,
      subject: Event::Win.create!(wip: wip, user_id: author.id, event: comment.subject),
      target: wip
    )
    Activities::Close.create!(
      actor: author,
      subject: Event::Close.create!(wip: wip, user: author, body: 'Closing as duplicate'),
      target: wip
    )
    Activities::Post.create!(
      actor: author,
      subject: Event::CodeAdded.create!(wip: wip, user: author, deliverable: CodeDeliverable.first),
      target: wip
    )


  end

  SAMPLE_COMMENT = "hai everybody!"
end