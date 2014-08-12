// ===================================================================
// Author: Matt Kruse <matt@ajaxtoolbox.com>
// WWW: http://www.AjaxToolbox.com/
//
// NOTICE: You may use this code for any purpose, commercial or
// private, without any further permission from the author. You may
// remove this notice from your final code if you wish, however it is
// appreciated by the author if at least my web site address is kept.
//
// You may *NOT* re-distribute this code in any way except through its
// use. That means, you can include it in your product, or your web
// site, or any other form where the code is actually being used. You
// may not put the plain javascript up on your site for download or
// include it in your javascript libraries for download. 
// If you wish to share this code with others, please just point them
// to the URL instead.
// Please DO NOT link directly to my .js files from your site. Copy
// the files to your server and use them there. Thank you.
// ===================================================================

/**
 * The AjaxRequest class is a wrapper for the XMLHttpRequest objects which 
 * are available in most modern browsers. It simplifies the interfaces for
 * making Ajax requests, adds commonly-used convenience methods, and makes 
 * the process of handling state changes more intuitive.
 * An object may be instantiated and used, or the Class methods may be used 
 * which internally create an AjaxRequest object.
 */
function AjaxRequest() {
  var req = new Object();
  
  // -------------------
  // Instance properties
  // -------------------

  /**
   * Timeout period (in ms) until an async request will be aborted, and
   * the onTimeout function will be called
   */
  req.timeout = null;
  
  /**
   *  Since some browsers cache GET requests via XMLHttpRequest, an
   * additional parameter called AjaxRequestUniqueId will be added to
   * the request URI with a unique numeric value appended so that the requested
   * URL will not be cached.
   */
  req.generateUniqueUrl = true;
  
  /**
   * The url that the request will be made to, which defaults to the current 
   * url of the window
   */
  req.url = window.location.href;
  
  /**
   * The method of the request, either GET (default), POST, or HEAD
   */
  req.method = "GET";
  
  /**
   * Whether or not the request will be asynchronous. In general, synchronous 
   * requests should not be used so this should rarely be changed from true
   */
  req.async = true;
  
  /**
   * The username used to access the URL
   */
  req.username = null;
  
  /**
   * The password used to access the URL
   */
  req.password = null;
  
  /**
   * The parameters is an object holding name/value pairs which will be 
   * added to the url for a GET request or the request content for a POST request
   */
  req.parameters = new Object();
  
  /**
   * The sequential index number of this request, updated internally
   */
  req.requestIndex = AjaxRequest.numAjaxRequests++;
  
  /**
   * Indicates whether a response has been received yet from the server
   */
  req.responseReceived = false;
  
  /**
   * The name of the group that this request belongs to, for activity 
   * monitoring purposes
   */
  req.groupName = null;
  
  /**
   * The query string to be added to the end of a GET request, in proper 
   * URIEncoded format
   */
  req.queryString = "";
  
  /**
   * After a response has been received, this will hold the text contents of 
   * the response - even in case of error
   */
  req.responseText = null;
  
  /**
   * After a response has been received, this will hold the XML content
   */
  req.responseXML = null;
  
  /**
   * After a response has been received, this will hold the status code of 
   * the response as returned by the server.
   */
  req.status = null;
  
  /**
   * After a response has been received, this will hold the text description 
   * of the response code
   */
  req.statusText = null;

  /**
   * An internal flag to indicate whether the request has been aborted
   */
  req.aborted = false;
  
  /**
   * The XMLHttpRequest object used internally
   */
  req.xmlHttpRequest = null;

  // --------------
  // Event handlers
  // --------------
  
  /**
   * If a timeout period is set, and it is reached before a response is 
   * received, a function reference assigned to onTimeout will be called
   */
  req.onTimeout = null; 
  
  /**
   * A function reference assigned will be called when readyState=1
   */
  req.onLoading = null;

  /**
   * A function reference assigned will be called when readyState=2
   */
  req.onLoaded = null;

  /**
   * A function reference assigned will be called when readyState=3
   */
  req.onInteractive = null;

  /**
   * A function reference assigned will be called when readyState=4
   */
  req.onComplete = null;

  /**
   * A function reference assigned will be called after onComplete, if 
   * the statusCode=200
   */
  req.onSuccess = null;

  /**
   * A function reference assigned will be called after onComplete, if 
   * the statusCode != 200
   */
  req.onError = null;
  
  /**
   * If this request has a group name, this function reference will be called 
   * and passed the group name if this is the first request in the group to 
   * become active
   */
  req.onGroupBegin = null;

  /**
   * If this request has a group name, and this request is the last request 
   * in the group to complete, this function reference will be called
   */
  req.onGroupEnd = null;

  // Get the XMLHttpRequest object itself
  req.xmlHttpRequest = AjaxRequest.getXmlHttpRequest();
  if (req.xmlHttpRequest==null) { return null; }
  
  // -------------------------------------------------------
  // Attach the event handlers for the XMLHttpRequest object
  // -------------------------------------------------------
  req.xmlHttpRequest.onreadystatechange = 
  function() {
    if (req==null || req.xmlHttpRequest==null) { return; }
    if (req.xmlHttpRequest.readyState==1) { req.onLoadingInternal(req); }
    if (req.xmlHttpRequest.readyState==2) { req.onLoadedInternal(req); }
    if (req.xmlHttpRequest.readyState==3) { req.onInteractiveInternal(req); }
    if (req.xmlHttpRequest.readyState==4) { req.onCompleteInternal(req); }
  };
  
  // ---------------------------------------------------------------------------
  // Internal event handlers that fire, and in turn fire the user event handlers
  // ---------------------------------------------------------------------------
  // Flags to keep track if each event has been handled, in case of 
  // multiple calls (some browsers may call the onreadystatechange 
  // multiple times for the same state)
  req.onLoadingInternalHandled = false;
  req.onLoadedInternalHandled = false;
  req.onInteractiveInternalHandled = false;
  req.onCompleteInternalHandled = false;
  req.onLoadingInternal = 
    function() {
      if (req.onLoadingInternalHandled) { return; }
      AjaxRequest.numActiveAjaxRequests++;
      if (AjaxRequest.numActiveAjaxRequests==1 && typeof(window['AjaxRequestBegin'])=="function") {
        AjaxRequestBegin();
      }
      if (req.groupName!=null) {
        if (typeof(AjaxRequest.numActiveAjaxGroupRequests[req.groupName])=="undefined") {
          AjaxRequest.numActiveAjaxGroupRequests[req.groupName] = 0;
        }
        AjaxRequest.numActiveAjaxGroupRequests[req.groupName]++;
        if (AjaxRequest.numActiveAjaxGroupRequests[req.groupName]==1 && typeof(req.onGroupBegin)=="function") {
          req.onGroupBegin(req.groupName);
        }
      }
      if (typeof(req.onLoading)=="function") {
        req.onLoading(req);
      }
      req.onLoadingInternalHandled = true;
    };
  req.onLoadedInternal = 
    function() {
      if (req.onLoadedInternalHandled) { return; }
      if (typeof(req.onLoaded)=="function") {
        req.onLoaded(req);
      }
      req.onLoadedInternalHandled = true;
    };
  req.onInteractiveInternal = 
    function() {
      if (req.onInteractiveInternalHandled) { return; }
      if (typeof(req.onInteractive)=="function") {
        req.onInteractive(req);
      }
      req.onInteractiveInternalHandled = true;
    };
  req.onCompleteInternal = 
    function() {
      if (req.onCompleteInternalHandled || req.aborted) { return; }
      req.onCompleteInternalHandled = true;
      AjaxRequest.numActiveAjaxRequests--;
      if (AjaxRequest.numActiveAjaxRequests==0 && typeof(window['AjaxRequestEnd'])=="function") {
        AjaxRequestEnd(req.groupName);
      }
      if (req.groupName!=null) {
        AjaxRequest.numActiveAjaxGroupRequests[req.groupName]--;
        if (AjaxRequest.numActiveAjaxGroupRequests[req.groupName]==0 && typeof(req.onGroupEnd)=="function") {
          req.onGroupEnd(req.groupName);
        }
      }
      req.responseReceived = true;
      req.status = req.xmlHttpRequest.status;
      req.statusText = req.xmlHttpRequest.statusText;
      req.responseText = req.xmlHttpRequest.responseText;
      req.responseXML = req.xmlHttpRequest.responseXML;
      if (typeof(req.onComplete)=="function") {
        req.onComplete(req);
      }
      if (req.xmlHttpRequest.status==200 && typeof(req.onSuccess)=="function") {
        req.onSuccess(req);
      }
      else if (typeof(req.onError)=="function") {
        req.onError(req);
      }

      // Clean up so IE doesn't leak memory
      delete req.xmlHttpRequest['onreadystatechange'];
      req.xmlHttpRequest = null;
    };
  req.onTimeoutInternal = 
    function() {
      if (req!=null && req.xmlHttpRequest!=null && !req.onCompleteInternalHandled) {
        req.aborted = true;
        req.xmlHttpRequest.abort();
        AjaxRequest.numActiveAjaxRequests--;
        if (AjaxRequest.numActiveAjaxRequests==0 && typeof(window['AjaxRequestEnd'])=="function") {
          AjaxRequestEnd(req.groupName);
        }
        if (req.groupName!=null) {
          AjaxRequest.numActiveAjaxGroupRequests[req.groupName]--;
          if (AjaxRequest.numActiveAjaxGroupRequests[req.groupName]==0 && typeof(req.onGroupEnd)=="function") {
            req.onGroupEnd(req.groupName);
          }
        }
        if (typeof(req.onTimeout)=="function") {
          req.onTimeout(req);
        }
      // Opera won't fire onreadystatechange after abort, but other browsers do. 
      // So we can't rely on the onreadystate function getting called. Clean up here!
      delete req.xmlHttpRequest['onreadystatechange'];
      req.xmlHttpRequest = null;
      }
    };

  // ----------------
  // Instance methods
  // ----------------
  /**
   * The process method is called to actually make the request. It builds the
   * querystring for GET requests (the content for POST requests), sets the
   * appropriate headers if necessary, and calls the 
   * XMLHttpRequest.send() method
  */
  req.process = 
    function() {
      if (req.xmlHttpRequest!=null) {
        // Some logic to get the real request URL
        if (req.generateUniqueUrl && req.method=="GET") {
          req.parameters["AjaxRequestUniqueId"] = new Date().getTime() + "" + req.requestIndex;
        }
        var content = null; // For POST requests, to hold query string
        for (var i in req.parameters) {
          if (req.queryString.length>0) { req.queryString += "&"; }
          req.queryString += encodeURIComponent(i) + "=" + encodeURIComponent(req.parameters[i]);
        }
        if (req.method=="GET") {
          if (req.queryString.length>0) {
            req.url += ((req.url.indexOf("?")>-1)?"&":"?") + req.queryString;
          }
        }
        req.xmlHttpRequest.open(req.method,req.url,req.async,req.username,req.password);
        if (req.method=="POST") {
          if (typeof(req.xmlHttpRequest.setRequestHeader)!="undefined") {
            req.xmlHttpRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
          }
          content = req.queryString;
        }
        if (req.timeout>0) {
          setTimeout(req.onTimeoutInternal,req.timeout);
        }
        req.xmlHttpRequest.send(content);
      }
    };

  /**
   * An internal function to handle an Object argument, which may contain
   * either AjaxRequest field values or parameter name/values
   */
  req.handleArguments = 
    function(args) {
      for (var i in args) {
        // If the AjaxRequest object doesn't have a property which was passed, treat it as a url parameter
        if (typeof(req[i])=="undefined") {
          req.parameters[i] = args[i];
        }
        else {
          req[i] = args[i];
        }
      }
    };

  /**
   * Returns the results of XMLHttpRequest.getAllResponseHeaders().
   * Only available after a response has been returned
   */
  req.getAllResponseHeaders =
    function() {
      if (req.xmlHttpRequest!=null) {
        if (req.responseReceived) {
          return req.xmlHttpRequest.getAllResponseHeaders();
        }
        alert("Cannot getAllResponseHeaders because a response has not yet been received");
      }
    };

  /**
   * Returns the the value of a response header as returned by 
   * XMLHttpRequest,getResponseHeader().
   * Only available after a response has been returned
   */
  req.getResponseHeader =
    function(headerName) {
      if (req.xmlHttpRequest!=null) {
        if (req.responseReceived) {
          return req.xmlHttpRequest.getResponseHeader(headerName);
        }
        alert("Cannot getResponseHeader because a response has not yet been received");
      }
    };

  return req;
}

