function requestParse(reqResult, type) {
  if (!!type) {
    if (type === "object") {
      if (!reqResult) {
        return null;
      }
      return JSON.parse(reqResult);
    } else if (type.indexOf("int") === 0) {
      return reqResult * 1;
    } else if (type === "boolean") {
      return reqResult === "True";
    } else {
      return reqResult;
    }
  } else {
    return reqResult;
  }
}

function AjaxApiSetter(url, args) {
  var httpRequest = new XMLHttpRequest();
  try {
    httpRequest.onreadystatechange = function () {};
    httpRequest.open("POST", url, false);
    httpRequest.setRequestHeader(
      "Content-Type",
      "application/x-www-form-urlencoded",
    );

    var formParam = JSON.stringify(args);
    var urlEncodedDataPairs = [];
    urlEncodedDataPairs.push("value=" + formParam);
    var urlEncodedData = urlEncodedDataPairs.join("&").replace(/%20/g, "+");
    httpRequest.send(urlEncodedData);
  } catch (error) {
    throw error;
  }
  return requestParse(httpRequest.responseText);
}

function AjaxApi(url, type, args = null, callType, valueType) {
  var httpRequest = new XMLHttpRequest();
  let argsClone = args;
  let valueTypeClone = valueType;

  try {
    httpRequest.onreadystatechange = function () {};

    if (callType === "PROP") {
      argsClone = null;
      valueTypeClone = args;
    }

    httpRequest.open(type, url, false);
    httpRequest.setRequestHeader("Content-type", "application/json-patch+json");
    var formParam = argsClone ? JSON.stringify(argsClone) : null;
    httpRequest.send(formParam);
  } catch (error) {
    throw error;
  }
  return requestParse(httpRequest.responseText, valueTypeClone);
}

function requestKioskSetter(callType, methodName, args) {
  var url = "http://localhost:5000";
  url = url + "/v2/Kiosk/exec/";
  url = url + methodName + "/";
  var result = AjaxApiSetter(url, args);
  return result;
}

function requestServiceSetter(callType, serviceName, methodName, args) {
  var url = "http://localhost:5000";
  url = url + "/v2/Services/exec/";
  url = url + serviceName + "/" + methodName + "/";
  var result = AjaxApiSetter(url, args);
  return result;
}

function requestDeviceSetter(
  callType,
  serviceName,
  deviceName,
  methodName,
  args,
) {
  var url = "http://localhost:5000";
  url = url + "/v2/Devices/exec/";
  url = url + serviceName + "/" + deviceName + "/" + methodName + "/";
  var result = AjaxApiSetter(url, args);
  return result;
}

function requestSubDeviceSetter(
  callType,
  serviceName,
  deviceName,
  subdevicename,
  methodName,
  args,
) {
  var url = "http://localhost:5000";
  url = url + "/v2/SubDevices/exec/";
  url =
    url +
    serviceName +
    "/" +
    deviceName +
    "/" +
    subdevicename +
    "/" +
    methodName +
    "/";
  var result = AjaxApiSetter(url, args);
  return result;
}

function requestKiosk(callType, methodName, args, valueType) {
  var url = "http://localhost:5000";
  url = url + "/v2/Kiosk/exec/";
  url = url + methodName + "/";
  var result = AjaxApi(url, "POST", args, callType, valueType);
  return result;
}

function startApplication(title) {
  var url = "http://localhost:5000/api/System/StartApplication/" + title;
  if (!title) {
    url = "http://localhost:5000/api/System/StartApplication";
  }
  var result = AjaxApi(url, "POST", "");
  return result;
}

function requestService(callType, serviceName, methodName, args, valueType) {
  var url = "http://localhost:5000";
  url = url + "/v2/Services/exec/";
  url = url + serviceName + "/" + methodName + "/";
  var result = AjaxApi(url, "POST", args, callType, valueType);
  return result;
}

function requestDevice(
  callType,
  serviceName,
  deviceName,
  methodName,
  args,
  valueType,
) {
  var url = "http://localhost:5000";
  url = url + "/v2/Devices/exec/";
  url = url + serviceName + "/" + deviceName + "/" + methodName + "/";
  var result = AjaxApi(url, "POST", args, callType, valueType);
  return result;
}

function requestSubDevice(
  callType,
  serviceName,
  deviceName,
  subdeviceName,
  methodName,
  args,
  valueType,
) {
  var url = "http://localhost:5000";
  url = url + "/v2/SubDevices/exec/";
  url =
    url +
    serviceName +
    "/" +
    deviceName +
    "/" +
    subdeviceName +
    "/" +
    methodName +
    "/";
  var result = AjaxApi(url, "POST", args, callType, valueType);
  return result;
}

function requestAddEventListener(serviceName, evtName) {
  var url = "http://localhost:5000";
  url = url + "/api/System/EventAddListener/";
  url = url + serviceName + "/" + evtName + "/";
  var result = AjaxApi(url, "GET");
  return result;
}

function requestRemoveEventListener(serviceName, evtName) {
  var url = "http://localhost:5000";
  url = url + "/api/System/EventRemoveListener/";
  url = url + serviceName + "/" + evtName + "/";
  var result = AjaxApi(url, "GET");
  return result;
}

var Kiosk = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("Kiosk", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("Kiosk", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestKiosk("PROP", "get_category", "string");
  },
  set category(value) {
    requestKioskSetter("PROP", "set_category", value);
  },
  get group() {
    return requestKiosk("PROP", "get_group", "string");
  },
  set group(value) {
    requestKioskSetter("PROP", "set_group", value);
  },
  get status() {
    return requestKiosk("PROP", "get_status", "string");
  },
  set status(value) {
    requestKioskSetter("PROP", "set_status", value);
  },
  get statusDescription() {
    return requestKiosk("PROP", "get_statusDescription", "string");
  },
  set statusDescription(value) {
    requestKioskSetter("PROP", "set_statusDescription", value);
  },
  get statusDetail() {
    return requestKiosk("PROP", "get_statusDetail", "string");
  },
  set statusDetail(value) {
    requestKioskSetter("PROP", "set_statusDetail", value);
  },
  get state() {
    return requestKiosk("PROP", "get_state", "string");
  },
  set state(value) {
    requestKioskSetter("PROP", "set_state", value);
  },
  get stateDescription() {
    return requestKiosk("PROP", "get_stateDescription", "string");
  },
  set stateDescription(value) {
    requestKioskSetter("PROP", "set_stateDescription", value);
  },
  get stateDetail() {
    return requestKiosk("PROP", "get_stateDetail", "string");
  },
  set stateDetail(value) {
    requestKioskSetter("PROP", "set_stateDetail", value);
  },
  get statusObject() {
    return requestKiosk("PROP", "get_statusObject", "object");
  },
  set statusObject(value) {
    requestKioskSetter("PROP", "set_statusObject", value);
  },
  get realTimeStatus() {
    return requestKiosk("PROP", "get_RealTimeStatus", "boolean");
  },
  set realTimeStatus(value) {
    requestKioskSetter("PROP", "set_RealTimeStatus", value);
  },
  get eventsDistribution() {
    return requestKiosk("PROP", "get_EventsDistribution", "string");
  },
  set eventsDistribution(value) {
    requestKioskSetter("PROP", "set_EventsDistribution", value);
  },
  get erpRef() {
    return requestKiosk("PROP", "get_ErpRef", "string");
  },
  set erpRef(value) {
    requestKioskSetter("PROP", "set_ErpRef", value);
  },
  get erpName() {
    return requestKiosk("PROP", "get_ErpName", "string");
  },
  set erpName(value) {
    requestKioskSetter("PROP", "set_ErpName", value);
  },
  get erpDescription() {
    return requestKiosk("PROP", "get_ErpDescription", "string");
  },
  set erpDescription(value) {
    requestKioskSetter("PROP", "set_ErpDescription", value);
  },
  get description() {
    return requestKiosk("PROP", "get_description", "string");
  },
  set description(value) {
    requestKioskSetter("PROP", "set_description", value);
  },
  get testable() {
    return requestKiosk("PROP", "get_testable", "boolean");
  },
  set testable(value) {
    requestKioskSetter("PROP", "set_testable", value);
  },
  allStatus: function () {
    return requestKiosk("FUNC", "allStatus", null, "object");
  },
  init: function () {
    return requestKiosk("FUNC", "Init", null, "object");
  },
  test: function () {
    return requestKiosk("FUNC", "test", null, "boolean");
  },
  getLinkDocs: function () {
    return requestKiosk("FUNC", "GetLinkDocs", null, "object");
  },
  reportStatus: function () {
    return requestKiosk("FUNC", "ReportStatus", null, "object");
  },
  reportStartStatus: function () {
    return requestKiosk("FUNC", "ReportStartStatus", null, "object");
  },
  getLinks: function () {
    return requestKiosk("FUNC", "GetLinks", null, "object");
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestKiosk("FUNC", "NotifySessionType", sessionType, "object");
  },
  saveToJson: function () {
    return requestKiosk("FUNC", "SaveToJson", null, "object");
  },
  startTransaction: function () {
    return requestKiosk("FUNC", "StartTransaction", null, "object");
  },
  rollback: function () {
    return requestKiosk("FUNC", "Rollback", null, "object");
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestKiosk("FUNC", "RollbackSingle", propertyName, "object");
  },
  commit: function () {
    return requestKiosk("FUNC", "Commit", null, "object");
  },
  get applications() {
    return requestKiosk("PROP", "get_applications", "object");
  },
  set applications(value) {
    requestKioskSetter("PROP", "set_applications", value);
  },
  get warningDiskSpace() {
    return requestKiosk("PROP", "get_WarningDiskSpace", "int32");
  },
  set warningDiskSpace(value) {
    requestKioskSetter("PROP", "set_WarningDiskSpace", value);
  },
  get criticalDiskSpace() {
    return requestKiosk("PROP", "get_CriticalDiskSpace", "int32");
  },
  set criticalDiskSpace(value) {
    requestKioskSetter("PROP", "set_CriticalDiskSpace", value);
  },
  get delayDiskSpace() {
    return requestKiosk("PROP", "get_DelayDiskSpace", "int32");
  },
  set delayDiskSpace(value) {
    requestKioskSetter("PROP", "set_DelayDiskSpace", value);
  },
  saveKiosk: function () {
    return requestKiosk("FUNC", "SaveKiosk", null, "object");
  },
  /**
   *
   * @param {NameDTO} name -
   */
  save: function (name) {
    return requestKiosk("FUNC", "Save", name, "object");
  },
  get client() {
    return requestKiosk("PROP", "get_client", "string");
  },
  set client(value) {
    requestKioskSetter("PROP", "set_client", value);
  },
  get hostName() {
    return requestKiosk("PROP", "get_hostName", "string");
  },
  set hostName(value) {
    requestKioskSetter("PROP", "set_hostName", value);
  },
  get serial() {
    return requestKiosk("PROP", "get_serial", "string");
  },
  set serial(value) {
    requestKioskSetter("PROP", "set_serial", value);
  },
  get model() {
    return requestKiosk("PROP", "get_model", "string");
  },
  set model(value) {
    requestKioskSetter("PROP", "set_model", value);
  },
  get path() {
    return requestKiosk("PROP", "get_path", "string");
  },
  set path(value) {
    requestKioskSetter("PROP", "set_path", value);
  },
  get location() {
    return requestKiosk("PROP", "get_location", "string");
  },
  set location(value) {
    requestKioskSetter("PROP", "set_location", value);
  },
  get current() {
    return requestKiosk("PROP", "get_current", "object");
  },
  set current(value) {
    requestKioskSetter("PROP", "set_current", value);
  },
  get customerData() {
    return requestKiosk("PROP", "get_customerData", "object");
  },
  set customerData(value) {
    requestKioskSetter("PROP", "set_customerData", value);
  },
  get services() {
    return requestKiosk("PROP", "get_services", "object");
  },
  set services(value) {
    requestKioskSetter("PROP", "set_services", value);
  },
  get devices() {
    return requestKiosk("PROP", "get_devices", "object");
  },
  set devices(value) {
    requestKioskSetter("PROP", "set_devices", value);
  },
  get subdevices() {
    return requestKiosk("PROP", "get_subdevices", "object");
  },
  set subdevices(value) {
    requestKioskSetter("PROP", "set_subdevices", value);
  },
  get version() {
    return requestKiosk("PROP", "get_Version", "string");
  },
  set version(value) {
    requestKioskSetter("PROP", "set_Version", value);
  },
  currentAppParam: function () {
    return requestKiosk("FUNC", "currentAppParam", null, "string");
  },
  restart: function () {
    return requestKiosk("FUNC", "Restart", null, "object");
  },
  shutdown: function () {
    return requestKiosk("FUNC", "Shutdown", null, "object");
  },
};
Kiosk.maintv4 = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("maintv4", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("maintv4", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestService("PROP", "maintv4", "get_category", "string");
  },
  get group() {
    return requestService("PROP", "maintv4", "get_group", "string");
  },
  get status() {
    return requestService("PROP", "maintv4", "get_status", "string");
  },
  get statusDescription() {
    return requestService("PROP", "maintv4", "get_statusDescription", "string");
  },
  get statusDetail() {
    return requestService("PROP", "maintv4", "get_statusDetail", "string");
  },
  get state() {
    return requestService("PROP", "maintv4", "get_state", "string");
  },
  get stateDescription() {
    return requestService("PROP", "maintv4", "get_stateDescription", "string");
  },
  get stateDetail() {
    return requestService("PROP", "maintv4", "get_stateDetail", "string");
  },
  get statusObject() {
    return requestService("PROP", "maintv4", "get_statusObject", "object");
  },
  get testable() {
    return requestService("PROP", "maintv4", "get_testable", "boolean");
  },
  allStatus: function () {
    return requestService("FUNC", "maintv4", "allStatus", null, "object");
  },
  init: function () {
    return requestService("FUNC", "maintv4", "Init", null, "object");
  },
  test: function () {
    return requestService("FUNC", "maintv4", "test", null, "boolean");
  },
  getLinkDocs: function () {
    return requestService("FUNC", "maintv4", "GetLinkDocs", null, "object");
  },
  reportStatus: function () {
    return requestService("FUNC", "maintv4", "ReportStatus", null, "object");
  },
  reportStartStatus: function () {
    return requestService(
      "FUNC",
      "maintv4",
      "ReportStartStatus",
      null,
      "object",
    );
  },
  getLinks: function () {
    return requestService("FUNC", "maintv4", "GetLinks", null, "object");
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestService(
      "FUNC",
      "maintv4",
      "NotifySessionType",
      sessionType,
      "object",
    );
  },
  saveToJson: function () {
    return requestService("FUNC", "maintv4", "SaveToJson", null, "object");
  },
  startTransaction: function () {
    return requestService(
      "FUNC",
      "maintv4",
      "StartTransaction",
      null,
      "object",
    );
  },
  rollback: function () {
    return requestService("FUNC", "maintv4", "Rollback", null, "object");
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestService(
      "FUNC",
      "maintv4",
      "RollbackSingle",
      propertyName,
      "object",
    );
  },
  commit: function () {
    return requestService("FUNC", "maintv4", "Commit", null, "object");
  },
  get appParams() {
    return requestService("PROP", "maintv4", "get_appParams", "object");
  },
  /**
   *
   * @param {AppParamDTO} appParamDTO -
   */
  appParamEdit: function (appParamDTO) {
    return requestService(
      "FUNC",
      "maintv4",
      "appParamEdit",
      appParamDTO,
      "object",
    );
  },
  /**
   *
   * @param {String} name -
   */
  appParamErase: function (name) {
    return requestService("FUNC", "maintv4", "appParamErase", name, "object");
  },
  /**
   *
   * @param {InformationDTO} information -
   */
  addEvent: function (information) {
    return requestService("FUNC", "maintv4", "AddEvent", information, "object");
  },
  /**
   *
   * @param {StatusDTO} data -
   */
  setApplicationStatus: function (data) {
    return requestService(
      "FUNC",
      "maintv4",
      "setApplicationStatus",
      data,
      "object",
    );
  },
};
/**
 * PanelPC
 * Service de gestion du panelPC audio
 */
