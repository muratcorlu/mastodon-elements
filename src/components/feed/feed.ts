import {LitElement, html, CSSResultGroup} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import style from './feed.css';

interface FeedItem {
  link: string;
  description: string;
  pubDate: string;
}

@customElement('mst-feed')
export default class MastodonFeed extends LitElement {
  static get styles(): CSSResultGroup {
    return [style];
  }

  private author = '';

  @property()
  server = '';

  @property()
  set account(value: string) {
    if (!value) {
      return;
    }

    const[ user, server ] = value.replace(/^@/, '').split('@');

    this.author = user;
    this.server = this.server || server;

    this.fetchFeed();
  }

  @state() private caption = '';
  @state() private avatar = '';
  @state() private items: FeedItem[] = [];

  firstUpdated() {
    console.log(this.account);
  }

  fetchFeed() {
    const RSS_URL = `https://${this.server}/@${this.author}.rss`;

    fetch(RSS_URL,)
      .then(response => response.text())
      .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
      .then(data => {
        this.caption = data.querySelector('title')?.textContent || '';
        this.avatar = data.querySelector('image url')?.textContent || '';

        const items: FeedItem[] = [];
        data.querySelectorAll('item').forEach(item => {
          items.push({
            link: item.querySelector('link')?.textContent,
            description: item.querySelector('description')?.textContent,
            pubDate: item.querySelector('pubDate')?.textContent
          } as FeedItem)
        });

        this.items = items;
      });
  }

  render() {
    return html`
      <header>
        <img src=${this.avatar}>
        <h2>${this.caption}</h2>
      </header>

      <ul>
        ${this.items.map((item) => html`<li>${unsafeHTML(item.description)}</li>`)}
      </ul>
    `;
  }
}
