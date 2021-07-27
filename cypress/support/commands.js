require('cypress-downloadfile/lib/downloadFileCommand')
/**
 * Generate data structure containing names of each section, their URL, and an empty "content" object.
 * @property {object} sectionList - The JSON object to which we write the above information.
 * @property {string} siteUrl - 
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
Cypress.Commands.add('getCompanyDataAtIndex', (sectionList, sectionName, siteUrl, elementIndex) => {
    cy.get('body').then($body => {
        if ($body.find((`.ieleft > ul > :nth-child(2) > .key`)).length > 0 || elementIndex != 2) {
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
                                    sectionList[sectionName].contents[companyName].url = `${siteUrl}${href}`
                                })
                        })
                })
        }
    })
})

/**
 * Use the function getCompanyDataAtIndex to get first, third and last company info.
 * @property {object} sectionList - The object from which we find the specified section's url; to which we add company info
 * @property {string} sectionName - The name of the section we want to search for company names
*/
Cypress.Commands.add('getFirstThirdAndLastCompanyData', (sectionList, sectionName, siteUrl) => {
    cy.visit(sectionList[sectionName].url).then(() => {
        cy.getCompanyDataAtIndex(sectionList, sectionName, siteUrl, 0).then(() => {
            cy.getCompanyDataAtIndex(sectionList, sectionName, siteUrl, 2).then(() => {
                cy.getCompanyDataAtIndex(sectionList, sectionName, siteUrl, -1)
            })
        })
    })
})

// Use push instead of accessing to reduce runtime
Cypress.Commands.add('getSiteInfo', (companyUrl, companyInfo, siteUrl, siteName) => {
    cy.visit(companyUrl)
    companyInfo[siteName] = {}
    let companyInfoTitle = ""
    cy.get('.gfdCompanyDetailsTitle').each($item => {
        cy.wrap($item)
            .invoke('text')
            .then(informationTitle => {
                companyInfoTitle = informationTitle
            })
            .then(() => {
                cy.get($item)
                    .next()
                    .invoke('text')
                    .then(informationBody => {
                        companyInfo[siteName][companyInfoTitle] = informationBody.replace(/\n?\t/g, "")
                    })
            })
    })
    cy.get('.img-responsive')
        .invoke('attr', 'src')
        .then(imageUrl => {
            companyInfo[siteName].Logo = `${siteUrl}${imageUrl}`
        })
})