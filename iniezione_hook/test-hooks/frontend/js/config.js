(function() {
    "use strict";

    const app = angular.module("myApp", ["ui.router"]);

    app.config(($stateProvider, $urlRouterProvider) => {

        $stateProvider
            .state({
                controller: "MainController",
                controllerAs: "ctrl",
                name: "main",
                url: "/main",
                templateUrl: "templates/mainState.html"
            })
            .state({
                controller: "UsersController",
                controllerAs: "ctrl",
                name: "main.users",
                url: "/users",
                templateUrl: "templates/usersState.html"
            })
            .state({
                controller: "TasksController",
                controllerAs: "ctrl",
                name: "main.tasks",
                url: "/tasks",
                templateUrl: "templates/tasksState.html"
            })
            .state({
                controller: "TaskEditController",
                controllerAs: "ctrl",
                name: "main.tasks.edit",
                url: "/edit?taskIndex",
                templateUrl: "templates/taskEditState.html"
            });

        $urlRouterProvider.otherwise("/main");

    });


    app.run(($rootScope) => {
        $rootScope.$on('$stateChangeError', (event, toState, toParams, fromState, fromParams, error) => {
            console.error(error);
        });
    });

}());
