import Plugin from 'src/plugin-system/plugin.class'
import HttpClient from 'src/service/http-client.service'
import StoreApiClient from '../service/store-api-client.service'

export default class ZeobvCountrySelect extends Plugin {
    static options = {
        appStoreApiDetailUrl: null,
        storeApiContextUrl: null,
        storeApiCountryUrl: null,
    }

    init() {
        this.countryClient = new StoreApiClient()
        this.contextClient = new StoreApiClient()
        this.countries = []
        this.setCountryInContext = this.setCountryInContext.bind(this)

        this._prepareStoreApiCommunication(() => {
            this.setCurrentSelectedCountry()
            this.createCountySelect()
        })
    }

    setCurrentSelectedCountry() {
        const selectedCountryEl = document.createElement('span')
        selectedCountryEl.classList.add('zeobv-country-select__selected')

        this.el.querySelector('.dropdown-menu').appendChild(selectedCountryEl)

        this.contextClient.get(this.options.storeApiContextUrl).then((context) => {
            const country = context.shippingLocation.country;
            // Use translated.name as fallback if name is null
            const countryName = country.name || (country.translated && country.translated.name) || country.iso3 || '';
            selectedCountryEl.innerText = countryName;
        })
    }

    createCountySelect() {
        this.getCountries((countries) => {
            this.countries = countries

            const countryOptions = countries.map((element) => {
                return `<li class="zeobv-country-select__option" data-value="${element.id}">${element.name}</li>`
            })

            const countrySelectEl = document.createElement('ul')
            countrySelectEl.classList.add('zeobv-country-select')
            countrySelectEl.innerHTML = countryOptions.join(' ')

            countrySelectEl.querySelectorAll('li').forEach((el) => {
                el.addEventListener('click', this.setCountryInContext)
            })

            this.el.querySelector('.dropdown-menu').appendChild(countrySelectEl)
        })
    }

    setCountryInContext(event) {
        const selectedCountryId = event.target.dataset.value
        this.el.querySelector('.zeobv-country-select__selected').innerText = this.countries.find((country) => {
            return country.id === selectedCountryId
        }).name

        this.contextClient
            .patch(this.options.storeApiContextUrl, {
                countryId: selectedCountryId,
            })
            .then(() => {
                const cacheBuster = new Date().getTime()

                let queryString
                if (window.location.search) {
                    const queryParams = new URLSearchParams(window.location.search)
                    queryParams.set('refresh', cacheBuster)
                    queryString = queryParams.toString()
                } else {
                    queryString = `refresh=${cacheBuster}`
                }

                window.location.href = window.location.origin + window.location.pathname + `?${queryString}`
            })
    }

    async getCountries(callback, prevResult = []) {
        this.countryClient
            .post(this.options.storeApiCountryUrl, {
                limit: 100,
                page: prevResult.length > 0 ? prevResult.length / 100 + 1 : 1,
                includes: {
                    country: ['id', 'name', 'iso3', 'translated'],
                },
            })
            .then((result) => {
                const elements = [...result.elements, ...prevResult]

                if (result.total < 100) {
                    // Use translated.name as fallback if name is null
                    elements.forEach(country => {
                        if (!country.name && country.translated && country.translated.name) {
                            country.name = country.translated.name;
                        }
                    });

                    elements.sort((a, b) => {
                        if (!a.name || !b.name) return 0;
                        return a.name.localeCompare(b.name);
                    });

                    return callback(elements.filter(el => el.name));
                }

                this.getCountries(callback, elements)
            })
    }

    _prepareStoreApiCommunication(ready) {
        const client = new HttpClient()

        client.get(this.options.appStoreApiDetailUrl, (response) => {
            const data = JSON.parse(response)
            const headers = {
                'sw-access-key': data.key,
            }

            this.contextClient.setDefaultHeaders(headers)
            this.countryClient.setDefaultHeaders(headers)

            ready()
        })
    }
}
