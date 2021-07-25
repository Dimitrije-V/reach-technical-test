// This will run before our tests, and provide us with a JSON file containing the name and URL of each company listed
// on the site.

let siteUrl = 'https://www.medicines.org.uk'

// Build initial data set containing sections, their URLs, and empty content {} objects
// Iterate through sections, fill content objects with company names and URLs
// Write to JSON file
describe('Generate JSON file containing list of sections, their enclosed companies, and all company info', () => {
    it('Get section and company data', () => {
        let sectionList = {}
        // Go to site
        cy.visit(`${siteUrl}/emc/browse-companies`);
        // Accept cookies
        cy.get('#onetrust-accept-btn-handler').click();
        // Populate JSON object with section data (section name and URL)
        getSectionData(sectionList).then(() => {
            for (let section in sectionList) {
                getFirstThirdAndLastCompanyData(sectionList, section).then(() => {
                    cy.log(JSON.stringify(sectionList))
                })
            }
        }).then(()=> {
            cy.writeFile('cypress/fixtures/sectionList.json', sectionList)
        })
    })
})

/**
 * Generate data structure containing names of each section, their URL, and an empty "content" object.
 * @property {object} sectionList - The JSON object to which we write the above information.
*/
const getSectionData = (sectionList) =>
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
                            sectionList[sectionName].url = href
                            sectionList[sectionName].contents = {}
                        })
                })
        })

/**
 * Get details of company on a section, based on a specified position/index. Add this company's info to the specified 
 * JSON object. This function will be used to get the first, third, and last company's details, presenting us with an issue.
 * Namely, the problem here is that a section may have less than 3 elements, causing the check for the third to fail. 
 * Cypress is built around avoiding flaky tests, and as such does not support conditional testing, so we need to first check
 * the element exists with cy.find as a workaround. This is bad practice, and another solution should be found.
 * See https://docs.cypress.io/guides/core-concepts/conditional-testing#The-DOM-is-unstable for more info.
 * @property {object} sectionList - the JSON object from which we find the specified section's url; to which we add company info
 * @property {string} sectionName - the name of the section we want to search for company names
 * @property {number} elementIndex - the index at which to search for a company
*/
const getCompanyDataAtIndex = (sectionList, sectionName, elementIndex) =>
    cy.get('body').then($body => {
        if ($body.find((`.ieleft > ul > :nth-child(2) > .key`)).length > 0 || elementIndex!=2) {
            cy.get('.main-home > div > ul > li > a')
                .eq(elementIndex)
                .then($item => {
                    cy.wrap($item)
                        .invoke('text')
                        .then(companyName => {
                            sectionList[sectionName].contents[companyName] = {}
                        })
                        .then(companyName => {
                            cy.wrap($item)
                                .invoke('attr', 'href')
                                .then(href => {
                                    sectionList[sectionName].contents[companyName].url = href
                                })
                        })
                })
        }
    })


/**
 * Use the function getCompanyDataAtIndex to get first, third and last company info.
 * @property {object} sectionList - The object from which we find the specified section's url; to which we add company info
 * @property {string} sectionName - The name of the section we want to search for company names
*/
const getFirstThirdAndLastCompanyData = (sectionList, sectionName) =>
    cy.visit(`${siteUrl}${sectionList[sectionName].url}`).then(() => {
        getCompanyDataAtIndex(sectionList, sectionName, 0).then(() => {
            getCompanyDataAtIndex(sectionList, sectionName, 2).then(() => {
                getCompanyDataAtIndex(sectionList, sectionName, -1)
            })
        })
    })



