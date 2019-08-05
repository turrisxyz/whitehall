require 'test_helper'

class DocumentCollectionGroupMembershipTest < ActiveSupport::TestCase
  test 'maintain ordering of documents in a group' do
    group = create(:document_collection_group, document_collection: build(:document_collection))
    documents = [build(:document), build(:document)]
    group.documents = documents
    assert_equal [1, 2], group.memberships.reload.map(&:ordering)
  end

  test 'is invalid without a document' do
    refute build(:document_collection_group_membership, document: nil).valid?
  end

  test 'is invalid without a document_collection_group' do
    refute build(:document_collection_group_membership, document_collection_group: nil).valid?
  end

  test 'is invalid when document is a document collection' do
    membership = build(:document_collection_group_membership, document: create(:document_collection).document)
    refute membership.valid?
  end

  test 'should raise an exception when attempting to add a locked document to a collection' do
    document = create(:document, locked: true)
    assert_raises LockedDocumentConcern::LockedDocumentError, "Cannot perform this operation on a locked document" do
      create(:document_collection_group_membership, document: document)
    end
  end
end
