

const $hammer = (() => {
    const isRequest = "undefined" != typeof $request,
        isSurge = "undefined" != typeof $httpClient,
        isQuanX = "undefined" != typeof $task;

    const log = (...n) => { for (let i in n) console.log(n[i]) };
    const alert = (title, body = "", subtitle = "", options = {}) => {
        // option(<object>|<string>): {open-url: <string>, media-url: <string>}
        let link = null;
        switch (typeof options) {
            case "string":
                link = isQuanX ? { "open-url": options } : options;
                break;
            case "object":
                if (["null", "{}"].indexOf(JSON.stringify(options)) == -1) {
                    link = isQuanX ? options : options["open-url"];
                    break;
                }
            default:
                link = isQuanX ? {} : "";
        }
        if (isSurge) return $notification.post(title, subtitle, body, link);
        if (isQuanX) return $notify(title, subtitle, body, link);
        log("==============📣系统通知📣==============");
        log("title:", title, "subtitle:", subtitle, "body:", body, "link:", link);
    };
    const read = key => {
        if (isSurge) return $persistentStore.read(key);
        if (isQuanX) return $prefs.valueForKey(key);
    };
    const write = (val, key) => {
        if (isSurge) return $persistentStore.write(val, key);
        if (isQuanX) return $prefs.setValueForKey(val, key);
    };
    const request = (method, params, callback) => {
        /**
         * 
         * params(<object>): {url: <string>, headers: <object>, body: <string>} | <url string>
         * 
         * callback(
         *      error, 
         *      <response-body string>?,
         *      {status: <int>, headers: <object>, body: <string>}?
         * )
         * 
         */
        let options = {};
        if (typeof params == "string") {
            options.url = params;
        } else {
            options.url = params.url;
            if (typeof params == "object") {
                params.headers && (options.headers = params.headers);
                params.body && (options.body = params.body);
            }
        }
        method = method.toUpperCase();

        const writeRequestErrorLog = function (m, u) {
            return err => {
                log(`\n=== request error -s--\n`);
                log(`${m} ${u}`, err);
                log(`\n=== request error -e--\n`);
            };
        }(method, options.url);

        if (isSurge) {
            const _runner = method == "GET" ? $httpClient.get : $httpClient.post;
            return _runner(options, (error, response, body) => {
                if (error == null || error == "") {
                    response.body = body;
                    callback("", body, response);
                } else {
                    writeRequestErrorLog(error);
                    callback(error, "", response);
                }
            });
        }
        if (isQuanX) {
            options.method = method;
            $task.fetch(options).then(
                response => {
                    response.status = response.statusCode;
                    delete response.statusCode;
                    callback("", response.body, response);
                },
                reason => {
                    writeRequestErrorLog(reason.error);
                    response.status = response.statusCode;
                    delete response.statusCode;
                    callback(reason.error, "", response);
                }
            );
        }
    };
    const done = (value = {}) => {
        if (isQuanX) return isRequest ? $done(value) : null;
        if (isSurge) return isRequest ? $done(value) : $done();
    };
    return { isRequest, isSurge, isQuanX, log, alert, read, write, request, done };
})();

const CookieKey = "CookieJUZICLOUD";
const Protagonist = "桔子云";

function GetCookie() {
    const CookieName = "JUZICLOUD的Cookie";
    const CookieValue = $request.headers.Cookie;
    if(!CookieValue){
        $hammer.alert(CookieName, "未捕获到cookie信息");
        return $hammer.done();
    }
    const historyCookieVal = $hammer.read(CookieKey);
    const dynamic = historyCookieVal ? (historyCookieVal == CookieValue ? "" : "更新") : "写入";
    if (dynamic) {
        $hammer.write(CookieValue, CookieKey);
        $hammer.alert(CookieName, `${dynamic}成功🎉`);
    } else {
        $hammer.alert(CookieName, 'cookie已存在');
    }
    $hammer.done();
}

function checkin() {
    const cookie = $hammer.read(CookieKey);
    if (!cookie) {
        $hammer.alert(Protagonist, "cookie没有，先去获取吧!");
        return $hammer.done();
    }
    const host = `https://juzi66.com`;
    let options = {
        url: `${host}/user/checkin`,
        headers: {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "origin": "https://juzi66.com",
            "referer": "https://juzi66.com/user",
            "cookie": cookie,
            "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
        }
    }
    $hammer.request("post", options, (error, response, result) => {
        if (error) {
            $hammer.alert(Protagonist, error, "签到请求失败");
            return $hammer.done();
        }
        try {
            response = JSON.parse(response);
        } catch (error) {
            $hammer.log(`${Protagonist}签到结果：`, result);
            if (result.body.indexOf("remember-me") > 0) {
                $hammer.alert(Protagonist, "Cookie又过期了", "", `${host}/user/profile`);
            } else {
                $hammer.alert(Protagonist, "签到结果解析异常，看一下日志");
            }
            return $hammer.done();
        }
        $hammer.alert(Protagonist, response.msg);
        $hammer.done();
    })
}

$hammer.isRequest ? GetCookie() : checkin();
