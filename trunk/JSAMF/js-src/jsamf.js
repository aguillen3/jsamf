jsamf = {};

/**
 * @param (String) gateway Service URI
 * @param (Boolean) compress If true, Flash use ByteArray compression default false
 */
//TODO: Poprawic respondera do pushy...
//TODO: Po stronie flasha obsluzyc synchronicznosc
jsamf.JSAMF = function (gateway, compress)
{
	this.gateway = gateway;
	this.compress = compress == true;
/*	var me = this;
	var pushResult = function (result)
	{
		me.pushResult(result);
		jsamf.JSAMF.calls[jsamf.JSAMF.SERVER_PUSH] = new jsamf.CallInstance(responder);
	}
	var responder = new Responder(pushResult);
	jsamf.JSAMF.calls[jsamf.JSAMF.SERVER_PUSH] = new jsamf.CallInstance(responder);*/

}

jsamf.JSAMF.SERVER_PUSH = "_jsamf_server_push_";
/**
 * @private
 */
jsamf.JSAMF.initialized = false;
/**
 * @private
 */
jsamf.JSAMF.DIV_NAME = null;
/**
 * @private
 */
jsamf.JSAMF.calls = {};

/**
 * @private
 */

jsamf.JSAMF.initialize = function ()
{
	//Something usefull here
}

/**
 * @private
 * @param (String) id 
 * @return (jsamf.Responder) Returns responder for given id
 */

jsamf.JSAMF.getCallById = function (id)
{
	return jsamf.JSAMF.calls[id];
}

/**
 * @private
 * @param (String) id Releases responder from internal hash map
 */

jsamf.JSAMF.releaseCallById = function (id)
{
	jsamf.JSAMF.calls[id] = null;
	delete jsamf.JSAMF.calls[id];
}

/**
 * @private
 * @param (String) id Responder id
 * @param (Number) index Part index
 * @param (Number) total Total parts number
 * @param (String) message Part message
 * @param (Number) partialMode Partial mode for response (result or fault)
 * @see jsamf.CallInstance.PARTIAL_RESULT
 * @see jsamf.CallInstance.PARTIAL_FAULT
 */

jsamf.JSAMF.partialMessageHandler = function (id, index, total, message, partialMode)
{
	var callInstance = jsamf.JSAMF.getCallById(id);
	callInstance.partialMode = partialMode;
	callInstance.addPart(index, total, message);
}

/**
 * @private
 * @param (String) id Responder id
 * @param (Object) result Result object
 */

jsamf.JSAMF.resultHandler = function (id, result)
{
	console.log(result);
	var callInstance = jsamf.JSAMF.getCallById(id);
	jsamf.JSAMF.releaseCallById(id);
	callInstance.responder.result(result);
}

/**
 * @private
 * @param (String) id CallInstance id
 * @param (Object) status Status object (jsamf.NetStatusObject for eg.)
 * @see jsamf.NetStatusObject
 */

jsamf.JSAMF.faultHandler = function (id, status)
{
	console.log(status);
	var callInstance = jsamf.JSAMF.getCallById(id);
	jsamf.JSAMF.releaseCallById(id);
	callInstance.responder.fault(status);
}

/**
* @param (String) divName DIV name to embed flash control
* @param (String) socketServer Socket server address for push calls
* @throws (Error) Throws error, when JSAMF allready embedded
*/
//TODO: allowScriptAccess=always!!!!
//TODO: wmode=transparent?
//TODO: width,height=1,1
jsamf.JSAMF.embedSWF = function (divName, socketServer, width, height)
{
	if (jsamf.JSAMF.DIV_NAME != null)
		throw new Error("Allready embedded!");

	jsamf.JSAMF.DIV_NAME = divName;
	var args = jsamf.argumentsToArray(arguments);

	args = ["../bin-release/JSAMF.swf"].concat(args);
	
	//Cos mi tu nie dziala z display:none

	if (args[7] == undefined)
		args[7] = {};
	if (args[7].style == undefined)
		args[7].style = "display:none;";

	swfobject.embedSWF.apply(swfobject, args);
	//swfobject.embedSWF("../bin-release/JSAMF.swf", divName);
	//jak ustawic styl!?
	//jsamf.JSAMF.getMovieElementInternal(divName).style = "display:none;";
}


/**
 * @private
 * @return (Object) Returns Flash object
 */

jsamf.JSAMF.getMovieElementInternal = function ()
{
	return document.getElementById(jsamf.JSAMF.DIV_NAME);
}

/**
* @private
* @param (String) uri Gateway URI
* @param (String) method Remote method name
* @param (jsamf.CallInstance) callInstance CallInstance object 
* @param (Array) args Remote method arguments (0...n)
*/

jsamf.JSAMF.internalCall = function (uri, method, compress, callInstance, args)
{
	jsamf.JSAMF.calls[callInstance.id] = callInstance;
	var flashObject = jsamf.JSAMF.getMovieElementInternal();
	flashObject.callAMF.apply(flashObject, [uri, callInstance.id, method, compress].concat(args));
}



/**
 * @param (String) method Remote method name
 * @param (jsamf.Responder) responder Responder object
 * @param ...rest Additional method parameters
 * @throws (Error) Throws error, when result callback is undefined
 */
jsamf.JSAMF.prototype.call = function (method, responder)
{
	var args = jsamf.argumentsToArray(arguments, 2);
	var callInstance = new jsamf.CallInstance(responder);
	jsamf.JSAMF.internalCall.apply(this, [this.gateway, method, this.compress, callInstance].concat(args));
}

/**
 * (Object) Remote method call client object
 */
jsamf.JSAMF.prototype.client = null;


