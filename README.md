# polymerBuildTesting

Steps to test:
  - Run npm i
  - Run bower i
  - Run node node_modules/.bin/gulp 

#Work-around-2:
- First run unbundeld
  - minify all JS files, apart of behaviors & minified.
  - Behaviors are exempt as the analyzer breaks on random moments with @polymerBehavior (even if you leave the comments in)
- Change root folder to unbundeld results
  - Run bundled
    - Minify html/css

  