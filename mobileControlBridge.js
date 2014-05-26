/**
	*
	* Bridges motion events over to normal key events.
	* 
	* @author Norm Tasfi <ntasfi@gmail.com>
	* @copyright Norm Tasfi <http://343hz.com>
	* @version 0.0.1
	* @license MIT License
	*
*/

var mobileControlBridge = (function() {
  var instance;

  function init() { //private methods and variables
    var settings = {
      enableGestures: true,
      gestureErrorThreshold: 1,
      maxMeasurmentsMemory: 30,
      watchGestures: ["Rock"],
      mappings: {
        "Rock": {
          Type: "keydown",
          Keys: [
            KeyCode: 39, //right
            TriggerMagnitudes: {
              "Gamma": [100, 120, 100, 120]
            },
          ]
        }, //end rock
        "Alpha": { //has to be one of the keys from the measurments object
          Type: "keydown", //what kind of event do you want to be triggered?
          Keys: [ //an array of key objects
            {
              KeyCode: 39, //right
              TriggerMagnitude: -15, //what point do you want it to be triggered at?
            }, //key obj
            {
              KeyCode: 37, //left
              TriggerMagnitude: 15,
            } //key obj
          ] //end keys
        }, //end Alpha
        "Gamma": {
          Type: "keydown",
          Keys: [
          {
            KeyCode: 38, //up
            TriggerMagnitude: -15,
          },
          {
            KeyCode: 40, //down
            TriggerMagnitude: 15,
          }
          ]
        }
      },

      updateValues: {
        X: false,
        Y: false,
        Z: false,
        Alpha: false, //tilted around the z-axis
        Beta: false, //titled front-to-back
        Gamma: false //titled side-to-side
      }
    };

    var calibration = {
        X: 0,
        Y: 0,
        Z: 0,
        Alpha: 0,
        Beta: 0,
        Gamma: 0
    };

    var measurements = {
        X: null,
        Y: null,
        Z: null,
        Alpha: null,
        Beta: null,
        Gamma: null
    };

    var measurementsMemory = {
        X: [],
        Y: [],
        Z: [],
        Alpha: [],
        Beta: [],
        Gamma: []
    };

    ///////////////////////////
    //start gesture functions
    ///////////////////////////

    //records a gesture
    function recordGesture() {

    }


    //mean squared error
    function MSE(estimate, actual) {
      var error = 0;

      if(estimate.length != actual.length) {
        error = 999999; //this is a quick way to make it fail. We could return a negative but we would have to check.
        return error;
      }

      for (var i = 0; i < estimate.length; i++) {
          var diff = estimate[i]-actual[i];
          error += Math.pow(diff, 2);
      }
      return error/estimate.length;
    }

    //mean absolute error
    function MAE(estimate, actual) {
      var error = 0;

      if(estimate.length != actual.length) {
        error = 999999; //this is a quick way to make it fail. We could return a negative but we would have to check.
        return error;
      }

      for (var i = 0; i < estimate.length; i++) {
          var diff = estimate[i]-actual[i];
          error += Math.abs(diff);
      }
      return error/estimate.length;
    }

    //we can use different error functions instead of MSE down the road.
    function errorFunction(estimate, actual) {
      return MSE(estimate, actual);
    }

    function errorOfGestureAndMeasurment(gestureName) {
      //for each channel we want to compare against from the gesture
      var errorMeasurmentsGesture = 0;
      for (var key in settings.mappings[gestureName].Keys.TriggerMagnitudes) {
        var actual = settings.mappings[gestureName].Keys.TriggerMagnitudes[key];
        var estimate = measurementsMemory[key]
        errorMeasurmentsGesture += errorFunction(estimate, actual);
      }
      var numberOfChannels = keys(settings.mappings[gestureName].Keys.TriggerMagnitudes).length;
      errorMeasurmentsGesture = errorMeasurmentsGesture/numberOfChannels;
      return errorMeasurmentsGesture;
    }

    //this checks if the gesture has occured.
    function checkForGestures() {
      for(var key in settings.watchGestures) {
        if(errorOfGestureAndMeasurment(key) < settings.gestureErrorThreshold) {
          triggerKeyEventWith(settings.mappings[key].Keys[0].KeyCode, settings.mappings[key].Type);
        }
      }
    }

    ///////////////////////////
    //end gesture functions
    ///////////////////////////

    function triggerKeyEventWith(keyCode, type) {
        var eventObj = document.createEventObject ?
            document.createEventObject() : document.createEvent("Events");
      
        if(eventObj.initEvent){
          eventObj.initEvent(type, true, true);
        }
      
        eventObj.keyCode = keyCode;
        eventObj.which = keyCode;
        
        if(window.dispatchEvent) {
          window.dispatchEvent(eventObj);
        } else {
          window.fireEvent("on"+type, eventObj); 
        }
    };

    /*
      Checks if its gte if positive triggerMag and lte if negative triggerMag
      Returns true or false.
    */
    function checkTriggerMagnitude(TriggerMagnitude, value) {
      if(TriggerMagnitude >= 0) { //gte
        return (value >= TriggerMagnitude)
      } else if(TriggerMagnitude < 0) { //lte
        return (value <= TriggerMagnitude)
      } else {
        //how'd you get here?!
      }
    } //end checkTriggerMagnitude

    /*
      Checks if the previous value has has been changed from last eventfire. 
      Fires a trigger event for the key IF it is in the threshold.

    */
    function hasChangedAndTrigger(previousValue, newValue, eventName) {
      //add it to the memory
      if(enableGestures) {
        measurementsMemory[eventName].push(newValue);
        if(measurementsMemory[eventName].length > maxMeasurmentsMemory) {
          measurementsMemory[eventName].shift();
        }
        checkForGestures();
      }

      if (settings.mappings[eventName]) {//if there is a binding for this event
        for(var key in settings.mappings[eventName].Keys) { //for each key
          var thisKey = settings.mappings[eventName].Keys[key];
          if (checkTriggerMagnitude(thisKey.TriggerMagnitude, newValue)) { //check the threshold
            triggerKeyEventWith(thisKey.KeyCode, settings.mappings[eventName].Type)
          }; //end if
        } //end for
      } //end if
      if(newValue == previousValue) {
        return previousValue
      } else {
        return newValue //return the newValue regardless, of the 
      } //end if
    } //end hasChangedAndTrigger

    /*
    * Attemps to bind to the devices sensors via eventListeners
    *
    * Returns true if successful and false otherwise.
    */
    function bindPolling() {
      if (checkBrowserSupport() == false) {
        return false;
      }

      if (window && window.addEventListener) {
        window.addEventListener('devicemotion', function(e) {
          var X = e.acceleration.x - calibration.X;
          var Y = e.acceleration.y - calibration.Y;
          var Z = e.acceleration.z - calibration.Z;
          measurements.X = hasChangedAndTrigger(measurements.X, X, 'X');
          measurements.Y = hasChangedAndTrigger(measurements.Y, Y, 'Y');
          measurements.Z = hasChangedAndTrigger(measurements.Z, Z, 'Z');
        }, false);

        window.addEventListener('deviceorientation', function(e) {
          var Alpha = e.alpha - calibration.Alpha;
          var Beta = e.beta - calibration.Beta;
          var Gamma = e.gamma - calibration.Gamma;
          measurements.Alpha = hasChangedAndTrigger(measurements.Alpha, Alpha, 'Alpha');
          measurements.Beta = hasChangedAndTrigger(measurements.Beta, Beta, 'Beta');
          measurements.Gamma = hasChangedAndTrigger(measurements.Gamma, Gamma, 'Gamma');
          //updateVisuals(measurements.Alpha, measurements.Beta, measurements.Gamma); //update our pretty visuals
        }, false);
        return true;
      } else {
        return false;
      }
    }; //end bindPolling

    //clears the calibration that we have saved for the device
    function clearCalibrations() {
        //clear
        for(var i in calibration) {
          calibration[i] = 0;
        } //end for
    }; //end clearCalibrations

    /*
    *
    * Gets the measurments from the sensors at this exact moment and sets the calibration variables
    *
    */
    function calibrateDevice() {
        //a new update should happen now.
        for(var i in calibration) { //for each measurement
          if (measurements[i] != null) { //if the reading isnt null
            calibration[i] = measurements[i]; //set our calibration to the new reading
          } else {
            calibration[i] = 0; //otherwise, aka our measurement reading IS null then set measurments to 0.
          }
        }
    }; //end calibrateDevice


    function checkBrowserSupport() {
      var err = doesDeviceSupport('devicemotion');
      if (err != true) {
        console.log('Device Error: Does not support DeviceMotionEvent.');
        return false;
      }
      var err = doesDeviceSupport('deviceorientation');
      if (err != true) {
        console.log('Device Error: Does not support DeviceOrientationEvent.');
        return false;
      } 
      return true;     
    }; //end checkBrowserSupport

    /*
    *
    * Checks to see if the eventName is supported by the browser.
    *
    * Returns true or false.
    */
    function doesDeviceSupport(eventName) {
      var d = {
        eName: eventName,
        obj: null,
      }

      function handleEvent(e) { //they BOTH have beta, gamma and alpha and if they are all null then its the same thing
        console.log(e);
        if (e === undefined) {
          return false;
        }
        if (e.gamma == null && e.beta == null && e.alpha == null) {
          return false;
        }
      }

      switch(d.eName) {
        case "deviceorientation":
          d.obj = window.DeviceOrientationEvent;
          break;
        case "devicemotion":
          d.obj = window.DeviceMotionEvent;
          break;
        default:
          console.log('Error: No value given for eventName.');
          return -1; //nothing given
      }

      if (d.obj) { //check for our object if it exists
        // the first ipad has a little gotcha where it says it supports it
        // and fires once but everything is null.
        window.addEventListener(d.eName, handleEvent, false);
        window.removeEventListener(d.eName, handleEvent, false);
        return true;
      } else {
        return false;
      }
    }; //end supportsDeviceOrientation

    /*
      Updates visuals on the page. This is optional. Did it as a debugging tool for myself.
    */
    function updateVisuals(alpha, beta, gamma) {
      document.getElementById("alphaMeasurment").innerHTML = Math.round(alpha);
      document.getElementById("betaMeasurment").innerHTML = Math.round(beta);
      document.getElementById("gammaMeasurment").innerHTML = Math.round(gamma);

      document.getElementById("alphaCalibration").innerHTML = Math.round(calibration['Alpha']);
      document.getElementById("betaCalibration").innerHTML = Math.round(calibration['Beta']);
      document.getElementById("gammaCalibration").innerHTML = Math.round(calibration['Gamma']);

      // Apply the transform to the image
      var logo = document.getElementById("imgLogo");
      //  rotate - frontBack - roll
      logo.style.MozTransform = "rotate("+ alpha*-1 +"deg)";
      logo.style.webkitTransform = "rotate3d(0,0,1, "+ (alpha*-1)+"deg) rotate3d(1,0,0, "+ (beta*-1)+"deg) rotate3d(0,1,0, "+ (gamma)+"deg)";
      logo.style.transform = "rotate3d(0,0,1, "+ (alpha*-1)+"deg) rotate3d(1,0,0, "+ (beta*-1)+"deg) rotate3d(0,1,0, "+ (gamma)+"deg)";
    }; //end updateVisuals

  return {
    //public methods and variables
    mappings: settings.mappings,

    toggleGestureEnable: function() {
      enableGestures = enableGestures == true ? false:true;
      return enableGestures //we can see it now
    },

    addMapping: function(eventObj, eventName) {
      settings.mappings[eventName] = eventObj;
    },

    checkBrowserSupport: function() {
      return checkBrowserSupport();
    },

    calibration: function() {
      return calibration;
    },

    recalibrateDevice: function() {
      clearCalibrations();
      setTimeout(calibrateDevice, 30); //not sure what to do set the wait for. We NEED another event to fire before setting it again.
    },

    start: function(objectName) {
      //createEvents();
      if (objectName) {
        watchObject(objectName);
      } else {
        console.log("Binding polling.");
        var err = bindPolling();
        if (err != true) {
          console.log("Error: Could not bind.");
        }

        console.log("Calibrating device.");
        setTimeout(calibrateDevice, 200); //wait 200ms (safe bet) and calibrate the device. Give the events a chance to fire.
      }

    }
  }; //end return inside init

  }; //end init

  return {
    getInstance: function() {
      if (!instance) {
        instance = init();
      }
      return instance;
    }
  }; //end return
})();