Kiosk.PanelPC = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("PanelPC", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("PanelPC", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestService("PROP", "PanelPC", "get_category", "string");
  },
  get group() {
    return requestService("PROP", "PanelPC", "get_group", "string");
  },
  get status() {
    return requestService("PROP", "PanelPC", "get_status", "string");
  },
  get statusDescription() {
    return requestService("PROP", "PanelPC", "get_statusDescription", "string");
  },
  get statusDetail() {
    return requestService("PROP", "PanelPC", "get_statusDetail", "string");
  },
  get state() {
    return requestService("PROP", "PanelPC", "get_state", "string");
  },
  get stateDescription() {
    return requestService("PROP", "PanelPC", "get_stateDescription", "string");
  },
  get stateDetail() {
    return requestService("PROP", "PanelPC", "get_stateDetail", "string");
  },
  get statusObject() {
    return requestService("PROP", "PanelPC", "get_statusObject", "object");
  },
  get testable() {
    return requestService("PROP", "PanelPC", "get_testable", "boolean");
  },
  allStatus: function () {
    return requestService("FUNC", "PanelPC", "allStatus", null, "object");
  },
  init: function () {
    return requestService("FUNC", "PanelPC", "Init", null, "object");
  },
  test: function () {
    return requestService("FUNC", "PanelPC", "test", null, "boolean");
  },
  getLinkDocs: function () {
    return requestService("FUNC", "PanelPC", "GetLinkDocs", null, "object");
  },
  reportStatus: function () {
    return requestService("FUNC", "PanelPC", "ReportStatus", null, "object");
  },
  reportStartStatus: function () {
    return requestService(
      "FUNC",
      "PanelPC",
      "ReportStartStatus",
      null,
      "object",
    );
  },
  getLinks: function () {
    return requestService("FUNC", "PanelPC", "GetLinks", null, "object");
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestService(
      "FUNC",
      "PanelPC",
      "NotifySessionType",
      sessionType,
      "object",
    );
  },
  saveToJson: function () {
    return requestService("FUNC", "PanelPC", "SaveToJson", null, "object");
  },
  startTransaction: function () {
    return requestService(
      "FUNC",
      "PanelPC",
      "StartTransaction",
      null,
      "object",
    );
  },
  rollback: function () {
    return requestService("FUNC", "PanelPC", "Rollback", null, "object");
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestService(
      "FUNC",
      "PanelPC",
      "RollbackSingle",
      propertyName,
      "object",
    );
  },
  commit: function () {
    return requestService("FUNC", "PanelPC", "Commit", null, "object");
  },
  get sound() {
    return requestService("PROP", "PanelPC", "get_Sound", "int32");
  },
  set sound(value) {
    requestServiceSetter("PROP", "PanelPC", "set_Sound", value);
  },
};
/**
 * Touchscreen
 * Dalle tactile
 */
Kiosk.PanelPC.Touchscreen = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("Touchscreen", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("Touchscreen", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestDevice(
      "PROP",
      "PanelPC",
      "Touchscreen",
      "get_category",
      "string",
    );
  },
  get group() {
    return requestDevice(
      "PROP",
      "PanelPC",
      "Touchscreen",
      "get_group",
      "string",
    );
  },
  get status() {
    return requestDevice(
      "PROP",
      "PanelPC",
      "Touchscreen",
      "get_status",
      "string",
    );
  },
  get statusDescription() {
    return requestDevice(
      "PROP",
      "PanelPC",
      "Touchscreen",
      "get_statusDescription",
      "string",
    );
  },
  get statusDetail() {
    return requestDevice(
      "PROP",
      "PanelPC",
      "Touchscreen",
      "get_statusDetail",
      "string",
    );
  },
  get state() {
    return requestDevice(
      "PROP",
      "PanelPC",
      "Touchscreen",
      "get_state",
      "string",
    );
  },
  get stateDescription() {
    return requestDevice(
      "PROP",
      "PanelPC",
      "Touchscreen",
      "get_stateDescription",
      "string",
    );
  },
  get stateDetail() {
    return requestDevice(
      "PROP",
      "PanelPC",
      "Touchscreen",
      "get_stateDetail",
      "string",
    );
  },
  get statusObject() {
    return requestDevice(
      "PROP",
      "PanelPC",
      "Touchscreen",
      "get_statusObject",
      "object",
    );
  },
  get testable() {
    return requestDevice(
      "PROP",
      "PanelPC",
      "Touchscreen",
      "get_testable",
      "boolean",
    );
  },
  allStatus: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Touchscreen",
      "allStatus",
      null,
      "object",
    );
  },
  init: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Touchscreen",
      "Init",
      null,
      "object",
    );
  },
  test: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Touchscreen",
      "test",
      null,
      "boolean",
    );
  },
  getLinkDocs: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Touchscreen",
      "GetLinkDocs",
      null,
      "object",
    );
  },
  reportStatus: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Touchscreen",
      "ReportStatus",
      null,
      "object",
    );
  },
  reportStartStatus: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Touchscreen",
      "ReportStartStatus",
      null,
      "object",
    );
  },
  getLinks: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Touchscreen",
      "GetLinks",
      null,
      "object",
    );
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Touchscreen",
      "NotifySessionType",
      sessionType,
      "object",
    );
  },
  saveToJson: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Touchscreen",
      "SaveToJson",
      null,
      "object",
    );
  },
  startTransaction: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Touchscreen",
      "StartTransaction",
      null,
      "object",
    );
  },
  rollback: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Touchscreen",
      "Rollback",
      null,
      "object",
    );
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Touchscreen",
      "RollbackSingle",
      propertyName,
      "object",
    );
  },
  commit: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Touchscreen",
      "Commit",
      null,
      "object",
    );
  },
  /**
   *
   * @param {ResetDTO} reset -
   */
  reset: function (reset) {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Touchscreen",
      "reset",
      reset,
      "boolean",
    );
  },
  updateStatus: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Touchscreen",
      "updateStatus",
      null,
      "boolean",
    );
  },
  install: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Touchscreen",
      "install",
      null,
      "boolean",
    );
  },
  updateFirmware: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Touchscreen",
      "UpdateFirmware",
      null,
      "boolean",
    );
  },
};
Kiosk.PanelPC.Audio = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("Audio", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("Audio", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestDevice("PROP", "PanelPC", "Audio", "get_category", "string");
  },
  get group() {
    return requestDevice("PROP", "PanelPC", "Audio", "get_group", "string");
  },
  get status() {
    return requestDevice("PROP", "PanelPC", "Audio", "get_status", "string");
  },
  get statusDescription() {
    return requestDevice(
      "PROP",
      "PanelPC",
      "Audio",
      "get_statusDescription",
      "string",
    );
  },
  get statusDetail() {
    return requestDevice(
      "PROP",
      "PanelPC",
      "Audio",
      "get_statusDetail",
      "string",
    );
  },
  get state() {
    return requestDevice("PROP", "PanelPC", "Audio", "get_state", "string");
  },
  get stateDescription() {
    return requestDevice(
      "PROP",
      "PanelPC",
      "Audio",
      "get_stateDescription",
      "string",
    );
  },
  get stateDetail() {
    return requestDevice(
      "PROP",
      "PanelPC",
      "Audio",
      "get_stateDetail",
      "string",
    );
  },
  get statusObject() {
    return requestDevice(
      "PROP",
      "PanelPC",
      "Audio",
      "get_statusObject",
      "object",
    );
  },
  get testable() {
    return requestDevice("PROP", "PanelPC", "Audio", "get_testable", "boolean");
  },
  allStatus: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Audio",
      "allStatus",
      null,
      "object",
    );
  },
  init: function () {
    return requestDevice("FUNC", "PanelPC", "Audio", "Init", null, "object");
  },
  test: function () {
    return requestDevice("FUNC", "PanelPC", "Audio", "test", null, "boolean");
  },
  getLinkDocs: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Audio",
      "GetLinkDocs",
      null,
      "object",
    );
  },
  reportStatus: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Audio",
      "ReportStatus",
      null,
      "object",
    );
  },
  reportStartStatus: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Audio",
      "ReportStartStatus",
      null,
      "object",
    );
  },
  getLinks: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Audio",
      "GetLinks",
      null,
      "object",
    );
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Audio",
      "NotifySessionType",
      sessionType,
      "object",
    );
  },
  saveToJson: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Audio",
      "SaveToJson",
      null,
      "object",
    );
  },
  startTransaction: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Audio",
      "StartTransaction",
      null,
      "object",
    );
  },
  rollback: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Audio",
      "Rollback",
      null,
      "object",
    );
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Audio",
      "RollbackSingle",
      propertyName,
      "object",
    );
  },
  commit: function () {
    return requestDevice("FUNC", "PanelPC", "Audio", "Commit", null, "object");
  },
  /**
   *
   * @param {ResetDTO} reset -
   */
  reset: function (reset) {
    return requestDevice("FUNC", "PanelPC", "Audio", "reset", reset, "boolean");
  },
  updateStatus: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Audio",
      "updateStatus",
      null,
      "boolean",
    );
  },
  install: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Audio",
      "install",
      null,
      "boolean",
    );
  },
  updateFirmware: function () {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Audio",
      "UpdateFirmware",
      null,
      "boolean",
    );
  },
  /**
   *
   * @param {FloatDTO} level -
   */
  setSound: function (level) {
    return requestDevice(
      "FUNC",
      "PanelPC",
      "Audio",
      "SetSound",
      level,
      "boolean",
    );
  },
};
Kiosk.Dashkiosk = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("Dashkiosk", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("Dashkiosk", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestService("PROP", "Dashkiosk", "get_category", "string");
  },
  get group() {
    return requestService("PROP", "Dashkiosk", "get_group", "string");
  },
  get status() {
    return requestService("PROP", "Dashkiosk", "get_status", "string");
  },
  get statusDescription() {
    return requestService(
      "PROP",
      "Dashkiosk",
      "get_statusDescription",
      "string",
    );
  },
  get statusDetail() {
    return requestService("PROP", "Dashkiosk", "get_statusDetail", "string");
  },
  get state() {
    return requestService("PROP", "Dashkiosk", "get_state", "string");
  },
  get stateDescription() {
    return requestService(
      "PROP",
      "Dashkiosk",
      "get_stateDescription",
      "string",
    );
  },
  get stateDetail() {
    return requestService("PROP", "Dashkiosk", "get_stateDetail", "string");
  },
  get statusObject() {
    return requestService("PROP", "Dashkiosk", "get_statusObject", "object");
  },
  get realTimeStatus() {
    return requestService("PROP", "Dashkiosk", "get_RealTimeStatus", "boolean");
  },
  get eventsDistribution() {
    return requestService(
      "PROP",
      "Dashkiosk",
      "get_EventsDistribution",
      "string",
    );
  },
  get erpRef() {
    return requestService("PROP", "Dashkiosk", "get_ErpRef", "string");
  },
  get erpName() {
    return requestService("PROP", "Dashkiosk", "get_ErpName", "string");
  },
  get erpDescription() {
    return requestService("PROP", "Dashkiosk", "get_ErpDescription", "string");
  },
  get description() {
    return requestService("PROP", "Dashkiosk", "get_description", "string");
  },
  set description(value) {
    requestServiceSetter("PROP", "Dashkiosk", "set_description", value);
  },
  get testable() {
    return requestService("PROP", "Dashkiosk", "get_testable", "boolean");
  },
  allStatus: function () {
    return requestService("FUNC", "Dashkiosk", "allStatus", null, "object");
  },
  init: function () {
    return requestService("FUNC", "Dashkiosk", "Init", null, "object");
  },
  test: function () {
    return requestService("FUNC", "Dashkiosk", "test", null, "boolean");
  },
  getLinkDocs: function () {
    return requestService("FUNC", "Dashkiosk", "GetLinkDocs", null, "object");
  },
  reportStatus: function () {
    return requestService("FUNC", "Dashkiosk", "ReportStatus", null, "object");
  },
  reportStartStatus: function () {
    return requestService(
      "FUNC",
      "Dashkiosk",
      "ReportStartStatus",
      null,
      "object",
    );
  },
  getLinks: function () {
    return requestService("FUNC", "Dashkiosk", "GetLinks", null, "object");
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestService(
      "FUNC",
      "Dashkiosk",
      "NotifySessionType",
      sessionType,
      "object",
    );
  },
  saveToJson: function () {
    return requestService("FUNC", "Dashkiosk", "SaveToJson", null, "object");
  },
  startTransaction: function () {
    return requestService(
      "FUNC",
      "Dashkiosk",
      "StartTransaction",
      null,
      "object",
    );
  },
  rollback: function () {
    return requestService("FUNC", "Dashkiosk", "Rollback", null, "object");
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestService(
      "FUNC",
      "Dashkiosk",
      "RollbackSingle",
      propertyName,
      "object",
    );
  },
  commit: function () {
    return requestService("FUNC", "Dashkiosk", "Commit", null, "object");
  },
  get devicesStatus() {
    return requestService("PROP", "Dashkiosk", "get_DevicesStatus", "object");
  },
  get server() {
    return requestService("PROP", "Dashkiosk", "get_server", "string");
  },
  get serverMethod() {
    return requestService("PROP", "Dashkiosk", "get_serverMethod", "string");
  },
  /**
   *
   * @param {String} zipName -
   */
  copy: function (zipName) {
    return requestService("FUNC", "Dashkiosk", "copy", zipName, "object");
  },
  /**
   *
   * @param {String} zipName -
   */
  install: function (zipName) {
    return requestService("FUNC", "Dashkiosk", "install", zipName, "object");
  },
  updateList: function () {
    return requestService("FUNC", "Dashkiosk", "UpdateList", null, "object");
  },
  getInstallStory: function () {
    return requestService(
      "FUNC",
      "Dashkiosk",
      "GetInstallStory",
      null,
      "object",
    );
  },
  searchUsbInstall: function () {
    return requestService(
      "FUNC",
      "Dashkiosk",
      "SearchUsbInstall",
      null,
      "object",
    );
  },
};
/**
 * Network
 * Service de gestion des réseaux
 */
