require 'test_helper'

class PublishingApiGoneWorkerTest < ActiveSupport::TestCase
  setup do
    @uuid = "a-uuid"
    SecureRandom.stubs(uuid: @uuid)
  end

  test "publishes a 'gone' item for the supplied base path" do
    base_path = '/government/this-never-existed-honest'

    gone_payload = {
      content_id: @uuid,
      format: 'gone',
      publishing_app: 'whitehall',
      update_type: 'major',
      routes: [{path: base_path, type: 'exact'}],
    }

    expected_request = stub_publishing_api_put_item(base_path, gone_payload)

    PublishingApiGoneWorker.new.perform(base_path)

    assert_requested expected_request
  end
end
