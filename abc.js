import * as FirebaseTracker from "./firebase/firebase-tracker.js";

var urlLogin, formLogin, tracker, cookiesUtils, image, title, checkRedirectApp, urlOauth;
var theme = $.urlParam('theme', window.location)
let isClickOauth = true;

//===================================================================================

//ON LOAD
$(document).ready(function () {
    logFirebase();
    initView();
    tracker.initTracking(formLogin.username(), vndaName, vndaTrackerName);
    validateLoginForm();
});

function logFirebase() {
    $('#register').on('click', function (e) {
        FirebaseTracker.log("sisu_main_click", {'button': "sign_up"})
    })
    $('#forgotPassword').on('click', function (e) {
        FirebaseTracker.log("sisu_main_click", {'button': "forgot_password"})
    })
    $('#facebook-login').on('click', function (e) {

        FirebaseTracker.log("sisu_main_click", {'button': "facebook_login"})
    })
    $('#google-login').on('click', function (e) {

        FirebaseTracker.log("sisu_main_click", {'button': "google_login"})
    })
    $('#apple-login').on('click', function (e) {
        FirebaseTracker.log("sisu_main_click", {'button': "apple_login"})
    })


}

function initView() {

    urlLogin = 192.168.47.130 + "/login";

    var location = window.location.href;

    var redirectApp = $.urlParam('redirect-app', location);
    var type = $.urlParam('type', location);
    if (redirectApp != null && type != null) {
        urlLogin += '?type=' + type + '&redirect-app=' + redirectApp;
    } else if (redirectApp != null && type == null) {
        urlLogin += '?redirect-app=' + redirectApp;
    } else if (redirectApp == null && type != null) {
        urlLogin += '?type=' + type;
    }


    formLogin = new login();
    tracker = new HappyEnding();
    cookiesUtils = new CookiesUtils();

    var $btnLogin = $('#btn-login');
    var $btnRegister = $('#btn-register');
    var $divShowPassword = $('#show-password');
    var $loading = $('#loading');

    $btnRegister.on('click', function (e) {
        FirebaseTracker.log('sisu_main_click', {
            button: "sign_up"
        })
        window.location.href = $('#btn-register').attr('value');
        /*var currentUrl = window.location;
        var urlParam = $.urlParam('url', currentUrl);
        if (urlParam) {
            window.location.href = '//accounts.vndirect.com.vn/?url=' + urlParam;
        } else {
            window.location.href = '//accounts.vndirect.com.vn/';
        }*/
        return false;
    });

    $divShowPassword.on('click', function (e) {
        $(this).toggleClass("fa-eye fa-eye-slash");
        if ($('#password').prop('type') === "password") {
            $('#password').prop('type', "text");
        } else {
            $('#password').prop('type', "password");
        }
    });

    $btnLogin.on('click', function (e) {
        if (document.getElementById('error-login').innerHTML != "") {
            document.getElementById('error-login').innerHTML = "";
        }
        $btnLogin.removeClass("css-1esepcw").addClass("css-1esepcw-disable");
        $loading.removeClass("css-1w6qo8v").addClass("css-1w6qo8v-disable");
        FirebaseTracker.log("sisu_main_click", {
            'button': 'sign_in'
        })
        loginIvnd();
        return false;
    });

    $('#username').keypress(function (event) {
        if (event.keyCode == 13 || event.which == 13) {
            $('#password').focus();
        }
    });

    $('#password').keypress(function (event) {
        if (event.keyCode == 13 || event.which == 13) {
            if (document.getElementById('error-login').innerHTML != "") {
                document.getElementById('error-login').innerHTML = "";
            }
            $btnLogin.removeClass("css-1esepcw").addClass("css-1esepcw-disable");
            $loading.removeClass("css-1w6qo8v").addClass("css-1w6qo8v-disable");
            loginIvnd();
        }
    });

    $('#apple-login').on('click', (e) => {
        urlOauth = `https://appleid.apple.com/auth/authorize?client_id=${clientAppleId}&redirect_uri=${redirectAppleUrl}&response_type=code id_token&state=init&scope=name%20email&response_mode=form_post`;
        dontClickResend(urlOauth);
    })

    $('#google-login').on('click', (e) => {
        urlOauth = "/oauth2/authorization/google";
        dontClickResend(urlOauth);
    })

    $('#facebook-login').on('click', (e) => {
        urlOauth = "/oauth2/authorization/facebook";
        dontClickResend(urlOauth);
    })
}