Kiosk.Network = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("Network", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("Network", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestService("PROP", "Network", "get_category", "string");
  },
  get group() {
    return requestService("PROP", "Network", "get_group", "string");
  },
  get status() {
    return requestService("PROP", "Network", "get_status", "string");
  },
  get statusDescription() {
    return requestService("PROP", "Network", "get_statusDescription", "string");
  },
  get statusDetail() {
    return requestService("PROP", "Network", "get_statusDetail", "string");
  },
  get state() {
    return requestService("PROP", "Network", "get_state", "string");
  },
  get stateDescription() {
    return requestService("PROP", "Network", "get_stateDescription", "string");
  },
  get stateDetail() {
    return requestService("PROP", "Network", "get_stateDetail", "string");
  },
  get statusObject() {
    return requestService("PROP", "Network", "get_statusObject", "object");
  },
  get testable() {
    return requestService("PROP", "Network", "get_testable", "boolean");
  },
  allStatus: function () {
    return requestService("FUNC", "Network", "allStatus", null, "object");
  },
  init: function () {
    return requestService("FUNC", "Network", "Init", null, "object");
  },
  test: function () {
    return requestService("FUNC", "Network", "test", null, "boolean");
  },
  getLinkDocs: function () {
    return requestService("FUNC", "Network", "GetLinkDocs", null, "object");
  },
  reportStatus: function () {
    return requestService("FUNC", "Network", "ReportStatus", null, "object");
  },
  reportStartStatus: function () {
    return requestService(
      "FUNC",
      "Network",
      "ReportStartStatus",
      null,
      "object",
    );
  },
  getLinks: function () {
    return requestService("FUNC", "Network", "GetLinks", null, "object");
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestService(
      "FUNC",
      "Network",
      "NotifySessionType",
      sessionType,
      "object",
    );
  },
  saveToJson: function () {
    return requestService("FUNC", "Network", "SaveToJson", null, "object");
  },
  startTransaction: function () {
    return requestService(
      "FUNC",
      "Network",
      "StartTransaction",
      null,
      "object",
    );
  },
  rollback: function () {
    return requestService("FUNC", "Network", "Rollback", null, "object");
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestService(
      "FUNC",
      "Network",
      "RollbackSingle",
      propertyName,
      "object",
    );
  },
  commit: function () {
    return requestService("FUNC", "Network", "Commit", null, "object");
  },
  getAllNetworkInterfaces: function () {
    return requestService(
      "FUNC",
      "Network",
      "GetAllNetworkInterfaces",
      null,
      "object",
    );
  },
  getNames: function () {
    return requestService("FUNC", "Network", "GetNames", null, "object");
  },
  /**
   *
   * @param {NameDTO} name -
   */
  getNetwork: function (name) {
    return requestService("FUNC", "Network", "GetNetwork", name, "object");
  },
  /**
   *
   * @param {String} hostToResolve -
   */
  testDns: function (hostToResolve) {
    return requestService(
      "FUNC",
      "Network",
      "TestDns",
      hostToResolve,
      "boolean",
    );
  },
  /**
   *
   * @param {String} addr -
   */
  ping: function (addr) {
    return requestService("FUNC", "Network", "Ping", addr, "boolean");
  },
};
Kiosk.Network.Ethernet_31 = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("Ethernet_31", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("Ethernet_31", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestDevice(
      "PROP",
      "Network",
      "Ethernet_31",
      "get_category",
      "string",
    );
  },
  get group() {
    return requestDevice(
      "PROP",
      "Network",
      "Ethernet_31",
      "get_group",
      "string",
    );
  },
  get status() {
    return requestDevice(
      "PROP",
      "Network",
      "Ethernet_31",
      "get_status",
      "string",
    );
  },
  get statusDescription() {
    return requestDevice(
      "PROP",
      "Network",
      "Ethernet_31",
      "get_statusDescription",
      "string",
    );
  },
  get statusDetail() {
    return requestDevice(
      "PROP",
      "Network",
      "Ethernet_31",
      "get_statusDetail",
      "string",
    );
  },
  get state() {
    return requestDevice(
      "PROP",
      "Network",
      "Ethernet_31",
      "get_state",
      "string",
    );
  },
  get stateDescription() {
    return requestDevice(
      "PROP",
      "Network",
      "Ethernet_31",
      "get_stateDescription",
      "string",
    );
  },
  get stateDetail() {
    return requestDevice(
      "PROP",
      "Network",
      "Ethernet_31",
      "get_stateDetail",
      "string",
    );
  },
  get statusObject() {
    return requestDevice(
      "PROP",
      "Network",
      "Ethernet_31",
      "get_statusObject",
      "object",
    );
  },
  get testable() {
    return requestDevice(
      "PROP",
      "Network",
      "Ethernet_31",
      "get_testable",
      "boolean",
    );
  },
  allStatus: function () {
    return requestDevice(
      "FUNC",
      "Network",
      "Ethernet_31",
      "allStatus",
      null,
      "object",
    );
  },
  init: function () {
    return requestDevice(
      "FUNC",
      "Network",
      "Ethernet_31",
      "Init",
      null,
      "object",
    );
  },
  test: function () {
    return requestDevice(
      "FUNC",
      "Network",
      "Ethernet_31",
      "test",
      null,
      "boolean",
    );
  },
  getLinkDocs: function () {
    return requestDevice(
      "FUNC",
      "Network",
      "Ethernet_31",
      "GetLinkDocs",
      null,
      "object",
    );
  },
  reportStatus: function () {
    return requestDevice(
      "FUNC",
      "Network",
      "Ethernet_31",
      "ReportStatus",
      null,
      "object",
    );
  },
  reportStartStatus: function () {
    return requestDevice(
      "FUNC",
      "Network",
      "Ethernet_31",
      "ReportStartStatus",
      null,
      "object",
    );
  },
  getLinks: function () {
    return requestDevice(
      "FUNC",
      "Network",
      "Ethernet_31",
      "GetLinks",
      null,
      "object",
    );
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestDevice(
      "FUNC",
      "Network",
      "Ethernet_31",
      "NotifySessionType",
      sessionType,
      "object",
    );
  },
  saveToJson: function () {
    return requestDevice(
      "FUNC",
      "Network",
      "Ethernet_31",
      "SaveToJson",
      null,
      "object",
    );
  },
  startTransaction: function () {
    return requestDevice(
      "FUNC",
      "Network",
      "Ethernet_31",
      "StartTransaction",
      null,
      "object",
    );
  },
  rollback: function () {
    return requestDevice(
      "FUNC",
      "Network",
      "Ethernet_31",
      "Rollback",
      null,
      "object",
    );
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestDevice(
      "FUNC",
      "Network",
      "Ethernet_31",
      "RollbackSingle",
      propertyName,
      "object",
    );
  },
  commit: function () {
    return requestDevice(
      "FUNC",
      "Network",
      "Ethernet_31",
      "Commit",
      null,
      "object",
    );
  },
  /**
   *
   * @param {ResetDTO} reset -
   */
  reset: function (reset) {
    return requestDevice(
      "FUNC",
      "Network",
      "Ethernet_31",
      "reset",
      reset,
      "boolean",
    );
  },
  updateStatus: function () {
    return requestDevice(
      "FUNC",
      "Network",
      "Ethernet_31",
      "updateStatus",
      null,
      "boolean",
    );
  },
  install: function () {
    return requestDevice(
      "FUNC",
      "Network",
      "Ethernet_31",
      "install",
      null,
      "boolean",
    );
  },
  updateFirmware: function () {
    return requestDevice(
      "FUNC",
      "Network",
      "Ethernet_31",
      "UpdateFirmware",
      null,
      "boolean",
    );
  },
  get dHCP() {
    return requestDevice(
      "PROP",
      "Network",
      "Ethernet_31",
      "get_DHCP",
      "boolean",
    );
  },
  get defaultIPGateway() {
    return requestDevice(
      "PROP",
      "Network",
      "Ethernet_31",
      "get_DefaultIPGateway",
      "string",
    );
  },
  set defaultIPGateway(value) {
    requestDeviceSetter(
      "PROP",
      "Network",
      "Ethernet_31",
      "set_DefaultIPGateway",
      value,
    );
  },
  get dns() {
    return requestDevice("PROP", "Network", "Ethernet_31", "get_Dns", "string");
  },
  set dns(value) {
    requestDeviceSetter("PROP", "Network", "Ethernet_31", "set_Dns", value);
  },
  get iPAddress() {
    return requestDevice(
      "PROP",
      "Network",
      "Ethernet_31",
      "get_IPAddress",
      "string",
    );
  },
  set iPAddress(value) {
    requestDeviceSetter(
      "PROP",
      "Network",
      "Ethernet_31",
      "set_IPAddress",
      value,
    );
  },
  get subnetMask() {
    return requestDevice(
      "PROP",
      "Network",
      "Ethernet_31",
      "get_SubnetMask",
      "string",
    );
  },
  set subnetMask(value) {
    requestDeviceSetter(
      "PROP",
      "Network",
      "Ethernet_31",
      "set_SubnetMask",
      value,
    );
  },
  get mACAddress() {
    return requestDevice(
      "PROP",
      "Network",
      "Ethernet_31",
      "get_MACAddress",
      "string",
    );
  },
  get interfaceName() {
    return requestDevice(
      "PROP",
      "Network",
      "Ethernet_31",
      "get_InterfaceName",
      "string",
    );
  },
  get networkType() {
    return requestDevice(
      "PROP",
      "Network",
      "Ethernet_31",
      "get_NetworkType",
      "string",
    );
  },
  enableStatic: function () {
    return requestDevice(
      "FUNC",
      "Network",
      "Ethernet_31",
      "EnableStatic",
      null,
      "boolean",
    );
  },
  enableDHCP: function () {
    return requestDevice(
      "FUNC",
      "Network",
      "Ethernet_31",
      "EnableDHCP",
      null,
      "boolean",
    );
  },
};
/**
 * OnscreenKbd
 * Service de clavier virtuel
 */
