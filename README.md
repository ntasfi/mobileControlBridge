##Setup

Add the following to any html page.

```javascript
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

Then add the mappings you want to watch for within *mobileControlBridge.js*. The layout for each map is as such:

```json
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

You can have up to two keys added. This isnt a hard limit. One magnitude is tested as gte and the other is lte.

If you want to have debugging, just uncomment the follow line:

```javascript
updateVisuals(measurements.Alpha, measurements.Beta, measurements.Gamma); //update our pretty visuals
```