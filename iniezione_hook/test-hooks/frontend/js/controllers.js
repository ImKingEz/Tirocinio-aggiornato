(function() {
    "use strict";
    const app = angular.module("myApp");

    class MainController {

    }

    class UsersController {

        constructor(UserService) {
            this.UserService = UserService;
        }

        get users() {
            return this.UserService.users;
        }

        addNewUser() {
            this.users.push(this.newUser);
            delete this.newUser;
        }

    }

    class AddUserModalController {

        constructor($uibModalInstance) {
            this.modal = $uibModalInstance;
            this.user = {};
        }

        ok() {
            this.modal.close(this.user);
        }

        cancel() {
            this.modal.dismiss();
        }
    }

    class TasksController {

        constructor(TaskService) {
            this.TaskService = TaskService;
        }

        get tasks() {
            return this.TaskService.tasks;
        }

    }

    class TaskEditController {

        constructor(TaskService, UserService, $stateParams, $state) {
            this.$state = $state;
            this.taskIndex = $stateParams.taskIndex;
            this.TaskService = TaskService;
            this.users = UserService.users;
            this.task = this.taskIndex ? angular.copy(TaskService.tasks[parseInt(this.taskIndex)]) : {};
        }

        save() {
            if (!this.taskIndex) {
                this.TaskService.add(this.task);
            } else {
                this.TaskService.tasks[parseInt(this.taskIndex)] = this.task;
            }
            this.$state.go("^");
        }

    }

    app.controller("MainController", MainController);
    app.controller("UsersController", UsersController);
    app.controller("AddUserModalController", AddUserModalController);
    app.controller("TasksController", TasksController);
    app.controller("TaskEditController", TaskEditController);

}());
