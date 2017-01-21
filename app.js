angular.module('TodoApp', [])

.controller('AppCtrl', function($scope, $rootScope, TodoRESTFactory, TodoLSFactory, TodoDataFactory) {

    // listener
    $scope.$on('loadTodos', function() {
        // $scope.todos = TodoLSFactory.get();
        TodoRESTFactory
            .get()
            .then(function(response) {
                $scope.todos = response.data;
                $rootScope.$broadcast('loadOtherCtrlTodos', $scope.todos);
            })
            .catch(function(error) {
                console.log(error);
            });
    });

    $scope.$broadcast('loadTodos');
    // var uid = 0;

    $scope.createTodo = function($event) {
        if ($event.keyCode === 13) {
            var todo = {
                id: TodoLSFactory.genUid(),
                text: $scope.todoText,
                isCompleted: false
            }

            // $scope.todos.push(todo);
            // TodoLSFactory.create(todo);
            TodoRESTFactory
                .post(todo)
                .then(function(response) {
                    if (response.status === 201) {
                        $scope.todoText = '';
                        // $scope.$broadcast('loadTodos');
                        $scope.todos.push(response.data);
                    }
                }).catch(function(error) {
                    if (error.status === 403) {
                        //...
                    } else if (error.status === 401) {
                        //...
                    } else if (error.status === 500) {
                        //...
                    } else if (error.status === 404) {
                        //...
                    } else {
                        //...
                    }
                })
                // console.log($scope.todos);
        }
    }

    $scope.editTodo = function(todo) {
        todo.tmpText = todo.text;
        todo.isEditMode = true;
    }

    $scope.saveTodo = function(todo) {
        // console.log(todo);
        todo.isEditMode = false;
        delete todo.$$hashKey;
        // TodoLSFactory.update(todo);
        TodoRESTFactory.put(todo.id, todo);
    }

    $scope.deleteTodo = function($index, todo) {

        if (todo.isCompleted) {
            exec();
        } else {
            if (confirm('Are you really really really sure??')) {
                exec();
            }
        }

        function exec() {
            // $scope.todos.splice($index, 1);
            // TodoLSFactory.remove(todo);
            // $scope.$broadcast('loadTodos');
            TodoRESTFactory
                .delete(todo.id)
                .then(function(response){
                    $scope.todos.splice($index, 1);
                });
        }
    }

    $scope.cancelTodo = function(todo) {
        todo.text = todo.tmpText;
        todo.isEditMode = false;
    }

})

.controller('HeaderCtrl', function($scope, $rootScope, TodoLSFactory, TodoDataFactory) {
    // $scope.todos = TodoDataFactory.getAllTodos();
    $rootScope.$on('loadOtherCtrlTodos', function($event, todos) {
        // $scope.todos = TodoLSFactory.get();
        $scope.todos = todos;
    });
})

.factory('TodoDataFactory', function() {

    var todos = [];

    return {
        getAllTodos: function() {
            return todos;
        }
    };
})

.factory('TodoLSFactory', function(LSFactory) {

    var API = {
        create: function(todo) {
            return LSFactory.set('todo-' + todo.id, todo);
        },
        get: function() {
            var lsObj = LSFactory.getAll();
            var keys = Object.keys(lsObj);
            var datas = [];

            for (var i = 0; i < keys.length; i++) {
                if (keys[i].indexOf('todo-') === 0) {
                    datas.push(JSON.parse(lsObj[keys[i]]));
                    // datas.push(LSFactory.get(key[i]));
                }
            }
            return datas;
        },
        update: function(todo) {
            return LSFactory.update('todo-' + todo.id, todo);
        },
        genUid: function() {
            return Math.floor(Math.random() * 9999);
        },
        remove: function(todo) {
            return LSFactory.remove('todo-' + todo.id);
        }
    }

    return API;

})

.factory('LSFactory', function() {
    var API = {
        isSupported: function() {
            return !!localStorage;
        },
        getAll: function() {
            return localStorage;
        },
        get: function(key) {
            return JSON.parse(localStorage.getItem(key));
        },
        set: function(key, value) {
            return localStorage.setItem(key, JSON.stringify(value));
        },
        update: function(key, value) {
            return localStorage.setItem(key, JSON.stringify(value));
        },
        remove: function(key) {
            return localStorage.removeItem(key);
        }
    };
    return API;
})

.value('APIBASE', 'http://localhost:3000/todos')

.factory('TodoRESTFactory', function($http, APIBASE) {
    return {
        get: function() {
            return $http.get(APIBASE);
        },
        getOne: function(id) {
            return $http.get(APIBASE + '/' + id);
        },
        post: function(todo) {
            return $http.post(APIBASE, todo);
        },
        put: function(id, todo) {
            return $http.put(APIBASE + '/' + id, todo);
        },
        delete: function(id) {
            return $http.delete(APIBASE + '/' + id);
        }
    }
})