Kiosk.OnscreenKbd = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("OnscreenKbd", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("OnscreenKbd", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestService("PROP", "OnscreenKbd", "get_category", "string");
  },
  get group() {
    return requestService("PROP", "OnscreenKbd", "get_group", "string");
  },
  get status() {
    return requestService("PROP", "OnscreenKbd", "get_status", "string");
  },
  get statusDescription() {
    return requestService(
      "PROP",
      "OnscreenKbd",
      "get_statusDescription",
      "string",
    );
  },
  get statusDetail() {
    return requestService("PROP", "OnscreenKbd", "get_statusDetail", "string");
  },
  get state() {
    return requestService("PROP", "OnscreenKbd", "get_state", "string");
  },
  get stateDescription() {
    return requestService(
      "PROP",
      "OnscreenKbd",
      "get_stateDescription",
      "string",
    );
  },
  get stateDetail() {
    return requestService("PROP", "OnscreenKbd", "get_stateDetail", "string");
  },
  get statusObject() {
    return requestService("PROP", "OnscreenKbd", "get_statusObject", "object");
  },
  get testable() {
    return requestService("PROP", "OnscreenKbd", "get_testable", "boolean");
  },
  allStatus: function () {
    return requestService("FUNC", "OnscreenKbd", "allStatus", null, "object");
  },
  init: function () {
    return requestService("FUNC", "OnscreenKbd", "Init", null, "object");
  },
  test: function () {
    return requestService("FUNC", "OnscreenKbd", "test", null, "boolean");
  },
  getLinkDocs: function () {
    return requestService("FUNC", "OnscreenKbd", "GetLinkDocs", null, "object");
  },
  reportStatus: function () {
    return requestService(
      "FUNC",
      "OnscreenKbd",
      "ReportStatus",
      null,
      "object",
    );
  },
  reportStartStatus: function () {
    return requestService(
      "FUNC",
      "OnscreenKbd",
      "ReportStartStatus",
      null,
      "object",
    );
  },
  getLinks: function () {
    return requestService("FUNC", "OnscreenKbd", "GetLinks", null, "object");
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestService(
      "FUNC",
      "OnscreenKbd",
      "NotifySessionType",
      sessionType,
      "object",
    );
  },
  saveToJson: function () {
    return requestService("FUNC", "OnscreenKbd", "SaveToJson", null, "object");
  },
  startTransaction: function () {
    return requestService(
      "FUNC",
      "OnscreenKbd",
      "StartTransaction",
      null,
      "object",
    );
  },
  rollback: function () {
    return requestService("FUNC", "OnscreenKbd", "Rollback", null, "object");
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestService(
      "FUNC",
      "OnscreenKbd",
      "RollbackSingle",
      propertyName,
      "object",
    );
  },
  commit: function () {
    return requestService("FUNC", "OnscreenKbd", "Commit", null, "object");
  },
  get autoShow() {
    return requestService("PROP", "OnscreenKbd", "get_autoShow", "boolean");
  },
  set autoShow(value) {
    requestServiceSetter("PROP", "OnscreenKbd", "set_autoShow", value);
  },
  /**
   *
   * @param {String} layout -
   */
  show: function (layout) {
    return requestService("FUNC", "OnscreenKbd", "Show", layout, "object");
  },
  hide: function () {
    return requestService("FUNC", "OnscreenKbd", "Hide", null, "object");
  },
};
/**
 * Session
 * Service de gestion de sessions utilisateurs
 */
Kiosk.Session = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("Session", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("Session", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestService("PROP", "Session", "get_category", "string");
  },
  get group() {
    return requestService("PROP", "Session", "get_group", "string");
  },
  get status() {
    return requestService("PROP", "Session", "get_status", "string");
  },
  get statusDescription() {
    return requestService("PROP", "Session", "get_statusDescription", "string");
  },
  get statusDetail() {
    return requestService("PROP", "Session", "get_statusDetail", "string");
  },
  get state() {
    return requestService("PROP", "Session", "get_state", "string");
  },
  get stateDescription() {
    return requestService("PROP", "Session", "get_stateDescription", "string");
  },
  get stateDetail() {
    return requestService("PROP", "Session", "get_stateDetail", "string");
  },
  get statusObject() {
    return requestService("PROP", "Session", "get_statusObject", "object");
  },
  get testable() {
    return requestService("PROP", "Session", "get_testable", "boolean");
  },
  allStatus: function () {
    return requestService("FUNC", "Session", "allStatus", null, "object");
  },
  init: function () {
    return requestService("FUNC", "Session", "Init", null, "object");
  },
  test: function () {
    return requestService("FUNC", "Session", "test", null, "boolean");
  },
  getLinkDocs: function () {
    return requestService("FUNC", "Session", "GetLinkDocs", null, "object");
  },
  reportStatus: function () {
    return requestService("FUNC", "Session", "ReportStatus", null, "object");
  },
  reportStartStatus: function () {
    return requestService(
      "FUNC",
      "Session",
      "ReportStartStatus",
      null,
      "object",
    );
  },
  getLinks: function () {
    return requestService("FUNC", "Session", "GetLinks", null, "object");
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestService(
      "FUNC",
      "Session",
      "NotifySessionType",
      sessionType,
      "object",
    );
  },
  saveToJson: function () {
    return requestService("FUNC", "Session", "SaveToJson", null, "object");
  },
  startTransaction: function () {
    return requestService(
      "FUNC",
      "Session",
      "StartTransaction",
      null,
      "object",
    );
  },
  rollback: function () {
    return requestService("FUNC", "Session", "Rollback", null, "object");
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestService(
      "FUNC",
      "Session",
      "RollbackSingle",
      propertyName,
      "object",
    );
  },
  commit: function () {
    return requestService("FUNC", "Session", "Commit", null, "object");
  },
  get hasUser() {
    return requestService("PROP", "Session", "get_hasUser", "boolean");
  },
  get firstTimeOutWithUser() {
    return requestService(
      "PROP",
      "Session",
      "get_FirstTimeOutWithUser",
      "int32",
    );
  },
  set firstTimeOutWithUser(value) {
    requestServiceSetter("PROP", "Session", "set_FirstTimeOutWithUser", value);
  },
  /**
   *
   * @param {InformationDTO} reason -
   */
  open: function (reason) {
    return requestService("FUNC", "Session", "Open", reason, "object");
  },
  /**
   *
   * @param {InformationDTO} reason -
   */
  close: function (reason) {
    return requestService("FUNC", "Session", "Close", reason, "object");
  },
  restartInactivityTimer: function () {
    return requestService(
      "FUNC",
      "Session",
      "RestartInactivityTimer",
      null,
      "object",
    );
  },
  stopInactivityTimer: function () {
    return requestService(
      "FUNC",
      "Session",
      "StopInactivityTimer",
      null,
      "object",
    );
  },
};
/**
 * Signaling
 * Service de gestion des entrées/sorties simulé
 */
Kiosk.Signaling = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("Signaling", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("Signaling", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestService("PROP", "Signaling", "get_category", "string");
  },
  get group() {
    return requestService("PROP", "Signaling", "get_group", "string");
  },
  get status() {
    return requestService("PROP", "Signaling", "get_status", "string");
  },
  get statusDescription() {
    return requestService(
      "PROP",
      "Signaling",
      "get_statusDescription",
      "string",
    );
  },
  get statusDetail() {
    return requestService("PROP", "Signaling", "get_statusDetail", "string");
  },
  get state() {
    return requestService("PROP", "Signaling", "get_state", "string");
  },
  get stateDescription() {
    return requestService(
      "PROP",
      "Signaling",
      "get_stateDescription",
      "string",
    );
  },
  get stateDetail() {
    return requestService("PROP", "Signaling", "get_stateDetail", "string");
  },
  get statusObject() {
    return requestService("PROP", "Signaling", "get_statusObject", "object");
  },
  get testable() {
    return requestService("PROP", "Signaling", "get_testable", "boolean");
  },
  allStatus: function () {
    return requestService("FUNC", "Signaling", "allStatus", null, "object");
  },
  init: function () {
    return requestService("FUNC", "Signaling", "Init", null, "object");
  },
  test: function () {
    return requestService("FUNC", "Signaling", "test", null, "boolean");
  },
  getLinkDocs: function () {
    return requestService("FUNC", "Signaling", "GetLinkDocs", null, "object");
  },
  reportStatus: function () {
    return requestService("FUNC", "Signaling", "ReportStatus", null, "object");
  },
  reportStartStatus: function () {
    return requestService(
      "FUNC",
      "Signaling",
      "ReportStartStatus",
      null,
      "object",
    );
  },
  getLinks: function () {
    return requestService("FUNC", "Signaling", "GetLinks", null, "object");
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestService(
      "FUNC",
      "Signaling",
      "NotifySessionType",
      sessionType,
      "object",
    );
  },
  saveToJson: function () {
    return requestService("FUNC", "Signaling", "SaveToJson", null, "object");
  },
  startTransaction: function () {
    return requestService(
      "FUNC",
      "Signaling",
      "StartTransaction",
      null,
      "object",
    );
  },
  rollback: function () {
    return requestService("FUNC", "Signaling", "Rollback", null, "object");
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestService(
      "FUNC",
      "Signaling",
      "RollbackSingle",
      propertyName,
      "object",
    );
  },
  commit: function () {
    return requestService("FUNC", "Signaling", "Commit", null, "object");
  },
  /**
   * Recense l'ensemble des entrées adressables
   */
  get inputsList() {
    return requestService("PROP", "Signaling", "get_inputsList", "object");
  },
  /**
   * Recense l'ensemble des sorties adressables
   */
  get outputsList() {
    return requestService("PROP", "Signaling", "get_outputsList", "object");
  },
  /**
   * Recense l'ensemble des Leds adressables
   */
  get ledsList() {
    return requestService("PROP", "Signaling", "get_ledsList", "object");
  },
  /**
   * Lecture d'une entrée binaire
   * @param {String} name - Nom de l'entrée
   */
  getInput: function (name) {
    return requestService("FUNC", "Signaling", "getInput", name, "string");
  },
  /**
   * Lecture d'une sortie
   * @param {String} name - Nom de la sortie
   */
  getOutput: function (name) {
    return requestService("FUNC", "Signaling", "getOutput", name, "string");
  },
  /**
   * Lecture de la valeur de la LED
   * @param {String} name - nom du composant Led à évaluer
   */
  getLed: function (name) {
    return requestService("FUNC", "Signaling", "getLed", name, "string");
  },
  /**
   * Positionnement d'une sortie
   * @param {SetOutputArgsDTO} output - Nom de la sortie
   */
  setOutput: function (output) {
    return requestService("FUNC", "Signaling", "setOutput", output, "object");
  },
  /**
   * Positionne une led à une couleur donnée
   * @param {LedValueDTO} value -
   */
  setLed: function (value) {
    return requestService("FUNC", "Signaling", "setLed", value, "object");
  },
};
/**
 * ReceiptPrinting
 * Définition des services d'impression
 * Service d'impression de reçus simulé 60
 */
