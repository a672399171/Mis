// 导航栏controller
function NavController($http, $window) {
    var vm = this;

    vm.logout = function () {
        $http.post('/students/logout')
            .then(function (response) {
                $window.location.href = "/login";
            });
    };
}
NavController.$inject = ['$http', '$window'];

// 菜单controller
function MenuController($location) {
    var vm = this;

    vm.active = function (text) {
        return $location.url().indexOf(text) === 0;
    };
}
MenuController.$inject = ['$location'];

// 主页controller
function DashboardController($http, $window) {
    var vm = this;

    // 获取最近30天的登录记录
    vm.loadLoginData = function () {
        $http.get('/students/loginRecords/30').then(function (response) {
            var recordCountArr = [], personCountArr = [];
            var labels = [];
            if (response.data && response.data.data) {
                for (key in response.data.data.map) {
                    var obj = response.data.data.map[key];
                    labels.push(key);
                    recordCountArr.push(obj.recordCount);
                    personCountArr.push(obj.personCount);
                }
            }

            Highcharts.chart('container', {
                title: {
                    text: '最近登录记录'
                },
                yAxis: {
                    title: {
                        text: '数量'
                    }
                },
                xAxis: {
                    categories: labels
                },
                series: [{
                    name: '人数',
                    data: personCountArr
                }, {
                    name: '人次',
                    data: recordCountArr
                }]
            });
        });
    };

    // 加载院系学生分布图 todo
    vm.loadSchoolData = function () {

    };

    vm.loadLoginData();
    // vm.loadSchoolData();
}
DashboardController.$inject = ['$http', '$window'];

// 个人信息
function MyInfoController(progression, $http, Notification, $scope, $filter) {
    var vm = this;

    progression.start();
    $http.get('/students/myInfo').then(function (response) {
        vm.student = response.data;
        if (vm.student.birthday) {
            vm.student.birthday = $filter('date')(vm.student.birthday, 'yyyy-MM-dd')
        }
        if (vm.student.entranceDate) {
            vm.student.entranceDate = $filter('date')(vm.student.entranceDate, 'yyyy-MM-dd')
        }
        progression.done();
    });

    vm.onSubmit = function () {
        if (!$scope.form.$dirty)
            return;
        if ($scope.form.$invalid) {
            // Notification.error("存在不合法的数据");
        } else {
            progression.start();
            $http.put('/students/modifyMyInfo', vm.student)
                .then(function (response) {
                    if (response.data.success) {
                        Notification.success('修改成功');
                    } else {
                        Notification.error(response.data.error);
                    }
                    progression.done();
                });
        }
    };
}
MyInfoController.inject = ['progression', '$http', 'Notification', '$scope', '$filter'];

// 回家信息登记
function MyGoHomeController(progression, $http, Notification, $scope, $filter) {
    var vm = this;

    progression.start();
    $http.get('/students/goHome/me').then(function (response) {
        if (response.data) {
            vm.goHome = response.data;
            if (vm.goHome.startDate) {
                vm.goHome.startDate = $filter('date')(vm.goHome.startDate, 'yyyy-MM-dd');
                angular.element('.dp').data('daterangepicker').setStartDate(vm.goHome.startDate);
                angular.element('#startDate').val(vm.goHome.startDate);
            }
            if (vm.goHome.endDate) {
                vm.goHome.endDate = $filter('date')(vm.goHome.endDate, 'yyyy-MM-dd');
                angular.element('.dp').data('daterangepicker').setEndDate(vm.goHome.endDate);
                angular.element('#endDate').val(vm.goHome.endDate);
            }

            angular.element("input[name='dateRange']").val(vm.goHome.startDate + ' 至 ' + vm.goHome.endDate);
        } else {
            vm.goHome = {
                type: '回家'
            };
        }
        progression.done();
    });

    vm.onSubmit = function () {
        vm.goHome.startDate = angular.element('#startDate').val();
        vm.goHome.endDate = angular.element('#endDate').val();

        if ($scope.form.$invalid) {
            // Notification.error("存在不合法的数据");
        } else {
            progression.start();
            $http.post('/students/goHome', vm.goHome)
                .then(function (response) {
                    if (response.data.success) {
                        Notification.success('保存成功');
                    } else {
                        Notification.error(response.data.error);
                    }
                    progression.done();
                });
        }
    };
}
MyGoHomeController.inject = ['progression', '$http', 'Notification', '$scope', '$filter'];

