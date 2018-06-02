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
function getLastPostFiltre(filtre,cb) {
    getJSON("/api/get/post-"+filtre, function (err, status, data) {
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

function prettyDate(time) {
    var date = new Date(time),
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400),
        month_diff = Math.floor(diff / (86400 * 31));

    if (isNaN(day_diff) || day_diff < 0)
        return;

    return day_diff == 0 && (
        (diff < 60 && month_diff === 0) && "à l'instant" ||
        (diff < 120 && month_diff === 0) && "Il y a 1 minute" ||
        (diff < 3600 && month_diff === 0) && "Il y a " + Math.floor(diff / 60) + " minutes" ||
        (diff < 7200 && month_diff === 0) && "Il y a 1 heure" ||
        (diff < 86400 && month_diff === 0) && "Il y a " + Math.floor(diff / 3600) + " heures") ||
        (day_diff === 1 && month_diff === 0) && "Hier " ||
        (day_diff < 7  && month_diff === 0) && "Il y a " + day_diff + " jours" ||
        (day_diff < 31 && month_diff === 0) && "Il y a " + Math.ceil(day_diff / 7) + " semaines" ||
        month_diff === 1 && "1 mois " ||
        month_diff > 0 && "Il y a " + month_diff + " mois";
}