Kiosk.ReceiptPrinting = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("ReceiptPrinting", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("ReceiptPrinting", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestService("PROP", "ReceiptPrinting", "get_category", "string");
  },
  get group() {
    return requestService("PROP", "ReceiptPrinting", "get_group", "string");
  },
  get status() {
    return requestService("PROP", "ReceiptPrinting", "get_status", "string");
  },
  get statusDescription() {
    return requestService(
      "PROP",
      "ReceiptPrinting",
      "get_statusDescription",
      "string",
    );
  },
  get statusDetail() {
    return requestService(
      "PROP",
      "ReceiptPrinting",
      "get_statusDetail",
      "string",
    );
  },
  get state() {
    return requestService("PROP", "ReceiptPrinting", "get_state", "string");
  },
  get stateDescription() {
    return requestService(
      "PROP",
      "ReceiptPrinting",
      "get_stateDescription",
      "string",
    );
  },
  get stateDetail() {
    return requestService(
      "PROP",
      "ReceiptPrinting",
      "get_stateDetail",
      "string",
    );
  },
  get statusObject() {
    return requestService(
      "PROP",
      "ReceiptPrinting",
      "get_statusObject",
      "object",
    );
  },
  get testable() {
    return requestService("PROP", "ReceiptPrinting", "get_testable", "boolean");
  },
  allStatus: function () {
    return requestService(
      "FUNC",
      "ReceiptPrinting",
      "allStatus",
      null,
      "object",
    );
  },
  init: function () {
    return requestService("FUNC", "ReceiptPrinting", "Init", null, "object");
  },
  test: function () {
    return requestService("FUNC", "ReceiptPrinting", "test", null, "boolean");
  },
  getLinkDocs: function () {
    return requestService(
      "FUNC",
      "ReceiptPrinting",
      "GetLinkDocs",
      null,
      "object",
    );
  },
  reportStatus: function () {
    return requestService(
      "FUNC",
      "ReceiptPrinting",
      "ReportStatus",
      null,
      "object",
    );
  },
  reportStartStatus: function () {
    return requestService(
      "FUNC",
      "ReceiptPrinting",
      "ReportStartStatus",
      null,
      "object",
    );
  },
  getLinks: function () {
    return requestService(
      "FUNC",
      "ReceiptPrinting",
      "GetLinks",
      null,
      "object",
    );
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestService(
      "FUNC",
      "ReceiptPrinting",
      "NotifySessionType",
      sessionType,
      "object",
    );
  },
  saveToJson: function () {
    return requestService(
      "FUNC",
      "ReceiptPrinting",
      "SaveToJson",
      null,
      "object",
    );
  },
  startTransaction: function () {
    return requestService(
      "FUNC",
      "ReceiptPrinting",
      "StartTransaction",
      null,
      "object",
    );
  },
  rollback: function () {
    return requestService(
      "FUNC",
      "ReceiptPrinting",
      "Rollback",
      null,
      "object",
    );
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestService(
      "FUNC",
      "ReceiptPrinting",
      "RollbackSingle",
      propertyName,
      "object",
    );
  },
  commit: function () {
    return requestService("FUNC", "ReceiptPrinting", "Commit", null, "object");
  },
  /**
   * Imprime un document pdf
   * @param {PrintRawPdfArgs} rawDTO - Paramètre d'impression
   */
  printRawPdf: function (rawDTO) {
    return requestService(
      "FUNC",
      "ReceiptPrinting",
      "printRawPdf",
      rawDTO,
      "object",
    );
  },
  /**
   * Imprime un document html
   * @param {PrintRawHtmlArgs} rawDTO - Paramètre d'impression
   */
  printRawHtml: function (rawDTO) {
    return requestService(
      "FUNC",
      "ReceiptPrinting",
      "printRawHtml",
      rawDTO,
      "object",
    );
  },
  /**
   * Annule tous les jobs présents dans la file d'attente des imprimantes associées au service.
   */
  cancelJobs: function () {
    return requestService(
      "FUNC",
      "ReceiptPrinting",
      "cancelJobs",
      null,
      "object",
    );
  },
  /**
   * Convertion html->pdf
   * @param {GeneratePdfargs} rawDTO - Données html à convertir
   */
  htmlToPdf: function (rawDTO) {
    return requestService(
      "FUNC",
      "ReceiptPrinting",
      "htmlToPdf",
      rawDTO,
      "string",
    );
  },
  get defaultWidth() {
    return requestService(
      "PROP",
      "ReceiptPrinting",
      "get_DefaultWidth",
      "int32",
    );
  },
};
/**
 * TicketPrinting
 * Définition des services d'impression
 * Service d'impression de ticket simulé
 */
Kiosk.TicketPrinting = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("TicketPrinting", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("TicketPrinting", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestService("PROP", "TicketPrinting", "get_category", "string");
  },
  get group() {
    return requestService("PROP", "TicketPrinting", "get_group", "string");
  },
  get status() {
    return requestService("PROP", "TicketPrinting", "get_status", "string");
  },
  get statusDescription() {
    return requestService(
      "PROP",
      "TicketPrinting",
      "get_statusDescription",
      "string",
    );
  },
  get statusDetail() {
    return requestService(
      "PROP",
      "TicketPrinting",
      "get_statusDetail",
      "string",
    );
  },
  get state() {
    return requestService("PROP", "TicketPrinting", "get_state", "string");
  },
  get stateDescription() {
    return requestService(
      "PROP",
      "TicketPrinting",
      "get_stateDescription",
      "string",
    );
  },
  get stateDetail() {
    return requestService(
      "PROP",
      "TicketPrinting",
      "get_stateDetail",
      "string",
    );
  },
  get statusObject() {
    return requestService(
      "PROP",
      "TicketPrinting",
      "get_statusObject",
      "object",
    );
  },
  get testable() {
    return requestService("PROP", "TicketPrinting", "get_testable", "boolean");
  },
  allStatus: function () {
    return requestService(
      "FUNC",
      "TicketPrinting",
      "allStatus",
      null,
      "object",
    );
  },
  init: function () {
    return requestService("FUNC", "TicketPrinting", "Init", null, "object");
  },
  test: function () {
    return requestService("FUNC", "TicketPrinting", "test", null, "boolean");
  },
  getLinkDocs: function () {
    return requestService(
      "FUNC",
      "TicketPrinting",
      "GetLinkDocs",
      null,
      "object",
    );
  },
  reportStatus: function () {
    return requestService(
      "FUNC",
      "TicketPrinting",
      "ReportStatus",
      null,
      "object",
    );
  },
  reportStartStatus: function () {
    return requestService(
      "FUNC",
      "TicketPrinting",
      "ReportStartStatus",
      null,
      "object",
    );
  },
  getLinks: function () {
    return requestService("FUNC", "TicketPrinting", "GetLinks", null, "object");
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestService(
      "FUNC",
      "TicketPrinting",
      "NotifySessionType",
      sessionType,
      "object",
    );
  },
  saveToJson: function () {
    return requestService(
      "FUNC",
      "TicketPrinting",
      "SaveToJson",
      null,
      "object",
    );
  },
  startTransaction: function () {
    return requestService(
      "FUNC",
      "TicketPrinting",
      "StartTransaction",
      null,
      "object",
    );
  },
  rollback: function () {
    return requestService("FUNC", "TicketPrinting", "Rollback", null, "object");
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestService(
      "FUNC",
      "TicketPrinting",
      "RollbackSingle",
      propertyName,
      "object",
    );
  },
  commit: function () {
    return requestService("FUNC", "TicketPrinting", "Commit", null, "object");
  },
  /**
   * Imprime un document pdf
   * @param {PrintRawPdfArgs} rawDTO - Paramètre d'impression
   */
  printRawPdf: function (rawDTO) {
    return requestService(
      "FUNC",
      "TicketPrinting",
      "printRawPdf",
      rawDTO,
      "object",
    );
  },
  /**
   * Imprime un document html
   * @param {PrintRawHtmlArgs} rawDTO - Paramètre d'impression
   */
  printRawHtml: function (rawDTO) {
    return requestService(
      "FUNC",
      "TicketPrinting",
      "printRawHtml",
      rawDTO,
      "object",
    );
  },
  /**
   * Annule tous les jobs présents dans la file d'attente des imprimantes associées au service.
   */
  cancelJobs: function () {
    return requestService(
      "FUNC",
      "TicketPrinting",
      "cancelJobs",
      null,
      "object",
    );
  },
  /**
   * Convertion html->pdf
   * @param {GeneratePdfargs} rawDTO - Données html à convertir
   */
  htmlToPdf: function (rawDTO) {
    return requestService(
      "FUNC",
      "TicketPrinting",
      "htmlToPdf",
      rawDTO,
      "string",
    );
  },
  /**
   * indique l'orientation de l'impression à réaliser
   */
  get orientation() {
    return requestService(
      "PROP",
      "TicketPrinting",
      "get_orientation",
      "string",
    );
  },
  /**
   * Lis les informations d'identifications du ticket RFID dans l'imprimante
   */
  readTicket: function () {
    return requestService(
      "FUNC",
      "TicketPrinting",
      "readTicket",
      null,
      "object",
    );
  },
};
/**
 * DocumentPrinting
 * Interface d'imrpession de document multi-bacs
 * Service d'impression de documents simulé A4
 */
Kiosk.DocumentPrinting = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("DocumentPrinting", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("DocumentPrinting", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestService("PROP", "DocumentPrinting", "get_category", "string");
  },
  get group() {
    return requestService("PROP", "DocumentPrinting", "get_group", "string");
  },
  get status() {
    return requestService("PROP", "DocumentPrinting", "get_status", "string");
  },
  get statusDescription() {
    return requestService(
      "PROP",
      "DocumentPrinting",
      "get_statusDescription",
      "string",
    );
  },
  get statusDetail() {
    return requestService(
      "PROP",
      "DocumentPrinting",
      "get_statusDetail",
      "string",
    );
  },
  get state() {
    return requestService("PROP", "DocumentPrinting", "get_state", "string");
  },
  get stateDescription() {
    return requestService(
      "PROP",
      "DocumentPrinting",
      "get_stateDescription",
      "string",
    );
  },
  get stateDetail() {
    return requestService(
      "PROP",
      "DocumentPrinting",
      "get_stateDetail",
      "string",
    );
  },
  get statusObject() {
    return requestService(
      "PROP",
      "DocumentPrinting",
      "get_statusObject",
      "object",
    );
  },
  get testable() {
    return requestService(
      "PROP",
      "DocumentPrinting",
      "get_testable",
      "boolean",
    );
  },
  allStatus: function () {
    return requestService(
      "FUNC",
      "DocumentPrinting",
      "allStatus",
      null,
      "object",
    );
  },
  init: function () {
    return requestService("FUNC", "DocumentPrinting", "Init", null, "object");
  },
  test: function () {
    return requestService("FUNC", "DocumentPrinting", "test", null, "boolean");
  },
  getLinkDocs: function () {
    return requestService(
      "FUNC",
      "DocumentPrinting",
      "GetLinkDocs",
      null,
      "object",
    );
  },
  reportStatus: function () {
    return requestService(
      "FUNC",
      "DocumentPrinting",
      "ReportStatus",
      null,
      "object",
    );
  },
  reportStartStatus: function () {
    return requestService(
      "FUNC",
      "DocumentPrinting",
      "ReportStartStatus",
      null,
      "object",
    );
  },
  getLinks: function () {
    return requestService(
      "FUNC",
      "DocumentPrinting",
      "GetLinks",
      null,
      "object",
    );
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestService(
      "FUNC",
      "DocumentPrinting",
      "NotifySessionType",
      sessionType,
      "object",
    );
  },
  saveToJson: function () {
    return requestService(
      "FUNC",
      "DocumentPrinting",
      "SaveToJson",
      null,
      "object",
    );
  },
  startTransaction: function () {
    return requestService(
      "FUNC",
      "DocumentPrinting",
      "StartTransaction",
      null,
      "object",
    );
  },
  rollback: function () {
    return requestService(
      "FUNC",
      "DocumentPrinting",
      "Rollback",
      null,
      "object",
    );
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestService(
      "FUNC",
      "DocumentPrinting",
      "RollbackSingle",
      propertyName,
      "object",
    );
  },
  commit: function () {
    return requestService("FUNC", "DocumentPrinting", "Commit", null, "object");
  },
  /**
   * Active ou désactive le mode veille de l'imprimante
   */
  get sleepMode() {
    return requestService(
      "PROP",
      "DocumentPrinting",
      "get_sleepMode",
      "boolean",
    );
  },
  /**
   * Active ou désactive le mode veille de l'imprimante
   */
  set sleepMode(value) {
    requestServiceSetter("PROP", "DocumentPrinting", "set_sleepMode", value);
  },
  /**
   * Retourne la liste des sources possibles pour les différentes commandes
   */
  get sourcesList() {
    return requestService(
      "PROP",
      "DocumentPrinting",
      "get_sourcesList",
      "object",
    );
  },
  /**
   * Imprime un document pdf
   * @param {PrintRawPdfDocumentArgs} rawDTO - Paramètre d'impression
   */
  printRawPdf: function (rawDTO) {
    return requestService(
      "FUNC",
      "DocumentPrinting",
      "printRawPdf",
      rawDTO,
      "object",
    );
  },
  /**
   * Imprime un document html
   * @param {PrintRawHtmlDocumentArgs} rawDTO - Paramètre d'impression
   */
  printRawHtml: function (rawDTO) {
    return requestService(
      "FUNC",
      "DocumentPrinting",
      "printRawHtml",
      rawDTO,
      "object",
    );
  },
  /**
   * Annule tous les jobs présents dans la file d'attente des imprimantes associées au service.
   */
  cancelJobs: function () {
    return requestService(
      "FUNC",
      "DocumentPrinting",
      "cancelJobs",
      null,
      "object",
    );
  },
  /**
   * Convertion d'un fichier html vers pdf
   * @param {GeneratePdfargs} rawDTO -
   */
  htmlToPdf: function (rawDTO) {
    return requestService(
      "FUNC",
      "DocumentPrinting",
      "htmlToPdf",
      rawDTO,
      "string",
    );
  },
};
/**
 * CardDispensing
 * Service de distribution de cartes simulé
 */
