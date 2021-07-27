const siteUrl = 'https://www.medicines.org.uk'
let sectionList = {}
let companyList = {}

describe("Write all specified company info to JSON file, and download company logo images", () => {
    it('Get sections and company URLs', () => {
        cy.visit(`${siteUrl}/emc/browse-companies`);
        cy.acceptCookies()
        cy.getSectionData(sectionList, siteUrl).then(() => {
            for (let section in sectionList) {
                cy.getFirstThirdAndLastCompanyData(sectionList, section, siteUrl)
            }
        })
    })

    it("Get company data and write to JSON file", () => {
        let companyData = {}
        cy.visit(siteUrl)
        cy.acceptCookies()
            .then(() => {
                for (let section in sectionList) {
                    for (let siteName in sectionList[section].contents) {
                        let companyUrl = `${sectionList[section].contents[siteName].url}`
                        cy.getSiteInfo(companyUrl, companyData, siteUrl, siteName)
                    }
                }
            })
            .then(() => {
                companyList = companyData
                cy.writeFile('cypress/fixtures/companyList.json', companyData)
            })
    })

    it("Get company logo images and save to cypress/Downloads folder", () => {
        for (let company in companyList) {
            let logoUrl = companyList[company].Logo
            cy.downloadFile(logoUrl, 'Downloads', `${company}.jpg`)
        }
    })
})