// 学生列表
function StudentListController(progression, studentService, Notification, zlDlg) {
    var vm = this;
    vm.params = {
        page: 1,
        perPage: 10
    };

    // 为了在controller中调用指令的方法
    vm.control = function (func) {
        vm.callback = func;
    };

    vm.list = function (_params, callback) {
        progression.start();
        if (_params) {
            vm.params.page = _params.page;
            vm.params.perPage = _params.perPage;
        }
        studentService.list(vm.params, function (res) {
            vm.students = res.list;
            progression.done();
            if (callback) {
                callback(res);
            }
        });
    };

    vm.delete = function (schoolNum) {
        zlDlg.confirm('确定要删除吗?', function (result) {
            if (result) {
                studentService.remove(schoolNum, function (res) {
                    if (res.success) {
                        Notification.success("删除成功");
                        vm.callback();
                    } else {
                        Notification.error(res.error);
                    }
                })
            }
        });
    }
}
StudentListController.inject = ['progression', 'studentService', 'Notification', 'zlDlg'];

// 学生详细
function StudentDetailController(progression, studentService, $stateParams, Notification, $scope, $filter) {
    var vm = this;

    vm.detail = function (schoolNum) {
        progression.start();
        studentService.detail(schoolNum, function (res) {
            vm.student = res;
            if (vm.student.birthday) {
                vm.student.birthday = $filter('date')(vm.student.birthday, 'yyyy-MM-dd')
            }
            if (vm.student.entranceDate) {
                vm.student.entranceDate = $filter('date')(vm.student.entranceDate, 'yyyy-MM-dd')
            }
            progression.done();
        });
    };

    if ($stateParams.schoolNum) {
        vm.detail($stateParams.schoolNum);
    }

    vm.onSubmit = function () {
        if ($scope.form.$invalid) {
            // Notification.error("存在不合法的数据");
        } else {
            progression.start();
            studentService.update(vm.student, function (res) {
                if (res.success) {
                    Notification.success('修改成功');
                } else {
                    Notification.error(res.error);
                }
                progression.done();
            });
        }
    };
}
StudentDetailController.inject = ['progression', 'studentService', ' $stateParams', 'Notification', '$scope', '$filter'];

// 项目列表
function ProjectListController(progression, projectService, zlDlg, Notification) {
    var vm = this;
    vm.params = {
        page: 1,
        perPage: 10
    };

    // 为了在controller中调用指令的方法
    vm.control = function (func) {
        vm.callback = func;
    };

    vm.list = function (_params, callback) {
        progression.start();
        if (_params) {
            vm.params.page = _params.page;
            vm.params.perPage = _params.perPage;
        }
        projectService.list(vm.params, function (res) {
            vm.projects = res.list;
            progression.done();
            if (callback) {
                callback(res);
            }
        });
    };

    vm.delete = function (id) {
        zlDlg.confirm('确定要删除吗?', function (result) {
            if (result) {
                projectService.remove(id, function (res) {
                    if (res.success) {
                        Notification.success("删除成功");
                        vm.list();
                    } else {
                        Notification.error(res.error);
                    }
                })
            }
        });
    };
}
ProjectListController.inject = ['progression', 'projectService', 'zlDlg', 'Notification'];