Kiosk.CardDispensing = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("CardDispensing", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("CardDispensing", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestService("PROP", "CardDispensing", "get_category", "string");
  },
  get group() {
    return requestService("PROP", "CardDispensing", "get_group", "string");
  },
  get status() {
    return requestService("PROP", "CardDispensing", "get_status", "string");
  },
  get statusDescription() {
    return requestService(
      "PROP",
      "CardDispensing",
      "get_statusDescription",
      "string",
    );
  },
  get statusDetail() {
    return requestService(
      "PROP",
      "CardDispensing",
      "get_statusDetail",
      "string",
    );
  },
  get state() {
    return requestService("PROP", "CardDispensing", "get_state", "string");
  },
  get stateDescription() {
    return requestService(
      "PROP",
      "CardDispensing",
      "get_stateDescription",
      "string",
    );
  },
  get stateDetail() {
    return requestService(
      "PROP",
      "CardDispensing",
      "get_stateDetail",
      "string",
    );
  },
  get statusObject() {
    return requestService(
      "PROP",
      "CardDispensing",
      "get_statusObject",
      "object",
    );
  },
  get testable() {
    return requestService("PROP", "CardDispensing", "get_testable", "boolean");
  },
  allStatus: function () {
    return requestService(
      "FUNC",
      "CardDispensing",
      "allStatus",
      null,
      "object",
    );
  },
  init: function () {
    return requestService("FUNC", "CardDispensing", "Init", null, "object");
  },
  test: function () {
    return requestService("FUNC", "CardDispensing", "test", null, "boolean");
  },
  getLinkDocs: function () {
    return requestService(
      "FUNC",
      "CardDispensing",
      "GetLinkDocs",
      null,
      "object",
    );
  },
  reportStatus: function () {
    return requestService(
      "FUNC",
      "CardDispensing",
      "ReportStatus",
      null,
      "object",
    );
  },
  reportStartStatus: function () {
    return requestService(
      "FUNC",
      "CardDispensing",
      "ReportStartStatus",
      null,
      "object",
    );
  },
  getLinks: function () {
    return requestService("FUNC", "CardDispensing", "GetLinks", null, "object");
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestService(
      "FUNC",
      "CardDispensing",
      "NotifySessionType",
      sessionType,
      "object",
    );
  },
  saveToJson: function () {
    return requestService(
      "FUNC",
      "CardDispensing",
      "SaveToJson",
      null,
      "object",
    );
  },
  startTransaction: function () {
    return requestService(
      "FUNC",
      "CardDispensing",
      "StartTransaction",
      null,
      "object",
    );
  },
  rollback: function () {
    return requestService("FUNC", "CardDispensing", "Rollback", null, "object");
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestService(
      "FUNC",
      "CardDispensing",
      "RollbackSingle",
      propertyName,
      "object",
    );
  },
  commit: function () {
    return requestService("FUNC", "CardDispensing", "Commit", null, "object");
  },
  /**
   * Lis les informations d'identifications de la carte RFID prochainement distribué
   */
  readCard: function () {
    return requestService("FUNC", "CardDispensing", "readCard", null, "object");
  },
  /**
   * Envoies la carte en position de lecture auprès de l'utilisateur
   */
  dispenseCard: function () {
    return requestService(
      "FUNC",
      "CardDispensing",
      "dispenseCard",
      null,
      "object",
    );
  },
  /**
   * Envoies la carte en position de lecture dans la poubelle de cartes (carte défectueuse)
   */
  throwCard: function () {
    return requestService(
      "FUNC",
      "CardDispensing",
      "throwCard",
      null,
      "object",
    );
  },
};
/**
 * BarcodeReading
 * Service de lecture de codes barres simulé
 */
Kiosk.BarcodeReading = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("BarcodeReading", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("BarcodeReading", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestService("PROP", "BarcodeReading", "get_category", "string");
  },
  get group() {
    return requestService("PROP", "BarcodeReading", "get_group", "string");
  },
  get status() {
    return requestService("PROP", "BarcodeReading", "get_status", "string");
  },
  get statusDescription() {
    return requestService(
      "PROP",
      "BarcodeReading",
      "get_statusDescription",
      "string",
    );
  },
  get statusDetail() {
    return requestService(
      "PROP",
      "BarcodeReading",
      "get_statusDetail",
      "string",
    );
  },
  get state() {
    return requestService("PROP", "BarcodeReading", "get_state", "string");
  },
  get stateDescription() {
    return requestService(
      "PROP",
      "BarcodeReading",
      "get_stateDescription",
      "string",
    );
  },
  get stateDetail() {
    return requestService(
      "PROP",
      "BarcodeReading",
      "get_stateDetail",
      "string",
    );
  },
  get statusObject() {
    return requestService(
      "PROP",
      "BarcodeReading",
      "get_statusObject",
      "object",
    );
  },
  get testable() {
    return requestService("PROP", "BarcodeReading", "get_testable", "boolean");
  },
  allStatus: function () {
    return requestService(
      "FUNC",
      "BarcodeReading",
      "allStatus",
      null,
      "object",
    );
  },
  init: function () {
    return requestService("FUNC", "BarcodeReading", "Init", null, "object");
  },
  test: function () {
    return requestService("FUNC", "BarcodeReading", "test", null, "boolean");
  },
  getLinkDocs: function () {
    return requestService(
      "FUNC",
      "BarcodeReading",
      "GetLinkDocs",
      null,
      "object",
    );
  },
  reportStatus: function () {
    return requestService(
      "FUNC",
      "BarcodeReading",
      "ReportStatus",
      null,
      "object",
    );
  },
  reportStartStatus: function () {
    return requestService(
      "FUNC",
      "BarcodeReading",
      "ReportStartStatus",
      null,
      "object",
    );
  },
  getLinks: function () {
    return requestService("FUNC", "BarcodeReading", "GetLinks", null, "object");
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestService(
      "FUNC",
      "BarcodeReading",
      "NotifySessionType",
      sessionType,
      "object",
    );
  },
  saveToJson: function () {
    return requestService(
      "FUNC",
      "BarcodeReading",
      "SaveToJson",
      null,
      "object",
    );
  },
  startTransaction: function () {
    return requestService(
      "FUNC",
      "BarcodeReading",
      "StartTransaction",
      null,
      "object",
    );
  },
  rollback: function () {
    return requestService("FUNC", "BarcodeReading", "Rollback", null, "object");
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestService(
      "FUNC",
      "BarcodeReading",
      "RollbackSingle",
      propertyName,
      "object",
    );
  },
  commit: function () {
    return requestService("FUNC", "BarcodeReading", "Commit", null, "object");
  },
  /**
   * Demande de lecture de barcode en mode manuel
   */
  readBarcode: function () {
    return requestService(
      "FUNC",
      "BarcodeReading",
      "readBarcode",
      null,
      "object",
    );
  },
  /**
   * Demande d'arret de lecture de barcode en mode manuel
   */
  stopReadBarcode: function () {
    return requestService(
      "FUNC",
      "BarcodeReading",
      "stopReadBarcode",
      null,
      "object",
    );
  },
};
/**
 * ContactlessReading
 * Service d'identification sans contact
 * Service de lecture sans contact simulé
 */
Kiosk.ContactlessReading = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("ContactlessReading", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("ContactlessReading", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestService(
      "PROP",
      "ContactlessReading",
      "get_category",
      "string",
    );
  },
  get group() {
    return requestService("PROP", "ContactlessReading", "get_group", "string");
  },
  get status() {
    return requestService("PROP", "ContactlessReading", "get_status", "string");
  },
  get statusDescription() {
    return requestService(
      "PROP",
      "ContactlessReading",
      "get_statusDescription",
      "string",
    );
  },
  get statusDetail() {
    return requestService(
      "PROP",
      "ContactlessReading",
      "get_statusDetail",
      "string",
    );
  },
  get state() {
    return requestService("PROP", "ContactlessReading", "get_state", "string");
  },
  get stateDescription() {
    return requestService(
      "PROP",
      "ContactlessReading",
      "get_stateDescription",
      "string",
    );
  },
  get stateDetail() {
    return requestService(
      "PROP",
      "ContactlessReading",
      "get_stateDetail",
      "string",
    );
  },
  get statusObject() {
    return requestService(
      "PROP",
      "ContactlessReading",
      "get_statusObject",
      "object",
    );
  },
  get testable() {
    return requestService(
      "PROP",
      "ContactlessReading",
      "get_testable",
      "boolean",
    );
  },
  allStatus: function () {
    return requestService(
      "FUNC",
      "ContactlessReading",
      "allStatus",
      null,
      "object",
    );
  },
  init: function () {
    return requestService("FUNC", "ContactlessReading", "Init", null, "object");
  },
  test: function () {
    return requestService(
      "FUNC",
      "ContactlessReading",
      "test",
      null,
      "boolean",
    );
  },
  getLinkDocs: function () {
    return requestService(
      "FUNC",
      "ContactlessReading",
      "GetLinkDocs",
      null,
      "object",
    );
  },
  reportStatus: function () {
    return requestService(
      "FUNC",
      "ContactlessReading",
      "ReportStatus",
      null,
      "object",
    );
  },
  reportStartStatus: function () {
    return requestService(
      "FUNC",
      "ContactlessReading",
      "ReportStartStatus",
      null,
      "object",
    );
  },
  getLinks: function () {
    return requestService(
      "FUNC",
      "ContactlessReading",
      "GetLinks",
      null,
      "object",
    );
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestService(
      "FUNC",
      "ContactlessReading",
      "NotifySessionType",
      sessionType,
      "object",
    );
  },
  saveToJson: function () {
    return requestService(
      "FUNC",
      "ContactlessReading",
      "SaveToJson",
      null,
      "object",
    );
  },
  startTransaction: function () {
    return requestService(
      "FUNC",
      "ContactlessReading",
      "StartTransaction",
      null,
      "object",
    );
  },
  rollback: function () {
    return requestService(
      "FUNC",
      "ContactlessReading",
      "Rollback",
      null,
      "object",
    );
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestService(
      "FUNC",
      "ContactlessReading",
      "RollbackSingle",
      propertyName,
      "object",
    );
  },
  commit: function () {
    return requestService(
      "FUNC",
      "ContactlessReading",
      "Commit",
      null,
      "object",
    );
  },
};
/**
 * VitaleCardReading
 * Service de lecture de cartes Helio simulé
 */