function dontClickResend(url) {
    if (isClickOauth) {
        window.location = url;
        isClickOauth = false;
        setTimeout(function(){
            isClickOauth = true;
        }, 2000);
    }
}

//validate
function validateLoginForm() {
    //===================================

    $('#username').on('input', function () {
        Notify.cleanErrorElement("divUserName");
        $(this).css('border-color', '#ced0d4')
    });

    $('#password').on('input', function () {
        Notify.cleanErrorElement("divPassword");
        $(this).css('border-color', '#ced0d4')
    });

}

function sendActiveMail() {
    loaderShow();

    $.ajax({
        type: 'POST',
        url: `/register/send-active-email?userName=${formLogin.username()}`
    }).done(function (data) {
        tracker.trackObject('success', 'KĂ­ch hoáº¡t tĂ i khoáº£n', data);
        window.location.href = `/register/active-by-email?userName=${formLogin.username()}`;
        loaderHide();
    }).fail(function (xhr) {
        loaderHide();
        tracker.error(this.url, this.type, xhr, "Active Profile", "activeProfile()- Tháº¥t báº¡i", {
            userName: formLogin.username
        });
        Notify.errorElementV2({message: Error_message.UNKNOWN_ERROR, id: 'btn-login'}, 'text-center');
    });
}

function sendActiveOtp() {
    loaderShow();

    $.ajax({
        type: 'POST',
        url: `/register/send-active-otp?phone=${formLogin.username()}`
    }).done(function (data) {
        tracker.trackObject('success', 'KĂ­ch hoáº¡t tĂ i khoáº£n', data);
        window.location.href = `/register/active-by-otp?phone=${formLogin.username()}`;
        loaderHide();
    }).fail(function (xhr) {
        loaderHide();
        tracker.error(this.url, this.type, xhr, "Active Profile", "activeProfile()- Tháº¥t báº¡i", {
            phone: formLogin.username
        });
        Notify.errorElementV2({message: Error_message.UNKNOWN_ERROR, id: 'btn-login'}, 'text-center');
    });
}
function  getPlatform() {
    var uA = navigator.userAgent || navigator.vendor ;
    if ((/iPad|iPhone|iPod/.test(uA)) || (uA.includes('Mac') && 'ontouchend' in document)) return 'iOS';

    var i, os = ['Windows', 'Android', 'Unix', 'Mac', 'Linux', 'BlackBerry','Web','Wap'];
    for (i = 0; i < os.length; i++) if (new RegExp(os[i],'i').test(uA)) return os[i];

}
function getRedirect() {
    var redirect = $.urlParam("redirect-app", window.location);
    if(redirect==null){
        redirect ="iVND";
    }
   return redirect;
}

