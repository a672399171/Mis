angular.module('myApp')
    .config(['RestangularProvider', function (RestangularProvider) {
        /********************* request配置 **********************/
        RestangularProvider.addFullRequestInterceptor(function (element, operation, what, url, headers, params) {
            if (operation === 'getList') {
                if (params._page) {
                    params.page = params._page;
                    params.perPage = params._perPage;
                    params.sortField = params._sortField;
                    params.sortDir = params._sortDir;
                    delete params._page;
                    delete params._perPage;
                    delete params._sortField;
                    delete params._sortDir;
                }
                if (params._filters) {
                    console.log(params._filters);
                    for (var i in params._filters) {
                        console.log(i + ' ' + params._filters[i]);
                        if(params._filters[i]) {
                            params[i] = params._filters[i];
                        }
                    }
                    delete params._filters;
                }
            }
            return {params: params};
        });

        /********************* response配置 **********************/
        RestangularProvider.addResponseInterceptor(function (data, operation, what, url, response, $state, notification) {
            if (operation === 'getList' || operation === 'put' || operation === 'remove') {
                if (data.success === false) {
                    // error
                    return;
                }
            }

            // getList  list
            // get      show
            // put      edit
            // remove   delete

            if (operation == "getList") {
                response.totalCount = data.totalItem;
                data = data.list;
            }
            return data;
        });
    }]);