Kiosk.VitaleCardReading = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("VitaleCardReading", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("VitaleCardReading", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestService(
      "PROP",
      "VitaleCardReading",
      "get_category",
      "string",
    );
  },
  get group() {
    return requestService("PROP", "VitaleCardReading", "get_group", "string");
  },
  get status() {
    return requestService("PROP", "VitaleCardReading", "get_status", "string");
  },
  get statusDescription() {
    return requestService(
      "PROP",
      "VitaleCardReading",
      "get_statusDescription",
      "string",
    );
  },
  get statusDetail() {
    return requestService(
      "PROP",
      "VitaleCardReading",
      "get_statusDetail",
      "string",
    );
  },
  get state() {
    return requestService("PROP", "VitaleCardReading", "get_state", "string");
  },
  get stateDescription() {
    return requestService(
      "PROP",
      "VitaleCardReading",
      "get_stateDescription",
      "string",
    );
  },
  get stateDetail() {
    return requestService(
      "PROP",
      "VitaleCardReading",
      "get_stateDetail",
      "string",
    );
  },
  get statusObject() {
    return requestService(
      "PROP",
      "VitaleCardReading",
      "get_statusObject",
      "object",
    );
  },
  get testable() {
    return requestService(
      "PROP",
      "VitaleCardReading",
      "get_testable",
      "boolean",
    );
  },
  allStatus: function () {
    return requestService(
      "FUNC",
      "VitaleCardReading",
      "allStatus",
      null,
      "object",
    );
  },
  init: function () {
    return requestService("FUNC", "VitaleCardReading", "Init", null, "object");
  },
  test: function () {
    return requestService("FUNC", "VitaleCardReading", "test", null, "boolean");
  },
  getLinkDocs: function () {
    return requestService(
      "FUNC",
      "VitaleCardReading",
      "GetLinkDocs",
      null,
      "object",
    );
  },
  reportStatus: function () {
    return requestService(
      "FUNC",
      "VitaleCardReading",
      "ReportStatus",
      null,
      "object",
    );
  },
  reportStartStatus: function () {
    return requestService(
      "FUNC",
      "VitaleCardReading",
      "ReportStartStatus",
      null,
      "object",
    );
  },
  getLinks: function () {
    return requestService(
      "FUNC",
      "VitaleCardReading",
      "GetLinks",
      null,
      "object",
    );
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestService(
      "FUNC",
      "VitaleCardReading",
      "NotifySessionType",
      sessionType,
      "object",
    );
  },
  saveToJson: function () {
    return requestService(
      "FUNC",
      "VitaleCardReading",
      "SaveToJson",
      null,
      "object",
    );
  },
  startTransaction: function () {
    return requestService(
      "FUNC",
      "VitaleCardReading",
      "StartTransaction",
      null,
      "object",
    );
  },
  rollback: function () {
    return requestService(
      "FUNC",
      "VitaleCardReading",
      "Rollback",
      null,
      "object",
    );
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestService(
      "FUNC",
      "VitaleCardReading",
      "RollbackSingle",
      propertyName,
      "object",
    );
  },
  commit: function () {
    return requestService(
      "FUNC",
      "VitaleCardReading",
      "Commit",
      null,
      "object",
    );
  },
  /**
   * Demande l'insertion d'une carte
   * @param {HelioCommandArgsDTO} inputParams -
   */
  insertCard: function (inputParams) {
    return requestService(
      "FUNC",
      "VitaleCardReading",
      "insertCard",
      inputParams,
      "object",
    );
  },
  /**
   * Demande le retrait d'une carte
   * @param {HelioCommandArgsDTO} inputParams -
   */
  removeCard: function (inputParams) {
    return requestService(
      "FUNC",
      "VitaleCardReading",
      "removeCard",
      inputParams,
      "object",
    );
  },
  /**
   * Demande la mise à jour la carte vitale
   * @param {HelioCommandArgsDTO} inputParams -
   */
  updateVitale: function (inputParams) {
    return requestService(
      "FUNC",
      "VitaleCardReading",
      "updateVitale",
      inputParams,
      "object",
    );
  },
  /**
   * Demande de lecture de la carte vitale
   * @param {HelioCommandArgsDTO} inputParams -
   */
  readVitale: function (inputParams) {
    return requestService(
      "FUNC",
      "VitaleCardReading",
      "readVitale",
      inputParams,
      "object",
    );
  },
  /**
   * Teste la présence d'une carte, mecaniquement
   */
  checkCardPresence: function () {
    return requestService(
      "FUNC",
      "VitaleCardReading",
      "checkCardPresence",
      null,
      "object",
    );
  },
};
/**
 * DocumentScanning
 * Service de numérisation de documents simulé
 */
Kiosk.DocumentScanning = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("DocumentScanning", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("DocumentScanning", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestService("PROP", "DocumentScanning", "get_category", "string");
  },
  get group() {
    return requestService("PROP", "DocumentScanning", "get_group", "string");
  },
  get status() {
    return requestService("PROP", "DocumentScanning", "get_status", "string");
  },
  get statusDescription() {
    return requestService(
      "PROP",
      "DocumentScanning",
      "get_statusDescription",
      "string",
    );
  },
  get statusDetail() {
    return requestService(
      "PROP",
      "DocumentScanning",
      "get_statusDetail",
      "string",
    );
  },
  get state() {
    return requestService("PROP", "DocumentScanning", "get_state", "string");
  },
  get stateDescription() {
    return requestService(
      "PROP",
      "DocumentScanning",
      "get_stateDescription",
      "string",
    );
  },
  get stateDetail() {
    return requestService(
      "PROP",
      "DocumentScanning",
      "get_stateDetail",
      "string",
    );
  },
  get statusObject() {
    return requestService(
      "PROP",
      "DocumentScanning",
      "get_statusObject",
      "object",
    );
  },
  get testable() {
    return requestService(
      "PROP",
      "DocumentScanning",
      "get_testable",
      "boolean",
    );
  },
  allStatus: function () {
    return requestService(
      "FUNC",
      "DocumentScanning",
      "allStatus",
      null,
      "object",
    );
  },
  init: function () {
    return requestService("FUNC", "DocumentScanning", "Init", null, "object");
  },
  test: function () {
    return requestService("FUNC", "DocumentScanning", "test", null, "boolean");
  },
  getLinkDocs: function () {
    return requestService(
      "FUNC",
      "DocumentScanning",
      "GetLinkDocs",
      null,
      "object",
    );
  },
  reportStatus: function () {
    return requestService(
      "FUNC",
      "DocumentScanning",
      "ReportStatus",
      null,
      "object",
    );
  },
  reportStartStatus: function () {
    return requestService(
      "FUNC",
      "DocumentScanning",
      "ReportStartStatus",
      null,
      "object",
    );
  },
  getLinks: function () {
    return requestService(
      "FUNC",
      "DocumentScanning",
      "GetLinks",
      null,
      "object",
    );
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestService(
      "FUNC",
      "DocumentScanning",
      "NotifySessionType",
      sessionType,
      "object",
    );
  },
  saveToJson: function () {
    return requestService(
      "FUNC",
      "DocumentScanning",
      "SaveToJson",
      null,
      "object",
    );
  },
  startTransaction: function () {
    return requestService(
      "FUNC",
      "DocumentScanning",
      "StartTransaction",
      null,
      "object",
    );
  },
  rollback: function () {
    return requestService(
      "FUNC",
      "DocumentScanning",
      "Rollback",
      null,
      "object",
    );
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestService(
      "FUNC",
      "DocumentScanning",
      "RollbackSingle",
      propertyName,
      "object",
    );
  },
  commit: function () {
    return requestService("FUNC", "DocumentScanning", "Commit", null, "object");
  },
  /**
   * accès à la dernière image capturée
   */
  get lastCapture() {
    return requestService(
      "PROP",
      "DocumentScanning",
      "get_lastCapture",
      "object",
    );
  },
  /**
   * Format de sortie des images
   */
  get captureFormat() {
    return requestService(
      "PROP",
      "DocumentScanning",
      "get_captureFormat",
      "string",
    );
  },
  /**
   * Format de sortie des images
   */
  set captureFormat(value) {
    requestServiceSetter(
      "PROP",
      "DocumentScanning",
      "set_captureFormat",
      value,
    );
  },
  /**
   * Poids de la capture en Mega Pixels
   */
  get captureRes() {
    return requestService(
      "PROP",
      "DocumentScanning",
      "get_captureRes",
      "uint32",
    );
  },
  /**
   * Poids de la capture en Mega Pixels
   */
  set captureRes(value) {
    requestServiceSetter("PROP", "DocumentScanning", "set_captureRes", value);
  },
  /**
   * Ratio de la sortie des images
   */
  get captureRatio() {
    return requestService(
      "PROP",
      "DocumentScanning",
      "get_captureRatio",
      "string",
    );
  },
  /**
   * Ratio de la sortie des images
   */
  set captureRatio(value) {
    requestServiceSetter("PROP", "DocumentScanning", "set_captureRatio", value);
  },
  /**
   * Délai entre l'éclairage et la prise d'une capture
   */
  get lightDelay() {
    return requestService(
      "PROP",
      "DocumentScanning",
      "get_lightDelay",
      "int32",
    );
  },
  /**
   * Délai entre l'éclairage et la prise d'une capture
   */
  set lightDelay(value) {
    requestServiceSetter("PROP", "DocumentScanning", "set_lightDelay", value);
  },
  /**
   * Nom de la led du scan
   */
  get lightName() {
    return requestService(
      "PROP",
      "DocumentScanning",
      "get_lightName",
      "string",
    );
  },
  /**
   * demarrage de la prévisualisation
   */
  startPreview: function () {
    return requestService(
      "FUNC",
      "DocumentScanning",
      "startPreview",
      null,
      "object",
    );
  },
  /**
   * arrêt de la prévisualisation
   */
  stopPreview: function () {
    return requestService(
      "FUNC",
      "DocumentScanning",
      "stopPreview",
      null,
      "object",
    );
  },
  /**
   * lance une capture d'image
   */
  captureImage: function () {
    return requestService(
      "FUNC",
      "DocumentScanning",
      "captureImage",
      null,
      "object",
    );
  },
};
/**
 * CardPayment
 * Service de paiement par carte bancaire simulé
 */
Kiosk.CardPayment = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("CardPayment", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("CardPayment", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestService("PROP", "CardPayment", "get_category", "string");
  },
  get group() {
    return requestService("PROP", "CardPayment", "get_group", "string");
  },
  get status() {
    return requestService("PROP", "CardPayment", "get_status", "string");
  },
  get statusDescription() {
    return requestService(
      "PROP",
      "CardPayment",
      "get_statusDescription",
      "string",
    );
  },
  get statusDetail() {
    return requestService("PROP", "CardPayment", "get_statusDetail", "string");
  },
  get state() {
    return requestService("PROP", "CardPayment", "get_state", "string");
  },
  get stateDescription() {
    return requestService(
      "PROP",
      "CardPayment",
      "get_stateDescription",
      "string",
    );
  },
  get stateDetail() {
    return requestService("PROP", "CardPayment", "get_stateDetail", "string");
  },
  get statusObject() {
    return requestService("PROP", "CardPayment", "get_statusObject", "object");
  },
  get testable() {
    return requestService("PROP", "CardPayment", "get_testable", "boolean");
  },
  allStatus: function () {
    return requestService("FUNC", "CardPayment", "allStatus", null, "object");
  },
  init: function () {
    return requestService("FUNC", "CardPayment", "Init", null, "object");
  },
  test: function () {
    return requestService("FUNC", "CardPayment", "test", null, "boolean");
  },
  getLinkDocs: function () {
    return requestService("FUNC", "CardPayment", "GetLinkDocs", null, "object");
  },
  reportStatus: function () {
    return requestService(
      "FUNC",
      "CardPayment",
      "ReportStatus",
      null,
      "object",
    );
  },
  reportStartStatus: function () {
    return requestService(
      "FUNC",
      "CardPayment",
      "ReportStartStatus",
      null,
      "object",
    );
  },
  getLinks: function () {
    return requestService("FUNC", "CardPayment", "GetLinks", null, "object");
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestService(
      "FUNC",
      "CardPayment",
      "NotifySessionType",
      sessionType,
      "object",
    );
  },
  saveToJson: function () {
    return requestService("FUNC", "CardPayment", "SaveToJson", null, "object");
  },
  startTransaction: function () {
    return requestService(
      "FUNC",
      "CardPayment",
      "StartTransaction",
      null,
      "object",
    );
  },
  rollback: function () {
    return requestService("FUNC", "CardPayment", "Rollback", null, "object");
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestService(
      "FUNC",
      "CardPayment",
      "RollbackSingle",
      propertyName,
      "object",
    );
  },
  commit: function () {
    return requestService("FUNC", "CardPayment", "Commit", null, "object");
  },
  get currentTransaction() {
    return requestService(
      "PROP",
      "CardPayment",
      "get_currentTransaction",
      "object",
    );
  },
  /**
   *
   * @param {openLocationFolderArgs} args -
   */
  openLocationFolder: function (args) {
    return requestService(
      "FUNC",
      "CardPayment",
      "openLocationFolder",
      args,
      "object",
    );
  },
  /**
   *
   * @param {debitCardArgs} args -
   */
  debitCard: function (args) {
    return requestService("FUNC", "CardPayment", "debitCard", args, "object");
  },
  /**
   *
   * @param {debitCardEnrollmentArgs} args -
   */
  debitCardEnrollment: function (args) {
    return requestService(
      "FUNC",
      "CardPayment",
      "debitCardEnrollment",
      args,
      "object",
    );
  },
  /**
   *
   * @param {PrintReceiptArgs} args -
   */
  printReceipt: function (args) {
    return requestService(
      "FUNC",
      "CardPayment",
      "printReceipt",
      args,
      "object",
    );
  },
  /**
   *
   * @param {ConfirmTransactionArgsDTO} args -
   */
  confirmTransaction: function (args) {
    return requestService(
      "FUNC",
      "CardPayment",
      "confirmTransaction",
      args,
      "object",
    );
  },
  cancelTransaction: function () {
    return requestService(
      "FUNC",
      "CardPayment",
      "cancelTransaction",
      null,
      "object",
    );
  },
};
/**
 * CashPayment
 * Service de paiement cash simulé
 */