function loginIvnd() {
    var message;
    var $btnLogin = $('#btn-login');
    var $loading = $('#loading');
    validateEmptyUserName($('#username').val(), "divUserName");
    validateEmptyPassword($('#password').val(), "divPassword");

    if ($('#btn-login').find($(".fa")).hasClass('fa-sign-in')) {
        $('#btn-login').find($(".fa")).removeClass('fa-sign-in').addClass('fa-spinner');
        $('#btn-login').prop('disabled', true);
    }

    $.ajax({
        type: 'POST',
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        userAgent: navigator.userAgent,
        url: urlLogin,
        data: formLogin.requestLogin()

    }).done(function (data) {
        tracker.track('authen', 'click', 'login success with username: ' + formLogin.username(), 1);
        window.location.href = data;
        $btnLogin.removeClass("css-1esepcw-disable").addClass("css-1esepcw");
        $loading.removeClass("css-1w6qo8v-disable").addClass("css-1w6qo8v");
        FirebaseTracker.setProperty({'spv':getRedirect()});
        FirebaseTracker.setProperty({'platform':getPlatform()});
        FirebaseTracker.setUser(formLogin.username());
    }).fail(function (xhr) {
        tracker.error(this.url, this.type, xhr, "Login", xhr.responseText, formLogin.username());
        try {
            var errorStatus = JSON.parse(xhr.responseText);
            if (errorStatus.message == 'not active' || errorStatus.code == 'IVND-APP-37') {
                if (formLogin.username().indexOf('@') > -1) {
                    message = Error_message.EMAIL_NOT_ACTIVATED;
                } else {
                    message = Error_message.PHONE_NOT_ACTIVATED;
                }
            } else if (errorStatus.message.includes('X-Rate-Limit')) {
                var second = errorStatus.message.split(' ');
                if (lang === 'en') {
                    message = Error_message.UNKNOWN_ERROR + ` ${second[1]} seconds`;
                } else {
                    message = Error_message.UNKNOWN_ERROR + ` ${second[1]} giĂ¢y`;
                }
            } else if (errorStatus.code == 'IVND-APP-35') {
                message = Error_message.INVALID_SESSION;
            } else if (errorStatus.code == 'IVND-APP-56') {
                message = Error_message.ACCOUNT_LOCKED;
            } else if (xhr.status === 500) {
                message = Error_message.SUPPORT_ERROR;
            } else {
                if (formLogin.validate().length == 0) {
                    message = Error_message.INVALID_PASSWORD;
                }
            }
        } catch (err) {
            message = Error_message.UNKNOWN_ERROR;
        }
        Notify.errorElementV2({message: message, id: 'btn-login'}, 'text-center');
        $btnLogin.removeClass("css-1esepcw-disable").addClass("css-1esepcw");
        $loading.removeClass("css-1w6qo8v-disable").addClass("css-1w6qo8v");
    }).always(function () {
        if ($('#sendActiveMail').length) {
            $('#sendActiveMail').on('click', function () {
                sendActiveMail();
            })
        }
        if ($('#sendActiveOtp').length) {
            $('#sendActiveOtp').on('click', function () {
                sendActiveOtp();
            })
        }
        if ($('#btn-login').find($(".fa")).hasClass('fa-spinner')) {
            $('#btn-login').find($(".fa")).removeClass('fa-spinner').addClass('fa-sign-in');
            $('#btn-login').prop('disabled', false);
        }
    });
}

function login() {
    this.error = [];

    this.username = function () {
        return $('#username').val().trim()
    };
    this.password = function () {
        return $('#password').val()
    };
    this.url = function () {
        return $('#url').val()
    };

    this.setUsername = function (value) {
        $('#username').val(value)
    };
    this.setPass = function (value) {
        $('#password').val(value)
    };

    this.validate = function () {
        this.error = [];

        if (!this.username() && !this.password()) {
            this.error.push({message: Error_message.EMPTY_INPUT, id: "login-error"});
            return this.error;
        }

        if (!this.username()) {
            this.error.push({message: "Xin vui lĂ²ng nháº­p tĂªn Ä‘Äƒng nháº­p", id: "username-error"});
        }

        if (!this.password()) {
            this.error.push({message: "Xin vui lĂ²ng nháº­p máº­t kháº©u", id: "password-error"});
        }

        return this.error;
    };

    this.requestLogin = function () {
        return {
            username: this.username(),
            password: this.password(),
            url: this.url()
        }
    }
}
1
