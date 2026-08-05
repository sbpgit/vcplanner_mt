
service UserInfoService @(impl : './lib/user-info', path: '/user-info') {
    function userInfo()    returns String; // using req.user approach (user attribute - of class cds.User - from the request object)
    function userInfoUAA() returns String; // usi
}
