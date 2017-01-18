# polymerBuildTesting

###Issue:
We use the npm module polymer-build for our tooling so we can minimize and transpile the code

Sadly if we run this through our pipeline we get: [unknown-polymer-behavior] - Unable to resolve behavior `TEST.ReduxBehavior`

We can fix this by moving the annotation to the top of the file, but this doesn't seem like a reasonable fix

####Branches:
- behavior (Is broken)
- behavior-works (Works)

If we use the polymer cli there are no issues.

Are we doing something wrong?

###Steps to test:
- Run npm i
- Run bower i
- Run node node_modules/.bin/gulp 


  