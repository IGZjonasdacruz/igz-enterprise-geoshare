iris.resource(
 function(self){

  function paramMixin(method, endpoint) {
    var params = [];
    var i = 0, j = 0;
    if (method.param) {
      for (i = 0; i < method.param.length; i++) {
        params.push(method.param[i]);
      }
    }

    if (endpoint.param) {
      for (i = 0; i < endpoint.param.length; i++) {
        var found = false;
        for (j = 0; j < params.length; j++) {
          if (endpoint.param[i].name === params[j].name) {
            found  = true;
            break;
          }
        }
        if (found) {
          params.push(endpoint.param[j]);
        }
      }
    }

    return params;

  }

  self.serverTry = function(method, p_cbk) {
    var endpoint = method.parent;
    var version = endpoint.parent;
    var api = version.parent;
    var json = method.type == "json";
    var options = {
      type: method.method,
      url: version.protocol + "://" + version.host + ":" + (version.port || 80) + version.path + endpoint.path + method.path,
      json: json,
      body: {},
      header: {},
      path: {},
      query: {},
      "content-type": method["content-type"]
    };

    var params = paramMixin(method, endpoint);
    for (var i = 0; i < params.length; i++) {
      var param = params[i];
      if (param.value !== "") {
        if (param.isList !== "true" || param.value.indexOf("[") === 0) {
          options[param.location][param.name] = param.value;
        } else {
          options[param.location][param.name] = "[" + param.value + "]";
        }
        
      }
    }
    
    var settings = {
      type: "POST",
      url: "/processReq",
      data: {"options": options},
      dataType: "json"
    };



    $.ajax(settings).done(function(data, textStatus, jqXHR) {
      if (p_cbk) {
        p_cbk(data);
      }
      iris.notify(iris.evts.try, method);
    }).fail(function(jqXHR, textStatus, errorThrown) {
      console.log("error");
      if (p_cbk) {
        p_cbk({statusCode: "error " + textStatus});
      }
    });

  }

  self.clientTry = function(method, p_cbk) {
    var endpoint = method.parent;
    var version = endpoint.parent;
    var api = version.parent;
    var json = method.type == "json";
    var options = {
      type: method.method,
      url: version.protocol + "://" + version.host + ":" + (version.port || 80) + version.path + endpoint.path + method.path,
      proccessData: true,
      data: {},
      headers: {}
    };

    var params = paramMixin(method, endpoint);
    for (var i = 0; i < params.length; i++) {
      var param = params[i];
      if (param.value !== "") {
        if (param.location == "body" && json) {
          options.data[param.name] = JSON.parse(param.value);  
        } else if (param.location == "body" || param.location == "query") {
          options.data[param.name] = param.value;  
        }  else if (param.location == "path") {
          var regx = new RegExp('(:' + param.name + ")($|/)", "g");
          options.url = options.url.replace(regx, function(match, p1, p2, offset, string) {
            return param.value + p2;
          });
        } else if (param.location == "header") {
          options.headers[param.name] = param.value;  
        }
      }
    }
    
    $.ajax(options).done(function(data, textStatus, jqXHR) {
      if (p_cbk) {
        p_cbk({"statusCode": jqXHR.status, "body": data, "headers": jqXHR.getAllResponseHeaders()});
      }
      iris.notify(iris.evts.try, method);
    }).fail(function(jqXHR, textStatus, errorThrown) {
      console.log("error");
      if (p_cbk) {
        p_cbk({"statusCode": jqXHR.status, "body": errorThrown, "headers": jqXHR.getAllResponseHeaders()});
      }
    });

  }
		
 },
 iris.path.resource.try);