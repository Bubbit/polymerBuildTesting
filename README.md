# polymerBuildTesting

###Scenario:
If the app that's being builded is using a dependency that has a certain stucture:
![component file structure](https://github.com/Bubbit/polymerBuildTesting/blob/vulcanize/images/Screen%20Shot%202017-01-09%20at%2016.46.05.png?raw=true)
And the include flow is as follows:
![include flow](https://github.com/Bubbit/polymerBuildTesting/blob/vulcanize/images/Screen%20Shot%202017-01-09%20at%2016.50.11.png?raw=true)
In short:
- App includes bower_components/test-card/test-a.html
- test-a.html includes src/elements/test-b.html
- test-b.html includes ../../test-c.html

###Steps to test:
- Run npm i
- Run bower i
- Run node node_modules/.bin/gulp 
- Check build/bundled/src/app-main/app-main.html -> assetpath of test-c.html is empty and should be '../../bower_components/test-card/'


  