var OSv = OSv || {};
OSv.API = OSv.API || {};
OSv.API.Applications = OSv.API.Applications || {};
OSv.API.Applications.Tomcat = OSv.API.Applications.Tomcat || {};
OSv.API.Applications.Tomcat.Requests = (function() {

  var Jolokia = OSv.API.Jolokia,
    CassandraGraph = OSv.API.Applications.CassandraGraph,
    apiGETCall = helpers.apiGETCall


  function Requests() {
    var self = this;
    OSv.API.Applications.Tomcat.ifIsRunning().then(function (isRunning) {
      if (isRunning) self.startPulling();
    });
  }

  Requests.prototype = Object.create(CassandraGraph.prototype);

  Requests.prototype.plots = null;

  Requests.prototype.pullData = function () {
    var self = this;
    if (window.globalPause) return;
    Jolokia.read("Catalina:type=GlobalRequestProcessor,name=*?ignoreErrors=true")
    .then(function (res) {
      if (self.plots == null) self.plots = {};
      var timestamp = res.timestamp;
      $.map(res.value, function (value, key) {
        
        var name = key.match(/name=(.*?)($|,)/)[1],
          bytesSentLabel = name + " - Bytes Sent",
          bytesReceivedLabel = name + " - Bytes Received",
          processingTimeLabel = name + " - Processing Time",
          errorCountLabel = name + " - Error Count",
          requestsLabel = name + " - Requests";


        self.plots[bytesSentLabel] = self.plots[bytesSentLabel] || new helpers.DerivativePlot();
        self.plots[bytesReceivedLabel] = self.plots[bytesReceivedLabel] || new helpers.DerivativePlot();
        self.plots[processingTimeLabel] = self.plots[processingTimeLabel] || new helpers.DerivativePlot();
        self.plots[errorCountLabel] = self.plots[errorCountLabel] || new helpers.DerivativePlot();
        self.plots[requestsLabel] = self.plots[requestsLabel] || new helpers.DerivativePlot();

        self.plots[bytesSentLabel].add(timestamp, value.bytesSent);
        self.plots[bytesReceivedLabel].add(timestamp, value.bytesReceived);
        self.plots[processingTimeLabel].add(timestamp, value.processingTimel)
        self.plots[errorCountLabel].add(timestamp, value.errorCount)
        self.plots[requestsLabel].add(timestamp, value.requestCount)
      })

    })
  };

  Requests.prototype.getPlots = function () {
    if (this.plots == null) return [[null]];
    return $.map(this.plots, function (plot) {
      return [plot];
    });
  };

  Requests.prototype.getLabels = function () {
    if (this.plots == null) return [];
    return $.map(this.plots, function (plot, label) {
      return label;
    });
  };

  var singleton = new Requests();
  
  return singleton;
}());
