class MarkVectorFromText
  include Sidekiq::Worker
  def perform(user_id, mark_vector, scalar)
    mv = Interpreter.new.mark_vector_from_text(text)
    AddMarkIdentity.perform_async(self.user_id, mv, 3.0)
  end
end
