require 'spec_helper'


describe Wip::Worker do
  let(:user)     { User.make! }
  let(:claimed_task) do
    task = Task.make!
    task.start_work!(user)
    task
  end

  before do
    User.make!(username: "asm-bot")
  end

  describe 'reminding a user about claimed wip' do
    let(:worker) do
      claimed_task.wip_workers.first
    end

    it 'increases count' do
      worker.remind!
      worker.checkin_count.should == 1
      worker.remind!
      worker.checkin_count.should == 2
    end

    it 'marks reminded timestamp' do
      worker.last_checkin_at.should be_nil
      worker.remind!
      worker.last_checkin_at.should_not be_nil
    end

    it 'sends out email' do
      worker.remind!
      Sidekiq::Extensions::DelayedMailer.drain # process the mail queue
      last_email.subject.should include(worker.wip.title)
    end
  end

  it 'unallocates the user when abandoning a task' do
    worker = Timecop.travel((Wip::Worker::MIA_DURATION + 1.minute).ago) do
      claimed_task.wip_workers.first
    end
    worker.wip.workers.should_not be_empty
    worker.abandon!
    worker.wip.workers.should be_empty
  end

  it 'should not return mia workers on resolved wips' do
    Timecop.travel(1.year.ago) do
      Wip::Worker.mia.should be_empty
      task = Task.make!
      task.start_work!(user)
      task.review_me!(user)
    end

    Wip::Worker.mia.should be_empty
  end

  describe 'missing in action workers' do

    it 'does not include recently claimed wips' do
      Task.make!.start_work!(user)
      Wip::Worker.mia.should be_empty
    end

    it 'includes wips picked up a while ago' do
      task = Timecop.travel((Wip::Worker::MIA_DURATION + 1.minute).ago) do
        claimed_task
      end
      Wip::Worker.mia.should_not be_empty
      Wip::Worker.mia.first.wip.should == task
    end

    it 'does not include recently reminded workers' do
      worker = Timecop.travel((Wip::Worker::MIA_DURATION + 1.minute).ago) do
        claimed_task.wip_workers.first
      end
      worker.remind!

      Wip::Worker.mia.should be_empty
    end

    it 'includes wips where worker was reminded a while ago' do
      worker = Timecop.travel((Wip::Worker::MIA_DURATION + 1.minute).ago) do
        worker = claimed_task.wip_workers.first
        worker.remind!
        worker
      end

      Wip::Worker.mia.should include(worker)
    end

    it 'does not include where worker was reminded a while ago but checked in recently' do
      worker = Timecop.travel((Wip::Worker::MIA_DURATION + 1.minute).ago) do
        worker = claimed_task.wip_workers.first
        worker.remind!
        worker
      end
      worker.checked_in!

      Wip::Worker.mia.should be_empty
    end

    it 'does include where worker was reminded and has not checked in recently' do
      worker = Timecop.travel((Wip::Worker::MIA_DURATION + 1.minute).ago) do
        worker = claimed_task.wip_workers.first
        worker.remind!
        worker.checked_in!
        worker
      end

      Wip::Worker.mia.should include(worker)
    end
  end

  it 'periodically reminds workers they have a claimed wip' do
    worker = Timecop.travel(8.days.ago) do
      claimed_task.wip_workers.first
      Wip::Worker.mia.should be_empty
    end

    Timecop.travel(6.days.ago) do
      Wip::Worker.mia.should_not be_empty
      Wip::Worker.mia.each(&:remind!)
      Wip::Worker.mia.should be_empty
    end

    Timecop.travel(4.days.ago) do
      Wip::Worker.mia.should_not be_empty
      Wip::Worker.mia.each(&:checked_in!)
      Wip::Worker.mia.should be_empty
    end

    Timecop.travel(2.days.ago) do
      Wip::Worker.mia.should_not be_empty
      Wip::Worker.mia.each(&:remind!)
      Wip::Worker.mia.should be_empty
    end

    Wip::Worker.mia.should_not be_empty
    Wip::Worker.dead.should_not be_empty
  end
end
