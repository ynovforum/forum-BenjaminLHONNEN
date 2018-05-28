function sendJson(json, url, method, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onloadend = function () {
        var status = xhr.status;
        if (status === 200) {
            callback(null, status, xhr.response);
        } else {
            callback("error", status, xhr.response);
        }
    };
    xhr.send(json);
}

function getJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onloadend = function () {
        var status = xhr.status;
        if (status === 200) {
            callback(null, status, xhr.response);
        } else {
            callback("error", status, xhr.response);
        }
    };
    xhr.send();
}

function getResponse(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onloadend = function () {
        var status = xhr.status;
        if (status === 200) {
            callback(null, status, xhr.response);
        } else {
            callback("error", status, xhr.response);
        }
    };
    xhr.send();
}

function getLastPost(cb) {
    getJSON("/api/get/post", function (err, status, data) {
        cb(err, status, data);
    });
}

function getCommentByIdPost(idPost, cb) {
    getJSON("/api/get/comment-" + idPost, function (err, status, data) {
        cb(err, status, data);
    });
}

function postComment(comment, cb) {
    sendJson(JSON.stringify(comment), "api/add/comment", "POST", function (err, status, data) {
        cb(err, status, data);
    });
}

function updateComment(comment, idComment, cb) {
    sendJson(JSON.stringify(comment), "api/update/comment-" + idComment, "POST", function (err, status, data) {
        cb(err, status, data);
    });
}