// 项目详细
function ProjectDetailController(progression, projectService, $stateParams, Notification, $scope, $filter) {
    var vm = this;
    var row = 0;

    vm.detail = function (id) {
        progression.start();
        projectService.detail(id, function (res) {
            vm.project = res;
            if (vm.project.itemList) {
                vm.project.itemList.forEach(function (e) {
                    e.row = row++;
                });
            }

            progression.done();
        });
    };

    if ($stateParams.id) {
        vm.detail($stateParams.id);
    } else {
        vm.project = {};
    }

    vm.onSubmit = function () {
        if ($scope.form.$invalid) {
            // Notification.error("存在不合法的数据");
        } else {
            progression.start();
            if ($stateParams.id) {
                projectService.update(vm.project, function (res) {
                    if (res.success) {
                        Notification.success('修改成功');
                    } else {
                        Notification.error(res.error);
                    }
                    progression.done();
                });
            } else {
                projectService.create(vm.project, function (res) {
                    if (res.success) {
                        Notification.success('添加成功');
                    } else {
                        Notification.error(res.error);
                    }
                    progression.done();
                });
            }
        }
    };

    vm.removeItem = function (rowIndex) {
        if (vm.project.itemList) {
            for (i = 0; i < vm.project.itemList.length; i++) {
                if (vm.project.itemList[i].row === rowIndex) {
                    vm.project.itemList.splice(i, 1);
                    break;
                }
            }
        }
    };

    vm.addItem = function () {
        if (!vm.project.itemList) {
            vm.project.itemList = [];
        }
        vm.project.itemList.push({
            row: row++
        });
    }
}
ProjectDetailController.inject = ['progression', 'studentService', ' $stateParams', 'Notification', '$scope', '$filter'];

// 模态框
function ModalInstanceCtrl($uibModalInstance, item, quality, items) {
    var vm = this;
    var row = 1;
    vm.items = items;
    vm.item = item;
    vm.quality = quality;
    vm._items = angular.copy(items);

    vm._items.forEach(function (e) {
        e.row = row++;
    });

    vm.removeItem = function (index) {
        for (var i = 0; i < vm._items.length; i++) {
            if (vm._items[i].row === index) {
                vm._items.splice(i, 1);
                break;
            }
        }
    };

    vm.addItem = function () {
        vm._items.push({
            item: {
                id: item.id
            },
            student: {
                name: quality.name,
                schoolNum: quality.schoolNum
            },
            score: 0,
            row: row++
        });
    };

    vm.ok = function () {
        $uibModalInstance.close(vm._items);
    };

    vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}
ModalInstanceCtrl.inject = ['$uibModalInstance', 'items'];

// 寒暑假回家列表
function GoHomeListController(progression, Notification, $http) {
    var vm = this;

    vm.list = function () {
        progression.start();
        $http.get('/students/goHomeList').then(function (response) {
            if (response.data) {
                vm.goHomeList = response.data;
            }
            progression.done();
        });
    };

    vm.list();
}
GoHomeListController.inject = ['progression', 'Notification', '$http'];

// 我的成绩单
function MyScoreController($http, progression, Notification) {
    var vm = this;
    progression.start();
    $http.get('/students/myScore').then(function (response) {
        if (response && response.data) {
            if (response.data.success) {
                vm.firstTermScore = {
                    title: response.data.data.scores[0].term,
                    scores: response.data.data.scores[0].scores
                };
                vm.secondTermScore = {
                    title: response.data.data.scores[1].term,
                    scores: response.data.data.scores[1].scores
                };
            } else {
                Notification.error(response.data.error);
            }

            progression.done();
        }
    });
}
MyScoreController.inject = ['$http', 'progression', 'Notification'];

// 素质评定当前录入查看
function ActivityController($http, progression) {
    var vm = this;
    progression.start();

    // 获取当前登录人已填写的信息
    $http.get('/activities/myActivities').then(function (response) {
        if (response && response.data) {
            vm.activities = response.data.list;
        }
        progression.done();
    });
}
ActivityController.inject = ['$http', 'progression'];