/**
 * @private
 * @param (Object) pushObject Server push object {method: "methodName", body: object}
 * @throws Throws error, when JSAMF.client, or JSAMF.client[methodName] is not defined

jsamf.JSAMF.prototype.pushResult = function (pushObject)
{
	if (this.client == null || !(this.client[pushObject.methodName] instanceof Function))
		throw new Error("Method "+pushObject.methodName+" not defined!");
	this.client[pushObject.methodName](pushObject.body);
}
 */
 
/**
 * @return (Boolean) Returns true if exception marshalling is on, otherwise false.
 */
jsamf.JSAMF.getMarshallExceptions = function ()
{
	return jsamf.JSAMF.getMovieElementInternal().getMarshallExceptions();
}
/**
 * @param (Boolean) useMarshall Sets marshalling exception to and from Flash
 * @see Flash help for ExternalInterface.marshallExceptions
 */
jsamf.JSAMF.setMarshallExceptions = function (useMarshall)
{
	jsamf.JSAMF.getMovieElementInternal().setMarshallExceptions(marshall);
}



/**
 * @private
 * @param (Object) args
 * @param (Number) trim
 * @return (Array)
 */
//TODO: dodac argument Number - trimujacy z lewej lub z prawej (+/-)
jsamf.argumentsToArray = function (args, trim)
{
	var i = args.length;
	var arr = [];
	while (i--)
		arr[i] = args[i];
	if (trim < 0)
		return arr.slice(0, trim);
	else
		return arr.slice(trim);
	//return arr.slice(0, isNaN(trim)? arr.length : trim);
}


/**
 * @param (Function) result 
 * @param (Function) fault
 * @throws (Error) Throws error, when result callback is undefined
 */
jsamf.Responder = function (result, fault)
{
	if (result == null && this.result == null)
		throw new Error("No result function in Responder!");
	this.result = result;
	if (fault != null)
		this.fault = fault;
}

/**
 * @param (Object) result
 */
jsamf.Responder.prototype.result = function (result){};

/**
 * @param (jsamf.NetStatusObject) status
 */
jsamf.Responder.prototype.fault = function (status){};



/**
 * @private
 * @param (jsamf.Responder) responder
 */
jsamf.CallInstance = function (responder)
{
	this.id = "id_" + jsamf.CallInstance.id++;
	this.responder = responder;
	this.rcvBuffer = [];
	this.rcvParts = 0;
	this.rcvTotal = -1;
}

jsamf.CallInstance.id = 0;
jsamf.CallInstance.PARTIAL_RESULT = 0;
jsamf.CallInstance.PARTIAL_FAULT = 1;

/**
 * @private
 * @param (Number) index
 * @param (Number) total
 * @param (String) message
 * @throws (Error) Throws error, when total parts not equal previous length
 */
jsamf.CallInstance.prototype.addPart = function (index, total, message)
{
	console.log(this.id+"@part "+index+"/"+total);
	this.rcvBuffer[index] = message;
	this.rcvParts++;
	if (this.rcvTotal != -1 && this.rcvTotal != total)
		throw new Error("Something's fcuked up in partial message total (was "+this.rcvTotal+", is "+total+")");
	this.rcvTotal = total;
	if (index == total - 1)
		this.finalize();
}

/**
 * @private
 */
jsamf.CallInstance.prototype.finalize = function()
{
	var message = null;
	//console.log("String length: "+this.rcvBuffer.length);
	try
	{
		eval("message = "+this.rcvBuffer.join(""));
		jsamf.JSAMF.resultHandler(this.id, message);
	}
	catch (e)
	{
		//console.log("Dammit, something's fucked!");
		var status = new NetStatusObject(jsamf.StatusLevel.ERROR, 
			jsamf.StatusCode.RESPONDER_FRAGMENTATION);
		status.content = this;
		jsamf.JSAMF.faultHandler(this.id, message);
		//console.log(this.rcvBuffer);
	}
}





/**
 * @param (String) level
 * @param (String) code 
 */
jsamf.NetStatusObject = function (level, code)
{
	this.level = level;
	this.code = code;
}

jsamf.StatusLevel = 
{
	STATUS: "status",
	ERROR: "error",
	WARNING: "warning"
}

jsamf.StatusCode = 
{
	BAD_VERSION: "NetConnection.Call.BadVersion", //error
	CALL_FAILED: "NetConnection.Call.Failed", //error
	CALL_PROHIBITED: "NetConnection.Call.Prohibited", //error
	CONNECT_CLOSED: "NetConnection.Connect.Closed", //status
	CONNECT_FAILED: "NetConnection.Connect.Failed", //error
	CONNECT_SUCCESS: "NetConnection.Connect.Success", //status
	//CONNECT_REJECTED: "NetConnection.Connect.Rejected", //error?
	//APP_SHUTDOWN: "NetConnection.Connect.AppShutdown", //error
	//INVALID_APP: "NetConnection.Connect.InvalidApp" //error
	
	//JSAMF Related:
	RESPONDER_FRAGMENTATION: "JSAMF.Responder.FragmentationError" //error
}

/**
 * Moze powinienem to zostawic jako zwykle parametry osadzania?
 * @param (String) divName 
 * @param (String) initCallbackName 
 */
/*jsamf.InitObject = function (divName, initCallbackName)
{
	if (divName == undefined || divName.length == 0)
		throw new Error("Parameter divName omitted!");
	this.initCallbackName = initCallbackName == undefined? 
		"jsamf.JSAMF.initialize" : initCallbackName;
}
*/


/*
* TODO:
* - obsluga bledow
* - kanal zwrotny /server push/
* + pakietowanie asynchroniczne ...
* - ...i nie w kolejnosci (per instancja)
* - FMS client?
*/