// ---------------------------------------
// Static methods of the AjaxRequest class
// ---------------------------------------

/**
 * Returns an XMLHttpRequest object, either as a core object or an ActiveX 
 * implementation. If an object cannot be instantiated, it will return null;
 */
AjaxRequest.getXmlHttpRequest = function() {
  if (window.XMLHttpRequest) {
    return new XMLHttpRequest();
  }
  else if (window.ActiveXObject) {
    // Based on http://jibbering.com/2002/4/httprequest.html
    /*@cc_on @*/
    /*@if (@_jscript_version >= 5)
    try {
      return new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
      try {
        return new ActiveXObject("Microsoft.XMLHTTP");
      } catch (E) {
        return null;
      }
    }
    @end @*/
  }
  else {
    return null;
  }
};

/**
 * See if any request is active in the background
 */
AjaxRequest.isActive = function() {
  return (AjaxRequest.numActiveAjaxRequests>0);
};

/**
 * Make a GET request. Pass an object containing parameters and arguments as 
 * the second argument.
 * These areguments may be either AjaxRequest properties to set on the request 
 * object or name/values to set in the request querystring.
 */
AjaxRequest.get = function(args) {
  AjaxRequest.doRequest("GET",args);
};

/**
 * Make a POST request. Pass an object containing parameters and arguments as 
 * the second argument.
 * These areguments may be either AjaxRequest properties to set on the request 
 * object or name/values to set in the request querystring.
 */
