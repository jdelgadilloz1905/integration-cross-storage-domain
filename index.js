/** @format */

exports.crossDomainStorage = function (opts) {
	var origin = opts.origin || '',
		path = opts.path || '',
		storage = opts.storage || 'localStorage'
	var cdstorage = {},
		_iframe = null,
		_iframeReady = false,
		_origin = origin,
		_path = path,
		_queue = [],
		_requests = {},
		_id = 0

	var supported = (function () {
		try {
			return window.JSON && storage in window && window[storage] !== null
		} catch (e) {
			return false
		}
	})()

	var _sendRequest = function (data) {
		if (_iframe) {
			_requests[data.request.id] = data
			_iframe.contentWindow.postMessage(JSON.stringify(data.request), _origin)
		}
	}

	var _iframeLoaded = function () {
		_iframeReady = true
		if (_queue.length) {
			for (var i = 0, len = _queue.length; i < len; i++) {
				_sendRequest(_queue[i])
			}
			_queue = []
		}
	}

	var _handleMessage = function (event) {
		if (event.origin === _origin) {
			var data = JSON.parse(event.data)
			if (typeof _requests[data.id] != 'undefined') {
				if (typeof _requests[data.id].deferred !== 'undefined') {
					_requests[data.id].deferred.resolve(data.value)
				}
				if (typeof _requests[data.id].callback === 'function') {
					_requests[data.id].callback(data.key, data.value)
				}
				delete _requests[data.id]
			}
		}
	}

	cdstorage.getItem = function (key, callback) {
		if (supported) {
			var request = {
					id: ++_id,
					type: 'get',
					key: key,
					storage: storage,
				},
				data = {
					request: request,
					callback: callback,
				}

			if (_iframeReady) {
				_sendRequest(data)
			} else {
				_queue.push(data)
			}

			if (window.jQuery) {
				return data.deferred.promise()
			}
		}
	}

	cdstorage.setItem = function (key, value) {
		if (supported) {
			var request = {
					id: ++_id,
					type: 'set',
					key: key,
					value: value,
					storage: storage,
				},
				data = {
					request: request,
				}

			if (_iframeReady) {
				_sendRequest(data)
			} else {
				_queue.push(data)
			}

			if (window.jQuery) {
				return data.deferred.promise()
			}
		}
	}

	cdstorage.removeItem = function (key) {
		if (supported) {
			var request = {
					id: ++_id,
					type: 'remove',
					key: key,
					storage: storage,
				},
				data = {
					request: request,
				}

			if (_iframeReady) {
				_sendRequest(data)
			} else {
				_queue.push(data)
			}

			if (window.jQuery) {
				return data.deferred.promise()
			}
		}
	}
	if (!_iframe && supported) {
		_iframe = document.createElement('iframe')
		_iframe.style.cssText =
			'position:absolute;width:1px;height:1px;left:-9999px;'
		document.body.appendChild(_iframe)

		if (window.addEventListener) {
			_iframe.addEventListener(
				'load',
				function () {
					_iframeLoaded()
				},
				false
			)
			window.addEventListener(
				'message',
				function (event) {
					_handleMessage(event)
				},
				false
			)
		} else if (_iframe.attachEvent) {
			_iframe.attachEvent(
				'onload',
				function () {
					_iframeLoaded()
				},
				false
			)
			window.attachEvent('onmessage', function (event) {
				_handleMessage(event)
			})
		}
		_iframe.src = _origin + _path
	}

	return cdstorage
}

exports.conectOtherDomain = function () {
	if (window.addEventListener) {
		window.addEventListener('message', handleRequest, false)
	} else if (window.attachEvent) {
		window.attachEvent('onmessage', handleRequest)
	}
}

var whitelist = process.env.REACT_APP_WHITELISTREACT

function verifyOrigin(origin) {
	var domain = origin.replace(/^https?:\/\/|:\d{1,4}$/g, '').toLowerCase(),
		i = 0,
		len = whitelist.length

	while (i < len) {
		if (domain.match(new RegExp(whitelist[i]))) {
			return true
		}
		i++
	}

	return false
}

function handleRequest(event) {
	if (verifyOrigin(event.origin)) {
		if (typeof event.data === 'object') {
			var request = event.data
		} else {
			var request = JSON.parse(event.data)
		}
		var storage = request.storage

		if (request.type == 'get') {
			var value = window[storage].getItem(request.key)
			event.source.postMessage(
				JSON.stringify({
					id: request.id,
					key: request.key,
					value: value,
				}),
				event.origin
			)
		} else if (request.type == 'set') {
			window[storage].setItem(request.key, request.value)
		} else if (request.type == 'remove') {
			window[storage].removeItem(request.key)
		}
	}
}
