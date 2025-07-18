(function() {
    "use strict";
    const app = angular.module("myApp");

    class UserService {

        constructor() {
            this.users =  [
                { name: "Joe Smith", dateOfBirth: new Date(1972, 3, 15) },
                { name: "John Doe", dateOfBirth: new Date(1985, 2, 24) }
            ]
        }

    }

    class TaskService {

        constructor() {
            this.tasks = [{}];
        }

        add(task) {
            this.tasks.push(task);
        }

        remove(task) {
            const index = this.tasks.indexOf(task);
            if (index > -1) {
                this.tasks.splice(index, 1);
            }
        }
    }

    app.service("TaskService", TaskService);
    app.service("UserService", UserService);

}())
