# Installation
1. Clone this repository
2. In a terminal window, navigate to this repository and run the command ```npm install```


# Running the test
With the GUI:
1. In a terminal window, navigate to this repository and run the command ```npx cypress open```
2. Click on the spec file ```get_company_info.spec.js```
3. Close the logs while the test runs. Due to the large amount of actions this test needs to perform, leaving the logs open
will significantly impact the performance of the test. With the logs closed, the test runs on my system within 1 minute - 1 minute 20 seconds. With the logs open,
the test will run for over 7 minutes.

In headless mode:
In a terminal window, navigate to this repository and run the command ```npx cypress run cypress/integration/company.info.spec.js```.



# Viewing the results
After the test has run, you can find the downloaded company logos under the folder /cypress/Downloads, and the JSON file containing company data can be 
found at /cypress/integrations/companyData.json.
