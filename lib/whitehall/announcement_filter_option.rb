module Whitehall
  class AnnouncementFilterOption < FilterOption
    attr_accessor :speech_types, :news_article_types

    PressRelease = create!(id: 1, slug: "press-releases", label: I18n.t("document.type.press_release.one").pluralize, search_format_types: NewsArticleType::PressRelease.search_format_types, edition_types: %w[NewsArticle], news_article_types: [NewsArticleType::PressRelease], document_type: "press_release")
    NewsStory = create!(id: 2, slug: "news-stories", label: I18n.t("document.type.news_story.one").pluralize, search_format_types: NewsArticleType::NewsStory.search_format_types, edition_types: %w[NewsArticle], news_article_types: [NewsArticleType::NewsStory], document_type: %w[news_article news_story])
    FatalityNotice = create!(id: 3, slug: "fatality-notices", label: I18n.t("document.type.fatality_notice.one").pluralize, search_format_types: [FatalityNotice.search_format_type], edition_types: %w[FatalityNotice], document_type: "fatality_notice")
    Speech = create!(id: 4, slug: "speeches", label: I18n.t("document.type.speech.one").pluralize, search_format_types: [SpeechType.non_statements.map(&:search_format_types)].flatten, edition_types: %w[Speech], speech_types: SpeechType.non_statements, document_type: "speech")
    Statement = create!(id: 5, slug: "statements", label: I18n.t("statements.heading"), search_format_types: [SpeechType.statements.map(&:search_format_types)].flatten, edition_types: %w[Speech], speech_types: SpeechType.statements, document_type: %w[written_statement oral_statement authored_article])
    GovernmentResponse = create!(id: 6, slug: "government-responses", label: I18n.t("document.type.government_response.one").pluralize, search_format_types: NewsArticleType::GovernmentResponse.search_format_types, edition_types: %w[NewsArticle], news_article_types: [NewsArticleType::GovernmentResponse], document_type: "government_response")
  end
end