AjaxRequest.post = function(args) {
  AjaxRequest.doRequest("POST",args);
};

/**
 * The internal method used by the .get() and .post() methods
 */
AjaxRequest.doRequest = function(method,args) {
  if (typeof(args)!="undefined" && args!=null) {
    var myRequest = new AjaxRequest();
    myRequest.method = method;
    myRequest.handleArguments(args);
    myRequest.process();
  }
}  ;

/**
 * Submit a form. The requested URL will be the form's ACTION, and the request 
 * method will be the form's METHOD.
 * Returns true if the submittal was handled successfully, else false so it 
 * can easily be used with an onSubmit event for a form, and fallback to 
 * submitting the form normally.
 */
AjaxRequest.submit = function(theform, args) {
  var myRequest = new AjaxRequest();
  if (myRequest==null) { return false; }
  var serializedForm = AjaxRequest.serializeForm(theform);
  myRequest.method = theform.method.toUpperCase();
  myRequest.url = theform.action;
  myRequest.handleArguments(args);
  myRequest.queryString = serializedForm;
  myRequest.process();
  return true;
};

/**
 * Serialize a form into a format which can be sent as a GET string or a POST 
 * content.It correctly ignores disabled fields, maintains order of the fields 
 * as in the elements[] array. The 'file' input type is not supported, as 
 * its content is not available to javascript. This method is used internally
 * by the submit class method.
 */
