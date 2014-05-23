##Setup

Add the following to any html page.

```html
<script src="./mobileControlBridge.js"></script>
<script>

if (typeof mobileControlBridge != "undefined") {
	var mCB = mobileControlBridge.getInstance();

	if (mCB.checkBrowserSupport()) {
		mCB.start(); //kick it off
	} else {
		console.log(mCB.isBrowserSupported());
		console.log("Browser is not supported.");
	}
} else {
	console.log("Could not find mobileControlBridge");
}
</script>
```

Then add whatever mappings you want to to the settings.mappings object within *mobileControlBridge.js*, starting after line 17. The form for each map is as such:

```javascript
"Alpha": { //has to be one of the keys from the measurments object (Alpha, Beta, Gamma, X, Y, Z)
  Type: "keydown", //what kind of event do you want to be triggered?
  Keys: [ //an array of key objects
    {
      KeyCode: 39, //right
      TriggerMagnitude: -15, //what point do you want it to be triggered at?
    }, //key obj
    {
      KeyCode: 37, //left key
      TriggerMagnitude: 15, //when do you want this to trigger?
    } //key obj
  ] //end keys
} //end Alpha
```

The root key, in this case Alpha, is case sensitive. This tells the lib to watch the Alpha motion event on the device.

You can have up to two keys added. Results might be wonky if you have more then two key as one magnitude is tested as gte and the other is lte.

If you want to have debugging, just uncomment the following line:

```javascript
updateVisuals(measurements.Alpha, measurements.Beta, measurements.Gamma); //update our pretty visuals
```

Make sure your html file has something like this inside of it as well:

```html
  <h2>Debug Information</h2>
  <table>
    <tr>
      <td>Measurment [alpha]</td>
      <td id="alphaMeasurment"></td>
    </tr>
    <tr>
      <td>Measurment [beta]</td>
      <td id="betaMeasurment"></td>
    </tr>    
    <tr>
      <td>Measurment [gamma]</td>
      <td id="gammaMeasurment"></td>
    </tr>
    <tr>
      <td>Calibration [alpha]</td>
      <td id="alphaCalibration"></td>
    </tr>
    <tr>
      <td>Calibration [beta]</td>
      <td id="betaCalibration"></td>
    </tr>
    <tr>
      <td>Calibration [gamma]</td>
      <td id="gammaCalibration"></td>
    </tr>
   </table>
```