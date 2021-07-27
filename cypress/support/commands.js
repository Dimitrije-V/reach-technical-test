require('cypress-downloadfile/lib/downloadFileCommand')

/**
 * Accepts cookies when the banner appears. Not actually needed for the test to run, but will help with visibility
 * in the logs.
 */
Cypress.Commands.add('acceptCookies', () => {
    cy.get('#onetrust-accept-btn-handler')
    .click()
})

/**
 * Given a JSON object, add to it the names of each section found on a provided site, as well as their URLs.
 * @param {object} sectionList - The JSON object to which we write the above information
 * @param {string} siteUrl - The site from which to get all section names and URLs
*/
Cypress.Commands.add('getSectionData', (sectionList, siteUrl) => {
    cy.get('.browse > li > a')
        .each($item => {
            cy.wrap($item)
                .invoke('text')
                .then(sectionName => {
                    sectionList[sectionName] = {}
                }).then((sectionName) => {
                    cy.wrap($item)
                        .invoke('attr', 'href')
                        .then(href => {
                            sectionList[sectionName].url = `${siteUrl}${href}`
                            sectionList[sectionName].contents = {}
                        })
                })
        })
})

/**
 * Get the URL of a company on a section, based on a specified position/index. Add this URL to the specified JSON object. 
 * This function will be used to get the first, third, and last company's details, presenting us with an issue.
 * Namely, the problem here is that a section may have less than 3 elements, causing the check for the third to fail. 
 * Cypress is built around avoiding flaky tests, and as such does not support conditional testing, so we need to first check
 * the element exists in the DOM's body with cy.find as a workaround. This is bad practice, and another solution should be found.
 * See https://docs.cypress.io/guides/core-concepts/conditional-testing#The-DOM-is-unstable for more info.
 * @param {object} sectionData - the JSON object to which we add company URLs
 * @param {string} sectionName - the name of the section we want to search for company names
 * @param {string} siteUrl - The root URL of the site we're testing, used to construct full URLs of the captured companies
 * @param {number} elementIndex - the index at which to search for a company
*/
Cypress.Commands.add('getCompanyUrlAtIndex', (sectionData, sectionName, siteUrl, elementIndex) => {
    cy.get('body').then($body => {
        if ($body.find((`.ieleft > ul > :nth-child(2) > .key`)).length > 0 || elementIndex != 2) {
            cy.get('.main-home > div > ul > li > a')
                .eq(elementIndex)
                .then($item => {
                    cy.wrap($item)
                        .invoke('text')
                        .then(companyName => {
                            sectionData[sectionName].contents[companyName] = {}
                        })
                        .then(companyName => {
                            cy.wrap($item)
                                .invoke('attr', 'href')
                                .then(href => {
                                    sectionData[sectionName].contents[companyName].url = `${siteUrl}${href}`
                                })
                        })
                })
        }
    })
})

/**
 * Given a section's URL, use the function getCompanyUrlAtIndex to get the first, third and last company's URL on a section, and
 * add these URLs to a specified object.
 * @param {object} sectionData - The object from which we find the specified section's url; to which we add company URLs
 * @param {string} sectionName - The name of the section we want to search for company URLs
 * @param {string} siteUrl - The URL of the site where we perform our test
*/
Cypress.Commands.add('getFirstThirdAndLastCompanyData', (sectionData, sectionName, siteUrl) => {
    cy.visit(sectionData[sectionName].url).then(() => {
        cy.getCompanyUrlAtIndex(sectionData, sectionName, siteUrl, 0).then(() => {
            cy.getCompanyUrlAtIndex(sectionData, sectionName, siteUrl, 2).then(() => {
                cy.getCompanyUrlAtIndex(sectionData, sectionName, siteUrl, -1)
            })
        })
    })
})

/**
 * Given a company's name, URL, the root URL of the site we're testing, and a JSON object, add the company's name, 
 * contact information, and the URL of its logo to the above JSON object.
 * As only the titles of each bit of data have a unique selector, we first capture the data's title, i.e. 'Name',
 * and then use .next() to get the actual data, i.e. "Company A".
 * We use .replace() to remove complex whitespace characters "\t" and "\n" from data before assigning it to a JSON, as some
 * elements are nested in more tags than others, and as such will look like "\t\t\t\t\nData\t\t\t\t" instead of just
 * "Data" when we call .invoke('text).
 * @param {string} companyUrl - The URL from which to retrieve company data
 * @param {object} companyData - The JSON object to which we add company data
 * @param {string} siteUrl - The URL of the site we're testing, used to construct a full URL for the company logo
 * @param {string} companyName - The name of the company the data of which we're capturing
 */
Cypress.Commands.add('getSiteData', (companyUrl, companyData, siteUrl, companyName) => {
    cy.visit(companyUrl)
    companyData[companyName] = {}
    let companyDataTitle = ''
    cy.get('.gfdCompanyDetailsTitle').each($item => {
        cy.wrap($item)
            .invoke('text')
            .then(dataTitle => {
                companyDataTitle = dataTitle
            })
            .then(() => {
                cy.get($item)
                    .next()
                    .invoke('text')
                    .then(dataBody => {
                        companyData[companyName][companyDataTitle] = dataBody.replace(/\n?\t/g, '')
                    })
            })
    })
    cy.get('.img-responsive')
        .invoke('attr', 'src')
        .then(imageUrl => {
            companyData[companyName].Logo = `${siteUrl}${imageUrl}`
        })
})