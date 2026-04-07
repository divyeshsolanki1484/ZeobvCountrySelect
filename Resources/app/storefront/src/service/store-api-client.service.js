class StoreApiClient {
    _request
    _defaultHeaders

    constructor() {
        this._request = null
        this._defaultHeaders = {}
    }

    get(url, headers = { Accept: 'application/json' }) {
        const request = this._createPreparedRequest('GET', url, headers)

        return this._sendRequest(request, null, headers)
    }

    post(
        url,
        data,
        headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        }
    ) {
        const request = this._createPreparedRequest('POST', url, headers)

        return this._sendRequest(request, JSON.stringify(data), headers)
    }

    patch(
        url,
        data,
        headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        }
    ) {
        const request = this._createPreparedRequest('PATCH', url, headers)

        return this._sendRequest(request, JSON.stringify(data), headers)
    }

    delete(
        url,
        data,
        headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        }
    ) {
        const request = this._createPreparedRequest('DELETE', url, headers)

        return this._sendRequest(request, JSON.stringify(data), headers)
    }

    /**
     * Abort running Request
     */
    abort() {
        if (this._request) {
            this._request.abort()
        }
    }

    /**
     * @private
     */
    _sendRequest(xhr, body = null, headers) {
        return new Promise((resolve, reject) => {
            xhr.onload = () => {
                this._request = null

                if (xhr.status >= 200 && xhr.status < 300) {
                    if (xhr.status !== 204 && headers.Accept === 'application/json') {
                        resolve(JSON.parse(xhr.response))
                    } else {
                        resolve(xhr.response)
                    }
                } else {
                    reject({ status: xhr.status, statusText: xhr.statusText })
                }
            }

            xhr.onerror = () => {
                this._request = null

                reject({ status: xhr.status, statusText: xhr.statusText })
            }

            xhr.send(body)
        })
    }

    /**
     * Returns a new and configured XMLHttpRequest object
     *
     * @private
     */
    _createPreparedRequest(type, url, headers) {
        if (this._request) {
            this._request.abort()
        }

        this._request = new XMLHttpRequest()

        this._request.open(type, url)
        this._request.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

        for (const header in this._defaultHeaders) {
            this._request.setRequestHeader(header, this._defaultHeaders[header])
        }

        for (const header in headers) {
            this._request.setRequestHeader(header, headers[header])
        }

        return this._request
    }

    setDefaultHeaders(headers) {
        this._defaultHeaders = headers
    }
}

export default StoreApiClient