// 素质评定分数录入
function QualityEditController($scope, $http, Notification, progression) {
    var vm = this;
    progression.start();

    vm.currentProjectId = 0;
    vm.projects = [{
        id: 0,
        title: '==请选择=='
    }];
    vm.currentItem = undefined;
    vm.myItems = [];
    var index = 1;
    // 获取分类信息
    $http.get('/projects/items').then(function (response) {
        if (response && response.data) {
            vm.projects = response.data.list;
            vm.currentProjectId = vm.projects[0].id;
            vm.currentItems = vm.projects[0].itemList;

            vm.allItems = [];
            vm.projects.forEach(function (e) {
                e.itemList.forEach(function (i) {
                    vm.allItems.push(i);
                });
            });
        }
        progression.done();
    });

    // 获取当前登录人已填写的信息
    $http.get('/activities/myActivities').then(function (response) {
        if (response && response.data) {
            vm.myItems = response.data.list;
            vm.myItems.forEach(function (e) {
                e.row = index++;
            });
        }
        progression.done();
    });

    // 添加一行
    vm.addRow = function () {
        if (vm.currentProjectId > 0 && vm.currentItem) {
            var obj = JSON.parse(vm.currentItem);
            vm.myItems.push({
                row: index++,
                item: {
                    id: obj.id,
                    title: obj.title
                }
            });
        } else {
            Notification('先选择要添加的类目');
        }
    };

    // 移除一行
    vm.removeRow = function (row) {
        for (var i = 0; i < vm.myItems.length; i++) {
            if (vm.myItems[i].row == row) {
                vm.myItems.splice(i, 1);
            }
        }
    };

    // 切换子项目列表
    vm.changeItems = function () {
        for (var i = 0; i < vm.projects.length; i++) {
            if (vm.projects[i].id == vm.currentProjectId) {
                vm.currentItems = vm.projects[i].itemList;
                break;
            }
        }
    };

    // 提交
    vm.submitActivity = function () {
        progression.start();
        $http.post('/activities', {
            json: JSON.stringify(vm.myItems)
        }).then(function (response) {
            progression.done();
        });
    };
}
QualityEditController.inject = ['$scope', '$http', 'Notification', 'progression'];

// 素质评定汇总
function QualityController($http, Notification, progression) {
    var vm = this;
    progression.start();

    var flag = 0;

    // 获取当前登录人已填写的信息
    $http.get('/activities/myActivities').then(function (response) {
        if (response && response.data) {
            vm.activities = response.data.list;
        }
        flag++;
        if (flag >= 2) {
            progression.done();
        }
    });

    $http.get('/students/myScore').then(function (response) {
        if (response && response.data) {
            vm.firstTermScore = {
                title: response.data.data.scores[0].term,
                scores: response.data.data.scores[0].scores
            };
            vm.secondTermScore = {
                title: response.data.data.scores[1].term,
                scores: response.data.data.scores[1].scores
            };
        }
        flag++;
        if (flag >= 2) {
            progression.done();
        }
    });
}
QualityController.inject = ['$http', 'Notification', 'progression'];

// 综测管理
function QualityManageController($http, $uibModal, progression) {
    var vm = this;
    vm.conf = {
        showScore: true,
        showDetail: true
    };
    progression.start();

    // 获取所有学生已填写的信息
    $http.get('/activities/qualities').then(function (response) {
        if (response && response.data) {
            vm.qualities = response.data.list;
            vm.firstSet = response.data.data.firstSet;
            vm.secondSet = response.data.data.secondSet;
            vm.qualities.forEach(function (e) {
                if (e.list && e.list.length > 0) {
                    e.firstTerm = e.list[0];
                }
                if (e.list && e.list.length > 1) {
                    e.secondTerm = e.list[1];
                }
            });
        }
        progression.done();
    });

    progression.start();
    // 获取分类信息
    $http.get('/projects/items').then(function (response) {
        if (response && response.data) {
            var arr = response.data.list;
            vm.allItems = [];

            for (var i = 0; i < arr.length; i++) {
                if (arr[i].itemList.length < 1) {
                    arr.splice(i--, 1);
                } else {
                    arr[i].itemList.forEach(function (e) {
                        vm.allItems.push(e);
                    });
                }
            }
            vm.projects = arr;

            // 按item分类显示
            vm.groupWithItem();
        }
        progression.done();
    });

    vm.groupWithItem = function () {
        // 获取本专业学生的活动分数
        $http.get('/activities/majorActivities').then(function (response) {
            if (response && response.data) {
                var arr = response.data.list;
                vm.allItems.forEach(function (item) {
                    if (!item.scores) {
                        item.scores = [];
                    }
                    arr.forEach(function (e) {
                        if (e.item.id === item.id) {
                            item.scores.push(e);
                        }
                    });
                });
            }
        });
    };

    vm.showOrHide = function () {
        if (vm.btn.show) {
            vm.btn.show = false;
            vm.btn.text = '显示成绩';
        } else {
            vm.btn.show = true;
            vm.btn.text = '隐藏成绩';
        }
    };

    vm.showModifyDlg = function (item, quality) {
        vm.items = [];
        if (item.scores) {
            item.scores.forEach(function (e) {
                if (e.student.schoolNum === quality.schoolNum) {
                    vm.items.push(e);
                }
            });
        }

        // 显示dlg
        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title',
            ariaDescribedBy: 'modal-body',
            templateUrl: 'model.html',
            controller: 'ModalInstanceCtrl',
            controllerAs: 'vm',
            resolve: {
                items: function () {
                    return vm.items;
                },
                quality: function () {
                    return quality;
                },
                item: function () {
                    return item;
                }
            }
        });

        modalInstance.result.then(function (_items) {
            $http.post('/activities/manage', {
                json: JSON.stringify(_items),
                schoolNum: quality.schoolNum,
                itemId: item.id
            }).then(function (response) {
                if (response.data && item.scores) {
                    for (var i = 0; i < item.scores.length; i++) {
                        if (item.scores[i].student.schoolNum === quality.schoolNum) {
                            item.scores.splice(i, 1);
                            i--;
                        }
                    }
                    if (response.data.list) {
                        response.data.list.forEach(function (e) {
                            item.scores.push(e);
                        });
                    }
                }
            });
        }, function () {

        });
    };
}
QualityManageController.inject = ['$http', '$uibModal', 'progression'];

