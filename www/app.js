var mainApp = angular.module('jsClient', [
    'ngRoute',
    'ui.bootstrap',
    'ui-notification',
    'LocalStorageModule',
    'ui-leaflet',
    'pascalprecht.translate',
    'ngSanitize',
    'ngTable',
    'ngResource',
    'n52.core.alert',
    'n52.core.barChart',
    'n52.core.color',
    'n52.core.dataLoading',
    'n52.core.diagram',
    'n52.core.exportTs',
    'n52.core.favorite',
    'n52.core.favoriteUi',
    'n52.core.flot',
    'n52.core.helper',
    'n52.core.interface',
    'n52.core.legend',
    'n52.core.listSelection',
    'n52.core.locate',
    'n52.core.map',
    'n52.core.menu',
    'n52.core.userSettings',
    'n52.core.legend',
    'n52.core.table',
    'n52.core.exportTs',
    'n52.core.timeUi',
    'n52.core.metadata',
    'n52.core.modal',
    'n52.core.overviewDiagram',
    'n52.core.permalinkEval',
    'n52.core.permalinkGen',
    'n52.core.phenomena',
    'n52.core.provider',
    'n52.core.rawDataOutput',
    'n52.core.userSettings',
    'n52.core.settings',
    'n52.core.sosMetadata',
    'n52.core.startup',
    'n52.core.status',
    'n52.core.style',
    'n52.core.styleTs',
    'n52.core.table',
    'n52.core.time',
    'n52.core.timeUi',
    'n52.core.timeseries',
    'n52.core.tooltip',
    'n52.core.translateSelector',
    'n52.core.utils',
    'n52.core.yAxisHide',
    'n52.client.navigation',
    'n52.client.map'
]);

mainApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'templates/views/mapView.html',
            reloadOnSearch: false
        })
        .when('/map', {
            templateUrl: 'templates/views/mapView.html',
            name: 'navigation.map',
            reloadOnSearch: false
        })
        .when('/diagram', {
            templateUrl: 'templates/views/diagramView.html',
            name: 'navigation.diagram',
            reloadOnSearch: false
        })
        .when('/favorite', {
            templateUrl: 'templates/views/favoriteView.html',
            name: 'navigation.favorite',
            reloadOnSearch: false
        })
        .when("/diagram/listSelection", {
            name: "navigation.listSelection",
            modal: {
                controller: "ModalWindowCtrl",
                templateUrl: "templates/listSelection/modal-list-selection.html"
            },
            reloadOnSearch: !false
        })
        .when('/diagram/settings', {
            name: 'navigation.settings',
            modal: {
                controller: 'SwcUserSettingsWindowCtrl',
                templateUrl: 'templates/settings/user-settings-modal.html'
            },
            reloadOnSearch: false
        })
        .when('/help', {
            templateUrl: 'templates/help/helpView.html',
            name: 'navigation.help',
            reloadOnSearch: false
        })
        .when('/diagram/imprint', {
            name: 'navigation.imprint',
            modal: {
                controller: 'ModalWindowCtrl',
                templateUrl: 'templates/imprint/imprint-modal.html'
            },
            reloadOnSearch: false
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

mainApp.config(['$translateProvider', 'settingsServiceProvider', '$locationProvider',
    function($translateProvider, settingsServiceProvider, $locationProvider) {
        $translateProvider.useStaticFilesLoader({
            prefix: 'i18n/',
            suffix: '.json'
        });
        $locationProvider.hashPrefix('');
        var suppLang = [];
        angular.forEach(settingsServiceProvider.$get().supportedLanguages, function(lang) {
            suppLang.push(lang.code);
        });
        $translateProvider.registerAvailableLanguageKeys(suppLang);
        $translateProvider.determinePreferredLanguage();
        if ($translateProvider.preferredLanguage() === '' ||
            suppLang.indexOf($translateProvider.preferredLanguage()) === -1) {
            $translateProvider.preferredLanguage('en');
        }
        $translateProvider.useSanitizeValueStrategy(null);
    }
]);

mainApp.filter('objectCount', function() {
    return function(item) {
        if (item) {
            return Object.keys(item).length;
        } else {
            return 0;
        }
    };
});

mainApp.config(["$provide", function($provide) {
    // Use the `decorator` solution to substitute or attach behaviors to
    // original service instance; @see angular-mocks for more examples....

    $provide.decorator('$log', ["$delegate", function($delegate) {
        // Save the original $log.debug()
        var debugFn = $delegate.debug;

        $delegate.info = function() {
            var args = [].slice.call(arguments),
                now = moment().format('HH:mm:ss.SSS');

            // Prepend timestamp
            args[0] = now + " - " + args[0];

            // Call the original with the output prepended with formatted timestamp
            debugFn.apply(null, args);
        };

        return $delegate;
    }]);
}]);

// start the app after loading the settings.json
fetchData().then(bootstrapApp);

function fetchData() {
    var initInjector = angular.injector(["ng"]);
    var $http = initInjector.get("$http");
    return $http.get("settings.json").then(function(response) {
        mainApp.constant("config", response.data);
    });
}

function bootstrapApp() {
    angular.element(document).ready(function() {
        var injector = angular.bootstrap(document, ["jsClient"], {
            strictDi: true
        });
        // initilize parameter reader
        var startupService = injector.get('startupService');
        startupService.registerServices([
            'SetTimeseriesOfStatusService',
            'SetTimeParameterService',
            'SetInternalTimeseriesService',
            'SetConstellationService',
            'SetConstellationServiceHack',
            'SetLanguageService'
        ]);
        startupService.checkServices();
        // init mapService to have load stations directly
        injector.get('mapService');
    });
}
