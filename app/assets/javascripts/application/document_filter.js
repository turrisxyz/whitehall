/* global ieVersion */
if (typeof window.GOVUK === 'undefined') { window.GOVUK = {} }
(function ($) {
  'use strict'

  var documentFilter = {
    loading: false,
    $form: null,
    formType: '',

    renderTable: function (data) {
      $('.js-filter-results').mustache('documents/_filter_table', data)
    },
    showStatisticsNotice: function () {
      $('.filter-results-summary').empty()
      $('.js-filter-results').html($('#statistics-moved-notice').text())
    },
    updateAtomFeed: function (data) {
      if (data.atom_feed_url) {
        $('.feeds .feed').attr('href', data.atom_feed_url)
        $('.feed-panel input').val(data.atom_feed_url)
      }
    },
    updateEmailSignup: function (data) {
      if (data.email_signup_url) {
        $('.feeds .email-signup').attr('href', data.email_signup_url)
      }
    },
    updateFeeds: function (data) {
      $('.feeds').removeClass('js-hidden')
      documentFilter.updateAtomFeed(data)
      documentFilter.updateEmailSignup(data)
    },
    updateHistory: function (url) {
      history.pushState(documentFilter.currentPageState(), null, url)
    },
    updateTracking: function (url) {
      if (GOVUK.analytics) {
        GOVUK.analytics.trackPageview(url)
      }
    },
    updateSubtopics: function () {
      var $taxonsSelect = $('#taxons')
      var $subtaxonsSelect = $('#subtaxons')

      if ($taxonsSelect.val() === 'all') {
        $subtaxonsSelect.parent().hide()
      } else {
        $subtaxonsSelect.parent().show()

        var selectedTopicContentId = $taxonsSelect.val()

        $subtaxonsSelect.children().each(function (index, option) {
          var parentContentId = option.dataset.parentContentId

          if (parentContentId) {
            // Hide optoins which don't belong to the selected topic
            option.hidden = (parentContentId !== selectedTopicContentId)
          }
        })

        $subtaxonsSelect.val('all')
      }
    },
    submitFilters: function (e) {
      e.preventDefault()
      var $form = documentFilter.$form
      var $submitButton = $form.find('button[type=submit]')
      var url = $form.attr('action')
      var jsonUrl = url + '.json'
      var params = $form.serializeArray()
      var newUrl = url + '?' + $form.serialize()
      var publicationType = $form.find('#publication_filter_option option:selected').val()

      if (publicationType === 'statistics') {
        $('.feeds').addClass('js-hidden')
        documentFilter.showStatisticsNotice()
        documentFilter.updateHistory(newUrl)
        documentFilter.updateTracking(newUrl)
        return
      }

      $submitButton.attr('disabled', 'disabled')
      $submitButton.attr('aria-disabled', 'true')

      $('.filter-results-summary').text('Loading results…')
      $('.feeds').addClass('js-hidden')
      documentFilter.loading = true
      // TODO: make a spinny updating thing
      $.ajax(jsonUrl, {
        cache: false,
        dataType: 'json',
        data: params,
        complete: function () {
          documentFilter.loading = false
        },
        success: function (data) {
          documentFilter.updateFeeds(data)
          if (data.results) {
            documentFilter.renderTable(data)
            documentFilter.liveResultSummary(data)
          }

          documentFilter.updateHistory(newUrl)
          documentFilter.updateTracking(newUrl)
        },
        error: function () {
          $submitButton.removeAttr('disabled')
          $submitButton.attr('aria-disabled', 'false')
        }
      })
    },
    urlWithout: function (object, value) {
      var url = window.location.search
      var reg = new RegExp('&?' + object + '%5B%5D=' + value + '&?')

      return url.replace(reg, '&')
    },
    liveResultSummary: function (data) {
      var $filterSummary = $('.filter-results-summary')
      var $title = $('.headings-block h1')
      var formStatus = documentFilter.currentPageState()
      var context = {}
      var i; var _i; var j; var _j; var field

      $filterSummary.html('')
      $title.find('span').remove()

      if (!data.result_type) {
        data.result_type = 'result'
      }

      context.result_count = documentFilter._numberWithDelimiter(data.total_count)
      context.pluralized_result_type = documentFilter._pluralize(data.result_type, data.total_count)

      if (formStatus.selected) {
        for (i = 0, _i = formStatus.selected.length; i < _i; i++) {
          field = formStatus.selected[i]
          if (field.title.length > 0) {
            if (field.id === 'publication_filter_option' || field.id === 'announcement_filter_option') {
              if (field.value !== 'all') {
                $title.html($title.text().trim() + '<span>: ' + field.title[0] + '</span>')
              }
            } else if (field.id === 'world_locations') {
              context.world_locations = []
              for (j = 0, _j = field.title.length; j < _j; j++) {
                if (field.value[j] !== 'all') {
                  context.world_locations.push({
                    name: field.title[j],
                    url: documentFilter.urlWithout(field.id, field.value[j]),
                    value: field.value[j],
                    joining: (j < _j - 1 ? 'and' : '')
                  })
                }
              }
              if (context.world_locations.length > 0) {
                context['world_locations_any?'] = true
              }
            } else if (field.id === 'official_document_status') {
              switch (field.value[0]) {
                case 'command_and_act_papers':
                  context['filtering_command_and_act_papers?'] = true
                  break
                case 'command_papers_only':
                  context['filtering_command_papers_only?'] = true
                  break
                case 'act_papers_only':
                  context['filtering_act_papers_only?'] = true
              }
            } else if (field.id !== 'sub_orgs' && field.id !== 'date') {
              context[field.id] = []

              for (j = 0, _j = field.title.length; j < _j; j++) {
                if (field.value[j] !== 'all') {
                  context[field.id].push({
                    name: field.title[j],
                    url: documentFilter.urlWithout(field.id, field.value[j]),
                    value: field.value[j],
                    joining: (j < _j - 1 ? 'and' : '')
                  })
                }
              }
            }
          }
        }
      }

      if (context.subtaxons && context.subtaxons.length !== 0) {
        // If a subtaxon is present, use it over the parent taxon
        context.taxons = context.subtaxons
        delete context.subtaxons
      }

      if (formStatus.text) {
        for (i = 0, _i = formStatus.text.length; i < _i; i++) {
          field = formStatus.text[i]

          if (field.value.length) {
            if (field.id === 'keywords') {
              context.keywords = {
                name: field.value,
                url: documentFilter.urlWithout(field.id, field.value)
              }
            } else if (field.id === 'from_date') {
              context.date_from = field.value
            } else if (field.id === 'to_date') {
              context.date_to = field.value
            }
          }
        }
      }

      if (formStatus.checked) {
        for (i = 0, _i = formStatus.checked.length; i < _i; i++) {
          field = formStatus.checked[i]
          if (field.id === 'include_world_location_news' && field.value === '1') {
            context.include_world_location_news = true
          }
        }
      }

      $filterSummary.mustache('documents/_filter_selections', context)
    },
    removeFilters: function (field, removed) {
      var selects = ['taxons', 'topics', 'departments', 'world_locations', 'official_document_status', 'people']
      var inputs = ['keywords', 'from_date', 'to_date']

      if ($.inArray(field, selects) > -1) {
        var $options = $("select option[value='" + removed + "']")
        if ($options.length) {
          $options.removeAttr('selected')
          var $select = $options.closest('select')
          if ($select.find(':selected').length === 0) {
            $select.find('>:first-child').prop('selected', true)
          };
          $select.change()
        }
      } else if ($.inArray(field, inputs) > -1) {
        var $input = $('input#' + field)
        if ($input.length) {
          var value = $input.val()
          var reg = new RegExp(removed)
          $input.val(value.replace(reg, '').trim())
        }
        $input.parents('form').submit()
      }
    },
    currentPageState: function () {
      return {
        html: $('.js-filter-results').html(),
        selected: $.map(documentFilter.$form.find('select'), function (n) {
          var $n = $(n)
          var id = $n.attr('id')
          var titles = []
          var values = []
          $('#' + id + ' option:selected').each(function () {
            titles.push($(this).text())
            values.push($(this).attr('value'))
          })
          return { id: id, value: values, title: titles }
        }),
        text: $.map(documentFilter.$form.find('input[type=text]'), function (n) {
          var $n = $(n)
          return { id: $n.attr('id'), value: $n.val() }
        }),
        checked: $.map(documentFilter.$form.find('input[type=radio]:checked, input[type=checkbox]:checked'), function (n) {
          var $n = $(n)
          return { id: $n.attr('id'), value: $n.val() }
        })
      }
    },
    onPopState: function (event) {
      if (event.state && event.state.html) {
        $('.js-filter-results').html(event.state.html)
        $.each(event.state.selected, function (i, selected) {
          $('#' + selected.id).val(selected.value)
        })
        $.each(event.state.text, function (i, text) {
          $('#' + text.id).val(text.value)
        })
        $.each(event.state.checked, function (i, checked) {
          $('#' + checked.id).attr('checked', true)
        })
      }
    },
    _numberWithDelimiter: function (x) {
      var parts = x.toString().split('.')
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      return parts.join('.')
    },
    _pluralize: function (word, count) {
      if (count === 1) {
        return word
      } else {
        if (word.slice(-1) === 'y') {
          return word.slice(0, -1) + 'ies'
        } else {
          return word + 's'
        }
      }
    }
  }
  window.GOVUK.documentFilter = documentFilter

  var enableDocumentFilter = function () {
    if (window.ieVersion && ieVersion === 6) {
      return this
    }
    this.each(function () {
      if (window.GOVUK.support.history()) {
        var $form = $(this)
        $(window).on('popstate', function (event) {
          documentFilter.onPopState(event)
        })
        documentFilter.$form = $form
        documentFilter.formType = $form.attr('action').split('/').pop()

        history.replaceState(documentFilter.currentPageState(), null)

        $form.submit(documentFilter.submitFilters)

        var delay = (function () {
          var timer = 0
          return function (callback, ms) {
            clearTimeout(timer)
            timer = setTimeout(callback, ms)
          }
        })()

        $('#taxons').change(function (event) {
          documentFilter.updateSubtopics()
        })

        $form.find('select, input[type=checkbox]').change(function () {
          $form.submit()
        })

        $('#keyword-filter').add('.date-range-filter').find('input[type=text]').keyup(function () {
          delay(function () {
            $form.submit()
          }, 600)
        })

        $('.filter-results-summary').delegate('a', 'click', function (e) {
          e.preventDefault()
          documentFilter.removeFilters($(this).data('field'), $(this).data('val'))
        })

        $form.find('button[type=submit]').addClass('govuk-!-display-none')
      }
    })
    return this
  }

  $.fn.extend({
    enableDocumentFilter: enableDocumentFilter
  })
})(jQuery)