Kiosk.CashPayment = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("CashPayment", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("CashPayment", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestService("PROP", "CashPayment", "get_category", "string");
  },
  get group() {
    return requestService("PROP", "CashPayment", "get_group", "string");
  },
  get status() {
    return requestService("PROP", "CashPayment", "get_status", "string");
  },
  get statusDescription() {
    return requestService(
      "PROP",
      "CashPayment",
      "get_statusDescription",
      "string",
    );
  },
  get statusDetail() {
    return requestService("PROP", "CashPayment", "get_statusDetail", "string");
  },
  get state() {
    return requestService("PROP", "CashPayment", "get_state", "string");
  },
  get stateDescription() {
    return requestService(
      "PROP",
      "CashPayment",
      "get_stateDescription",
      "string",
    );
  },
  get stateDetail() {
    return requestService("PROP", "CashPayment", "get_stateDetail", "string");
  },
  get statusObject() {
    return requestService("PROP", "CashPayment", "get_statusObject", "object");
  },
  get testable() {
    return requestService("PROP", "CashPayment", "get_testable", "boolean");
  },
  allStatus: function () {
    return requestService("FUNC", "CashPayment", "allStatus", null, "object");
  },
  init: function () {
    return requestService("FUNC", "CashPayment", "Init", null, "object");
  },
  test: function () {
    return requestService("FUNC", "CashPayment", "test", null, "boolean");
  },
  getLinkDocs: function () {
    return requestService("FUNC", "CashPayment", "GetLinkDocs", null, "object");
  },
  reportStatus: function () {
    return requestService(
      "FUNC",
      "CashPayment",
      "ReportStatus",
      null,
      "object",
    );
  },
  reportStartStatus: function () {
    return requestService(
      "FUNC",
      "CashPayment",
      "ReportStartStatus",
      null,
      "object",
    );
  },
  getLinks: function () {
    return requestService("FUNC", "CashPayment", "GetLinks", null, "object");
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestService(
      "FUNC",
      "CashPayment",
      "NotifySessionType",
      sessionType,
      "object",
    );
  },
  saveToJson: function () {
    return requestService("FUNC", "CashPayment", "SaveToJson", null, "object");
  },
  startTransaction: function () {
    return requestService(
      "FUNC",
      "CashPayment",
      "StartTransaction",
      null,
      "object",
    );
  },
  rollback: function () {
    return requestService("FUNC", "CashPayment", "Rollback", null, "object");
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestService(
      "FUNC",
      "CashPayment",
      "RollbackSingle",
      propertyName,
      "object",
    );
  },
  commit: function () {
    return requestService("FUNC", "CashPayment", "Commit", null, "object");
  },
  /**
   * Cumul des informations de la dernière opération de transaction
   */
  get currentTransaction() {
    return requestService(
      "PROP",
      "CashPayment",
      "get_currentTransaction",
      "object",
    );
  },
  /**
   * Active la colonne Cash pour un paiement par monnaie.
   * @param {BankTransactionArgsDTO} bankTransactionArgs - Arguments attendues de la part de l'application
   */
  bankTransaction: function (bankTransactionArgs) {
    return requestService(
      "FUNC",
      "CashPayment",
      "bankTransaction",
      bankTransactionArgs,
      "object",
    );
  },
  /**
   * Active la colonne Cash pour un rechargement de titre par monnaie
   * @param {TopupTransactionArgsDTO} topupTransactionArgs - Arguments attendues de la part de l'application
   */
  topupTransaction: function (topupTransactionArgs) {
    return requestService(
      "FUNC",
      "CashPayment",
      "topupTransaction",
      topupTransactionArgs,
      "object",
    );
  },
  /**
   * Confirmation de délivrance des biens
   * @param {ConfirmTransactionArgsDTO} confirmAmountInCents - valeur en centimes du bien délivré
   */
  confirmTransaction: function (confirmAmountInCents) {
    return requestService(
      "FUNC",
      "CashPayment",
      "confirmTransaction",
      confirmAmountInCents,
      "object",
    );
  },
  /**
   * Fonction utilisateur pour annuler de manière logicielle la transaction courante
   */
  cancelTransaction: function () {
    return requestService(
      "FUNC",
      "CashPayment",
      "cancelTransaction",
      null,
      "object",
    );
  },
  /**
   * Fonction utilisateur pour reprendre la transaction en cours
   */
  resumeTransaction: function () {
    return requestService(
      "FUNC",
      "CashPayment",
      "resumeTransaction",
      null,
      "object",
    );
  },
  /**
   * Met la transaction en cousrs en pause
   */
  pauseTransaction: function () {
    return requestService(
      "FUNC",
      "CashPayment",
      "pauseTransaction",
      null,
      "object",
    );
  },
  /**
   * Impression du reçu de paiement de la dernière transaction
   * @param {PrintReceiptArgs} args - contenu html complémentaire à rajouter à l'impression de reçu
   */
  printReceipt: function (args) {
    return requestService(
      "FUNC",
      "CashPayment",
      "printReceipt",
      args,
      "object",
    );
  },
};
/**
 * CameraShooting
 * Service de numérisation de documents simulé
 */
Kiosk.CameraShooting = {
  /**
   * Liste des événements
   *
   */
  events: {},
  /**
   * Lancement de l'écoute d'un événement
   *
   */
  addEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      this.events[name] = [callback];
      return requestAddEventListener("CameraShooting", name);
    } else if (this.events[name].indexOf(callback) < 0) {
      this.events[name].push(callback);
    }
  },
  /**
   * Arrêt de l'écoute d'un événement
   *
   */
  removeEventListener: function (name, callback) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    let callbackList = this.events[name];
    let callbackIndex = callbackList.indexOf(callback);

    if (callbackIndex !== -1) {
      if (callbackList.length > 1) {
        this.events[name].splice(callbackIndex, 1);
      } else {
        delete this.events[name];
        return requestRemoveEventListener("CameraShooting", name);
      }
    }
  },
  /**
   * Réception d'un événement
   *
   */
  fireEvent: function (e) {
    let eventName = e.eventName;
    if (!eventName || !this.events.hasOwnProperty(eventName)) {
      return;
    }

    let callbackList = this.events[eventName];

    callbackList.forEach(function (callback) {
      callback(e);
    });
  },
  get category() {
    return requestService("PROP", "CameraShooting", "get_category", "string");
  },
  get group() {
    return requestService("PROP", "CameraShooting", "get_group", "string");
  },
  get status() {
    return requestService("PROP", "CameraShooting", "get_status", "string");
  },
  get statusDescription() {
    return requestService(
      "PROP",
      "CameraShooting",
      "get_statusDescription",
      "string",
    );
  },
  get statusDetail() {
    return requestService(
      "PROP",
      "CameraShooting",
      "get_statusDetail",
      "string",
    );
  },
  get state() {
    return requestService("PROP", "CameraShooting", "get_state", "string");
  },
  get stateDescription() {
    return requestService(
      "PROP",
      "CameraShooting",
      "get_stateDescription",
      "string",
    );
  },
  get stateDetail() {
    return requestService(
      "PROP",
      "CameraShooting",
      "get_stateDetail",
      "string",
    );
  },
  get statusObject() {
    return requestService(
      "PROP",
      "CameraShooting",
      "get_statusObject",
      "object",
    );
  },
  get testable() {
    return requestService("PROP", "CameraShooting", "get_testable", "boolean");
  },
  allStatus: function () {
    return requestService(
      "FUNC",
      "CameraShooting",
      "allStatus",
      null,
      "object",
    );
  },
  init: function () {
    return requestService("FUNC", "CameraShooting", "Init", null, "object");
  },
  test: function () {
    return requestService("FUNC", "CameraShooting", "test", null, "boolean");
  },
  getLinkDocs: function () {
    return requestService(
      "FUNC",
      "CameraShooting",
      "GetLinkDocs",
      null,
      "object",
    );
  },
  reportStatus: function () {
    return requestService(
      "FUNC",
      "CameraShooting",
      "ReportStatus",
      null,
      "object",
    );
  },
  reportStartStatus: function () {
    return requestService(
      "FUNC",
      "CameraShooting",
      "ReportStartStatus",
      null,
      "object",
    );
  },
  getLinks: function () {
    return requestService("FUNC", "CameraShooting", "GetLinks", null, "object");
  },
  /**
   *
   * @param {SessionType} sessionType -
   */
  notifySessionType: function (sessionType) {
    return requestService(
      "FUNC",
      "CameraShooting",
      "NotifySessionType",
      sessionType,
      "object",
    );
  },
  saveToJson: function () {
    return requestService(
      "FUNC",
      "CameraShooting",
      "SaveToJson",
      null,
      "object",
    );
  },
  startTransaction: function () {
    return requestService(
      "FUNC",
      "CameraShooting",
      "StartTransaction",
      null,
      "object",
    );
  },
  rollback: function () {
    return requestService("FUNC", "CameraShooting", "Rollback", null, "object");
  },
  /**
   *
   * @param {String} propertyName -
   */
  rollbackSingle: function (propertyName) {
    return requestService(
      "FUNC",
      "CameraShooting",
      "RollbackSingle",
      propertyName,
      "object",
    );
  },
  commit: function () {
    return requestService("FUNC", "CameraShooting", "Commit", null, "object");
  },
  /**
   * accès à la dernière image capturée
   */
  get lastCapture() {
    return requestService(
      "PROP",
      "CameraShooting",
      "get_lastCapture",
      "object",
    );
  },
  /**
   * Format de sortie des images
   */
  get captureFormat() {
    return requestService(
      "PROP",
      "CameraShooting",
      "get_captureFormat",
      "string",
    );
  },
  /**
   * Format de sortie des images
   */
  set captureFormat(value) {
    requestServiceSetter("PROP", "CameraShooting", "set_captureFormat", value);
  },
  /**
   * Poids de la capture en Mega Pixels
   */
  get captureRes() {
    return requestService("PROP", "CameraShooting", "get_captureRes", "uint32");
  },
  /**
   * Poids de la capture en Mega Pixels
   */
  set captureRes(value) {
    requestServiceSetter("PROP", "CameraShooting", "set_captureRes", value);
  },
  /**
   * Ratio de la sortie des images
   */
  get captureRatio() {
    return requestService(
      "PROP",
      "CameraShooting",
      "get_captureRatio",
      "string",
    );
  },
  /**
   * Ratio de la sortie des images
   */
  set captureRatio(value) {
    requestServiceSetter("PROP", "CameraShooting", "set_captureRatio", value);
  },
  /**
   * Délai entre l'éclairage et la prise d'une capture
   */
  get lightDelay() {
    return requestService("PROP", "CameraShooting", "get_lightDelay", "int32");
  },
  /**
   * Délai entre l'éclairage et la prise d'une capture
   */
  set lightDelay(value) {
    requestServiceSetter("PROP", "CameraShooting", "set_lightDelay", value);
  },
  /**
   * Nom de la led du scan
   */
  get lightName() {
    return requestService("PROP", "CameraShooting", "get_lightName", "string");
  },
  /**
   * demarrage de la prévisualisation
   */
  startPreview: function () {
    return requestService(
      "FUNC",
      "CameraShooting",
      "startPreview",
      null,
      "object",
    );
  },
  /**
   * arrêt de la prévisualisation
   */
  stopPreview: function () {
    return requestService(
      "FUNC",
      "CameraShooting",
      "stopPreview",
      null,
      "object",
    );
  },
  /**
   * lance une capture d'image
   */
  captureImage: function () {
    return requestService(
      "FUNC",
      "CameraShooting",
      "captureImage",
      null,
      "object",
    );
  },
};

Kiosk.ownerList = {};
Kiosk.services.forEach(function (srv) {
  Kiosk.ownerList[srv] = [srv];
});

Kiosk.devices.forEach(function (dvc) {
  Kiosk.ownerList[dvc.Name] = [dvc.OwnerName, dvc.Name];
});

Kiosk.subdevices.forEach(function (subdvc) {
  let dvc = subdvc.OwnerName;
  let srv = Kiosk.ownerList[dvc][0];
  Kiosk.ownerList[subdvc.Name] = [srv, dvc, subdvc.Name];
});

window.addEventListener("onKioskEvent", function (e) {
  let sender = e.detail && e.detail.sender ? e.detail.sender : "Kiosk";
  let data = e.detail && e.detail.data ? e.detail.data : null;

  let component = Kiosk;
  if (sender !== "Kiosk") {
    if (Kiosk.ownerList[sender]) {
      Kiosk.ownerList[sender].forEach(function (owner) {
        component = component[owner];
      });
    }
  }

  // Copie des informations de e.detail vers un nouvel objet éditable
  let detailClone = {
    ...e.detail,
  };

  try {
    // Echappement du retour à la ligne
    let formatData = data.replace(/\r|\t/g, "").replace(/\n/g, "\\n");

    // Désérialisation des données
    detailClone.data = JSON.parse(formatData);
  } catch (error) {
    // Données non compatibles JSON, à garder en l'état
  }

  component.fireEvent(detailClone);
});