// 权限管理
function AuthManageController(progression, Notification, $http, zlDlg) {
    var vm = this;

    vm.list = function () {
        progression.start();
    };

    vm.listAuth = function () {
        $http.get('/data/authorities').then(function (response) {
            if (response.data) {
                vm.authList = response.data;
            }
        });
    };

    vm.getResource = function (schoolNum) {
        if (schoolNum && schoolNum.length == 11) {
            vm.schoolNum = schoolNum;
            $http.get('/students/resources/' + schoolNum).then(function (response) {
                vm.hasedAuth = response.data;
            });
        }
    };

    vm.delete = function (id) {
        if (id) {
            zlDlg.confirm('确定要删除吗？', function (result) {
                if (result) {
                    $http.delete('/students/resources/' + id).then(function (response) {
                        if (response.data.success) {
                            Notification.success('删除成功');
                            for (var i = 0; i < vm.hasedAuth.length; i++) {
                                if (vm.hasedAuth[i].id == id) {
                                    vm.hasedAuth.splice(i, 1);
                                    break;
                                }
                            }
                        }
                    });
                }
            });
        }
    };

    vm.addAuth = function () {
        if (vm.schoolNum && vm.schoolNum.length == 11 && vm.authCode && vm.authCode.length > 1) {
            $http.post('/students/resources', {
                schoolNum: vm.schoolNum,
                authCode: vm.authCode
            }).then(function (response) {
                if (response.data.success) {
                    vm.getResource(vm.schoolNum);
                    Notification.success('添加成功');
                } else {
                    Notification.error('添加失败：' + response.data.error);
                }
            });
        } else {
            Notification.error('学号或权限错误！');
        }
    };

    vm.listAuth();
}
AuthManageController.inject = ['progression', 'Notification', '$http', 'zlDlg'];

angular.module('myApp')
    .controller('NavController', NavController)
    .controller('MenuController', MenuController)
    .controller('DashboardController', DashboardController)
    .controller('MyInfoController', MyInfoController)
    .controller('MyGoHomeController', MyGoHomeController)
    .controller('MyScoreController', MyScoreController)
    .controller('ActivityController', ActivityController)
    .controller('QualityEditController', QualityEditController)
    .controller('QualityController', QualityController)
    .controller('StudentListController', StudentListController)
    .controller('StudentDetailController', StudentDetailController)
    .controller('ProjectListController', ProjectListController)
    .controller('ProjectDetailController', ProjectDetailController)
    .controller('GoHomeListController', GoHomeListController)
    .controller('QualityManageController', QualityManageController)
    .controller('AuthManageController', AuthManageController)
    .controller('ModalInstanceCtrl', ModalInstanceCtrl);