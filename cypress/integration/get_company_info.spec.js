const siteUrl = 'https://www.medicines.org.uk'
let sectionList = {}
let companyList = {}

describe("Write all specified company info to JSON file, and download company logo images", () => {
    it('Get sections and company URLs', () => {
        // Go to site
        cy.visit(`${siteUrl}/emc/browse-companies`);
        // Accept cookies
        cy.get('#onetrust-accept-btn-handler').click();
        // Populate JSON object with section data (section name and URL)
        cy.getSectionData(sectionList, siteUrl).then(() => {
            for (let section in sectionList) {
                cy.getFirstThirdAndLastCompanyData(sectionList, section, siteUrl)
            }
        })
    })

    it("Get company data and write to JSON file", () => {
        let companyData = {}
        cy.visit(siteUrl)
        cy.get('#onetrust-accept-btn-handler')
            .click()
            .then(() => {
                for (let section in sectionList) {
                    for (let siteName in sectionList[section].contents) {
                        let companyUrl = `${sectionList[section].contents[siteName].url}`
                        cy.getSiteInfo(companyUrl, companyInfo, siteUrl, siteName)
                    }
                }
            }).then(() => {
                companyList = companyData
                cy.writeFile('cypress/fixtures/companyList.json', companyData)
            })
    })

    it("Get company logo images and save to cypress/Downloads folder", () => {
        const siteUrl = 'https://www.medicines.org.uk'
        cy.visit(siteUrl)
        cy.get('#onetrust-accept-btn-handler')
            .click()
            .then(() => {
                for (let company in companyList) {
                    let logoUrl = companyList[company].Logo
                    cy.log(logoName)
                    cy.downloadFile(logoUrl, 'Downloads', `${company}.jpg`)
                }
            })
    })
})




