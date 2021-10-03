export class Pipeline {
  _idx = -1
  _data = {}
  _handlers = []

  start (data) {
    this._data = data

    const _pipeInstance = new Pipeline()
    _pipeInstance._idx = this._idx
    _pipeInstance._data = this._data
    _pipeInstance._handlers = this._handlers
    if (!_pipeInstance._handlers.length) {
      return _pipeInstance.done()
    }

    return _pipeInstance.next()
  }

  /**
   * Execute next handler or done
   * @param {Error?} error
   */
  next (error) {
    if (error) {
      return this.done(error)
    }

    const _handler = this._handlers[++this._idx]
    if (!_handler) {
      return this.done()
    }

    if (_handler.length <= 2) {
      return _handler(this._data, this.next.bind(this))
    }

    return this.next()
  }

  /**
   * Execute next handler or done
   * @param {Error?} error
   */
  done (error) {
    this._idx = -1

    if (error) {
      const _errorHandler = this._handlers.find(
        _fn => _fn.length > 2
      )

      if (_errorHandler) {
        return _errorHandler(error, this._data, this.next.bind(this))
      }

      throw error
    }

    return this._data
  }

  /**
   * @param  {...Function} handlers handler functions, arguments length 3 = error handler
   */
  use (...handlers) {
    this._handlers.push(
      ...handlers
    )

    return this
  }

  exec () {
    return this.start.bind(this)
  }

  execute () {
    return this.start.bind(this)
  }

  static use (...handlers) {
    return new Pipeline().use(...handlers)
  }
}
