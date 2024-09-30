export default class EventEmitter extends EventTarget {
    constructor() {
        super();
    }

    on(eventName, callback, options) {
        if (typeof eventName === 'undefined' || eventName === '') {
            console.warn('Invalid event name');
            return false;
        }

        if (typeof callback !== 'function') {
            console.warn('Invalid callback');
            return false;
        }

        this.addEventListener(eventName, callback, options);
        return this;
    }

    off(eventName, callback) {
        if (typeof eventName === 'undefined' || eventName === '') {
            console.warn('Invalid event name');
            return false;
        }

        this.removeEventListener(eventName, callback);
        return this;
    }

    emit(eventName, detail = {}) {
        if (typeof eventName === 'undefined' || eventName === '') {
            console.warn('Invalid event name');
            return false;
        }

        const event = new CustomEvent(eventName, { detail });
        this.dispatchEvent(event);
        return event.detail;
    }
}
