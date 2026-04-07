import ZeobvCountrySelect from './plugin/country-select.plugin'

// Register via the existing PluginManager
const PluginManager = window.PluginManager
PluginManager.register(
    'ZeobvCountrySelect',
    ZeobvCountrySelect,
    '[data-zeobv-country-select]'
)

// Necessary for the webpack hot module reloading server
if (module.hot) {
    module.hot.accept()
}
