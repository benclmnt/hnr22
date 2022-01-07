class Telegram {
  constructor(token, message) {
    this.message = message;
    this.baseUrl = `https://api.telegram.org/bot${token}`;
    this.header = {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    };
  }

  sendText(chat_id, text) {
    let url = new URL(`${this.baseUrl}/sendMessage`);
    url.searchParams.set('chat_id', chat_id);
    url.searchParams.set('parse_mode', 'markdown');
    url.searchParams.set('text', text);
    return fetch(url, this.header);
  }

  sendPhoto(chat_id, photo) {
    let url = new URL(`${this.baseUrl}/sendPhoto`);
    url.searchParams.set('chat_id', chat_id);

    if (photo.caption) {
      url.searchParams.set('caption', photo.caption);
    }
    url.searchParams.set('photo', photo.url);
    return fetch(url, this.header);
  }

  sendVideo(chat_id, video) {
    let url = new URL(`${this.baseUrl}/sendVideo`);
    url.searchParams.set('chat_id', chat_id);

    if (video.caption) {
      url.searchParams.set('caption', video.caption);
    }
    url.searchParams.set('video', video.url);
    return fetch(url, this.header);
  }

  getUpdate() {
    let postUrl = this.telegramUrl + '/getUpdates';
    return fetch(postUrl, this.header);
  }
}

module.exports = Telegram;
