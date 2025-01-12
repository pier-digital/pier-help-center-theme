import mixpanel from 'mixpanel-browser';

export const mixpanelEvents = {
  init() {
    this.CLASS_NAMES = {
      pageview: 'mxp-pgv-event',
      click: 'mxp-click-event',
      search: 'mxp-sch-event',
      scroll: 'mxp-sll-event',
      upvote: 'voting__button--up'
    };

    this.MONITOR_INTERVAL = 300;

    this.cacheDOM();
  },

  cacheDOM() {
    this.clickEventsTriggers = document.querySelectorAll(`.${this.CLASS_NAMES.click}`);
    this.pageviewEventTrigger = document.querySelector(`.${this.CLASS_NAMES.pageview}`);
    this.searchEventTrigger = document.querySelector(`.${this.CLASS_NAMES.search}`);
    this.scrollEventTrigger = document.querySelector(`.${this.CLASS_NAMES.scroll}`);

    this.articleTitle = document.querySelector('.article__title');
    this.articleIframe = document.querySelector('.article__content iframe');
    this.articleFeedbackButtons = document.querySelectorAll('.voting__options button');

    this.themeHasEvents = parseInt(window.sessionStorage.getItem('mxp_events')) === 1;
    this.mixpanelToken = window.sessionStorage.getItem('mxp_token');

    this.bindEvents();
  },

  bindEvents() {
    if (this.themeHasEvents) {
      this.setupMixpanel();
    }
  },

  setupMixpanel() {
    mixpanel.init(this.mixpanelToken, {
      cross_subdomain_cookie: true
    });

    if (this.pageviewEventTrigger) {
      this.pageViewEvent();
    }

    if (this.searchEventTrigger) {
      this.searchEvent();
    }

    if (this.articleIframe) {
      this.videoEvent();
    }

    if (this.scrollEventTrigger) {
      this.attachScrollEvent();
    }

    if (this.clickEventsTriggers.length) {
      this.clickEventsTriggers.forEach((element) => {
        element.addEventListener('click', () => this.clickEvent(element));
      });
    }

    if (this.articleFeedbackButtons.length) {
      this.articleFeedbackButtons.forEach((button) => {
        button.addEventListener('click', () => this.feedbackEvent(button));
      });
    }
  },

  pageViewEvent() {
    const eventName = this.pageviewEventTrigger.dataset['event'] || null;
    const eventParams = this.pageviewEventTrigger.dataset['params'] || {};

    if (eventName) {
      mixpanel.track(eventName, JSON.parse(eventParams));
    }
  },

  clickEvent(element) {
    const eventName = element.dataset['event'] || null;
    const eventParams = element.dataset['params'] || null;

    if (eventName && eventParams) {
      mixpanel.track(eventName, JSON.parse(eventParams));
    }
  },

  feedbackEvent(button) {
    const vote = button.classList.contains(this.CLASS_NAMES.upvote) ? 'up' : 'down';

    mixpanel.track('w_all_faq_article_btn2_clk_feedback', {
      articleTitle: this.articleTitle.innerText,
      answer: vote
    });
  },

  searchEvent() {
    const searchURL = new URLSearchParams(window.location.search);
    const searchTerm = searchURL.get('query');

    if (searchTerm) {
      const hasSearchResults = document.querySelector('.section__results');
      const eventType = hasSearchResults ? 'success' : 'error';
      const eventName = `w_all_faq_home_search_${eventType}`;

      mixpanel.track(eventName, { keyword: searchTerm });
    }
  },

  videoEvent() {
    const monitor = setInterval(() => {
      const { activeElement } = document;

      if (activeElement && activeElement.tagName.toLowerCase() === 'iframe') {
        mixpanel.track('w_all_faq_article_video_view', {
          articleTitle: this.articleTitle.innerText
        });

        clearInterval(monitor);
      }
    }, this.MONITOR_INTERVAL);
  },

  attachScrollEvent() {
    this.scrollDestination = this.scrollEventTrigger.dataset['scroll'];
    this.scrollElement = document.querySelector(`.${this.scrollDestination}`);
    this.scrollElementOffsetTop = this.scrollElement.offsetTop;

    this.scrollListener = () => this.calculateScroll();

    window.addEventListener('scroll', this.scrollListener);
  },

  calculateScroll() {
    const scrollTop = window.pageYOffset;

    if (scrollTop >= this.scrollElementOffsetTop / 2) {
      this.sendScrollEvent();
    }
  },

  sendScrollEvent() {
    mixpanel.track('w_all_faq_category_pg_scroll_end');

    window.removeEventListener('scroll', this.scrollListener);
  }
};