AjaxRequest.serializeForm = function(theform) {
  var els = theform.elements;
  var len = els.length;
  var queryString = "";
  this.addField = 
    function(name,value) { 
      if (queryString.length>0) { 
        queryString += "&";
      }
      queryString += encodeURIComponent(name) + "=" + encodeURIComponent(value);
    };
  for (var i=0; i<len; i++) {
    var el = els[i];
    if (!el.disabled) {
      switch(el.type) {
        case 'text': case 'password': case 'hidden': case 'textarea': 
          this.addField(el.name,el.value);
          break;
        case 'select-one':
          if (el.selectedIndex>=0) {
            this.addField(el.name,el.options[el.selectedIndex].value);
          }
          break;
        case 'select-multiple':
          for (var j=0; j<el.options.length; j++) {
            if (el.options[j].selected) {
              this.addField(el.name,el.options[j].value);
            }
          }
          break;
        case 'checkbox': case 'radio':
          if (el.checked) {
            this.addField(el.name,el.value);
          }
          break;
      }
    }
  }
  return queryString;
};

// -----------------------
// Static Class variables
// -----------------------

/**
 * The number of total AjaxRequest objects currently active and running
 */
AjaxRequest.numActiveAjaxRequests = 0;

/**
 * An object holding the number of active requests for each group
 */
AjaxRequest.numActiveAjaxGroupRequests = new Object();

/**
 * The total number of AjaxRequest objects instantiated
 */
AjaxRequest.numAjaxRequests = 0;
